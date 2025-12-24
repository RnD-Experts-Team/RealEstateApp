<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use App\Services\ApplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;

class ApplicationController extends Controller
{
    public function __construct(
        private ApplicationService $applicationService
    ) {
        $this->middleware('permission:applications.index')->only('index');
        $this->middleware('permission:applications.create')->only('create');
        $this->middleware('permission:applications.store')->only('store');
        $this->middleware('permission:applications.show')->only('show');
        $this->middleware('permission:applications.edit')->only('edit');
        $this->middleware('permission:applications.update')->only('update');
        $this->middleware('permission:applications.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
$filters = $request->only([
    'city', 'property', 'name', 'co_signer', 'unit', 'status',
    'applicant_applied_from', 'stage_in_progress', 'date_from', 'date_to',
    'is_hidden', 'per_page', 'page'
]);

$filters['is_hidden'] = $request->input('filter_is_hidden', $filters['is_hidden'] ?? false);        $filters['city'] = $request->input('filter_city', $filters['city'] ?? '');
        $filters['property'] = $request->input('filter_property', $filters['property'] ?? '');
        $filters['unit'] = $request->input('filter_unit', $filters['unit'] ?? '');
        $filters['name'] = $request->input('filter_name', $filters['name'] ?? '');
        $filters['applicant_applied_from'] = $request->input('filter_applicant_applied_from', $filters['applicant_applied_from'] ?? '');

        $applications = $this->applicationService->getAllPaginated($perPage, $filters);
        $statistics = $this->applicationService->getStatistics();

        // Transform applications to include display names and attachment info
        $applications->getCollection()->transform(function ($application) {
            $application->city = $application->unit->property->city->city ?? 'N/A';
            $application->property = $application->unit->property->property_name ?? 'N/A';
            $application->unit_name = $application->unit->unit_name ?? 'N/A';

            // Transform attachment data for frontend
            $application->attachments = $this->formatAttachments($application);

            return $application;
        });

        // Get hierarchical data for create/edit selectors
        $cities = Cities::orderBy('city')->get();
        $properties = PropertyInfoWithoutInsurance::with('city')->orderBy('property_name')->get();
        $units = Unit::with(['property.city'])->orderBy('unit_name')->get();

        // Create structured data for frontend
        $citiesData = $cities->map(function ($city) {
            return [
                'id' => $city->id,
                'name' => $city->city,
            ];
        });

        $propertiesData = $properties->groupBy('city_id')->map(function ($cityProperties, $cityId) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                    'city_id' => $property->city_id,
                ];
            })->values();
        });

        $unitsData = $units->groupBy('property_id')->map(function ($propertyUnits, $propertyId) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                    'property_id' => $unit->property_id,
                ];
            })->values();
        });

        // Build distinct names arrays for filters (only names, no duplication, not archived)
        $filterCities = $this->applicationService->getFilterCityNames();
        $filterProperties = $this->applicationService->getFilterPropertyNames();
        $filterUnits = $this->applicationService->getFilterUnitNames();

        return Inertia::render('Applications/Index', [
            'applications' => $applications,
            'statistics' => $statistics,
            'filters' => $filters,
            // Hierarchical data for create/edit drawers
            'cities' => $citiesData,
            'properties' => $propertiesData,
            'units' => $unitsData,
            // Flat names arrays for filter dropdowns
            'filterCities' => $filterCities,
            'filterProperties' => $filterProperties,
            'filterUnits' => $filterUnits,
        ]);
    }

    public function store(StoreApplicationRequest $request): RedirectResponse
    {
        try {
            // store
            $data = $request->validated();
            $data['attachments'] = $request->file('attachments', []); // ✅ always an array
            $this->applicationService->create($data);

            $preserve = [
                'city' => $request->input('filter_city'),
                'property' => $request->input('filter_property'),
                'unit' => $request->input('filter_unit'),
                'name' => $request->input('filter_name'),
                'applicant_applied_from' => $request->input('filter_applicant_applied_from'),
                'per_page' => $request->input('per_page', 15),
                'page' => $request->input('page', 1),
                'filter_is_hidden' => $request->input('filter_is_hidden'),
            ];

            return redirect()->route('applications.index', $preserve)
                ->with('success', 'Application created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create application: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function show(Request $request, string $id): Response
    {
        $application = $this->applicationService->findById((int) $id);

        // Add display names
        $application->city = $application->unit->property->city->city ?? 'N/A';
        $application->property = $application->unit->property->property_name ?? 'N/A';
        $application->unit_name = $application->unit->unit_name ?? 'N/A';

        // Format attachments for display
        $application->attachments = $this->formatAttachments($application);

        // Read filters from request to compute navigation and preserve context
        $filters = $request->only([
            'city',
            'property',
            'unit',
            'name',
            'co_signer',
            'status',
            'applicant_applied_from',
            'stage_in_progress',
            'date_from',
            'date_to',
            'is_hidden'
        ]);

        $adjacent = $this->applicationService->getAdjacentApplicationIds($filters, (int) $id);

        return Inertia::render('Applications/Show', [
            'application' => $application,
            'filters' => $filters,
            'prevId' => $adjacent['prev_id'],
            'nextId' => $adjacent['next_id'],
        ]);
    }

    public function update(UpdateApplicationRequest $request, string $id): RedirectResponse
    {
        try {
            $application = $this->applicationService->findById((int) $id);
            // update
            $data = $request->validated();
            $data['removed_attachment_indices'] = $request->input('removed_attachment_indices', []);
            $data['attachments'] = $request->file('attachments', []); // ✅
            $this->applicationService->update($application, $data);

            $preserve = [
                'city' => $request->input('filter_city'),
                'property' => $request->input('filter_property'),
                'unit' => $request->input('filter_unit'),
                'name' => $request->input('filter_name'),
                'applicant_applied_from' => $request->input('filter_applicant_applied_from'),
                'per_page' => $request->input('per_page', 15),
                'page' => $request->input('page', 1),
                'filter_is_hidden' => $request->input('filter_is_hidden'),
            ];

            return redirect()->route('applications.index', $preserve)
                ->with('success', 'Application updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update application: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $application = $this->applicationService->findById((int) $id);

            // Use soft delete (archive) instead of hard delete
            // Service will handle file cleanup
            $this->applicationService->delete($application);

            $preserve = [
                'city' => request()->input('filter_city'),
                'property' => request()->input('filter_property'),
                'unit' => request()->input('filter_unit'),
                'name' => request()->input('filter_name'),
                'applicant_applied_from' => request()->input('filter_applicant_applied_from'),
                'per_page' => request()->input('per_page', 15),
                'page' => request()->input('page', 1),
                'filter_is_hidden' => request()->input('filter_is_hidden'),
            ];

            return redirect()->route('applications.index', $preserve)
                ->with('success', 'Application archived successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to archive application: ' . $e->getMessage());
        }
    }

    public function downloadAttachment(string $id, int $index)
    {
        $application = $this->applicationService->findById((int) $id);

        $names = $application->attachment_name ?? [];
        $paths = $application->attachment_path ?? [];

        if (!isset($names[$index]) || !isset($paths[$index])) {
            abort(404, 'Attachment not found.');
        }

        $filePath = storage_path('app/public/' . $paths[$index]);

        if (!file_exists($filePath)) {
            abort(404, 'File not found.');
        }

        return response()->download($filePath, $names[$index]);
    }

    public function deleteAttachment(string $id, int $index): RedirectResponse
    {
        try {
            $application = $this->applicationService->findById((int) $id);

            $success = $this->applicationService->deleteAttachment($application, $index);

            if ($success) {
                return redirect()->back()
                    ->with('success', 'Attachment deleted successfully');
            }

            return redirect()->back()
                ->with('error', 'Attachment not found');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete attachment: ' . $e->getMessage());
        }
    }

    // API endpoints for dynamic loading
    public function getPropertiesByCity(Request $request): JsonResponse
    {
        $cityId = $request->get('city_id');

        $properties = PropertyInfoWithoutInsurance::where('city_id', $cityId)
            ->orderBy('property_name')
            ->get()
            ->map(function ($property) {
                return [
                    'id' => $property->id,
                    'name' => $property->property_name,
                ];
            });

        return response()->json($properties);
    }

    public function getUnitsByProperty(Request $request): JsonResponse
    {
        $propertyId = $request->get('property_id');

        $units = Unit::where('property_id', $propertyId)
            ->orderBy('unit_name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->unit_name,
                ];
            });

        return response()->json($units);
    }

    /**
     * Helper method to format attachments for frontend display
     */
    private function formatAttachments(Application $application): array
    {
        $names = $application->attachment_name ?? [];
        $paths = $application->attachment_path ?? [];
        $attachments = [];

        foreach ($names as $index => $name) {
            if (isset($paths[$index])) {
                $attachments[] = [
                    'index' => $index,
                    'name' => $name,
                    'path' => $paths[$index],
                    'url' => asset('storage/' . $paths[$index]),
                    'download_url' => route('applications.download', ['application' => $application->id, 'index' => $index]),
                ];
            }
        }

        return $attachments;
    }

    public function hide(Request $request, Application $application): RedirectResponse
{
    $this->applicationService->hideApplication($application);

    $preserve = [
        'city' => $request->input('filter_city'),
        'property' => $request->input('filter_property'),
        'unit' => $request->input('filter_unit'),
        'name' => $request->input('filter_name'),
        'applicant_applied_from' => $request->input('filter_applicant_applied_from'),
'is_hidden' => $request->input('is_hidden') ?? $request->input('filter_is_hidden'),
        'per_page' => $request->input('per_page', 15),
        'page' => $request->input('page', 1),
    ];

    return redirect()
        ->route('applications.index', $preserve)
        ->with('success', 'Application hidden.');
}

public function unhide(Request $request, Application $application): RedirectResponse
{
    $this->applicationService->unhideApplication($application);

    $preserve = [
        'city' => $request->input('filter_city'),
        'property' => $request->input('filter_property'),
        'unit' => $request->input('filter_unit'),
        'name' => $request->input('filter_name'),
        'applicant_applied_from' => $request->input('filter_applicant_applied_from'),
'is_hidden' => $request->input('is_hidden') ?? $request->input('filter_is_hidden'),
        'per_page' => $request->input('per_page', 15),
        'page' => $request->input('page', 1),
    ];

    return redirect()
        ->route('applications.index', $preserve)
        ->with('success', 'Application unhidden.');
}

}
