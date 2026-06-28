<?php

namespace App\Services;

use App\Models\InspectionForm;
use App\Models\InspectionFormAttachment;
use App\Models\InspectionFormSection;
use App\Models\InspectionFormSectionItem;
use App\Models\InspectionSetting;
use App\Models\MoveIn;
use App\Models\MoveOut;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class InspectionFormService
{
    public function __construct(private InspectionConfigService $config)
    {
    }

    /**
     * Get (or lazily create) the single inspection form for a Move-In / Move-Out entry.
     */
    public function getOrCreateFor(string $type, int $referenceId): InspectionForm
    {
        $existing = InspectionForm::where('form_type', $type)
            ->where('reference_id', $referenceId)
            ->first();

        if ($existing) {
            return $existing;
        }

        [$tenantName, $propertyAddress] = $this->resolveContext($type, $referenceId);

        return InspectionForm::create([
            'form_type' => $type,
            'reference_id' => $referenceId,
            'token' => (string) Str::uuid(),
            'tenant_name' => $tenantName,
            'property_address' => $propertyAddress,
            'status' => 'pending',
            'signature_required' => InspectionSetting::current()->require_signature,
        ]);
    }

    /**
     * A permanent signed URL the tenant uses to open / re-edit the form.
     */
    public function signedLink(InspectionForm $form): string
    {
        return URL::signedRoute('inspection.fill', ['form' => $form->token]);
    }

    /**
     * Compact summary used by the Move-In / Move-Out link dialog.
     */
    public function linkPayload(InspectionForm $form): array
    {
        return [
            'id' => $form->id,
            'token' => $form->token,
            'status' => $form->status,
            'fill_url' => $this->signedLink($form),
            'show_url' => route('inspections.show', $form->token),
            'pdf_url' => route('inspections.pdf', $form->token),
            'submitted_at' => optional($form->submitted_at)->toDateTimeString(),
        ];
    }

    /**
     * Map existing forms for a set of Move-In / Move-Out ids => link payload.
     */
    public function mapForReferences(string $type, array $referenceIds): array
    {
        if (empty($referenceIds)) {
            return [];
        }

        return InspectionForm::where('form_type', $type)
            ->whereIn('reference_id', $referenceIds)
            ->get()
            ->mapWithKeys(fn (InspectionForm $form) => [$form->reference_id => $this->linkPayload($form)])
            ->toArray();
    }

    /**
     * Everything the tenant-facing page needs: a normalized structure (from live
     * config while pending, from the frozen snapshot once submitted) + settings.
     */
    public function buildFillPayload(InspectionForm $form): array
    {
        $settings = InspectionSetting::current();

        $sections = $form->status === 'submitted'
            ? $this->buildFromSnapshot($form)
            : $this->buildFromConfig();

        $form->load('attachments');
        $general = $this->formatAttachments($form->attachments->where('kind', 'general'));
        $video = $this->formatAttachments($form->attachments->where('kind', 'video'));

        return [
            'form' => [
                'token' => $form->token,
                'form_type' => $form->form_type,
                'tenant_name' => $form->tenant_name,
                'property_address' => $form->property_address,
                'status' => $form->status,
                'other_comments' => $form->other_comments,
                'acknowledged' => (bool) $form->acknowledged,
                'signature_url' => $form->signature_url,
                'submitted_at' => optional($form->submitted_at)->toDateTimeString(),
            ],
            'settings' => [
                'acknowledgment_text' => $settings->acknowledgment_text,
                'other_comments_label' => $settings->other_comments_label,
                'require_video' => $settings->require_video,
                'require_signature' => $settings->require_signature,
                'require_acknowledgment' => $settings->require_acknowledgment,
            ],
            'sections' => $sections,
            'general_attachments' => $general,
            'video_attachments' => $video,
            'submit_url' => URL::signedRoute('inspection.submit', ['form' => $form->token]),
        ];
    }

    /**
     * Build the normalized structure from the live (active) config template.
     */
    private function buildFromConfig(): array
    {
        $out = [];
        foreach ($this->config->listSections() as $section) {
            $items = $section->items->map(fn ($i) => ['name' => $i->name])->values()->all();

            if ($section->is_repeatable) {
                $out[] = [
                    'type' => 'repeatable',
                    'name' => $section->name,
                    'question' => $section->question,
                    'item_template' => $items,
                    'instances' => [],
                ];
            } else {
                $out[] = [
                    'type' => 'fixed',
                    'name' => $section->name,
                    'question' => $section->question,
                    'has_problems' => null,
                    'note' => '',
                    'attachments' => [],
                    'items' => array_map(fn ($i) => [
                        'name' => $i['name'],
                        'note' => '',
                        'attachments' => [],
                    ], $items),
                ];
            }
        }

        return $out;
    }

    /**
     * Build the normalized structure from a submitted form's frozen snapshot rows.
     * Repeatable template rows (instance_label = null) carry the item template;
     * instance rows (instance_label set) carry the tenant's answers.
     */
    private function buildFromSnapshot(InspectionForm $form): array
    {
        $form->load(['sections.items.attachments', 'sections.attachments']);
        $out = [];

        // Group repeatable instances under their section name via the template row.
        $repeatableGroups = [];

        foreach ($form->sections as $section) {
            if (! $section->is_repeatable) {
                $out[] = [
                    'type' => 'fixed',
                    'name' => $section->name,
                    'question' => $section->question,
                    'has_problems' => $section->has_problems,
                    'note' => $section->note ?? '',
                    'attachments' => $this->formatAttachments($section->attachments->where('kind', 'section')),
                    'items' => $section->items->map(fn ($i) => [
                        'name' => $i->name,
                        'note' => $i->note ?? '',
                        'attachments' => $this->formatAttachments($i->attachments),
                    ])->values()->all(),
                ];
                continue;
            }

            // Repeatable
            if (! isset($repeatableGroups[$section->name])) {
                $repeatableGroups[$section->name] = [
                    'type' => 'repeatable',
                    'name' => $section->name,
                    'question' => $section->question,
                    'item_template' => [],
                    'instances' => [],
                    '_order' => count($out),
                ];
                $out[] = null; // placeholder, replaced after the loop
                $repeatableGroups[$section->name]['_index'] = count($out) - 1;
            }

            if ($section->instance_label === null) {
                // Template row -> item names define the template
                $repeatableGroups[$section->name]['item_template'] = $section->items
                    ->map(fn ($i) => ['name' => $i->name])->values()->all();
            } else {
                $repeatableGroups[$section->name]['instances'][] = [
                    'instance_label' => $section->instance_label,
                    'has_problems' => $section->has_problems,
                    'note' => $section->note ?? '',
                    'attachments' => $this->formatAttachments($section->attachments->where('kind', 'section')),
                    'items' => $section->items->map(fn ($i) => [
                        'name' => $i->name,
                        'note' => $i->note ?? '',
                        'attachments' => $this->formatAttachments($i->attachments),
                    ])->values()->all(),
                ];
            }
        }

        // Place grouped repeatable sections back into their slots.
        foreach ($repeatableGroups as $group) {
            $index = $group['_index'];
            unset($group['_order'], $group['_index']);
            $out[$index] = $group;
        }

        return array_values(array_filter($out, fn ($s) => $s !== null));
    }

    private function formatAttachments($attachments): array
    {
        return collect($attachments)->map(fn (InspectionFormAttachment $a) => [
            'id' => $a->id,
            'file_name' => $a->file_name,
            'url' => $a->url,
            'file_path' => $a->file_path,
        ])->values()->all();
    }

    /**
     * Same as buildFillPayload but with image attachments + signature embedded as
     * base64 data URIs, so dompdf can render them without remote/file access.
     */
    public function pdfData(InspectionForm $form): array
    {
        $data = $this->buildFillPayload($form);

        $embed = function (array &$attachments) {
            foreach ($attachments as &$att) {
                $att['data_uri'] = $this->toDataUri($att['file_path'] ?? null);
            }
        };

        foreach ($data['sections'] as &$section) {
            if (isset($section['attachments'])) {
                $embed($section['attachments']);
            }
            foreach ($section['items'] ?? [] as &$item) {
                $embed($item['attachments']);
            }
            unset($item);
            foreach ($section['instances'] ?? [] as &$instance) {
                $embed($instance['attachments']);
                foreach ($instance['items'] ?? [] as &$instItem) {
                    $embed($instItem['attachments']);
                }
                unset($instItem);
            }
            unset($instance);
        }
        unset($section);

        $embed($data['general_attachments']);
        $embed($data['video_attachments']);
        $data['signature_data_uri'] = $form->signature_path ? $this->toDataUri($form->signature_path) : null;

        return $data;
    }

    private function toDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $mime = Storage::disk('public')->mimeType($path);
        if (! str_starts_with((string) $mime, 'image/')) {
            return null;
        }

        return 'data:' . $mime . ';base64,' . base64_encode(Storage::disk('public')->get($path));
    }

    /**
     * Persist a tenant submission: freeze a fresh snapshot, store files + signature,
     * keep previously-uploaded attachments the tenant did not remove, then sync the
     * linked Move-In / Move-Out record.
     */
    public function submit(InspectionForm $form, array $payload, array $files): InspectionForm
    {
        $settings = InspectionSetting::current();

        DB::transaction(function () use ($form, $payload, $files, $settings) {
            // 1) Detach every section/item attachment so wiping sections won't cascade-delete them.
            InspectionFormAttachment::where('inspection_form_id', $form->id)
                ->update(['inspection_form_section_id' => null, 'inspection_form_section_item_id' => null]);

            // 2) Delete attachments the tenant removed (not in any kept list).
            $keptIds = $this->collectKeptIds($payload);
            $toDelete = InspectionFormAttachment::where('inspection_form_id', $form->id)
                ->whereNotIn('id', $keptIds ?: [0])
                ->get();
            foreach ($toDelete as $att) {
                if (Storage::disk('public')->exists($att->file_path)) {
                    Storage::disk('public')->delete($att->file_path);
                }
                $att->delete();
            }

            // 3) Wipe old snapshot section rows (items cascade; attachments already detached).
            $form->sections()->delete();

            // 4) Recreate the snapshot from the submitted structure.
            $sortOrder = 0;
            foreach ($payload['sections'] ?? [] as $sectionData) {
                if (($sectionData['type'] ?? 'fixed') === 'repeatable') {
                    // Template row (preserves the item template for future re-edits).
                    $template = $this->createSectionRow($form, [
                        'name' => $sectionData['name'],
                        'question' => $sectionData['question'] ?? null,
                        'is_repeatable' => true,
                        'instance_label' => null,
                        'has_problems' => null,
                        'note' => null,
                        'sort_order' => $sortOrder,
                    ]);
                    foreach ($sectionData['item_template'] ?? [] as $tItem) {
                        $this->createItemRow($template, ['name' => $tItem['name'], 'note' => null]);
                    }

                    foreach ($sectionData['instances'] ?? [] as $iIndex => $instance) {
                        $instanceRow = $this->createSectionRow($form, [
                            'name' => $sectionData['name'],
                            'question' => $sectionData['question'] ?? null,
                            'is_repeatable' => true,
                            'instance_label' => $instance['instance_label'] ?? ($sectionData['name'] . ' ' . ($iIndex + 1)),
                            'has_problems' => $this->toBool($instance['has_problems'] ?? null),
                            'note' => $instance['note'] ?? null,
                            'sort_order' => $sortOrder,
                        ]);
                        $this->attachSectionFiles($form, $instanceRow, $instance, $files);
                        foreach ($instance['items'] ?? [] as $itemData) {
                            $itemRow = $this->createItemRow($instanceRow, [
                                'name' => $itemData['name'],
                                'note' => $itemData['note'] ?? null,
                            ]);
                            $this->attachItemFiles($form, $itemRow, $itemData, $files);
                        }
                    }
                } else {
                    $row = $this->createSectionRow($form, [
                        'name' => $sectionData['name'],
                        'question' => $sectionData['question'] ?? null,
                        'is_repeatable' => false,
                        'instance_label' => null,
                        'has_problems' => $this->toBool($sectionData['has_problems'] ?? null),
                        'note' => $sectionData['note'] ?? null,
                        'sort_order' => $sortOrder,
                    ]);
                    $this->attachSectionFiles($form, $row, $sectionData, $files);
                    foreach ($sectionData['items'] ?? [] as $itemData) {
                        $itemRow = $this->createItemRow($row, [
                            'name' => $itemData['name'],
                            'note' => $itemData['note'] ?? null,
                        ]);
                        $this->attachItemFiles($form, $itemRow, $itemData, $files);
                    }
                }
                $sortOrder++;
            }

            // 5) General + video attachments (form-level).
            $this->storeFormLevelFiles($form, $files, 'general', 'general');
            $this->storeFormLevelFiles($form, $files, 'video', 'video');

            // 6) Signature.
            if (! empty($payload['signature_data'])) {
                $this->storeSignature($form, $payload['signature_data']);
            }

            // 7) Form fields.
            $form->other_comments = $payload['other_comments'] ?? null;
            $form->acknowledged = $this->toBool($payload['acknowledged'] ?? false) ?? false;
            $form->acknowledgment_text = $settings->acknowledgment_text;
            $form->signature_required = $settings->require_signature;
            $form->status = 'submitted';
            $form->submitted_at = Carbon::now();
            $form->save();

            // 8) Reflect completion on the linked Move-In / Move-Out record.
            $this->syncLinkedRecord($form);
        });

        return $form->fresh();
    }

    private function collectKeptIds(array $payload): array
    {
        $ids = [];
        $pull = function ($node) use (&$ids) {
            foreach ($node['kept_attachment_ids'] ?? [] as $id) {
                $ids[] = (int) $id;
            }
        };

        foreach ($payload['sections'] ?? [] as $section) {
            $pull($section);
            foreach ($section['items'] ?? [] as $item) {
                $pull($item);
            }
            foreach ($section['instances'] ?? [] as $instance) {
                $pull($instance);
                foreach ($instance['items'] ?? [] as $item) {
                    $pull($item);
                }
            }
        }
        foreach (['general_kept_attachment_ids', 'video_kept_attachment_ids'] as $key) {
            foreach ($payload[$key] ?? [] as $id) {
                $ids[] = (int) $id;
            }
        }

        return array_values(array_unique($ids));
    }

    private function createSectionRow(InspectionForm $form, array $data): InspectionFormSection
    {
        return InspectionFormSection::create(array_merge(['inspection_form_id' => $form->id], $data));
    }

    private function createItemRow(InspectionFormSection $section, array $data): InspectionFormSectionItem
    {
        return InspectionFormSectionItem::create(array_merge(
            ['inspection_form_section_id' => $section->id],
            $data
        ));
    }

    private function attachSectionFiles(InspectionForm $form, InspectionFormSection $section, array $data, array $files): void
    {
        // Re-point kept attachments to this freshly-created section row.
        if (! empty($data['kept_attachment_ids'])) {
            InspectionFormAttachment::where('inspection_form_id', $form->id)
                ->whereIn('id', $data['kept_attachment_ids'])
                ->update([
                    'inspection_form_section_id' => $section->id,
                    'inspection_form_section_item_id' => null,
                    'kind' => 'section',
                ]);
        }

        foreach ($this->slotFiles($files, $data['new_attachment_slots'] ?? []) as $file) {
            $this->storeFile($form, $file, 'section', $section->id, null);
        }
    }

    private function attachItemFiles(InspectionForm $form, InspectionFormSectionItem $item, array $data, array $files): void
    {
        if (! empty($data['kept_attachment_ids'])) {
            InspectionFormAttachment::where('inspection_form_id', $form->id)
                ->whereIn('id', $data['kept_attachment_ids'])
                ->update([
                    'inspection_form_section_id' => $item->inspection_form_section_id,
                    'inspection_form_section_item_id' => $item->id,
                    'kind' => 'item',
                ]);
        }

        foreach ($this->slotFiles($files, $data['new_attachment_slots'] ?? []) as $file) {
            $this->storeFile($form, $file, 'item', $item->inspection_form_section_id, $item->id);
        }
    }

    private function storeFormLevelFiles(InspectionForm $form, array $files, string $slotPrefix, string $kind): void
    {
        $slots = [];
        foreach (array_keys($files) as $slotKey) {
            if ($slotKey === $slotPrefix || str_starts_with($slotKey, $slotPrefix . '_')) {
                $slots[] = $slotKey;
            }
        }

        foreach ($this->slotFiles($files, $slots) as $file) {
            $this->storeFile($form, $file, $kind, null, null);
        }
    }

    /**
     * Resolve a list of slot keys into a flat list of UploadedFile instances.
     */
    private function slotFiles(array $files, array $slots): array
    {
        $resolved = [];
        foreach ($slots as $slot) {
            $entry = $files[$slot] ?? null;
            if ($entry instanceof UploadedFile) {
                $resolved[] = $entry;
            } elseif (is_array($entry)) {
                foreach ($entry as $file) {
                    if ($file instanceof UploadedFile) {
                        $resolved[] = $file;
                    }
                }
            }
        }

        return $resolved;
    }

    private function storeFile(InspectionForm $form, UploadedFile $file, string $kind, ?int $sectionId, ?int $itemId): void
    {
        $path = $file->store('inspection_attachments', 'public');

        InspectionFormAttachment::create([
            'inspection_form_id' => $form->id,
            'inspection_form_section_id' => $sectionId,
            'inspection_form_section_item_id' => $itemId,
            'kind' => $kind,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
        ]);
    }

    private function storeSignature(InspectionForm $form, string $dataUrl): void
    {
        if (! preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
            return;
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $encoded = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decoded = base64_decode(str_replace(' ', '+', $encoded));
        if ($decoded === false) {
            return;
        }

        // Remove a previous signature file if present.
        if ($form->signature_path && Storage::disk('public')->exists($form->signature_path)) {
            Storage::disk('public')->delete($form->signature_path);
        }

        $path = 'inspection_signatures/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->put($path, $decoded);
        $form->signature_path = $path;
    }

    /**
     * Reset a submitted form: clear snapshot data + files, rotate the token,
     * set status back to pending. The old signed URL becomes invalid immediately.
     */
    public function reset(InspectionForm $form): InspectionForm
    {
        DB::transaction(function () use ($form) {
            // Delete all stored attachment files + records.
            foreach ($form->attachments()->get() as $att) {
                if (Storage::disk('public')->exists($att->file_path)) {
                    Storage::disk('public')->delete($att->file_path);
                }
                $att->delete();
            }

            // Wipe snapshot sections (items cascade via FK).
            $form->sections()->delete();

            // Delete the old signature file.
            if ($form->signature_path && Storage::disk('public')->exists($form->signature_path)) {
                Storage::disk('public')->delete($form->signature_path);
            }

            // Rotate token so the old signed URL returns 404.
            $form->token = (string) Str::uuid();
            $form->status = 'pending';
            $form->submitted_at = null;
            $form->acknowledged = false;
            $form->acknowledgment_text = null;
            $form->other_comments = null;
            $form->signature_path = null;
            $form->save();
        });

        return $form->fresh();
    }

    private function syncLinkedRecord(InspectionForm $form): void
    {
        if ($form->isMoveIn()) {
            $moveIn = MoveIn::withArchived()->find($form->reference_id);
            if ($moveIn) {
                $moveIn->filled_move_in_form = 'Yes';
                $moveIn->date_of_move_in_form_filled = Carbon::now()->toDateString();
                $moveIn->saveQuietly();
            }
        } else {
            $moveOut = MoveOut::withArchived()->find($form->reference_id);
            if ($moveOut) {
                $moveOut->move_out_form = 'filled';
                $moveOut->saveQuietly();
            }
        }
    }

    private function resolveContext(string $type, int $referenceId): array
    {
        if ($type === 'move_in') {
            $entry = MoveIn::withArchived()->with('unit.property.city')->find($referenceId);
            $tenantName = $entry?->tenant_name;
        } else {
            $entry = MoveOut::withArchived()->with('unit.property.city')->find($referenceId);
            $tenantName = $entry?->tenants;
        }

        $address = null;
        if ($entry && $entry->unit) {
            $unit = $entry->unit;
            $parts = array_filter([
                $unit->property?->property_name,
                $unit->unit_name ? 'Unit ' . $unit->unit_name : null,
                $unit->property?->city?->city,
            ]);
            $address = implode(', ', $parts);
        }

        return [$tenantName, $address];
    }

    private function toBool($value): ?bool
    {
        if ($value === null || $value === '') {
            return null;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
