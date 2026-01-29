<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMoveOutRequest extends FormRequest
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
                'exists:units,id'
            ],
            'move_out_date' => ['nullable', 'date'],
            'lease_status' => ['nullable', 'string', 'max:255'],
            'date_lease_ending_on_buildium' => ['nullable', 'date'],
            'keys_location' => ['nullable', 'string', 'max:255'],
            'utilities_under_our_name' => ['nullable', Rule::in(['Yes', 'No'])],
            'date_utility_put_under_our_name' => ['nullable', 'date'],
            'walkthrough' => ['nullable', 'string'],
            'all_the_devices_are_off' => ['nullable', Rule::in(['Yes', 'No'])],
            'repairs' => ['nullable', 'string'],
            'send_back_security_deposit' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string'],
            'cleaning' => ['nullable', Rule::in(['cleaned', 'uncleaned'])],
            'list_the_unit' => ['nullable', 'string', 'max:255'],
            'renter' => ['nullable', Rule::in(['Yes', 'No'])],
            'move_out_form' => ['nullable', Rule::in(['filled', 'not filled'])],
            'got_pics' => ['nullable', 'boolean'],
            'tenants' => ['nullable', 'string', 'max:255'],
            'utility_type' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'unit_id.exists' => 'The selected unit does not exist.',
            'unit_id.integer' => 'The unit ID must be a valid number.',
            'move_out_date.date' => 'The move out date must be a valid date.',
            'date_lease_ending_on_buildium.date' => 'The lease ending date must be a valid date.',
            'date_utility_put_under_our_name.date' => 'The utility date must be a valid date.',
            'utilities_under_our_name.in' => 'The utilities under our name field must be either Yes or No.',
            'all_the_devices_are_off.in' => 'The all the devices are off field must be either Yes or No.',
            'cleaning.in' => 'The cleaning field must be either cleaned or uncleaned.',
            'move_out_form.in' => 'The move out form field must be either filled or not filled.',
            'renter.in' => 'The renter field must be either Yes or No.',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convert empty strings to null for nullable fields
        $this->merge([
            'unit_id' => $this->unit_id ?: null,
            'move_out_date' => $this->move_out_date ?: null,
            'date_lease_ending_on_buildium' => $this->date_lease_ending_on_buildium ?: null,
            'date_utility_put_under_our_name' => $this->date_utility_put_under_our_name ?: null,
        ]);
    }
}
