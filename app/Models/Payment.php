<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'unit_id',
        'owes',
        'paid',
        'left_to_pay',
        'status',
        'notes',
        'reversed_payments',
        'permanent',
        'is_archived',
        'has_assistance',
        'assistance_amount',
        'assistance_company',
        'remind',
        'added_to_ledger',
        // 'is_hidden' intentionally NOT mass-assignable; managed via actions only
    ];

    protected $casts = [
        'date' => 'date',
        'owes' => 'decimal:2',
        'paid' => 'decimal:2',
        'left_to_pay' => 'decimal:2',
        'assistance_amount' => 'decimal:2',
        'is_archived' => 'boolean',
        'has_assistance' => 'boolean',
        'is_hidden' => 'boolean',
        'remind' => 'boolean',
        'added_to_ledger' => 'boolean',
        'unit_id' => 'integer',
    ];

    // Automatically calculate left_to_pay when owes or paid changes
    protected static function boot()
    {
        parent::boot();

        static::saving(function ($payment) {
            // Treat null paid as 0 for calculations
            $paid = $payment->paid ?? 0;
            $payment->left_to_pay = $payment->owes - $paid;

            // Calculate status once, reuse
            $payment->status = $payment->calculateStatus();

            // Auto-hide when status is Paid or Overpaid,
            // BUT ONLY if is_hidden was NOT explicitly changed in this save.
            if (!$payment->isDirty('is_hidden')) {
                if (in_array($payment->status, ['Paid', 'Overpaid'])) {
                    $payment->is_hidden = true;
                }
                // Do not auto-unhide; respect existing/manual value.
            }
        });

        // Global scope to filter out archived records by default
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('is_archived', false);
        });
    }

    /**
     * Get the unit that this payment belongs to.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Soft delete by setting is_archived to true
     */
    public function archive(): bool
    {
        $this->is_archived = true;
        return $this->save();
    }

    /**
     * Restore archived record
     */
    public function restore(): bool
    {
        $this->is_archived = false;
        return $this->save();
    }

    /**
     * Check if record is archived
     */
    public function isArchived(): bool
    {
        return $this->is_archived;
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
     * Calculate status based on left_to_pay and owes values
     */
    public function calculateStatus(): string
    {
        $owes = (float) $this->owes;
        $paid = (float) ($this->paid ?? 0);
        $leftToPay = $owes - $paid;

        if ($leftToPay == 0.0) {
            return 'Paid';
        } elseif ($leftToPay < 0.0) {
            return 'Overpaid';
        } elseif ($leftToPay == $owes) {
            return 'Didn\'t Pay';
        } elseif ($leftToPay > 0.0 && $leftToPay < $owes) {
            return 'Paid Partly';
        }
        return 'Didn\'t Pay';
    }

    /**
     * Update status based on current left_to_pay value
     */
    public function updateStatus(): void
    {
        $this->status = $this->calculateStatus();
        $this->save();
    }

    public function getFormattedOwesAttribute(): string
    {
        return '$' . number_format((float) ($this->owes ?? 0), 2);
    }

    public function getFormattedPaidAttribute(): string
    {
        return '$' . number_format((float) ($this->paid ?? 0), 2);
    }

    public function getFormattedLeftToPayAttribute(): string
    {
        return '$' . number_format((float) ($this->left_to_pay ?? 0), 2);
    }

    public function getFormattedAssistanceAmountAttribute(): string
    {
        return '$' . number_format((float) ($this->assistance_amount ?? 0), 2);
    }

    public function getPropertyAttribute()
    {
        return $this->unit ? $this->unit->property : null;
    }

    public function getPropertyNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property ? $this->unit->property->property_name : null;
    }

    public function getCityAttribute()
    {
        return $this->unit && $this->unit->property ? $this->unit->property->city : null;
    }

    public function getCityNameAttribute(): ?string
    {
        return $this->unit && $this->unit->property && $this->unit->property->city ? $this->unit->property->city->city : null;
    }

    public function getUnitNameAttribute(): ?string
    {
        return $this->unit ? $this->unit->unit_name : null;
    }
}
