<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubmitWalkthroughFormRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Access is gated by the signed-URL middleware, not by auth.
        return true;
    }

    public function rules(): array
    {
        return [
            'payload' => ['required', 'string'],
        ];
    }
}
