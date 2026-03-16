<?php
// app/Http/Requests/UpdateUnitRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUnitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_id' => [
                'required',
                'integer',
                Rule::exists('property_info_without_insurance', 'id')
            ],
            'unit_name' => [
                'required',
                'string',
                'max:255',
                // Unique within the same property, excluding the current unit
                Rule::unique('units', 'unit_name')
                    ->where('property_id', (int) $this->property_id)
                    ->ignore($this->route('unit')),
            ],
            'tenants' => 'nullable|string|max:255',
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
            'property_id.required' => 'Property is required.',
            'property_id.exists' => 'The selected property is not valid. Please choose from available properties.',
            'unit_name.required' => 'Unit name is required.',
            'unit_name.unique' => 'A unit with this name already exists in the selected property.',
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
