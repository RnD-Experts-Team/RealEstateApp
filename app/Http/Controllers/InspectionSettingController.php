<?php

namespace App\Http\Controllers;

use App\Http\Requests\InspectionSectionItemRequest;
use App\Http\Requests\InspectionSectionRequest;
use App\Http\Requests\InspectionSettingRequest;
use App\Models\InspectionSection;
use App\Models\InspectionSectionItem;
use App\Services\InspectionConfigService;
use Inertia\Inertia;

class InspectionSettingController extends Controller
{
    protected InspectionConfigService $service;

    public function __construct(InspectionConfigService $service)
    {
        $this->service = $service;

        $this->middleware('permission:inspection-settings.index')->only('index');
        $this->middleware('permission:inspection-settings.update')->only([
            'storeSection', 'updateSection', 'destroySection',
            'storeItem', 'updateItem', 'destroyItem',
            'updateSettings',
        ]);
    }

    public function index()
    {
        return Inertia::render('InspectionSettings/Index', [
            'sections' => $this->service->listSections(),
            'settings' => $this->service->settings(),
        ]);
    }

    public function storeSection(InspectionSectionRequest $request)
    {
        $this->service->createSection($request->validated());

        return back()->with('success', 'Section added successfully.');
    }

    public function updateSection(InspectionSectionRequest $request, InspectionSection $section)
    {
        $this->service->updateSection($section, $request->validated());

        return back()->with('success', 'Section updated successfully.');
    }

    public function destroySection(InspectionSection $section)
    {
        $this->service->archiveSection($section);

        return back()->with('success', 'Section removed successfully.');
    }

    public function storeItem(InspectionSectionItemRequest $request)
    {
        $section = InspectionSection::findOrFail($request->validated()['inspection_section_id']);
        $this->service->createItem($section, $request->validated());

        return back()->with('success', 'Item added successfully.');
    }

    public function updateItem(InspectionSectionItemRequest $request, InspectionSectionItem $item)
    {
        $this->service->updateItem($item, $request->validated());

        return back()->with('success', 'Item updated successfully.');
    }

    public function destroyItem(InspectionSectionItem $item)
    {
        $this->service->archiveItem($item);

        return back()->with('success', 'Item removed successfully.');
    }

    public function updateSettings(InspectionSettingRequest $request)
    {
        $this->service->updateSettings($request->validated());

        return back()->with('success', 'Settings saved successfully.');
    }
}
