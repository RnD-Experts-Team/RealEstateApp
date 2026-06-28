<?php

namespace App\Http\Controllers;

use App\Http\Requests\OwnerSignRequest;
use App\Http\Requests\StoreAgreementRequest;
use App\Http\Requests\UpdateAgreementRequest;
use App\Models\Agreement;
use App\Models\AgreementType;
use App\Services\AgreementService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AgreementController extends Controller
{
    protected AgreementService $service;

    public function __construct(AgreementService $service)
    {
        $this->service = $service;

        $this->middleware('permission:agreements.index')->only(['index', 'pdf']);
        $this->middleware('permission:agreements.create')->only('store');
        $this->middleware('permission:agreements.update')->only(['edit', 'update', 'generateLink', 'agentSign']);
        $this->middleware('permission:agreements.destroy')->only('destroy');
    }

    public function index()
    {
        $rows = Agreement::orderBy('created_at', 'desc')->get()->map(fn (Agreement $a) => [
            'id' => $a->id,
            'token' => $a->token,
            'reference' => $a->reference,
            'type_name' => $a->type_name,
            'status' => $a->status,
            'owner_signed_at' => optional($a->owner_signed_at)->toDateString(),
            'agent_signed_at' => optional($a->agent_signed_at)->toDateString(),
            'created_at' => optional($a->created_at)->toDateString(),
            'sign_url' => $this->service->signedLink($a),
            'edit_url' => route('agreements.edit', $a->token),
            'pdf_url' => route('agreements.pdf', $a->token),
        ]);

        return Inertia::render('Agreements/Index', [
            'agreements' => $rows,
            'types' => AgreementType::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreAgreementRequest $request): RedirectResponse
    {
        $type = AgreementType::findOrFail($request->validated()['agreement_type_id']);
        $agreement = $this->service->createFromType($type, $request->validated()['reference'] ?? '');

        return redirect()->route('agreements.edit', $agreement->token)->with('success', 'Agreement created.');
    }

    public function edit(Agreement $agreement)
    {
        $agreement->load(['clauses', 'fields']);

        return Inertia::render('Agreements/Edit', [
            'agreement' => [
                'id' => $agreement->id,
                'token' => $agreement->token,
                'reference' => $agreement->reference,
                'type_name' => $agreement->type_name,
                'status' => $agreement->status,
                'owner_name' => $agreement->owner_name,
                'owner_signature_url' => $agreement->owner_signature_url,
                'owner_signed_at' => optional($agreement->owner_signed_at)->toDateTimeString(),
                'agent_signature_url' => $agreement->agent_signature_url,
                'agent_signed_at' => optional($agreement->agent_signed_at)->toDateTimeString(),
                'clauses' => $agreement->clauses,
                'fields' => $agreement->fields,
            ],
            'rendered' => $this->service->render($agreement),
            'owner_link' => $this->service->signedLink($agreement),
        ]);
    }

    public function update(UpdateAgreementRequest $request, Agreement $agreement): RedirectResponse
    {
        $data = $request->validated();

        if (array_key_exists('reference', $data) && ! $agreement->owner_signed_at) {
            $agreement->update(['reference' => $data['reference']]);
        }

        $this->service->updateData($agreement, $data['fields'] ?? [], $data['selections'] ?? []);

        return back()->with('success', 'Agreement saved.');
    }

    public function destroy(Agreement $agreement): RedirectResponse
    {
        $agreement->archive();

        return redirect()->route('agreements.index')->with('success', 'Agreement removed.');
    }

    public function generateLink(Agreement $agreement): RedirectResponse
    {
        if ($agreement->status === 'draft') {
            $agreement->update(['status' => 'sent']);
        }

        return back()->with('success', 'Owner signing link is ready to share.');
    }

    public function agentSign(Request $request, Agreement $agreement): RedirectResponse
    {
        $request->validate(['signature_data' => ['required', 'string']]);
        $this->service->agentSign($agreement, $request->input('signature_data'));

        return back()->with('success', 'Agent signature captured.');
    }

    public function pdf(Agreement $agreement)
    {
        $pdf = Pdf::loadView('pdf.agreement', ['data' => $this->service->pdfData($agreement)]);

        return $pdf->download('agreement-' . $agreement->id . '.pdf');
    }

    /**
     * Owner-facing (signed URL): render the finished agreement read-only + signature pad.
     */
    public function sign(Agreement $agreement)
    {
        return Inertia::render('Agreement/Sign', [
            'data' => [
                'token' => $agreement->token,
                'reference' => $agreement->reference,
                'type_name' => $agreement->type_name,
                'status' => $agreement->status,
                'owner_name' => $agreement->owner_name,
                'owner_signature_url' => $agreement->owner_signature_url,
                'owner_signed_at' => optional($agreement->owner_signed_at)->toDateTimeString(),
                'clauses' => $this->service->render($agreement),
            ],
            'submit_url' => \Illuminate\Support\Facades\URL::signedRoute('agreement.submit-signature', ['agreement' => $agreement->token]),
        ]);
    }

    public function submitSignature(OwnerSignRequest $request, Agreement $agreement): RedirectResponse
    {
        $this->service->ownerSign($agreement, $request->input('signature_data'), $request->input('owner_name'));

        return redirect()->to($this->service->signedLink($agreement))->with('success', 'Thank you — your agreement has been signed.');
    }
}
