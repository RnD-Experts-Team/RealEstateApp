<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgreementType extends Model
{
    use HasFactory;

    protected $table = 'agreement_types';

    protected $fillable = ['name', 'is_archived'];

    protected $casts = ['is_archived' => 'boolean'];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('agreement_types.is_archived', false);
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

    public function clauses(): HasMany
    {
        return $this->hasMany(AgreementClause::class)->orderBy('sort_order')->orderBy('id');
    }

    public function variables(): HasMany
    {
        return $this->hasMany(AgreementVariable::class)->orderBy('sort_order')->orderBy('id');
    }
}
