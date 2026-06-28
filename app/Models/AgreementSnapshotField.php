<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgreementSnapshotField extends Model
{
    use HasFactory;

    protected $table = 'agreement_snapshot_fields';

    protected $fillable = [
        'agreement_id', 'key', 'label', 'input_type', 'scope', 'value', 'required', 'sort_order',
    ];

    protected $casts = [
        'agreement_id' => 'integer',
        'required' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function agreement(): BelongsTo
    {
        return $this->belongsTo(Agreement::class, 'agreement_id');
    }
}
