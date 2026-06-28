<?php

namespace Database\Seeders;

use App\Models\InspectionSection;
use App\Models\InspectionSectionItem;
use App\Models\InspectionSetting;
use Illuminate\Database\Seeder;

class InspectionDefaultSeeder extends Seeder
{
    /**
     * Seed the default inspection-form structure and settings.
     * Safe to run on an existing database: it only seeds when no
     * active sections exist yet, and always ensures a settings row.
     */
    public function run(): void
    {
        // Ensure the singleton settings row exists with sensible defaults.
        InspectionSetting::current();

        // Don't duplicate the default structure if sections already exist.
        if (InspectionSection::query()->withArchived()->exists()) {
            return;
        }

        $structure = [
            ['name' => 'Entry/Hall', 'is_repeatable' => false, 'items' => []],
            ['name' => 'Living Room', 'is_repeatable' => false, 'items' => []],
            ['name' => 'Kitchen', 'is_repeatable' => false, 'items' => []],
            ['name' => 'Bedroom', 'is_repeatable' => true, 'items' => ['Beds', 'Doors', 'Windows']],
            ['name' => 'Full Bathroom', 'is_repeatable' => true, 'items' => ['Flushes']],
            ['name' => 'Half Bathroom', 'is_repeatable' => true, 'items' => ['Flushes']],
        ];

        foreach ($structure as $sortOrder => $definition) {
            $section = InspectionSection::create([
                'name' => $definition['name'],
                'question' => 'Are there any problems in the ' . $definition['name'] . '?',
                'is_repeatable' => $definition['is_repeatable'],
                'sort_order' => $sortOrder,
            ]);

            foreach ($definition['items'] as $itemSort => $itemName) {
                InspectionSectionItem::create([
                    'inspection_section_id' => $section->id,
                    'name' => $itemName,
                    'sort_order' => $itemSort,
                ]);
            }
        }
    }
}
