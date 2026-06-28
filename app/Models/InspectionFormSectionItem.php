<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InspectionFormSectionItem extends Model
{
    use HasFactory;

    protected $table = 'inspection_form_section_items';

    protected $fillable = [
        'inspection_form_section_id',
        'name',
        'note',
        'sort_order',
    ];

    protected $casts = [
        'inspection_form_section_id' => 'integer',
        'sort_order' => 'integer',
    ];

    public function section(): BelongsTo
    {
        return $this->belongsTo(InspectionFormSection::class, 'inspection_form_section_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(InspectionFormAttachment::class);
    }
}
