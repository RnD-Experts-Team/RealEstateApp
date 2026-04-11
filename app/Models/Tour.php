<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tour extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'representative_id',
        'prospect',
        'phone',
        'email',
        'date',
        'time',
        'note',
        'is_hidden',
    ];

    protected $casts = [
        'date' => 'date',
        'is_hidden' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function representative()
    {
        return $this->belongsTo(Representative::class)->withTrashed();
    }
}