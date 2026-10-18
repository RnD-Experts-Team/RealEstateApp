<?php

namespace App\Http\Controllers;

use App\Http\Requests\OffersAndRenewalRequest;
use App\Models\OffersAndRenewal;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use App\Services\OffersAndRenewalService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class OffersAndRenewalController extends Controller
{
    protected $service;

    public function __construct(OffersAndRenewalService $service)
    {
        $this->service = $service;

        $this->middleware('permission:offers-and-renewals.index')->only('index');
        $this->middleware('permission:offers-and-renewals.create')->only('create');
        $this->middleware('permission:offers-and-renewals.store')->only('store');
        $this->middleware('permission:offers-and-renewals.show')->only('show');
        $this->middleware('permission:offers-and-renewals.edit')->only('edit');
        $this->middleware('permission:offers-and-renewals.update')->only('update');
        $this->middleware('permission:offers-and-renewals.destroy')->only('destroy');
    }

    public function index(Request $request)
    {
        $filters = [
            'unit_id' => $request->get('unit_id'),
            'tenant_id' => $request->get('tenant_id'),
            'city_id' => $request->get('city_id'),
            'property_id' => $request->get('property_id'),
        ];

        $nameFilters = [
            'city_name' => $request->get('city_name'),
            'property_name' => $request->get('property_name'),
            'unit_name' => $request->get('unit_name'),
            'tenant_name' => $request->get('tenant_name'),
        ];

        $flagFilters = $this->flagFilters($request);

        $perPage = $request->get('per_page', 15);
        $page = (int) $request->get('page', 1);

        $offers = $this->service->getOffers($filters, $nameFilters, $perPage, $page, $flagFilters);

        // Transform offers data to include relationship data as direct properties
        if ($offers instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $offers->getCollection()->transform(function ($offer) {
                return [
                    'id' => $offer->id,
                    'tenant_id' => $offer->tenant_id,
                    'city_name' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property && $offer->tenant->unit->property->city
                        ? $offer->tenant->unit->property->city->city : null,
                    'property' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property
                        ? $offer->tenant->unit->property->property_name : null,
                    'unit' => $offer->tenant && $offer->tenant->unit ? $offer->tenant->unit->unit_name : null,
                    'tenant' => $offer->tenant ? $offer->tenant->full_name : null,
                    'date_sent_offer' => $offer->date_sent_offer,
                    'date_offer_expires' => $offer->date_offer_expires,
                    'status' => $offer->status,
                    'date_of_acceptance' => $offer->date_of_acceptance,
                    'last_notice_sent' => $offer->last_notice_sent,
                    'notice_kind' => $offer->notice_kind,
                    'lease_sent' => $offer->lease_sent,
                    'date_sent_lease' => $offer->date_sent_lease,
                    'lease_expires' => $offer->lease_expires,
                    'lease_signed' => $offer->lease_signed,
                    'date_signed' => $offer->date_signed,
                    'last_notice_sent_2' => $offer->last_notice_sent_2,
                    'notice_kind_2' => $offer->notice_kind_2,
                    'notes' => $offer->notes,
                    'how_many_days_left' => $offer->how_many_days_left,
                    'expired' => $offer->expired,
                    'other_tenants' => $offer->other_tenants,
                    'date_of_decline' => $offer->date_of_decline,
                    'is_archived' => $offer->is_archived,
                    'is_hidden' => (bool) $offer->is_hidden,
                    'created_at' => $offer->created_at,
                    'updated_at' => $offer->updated_at,
                ];
            });
        } else {
            $offers->transform(function ($offer) {
                return [
                    'id' => $offer->id,
                    'tenant_id' => $offer->tenant_id,
                    'city_name' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property && $offer->tenant->unit->property->city
                        ? $offer->tenant->unit->property->city->city : null,
                    'property' => $offer->tenant && $offer->tenant->unit && $offer->tenant->unit->property
                        ? $offer->tenant->unit->property->property_name : null,
                    'unit' => $offer->tenant && $offer->tenant->unit ? $offer->tenant->unit->unit_name : null,
                    'tenant' => $offer->tenant ? $offer->tenant->full_name : null,
                    'date_sent_offer' => $offer->date_sent_offer,
                    'date_offer_expires' => $offer->date_offer_expires,
                    'status' => $offer->status,
                    'date_of_acceptance' => $offer->date_of_acceptance,
                    'last_notice_sent' => $offer->last_notice_sent,
                    'notice_kind' => $offer->notice_kind,
                    'lease_sent' => $offer->lease_sent,
                    'date_sent_lease' => $offer->date_sent_lease,
                    'lease_expires' => $offer->lease_expires,
                    'lease_signed' => $offer->lease_signed,
                    'date_signed' => $offer->date_signed,
                    'last_notice_sent_2' => $offer->last_notice_sent_2,
                    'notice_kind_2' => $offer->notice_kind_2,
                    'notes' => $offer->notes,
                    'how_many_days_left' => $offer->how_many_days_left,
                    'expired' => $offer->expired,
                    'other_tenants' => $offer->other_tenants,
                    'date_of_decline' => $offer->date_of_decline,
                    'is_archived' => $offer->is_archived,
                    'is_hidden' => (bool) $offer->is_hidden,
                    'created_at' => $offer->created_at,
                    'updated_at' => $offer->updated_at,
                ];
            });
        }
        // Get dropdown data for the create/edit drawers
        $dropdownData = $this->service->getDropdownData();

        return Inertia::render('OffersAndRenewals/Index', [
            'offers' => $offers,
            'unit_id' => $filters['unit_id'],
            'tenant_id' => $filters['tenant_id'],
            'city_name' => $nameFilters['city_name'],
            'property_name' => $nameFilters['property_name'],
            'unit_name' => $nameFilters['unit_name'],
            'tenant_name' => $nameFilters['tenant_name'],
            'is_hidden' => $flagFilters['is_hidden'],
            'lease_filter' => $flagFilters['lease_signed'],
            'hierarchicalData' => $dropdownData['hierarchicalData'],
            'filterCityNames' => $dropdownData['filterCityNames'],
            'filterPropertyNames' => $dropdownData['filterPropertyNames'],
            'filterUnitNames' => $dropdownData['filterUnitNames'],
            'filterTenantNames' => $dropdownData['filterTenantNames'],
            'perPage' => $perPage,
            'page' => $page,
        ]);
    }

    public function store(OffersAndRenewalRequest $request)
    {
        $offer = $this->service->createOffer($request->validatedWithTenantId());

        $redirectParams = $this->redirectParams($request);

        return redirect()->route('offers_and_renewals.index', $redirectParams)
            ->with('success', 'Offer created successfully.');
    }

    public function show(OffersAndRenewal $offers_and_renewal)
    {
        $filters = [
            'unit_id' => request()->get('unit_id'),
            'tenant_id' => request()->get('tenant_id'),
            'city_id' => request()->get('city_id'),
            'property_id' => request()->get('property_id'),
        ];

        $nameFilters = [
            'city_name' => request()->get('city_name'),
            'property_name' => request()->get('property_name'),
            'unit_name' => request()->get('unit_name'),
            'tenant_name' => request()->get('tenant_name'),
        ];

        $flagFilters = $this->flagFilters(request());

        $perPage = request()->get('per_page');
        $page = request()->get('page');

        $offerWithRelations = $this->service->getOfferWithRelations($offers_and_renewal->id);

        $transformedOffer = [
            'id' => $offerWithRelations->id,
            'tenant_id' => $offerWithRelations->tenant_id,
            'city_name' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property && $offerWithRelations->tenant->unit->property->city
                ? $offerWithRelations->tenant->unit->property->city->city : null,
            'property' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit && $offerWithRelations->tenant->unit->property
                ? $offerWithRelations->tenant->unit->property->property_name : null,
            'unit' => $offerWithRelations->tenant && $offerWithRelations->tenant->unit ? $offerWithRelations->tenant->unit->unit_name : null,
            'tenant' => $offerWithRelations->tenant ? $offerWithRelations->tenant->full_name : null,
            'date_sent_offer' => $offerWithRelations->date_sent_offer,
            'date_offer_expires' => $offerWithRelations->date_offer_expires,
            'status' => $offerWithRelations->status,
            'date_of_acceptance' => $offerWithRelations->date_of_acceptance,
            'last_notice_sent' => $offerWithRelations->last_notice_sent,
            'notice_kind' => $offerWithRelations->notice_kind,
            'lease_sent' => $offerWithRelations->lease_sent,
            'date_sent_lease' => $offerWithRelations->date_sent_lease,
            'lease_expires' => $offerWithRelations->lease_expires,
            'lease_signed' => $offerWithRelations->lease_signed,
            'date_signed' => $offerWithRelations->date_signed,
            'last_notice_sent_2' => $offerWithRelations->last_notice_sent_2,
            'notice_kind_2' => $offerWithRelations->notice_kind_2,
            'notes' => $offerWithRelations->notes,
            'how_many_days_left' => $offerWithRelations->how_many_days_left,
            'expired' => $offerWithRelations->expired,
            'other_tenants' => $offerWithRelations->other_tenants,
            'date_of_decline' => $offerWithRelations->date_of_decline,
            'is_archived' => $offerWithRelations->is_archived,
            'is_hidden' => (bool) $offerWithRelations->is_hidden,
            'created_at' => $offerWithRelations->created_at,
            'updated_at' => $offerWithRelations->updated_at,
        ];

        $neighbors = $this->service->getNeighborOfferIds($filters, $nameFilters, $offers_and_renewal->id, $flagFilters);

        return Inertia::render('OffersAndRenewals/Show', [
            'offer' => $transformedOffer,
            'prevId' => $neighbors['prevId'],
            'nextId' => $neighbors['nextId'],
            'city_name' => $nameFilters['city_name'],
            'property_name' => $nameFilters['property_name'],
            'unit_name' => $nameFilters['unit_name'],
            'tenant_name' => $nameFilters['tenant_name'],
            'is_hidden' => $flagFilters['is_hidden'],
            'lease_filter' => $flagFilters['lease_signed'],
            'perPage' => $perPage,
            'page' => $page,
        ]);
    }

    public function update(OffersAndRenewalRequest $request, OffersAndRenewal $offers_and_renewal)
    {
        $offer = $this->service->updateOffer($offers_and_renewal, $request->validatedWithTenantId());

        $redirectParams = $this->redirectParams($request);

        return redirect()->route('offers_and_renewals.index', $redirectParams)
            ->with('success', 'Offer updated successfully.');
    }

    public function destroy(OffersAndRenewal $offers_and_renewal)
    {
        $this->service->deleteOffer($offers_and_renewal);

        $redirectParams = $this->redirectParams(request());

        return redirect()->route('offers_and_renewals.index', $redirectParams)
            ->with('success', 'Offer archived successfully.');
    }

    public function hide(Request $request, OffersAndRenewal $offers_and_renewal)
    {
        $this->service->hideOffer($offers_and_renewal);

        return redirect()->route('offers_and_renewals.index', $this->redirectParams($request))
            ->with('success', 'Offer hidden.');
    }

    public function unhide(Request $request, OffersAndRenewal $offers_and_renewal)
    {
        $this->service->unhideOffer($offers_and_renewal);

        return redirect()->route('offers_and_renewals.index', $this->redirectParams($request))
            ->with('success', 'Offer unhidden.');
    }

    /**
     * Visible/Hidden toggle and lease-signed filter (null = all, 'signed', 'unsigned')
     */
    private function flagFilters(Request $request): array
    {
        // Named lease_filter so it doesn't collide with the lease_signed form field on store/update
        $leaseFilter = $request->get('lease_filter');

        return [
            'is_hidden' => filter_var($request->get('is_hidden', false), FILTER_VALIDATE_BOOLEAN),
            'lease_signed' => in_array($leaseFilter, ['signed', 'unsigned'], true) ? $leaseFilter : null,
        ];
    }

    /**
     * Filters and pagination to keep when redirecting back to the index
     */
    private function redirectParams(Request $request): array
    {
        return array_filter([
            'city_name' => $request->input('city_name'),
            'property_name' => $request->input('property_name'),
            'unit_name' => $request->input('unit_name'),
            'tenant_name' => $request->input('tenant_name'),
            'is_hidden' => $request->input('is_hidden'),
            'lease_filter' => $request->input('lease_filter'),
            'per_page' => $request->input('per_page'),
            'page' => $request->input('page'),
        ], function ($v) {
            return $v !== null && $v !== '';
        });
    }

    /**
     * API endpoint to get properties by city
     */
    public function getPropertiesByCity(Cities $city)
    {
        $properties = $city->propertiesWithoutInsurance()
            ->select('id', 'property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name
                ];
            });

        return response()->json($properties);
    }

    /**
     * API endpoint to get units by property
     */
    public function getUnitsByProperty(PropertyInfoWithoutInsurance $property)
    {
        $units = $property->units()
            ->select('id', 'unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name
                ];
            });

        return response()->json($units);
    }

    /**
     * API endpoint to get tenants by unit
     */
    public function getTenantsByUnit(Unit $unit)
    {
        $tenants = Tenant::where('unit_id', $unit->id)
            ->select('id', 'first_name', 'last_name')
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'name' => $tenant->first_name . ' ' . $tenant->last_name,
                    'first_name' => $tenant->first_name,
                    'last_name' => $tenant->last_name
                ];
            });

        return response()->json($tenants);
    }
}
