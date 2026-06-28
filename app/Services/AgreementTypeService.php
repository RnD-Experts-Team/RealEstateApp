<?php

namespace App\Services;

use App\Models\AgreementClause;
use App\Models\AgreementClauseOption;
use App\Models\AgreementType;
use App\Models\AgreementVariable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class AgreementTypeService
{
    public function listTypes(): Collection
    {
        return AgreementType::withCount('clauses')->orderBy('name')->get();
    }

    public function getForEdit(AgreementType $type): AgreementType
    {
        return $type->load(['clauses.options', 'variables']);
    }

    public function createType(array $data): AgreementType
    {
        return AgreementType::create(['name' => $data['name']]);
    }

    public function updateType(AgreementType $type, array $data): AgreementType
    {
        $type->update(['name' => $data['name'] ?? $type->name]);
        return $type;
    }

    public function archiveType(AgreementType $type): void
    {
        $type->clauses()->each(function (AgreementClause $clause) {
            $clause->options()->update(['is_archived' => true]);
            $clause->archive();
        });
        $type->variables()->update(['is_archived' => true]);
        $type->archive();
    }

    public function createClause(AgreementType $type, array $data): AgreementClause
    {
        return AgreementClause::create([
            'agreement_type_id' => $type->id,
            'title' => $data['title'],
            'body' => $data['body'] ?? null,
            'kind' => $data['kind'] ?? 'standard',
            'sort_order' => $data['sort_order'] ?? ((int) $type->clauses()->max('sort_order') + 1),
        ]);
    }

    public function updateClause(AgreementClause $clause, array $data): AgreementClause
    {
        $clause->fill([
            'title' => $data['title'] ?? $clause->title,
            'body' => array_key_exists('body', $data) ? $data['body'] : $clause->body,
            'kind' => $data['kind'] ?? $clause->kind,
            'sort_order' => $data['sort_order'] ?? $clause->sort_order,
        ]);
        $clause->save();
        return $clause;
    }

    public function archiveClause(AgreementClause $clause): void
    {
        $clause->options()->update(['is_archived' => true]);
        $clause->archive();
    }

    public function createOption(AgreementClause $clause, array $data): AgreementClauseOption
    {
        return AgreementClauseOption::create([
            'agreement_clause_id' => $clause->id,
            'label' => $data['label'],
            'body' => $data['body'] ?? null,
            'sort_order' => $data['sort_order'] ?? ((int) $clause->options()->max('sort_order') + 1),
        ]);
    }

    public function updateOption(AgreementClauseOption $option, array $data): AgreementClauseOption
    {
        $option->fill([
            'label' => $data['label'] ?? $option->label,
            'body' => array_key_exists('body', $data) ? $data['body'] : $option->body,
            'sort_order' => $data['sort_order'] ?? $option->sort_order,
        ]);
        $option->save();
        return $option;
    }

    public function archiveOption(AgreementClauseOption $option): void
    {
        $option->archive();
    }

    public function createVariable(AgreementType $type, array $data): AgreementVariable
    {
        return AgreementVariable::create([
            'agreement_type_id' => $type->id,
            'key' => $this->normalizeKey($data['key']),
            'label' => $data['label'],
            'input_type' => $data['input_type'] ?? 'text',
            'scope' => $data['scope'] ?? 'per_agreement',
            'value' => $data['scope'] === 'per_type' ? ($data['value'] ?? null) : null,
            'required' => $data['required'] ?? false,
            'sort_order' => $data['sort_order'] ?? ((int) $type->variables()->max('sort_order') + 1),
        ]);
    }

    public function updateVariable(AgreementVariable $variable, array $data): AgreementVariable
    {
        $scope = $data['scope'] ?? $variable->scope;
        $variable->fill([
            'key' => isset($data['key']) ? $this->normalizeKey($data['key']) : $variable->key,
            'label' => $data['label'] ?? $variable->label,
            'input_type' => $data['input_type'] ?? $variable->input_type,
            'scope' => $scope,
            'value' => $scope === 'per_type' ? ($data['value'] ?? $variable->value) : null,
            'required' => $data['required'] ?? $variable->required,
            'sort_order' => $data['sort_order'] ?? $variable->sort_order,
        ]);
        $variable->save();
        return $variable;
    }

    public function archiveVariable(AgreementVariable $variable): void
    {
        $variable->archive();
    }

    private function normalizeKey(string $key): string
    {
        return Str::of($key)->lower()->replaceMatches('/[^a-z0-9]+/', '_')->trim('_')->value();
    }
}
