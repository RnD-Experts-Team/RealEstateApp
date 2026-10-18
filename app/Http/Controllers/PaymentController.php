<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Http\Requests\UpdatePaymentRequest;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {
        $this->middleware('permission:payments.index')->only('index');
        $this->middleware('permission:payments.create')->only('create');
        $this->middleware('permission:payments.store')->only('store');
        $this->middleware('permission:payments.show')->only('show');
        $this->middleware('permission:payments.edit')->only('edit');
        $this->middleware('permission:payments.update')->only('update');
        $this->middleware('permission:payments.destroy')->only('destroy');
        // Optionally secure these if you have permissions defined:
        // $this->middleware('permission:payments.hide')->only('hide');
        // $this->middleware('permission:payments.unhide')->only('unhide');
    }

    public function index(Request $request): Response
    {
        $search = $request->get('search');
        $cityFilter = $request->get('city');
        $propertyFilter = $request->get('property');
        $unitFilter = $request->get('unit');
        $permanentFilter = $request->get('permanent') ? explode(',', $request->get('permanent')) : null;
        $isHiddenFilter = $request->get('is_hidden') === 'true';
        $remindFilter = $this->booleanFilter($request, 'remind');
        $addedToLedgerFilter = $this->booleanFilter($request, 'added_to_ledger');
        $perPageParam = $request->get('per_page', '15'); // '15' | '30' | '50' | 'all'

        // Update all payment statuses before displaying
        $this->paymentService->updateAllStatuses();

        // Handle filtering
        $hasFlagFilter = $remindFilter !== null || $addedToLedgerFilter !== null;
        if ($permanentFilter || $isHiddenFilter || $hasFlagFilter || $cityFilter || $propertyFilter || $unitFilter) {
            $payments = $this->paymentService->filterPayments(
                $permanentFilter,
                $isHiddenFilter,
                $cityFilter,
                $propertyFilter,
                $unitFilter,
                $perPageParam,
                $remindFilter,
                $addedToLedgerFilter
            );
        } elseif ($search) {
            $payments = $this->paymentService->searchPayments($search, $perPageParam);
        } else {
            $payments = $this->paymentService->getAllPayments($perPageParam);
        }

        // Transform payments to include relationship data for the frontend
        $payments->getCollection()->transform(function ($payment) {
            return [
                'id' => $payment->id,
                'date' => $payment->date,
                'unit_id' => $payment->unit_id,
                'owes' => $payment->owes,
                'paid' => $payment->paid ?? 0,
                'left_to_pay' => $payment->left_to_pay,
                'status' => $payment->status,
                'notes' => $payment->notes,
                'reversed_payments' => $payment->reversed_payments,
                'permanent' => $payment->permanent,
                'is_archived' => $payment->is_archived,
                'has_assistance' => $payment->has_assistance,
                'assistance_amount' => $payment->assistance_amount ?? 0,
                'assistance_company' => $payment->assistance_company,
                'is_hidden' => $payment->is_hidden,
                'remind' => $payment->remind,
                'added_to_ledger' => $payment->added_to_ledger,
                'created_at' => $payment->created_at,
                'updated_at' => $payment->updated_at,
                'city' => $payment->unit && $payment->unit->property && $payment->unit->property->city
                    ? $payment->unit->property->city->city : 'N/A',
                'property_name' => $payment->unit && $payment->unit->property
                    ? $payment->unit->property->property_name : 'N/A',
                'unit_name' => $payment->unit ? $payment->unit->unit_name : 'N/A',
            ];
        });

        $dropdownData = $this->paymentService->getUnitsForDropdowns();

        $allCities = $this->paymentService->getAllCities();
        $allProperties = $this->paymentService->getAllProperties();

        // $statistics = $this->paymentService->getStatistics();

        return Inertia::render('Payments/Index', [
            'payments' => $payments,
            'search' => $search,
            'filters' => [
                'city' => $cityFilter,
                'property' => $propertyFilter,
                'unit' => $unitFilter,
                'permanent' => $permanentFilter,
                'is_hidden' => $isHiddenFilter,
                'remind' => $remindFilter,
                'added_to_ledger' => $addedToLedgerFilter,
                'per_page' => $perPageParam,
            ],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'units' => $dropdownData['units'],
            'allCities' => $allCities,
            'allProperties' => $allProperties,
            // 'statistics' => $statistics,
        ]);
    }

    public function store(StorePaymentRequest $request): RedirectResponse
    {
        $this->paymentService->createPayment($request->validated());

        return redirect()
            ->route('payments.index', $this->indexRedirectParams($request))
            ->with('success', 'Payment created successfully.');
    }

    public function show(Request $request, Payment $payment): Response
    {
        $payment->load(['unit.property.city']);

        $paymentData = [
            'id' => $payment->id,
            'date' => $payment->date,
            'unit_id' => $payment->unit_id,
            'owes' => $payment->owes,
            'paid' => $payment->paid ?? 0,
            'left_to_pay' => $payment->left_to_pay,
            'status' => $payment->status,
            'notes' => $payment->notes,
            'reversed_payments' => $payment->reversed_payments,
            'permanent' => $payment->permanent,
            'is_archived' => $payment->is_archived,
            'has_assistance' => $payment->has_assistance,
            'assistance_amount' => $payment->assistance_amount ?? 0,
            'assistance_company' => $payment->assistance_company,
            'is_hidden' => $payment->is_hidden,
            'remind' => $payment->remind,
            'added_to_ledger' => $payment->added_to_ledger,
            'created_at' => $payment->created_at,
            'updated_at' => $payment->updated_at,
            'city' => $payment->unit && $payment->unit->property && $payment->unit->property->city
                ? $payment->unit->property->city->city : 'N/A',
            'property_name' => $payment->unit && $payment->unit->property
                ? $payment->unit->property->property_name : 'N/A',
            'unit_name' => $payment->unit ? $payment->unit->unit_name : 'N/A',
        ];

        // Read filters from query (used for computing neighbors and preserving context)
        $cityFilter = $request->get('city');
        $propertyFilter = $request->get('property');
        $unitFilter = $request->get('unit');
        $permanentFilter = $request->get('permanent') ? explode(',', $request->get('permanent')) : null;
        $isHiddenParam = $request->get('is_hidden');
        $isHiddenFilter = in_array(strtolower((string)$isHiddenParam), ['true', '1', 'yes'], true);
        $remindFilter = $this->booleanFilter($request, 'remind');
        $addedToLedgerFilter = $this->booleanFilter($request, 'added_to_ledger');

        // Compute neighbors within filtered set (ignoring pagination)
        $orderedIds = $this->paymentService->getFilteredOrderedPaymentIds(
            $permanentFilter,
            $isHiddenFilter,
            $cityFilter,
            $propertyFilter,
            $unitFilter,
            $remindFilter,
            $addedToLedgerFilter
        );

        $prevId = null;
        $nextId = null;
        if (!empty($orderedIds)) {
            $index = array_search($payment->id, $orderedIds, true);
            if ($index !== false) {
                // Previous = item before current in the sorted list
                if ($index > 0) {
                    $prevId = $orderedIds[$index - 1];
                }
                // Next = item after current in the sorted list
                if ($index < (count($orderedIds) - 1)) {
                    $nextId = $orderedIds[$index + 1];
                }
            }
        }

        return Inertia::render('Payments/Show', [
            'payment' => $paymentData,
            'prevPaymentId' => $prevId,
            'nextPaymentId' => $nextId,
            'filters' => [
                'city' => $cityFilter,
                'property' => $propertyFilter,
                'unit' => $unitFilter,
                'permanent' => $permanentFilter,
                'is_hidden' => $isHiddenFilter,
                'remind' => $remindFilter,
                'added_to_ledger' => $addedToLedgerFilter,
            ],
        ]);
    }

    public function update(UpdatePaymentRequest $request, Payment $payment): RedirectResponse
    {
        $this->paymentService->updatePayment($payment, $request->validated());

        return redirect()
            ->route('payments.index', $this->indexRedirectParams($request))
            ->with('success', 'Payment updated successfully.');
    }

    public function destroy(Request $request, Payment $payment): RedirectResponse
    {
        $this->paymentService->deletePayment($payment);

        return redirect()
            ->route('payments.index', $this->indexRedirectParams($request))
            ->with('success', 'Payment deleted successfully.');
    }

    /**
     * Hide a payment (set is_hidden to true)
     */
    public function hide(Request $request, Payment $payment): RedirectResponse
    {
        $this->paymentService->hidePayment($payment);

        return redirect()
            ->route('payments.index', $this->indexRedirectParams($request))
            ->with('success', 'Payment hidden.');
    }

    /**
     * Unhide a payment (set is_hidden to false)
     */
    public function unhide(Request $request, Payment $payment): RedirectResponse
    {
        $this->paymentService->unhidePayment($payment);

        return redirect()
            ->route('payments.index', $this->indexRedirectParams($request))
            ->with('success', 'Payment unhidden successfully.');
    }

    /**
     * Collect filters and pagination params to persist on redirects.
     */
    private function indexRedirectParams(Request $request): array
    {
        $params = [];

        // For create/update (POST/PUT), only read namespaced filter_* keys to avoid
        // colliding with form fields like 'permanent'. For other methods, read normal keys.
        if ($request->isMethod('post') || $request->isMethod('put')) {
            $map = [
                'filter_city' => 'city',
                'filter_property' => 'property',
                'filter_unit' => 'unit',
                'filter_permanent' => 'permanent',
                'filter_is_hidden' => 'is_hidden',
                'filter_remind' => 'remind',
                'filter_added_to_ledger' => 'added_to_ledger',
                'filter_per_page' => 'per_page',
                'filter_page' => 'page',
            ];
            foreach ($map as $from => $to) {
                if ($request->has($from)) {
                    $params[$to] = $request->input($from);
                }
            }
        } else {
            $keys = ['city', 'property', 'unit', 'permanent', 'is_hidden', 'remind', 'added_to_ledger', 'per_page', 'page'];
            foreach ($keys as $key) {
                if ($request->has($key)) {
                    $params[$key] = $request->input($key);
                }
            }
        }

        return $params;
    }

    /**
     * Read a Yes/No filter from the query: null when absent or invalid (= all), otherwise true/false.
     */
    private function booleanFilter(Request $request, string $key): ?bool
    {
        $value = $request->get($key);
        if ($value === null || $value === '') {
            return null;
        }

        return filter_var($value, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    }
}
