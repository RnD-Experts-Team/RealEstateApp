<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

/**
 * @property \Illuminate\Support\Carbon|null $date
 * @property-read string|null $formatted_date
 */
class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'name',
        'co_signer',
        'status',
        'applicant_applied_from',
        'date',
        'stage_in_progress',
        'notes',
        'attachment_name',
        'attachment_path',
        'is_archived',
    ];

    protected $casts = [
        'date' => 'date',
        'is_archived' => 'boolean',
        'unit_id' => 'integer',
        'attachment_name' => 'array',
        'attachment_path' => 'array',
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

        static::created(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }
        });

        static::updated(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }

            // If unit_id changed, update both old and new units
            if ($application->isDirty('unit_id')) {
                $originalUnitId = $application->getOriginal('unit_id');
                if ($originalUnitId) {
                    Unit::updateApplicationCountForUnit($originalUnitId);
                }
            }
        });
static::saving(function (Application $application) {
    // Auto-hide rule:
    // - Approved => hidden
    // - Not Approved => unhidden
    // BUT do not override if is_hidden is explicitly being changed in this save
    if (!$application->isDirty('is_hidden')) {
        $application->is_hidden = ($application->status === 'Approved');
    }
});
        static::deleted(function ($application) {
            if ($application->unit_id) {
                Unit::updateApplicationCountForUnit($application->unit_id);
            }
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
     * Get the unit that owns this application.
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * Accessor for formatted date
     */
    public function getFormattedDateAttribute(): ?string
    {
        return $this->date ? $this->date->format('M d, Y') : null;
    }

    /**
     * Helper method to get the full attachment URL
     */
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return asset('storage/' . $this->attachment_path);
        }
        return null;
    }

    /**
     * Helper method to check if attachment exists
     */
    public function hasAttachment(): bool
    {
        return !empty($this->attachment_path) && !empty($this->attachment_name);
    }

    /**
     * Scope for filtering by status
     */
    public function scopeByStatus($query, $status)
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /**
     * Scope for filtering by stage
     */
    public function scopeByStage($query, $stage)
    {
        return $stage ? $query->where('stage_in_progress', $stage) : $query;
    }

    /**
     * Get applications by date range
     */
    public function scopeDateRange($query, $startDate = null, $endDate = null)
    {
        if ($startDate) {
            $query->where('date', '>=', $startDate);
        }
        if ($endDate) {
            $query->where('date', '<=', $endDate);
        }
        return $query;
    }
}
