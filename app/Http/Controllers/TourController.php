<?php

namespace App\Http\Controllers;

use App\Services\TourService;
use App\Models\{Tour, Cities, PropertyInfoWithoutInsurance, Unit};
use App\Models\Representative;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;


class TourController extends Controller
{
    public function __construct(protected TourService $service)
    {
        $this->middleware('permission:tour.index')->only('index');
        $this->middleware('permission:tour.create')->only('storeTour');
        $this->middleware('permission:tour.edit')->only('updateTour');
        $this->middleware('permission:tour.destroy')->only('deleteTour');

        // rep permissions
        $this->middleware('permission:representative.create')->only('storeRep');
        $this->middleware('permission:representative.edit')->only('updateRep');
        $this->middleware('permission:representative.destroy')->only(['deleteRep', 'restoreRep']);
    }

    public function index(Request $request)
    {
        $filters = $request->only([
            'representative_id',
            'city_id',
            'property_id',
            'unit_id',
            'date',
            'is_hidden',
        ]);

        $tours = $this->service->list($filters, 20);
        $representatives = $this->service->allRepresentatives();

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

        return Inertia::render('Tours/Index', [
            'tours' => $tours,
            'filters' => $filters,
            'representatives' => $representatives,
            'cities' => $cities,
            'properties' => $properties,
            'units' => $units,
        ]);
    }

    // ====== Tours CRUD ======


    public function storeTour(Request $request)
    {
        $data = $request->validate([
            'unit_id' => ['required', 'exists:units,id'],
            'representative_id' => [
                'required',
                Rule::exists('representatives', 'id')->whereNull('deleted_at'),
            ],
            'prospect' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'date' => ['required', 'date'],
            'time' => ['required', 'date_format:H:i'],
            'note' => ['nullable', 'string'],
        ]);

        $this->service->createTour($data);

        return redirect()->back()->with('success', 'Tour created');
    }

    public function updateTour(Request $request, Tour $tour)
    {
        $data = $request->validate([
            'unit_id' => ['sometimes', 'exists:units,id'],
            'representative_id' => [
                'required',
                function ($attribute, $value, $fail) use ($tour) {
                    $rep = Representative::withTrashed()->find($value);

                    if (!$rep) {
                        $fail('The selected representative is invalid.');
                        return;
                    }

                    $isCurrentRepresentative = (int) $tour->representative_id === (int) $rep->id;
                    $isActiveRepresentative = is_null($rep->deleted_at);

                    if (!$isActiveRepresentative && !$isCurrentRepresentative) {
                        $fail('The selected representative is invalid.');
                    }
                },
            ],
            'prospect' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'date' => ['sometimes', 'date'],
            'time' => ['sometimes', 'date_format:H:i'],
            'note' => ['nullable', 'string'],
            'is_hidden' => ['boolean'],
        ]);

        $this->service->updateTour($tour, $data);

        return redirect()->back()->with('success', 'Tour updated');
    }

    public function hideTour(Tour $tour)
    {
        $this->service->hideTour($tour);
        return redirect()->back();
    }

    public function unhideTour(Tour $tour)
    {
        $this->service->unhideTour($tour);
        return redirect()->back();
    }

    public function deleteTour(Tour $tour)
    {
        $this->service->deleteTour($tour);
        return redirect()->back();
    }

    // ====== Representatives CRUD ======

    public function storeRep(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $this->service->createRepresentative($data);
        return redirect()->back();
    }

    public function updateRep(Request $request, Representative $representative)
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $this->service->updateRepresentative($representative, $data);
        return redirect()->back();
    }

    public function deleteRep(Representative $representative)
    {
        $this->service->deleteRepresentative($representative);
        return redirect()->back();
    }

    public function restoreRep(int $id)
    {
        $this->service->restoreRepresentative($id);
        return redirect()->back();
    }
}