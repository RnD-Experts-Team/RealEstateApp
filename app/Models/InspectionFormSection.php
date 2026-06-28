<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionFormSection extends Model
{
    use HasFactory;

    protected $table = 'inspection_form_sections';

    protected $fillable = [
        'inspection_form_id',
        'name',
        'question',
        'is_repeatable',
        'instance_label',
        'has_problems',
        'note',
        'sort_order',
    ];

    protected $casts = [
        'inspection_form_id' => 'integer',
        'is_repeatable' => 'boolean',
        'has_problems' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(InspectionForm::class, 'inspection_form_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InspectionFormSectionItem::class)->orderBy('sort_order')->orderBy('id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InspectionFormAttachment::class);
    }
}
