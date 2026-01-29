<?php
// app/Http/Requests/StoreTenantRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Unit;

class StoreTenantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => [
                'nullable',
                'integer',
                'exists:units,id',
                function ($attribute, $value, $fail) {
                    // Check if the unit is not archived
                    $unit = Unit::withArchived()->find($value);
                    if ($unit && $unit->is_archived) {
                        $fail('The selected unit is archived and cannot be assigned.');
                    }
                }
            ],
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'street_address_line' => 'nullable|string|max:255',
            'login_email' => 'nullable|email|max:255|unique:tenants,login_email',
            'alternate_email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:20',
            'emergency_phone' => 'nullable|string|max:20',
            'cash_or_check' => 'nullable|in:Cash,Check,EFT',
            'has_insurance' => 'nullable|in:Yes,No',
            'sensitive_communication' => 'nullable|in:Yes,No',
            'has_assistance' => 'nullable|in:Yes,No',
            'assistance_amount' => 'nullable|numeric|min:0|max:999999.99',
            'assistance_company' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.required' => 'Unit selection is required.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'first_name.required' => 'First name is required.',
            'last_name.required' => 'Last name is required.',
            'login_email.email' => 'Login email must be a valid email address.',
            'login_email.unique' => 'This login email is already taken.',
            'alternate_email.email' => 'Alternate email must be a valid email address.',
            'assistance_amount.max' => 'Assistance amount cannot exceed $999,999.99.',
        ];
    }
}
