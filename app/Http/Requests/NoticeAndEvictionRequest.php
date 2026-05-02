<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Tenant;
use App\Models\Notice;

class NoticeAndEvictionRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            // Entity fields
            'tenant_id' => [
                'nullable',
                'integer',
                Rule::exists('tenants', 'id')->where(function ($query) {
                    $query->where('is_archived', false);
                }),
            ],
            'status' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'type_of_notice' => [
                'nullable',
                'string',
                'max:255',
                Rule::exists('notices', 'notice_name')->where(function ($query) {
                    $query->where('is_archived', false);
                }),
            ],
            'have_an_exception' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'note' => 'nullable|string',
            'evictions' => 'nullable|string|max:255',
            'sent_to_atorney' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'hearing_dates' => 'nullable|date',
            'evected_or_payment_plan' => ['nullable', 'string', Rule::in(['Evected', 'Payment Plan'])],
            'if_left' => ['nullable', 'string', Rule::in(['Yes', 'No'])],
            'writ_date' => 'nullable|date|after_or_equal:date',
            'other_tenants' => 'nullable|string|max:255',

            // Image uploads
            'images' => 'nullable|array',
            'images.*' => 'file|mimes:jpeg,jpg,png,gif,webp|max:10240',
            'delete_image_ids' => 'nullable|array',
            'delete_image_ids.*' => 'integer|exists:notice_and_eviction_images,id',

            // Pagination parameters
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1',
            
            // Filter parameters (ID-based)
            'city_id' => 'nullable|integer|exists:cities,id',
            'property_id' => 'nullable|integer|exists:property_info_without_insurances,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            
            // Filter parameters (name-based)
            'city_name' => 'nullable|string|max:255',
            'property_name' => 'nullable|string|max:255',
            'unit_name' => 'nullable|string|max:255',
            'tenant_name' => 'nullable|string|max:255',
            'search' => 'nullable|string|max:255',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Validate that hearing_dates is after date if both are provided
            if ($this->date && $this->hearing_dates) {
                if ($this->hearing_dates < $this->date) {
                    $validator->errors()->add('hearing_dates', 'The hearing date must be after or equal to the notice date.');
                }
            }

            // Validate that writ_date is after hearing_dates if both are provided
            if ($this->hearing_dates && $this->writ_date) {
                if ($this->writ_date < $this->hearing_dates) {
                    $validator->errors()->add('writ_date', 'The writ date must be after or equal to the hearing date.');
                }
            }

            // Validate per_page - allow 'all' or numeric values
            if ($this->has('per_page') && $this->per_page !== 'all' && !is_numeric($this->per_page)) {
                $validator->errors()->add('per_page', 'The per page value must be numeric or "all".');
            }
        });
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages()
    {
        return [
            'tenant_id.exists' => 'The selected tenant does not exist or has been archived.',
            'tenant_id.integer' => 'The tenant ID must be a valid integer.',
            'type_of_notice.exists' => 'The selected notice type does not exist or has been archived.',
            'date.date' => 'The date must be a valid date.',
            'hearing_dates.date' => 'The hearing date must be a valid date.',
            'writ_date.date' => 'The writ date must be a valid date.',
            'writ_date.after_or_equal' => 'The writ date must be on or after the notice date.',
            'have_an_exception.in' => 'The exception field must be either Yes or No.',
            'sent_to_atorney.in' => 'The sent to attorney field must be either Yes or No.',
            'evected_or_payment_plan.in' => 'The evicted or payment plan field must be either Evected or Payment Plan.',
            'if_left.in' => 'The if left field must be either Yes or No.',
            'other_tenants.string' => 'The other tenants field must be a valid string.',
            'other_tenants.max' => 'The other tenants field must not exceed 255 characters.',
            'city_id.exists' => 'The selected city does not exist.',
            'property_id.exists' => 'The selected property does not exist.',
            'unit_id.exists' => 'The selected unit does not exist.',
            'page.integer' => 'The page must be a valid integer.',
            'page.min' => 'The page must be at least 1.',
            'per_page.integer' => 'The per page must be a valid integer.',
            'per_page.min' => 'The per page must be at least 1.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes()
    {
        return [
            'tenant_id' => 'tenant',
            'type_of_notice' => 'notice type',
            'have_an_exception' => 'exception status',
            'sent_to_atorney' => 'sent to attorney',
            'hearing_dates' => 'hearing date',
            'evected_or_payment_plan' => 'evicted or payment plan',
            'if_left' => 'if left',
            'writ_date' => 'writ date',
            'other_tenants' => 'other tenants',
            'per_page' => 'per page',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // If tenant_id is provided as string, convert to integer
        if ($this->has('tenant_id') && is_string($this->tenant_id)) {
            $this->merge([
                'tenant_id' => (int) $this->tenant_id,
            ]);
        }

        // Trim string fields
        $stringFields = [
            'status',
            'type_of_notice',
            'have_an_exception',
            'note',
            'evictions',
            'sent_to_atorney',
            'evected_or_payment_plan',
            'if_left',
            'other_tenants',
            'city_name',
            'property_name',
            'unit_name',
            'tenant_name',
            'search',
        ];

        foreach ($stringFields as $field) {
            if ($this->has($field) && is_string($this->$field)) {
                $this->merge([
                    $field => trim($this->$field),
                ]);
            }
        }

        // Convert per_page to appropriate value
        if ($this->has('per_page') && $this->per_page !== 'all' && is_string($this->per_page)) {
            $this->merge([
                'per_page' => (int) $this->per_page,
            ]);
        }
    }

    /**
     * Get validated data excluding pagination and filter parameters.
     * This returns only the entity fields for create/update operations.
     */
    public function getValidatedData(): array
    {
        $validated = $this->validated();

        // Remove pagination and filter parameters
        $excludeKeys = [
            'page',
            'per_page',
            'city_id',
            'property_id',
            'unit_id',
            'city_name',
            'property_name',
            'unit_name',
            'tenant_name',
            'search',
        ];

        foreach ($excludeKeys as $key) {
            unset($validated[$key]);
        }

        return $validated;
    }

    /**
     * Get pagination and filter parameters.
     * This returns only the pagination and filter fields.
     */
    public function getPaginationAndFilters(): array
    {
        $validated = $this->validated();

        $includeKeys = [
            'page',
            'per_page',
            'city_id',
            'property_id',
            'unit_id',
            'city_name',
            'property_name',
            'unit_name',
            'tenant_name',
            'search',
        ];

        $result = [];
        foreach ($includeKeys as $key) {
            if (isset($validated[$key])) {
                $result[$key] = $validated[$key];
            }
        }

        return $result;
    }
}
