<?php

namespace App\Services;

use App\Models\MoveOut;
use App\Models\Representative;
use App\Models\Unit;
use App\Models\WalkthroughForm;
use App\Models\WalkthroughFormAttachment;
use App\Models\WalkthroughFormField;
use App\Models\WalkthroughSetting;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class WalkthroughFormService
{
    public function __construct(private WalkthroughConfigService $config)
    {
    }

    /**
     * Representatives for selection (active + currently-assigned deleted ones).
     */
    public function representativeOptions(): array
    {
        return Representative::withTrashed()->orderBy('name')->get(['id', 'name', 'deleted_at'])->toArray();
    }

    /**
     * One walkthrough per Move-Out. Optionally (re)assign the representative.
     */
    public function getOrCreateForMoveOut(int $moveOutId, ?int $repId): WalkthroughForm
    {
        $form = WalkthroughForm::where('form_kind', 'walkthrough')
            ->where('context_type', 'move_out')
            ->where('reference_id', $moveOutId)
            ->first();

        [$repName, $address] = $this->resolveContext('move_out', $moveOutId, $repId);

        if ($form) {
            if ($repId !== null) {
                $form->representative_id = $repId;
                $form->representative_name = $repName;
                $form->save();
            }

            return $form;
        }

        return WalkthroughForm::create([
            'form_kind' => 'walkthrough',
            'context_type' => 'move_out',
            'reference_id' => $moveOutId,
            'token' => (string) Str::uuid(),
            'representative_id' => $repId,
            'representative_name' => $repName,
            'property_address' => $address,
            'status' => 'pending',
            'signature_required' => WalkthroughSetting::forKind('walkthrough')->require_signature,
        ]);
    }

    /**
     * A new standalone safety inspection for a unit (many allowed).
     */
    public function createForUnit(int $unitId, ?int $repId): WalkthroughForm
    {
        [$repName, $address] = $this->resolveContext('unit', $unitId, $repId);

        return WalkthroughForm::create([
            'form_kind' => 'safety_inspection',
            'context_type' => 'unit',
            'reference_id' => $unitId,
            'token' => (string) Str::uuid(),
            'representative_id' => $repId,
            'representative_name' => $repName,
            'property_address' => $address,
            'status' => 'pending',
            'signature_required' => WalkthroughSetting::forKind('safety_inspection')->require_signature,
        ]);
    }

    public function signedLink(WalkthroughForm $form): string
    {
        return URL::signedRoute('walkthrough.fill', ['form' => $form->token]);
    }

    public function linkPayload(WalkthroughForm $form): array
    {
        return [
            'id' => $form->id,
            'token' => $form->token,
            'status' => $form->status,
            'representative_name' => $form->representative_name,
            'fill_url' => $this->signedLink($form),
            'show_url' => route('walkthroughs.show', $form->token),
            'pdf_url' => route('walkthroughs.pdf', $form->token),
            'submitted_at' => optional($form->submitted_at)->toDateTimeString(),
        ];
    }

    public function mapForReferences(string $context, array $referenceIds, string $kind = 'walkthrough'): array
    {
        if (empty($referenceIds)) {
            return [];
        }

        return WalkthroughForm::where('form_kind', $kind)
            ->where('context_type', $context)
            ->whereIn('reference_id', $referenceIds)
            ->get()
            ->mapWithKeys(fn (WalkthroughForm $f) => [$f->reference_id => $this->linkPayload($f)])
            ->toArray();
    }

    public function buildFillPayload(WalkthroughForm $form): array
    {
        $settings = WalkthroughSetting::forKind($form->form_kind);

        $fields = $form->status === 'submitted'
            ? $this->buildFromSnapshot($form)
            : $this->buildFromConfig($form->form_kind);

        return [
            'form' => [
                'token' => $form->token,
                'form_kind' => $form->form_kind,
                'context_type' => $form->context_type,
                'representative_name' => $form->representative_name,
                'property_address' => $form->property_address,
                'status' => $form->status,
                'signature_url' => $form->signature_url,
                'submitted_at' => optional($form->submitted_at)->toDateTimeString(),
            ],
            'settings' => [
                'require_signature' => $settings->require_signature,
            ],
            'fields' => $fields,
            'submit_url' => URL::signedRoute('walkthrough.submit', ['form' => $form->token]),
        ];
    }

    private function buildFromConfig(string $kind): array
    {
        $out = [];
        foreach ($this->config->listFields($kind) as $field) {
            $options = $field->options->pluck('label')->values()->all();
            if ($field->is_repeatable) {
                $out[] = [
                    'type' => 'repeatable_group',
                    'title' => $field->title,
                    'is_repeatable' => true,
                    'inner_type' => $field->type,
                    'options' => $options,
                    'instances' => [],
                ];
            } else {
                $out[] = [
                    'type' => $field->type,
                    'title' => $field->title,
                    'is_repeatable' => false,
                    'value_bool' => null,
                    'value_text' => '',
                    'value_options' => [],
                    'options' => $options,
                    'attachments' => [],
                ];
            }
        }

        return $out;
    }

    private function buildFromSnapshot(WalkthroughForm $form): array
    {
        $form->load(['fields.attachments']);
        $out = [];
        $groups = [];

        foreach ($form->fields as $row) {
            if (! $row->is_repeatable) {
                $out[] = [
                    'type' => $row->type,
                    'title' => $row->title,
                    'is_repeatable' => false,
                    'value_bool' => $row->value_bool,
                    'value_text' => $row->value_text ?? '',
                    'value_options' => $row->value_options ?? [],
                    'options' => $row->options_snapshot ?? [],
                    'attachments' => $this->formatAttachments($row->attachments),
                ];
                continue;
            }

            if (! isset($groups[$row->title])) {
                $groups[$row->title] = ['index' => count($out)];
                $out[] = [
                    'type' => 'repeatable_group',
                    'title' => $row->title,
                    'is_repeatable' => true,
                    'inner_type' => $row->type,
                    'options' => $row->options_snapshot ?? [],
                    'instances' => [],
                ];
            }

            if ($row->instance_label === null) {
                // Template row carries inner_type + options.
                $out[$groups[$row->title]['index']]['inner_type'] = $row->type;
                $out[$groups[$row->title]['index']]['options'] = $row->options_snapshot ?? [];
            } else {
                $out[$groups[$row->title]['index']]['instances'][] = [
                    'instance_label' => $row->instance_label,
                    'value_bool' => $row->value_bool,
                    'value_text' => $row->value_text ?? '',
                    'value_options' => $row->value_options ?? [],
                    'attachments' => $this->formatAttachments($row->attachments),
                ];
            }
        }

        return $out;
    }

    private function formatAttachments($attachments): array
    {
        return collect($attachments)->map(fn (WalkthroughFormAttachment $a) => [
            'id' => $a->id,
            'file_name' => $a->file_name,
            'url' => $a->url,
            'file_path' => $a->file_path,
        ])->values()->all();
    }

    /**
     * Persist a submission: freeze a fresh snapshot of fields + values, store files +
     * signature, keep previously-uploaded attachments the filler did not remove.
     */
    public function submit(WalkthroughForm $form, array $payload, array $files): WalkthroughForm
    {
        $settings = WalkthroughSetting::forKind($form->form_kind);

        DB::transaction(function () use ($form, $payload, $files, $settings) {
            WalkthroughFormAttachment::where('walkthrough_form_id', $form->id)
                ->update(['walkthrough_form_field_id' => null]);

            $keptIds = $this->collectKeptIds($payload);
            $toDelete = WalkthroughFormAttachment::where('walkthrough_form_id', $form->id)
                ->whereNotIn('id', $keptIds ?: [0])->get();
            foreach ($toDelete as $att) {
                if (Storage::disk('public')->exists($att->file_path)) {
                    Storage::disk('public')->delete($att->file_path);
                }
                $att->delete();
            }

            $form->fields()->delete();

            $sort = 0;
            foreach ($payload['fields'] ?? [] as $fi => $fieldData) {
                if (($fieldData['type'] ?? '') === 'repeatable_group') {
                    $innerType = $fieldData['inner_type'] ?? 'long_text';
                    // Template row preserves inner type + options for re-edits.
                    $this->createFieldRow($form, [
                        'title' => $fieldData['title'],
                        'type' => $innerType,
                        'is_repeatable' => true,
                        'instance_label' => null,
                        'options_snapshot' => $fieldData['options'] ?? [],
                        'sort_order' => $sort,
                    ]);

                    foreach ($fieldData['instances'] ?? [] as $ii => $instance) {
                        $row = $this->createFieldRow($form, [
                            'title' => $fieldData['title'],
                            'type' => $innerType,
                            'is_repeatable' => true,
                            'instance_label' => $instance['instance_label'] ?? ($fieldData['title'] . ' ' . ($ii + 1)),
                            'options_snapshot' => $fieldData['options'] ?? [],
                            'value_bool' => $this->boolOrNull($instance['value_bool'] ?? null),
                            'value_text' => $instance['value_text'] ?? null,
                            'value_options' => $instance['value_options'] ?? [],
                            'sort_order' => $sort,
                        ]);
                        $this->attachFiles($form, $row, $instance, $files, "f{$fi}_i{$ii}");
                    }
                } else {
                    $row = $this->createFieldRow($form, [
                        'title' => $fieldData['title'],
                        'type' => $fieldData['type'],
                        'is_repeatable' => false,
                        'instance_label' => null,
                        'options_snapshot' => $fieldData['options'] ?? [],
                        'value_bool' => $this->boolOrNull($fieldData['value_bool'] ?? null),
                        'value_text' => $fieldData['value_text'] ?? null,
                        'value_options' => $fieldData['value_options'] ?? [],
                        'sort_order' => $sort,
                    ]);
                    $this->attachFiles($form, $row, $fieldData, $files, "f{$fi}");
                }
                $sort++;
            }

            if (! empty($payload['signature_data'])) {
                $this->storeSignature($form, $payload['signature_data']);
            }

            $form->status = 'submitted';
            $form->submitted_at = Carbon::now();
            $form->signature_required = $settings->require_signature;
            $form->save();
        });

        return $form->fresh();
    }

    /**
     * Reset a submitted form: clear snapshot fields + files, rotate the token,
     * set status back to pending. The old signed URL becomes invalid immediately.
     */
    public function reset(WalkthroughForm $form): WalkthroughForm
    {
        DB::transaction(function () use ($form) {
            foreach ($form->attachments()->get() as $att) {
                if (Storage::disk('public')->exists($att->file_path)) {
                    Storage::disk('public')->delete($att->file_path);
                }
                $att->delete();
            }

            $form->fields()->delete();

            if ($form->signature_path && Storage::disk('public')->exists($form->signature_path)) {
                Storage::disk('public')->delete($form->signature_path);
            }

            $form->token = (string) Str::uuid();
            $form->status = 'pending';
            $form->submitted_at = null;
            $form->signature_path = null;
            $form->save();
        });

        return $form->fresh();
    }

    private function collectKeptIds(array $payload): array
    {
        $ids = [];
        foreach ($payload['fields'] ?? [] as $field) {
            foreach ($field['kept_attachment_ids'] ?? [] as $id) {
                $ids[] = (int) $id;
            }
            foreach ($field['instances'] ?? [] as $instance) {
                foreach ($instance['kept_attachment_ids'] ?? [] as $id) {
                    $ids[] = (int) $id;
                }
            }
        }

        return array_values(array_unique($ids));
    }

    private function createFieldRow(WalkthroughForm $form, array $data): WalkthroughFormField
    {
        return WalkthroughFormField::create(array_merge(['walkthrough_form_id' => $form->id], $data));
    }

    private function attachFiles(WalkthroughForm $form, WalkthroughFormField $field, array $data, array $files, string $slot): void
    {
        if (! empty($data['kept_attachment_ids'])) {
            WalkthroughFormAttachment::where('walkthrough_form_id', $form->id)
                ->whereIn('id', $data['kept_attachment_ids'])
                ->update(['walkthrough_form_field_id' => $field->id]);
        }

        $entry = $files[$slot] ?? null;
        $uploaded = $entry instanceof UploadedFile ? [$entry] : (is_array($entry) ? $entry : []);
        foreach ($uploaded as $file) {
            if ($file instanceof UploadedFile) {
                $path = $file->store('walkthrough_attachments', 'public');
                WalkthroughFormAttachment::create([
                    'walkthrough_form_id' => $form->id,
                    'walkthrough_form_field_id' => $field->id,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                ]);
            }
        }
    }

    private function storeSignature(WalkthroughForm $form, string $dataUrl): void
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

        if ($form->signature_path && Storage::disk('public')->exists($form->signature_path)) {
            Storage::disk('public')->delete($form->signature_path);
        }

        $path = 'walkthrough_signatures/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->put($path, $decoded);
        $form->signature_path = $path;
    }

    /**
     * Same as buildFillPayload but with image attachments + signature as base64 data URIs for the PDF.
     */
    public function pdfData(WalkthroughForm $form): array
    {
        $data = $this->buildFillPayload($form);

        $embed = function (array &$attachments) {
            foreach ($attachments as &$att) {
                $att['data_uri'] = $this->toDataUri($att['file_path'] ?? null);
            }
        };

        foreach ($data['fields'] as &$field) {
            if (isset($field['attachments'])) {
                $embed($field['attachments']);
            }
            foreach ($field['instances'] ?? [] as &$instance) {
                if (isset($instance['attachments'])) {
                    $embed($instance['attachments']);
                }
            }
            unset($instance);
        }
        unset($field);

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

    private function resolveContext(string $context, int $referenceId, ?int $repId): array
    {
        if ($context === 'move_out') {
            $entry = MoveOut::withArchived()->with('unit.property.city')->find($referenceId);
            $unit = $entry?->unit;
        } else {
            $unit = Unit::withArchived()->with('property.city')->find($referenceId);
        }

        $address = null;
        if ($unit) {
            $parts = array_filter([
                $unit->property?->property_name,
                $unit->unit_name ? 'Unit ' . $unit->unit_name : null,
                $unit->property?->city?->city,
            ]);
            $address = implode(', ', $parts);
        }

        $repName = null;
        if ($repId !== null) {
            $repName = optional(Representative::withTrashed()->find($repId))->name;
        }

        return [$repName, $address];
    }

    private function boolOrNull($value): ?bool
    {
        if ($value === null || $value === '') {
            return null;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
