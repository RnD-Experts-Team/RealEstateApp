<?php

namespace App\Http\Controllers;

use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use App\Models\UnitPayment;
use App\Services\UnitPaymentService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UnitPaymentController extends Controller
{
    public function __construct(protected UnitPaymentService $service)
    {
        $this->middleware('permission:unit-payment.index')->only('index');
        $this->middleware('permission:unit-payment.create')->only('store');
        $this->middleware('permission:unit-payment.edit')->only('update');
        $this->middleware('permission:unit-payment.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'city_id',
            'property_id',
            'unit_id',
            'type',
            'date',
            'is_hidden',
        ]);

        $payments = $this->service->list($filters, 20);

        $cities = Cities::select('id', 'city')
            ->orderBy('city')
            ->get();

        $properties = PropertyInfoWithoutInsurance::with('city')
            ->select('id', 'property_name', 'city_id')
            ->orderBy('property_name')
            ->get();

        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get();

        return Inertia::render('UnitPayments/Index', [
            'payments' => $payments,
            'filters' => $filters,
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
            'types' => ['Checks', 'Credit Card', 'Zelle'],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'type' => ['required', Rule::in(['Checks', 'Credit Card', 'Zelle'])],
            'amount' => ['required', 'numeric', 'min:0'],
            'date' => ['required', 'date'],
            'to_whom' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order_id' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn() => $request->input('type') === 'Credit Card'),
            ],
        ]);

        if ($data['type'] !== 'Credit Card') {
            $data['order_id'] = null;
        }

        $this->service->create($data);

        return redirect()->back()->with('success', 'Payment created');
    }

    public function update(Request $request, UnitPayment $unitPayment)
    {
        $data = $request->validate([
            'unit_id' => ['sometimes', 'exists:units,id'],
            'type' => ['sometimes', Rule::in(['Checks', 'Credit Card', 'Zelle'])],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'date' => ['sometimes', 'date'],
            'to_whom' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'order_id' => [
                'nullable',
                'string',
                'max:255',
                Rule::requiredIf(fn() => ($request->input('type', $unitPayment->type) === 'Credit Card')),
            ],
            'is_hidden' => ['boolean'],
        ]);

        $resolvedType = $data['type'] ?? $unitPayment->type;
        if ($resolvedType !== 'Credit Card') {
            $data['order_id'] = null;
        }

        $this->service->update($unitPayment, $data);

        return redirect()->back()->with('success', 'Payment updated');
    }

    public function hide(UnitPayment $unitPayment)
    {
        $this->service->hide($unitPayment);
        return redirect()->back();
    }

    public function unhide(UnitPayment $unitPayment)
    {
        $this->service->unhide($unitPayment);
        return redirect()->back();
    }

    public function destroy(UnitPayment $unitPayment)
    {
        $this->service->delete($unitPayment);
        return redirect()->back();
    }
}