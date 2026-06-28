<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalkthroughFieldOption extends Model
{
    use HasFactory;

    protected $table = 'walkthrough_field_options';

    protected $fillable = [
        'walkthrough_field_id',
        'label',
        'sort_order',
        'is_archived',
    ];

    protected $casts = [
        'walkthrough_field_id' => 'integer',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('walkthrough_field_options.is_archived', false);
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

    public function field(): BelongsTo
    {
        return $this->belongsTo(WalkthroughField::class, 'walkthrough_field_id');
    }
}
