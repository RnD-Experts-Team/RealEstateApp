<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgreementSnapshotClause extends Model
{
    use HasFactory;

    protected $table = 'agreement_snapshot_clauses';

    protected $fillable = [
        'agreement_id', 'title', 'body', 'kind', 'options', 'selected_option', 'sort_order',
    ];

    protected $casts = [
        'agreement_id' => 'integer',
        'options' => 'array',
        'selected_option' => 'integer',
        'sort_order' => 'integer',
    ];

    public function agreement(): BelongsTo
    {
        return $this->belongsTo(Agreement::class, 'agreement_id');
    }
}
