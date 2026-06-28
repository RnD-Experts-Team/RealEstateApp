<?php

namespace App\Http\Controllers;

use App\Http\Requests\AgreementClauseOptionRequest;
use App\Http\Requests\AgreementClauseRequest;
use App\Http\Requests\AgreementTypeRequest;
use App\Http\Requests\AgreementVariableRequest;
use App\Models\AgreementClause;
use App\Models\AgreementClauseOption;
use App\Models\AgreementType;
use App\Models\AgreementVariable;
use App\Services\AgreementTypeService;
use Inertia\Inertia;

class AgreementTypeController extends Controller
{
    protected AgreementTypeService $service;

    public function __construct(AgreementTypeService $service)
    {
        $this->service = $service;

        $this->middleware('permission:agreement-types.index')->only(['index', 'edit']);
        $this->middleware('permission:agreement-types.update')->only([
            'store', 'update', 'destroy',
            'storeClause', 'updateClause', 'destroyClause',
            'storeOption', 'updateOption', 'destroyOption',
            'storeVariable', 'updateVariable', 'destroyVariable',
        ]);
    }

    public function index()
    {
        return Inertia::render('AgreementTypes/Index', [
            'types' => $this->service->listTypes(),
        ]);
    }

    public function edit(AgreementType $agreementType)
    {
        return Inertia::render('AgreementTypes/Edit', [
            'type' => $this->service->getForEdit($agreementType),
        ]);
    }

    public function store(AgreementTypeRequest $request)
    {
        $type = $this->service->createType($request->validated());

        return redirect()->route('agreement-types.edit', $type->id)->with('success', 'Agreement type created.');
    }

    public function update(AgreementTypeRequest $request, AgreementType $agreementType)
    {
        $this->service->updateType($agreementType, $request->validated());

        return back()->with('success', 'Agreement type updated.');
    }

    public function destroy(AgreementType $agreementType)
    {
        $this->service->archiveType($agreementType);

        return redirect()->route('agreement-types.index')->with('success', 'Agreement type removed.');
    }

    public function storeClause(AgreementClauseRequest $request)
    {
        $type = AgreementType::findOrFail($request->validated()['agreement_type_id']);
        $this->service->createClause($type, $request->validated());

        return back()->with('success', 'Clause added.');
    }

    public function updateClause(AgreementClauseRequest $request, AgreementClause $clause)
    {
        $this->service->updateClause($clause, $request->validated());

        return back()->with('success', 'Clause updated.');
    }

    public function destroyClause(AgreementClause $clause)
    {
        $this->service->archiveClause($clause);

        return back()->with('success', 'Clause removed.');
    }

    public function storeOption(AgreementClauseOptionRequest $request)
    {
        $clause = AgreementClause::findOrFail($request->validated()['agreement_clause_id']);
        $this->service->createOption($clause, $request->validated());

        return back()->with('success', 'Option added.');
    }

    public function updateOption(AgreementClauseOptionRequest $request, AgreementClauseOption $option)
    {
        $this->service->updateOption($option, $request->validated());

        return back()->with('success', 'Option updated.');
    }

    public function destroyOption(AgreementClauseOption $option)
    {
        $this->service->archiveOption($option);

        return back()->with('success', 'Option removed.');
    }

    public function storeVariable(AgreementVariableRequest $request)
    {
        $type = AgreementType::findOrFail($request->validated()['agreement_type_id']);
        $this->service->createVariable($type, $request->validated());

        return back()->with('success', 'Field added.');
    }

    public function updateVariable(AgreementVariableRequest $request, AgreementVariable $variable)
    {
        $this->service->updateVariable($variable, $request->validated());

        return back()->with('success', 'Field updated.');
    }

    public function destroyVariable(AgreementVariable $variable)
    {
        $this->service->archiveVariable($variable);

        return back()->with('success', 'Field removed.');
    }
}
