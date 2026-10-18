<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['sometimes', 'required', 'date'],
            'unit_id' => [
                'sometimes',
                'nullable',
                'integer',
                Rule::exists('units', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                })
            ],
            'owes' => ['sometimes', 'required', 'numeric', 'min:0', 'max:999999.99'],
            'paid' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999999.99'],
            'left_to_pay' => ['sometimes', 'nullable', 'numeric'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'reversed_payments' => ['sometimes', 'nullable', 'string', 'max:255'],
            'permanent' => ['sometimes', 'required', 'string', Rule::in(['Yes', 'No'])],
            'has_assistance' => ['sometimes', 'nullable', 'boolean'],
            'assistance_amount' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:999999.99'],
            'assistance_company' => ['sometimes', 'nullable', 'string', 'max:255'],
            'remind' => ['sometimes', 'nullable', 'boolean'],
            'added_to_ledger' => ['sometimes', 'nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.exists' => 'The selected unit must exist and not be archived.',
            'unit_id.integer' => 'The unit ID must be a valid integer.',
            'date.required' => 'The payment date is required.',
            'date.date' => 'The payment date must be a valid date.',
            'owes.required' => 'The amount owed is required.',
            'owes.numeric' => 'The amount owed must be a valid number.',
            'owes.min' => 'The amount owed must be at least 0.',
            'owes.max' => 'The amount owed cannot exceed $999,999.99.',
            'paid.numeric' => 'The paid amount must be a valid number.',
            'paid.min' => 'The paid amount must be at least 0.',
            'paid.max' => 'The paid amount cannot exceed $999,999.99.',
            'permanent.required' => 'The permanent status is required.',
            'permanent.in' => 'The permanent field must be either Yes or No.',
            'assistance_amount.numeric' => 'The assistance amount must be a valid number.',
            'assistance_amount.min' => 'The assistance amount must be at least 0.',
            'assistance_amount.max' => 'The assistance amount cannot exceed $999,999.99.',
            'assistance_company.string' => 'The assistance company must be a valid string.',
            'assistance_company.max' => 'The assistance company cannot exceed 255 characters.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // If unit_id is provided as empty string, convert to null
        if ($this->unit_id === '') {
            $this->merge(['unit_id' => null]);
        }

        // Convert assistance_amount to null if empty string
        if ($this->assistance_amount === '') {
            $this->merge(['assistance_amount' => null]);
        }

        // Convert assistance_company to null if empty string
        if ($this->assistance_company === '') {
            $this->merge(['assistance_company' => null]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Allow overpayment scenario
            // Paid amount can exceed owes amount (resulting in Overpaid status)
            // This validation has been removed to support the overpayment feature
        });
    }
}
