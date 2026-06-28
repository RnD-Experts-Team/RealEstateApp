<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WalkthroughFieldOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'walkthrough_field_id' => ['required', 'integer', 'exists:walkthrough_fields,id'],
            'label' => ['required', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer'],
        ];
    }
}
