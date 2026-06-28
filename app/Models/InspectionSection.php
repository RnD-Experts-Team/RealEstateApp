<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionSection extends Model
{
    use HasFactory;

    protected $table = 'inspection_sections';

    protected $fillable = [
        'name',
        'question',
        'is_repeatable',
        'sort_order',
        'is_archived',
    ];

    protected $casts = [
        'is_repeatable' => 'boolean',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('inspection_sections.is_archived', false);
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

    /**
     * Query scope to get only archived records
     */
    public function scopeOnlyArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived')->where('is_archived', true);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InspectionSectionItem::class)->orderBy('sort_order');
    }
}
