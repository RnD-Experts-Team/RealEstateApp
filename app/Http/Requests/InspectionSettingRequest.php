<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class InspectionSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'acknowledgment_text' => ['nullable', 'string', 'max:2000'],
            'other_comments_label' => ['nullable', 'string', 'max:255'],
            'require_video' => ['nullable', 'boolean'],
            'require_signature' => ['nullable', 'boolean'],
            'require_acknowledgment' => ['nullable', 'boolean'],
        ];
    }
}
