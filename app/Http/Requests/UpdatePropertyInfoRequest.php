<?php
// app/Http/Requests/UpdatePropertyInfoRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePropertyInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $propertyInfoId = $this->route('properties_info') ?? $this->route('id');

        return [
            'property_id' => 'required|integer|exists:property_info_without_insurance,id',
            'representative_id' => 'nullable|integer|exists:insurance_representatives,id',
            'insurance_company_name' => 'nullable|string|max:255',
            'amount' => 'nullable|numeric|min:0|max:999999999999.99',
            'policy_number' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('properties_info', 'policy_number')->ignore($propertyInfoId),
            ],
            'effective_date' => 'nullable|date',
            'expiration_date' => 'nullable|date',
            'notes' => 'nullable|string|max:65535',
            'attachments' => 'nullable|array',
            'attachments.*' => 'file|mimes:jpeg,jpg,png,gif,webp,pdf|max:20480',
            'delete_attachment_ids' => 'nullable|array',
            'delete_attachment_ids.*' => 'integer|exists:property_insurance_attachments,id',
        ];
    }

    public function messages(): array
    {
        return [
            'property_id.required' => 'Property is required.',
            'property_id.integer' => 'Property must be a valid selection.',
            'property_id.exists' => 'The selected property does not exist.',
            'insurance_company_name.string' => 'Insurance company name must be a valid text.',
            'amount.numeric' => 'Amount must be a valid number.',
            'policy_number.unique' => 'Policy number already exists.',
            'effective_date.date' => 'Effective date must be a valid date.',
            'expiration_date.date' => 'Expiration date must be a valid date.',
        ];
    }
}
