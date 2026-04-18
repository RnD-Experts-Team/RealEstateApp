<?php
// app/Models/VendorInfo.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;

class VendorInfo extends Model
{
    use HasFactory;

    protected $table = 'vendors_info';

    protected $fillable = [
        'city_id',
        'vendor_name',
        'vendor_type',
        'number',
        'email',
        'service_type',
        'is_archived'
    ];

    protected $casts = [
        'is_archived' => 'boolean',
        'number' => 'array',
        'email' => 'array',
        'service_type' => 'array',
    ];

    // Global scope to exclude archived records by default
    protected static function booted(): void
    {
        static::addGlobalScope('active', function (Builder $query) {
            $query->where('is_archived', false);
        });
    }

    // Scope to include archived records when needed
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('active');
    }

    // Scope to get only archived records
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('active')->where('is_archived', true);
    }

    // Soft delete method
    public function archive(): bool
    {
        return $this->update(['is_archived' => true]);
    }

    // Restore method
    public function restore(): bool
    {
        return $this->update(['is_archived' => false]);
    }

    /**
     * Get the city that owns the vendor.
     */
    public function city(): BelongsTo
    {
        return $this->belongsTo(Cities::class, 'city_id');
    }

    /**
     * Get all tasks assigned to this vendor.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(VendorTaskTracker::class, 'vendor_id');
    }

    // Scope for filtering by city ID
    public function scopeByCityId(Builder $query, $cityId): Builder
    {
        return $cityId ? $query->where('city_id', $cityId) : $query;
    }

    // Scope for filtering by city name (through relationship)
    public function scopeByCity(Builder $query, $cityName): Builder
    {
        return $cityName ? $query->whereHas('city', function ($q) use ($cityName) {
            $q->where('city', 'like', '%' . $cityName . '%');
        }) : $query;
    }

    // Scope for filtering by vendor name
    public function scopeByVendorName(Builder $query, $vendorName): Builder
    {
        return $vendorName ? $query->where('vendor_name', 'like', '%' . $vendorName . '%') : $query;
    }

    // Get vendors by city ID
    public function scopeInCityId(Builder $query, $cityId): Builder
    {
        return $query->where('city_id', $cityId);
    }

    // Get vendors by city name (through relationship)
    public function scopeInCity(Builder $query, $cityName): Builder
    {
        return $query->whereHas('city', function ($q) use ($cityName) {
            $q->where('city', $cityName);
        });
    }

    // Scope to filter by phone number (searches within JSON array)
    public function scopeByPhoneNumber(Builder $query, $phoneNumber): Builder
    {
        return $phoneNumber ? $query->whereJsonContains('number', $phoneNumber) : $query;
    }

    // Scope to filter by email (searches within JSON array)
    public function scopeByEmail(Builder $query, $email): Builder
    {
        return $email ? $query->whereJsonContains('email', $email) : $query;
    }

    // Scope to filter by service type (searches within JSON array)
    public function scopeByServiceType(Builder $query, $serviceType): Builder
    {
        return $serviceType ? $query->whereJsonContains('service_type', $serviceType) : $query;
    }

    // Helper method: get first phone number or null
    public function getFirstPhoneNumber(): ?string
    {
        return is_array($this->number) && count($this->number) > 0 ? $this->number[0] : null;
    }

    // Helper method: get first email or null
    public function getFirstEmail(): ?string
    {
        return is_array($this->email) && count($this->email) > 0 ? $this->email[0] : null;
    }

    // Helper method: get first service type or null
    public function getFirstServiceType(): ?string
    {
        return is_array($this->service_type) && count($this->service_type) > 0 ? $this->service_type[0] : null;
    }

    // Helper method: add phone number to array
    public function addPhoneNumber(string $phoneNumber): self
    {
        $numbers = $this->number ?? [];
        if (!in_array($phoneNumber, $numbers)) {
            $numbers[] = $phoneNumber;
            $this->number = $numbers;
        }
        return $this;
    }

    // Helper method: add email to array
    public function addEmail(string $email): self
    {
        $emails = $this->email ?? [];
        if (!in_array($email, $emails)) {
            $emails[] = $email;
            $this->email = $emails;
        }
        return $this;
    }

    // Helper method: add service type to array
    public function addServiceType(string $serviceType): self
    {
        $services = $this->service_type ?? [];
        if (!in_array($serviceType, $services)) {
            $services[] = $serviceType;
            $this->service_type = $services;
        }
        return $this;
    }

    // Helper method: remove phone number from array
    public function removePhoneNumber(string $phoneNumber): self
    {
        $numbers = $this->number ?? [];
        $this->number = array_values(array_filter($numbers, fn($n) => $n !== $phoneNumber));
        return $this;
    }

    // Helper method: remove email from array
    public function removeEmail(string $email): self
    {
        $emails = $this->email ?? [];
        $this->email = array_values(array_filter($emails, fn($e) => $e !== $email));
        return $this;
    }

    // Helper method: remove service type from array
    public function removeServiceType(string $serviceType): self
    {
        $services = $this->service_type ?? [];
        $this->service_type = array_values(array_filter($services, fn($s) => $s !== $serviceType));
        return $this;
    }

    // Accessor for formatted display name
    public function getDisplayNameAttribute(): string
    {
        $cityName = $this->city ? $this->city->city : 'Unknown City';
        return $this->vendor_name . ' (' . $cityName . ')';
    }
}
