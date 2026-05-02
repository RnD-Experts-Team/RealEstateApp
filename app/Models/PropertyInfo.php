<?php
// app/Models/PropertyInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class PropertyInfo extends Model
{
    use HasFactory;

    protected $table = 'properties_info';
    protected $appends = ['formatted_amount'];
    protected $fillable = [
        'property_id',
        'representative_id',
        'insurance_company_name',
        'amount',
        'policy_number',
        'effective_date',
        'expiration_date',
        'notes',
        'status',
        'is_archived'
    ];

    // Remove the date casting to prevent timezone conversion
    protected $casts = [
        'property_id' => 'integer',  // Added this cast
        'amount' => 'decimal:2',
        'is_archived' => 'boolean'
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
     * Get the property that owns this insurance info.
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(PropertyInfoWithoutInsurance::class, 'property_id');
    }

    /**
     * Get the representative for this insurance.
     */
    public function representative(): BelongsTo
    {
        return $this->belongsTo(InsuranceRepresentative::class, 'representative_id')->withTrashed();
    }

    /**
     * Get the attachments for this insurance.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(PropertyInsuranceAttachment::class);
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

    // Add custom accessors to handle dates properly
    public function getEffectiveDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getExpirationDateAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    // Update mutators to store dates correctly
    public function setEffectiveDateAttribute($value)
    {
        $this->attributes['effective_date'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function setExpirationDateAttribute($value)
    {
        $this->attributes['expiration_date'] = $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }

    public function getFormattedAmountAttribute(): string
    {
        return '$' . number_format($this->amount, 2);
    }

    public function getIsExpiredAttribute(): bool
    {
        return Carbon::now()->startOfDay()->gt(Carbon::parse($this->attributes['expiration_date'])->startOfDay());
    }

    public function getIsExpiringSoonAttribute(): bool
    {
        $today = Carbon::now()->startOfDay();
        $expirationDate = Carbon::parse($this->attributes['expiration_date'])->startOfDay();
        $daysLeft = $today->diffInDays($expirationDate, false);

        return $daysLeft >= 0 && $daysLeft <= 30;
    }

    public function getDaysLeftAttribute(): int
    {
        $today = Carbon::now()->startOfDay();
        $expirationDate = Carbon::parse($this->attributes['expiration_date'])->startOfDay();

        return $today->diffInDays($expirationDate, false);
    }

    public function updateStatus(): void
    {
        $this->status = $this->is_expired ? 'Expired' : 'Active';
        $this->save();
    }
}
