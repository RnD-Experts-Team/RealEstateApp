<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgreementClauseOption extends Model
{
    use HasFactory;

    protected $table = 'agreement_clause_options';

    protected $fillable = ['agreement_clause_id', 'label', 'body', 'sort_order', 'is_archived'];

    protected $casts = [
        'agreement_clause_id' => 'integer',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('agreement_clause_options.is_archived', false);
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

    public function clause(): BelongsTo
    {
        return $this->belongsTo(AgreementClause::class, 'agreement_clause_id');
    }
}
