<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InspectionSetting extends Model
{
    use HasFactory;

    protected $table = 'inspection_settings';

    protected $fillable = [
        'acknowledgment_text',
        'other_comments_label',
        'require_video',
        'require_signature',
        'require_acknowledgment',
    ];

    protected $casts = [
        'require_video' => 'boolean',
        'require_signature' => 'boolean',
        'require_acknowledgment' => 'boolean',
    ];

    /**
     * Get the single settings row, creating it with sensible defaults if missing.
     */
    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'acknowledgment_text' => 'By checking this box I/we (tenants), understand that unless otherwise noted, all damages are under the tenant\'s responsibility and will be deducted from the security deposit upon move-out.',
            'other_comments_label' => 'Any other comments you want to bring to our attention?',
            'require_video' => false,
            'require_signature' => false,
            'require_acknowledgment' => true,
        ]);
    }
}
