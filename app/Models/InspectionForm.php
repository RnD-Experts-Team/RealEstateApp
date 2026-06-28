<?php

namespace App\Models;

use App\Models\MoveIn;
use App\Models\MoveOut;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionForm extends Model
{
    use HasFactory;

    protected $table = 'inspection_forms';

    protected $fillable = [
        'form_type',
        'reference_id',
        'token',
        'tenant_name',
        'property_address',
        'status',
        'acknowledged',
        'acknowledgment_text',
        'other_comments',
        'signature_required',
        'signature_path',
        'submitted_at',
        'is_archived',
    ];

    protected $casts = [
        'reference_id' => 'integer',
        'acknowledged' => 'boolean',
        'signature_required' => 'boolean',
        'submitted_at' => 'datetime',
        'is_archived' => 'boolean',
    ];

    protected $appends = ['signature_url'];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not_archived', function (Builder $builder) {
            $builder->where('inspection_forms.is_archived', false);
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

    public function sections(): HasMany
    {
        return $this->hasMany(InspectionFormSection::class)->orderBy('sort_order')->orderBy('id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InspectionFormAttachment::class);
    }

    /**
     * Resolve the linked Move-In / Move-Out record (archived included).
     */
    public function reference(): ?Model
    {
        if ($this->form_type === 'move_in') {
            return MoveIn::withArchived()->find($this->reference_id);
        }

        return MoveOut::withArchived()->find($this->reference_id);
    }

    public function isMoveIn(): bool
    {
        return $this->form_type === 'move_in';
    }

    public function getSignatureUrlAttribute(): ?string
    {
        return $this->signature_path ? \Illuminate\Support\Facades\Storage::url($this->signature_path) : null;
    }
}
