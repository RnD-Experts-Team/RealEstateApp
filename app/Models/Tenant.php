<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'first_name',
        'last_name',
        'street_address_line',
        'login_email',
        'alternate_email',
        'mobile',
        'emergency_phone',
        'cash_or_check',
        'has_insurance',
        'sensitive_communication',
        'has_assistance',
        'assistance_amount',
        'assistance_company',
        'is_archived',
    ];

    protected $casts = [
        'unit_id' => 'integer',
        'assistance_amount' => 'decimal:2',
        'is_archived' => 'boolean',
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
     * Get the unit that this tenant belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Get all notices and evictions for this tenant.
     */
    public function noticesAndEvictions(): HasMany
    {
        return $this->hasMany(NoticeAndEviction::class, 'tenant_id');
    }

    /**
     * Get all offers and renewals for this tenant.
     */
    public function offersAndRenewals(): HasMany
    {
        return $this->hasMany(OffersAndRenewal::class, 'tenant_id');
    }

    /**
     * Accessor for full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Accessor for formatted assistance amount
     */
    public function getFormattedAssistanceAmountAttribute(): string
    {
        return $this->assistance_amount ? '$' . number_format($this->assistance_amount, 2) : 'N/A';
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
        return $this->unit && $this->unit->property ? $this->unit->property->property_name : null;
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
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'street_address_line' => 'nullable|string|max:255',
            'login_email' => 'nullable|email|max:255',
            'alternate_email' => 'nullable|email|max:255',
            'mobile' => 'nullable|string|max:255',
            'emergency_phone' => 'nullable|string|max:255',
            'cash_or_check' => 'nullable|in:Cash,Check,EFT',
            'has_insurance' => 'nullable|in:Yes,No',
            'sensitive_communication' => 'nullable|in:Yes,No',
            'has_assistance' => 'nullable|in:Yes,No',
            'assistance_amount' => 'nullable|numeric|min:0|max:999999.99',
            'assistance_company' => 'nullable|string|max:255',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'street_address_line' => 'sometimes|nullable|string|max:255',
            'login_email' => 'sometimes|nullable|email|max:255',
            'alternate_email' => 'sometimes|nullable|email|max:255',
            'mobile' => 'sometimes|nullable|string|max:255',
            'emergency_phone' => 'sometimes|nullable|string|max:255',
            'cash_or_check' => 'sometimes|nullable|in:Cash,Check,EFT',
            'has_insurance' => 'sometimes|nullable|in:Yes,No',
            'sensitive_communication' => 'sometimes|nullable|in:Yes,No',
            'has_assistance' => 'sometimes|nullable|in:Yes,No',
            'assistance_amount' => 'sometimes|nullable|numeric|min:0|max:999999.99',
            'assistance_company' => 'sometimes|nullable|string|max:255',
        ];
    }
}
