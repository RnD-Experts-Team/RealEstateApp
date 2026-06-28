<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Agreement extends Model
{
    use HasFactory;

    protected $table = 'agreements';

    protected $fillable = [
        'agreement_type_id', 'token', 'reference', 'type_name', 'status',
        'owner_name', 'owner_signature_path', 'owner_signed_at',
        'agent_signature_path', 'agent_signed_at', 'is_archived',
    ];

    protected $casts = [
        'agreement_type_id' => 'integer',
        'owner_signed_at' => 'datetime',
        'agent_signed_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    protected $appends = ['owner_signature_url', 'agent_signature_url'];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('agreements.is_archived', false);
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

    public function getRouteKeyName(): string
    {
        return 'token';
    }

    public function clauses(): HasMany
    {
        return $this->hasMany(AgreementSnapshotClause::class)->orderBy('sort_order')->orderBy('id');
    }

    public function fields(): HasMany
    {
        return $this->hasMany(AgreementSnapshotField::class)->orderBy('sort_order')->orderBy('id');
    }

    public function getOwnerSignatureUrlAttribute(): ?string
    {
        return $this->owner_signature_path ? Storage::url($this->owner_signature_path) : null;
    }

    public function getAgentSignatureUrlAttribute(): ?string
    {
        return $this->agent_signature_path ? Storage::url($this->agent_signature_path) : null;
    }
}
