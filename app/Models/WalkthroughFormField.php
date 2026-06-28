<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WalkthroughFormField extends Model
{
    use HasFactory;

    protected $table = 'walkthrough_form_fields';

    protected $fillable = [
        'walkthrough_form_id',
        'title',
        'type',
        'is_repeatable',
        'instance_label',
        'sort_order',
        'value_text',
        'value_bool',
        'value_options',
        'options_snapshot',
    ];

    protected $casts = [
        'walkthrough_form_id' => 'integer',
        'is_repeatable' => 'boolean',
        'value_bool' => 'boolean',
        'value_options' => 'array',
        'options_snapshot' => 'array',
        'sort_order' => 'integer',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(WalkthroughForm::class, 'walkthrough_form_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(WalkthroughFormAttachment::class);
    }
}
