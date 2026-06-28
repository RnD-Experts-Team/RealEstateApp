<?php

namespace App\Http\Controllers;

use App\Http\Requests\WalkthroughFieldOptionRequest;
use App\Http\Requests\WalkthroughFieldRequest;
use App\Http\Requests\WalkthroughSettingRequest;
use App\Models\WalkthroughField;
use App\Models\WalkthroughFieldOption;
use App\Services\WalkthroughConfigService;
use Inertia\Inertia;

class WalkthroughSettingController extends Controller
{
    protected WalkthroughConfigService $service;

    public function __construct(WalkthroughConfigService $service)
    {
        $this->service = $service;

        $this->middleware('permission:walkthrough-settings.index')->only('index');
        $this->middleware('permission:walkthrough-settings.update')->only([
            'storeField', 'updateField', 'destroyField',
            'storeOption', 'updateOption', 'destroyOption',
            'updateSettings',
        ]);
    }

    public function index()
    {
        $fields = [];
        $settings = [];
        foreach (WalkthroughConfigService::KINDS as $kind) {
            $fields[$kind] = $this->service->listFields($kind);
            $settings[$kind] = $this->service->settings($kind);
        }

        return Inertia::render('WalkthroughSettings/Index', [
            'fields' => $fields,
            'settings' => $settings,
        ]);
    }

    public function storeField(WalkthroughFieldRequest $request)
    {
        $data = $request->validated();
        $this->service->createField($data['form_kind'], $data);

        return back()->with('success', 'Field added successfully.');
    }

    public function updateField(WalkthroughFieldRequest $request, WalkthroughField $field)
    {
        $this->service->updateField($field, $request->validated());

        return back()->with('success', 'Field updated successfully.');
    }

    public function destroyField(WalkthroughField $field)
    {
        $this->service->archiveField($field);

        return back()->with('success', 'Field removed successfully.');
    }

    public function storeOption(WalkthroughFieldOptionRequest $request)
    {
        $field = WalkthroughField::findOrFail($request->validated()['walkthrough_field_id']);
        $this->service->createOption($field, $request->validated());

        return back()->with('success', 'Option added successfully.');
    }

    public function updateOption(WalkthroughFieldOptionRequest $request, WalkthroughFieldOption $option)
    {
        $this->service->updateOption($option, $request->validated());

        return back()->with('success', 'Option updated successfully.');
    }

    public function destroyOption(WalkthroughFieldOption $option)
    {
        $this->service->archiveOption($option);

        return back()->with('success', 'Option removed successfully.');
    }

    public function updateSettings(WalkthroughSettingRequest $request)
    {
        $data = $request->validated();
        $this->service->updateSettings($data['form_kind'], $data);

        return back()->with('success', 'Settings saved successfully.');
    }
}
