<?php
// app/Http/Controllers/PropertyInfoController.php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyInfoRequest;
use App\Http\Requests\UpdatePropertyInfoRequest;
use App\Models\InsuranceRepresentative;
use App\Services\PropertyInfoService;
use App\Services\PropertyInfoWithoutInsuranceService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class PropertyInfoController extends Controller
{
    public function __construct(
        private PropertyInfoService $propertyInfoService,
        private PropertyInfoWithoutInsuranceService $propertyInfoWithoutInsuranceService
    ) {
        $this->middleware('permission:properties.index')->only('index');
        $this->middleware('permission:properties.store')->only('store');
        $this->middleware('permission:properties.show')->only('show');
        $this->middleware('permission:properties.update')->only('update');
        $this->middleware('permission:properties.destroy')->only('destroy');
    }

    /**
     * Display the index page with paginated and filtered property info records.
     * This page supports dynamic pagination and filtering from the frontend.
     *
     * @param Request $request HTTP request containing pagination and filter parameters
     * @return Response Inertia response rendering the index page
     */
    public function index(Request $request): Response
    {
        // Get per_page value from request (supports '15', '30', '50', 'all')
        // Keep as string to allow service to resolve 'all' consistently like Payments
        $perPageParam = $request->get('per_page', '15');


        // Extract filter parameters from request
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        // Update all property statuses before displaying
        $this->propertyInfoService->updateAllStatuses();

        // Get paginated properties with filters applied
        $properties = $this->propertyInfoService->getAllPaginated($perPageParam, $filters);

        // Get statistics for dashboard display
        $statistics = $this->propertyInfoService->getStatistics();

        // Get cities for filter dropdown
        $cities = $this->propertyInfoWithoutInsuranceService->getAllCities();

        // Get available properties (those without insurance) for selection
        $availableProperties = $this->propertyInfoWithoutInsuranceService->getAvailableProperties();

        // Get all insurance representatives (including soft-deleted)
        $representatives = InsuranceRepresentative::withTrashed()->orderBy('name')->get();

        return Inertia::render('Properties/Index', [
            'properties' => $properties,
            'statistics' => $statistics,
            // Include per_page in filters to allow frontend to show the selected option ('all' etc.)
            'filters' => array_merge($filters, ['per_page' => $perPageParam]),
            'cities' => $cities,
            'availableProperties' => $availableProperties,
            'representatives' => $representatives,
        ]);
    }

    /**
     * Store a newly created property info record.
     * After successful creation, redirects back to index with preserved pagination and filters.
     *
     * @param StorePropertyInfoRequest $request Validated request data
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function store(StorePropertyInfoRequest $request): RedirectResponse
    {
        try {
            $data = $request->validated();
            $data['attachments'] = $request->file('attachments', []);
            $this->propertyInfoService->create($data);

            // Redirect to index with preserved filters/pagination from namespaced POST keys
            return redirect()->route('properties-info.index', $this->indexRedirectParams($request))
                ->with('success', 'Property created successfully');
        } catch (\Exception $e) {
            // On error, redirect back to the same page with input preserved
            return redirect()->back()
                ->with('error', 'Failed to create property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified property info record.
     * Also provides next and previous record IDs for navigation based on applied filters.
     *
     * @param int $id Property info ID
     * @param Request $request HTTP request containing filter parameters
     * @return Response Inertia response rendering the show page
     */
    public function show(int $id, Request $request): Response
    {
        // Find the property by ID
        $property = $this->propertyInfoService->findById($id);

        // Get filters from the request (same filters used in the index page)
        $filters = $request->only(['property_name', 'insurance_company_name', 'policy_number', 'status']);

        // Get next and previous IDs based on the current ID and applied filters
        // This allows the user to navigate through filtered results in the show page
        $navigation = $this->propertyInfoService->getNextPreviousIds($id, $filters);

        return Inertia::render('Properties/Show', [
            'property' => $property,
            'next_id' => $navigation['next_id'],      // ID of the next record (null if at end)
            'previous_id' => $navigation['previous_id'], // ID of the previous record (null if at start)
            'filters' => $filters,  // Pass filters so they can be included in navigation links
        ]);
    }

    /**
     * Update the specified property info record.
     * After successful update, redirects back to index with preserved pagination and filters.
     *
     * @param UpdatePropertyInfoRequest $request Validated request data
     * @param int $id Property info ID
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function update(UpdatePropertyInfoRequest $request, int $id): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $data = $request->validated();
            $data['attachments'] = $request->file('attachments', []);
            $data['delete_attachment_ids'] = $request->input('delete_attachment_ids', []);
            $this->propertyInfoService->update($property, $data);

            // Redirect to index with preserved filters/pagination from namespaced POST keys
            return redirect()->route('properties-info.index', $this->indexRedirectParams($request))
                ->with('success', 'Property updated successfully');
        } catch (\Exception $e) {
            // On error, redirect back with input and query parameters preserved
            return redirect()->back()
                ->with('error', 'Failed to update property: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Delete (archive) the specified property info record.
     * After successful deletion, redirects back to index with preserved pagination and filters.
     *
     * @param int $id Property info ID
     * @param Request $request HTTP request containing query parameters
     * @return RedirectResponse Redirect to index page with query parameters preserved
     */
    public function destroy(int $id, Request $request): RedirectResponse
    {
        try {
            $property = $this->propertyInfoService->findById($id);
            $this->propertyInfoService->delete($property);

            // Redirect back to index with preserved filters/pagination
            // Read namespaced DELETE params and normalize via indexRedirectParams
            return redirect()
                ->route('properties-info.index', $this->indexRedirectParams($request))
                ->with('success', 'Property deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete property: ' . $e->getMessage());
        }
    }

    /**
     * Collect filters and pagination params to persist on redirects.
     * Mirrors Payments controller behavior to avoid collisions during POST/PUT.
     */
    private function indexRedirectParams(Request $request): array
    {
        $params = [];

        // For create/update (POST/PUT), read namespaced filter_* keys to avoid
        // colliding with form fields.
        if ($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('delete')) {
            $map = [
                'filter_property_name' => 'property_name',
                'filter_insurance_company_name' => 'insurance_company_name',
                'filter_policy_number' => 'policy_number',
                'filter_status' => 'status',
                'filter_per_page' => 'per_page',
                'filter_page' => 'page',
            ];
            foreach ($map as $from => $to) {
                if ($request->has($from)) {
                    $params[$to] = $request->input($from);
                }
            }
        } else {
            // For GET redirects, read normal keys
            $keys = ['property_name', 'insurance_company_name', 'policy_number', 'status', 'per_page', 'page'];
            foreach ($keys as $key) {
                if ($request->has($key)) {
                    $params[$key] = $request->input($key);
                }
            }
        }

        return $params;
    }

    // ====== Insurance Representatives CRUD ======

    public function storeRep(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        InsuranceRepresentative::create($data);
        return redirect()->back();
    }

    public function updateRep(Request $request, InsuranceRepresentative $rep): RedirectResponse
    {
        $data = $request->validate(['name' => 'required|string|max:255']);
        $rep->update($data);
        return redirect()->back();
    }

    public function deleteRep(InsuranceRepresentative $rep): RedirectResponse
    {
        $rep->delete();
        return redirect()->back();
    }

    public function restoreRep(int $id): RedirectResponse
    {
        InsuranceRepresentative::withTrashed()->findOrFail($id)->restore();
        return redirect()->back();
    }
}
