<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgreementClause extends Model
{
    use HasFactory;

    protected $table = 'agreement_clauses';

    protected $fillable = ['agreement_type_id', 'title', 'body', 'kind', 'sort_order', 'is_archived'];

    protected $casts = [
        'agreement_type_id' => 'integer',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('agreement_clauses.is_archived', false);
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

    public function type(): BelongsTo
    {
        return $this->belongsTo(AgreementType::class, 'agreement_type_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(AgreementClauseOption::class)->orderBy('sort_order')->orderBy('id');
    }
}
