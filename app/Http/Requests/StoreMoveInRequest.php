<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMoveInRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => [
                'required',
                'integer',
                Rule::exists('units', 'id')
            ],
            'signed_lease' => ['required', 'string', Rule::in(['Yes', 'No'])],
            'lease_signing_date' => ['nullable', 'date'],
            'move_in_date' => ['nullable', 'date'],
            'paid_security_deposit_first_month_rent' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'scheduled_paid_time' => ['nullable', 'date'],
            'handled_keys' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'move_in_form_sent_date' => ['nullable', 'date'],
            'filled_move_in_form' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'date_of_move_in_form_filled' => ['nullable', 'date'],
            'submitted_insurance' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'date_of_insurance_expiration' => ['nullable', 'date'],
            'delisted' => ['nullable', 'boolean'],
            'utilities_under_their_name' => ['nullable', 'boolean'],
            'tenant_name' => ['nullable', 'string'],
            'last_notice_sent' => ['nullable', 'date'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'second_name' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.exists' => 'The selected unit must exist.',
            'unit_id.required' => 'The unit ID is required.',
            'unit_id.integer' => 'The unit ID must be a valid integer.',
            'signed_lease.required' => 'The signed lease field is required.',
            'signed_lease.in' => 'The signed lease field must be either Yes or No.',
            'paid_security_deposit_first_month_rent.in' => 'The paid security deposit & first month rent field must be either Yes or No.',
            'handled_keys.in' => 'The handled keys field must be either Yes or No.',
            'filled_move_in_form.in' => 'The filled move in form field must be either Yes or No.',
            'submitted_insurance.in' => 'The submitted insurance field must be either Yes or No.',
        ];
    }
}
