<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'amount',
        'dates',
        'paid',
        'notes',
        'is_archived'
    ];

    protected $casts = [
        'tenant_id' => 'integer',
        'amount' => 'decimal:2',
        'paid' => 'decimal:2',
        'dates' => 'date',
        'is_archived' => 'boolean',
        'is_hidden' => 'boolean',
    ];

    protected $appends = ['left_to_pay', 'status'];

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
     * Get the tenant that this payment plan belongs to.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class, 'tenant_id');
    }

    /**
     * Accessor for left to pay amount
     */
    public function getLeftToPayAttribute()
    {
        return $this->amount - $this->paid;
    }

    /**
     * Accessor for payment status
     */
    public function getStatusAttribute()
    {
        $leftToPay = $this->left_to_pay;

        if ($leftToPay < 0) {
            return 'Over Paid';
        } elseif ($leftToPay == 0) {
            return 'Paid';
        } elseif ($leftToPay == $this->amount) {
            return "Didn't Pay";
        } elseif ($leftToPay > 0 && $leftToPay < $this->amount) {
            return "Paid Partly";
        } else {
            return "N/A";
        }
    }

    /**
     * Accessor to get tenant name through relationship
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

    /**
     * Validation rules for the model
     */
    public static function validationRules(): array
    {
        return [
            'tenant_id' => 'nullable|integer|exists:tenants,id',
            'amount' => 'required|numeric|min:0',
            'dates' => 'required|date',
            'paid' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ];
    }

    /**
     * Validation rules for updating the model
     */
    public static function updateValidationRules($id = null): array
    {
        return [
            'tenant_id' => 'sometimes|nullable|integer|exists:tenants,id',
            'amount' => 'sometimes|required|numeric|min:0',
            'dates' => 'sometimes|required|date',
            'paid' => 'sometimes|nullable|numeric|min:0',
            'notes' => 'sometimes|nullable|string',
        ];
    }
}
