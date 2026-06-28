<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OwnerSignRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Gated by the signed-URL middleware.
        return true;
    }

    public function rules(): array
    {
        return [
            'owner_name' => ['required', 'string', 'max:255'],
            'signature_data' => ['required', 'string'],
        ];
    }
}
