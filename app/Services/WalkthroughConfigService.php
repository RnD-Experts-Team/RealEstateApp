<?php

namespace App\Services;

use App\Models\WalkthroughField;
use App\Models\WalkthroughFieldOption;
use App\Models\WalkthroughSetting;
use Illuminate\Database\Eloquent\Collection;

class WalkthroughConfigService
{
    public const KINDS = ['walkthrough', 'safety_inspection'];

    /**
     * Active fields (with active options) for a kind, ordered for display.
     */
    public function listFields(string $kind): Collection
    {
        return WalkthroughField::with('options')
            ->where('form_kind', $kind)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function settings(string $kind): WalkthroughSetting
    {
        return WalkthroughSetting::forKind($kind);
    }

    public function createField(string $kind, array $data): WalkthroughField
    {
        $field = WalkthroughField::create([
            'form_kind' => $kind,
            'title' => $data['title'],
            'type' => $data['type'],
            'is_repeatable' => $data['is_repeatable'] ?? false,
            'sort_order' => $data['sort_order'] ?? ((int) WalkthroughField::where('form_kind', $kind)->max('sort_order') + 1),
        ]);

        if ($field->type === 'multi_choice') {
            foreach ($data['options'] ?? [] as $sort => $label) {
                if (trim((string) $label) === '') {
                    continue;
                }
                WalkthroughFieldOption::create([
                    'walkthrough_field_id' => $field->id,
                    'label' => $label,
                    'sort_order' => $sort,
                ]);
            }
        }

        return $field;
    }

    public function updateField(WalkthroughField $field, array $data): WalkthroughField
    {
        $field->fill([
            'title' => $data['title'] ?? $field->title,
            'type' => $data['type'] ?? $field->type,
            'is_repeatable' => $data['is_repeatable'] ?? $field->is_repeatable,
            'sort_order' => $data['sort_order'] ?? $field->sort_order,
        ]);
        $field->save();

        return $field;
    }

    public function archiveField(WalkthroughField $field): void
    {
        $field->options()->update(['is_archived' => true]);
        $field->archive();
    }

    public function createOption(WalkthroughField $field, array $data): WalkthroughFieldOption
    {
        return WalkthroughFieldOption::create([
            'walkthrough_field_id' => $field->id,
            'label' => $data['label'],
            'sort_order' => $data['sort_order'] ?? ((int) $field->options()->max('sort_order') + 1),
        ]);
    }

    public function updateOption(WalkthroughFieldOption $option, array $data): WalkthroughFieldOption
    {
        $option->fill([
            'label' => $data['label'] ?? $option->label,
            'sort_order' => $data['sort_order'] ?? $option->sort_order,
        ]);
        $option->save();

        return $option;
    }

    public function archiveOption(WalkthroughFieldOption $option): void
    {
        $option->archive();
    }

    public function updateSettings(string $kind, array $data): WalkthroughSetting
    {
        $settings = WalkthroughSetting::forKind($kind);
        $settings->require_signature = $data['require_signature'] ?? $settings->require_signature;
        $settings->save();

        return $settings;
    }
}
