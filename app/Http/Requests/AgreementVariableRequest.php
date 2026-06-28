<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AgreementVariableRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'agreement_type_id' => ['sometimes', 'integer', 'exists:agreement_types,id'],
            'key' => ['required', 'string', 'max:255'],
            'label' => ['required', 'string', 'max:255'],
            'input_type' => ['required', 'in:text,long_text,date,number'],
            'scope' => ['required', 'in:per_type,per_agreement'],
            'value' => ['nullable', 'string'],
            'required' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
