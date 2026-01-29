<?php
// app/Http/Requests/StoreUnitRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
       
        return true;
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        
        
        parent::failedValidation($validator);
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'nullable', // Add nullable so it doesn't fail when null
                'required_without:new_property',
                'integer',
                Rule::exists('property_info_without_insurance', 'id')
            ],
            // New property data (optional, but required if property_id is not provided)
            'new_property' => 'required_without:property_id|array',
            'new_property.city_id' => 'required_with:new_property|integer|exists:cities,id',
            'new_property.property_name' => 'required_with:new_property|string|max:255',
            
            'unit_name' => 'required|string|max:255|unique:units,unit_name',
            'tenants' => 'nullable|string|max:255',
            
            // New tenant data (optional)
            'new_tenant' => 'nullable|array',
            'new_tenant.first_name' => 'required_with:new_tenant|string|max:255',
            'new_tenant.last_name' => 'required_with:new_tenant|string|max:255',
            'new_tenant.street_address_line' => 'nullable|string|max:255',
            'new_tenant.login_email' => 'nullable|email|max:255',
            'new_tenant.alternate_email' => 'nullable|email|max:255',
            'new_tenant.mobile' => 'nullable|string|max:20',
            'new_tenant.emergency_phone' => 'nullable|string|max:20',
            'new_tenant.cash_or_check' => ['nullable', Rule::in(['Cash', 'Check', 'EFT'])],
            'new_tenant.has_insurance' => ['nullable', Rule::in(['Yes', 'No'])],
            'new_tenant.sensitive_communication' => ['nullable', Rule::in(['Yes', 'No'])],
            'new_tenant.has_assistance' => ['nullable', Rule::in(['Yes', 'No'])],
            'new_tenant.assistance_amount' => 'nullable|numeric|min:0|max:999999.99',
            'new_tenant.assistance_company' => 'nullable|string|max:255',
            
            'lease_start' => 'nullable|date',
            'lease_end' => 'nullable|date|after_or_equal:lease_start',
            'count_beds' => 'nullable|numeric|min:0|regex:/^\d+(\.\d{1})?$/',
            'count_baths' => 'nullable|numeric|min:0|regex:/^\d+(\.\d{1})?$/',
            'lease_status' => 'nullable|string|max:255',
            'is_new_lease' => ['nullable', Rule::in(['Yes', 'No'])],
            'monthly_rent' => 'nullable|numeric|min:0',
            'recurring_transaction' => 'nullable|string|max:255',
            'utility_status' => 'nullable|string|max:255',
            'account_number' => 'nullable|string|max:255',
            'insurance' => ['nullable', Rule::in(['Yes', 'No'])],
            // Require expiration date only when insurance is Yes; allow null otherwise
            'insurance_expiration_date' => 'nullable|date|required_if:insurance,Yes',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required_without' => 'Property is required when not creating a new property.',
            'property_id.exists' => 'The selected property is not valid. Please choose from available properties.',
            'new_property.required_without' => 'Please select an existing property or create a new one.',
            'new_property.city_id.required_with' => 'City is required when creating a new property.',
            'new_property.city_id.exists' => 'The selected city is not valid.',
            'new_property.property_name.required_with' => 'Property name is required when creating a new property.',
            'new_tenant.first_name.required_with' => 'First name is required when creating a new tenant.',
            'new_tenant.last_name.required_with' => 'Last name is required when creating a new tenant.',
            'new_tenant.login_email.email' => 'Login email must be a valid email address.',
            'new_tenant.alternate_email.email' => 'Alternate email must be a valid email address.',
            'unit_name.required' => 'Unit name is required.',
            'unit_name.unique' => 'Unit name already exists.',
            'lease_end.after_or_equal' => 'Lease end date must be after or equal to lease start date.',
            'count_beds.numeric' => 'Count beds must be a valid number.',
            'count_beds.regex' => 'Count beds must have at most 1 decimal place.',
            'count_baths.numeric' => 'Count baths must be a valid number.',
            'count_baths.regex' => 'Count baths must have at most 1 decimal place.',
            'monthly_rent.numeric' => 'Monthly rent must be a valid amount.',
            'is_new_lease.in' => 'Is new lease must be Yes or No.',
            'insurance_expiration_date.required_if' => 'Insurance expiration date is required when insurance is Yes.',
        ];
    }
}
