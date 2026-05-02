<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class NoticeAndEvictionImage extends Model
{
    protected $fillable = [
        'notice_and_eviction_id',
        'file_name',
        'file_path',
    ];

    protected $appends = ['url'];

    public function noticeAndEviction(): BelongsTo
    {
        return $this->belongsTo(NoticeAndEviction::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
