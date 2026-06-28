<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class WalkthroughFormAttachment extends Model
{
    protected $table = 'walkthrough_form_attachments';

    protected $fillable = [
        'walkthrough_form_id',
        'walkthrough_form_field_id',
        'file_name',
        'file_path',
    ];

    protected $appends = ['url'];

    public function form(): BelongsTo
    {
        return $this->belongsTo(WalkthroughForm::class, 'walkthrough_form_id');
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
