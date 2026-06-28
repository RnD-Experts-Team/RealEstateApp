<?php

namespace Database\Seeders;

use App\Models\WalkthroughField;
use App\Models\WalkthroughFieldOption;
use App\Models\WalkthroughSetting;
use Illuminate\Database\Seeder;

class WalkthroughDefaultSeeder extends Seeder
{
    /**
     * Seed default settings + a starter field set for both form kinds.
     * Safe to re-run: only seeds fields for a kind that has none yet.
     */
    public function run(): void
    {
        foreach (['walkthrough', 'safety_inspection'] as $kind) {
            WalkthroughSetting::forKind($kind);
        }

        $this->seedKind('walkthrough', [
            ['title' => 'Overall condition notes', 'type' => 'long_text', 'is_repeatable' => false],
            ['title' => 'Is the unit clean?', 'type' => 'yes_no', 'is_repeatable' => false],
            ['title' => 'Areas needing attention', 'type' => 'multi_choice', 'is_repeatable' => false,
                'options' => ['Kitchen', 'Bathroom', 'Living Room', 'Bedrooms', 'Exterior']],
            ['title' => 'General photos', 'type' => 'attachments', 'is_repeatable' => false],
            ['title' => 'Room photos', 'type' => 'attachments', 'is_repeatable' => true],
        ]);

        $this->seedKind('safety_inspection', [
            ['title' => 'Smoke detectors working?', 'type' => 'yes_no', 'is_repeatable' => false],
            ['title' => 'Carbon monoxide detectors working?', 'type' => 'yes_no', 'is_repeatable' => false],
            ['title' => 'Hazards found', 'type' => 'multi_choice', 'is_repeatable' => false,
                'options' => ['Electrical', 'Plumbing', 'Structural', 'Fire', 'Mold', 'None']],
            ['title' => 'Inspector notes', 'type' => 'long_text', 'is_repeatable' => false],
            ['title' => 'Photos per room', 'type' => 'attachments', 'is_repeatable' => true],
        ]);
    }

    private function seedKind(string $kind, array $fields): void
    {
        if (WalkthroughField::query()->withArchived()->where('form_kind', $kind)->exists()) {
            return;
        }

        foreach ($fields as $sortOrder => $definition) {
            $field = WalkthroughField::create([
                'form_kind' => $kind,
                'title' => $definition['title'],
                'type' => $definition['type'],
                'is_repeatable' => $definition['is_repeatable'],
                'sort_order' => $sortOrder,
            ]);

            foreach ($definition['options'] ?? [] as $optSort => $label) {
                WalkthroughFieldOption::create([
                    'walkthrough_field_id' => $field->id,
                    'label' => $label,
                    'sort_order' => $optSort,
                ]);
            }
        }
    }
}
