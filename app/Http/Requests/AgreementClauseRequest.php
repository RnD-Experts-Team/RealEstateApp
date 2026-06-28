<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgreementClauseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'agreement_type_id' => ['sometimes', 'integer', 'exists:agreement_types,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['nullable', 'string'],
            'kind' => ['nullable', 'in:standard,options'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
