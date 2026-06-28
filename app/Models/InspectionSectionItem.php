<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InspectionSectionItem extends Model
{
    use HasFactory;

    protected $table = 'inspection_section_items';

    protected $fillable = [
        'inspection_section_id',
        'name',
        'sort_order',
        'is_archived',
    ];

    protected $casts = [
        'inspection_section_id' => 'integer',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('inspection_section_items.is_archived', false);
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
     * Query scope to include archived records
     */
    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(InspectionSection::class, 'inspection_section_id');
    }
}
