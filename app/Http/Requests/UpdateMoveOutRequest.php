<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMoveOutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'unit_id' => [
                'sometimes',
                'nullable',
                'integer',
                'exists:units,id'
            ],
            'move_out_date' => ['sometimes', 'nullable', 'date'],
            'lease_status' => ['sometimes', 'nullable', 'string', 'max:255'],
            'date_lease_ending_on_buildium' => ['sometimes', 'nullable', 'date'],
            'keys_location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'utilities_under_our_name' => ['sometimes', 'nullable', Rule::in(['Yes', 'No'])],
            'date_utility_put_under_our_name' => ['sometimes', 'nullable', 'date'],
            'walkthrough' => ['sometimes', 'nullable', 'string'],
            'all_the_devices_are_off' => ['sometimes', 'nullable', Rule::in(['Yes', 'No'])],
            'repairs' => ['sometimes', 'nullable', 'string'],
            'send_back_security_deposit' => ['sometimes', 'nullable', 'string', 'max:255'],
            'notes' => ['sometimes', 'nullable', 'string'],
            'cleaning' => ['sometimes', 'nullable', Rule::in(['cleaned', 'uncleaned'])],
            'list_the_unit' => ['sometimes', 'nullable', 'string', 'max:255'],
            'renter' => ['sometimes', 'nullable', Rule::in(['Yes', 'No'])],
            'move_out_form' => ['sometimes', 'nullable', Rule::in(['filled', 'not filled'])],
            'got_pics' => ['sometimes', 'nullable', 'boolean'],
            'tenants' => ['sometimes', 'nullable', 'string', 'max:255'],
            'utility_type' => ['sometimes', 'nullable', 'string'],
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
        $fieldsToNullify = [
            'unit_id',
            'move_out_date',
            'date_lease_ending_on_buildium',
            'date_utility_put_under_our_name',
        ];

        $data = [];
        foreach ($fieldsToNullify as $field) {
            if ($this->has($field)) {
                $data[$field] = $this->$field ?: null;
            }
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }
}
