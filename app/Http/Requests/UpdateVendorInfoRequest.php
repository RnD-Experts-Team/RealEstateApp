<?php
// app/Http/Requests/UpdateVendorInfoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVendorInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'city_id' => [
                'required',
                'integer',
                Rule::exists('cities', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                })
            ],
            'vendor_name' => 'required|string|max:255',
            'vendor_type' => 'nullable|in:main,potential',
            'number' => 'nullable|array',
            'number.*' => 'nullable|string|max:255',
            'email' => 'nullable|array',
            'email.*' => 'nullable|email|max:255',
            'service_type' => 'nullable|array',
            'service_type.*' => 'nullable',
        ];
    }

    public function messages(): array
    {
        return [
            'city_id.required' => 'City is required.',
            'city_id.integer' => 'City must be a valid selection.',
            'city_id.exists' => 'The selected city is not valid. Please choose from available cities.',
            'vendor_name.required' => 'Vendor name is required.',
            'vendor_name.max' => 'Vendor name cannot exceed 255 characters.',
            'vendor_type.in' => 'Vendor type must be either main or potential.',
            'number.array' => 'Numbers must be an array.',
            'number.*.string' => 'Each number must be a string.',
            'number.*.max' => 'Each number cannot exceed 255 characters.',
            'email.array' => 'Emails must be an array.',
            'email.*.email' => 'Each email must be a valid email address.',
            'email.*.max' => 'Each email cannot exceed 255 characters.',
            'service_type.array' => 'Service types must be an array.',
        ];
    }
}
