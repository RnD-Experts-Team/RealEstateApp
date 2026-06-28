<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WalkthroughSetting extends Model
{
    use HasFactory;

    protected $table = 'walkthrough_settings';

    protected $fillable = [
        'form_kind',
        'require_signature',
    ];

    protected $casts = [
        'require_signature' => 'boolean',
    ];

    /**
     * Get the settings row for a given form kind, creating it if missing.
     */
    public static function forKind(string $kind): self
    {
        return static::query()->firstOrCreate(
            ['form_kind' => $kind],
            ['require_signature' => false],
        );
    }
}
