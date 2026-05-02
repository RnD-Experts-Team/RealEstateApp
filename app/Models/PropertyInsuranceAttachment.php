<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PropertyInsuranceAttachment extends Model
{
    protected $fillable = [
        'property_info_id',
        'file_name',
        'file_path',
    ];

    protected $appends = ['url'];

    public function propertyInfo(): BelongsTo
    {
        return $this->belongsTo(PropertyInfo::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::url($this->file_path);
    }
}
