<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectionSectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'question' => ['nullable', 'string', 'max:1000'],
            'is_repeatable' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
