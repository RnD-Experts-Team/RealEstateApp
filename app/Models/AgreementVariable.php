<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgreementVariable extends Model
{
    use HasFactory;

    protected $table = 'agreement_variables';

    protected $fillable = [
        'agreement_type_id', 'key', 'label', 'input_type', 'scope', 'value', 'required', 'sort_order', 'is_archived',
    ];

    protected $casts = [
        'agreement_type_id' => 'integer',
        'required' => 'boolean',
        'sort_order' => 'integer',
        'is_archived' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('agreement_variables.is_archived', false);
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
}
