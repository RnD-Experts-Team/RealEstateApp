<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'agreement_type_id' => ['required', 'integer', 'exists:agreement_types,id'],
            'reference' => ['nullable', 'string', 'max:255'],
        ];
    }
}
