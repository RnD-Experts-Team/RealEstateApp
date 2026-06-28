<?php

namespace App\Services;

use App\Models\Agreement;
use App\Models\AgreementSnapshotClause;
use App\Models\AgreementSnapshotField;
use App\Models\AgreementType;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

class AgreementService
{
    /**
     * Create an agreement from a type, snapshotting its clauses + variables.
     */
    public function createFromType(AgreementType $type, string $reference): Agreement
    {
        $type->load(['clauses.options', 'variables']);

        return DB::transaction(function () use ($type, $reference) {
            $agreement = Agreement::create([
                'agreement_type_id' => $type->id,
                'token' => (string) Str::uuid(),
                'reference' => $reference,
                'type_name' => $type->name,
                'status' => 'draft',
            ]);

            foreach ($type->clauses as $clause) {
                AgreementSnapshotClause::create([
                    'agreement_id' => $agreement->id,
                    'title' => $clause->title,
                    'body' => $clause->body,
                    'kind' => $clause->kind,
                    'options' => $clause->kind === 'options'
                        ? $clause->options->map(fn ($o) => ['label' => $o->label, 'body' => $o->body])->values()->all()
                        : null,
                    'selected_option' => null,
                    'sort_order' => $clause->sort_order,
                ]);
            }

            foreach ($type->variables as $variable) {
                AgreementSnapshotField::create([
                    'agreement_id' => $agreement->id,
                    'key' => $variable->key,
                    'label' => $variable->label,
                    'input_type' => $variable->input_type,
                    'scope' => $variable->scope,
                    'value' => $variable->scope === 'per_type' ? $variable->value : null,
                    'required' => $variable->required,
                    'sort_order' => $variable->sort_order,
                ]);
            }

            return $agreement;
        });
    }

    /**
     * Save filled field values + per-clause option selections (locked once the owner has signed).
     */
    public function updateData(Agreement $agreement, array $fieldValues, array $selections): void
    {
        if ($agreement->owner_signed_at) {
            return;
        }

        foreach ($agreement->fields as $field) {
            if (array_key_exists($field->id, $fieldValues)) {
                $field->value = $fieldValues[$field->id];
                $field->save();
            }
        }

        foreach ($agreement->clauses as $clause) {
            if (array_key_exists($clause->id, $selections)) {
                $clause->selected_option = $selections[$clause->id] === null ? null : (int) $selections[$clause->id];
                $clause->save();
            }
        }
    }

    /**
     * Render ordered clauses with the chosen option body + tokens replaced.
     */
    public function render(Agreement $agreement): array
    {
        $agreement->loadMissing(['clauses', 'fields']);

        $map = [];
        foreach ($agreement->fields as $field) {
            $map[$field->key] = (string) ($field->value ?? '');
        }

        $out = [];
        foreach ($agreement->clauses as $clause) {
            $body = $clause->body ?? '';
            if ($clause->kind === 'options') {
                $options = $clause->options ?? [];
                $idx = $clause->selected_option;
                $body = ($idx !== null && isset($options[$idx])) ? ($options[$idx]['body'] ?? '') : '';
            }

            $out[] = [
                'title' => $clause->title,
                'html' => $this->replaceTokens($body, $map),
            ];
        }

        return $out;
    }

    private function replaceTokens(string $html, array $map): string
    {
        return preg_replace_callback('/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/', function ($m) use ($map) {
            $value = $map[$m[1]] ?? '';
            return nl2br(e($value));
        }, $html);
    }

    public function signedLink(Agreement $agreement): string
    {
        return URL::signedRoute('agreement.sign', ['agreement' => $agreement->token]);
    }

    public function ownerSign(Agreement $agreement, ?string $dataUrl, ?string $ownerName): void
    {
        if ($ownerName) {
            $agreement->owner_name = $ownerName;
        }
        if ($dataUrl) {
            $agreement->owner_signature_path = $this->storeSignature($agreement->owner_signature_path, $dataUrl);
        }
        $agreement->owner_signed_at = Carbon::now();
        $agreement->status = 'signed';
        $agreement->save();
    }

    public function agentSign(Agreement $agreement, ?string $dataUrl): void
    {
        if ($dataUrl) {
            $agreement->agent_signature_path = $this->storeSignature($agreement->agent_signature_path, $dataUrl);
            $agreement->agent_signed_at = Carbon::now();
            $agreement->save();
        }
    }

    public function pdfData(Agreement $agreement): array
    {
        return [
            'reference' => $agreement->reference,
            'type_name' => $agreement->type_name,
            'status' => $agreement->status,
            'clauses' => $this->render($agreement),
            'owner_name' => $agreement->owner_name,
            'owner_signed_at' => optional($agreement->owner_signed_at)->toDateString(),
            'agent_signed_at' => optional($agreement->agent_signed_at)->toDateString(),
            'owner_signature_data_uri' => $this->toDataUri($agreement->owner_signature_path),
            'agent_signature_data_uri' => $this->toDataUri($agreement->agent_signature_path),
        ];
    }

    private function storeSignature(?string $existingPath, string $dataUrl): ?string
    {
        if (! preg_match('/^data:image\/(\w+);base64,/', $dataUrl, $matches)) {
            return $existingPath;
        }

        $extension = $matches[1] === 'jpeg' ? 'jpg' : $matches[1];
        $encoded = substr($dataUrl, strpos($dataUrl, ',') + 1);
        $decoded = base64_decode(str_replace(' ', '+', $encoded));
        if ($decoded === false) {
            return $existingPath;
        }

        if ($existingPath && Storage::disk('public')->exists($existingPath)) {
            Storage::disk('public')->delete($existingPath);
        }

        $path = 'agreement_signatures/' . Str::uuid() . '.' . $extension;
        Storage::disk('public')->put($path, $decoded);

        return $path;
    }

    private function toDataUri(?string $path): ?string
    {
        if (! $path || ! Storage::disk('public')->exists($path)) {
            return null;
        }

        $mime = Storage::disk('public')->mimeType($path);

        return 'data:' . $mime . ';base64,' . base64_encode(Storage::disk('public')->get($path));
    }
}
