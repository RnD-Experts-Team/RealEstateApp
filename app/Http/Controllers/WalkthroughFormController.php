<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitWalkthroughFormRequest;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use App\Models\WalkthroughForm;
use App\Models\WalkthroughSetting;
use App\Services\WalkthroughFormService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WalkthroughFormController extends Controller
{
    protected WalkthroughFormService $service;

    public function __construct(WalkthroughFormService $service)
    {
        $this->service = $service;

        $this->middleware('permission:walkthrough-forms.manage')->only('generate');
        $this->middleware('permission:walkthrough-forms.manage|safety-inspections.index')->only(['show', 'pdf']);
        $this->middleware('permission:safety-inspections.index')->only('safetyIndex');
        $this->middleware('permission:safety-inspections.create')->only('safetyStore');
        $this->middleware('permission:safety-inspections.destroy')->only('safetyDestroy');
        $this->middleware('permission:walkthrough-forms.manage|safety-inspections.create')->only('resetForm');
    }

    /**
     * Staff: ensure the (single) walkthrough exists for a Move-Out + assign a representative.
     */
    public function generate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'move_out_id' => ['required', 'integer'],
            'representative_id' => ['nullable', 'integer', 'exists:representatives,id'],
        ]);

        $this->service->getOrCreateForMoveOut((int) $data['move_out_id'], $data['representative_id'] ?? null);

        return back()->with('success', 'Walkthrough link is ready to share.');
    }

    public function show(WalkthroughForm $form)
    {
        return Inertia::render('Walkthrough/Show', [
            'data' => $this->service->buildFillPayload($form),
        ]);
    }

    public function pdf(WalkthroughForm $form)
    {
        $data = $this->service->pdfData($form);
        $pdf = Pdf::loadView('pdf.walkthrough', ['data' => $data]);

        return $pdf->download('walkthrough-' . $form->form_kind . '-' . $form->id . '.pdf');
    }

    /**
     * Dedicated Safety Inspections page (standalone, many per unit).
     */
    public function safetyIndex(Request $request)
    {
        $unitFilter = $request->input('unit_id');

        $query = WalkthroughForm::where('form_kind', 'safety_inspection')
            ->where('context_type', 'unit')
            ->orderBy('created_at', 'desc');

        if ($unitFilter) {
            $query->where('reference_id', $unitFilter);
        }

        $forms = $query->get();

        $units = Unit::withArchived()->with('property.city')
            ->whereIn('id', $forms->pluck('reference_id'))->get()->keyBy('id');

        $rows = $forms->map(function (WalkthroughForm $form) use ($units) {
            $unit = $units->get($form->reference_id);
            return array_merge($this->service->linkPayload($form), [
                'unit_id' => $form->reference_id,
                'unit_name' => $unit?->unit_name,
                'property_name' => $unit?->property?->property_name,
                'city_name' => $unit?->property?->city?->city,
                'property_address' => $form->property_address,
                'created_at' => optional($form->created_at)->toDateTimeString(),
            ]);
        })->values();

        return Inertia::render('SafetyInspections/Index', array_merge([
            'inspections' => $rows,
            'representatives' => $this->service->representativeOptions(),
            'filterUnitId' => $unitFilter ? (int) $unitFilter : null,
        ], $this->unitDropdownData()));
    }

    public function safetyStore(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'unit_id' => ['required', 'integer', 'exists:units,id'],
            'representative_id' => ['nullable', 'integer', 'exists:representatives,id'],
        ]);

        $this->service->createForUnit((int) $data['unit_id'], $data['representative_id'] ?? null);

        return back()->with('success', 'Safety inspection created.');
    }

    public function safetyDestroy(WalkthroughForm $form): RedirectResponse
    {
        $form->archive();

        return back()->with('success', 'Safety inspection removed.');
    }

    /**
     * Staff: reset a submitted walkthrough/safety form and rotate its token.
     * The old signed URL becomes invalid; a new link must be shared.
     */
    public function resetForm(WalkthroughForm $form): RedirectResponse
    {
        $this->service->reset($form);

        return back()->with('success', 'Form has been reset. Share the new link.');
    }

    /**
     * Representative (signed URL): render the fill / re-edit page.
     */
    public function fill(WalkthroughForm $form)
    {
        return Inertia::render('Walkthrough/Fill', [
            'data' => $this->service->buildFillPayload($form),
        ]);
    }

    public function submit(SubmitWalkthroughFormRequest $request, WalkthroughForm $form): RedirectResponse
    {
        if ($form->status === 'submitted') {
            return redirect()
                ->to($this->service->signedLink($form))
                ->with('error', 'This form has already been submitted and cannot be changed. Contact the property manager if you need a new link.');
        }

        $payload = json_decode($request->input('payload'), true) ?: [];
        $files = $request->file('files', []);

        $this->validateRequirements($form, $payload);

        $this->service->submit($form, $payload, is_array($files) ? $files : []);

        return redirect()
            ->to($this->service->signedLink($form))
            ->with('success', 'The form has been submitted. Thank you!');
    }

    private function validateRequirements(WalkthroughForm $form, array $payload): void
    {
        $settings = WalkthroughSetting::forKind($form->form_kind);

        if ($settings->require_signature) {
            $hasNew = ! empty($payload['signature_data']);
            $hasKept = ! empty($payload['signature_kept']);
            if (! $hasNew && ! $hasKept) {
                throw ValidationException::withMessages(['signature' => 'A signature is required to submit.']);
            }
        }
    }

    /**
     * Cascading city -> property -> unit data for the "new safety inspection" form.
     */
    private function unitDropdownData(): array
    {
        $cities = Cities::orderBy('city')->get(['id', 'city']);
        $properties = PropertyInfoWithoutInsurance::orderBy('property_name')->get(['id', 'property_name', 'city_id']);
        $units = Unit::orderBy('unit_name')->get(['id', 'unit_name', 'property_id']);

        return [
            'cities' => $cities,
            'propertiesByCityId' => $properties->groupBy('city_id')->map->values(),
            'unitsByPropertyId' => $units->groupBy('property_id')->map->values(),
        ];
    }
}
