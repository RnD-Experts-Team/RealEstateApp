<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UnitPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'type',
        'amount',
        'date',
        'to_whom',
        'description',
        'order_id',
        'is_hidden',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date' => 'date',
        'is_hidden' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}