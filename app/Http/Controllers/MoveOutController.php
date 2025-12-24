<?php

namespace App\Http\Controllers;

use App\Models\MoveOut;
use App\Services\MoveOutService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MoveOutController extends Controller
{
    public function __construct(
        protected MoveOutService $moveOutService
    ) {
        $this->middleware('permission:move-out.index')->only('index');
        $this->middleware('permission:move-out.create')->only('create');
        $this->middleware('permission:move-out.store')->only('store');
        $this->middleware('permission:move-out.show')->only('show');
        $this->middleware('permission:move-out.edit')->only('edit');
        $this->middleware('permission:move-out.update')->only('update');
        $this->middleware('permission:move-out.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPageInput = $request->input('perPage');
        $perPage = 15;
        if (is_string($perPageInput)) {
            $val = strtolower(trim($perPageInput));
            if ($val === 'all') {
                $perPage = 'all';
            } elseif (in_array($val, ['15', '30', '50'], true)) {
                $perPage = (int) $val;
            }
        }

        // ✅ include is_hidden
        $filters = [
            'unit' => ($u = $request->input('unit')) && is_string($u) ? trim($u) : null,
            'city' => ($c = $request->input('city')) && is_string($c) ? trim($c) : null,
            'property' => ($p = $request->input('property')) && is_string($p) ? trim($p) : null,
            'is_hidden' => $request->input('is_hidden'),
        ];

        // ✅ determine if any filter is active (including is_hidden)
        $hasFilters = false;
        foreach ($filters as $key => $value) {
            if ($key === 'is_hidden') {
                if ($value !== null && $value !== '') $hasFilters = true;
            } else {
                if (!empty($value)) $hasFilters = true;
            }
        }

        $moveOutsRaw = $hasFilters
            ? $this->moveOutService->searchMoveOutsWithFilters($filters, $perPage)
            : $this->moveOutService->getAllMoveOuts($perPage, $filters);

        // Transform move-outs data to include relationship data as direct properties
        if ($moveOutsRaw instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $moveOutsRaw->getCollection()->transform(function ($moveOut) {
                return [
                    'id' => $moveOut->id,
                    'unit_id' => $moveOut->unit_id,
                    'unit_name' => $moveOut->unit ? $moveOut->unit->unit_name : null,
                    'property_name' => $moveOut->unit && $moveOut->unit->property
                        ? $moveOut->unit->property->property_name : null,
                    'city_name' => $moveOut->unit && $moveOut->unit->property && $moveOut->unit->property->city
                        ? $moveOut->unit->property->city->city : null,

                    'move_out_date' => $moveOut->move_out_date?->format('Y-m-d'),
                    'lease_status' => $moveOut->lease_status,
                    'date_lease_ending_on_buildium' => $moveOut->date_lease_ending_on_buildium?->format('Y-m-d'),
                    'keys_location' => $moveOut->keys_location,
                    'utilities_under_our_name' => $moveOut->utilities_under_our_name,
                    'date_utility_put_under_our_name' => $moveOut->date_utility_put_under_our_name?->format('Y-m-d'),
                    'walkthrough' => $moveOut->walkthrough,
                    'all_the_devices_are_off' => $moveOut->all_the_devices_are_off,
                    'repairs' => $moveOut->repairs,
                    'send_back_security_deposit' => $moveOut->send_back_security_deposit,
                    'notes' => $moveOut->notes,
                    'cleaning' => $moveOut->cleaning,
                    'list_the_unit' => $moveOut->list_the_unit,
                    'renter' => $moveOut->renter,
                    'move_out_form' => $moveOut->move_out_form,
                    'tenants' => $moveOut->tenants,
                    'utility_type' => $moveOut->utility_type,

                    // ✅ NEW
                    'is_hidden' => (bool) $moveOut->is_hidden,

                    'created_at' => $moveOut->created_at,
                    'updated_at' => $moveOut->updated_at,
                ];
            });

            $arr = $moveOutsRaw->toArray();
            $moveOuts = [
                'data' => $arr['data'] ?? [],
                'links' => $arr['links'] ?? [],
                'meta' => [
                    'from' => $arr['from'] ?? 0,
                    'to' => $arr['to'] ?? 0,
                    'total' => $arr['total'] ?? 0,
                    'current_page' => $arr['current_page'] ?? 1,
                    'last_page' => $arr['last_page'] ?? 1,
                    'per_page' => $arr['per_page'] ?? count($arr['data'] ?? []),
                ],
            ];
        } else {
            $data = $moveOutsRaw->map(function ($moveOut) {
                return [
                    'id' => $moveOut->id,
                    'unit_id' => $moveOut->unit_id,
                    'unit_name' => $moveOut->unit ? $moveOut->unit->unit_name : null,
                    'property_name' => $moveOut->unit && $moveOut->unit->property
                        ? $moveOut->unit->property->property_name : null,
                    'city_name' => $moveOut->unit && $moveOut->unit->property && $moveOut->unit->property->city
                        ? $moveOut->unit->property->city->city : null,

                    'move_out_date' => $moveOut->move_out_date?->format('Y-m-d'),
                    'lease_status' => $moveOut->lease_status,
                    'date_lease_ending_on_buildium' => $moveOut->date_lease_ending_on_buildium?->format('Y-m-d'),
                    'keys_location' => $moveOut->keys_location,
                    'utilities_under_our_name' => $moveOut->utilities_under_our_name,
                    'date_utility_put_under_our_name' => $moveOut->date_utility_put_under_our_name?->format('Y-m-d'),
                    'walkthrough' => $moveOut->walkthrough,
                    'all_the_devices_are_off' => $moveOut->all_the_devices_are_off,
                    'repairs' => $moveOut->repairs,
                    'send_back_security_deposit' => $moveOut->send_back_security_deposit,
                    'notes' => $moveOut->notes,
                    'cleaning' => $moveOut->cleaning,
                    'list_the_unit' => $moveOut->list_the_unit,
                    'renter' => $moveOut->renter,
                    'move_out_form' => $moveOut->move_out_form,
                    'tenants' => $moveOut->tenants,
                    'utility_type' => $moveOut->utility_type,

                    // ✅ NEW
                    'is_hidden' => (bool) $moveOut->is_hidden,

                    'created_at' => $moveOut->created_at,
                    'updated_at' => $moveOut->updated_at,
                ];
            })->values();

            $total = $data->count();
            $moveOuts = [
                'data' => $data,
                'links' => [],
                'meta' => [
                    'from' => $total > 0 ? 1 : 0,
                    'to' => $total,
                    'total' => $total,
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $total,
                ],
            ];
        }

        $dropdownData = $this->moveOutService->getDropdownData();

        return Inertia::render('MoveOut/Index', [
            'moveOuts' => $moveOuts,

            // ✅ NEW: send filters object to frontend (same idea as MoveIn)
            'filters' => [
                'city' => $filters['city'],
                'property' => $filters['property'],
                'unit' => $filters['unit'],
                'is_hidden' => $filters['is_hidden'],
            ],

            'unit' => $filters['unit'],
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'propertiesByCityId' => $dropdownData['propertiesByCityId'],
            'unitsByPropertyId' => $dropdownData['unitsByPropertyId'],
            'tenantsByUnitId' => $dropdownData['tenantsByUnitId'],
            'allUnits' => $dropdownData['allUnits'],
            'tenantsData' => $dropdownData['tenantsData'],
            'filterCities' => $dropdownData['filterCities'],
            'filterProperties' => $dropdownData['filterProperties'],
            'filterUnits' => $dropdownData['filterUnits'],
            'perPage' => is_string($perPage) ? $perPage : (string) $perPage,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validatedData = $request->validate([
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'move_out_date' => 'nullable|date',
            'lease_status' => 'nullable|string|max:255',
            'date_lease_ending_on_buildium' => 'nullable|date',
            'keys_location' => 'nullable|string|max:255',
            'utilities_under_our_name' => 'nullable|in:Yes,No',
            'date_utility_put_under_our_name' => 'nullable|date',
            'walkthrough' => 'nullable|string',
            'all_the_devices_are_off' => 'nullable|in:Yes,No',
            'repairs' => 'nullable|string',
            'send_back_security_deposit' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cleaning' => 'nullable|in:cleaned,uncleaned',
            'list_the_unit' => 'nullable|string|max:255',
            'renter' => 'nullable|in:Yes,No',
            'move_out_form' => 'nullable|in:filled,not filled',
            'tenants' => 'nullable|string|max:255',
            'utility_type' => 'nullable|string',
        ]);

        $this->moveOutService->createMoveOut($validatedData);

        $redirectParams = [];
        $city = $request->input('redirect_city');
        $property = $request->input('redirect_property');
        $unit = $request->input('redirect_unit');
        $page = $request->input('redirect_page');
        $perPage = $request->input('redirect_perPage');

        // ✅ NEW (keep hidden state after create, if you want)
        $isHidden = $request->input('redirect_is_hidden');

        if (!empty($city)) $redirectParams['city'] = $city;
        if (!empty($property)) $redirectParams['property'] = $property;
        if (!empty($unit)) $redirectParams['unit'] = $unit;
        if (!empty($page)) $redirectParams['page'] = $page;
        if (!empty($perPage)) $redirectParams['perPage'] = $perPage;
        if ($isHidden !== null && $isHidden !== '') $redirectParams['is_hidden'] = $isHidden;

        return redirect()
            ->route('move-out.index', $redirectParams)
            ->with('success', 'Move-out record created successfully.');
    }

    public function show(Request $request, MoveOut $moveOut): Response
    {
        $moveOutWithRelations = $this->moveOutService->getMoveOutWithRelations($moveOut->id);

        $transformedMoveOut = [
            'id' => $moveOutWithRelations->id,
            'unit_id' => $moveOutWithRelations->unit_id,
            'unit_name' => $moveOutWithRelations->unit ? $moveOutWithRelations->unit->unit_name : null,
            'property_name' => $moveOutWithRelations->unit && $moveOutWithRelations->unit->property
                ? $moveOutWithRelations->unit->property->property_name : null,
            'city_name' => $moveOutWithRelations->unit && $moveOutWithRelations->unit->property && $moveOutWithRelations->unit->property->city
                ? $moveOutWithRelations->unit->property->city->city : null,
            'move_out_date' => $moveOutWithRelations->move_out_date?->format('Y-m-d'),
            'lease_status' => $moveOutWithRelations->lease_status,
            'date_lease_ending_on_buildium' => $moveOutWithRelations->date_lease_ending_on_buildium?->format('Y-m-d'),
            'keys_location' => $moveOutWithRelations->keys_location,
            'utilities_under_our_name' => $moveOutWithRelations->utilities_under_our_name,
            'date_utility_put_under_our_name' => $moveOutWithRelations->date_utility_put_under_our_name?->format('Y-m-d'),
            'walkthrough' => $moveOutWithRelations->walkthrough,
            'all_the_devices_are_off' => $moveOutWithRelations->all_the_devices_are_off,
            'repairs' => $moveOutWithRelations->repairs,
            'send_back_security_deposit' => $moveOutWithRelations->send_back_security_deposit,
            'notes' => $moveOutWithRelations->notes,
            'cleaning' => $moveOutWithRelations->cleaning,
            'list_the_unit' => $moveOutWithRelations->list_the_unit,
            'renter' => $moveOutWithRelations->renter,
            'move_out_form' => $moveOutWithRelations->move_out_form,
            'tenants' => $moveOutWithRelations->tenants,
            'utility_type' => $moveOutWithRelations->utility_type,

            // ✅ NEW
            'is_hidden' => (bool) $moveOutWithRelations->is_hidden,

            'created_at' => $moveOutWithRelations->created_at,
            'updated_at' => $moveOutWithRelations->updated_at,
        ];

        $filters = [
            'unit' => ($u = $request->input('unit')) && is_string($u) ? trim($u) : null,
            'city' => ($c = $request->input('city')) && is_string($c) ? trim($c) : null,
            'property' => ($p = $request->input('property')) && is_string($p) ? trim($p) : null,
            'is_hidden' => $request->input('is_hidden'),
        ];

        $adjacent = $this->moveOutService->getAdjacentMoveOutIds($moveOut->id, $filters);

        $perPageInput = $request->input('perPage');
        $perPage = '15';
        if (is_string($perPageInput)) {
            $val = strtolower(trim($perPageInput));
            if ($val === 'all') {
                $perPage = 'all';
            } elseif (in_array($val, ['15', '30', '50'], true)) {
                $perPage = (string)((int)$val);
            }
        }

        return Inertia::render('MoveOut/Show', [
            'moveOut' => $transformedMoveOut,
            'filters' => $filters,
            'prevId' => $adjacent['prevId'] ?? null,
            'nextId' => $adjacent['nextId'] ?? null,
            'perPage' => $perPage,
        ]);
    }

    public function update(Request $request, MoveOut $moveOut): RedirectResponse
    {
        $validatedData = $request->validate([
            'unit_id' => 'sometimes|nullable|integer|exists:units,id',
            'move_out_date' => 'nullable|date',
            'lease_status' => 'nullable|string|max:255',
            'date_lease_ending_on_buildium' => 'nullable|date',
            'keys_location' => 'nullable|string|max:255',
            'utilities_under_our_name' => 'nullable|in:Yes,No',
            'date_utility_put_under_our_name' => 'nullable|date',
            'walkthrough' => 'nullable|string',
            'all_the_devices_are_off' => 'nullable|in:Yes,No',
            'repairs' => 'nullable|string',
            'send_back_security_deposit' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'cleaning' => 'nullable|in:cleaned,uncleaned',
            'list_the_unit' => 'nullable|string|max:255',
            'renter' => 'nullable|in:Yes,No',
            'move_out_form' => 'nullable|in:filled,not filled',
            'tenants' => 'nullable|string|max:255',
            'utility_type' => 'nullable|string',
        ]);

        $this->moveOutService->updateMoveOut($moveOut, $validatedData);

        $redirectParams = [];
        $city = $request->input('redirect_city');
        $property = $request->input('redirect_property');
        $unit = $request->input('redirect_unit');
        $page = $request->input('redirect_page');
        $perPage = $request->input('redirect_perPage');

        // ✅ NEW (keep hidden state after update, if you want)
        $isHidden = $request->input('redirect_is_hidden');

        if (!empty($city)) $redirectParams['city'] = $city;
        if (!empty($property)) $redirectParams['property'] = $property;
        if (!empty($unit)) $redirectParams['unit'] = $unit;
        if (!empty($page)) $redirectParams['page'] = $page;
        if (!empty($perPage)) $redirectParams['perPage'] = $perPage;
        if ($isHidden !== null && $isHidden !== '') $redirectParams['is_hidden'] = $isHidden;

        return redirect()
            ->route('move-out.index', $redirectParams)
            ->with('success', 'Move-out record updated successfully.');
    }

    public function destroy(MoveOut $moveOut): RedirectResponse
    {
        $this->moveOutService->deleteMoveOut($moveOut);

        $redirectParams = [];
        $city = request()->input('redirect_city');
        $property = request()->input('redirect_property');
        $unit = request()->input('redirect_unit');
        $page = request()->input('redirect_page');
        $perPage = request()->input('redirect_perPage');

        // ✅ NEW
        $isHidden = request()->input('redirect_is_hidden');

        if (!empty($city)) $redirectParams['city'] = $city;
        if (!empty($property)) $redirectParams['property'] = $property;
        if (!empty($unit)) $redirectParams['unit'] = $unit;
        if (!empty($page)) $redirectParams['page'] = $page;
        if (!empty($perPage)) $redirectParams['perPage'] = $perPage;
        if ($isHidden !== null && $isHidden !== '') $redirectParams['is_hidden'] = $isHidden;

        return redirect()
            ->route('move-out.index', $redirectParams)
            ->with('success', 'Move-out record deleted successfully.');
    }

    // ✅ NEW: Hide/Unhide
    public function hide(Request $request, MoveOut $moveOut): RedirectResponse
    {
        $this->moveOutService->hideMoveOut($moveOut);

        $params = [];
        foreach (['city', 'property', 'unit', 'is_hidden', 'perPage', 'page'] as $key) {
            $value = $request->query($key);
            if ($value !== null && $value !== '') $params[$key] = $value;
        }

        return redirect()->route('move-out.index', $params)->with('success', 'Move-out hidden.');
    }

    public function unhide(Request $request, MoveOut $moveOut): RedirectResponse
    {
        $this->moveOutService->unhideMoveOut($moveOut);

        $params = [];
        foreach (['city', 'property', 'unit', 'is_hidden', 'perPage', 'page'] as $key) {
            $value = $request->query($key);
            if ($value !== null && $value !== '') $params[$key] = $value;
        }

        return redirect()->route('move-out.index', $params)->with('success', 'Move-out unhidden.');
    }
}
