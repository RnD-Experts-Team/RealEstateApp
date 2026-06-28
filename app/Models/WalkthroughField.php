<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WalkthroughField extends Model
{
    use HasFactory;

    protected $table = 'walkthrough_fields';

    protected $fillable = [
        'form_kind',
        'title',
        'type',
        'is_repeatable',
        'sort_order',
        'is_archived',
    ];

    protected $casts = [
        'is_repeatable' => 'boolean',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('walkthrough_fields.is_archived', false);
        });
    }

    public function archive(): bool
    {
        $this->is_archived = true;
        return $this->save();
    }

    public function scopeWithArchived(Builder $query): Builder
    {
        return $query->withoutGlobalScope('not_archived');
    }

    public function options(): HasMany
    {
        return $this->hasMany(WalkthroughFieldOption::class)->orderBy('sort_order');
    }
}
