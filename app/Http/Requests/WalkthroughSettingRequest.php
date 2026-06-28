<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalkthroughSettingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'form_kind' => ['required', 'in:walkthrough,safety_inspection'],
            'require_signature' => ['nullable', 'boolean'],
        ];
    }
}
