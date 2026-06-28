<?php

namespace App\Services;

use App\Models\InspectionSection;
use App\Models\InspectionSectionItem;
use App\Models\InspectionSetting;
use Illuminate\Database\Eloquent\Collection;

class InspectionConfigService
{
    /**
     * All active sections with their active items, ordered for display.
     */
    public function listSections(): Collection
    {
        return InspectionSection::with('items')
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();
    }

    public function settings(): InspectionSetting
    {
        return InspectionSetting::current();
    }

    public function createSection(array $data): InspectionSection
    {
        return InspectionSection::create([
            'name' => $data['name'],
            'question' => $data['question'] ?? ('Are there any problems in the ' . $data['name'] . '?'),
            'is_repeatable' => $data['is_repeatable'] ?? false,
            'sort_order' => $data['sort_order'] ?? ($this->nextSectionOrder()),
        ]);
    }

    public function updateSection(InspectionSection $section, array $data): InspectionSection
    {
        $section->fill([
            'name' => $data['name'] ?? $section->name,
            'question' => $data['question'] ?? $section->question,
            'is_repeatable' => $data['is_repeatable'] ?? $section->is_repeatable,
            'sort_order' => $data['sort_order'] ?? $section->sort_order,
        ]);
        $section->save();

        return $section;
    }

    public function archiveSection(InspectionSection $section): void
    {
        // Archive the section and all of its items (filled forms keep their snapshots).
        $section->items()->update(['is_archived' => true]);
        $section->archive();
    }

    public function createItem(InspectionSection $section, array $data): InspectionSectionItem
    {
        return InspectionSectionItem::create([
            'inspection_section_id' => $section->id,
            'name' => $data['name'],
            'sort_order' => $data['sort_order'] ?? ($section->items()->max('sort_order') + 1),
        ]);
    }

    public function updateItem(InspectionSectionItem $item, array $data): InspectionSectionItem
    {
        $item->fill([
            'name' => $data['name'] ?? $item->name,
            'sort_order' => $data['sort_order'] ?? $item->sort_order,
        ]);
        $item->save();

        return $item;
    }

    public function archiveItem(InspectionSectionItem $item): void
    {
        $item->archive();
    }

    public function updateSettings(array $data): InspectionSetting
    {
        $settings = InspectionSetting::current();
        $settings->fill([
            'acknowledgment_text' => $data['acknowledgment_text'] ?? $settings->acknowledgment_text,
            'other_comments_label' => $data['other_comments_label'] ?? $settings->other_comments_label,
            'require_video' => $data['require_video'] ?? $settings->require_video,
            'require_signature' => $data['require_signature'] ?? $settings->require_signature,
            'require_acknowledgment' => $data['require_acknowledgment'] ?? $settings->require_acknowledgment,
        ]);
        $settings->save();

        return $settings;
    }

    private function nextSectionOrder(): int
    {
        return (int) InspectionSection::max('sort_order') + 1;
    }
}
