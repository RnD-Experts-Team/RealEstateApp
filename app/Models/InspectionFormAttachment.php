<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class InspectionFormAttachment extends Model
{
    protected $table = 'inspection_form_attachments';

    protected $fillable = [
        'inspection_form_id',
        'inspection_form_section_id',
        'inspection_form_section_item_id',
        'kind',
        'file_name',
        'file_path',
    ];

    protected $appends = ['url'];

    public function form(): BelongsTo
    {
        return $this->belongsTo(InspectionForm::class, 'inspection_form_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
