<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgreementClauseOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'agreement_clause_id' => ['sometimes', 'integer', 'exists:agreement_clauses,id'],
            'label' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
