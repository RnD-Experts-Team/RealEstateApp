<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgreementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'reference' => ['nullable', 'string', 'max:255'],
            'fields' => ['nullable', 'array'],
            'selections' => ['nullable', 'array'],
        ];
    }
}
