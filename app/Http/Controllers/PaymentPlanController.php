<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaymentPlanStoreRequest;
use App\Http\Requests\PaymentPlanUpdateRequest;
use App\Models\PaymentPlan;
use App\Services\PaymentPlanService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class PaymentPlanController extends Controller
{
    protected $paymentPlanService;

    public function __construct(PaymentPlanService $paymentPlanService)
    {
        $this->paymentPlanService = $paymentPlanService;

        $this->middleware('permission:payment-plans.index')->only('index');
        $this->middleware('permission:payment-plans.create')->only('create');
        $this->middleware('permission:payment-plans.store')->only('store');
        $this->middleware('permission:payment-plans.show')->only('show');
        $this->middleware('permission:payment-plans.edit')->only('edit');
        $this->middleware('permission:payment-plans.update')->only('update');
        $this->middleware('permission:payment-plans.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        $search = $request->get('search');
        // Name-based filters from request
        $city = $request->get('city');
        $property = $request->get('property');
        $unit = $request->get('unit');
        $tenant = $request->get('tenant');
        $perPageParam = $request->get('per_page', 15);
        $perPage = is_numeric($perPageParam) ? (int) $perPageParam : ($perPageParam === 'all' ? 'all' : 15);
$isHidden = filter_var($request->get('is_hidden', false), FILTER_VALIDATE_BOOLEAN);

        // Decide which dataset to retrieve based on filters/search
        if ($city || $property || $unit || $tenant) {
    $paymentPlans = $this->paymentPlanService
        ->filterPaymentPlansByNames($city, $property, $unit, $tenant, $perPage, $isHidden);
} else {
    $paymentPlans = $this->paymentPlanService
        ->getAllPaymentPlans($perPage, $isHidden);
}

        // Transform the data to include the user-friendly names
        $paymentPlans->getCollection()->transform(function ($plan) {
            return [
                'id' => $plan->id,
                'tenant_id' => $plan->tenant_id,
                'tenant' => $plan->tenant ? $plan->tenant->full_name : 'N/A',
                'unit' => $plan->tenant && $plan->tenant->unit ? $plan->tenant->unit->unit_name : 'N/A',
                'property' => $plan->tenant && $plan->tenant->unit && $plan->tenant->unit->property ? $plan->tenant->unit->property->property_name : 'N/A',
                'city_name' => $plan->tenant && $plan->tenant->unit && $plan->tenant->unit->property && $plan->tenant->unit->property->city ? $plan->tenant->unit->property->city->city : 'N/A',
                'amount' => $plan->amount,
                'paid' => $plan->paid,
                'left_to_pay' => $plan->left_to_pay,
                'status' => $plan->status,
                'dates' => $plan->dates,
                'notes' => $plan->notes,
                'is_hidden' => (bool) $plan->is_hidden,
                'created_at' => $plan->created_at,
                'updated_at' => $plan->updated_at,
            ];
        });
            
        $dropdownData = $this->paymentPlanService->getDropdownData();

        return Inertia::render('PaymentPlans/Index', [
            'paymentPlans' => $paymentPlans,
            'search' => $search,
            'filters' => [
                'city' => $city,
                'property' => $property,
                'unit' => $unit,
                'tenant' => $tenant,
                'is_hidden' => $isHidden,
            ],
            'perPage' => $perPageParam,
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
        ]);
    }

    public function store(PaymentPlanStoreRequest $request)
    {
        $this->paymentPlanService->createPaymentPlan($request->validated());

        // Preserve filters, search, pagination and per-page after redirect
        $queryParams = array_filter([
            'search' => $request->input('search'),
            'city' => $request->input('city'),
            'property' => $request->input('property'),
            'unit' => $request->input('unit'),
            'tenant' => $request->input('tenant'),
            'is_hidden' => $request->input('is_hidden'),
            'per_page' => $request->input('per_page'),
            'page' => $request->input('page'),
        ], fn($v) => !is_null($v) && $v !== '');

        return redirect()->route('payment-plans.index', $queryParams)
            ->with('success', 'Payment plan created successfully.');
    }

    public function show($id)
    {
        $paymentPlan = $this->paymentPlanService->getPaymentPlan($id);

        // Preserve filter/search/pagination context coming from index
        $search = request()->get('search');
        $city = request()->get('city');
        $property = request()->get('property');
        $unit = request()->get('unit');
        $tenant = request()->get('tenant');
        $perPageParam = request()->get('per_page', 15);
        $pageParam = request()->get('page');
$isHidden = filter_var(request()->get('is_hidden', false), FILTER_VALIDATE_BOOLEAN);
        // Compute adjacent record IDs based on filters and index ordering
        $adjacent = $this->paymentPlanService->getAdjacentPaymentPlanIds($paymentPlan->id, $city, $property, $unit, $tenant,$isHidden);

        // Transform the data to include user-friendly names
        $transformedPlan = [
            'id' => $paymentPlan->id,
            'tenant_id' => $paymentPlan->tenant_id,
            'tenant' => $paymentPlan->tenant ? $paymentPlan->tenant->full_name : 'N/A',
            'unit' => $paymentPlan->tenant && $paymentPlan->tenant->unit ? $paymentPlan->tenant->unit->unit_name : 'N/A',
            'property' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property ? $paymentPlan->tenant->unit->property->property_name : 'N/A',
            'city_name' => $paymentPlan->tenant && $paymentPlan->tenant->unit && $paymentPlan->tenant->unit->property && $paymentPlan->tenant->unit->property->city ? $paymentPlan->tenant->unit->property->city->city : 'N/A',
            'amount' => $paymentPlan->amount,
            'paid' => $paymentPlan->paid,
            'left_to_pay' => $paymentPlan->left_to_pay,
            'status' => $paymentPlan->status,
            'dates' => $paymentPlan->dates,
            'notes' => $paymentPlan->notes,
            'is_hidden' => (bool) $paymentPlan->is_hidden,
            'created_at' => $paymentPlan->created_at,
            'updated_at' => $paymentPlan->updated_at,
        ];

        return Inertia::render('PaymentPlans/Show', [
            'paymentPlan' => $transformedPlan,
            'prevId' => $adjacent['prev'],
            'nextId' => $adjacent['next'],
            'filters' => [
                'city' => $city,
                'property' => $property,
                'unit' => $unit,
                'tenant' => $tenant,
                'is_hidden' => $isHidden,
            ],
            'search' => $search,
            'perPage' => $perPageParam,
            'page' => $pageParam,
        ]);
    }

    public function update(PaymentPlanUpdateRequest $request, PaymentPlan $payment_plan)
    {
        $this->paymentPlanService->updatePaymentPlan($payment_plan->id, $request->validated());

        // Preserve filters, search, pagination and per-page after redirect
        $queryParams = array_filter([
            'search' => $request->input('search'),
            'city' => $request->input('city'),
            'property' => $request->input('property'),
            'unit' => $request->input('unit'),
            'tenant' => $request->input('tenant'),
            'per_page' => $request->input('per_page'),
            'page' => $request->input('page'),
            'is_hidden' => $request->input('is_hidden'),
        ], fn($v) => !is_null($v) && $v !== '');

        return redirect()->route('payment-plans.index', $queryParams)
            ->with('success', 'Payment plan updated successfully.');
    }

    public function destroy(Request $request, $id)
    {
        $this->paymentPlanService->deletePaymentPlan($id);

        // Preserve filters, search, pagination and per-page after redirect
        $queryParams = array_filter([
            'search' => $request->input('search'),
            'city' => $request->input('city'),
            'property' => $request->input('property'),
            'unit' => $request->input('unit'),
            'tenant' => $request->input('tenant'),
            'per_page' => $request->input('per_page'),
            'page' => $request->input('page'),
            'is_hidden' => $request->input('is_hidden'),
        ], fn($v) => !is_null($v) && $v !== '');

        return redirect()->route('payment-plans.index', $queryParams)
            ->with('success', 'Payment plan deleted successfully.');
    }

    public function getTenants()
    {
        $tenants = $this->paymentPlanService->getTenantsForDropdown();
        
        return response()->json($tenants);
    }

    public function hide(Request $request, PaymentPlan $payment_plan): RedirectResponse
{
    $this->paymentPlanService->hidePaymentPlan($payment_plan);

    $queryParams = array_filter([
        'search' => $request->input('search'),
        'city' => $request->input('city'),
        'property' => $request->input('property'),
        'unit' => $request->input('unit'),
        'tenant' => $request->input('tenant'),
        'is_hidden' => $request->input('is_hidden'), // keep current tab
        'per_page' => $request->input('per_page'),
        'page' => $request->input('page'),
    ], fn($v) => !is_null($v) && $v !== '');

    return redirect()->route('payment-plans.index', $queryParams)
        ->with('success', 'Payment plan hidden.');
}

public function unhide(Request $request, PaymentPlan $payment_plan): RedirectResponse
{
    $this->paymentPlanService->unhidePaymentPlan($payment_plan);

    $queryParams = array_filter([
        'search' => $request->input('search'),
        'city' => $request->input('city'),
        'property' => $request->input('property'),
        'unit' => $request->input('unit'),
        'tenant' => $request->input('tenant'),
        'is_hidden' => $request->input('is_hidden'), // keep current tab
        'per_page' => $request->input('per_page'),
        'page' => $request->input('page'),
    ], fn($v) => !is_null($v) && $v !== '');

    return redirect()->route('payment-plans.index', $queryParams)
        ->with('success', 'Payment plan unhidden.');
}
}
