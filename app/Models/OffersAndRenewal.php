<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon|null $date_sent_offer
 * @property Carbon|null $date_sent_lease
 * @property Carbon|null $date_offer_expires
 * @property Carbon|null $lease_expires
 */
class OffersAndRenewal extends Model
{
    use HasFactory;

    protected $table = 'offers_and_renewals';

    protected $fillable = [
        'tenant_id',
        'date_sent_offer',
        'date_offer_expires',
        'status',
        'date_of_acceptance',
        'last_notice_sent',
        'notice_kind',
        'lease_sent',
        'date_sent_lease',
        'lease_expires',
        'lease_signed',
        'date_signed',
        'last_notice_sent_2',
        'notice_kind_2',
        'notes',
        'how_many_days_left',
        'expired',
        'other_tenants',
        'date_of_decline',
        'is_archived',
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'date_sent_offer' => 'date',
        'date_offer_expires' => 'date',
        'date_of_acceptance' => 'date',
        'last_notice_sent' => 'date',
        'date_sent_lease' => 'date',
        'lease_expires' => 'date',
        'date_signed' => 'date',
        'last_notice_sent_2' => 'date',
        'date_of_decline' => 'date',
        'how_many_days_left' => 'integer',
        'is_archived' => 'boolean',
        'is_hidden' => 'boolean', // managed via hide/unhide actions only
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });

        static::saving(function ($offersAndRenewal) {
            $offersAndRenewal->calculateExpiry();
        });

        // Calculate expiry when retrieving records
        static::retrieved(function ($offersAndRenewal) {
            $offersAndRenewal->calculateExpiry();
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
     * Get the tenant that this offer/renewal belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Calculate expiry dates and status based on the business logic
     */
    public function calculateExpiry(): void
    {
        $now = now();

        // Only set N/A values when lease_signed equals 'Signed'
        if ($this->lease_signed === 'Signed') {
            $this->how_many_days_left = null;
            $this->expired = 'N/A';
            $this->date_offer_expires = null;
            $this->lease_expires = null;
            return;
        }

        // Calculate for all other statuses based on date_sent_offer + 40 days
        if ($this->date_sent_offer) {
            // Calculate the expiry date (date_sent_offer + 40 days)
            $expiryDate = $this->date_sent_offer->clone()->addDays(40);
            $this->date_offer_expires = $expiryDate;
            
            // Calculate how many days left (difference between today and expiry date)
            $daysLeft = $now->diffInDays($expiryDate, false);
            
            // Ensure no negative values (stops at 0)
            $this->how_many_days_left = max(0, $daysLeft);
            
            // Set expired status based on days left
            if ($this->how_many_days_left <= 0) {
                $this->expired = 'expired';
            } else {
                $this->expired = 'active';
            }
            
            // Clear lease expires since we're dealing with offers
            $this->lease_expires = null;
        } else {
            // No date_sent_offer, set N/A values
            $this->how_many_days_left = null;
            $this->expired = 'N/A';
            $this->date_offer_expires = null;
            $this->lease_expires = null;
        }
    }

    /**
     * Accessor to get tenant's full name through relationship
     */
    public function getTenantNameAttribute(): ?string
    {
        return $this->tenant ? $this->tenant->full_name : null;
    }

    /**
     * Accessor to get unit name through relationships
     */
    public function getUnitNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit ? $this->tenant->unit->unit_name : null;
    }

    /**
     * Accessor to get property name through relationships
     */
    public function getPropertyNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit && $this->tenant->unit->property 
            ? $this->tenant->unit->property->property_name 
            : null;
    }

    /**
     * Accessor to get city name through relationships
     */
    public function getCityNameAttribute(): ?string
    {
        return $this->tenant && $this->tenant->unit && $this->tenant->unit->property && $this->tenant->unit->property->city
            ? $this->tenant->unit->property->city->city
            : null;
    }


}
