<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectionSectionItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'inspection_section_id' => ['required', 'integer', 'exists:inspection_sections,id'],
            'name' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
