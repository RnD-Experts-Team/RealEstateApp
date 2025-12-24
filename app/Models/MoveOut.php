<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoveOut extends Model
{
    use HasFactory;

    protected $table = 'move_outs';

    protected $fillable = [
        'unit_id',
        'move_out_date',
        'lease_status',
        'date_lease_ending_on_buildium',
        'keys_location',
        'utilities_under_our_name',
        'date_utility_put_under_our_name',
        'walkthrough',
        'all_the_devices_are_off',
        'repairs',
        'send_back_security_deposit',
        'notes',
        'cleaning',
        'list_the_unit',
        'renter',
        'move_out_form',
        'is_archived',
        'tenants',
        'utility_type',
    ];

    protected $casts = [
        'unit_id' => 'integer',
        'move_out_date' => 'date',
        'date_lease_ending_on_buildium' => 'date',
        'date_utility_put_under_our_name' => 'date',
        'is_archived' => 'boolean',
        'is_hidden' => 'boolean', // ✅ NEW
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
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
     * Get the unit that this move-out belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Accessor to get unit name through relationship
     */
    public function getUnitNameAttribute(): ?string
    {
        return $this->unit ? $this->unit->unit_name : null;
    }

    /**
     * Accessor to get property name through relationships
     */
    public function getPropertyNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property 
            ? $this->unit->property->property_name 
            : null;
    }

    /**
     * Accessor to get city name through relationships
     */
    public function getCityNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property && $this->unit->property->city 
            ? $this->unit->property->city->city 
            : null;
    }

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'unit_id' => 'nullable|integer|exists:units,id',
            'move_out_date' => 'nullable|date',
            'lease_status' => 'nullable|string|max:255',
            'date_lease_ending_on_buildium' => 'nullable|date',
            'keys_location' => 'nullable|string|max:255',
            'utilities_under_our_name' => 'nullable|in:Yes,No',
            'date_utility_put_under_our_name' => 'nullable|date',
            'walkthrough' => 'nullable|string',
            'all_the_devices_are_off' => 'nullable|in:Yes,No',
            'repairs' => 'nullable|string',
            'send_back_security_deposit' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cleaning' => 'nullable|in:cleaned,uncleaned',
            'list_the_unit' => 'nullable|string|max:255',
            'renter' => 'nullable|in:Yes,No',
            'move_out_form' => 'nullable|in:filled,not filled',
            'tenants' => 'nullable|string|max:255',
            'utility_type' => 'nullable|string',
        ];
    }
}
