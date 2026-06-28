<?php

namespace App\Models;

use App\Models\MoveOut;
use App\Models\Representative;
use App\Models\Unit;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class WalkthroughForm extends Model
{
    use HasFactory;

    protected $table = 'walkthrough_forms';

    protected $fillable = [
        'form_kind',
        'context_type',
        'reference_id',
        'token',
        'representative_id',
        'representative_name',
        'property_address',
        'status',
        'signature_required',
        'signature_path',
        'submitted_at',
        'is_archived',
    ];

    protected $casts = [
        'reference_id' => 'integer',
        'representative_id' => 'integer',
        'signature_required' => 'boolean',
        'submitted_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    protected $appends = ['signature_url'];

    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('walkthrough_forms.is_archived', false);
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

    public function fields(): HasMany
    {
        return $this->hasMany(WalkthroughFormField::class)->orderBy('sort_order')->orderBy('id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(WalkthroughFormAttachment::class);
    }

    public function representative(): BelongsTo
    {
        return $this->belongsTo(Representative::class)->withTrashed();
    }

    /**
     * Resolve the linked Move-Out / Unit record (archived included).
     */
    public function reference(): ?Model
    {
        if ($this->context_type === 'move_out') {
            return MoveOut::withArchived()->find($this->reference_id);
        }

        return Unit::withArchived()->find($this->reference_id);
    }

    public function getSignatureUrlAttribute(): ?string
    {
        return $this->signature_path ? Storage::url($this->signature_path) : null;
    }
}
