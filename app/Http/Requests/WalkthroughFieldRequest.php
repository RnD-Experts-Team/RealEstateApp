<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalkthroughFieldRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'form_kind' => ['required', 'in:walkthrough,safety_inspection'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:attachments,yes_no,multi_choice,long_text'],
            'is_repeatable' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer'],
            'options' => ['nullable', 'array'],
            'options.*' => ['nullable', 'string', 'max:255'],
        ];
    }
}
