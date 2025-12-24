<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VendorTaskTracker extends Model
{
    use HasFactory;

    protected $table = 'vendors_tasks_tracker';

    protected $fillable = [
        'task_submission_date',
        'vendor_id',
        'unit_id',
        'assigned_tasks',
        'any_scheduled_visits',
        'notes',
        'task_ending_date',
        'status',
        'urgent',
        'is_archived',
    ];

    protected $casts = [
        'task_submission_date' => 'date',
        'any_scheduled_visits' => 'date',
        'task_ending_date' => 'date',
        'is_archived' => 'boolean',
        'vendor_id' => 'integer',
        'unit_id' => 'integer',
        'is_hidden' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        // Global scope to exclude archived records by default
        static::addGlobalScope('not_archived', function (Builder $query) {
            $query->where('is_archived', false);
        });
    }

    /**
     * Scope to include archived records
     */
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    /**
     * Scope to get only archived records
     */
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where('is_archived', true);
    }

    /**
     * Soft delete by setting is_archived to true
     */
    public function archive(): bool
    {
        return $this->update(['is_archived' => true]);
    }

    /**
     * Restore archived record
     */
    public function restore(): bool
    {
        return $this->update(['is_archived' => false]);
    }

    /**
     * Check if the record is archived
     */
    public function isArchived(): bool
    {
        return $this->is_archived;
    }

    /**
     * Get the vendor that owns this task.
     */
    public function vendor(): BelongsTo
    {
        return $this->belongsTo(VendorInfo::class, 'vendor_id');
    }

    /**
     * Get the unit that owns this task.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get the city through the vendor relationship.
     */
    public function city(): BelongsTo
    {
        return $this->vendor()->city();
    }

    /**
     * Get the property through the unit relationship.
     */
    public function property(): BelongsTo
    {
        return $this->unit()->property();
    }

    /**
     * Scope to filter by vendor ID
     */
    public function scopeByVendor(Builder $query, $vendorId): Builder
    {
        return $vendorId ? $query->where('vendor_id', $vendorId) : $query;
    }

    /**
     * Scope to filter by unit ID
     */
    public function scopeByUnit(Builder $query, $unitId): Builder
    {
        return $unitId ? $query->where('unit_id', $unitId) : $query;
    }

    /**
     * Scope to filter by status
     */
    public function scopeByStatus(Builder $query, $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /**
     * Scope to filter by urgent tasks
     */
    public function scopeUrgent(Builder $query, $urgent = 'Yes'): Builder
    {
        return $query->where('urgent', $urgent);
    }

    /**
     * Scope to filter by city through vendor relationship
     */
    public function scopeByCity(Builder $query, $cityId): Builder
    {
        return $cityId ? $query->whereHas('vendor', function ($q) use ($cityId) {
            $q->where('city_id', $cityId);
        }) : $query;
    }

    /**
     * Scope to filter by property through unit relationship
     */
    public function scopeByProperty(Builder $query, $propertyId): Builder
    {
        return $propertyId ? $query->whereHas('unit', function ($q) use ($propertyId) {
            $q->where('property_id', $propertyId);
        }) : $query;
    }

    /**
     * Scope to filter by date range
     */
    public function scopeByDateRange(Builder $query, $startDate, $endDate): Builder
    {
        if ($startDate && $endDate) {
            return $query->whereBetween('task_submission_date', [$startDate, $endDate]);
        } elseif ($startDate) {
            return $query->where('task_submission_date', '>=', $startDate);
        } elseif ($endDate) {
            return $query->where('task_submission_date', '<=', $endDate);
        }
        return $query;
    }

    /**
     * Accessor for vendor name through relationship
     */
    public function getVendorNameAttribute(): ?string
    {
        return $this->vendor?->vendor_name;
    }

    /**
     * Accessor for unit name through relationship
     */
    public function getUnitNameAttribute(): ?string
    {
        return $this->unit?->unit_name;
    }

    /**
     * Accessor for city name through relationships
     */
    public function getCityNameAttribute(): ?string
    {
        return $this->unit?->property?->city?->city;
    }

    /**
     * Accessor for property name through relationships
     */
    public function getPropertyNameAttribute(): ?string
    {
        return $this->unit?->property?->property_name;
    }

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'task_submission_date' => 'required|date',
            'vendor_id' => 'nullable|integer|exists:vendors_info,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            'assigned_tasks' => 'required|string',
            'any_scheduled_visits' => 'nullable|date',
            'notes' => 'nullable|string',
            'task_ending_date' => 'nullable|date|after_or_equal:task_submission_date',
            'status' => 'nullable|string|max:255',
            'urgent' => 'required|in:Yes,No',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'task_submission_date' => 'sometimes|required|date',
            'vendor_id' => 'sometimes|nullable|integer|exists:vendors_info,id',
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'assigned_tasks' => 'sometimes|required|string',
            'any_scheduled_visits' => 'sometimes|nullable|date',
            'notes' => 'sometimes|nullable|string',
            'task_ending_date' => 'sometimes|nullable|date|after_or_equal:task_submission_date',
            'status' => 'sometimes|nullable|string|max:255',
            'urgent' => 'sometimes|required|in:Yes,No',
        ];
    }
}
