<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class MoveIn extends Model
{
    use HasFactory;

    protected $table = 'move_ins';

    protected $fillable = [
        'unit_id',
        'signed_lease',
        'lease_signing_date',
        'move_in_date',
        'paid_security_deposit_first_month_rent',
        'scheduled_paid_time',
        'handled_keys',
        'move_in_form_sent_date',
        'filled_move_in_form',
        'date_of_move_in_form_filled',
        'submitted_insurance',
        'date_of_insurance_expiration',
        'tenant_name',
        'last_notice_sent',
        'is_archived',
    ];

    protected $casts = [
        'unit_id' => 'integer',
        'lease_signing_date' => 'date',
        'move_in_date' => 'date',
        'scheduled_paid_time' => 'date',
        'move_in_form_sent_date' => 'date',
        'date_of_move_in_form_filled' => 'date',
        'date_of_insurance_expiration' => 'date',
        'last_notice_sent' => 'date',
        'is_archived' => 'boolean',
        'is_hidden' => 'boolean',
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
     * Query scope to include archived records
     */
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    /**
     * Query scope to get only archived records
     */
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where('is_archived', true);
    }

    /**
     * Get the unit that owns this move-in record.
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
