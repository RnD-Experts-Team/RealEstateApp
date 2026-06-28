<?php

namespace App\Http\Controllers;

use App\Http\Requests\SubmitInspectionFormRequest;
use App\Models\InspectionForm;
use App\Models\InspectionSetting;
use App\Services\InspectionFormService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class InspectionFormController extends Controller
{
    protected InspectionFormService $service;

    public function __construct(InspectionFormService $service)
    {
        $this->service = $service;

        $this->middleware('permission:inspection-forms.manage')->only(['generate', 'show', 'pdf', 'reset']);
    }

    /**
     * Staff action: ensure a form exists for a Move-In / Move-Out entry.
     * Redirects back; the originating index re-renders with the new link.
     */
    public function generate(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'form_type' => ['required', 'in:move_in,move_out'],
            'reference_id' => ['required', 'integer'],
        ]);

        $this->service->getOrCreateFor($data['form_type'], (int) $data['reference_id']);

        return back()->with('success', 'Inspection link is ready to share.');
    }

    /**
     * Staff: read-only view of a filled (or pending) form.
     */
    public function show(InspectionForm $form)
    {
        return Inertia::render('Inspection/Show', [
            'data' => $this->service->buildFillPayload($form),
        ]);
    }

    /**
     * Staff: download the filled form as a PDF.
     */
    public function pdf(InspectionForm $form)
    {
        $data = $this->service->pdfData($form);

        $pdf = Pdf::loadView('pdf.inspection', ['data' => $data]);
        $name = 'inspection-' . $form->form_type . '-' . $form->id . '.pdf';

        return $pdf->download($name);
    }

    /**
     * Staff: reset a submitted form and rotate its token.
     * The old signed URL becomes invalid; a new link must be shared with the tenant.
     */
    public function reset(InspectionForm $form): RedirectResponse
    {
        $this->service->reset($form);

        return back()->with('success', 'Inspection link has been reset. Share the new link with the tenant.');
    }

    /**
     * Tenant (signed URL): render the fill / re-edit page.
     */
    public function fill(InspectionForm $form)
    {
        return Inertia::render('Inspection/Fill', [
            'data' => $this->service->buildFillPayload($form),
        ]);
    }

    /**
     * Tenant (signed URL): persist the submission.
     */
    public function submit(SubmitInspectionFormRequest $request, InspectionForm $form): RedirectResponse
    {
        if ($form->status === 'submitted') {
            return redirect()
                ->to($this->service->signedLink($form))
                ->with('error', 'This form has already been submitted and cannot be changed. Contact the property manager if you need a new link.');
        }

        $payload = json_decode($request->input('payload'), true) ?: [];
        $files = $request->file('files', []);

        $this->validateRequirements($payload, $files);

        $this->service->submit($form, $payload, is_array($files) ? $files : []);

        return redirect()
            ->to($this->service->signedLink($form))
            ->with('success', 'Your inspection form has been submitted. Thank you!');
    }

    /**
     * Enforce settings-driven requirements (acknowledgment / signature / video).
     */
    private function validateRequirements(array $payload, $files): void
    {
        $settings = InspectionSetting::current();
        $errors = [];

        if ($settings->require_acknowledgment && empty($payload['acknowledged'])) {
            $errors['acknowledged'] = 'You must accept the acknowledgment to submit.';
        }

        if ($settings->require_signature) {
            $hasNewSignature = ! empty($payload['signature_data']);
            $hasKeptSignature = ! empty($payload['signature_kept']);
            if (! $hasNewSignature && ! $hasKeptSignature) {
                $errors['signature'] = 'A signature is required to submit.';
            }
        }

        if ($settings->require_video) {
            $hasKeptVideo = ! empty($payload['video_kept_attachment_ids']);
            $hasNewVideo = collect(is_array($files) ? array_keys($files) : [])
                ->contains(fn ($slot) => $slot === 'video' || str_starts_with((string) $slot, 'video_'));
            if (! $hasKeptVideo && ! $hasNewVideo) {
                $errors['video'] = 'A walkthrough video is required to submit.';
            }
        }

        if (! empty($errors)) {
            throw ValidationException::withMessages($errors);
        }
    }
}
