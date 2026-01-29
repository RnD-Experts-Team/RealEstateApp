<?php
// app/Http/Controllers/UnitController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUnitRequest;
use App\Http\Requests\UpdateUnitRequest;
use App\Http\Requests\ImportUnitsRequest;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Services\UnitService;
use App\Services\UnitImportService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class UnitController extends Controller
{
    public function __construct(
        private UnitService $unitService,
        private UnitImportService $unitImportService
    ) {
        $this->middleware('permission:units.index')->only('index');
        $this->middleware('permission:units.create')->only('create');
        $this->middleware('permission:units.store')->only('store');
        $this->middleware('permission:units.show')->only('show');
        $this->middleware('permission:units.edit')->only('edit');
        $this->middleware('permission:units.update')->only('update');
        $this->middleware('permission:units.destroy')->only('destroy');
        // $this->middleware('permission:units.import')->only(['showImport', 'import']);
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'property', 'unit_name', 'vacant', 'listed', 'insurance', 'is_new_lease']);

        // Normalize 'all' options from frontend selects to be treated as no filter
        foreach (['vacant', 'listed', 'is_new_lease'] as $key) {
            if (array_key_exists($key, $filters) && is_string($filters[$key]) && strtolower($filters[$key]) === 'all') {
                unset($filters[$key]);
            }
        }
        
        $unitsResult = $this->unitService->getAllPaginated($perPage, $filters);
        $statistics = $this->unitService->getStatistics();

        // Transform units data and build a consistent response structure
        if ($unitsResult instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            // Paginated
            $transformedUnits = $unitsResult->toArray();
            $transformedUnits['data'] = array_map(function ($unit) {
                return array_merge($unit, [
                    'city' => $unit['property']['city']['city'] ?? 'Unknown',
                    'property' => $unit['property']['property_name'] ?? 'Unknown'
                ]);
            }, $transformedUnits['data']);
        } else {
            // 'All' (no pagination): build a pseudo-paginated structure for frontend consistency
            $data = $unitsResult->map(function ($unit) {
                return array_merge($unit->toArray(), [
                    'city' => $unit->property->city->city ?? 'Unknown',
                    'property' => $unit->property->property_name ?? 'Unknown'
                ]);
            })->toArray();

            $count = $unitsResult->count();
            $transformedUnits = [
                'data' => $data,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => is_string($perPage) ? $perPage : $count,
                'total' => $count,
                'from' => $count > 0 ? 1 : 0,
                'to' => $count,
                'links' => [],
            ];
        }

        // Get cities data for drawer component
        $cities = Cities::all();

        // Get properties data for filter dropdown
        $properties = PropertyInfoWithoutInsurance::with('city')->get();

        return Inertia::render('Units/Index', [
            'units' => $transformedUnits,
            'statistics' => $statistics,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
            'cities' => $cities,
            'properties' => $properties,
        ]);
    }

    public function store(StoreUnitRequest $request): RedirectResponse
    {
        try {
          
            
            $this->unitService->create($request->validated());

            // Preserve filters and pagination by redirecting with query parameters
            $redirect = $request->input('redirect', []);
            $filters = (array)($redirect['filters'] ?? []);
            $perPage = $redirect['per_page'] ?? null;
            $page = $redirect['page'] ?? null;

            // Build query while dropping null/empty values
            $query = array_filter(array_merge($filters, [
                'per_page' => $perPage,
                'page' => $page,
            ]), function ($value) {
                return !is_null($value) && $value !== '';
            });

            return redirect()->route('units.index', $query)
                ->with('success', 'Unit created successfully');
        } catch (\Exception $e) {
            \Log::error('UnitController::store - Error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            
            return redirect()->back()
                ->with('error', 'Failed to create unit: ' . $e->getMessage())
                ->withInput();
        }
    }
    
    public function update(UpdateUnitRequest $request, string $id): RedirectResponse
    {
        try {
            $unit = $this->unitService->findById((int) $id);
            $this->unitService->update($unit, $request->validated());

            // Preserve filters and pagination by redirecting with query parameters
            $redirect = $request->input('redirect', []);
            $filters = (array)($redirect['filters'] ?? []);
            $perPage = $redirect['per_page'] ?? null;
            $page = $redirect['page'] ?? null;

            $query = array_filter(array_merge($filters, [
                'per_page' => $perPage,
                'page' => $page,
            ]), function ($value) {
                return !is_null($value) && $value !== '';
            });

            return redirect()->route('units.index', $query)
                ->with('success', 'Unit updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update unit: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $unit = $this->unitService->findById((int) $id);
            $this->unitService->delete($unit);

            // Preserve filters and pagination by redirecting with query parameters
            $redirect = request()->input('redirect', []);
            $filters = (array)($redirect['filters'] ?? []);
            $perPage = $redirect['per_page'] ?? null;
            $page = $redirect['page'] ?? null;

            $query = array_filter(array_merge($filters, [
                'per_page' => $perPage,
                'page' => $page,
            ]), function ($value) {
                return !is_null($value) && $value !== '';
            });

            return redirect()->route('units.index', $query)
                ->with('success', 'Unit deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete unit: ' . $e->getMessage());
        }
    }

    public function vacant(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'property', 'unit_name', 'listed', 'insurance', 'is_new_lease']);

        // Force vacant filter to 'Yes'
        $filters['vacant'] = 'Yes';

        // Normalize 'all' options from frontend selects to be treated as no filter
        foreach (['listed', 'is_new_lease'] as $key) {
            if (array_key_exists($key, $filters) && is_string($filters[$key]) && strtolower($filters[$key]) === 'all') {
                unset($filters[$key]);
            }
        }
        
        $unitsResult = $this->unitService->getAllPaginated($perPage, $filters);
        $statistics = $this->unitService->getStatistics();

        // Transform units data and build a consistent response structure
        if ($unitsResult instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            // Paginated
            $transformedUnits = $unitsResult->toArray();
            $transformedUnits['data'] = array_map(function ($unit) {
                return array_merge($unit, [
                    'city' => $unit['property']['city']['city'] ?? 'Unknown',
                    'property' => $unit['property']['property_name'] ?? 'Unknown'
                ]);
            }, $transformedUnits['data']);
        } else {
            // 'All' (no pagination): build a pseudo-paginated structure for frontend consistency
            $data = $unitsResult->map(function ($unit) {
                return array_merge($unit->toArray(), [
                    'city' => $unit->property->city->city ?? 'Unknown',
                    'property' => $unit->property->property_name ?? 'Unknown'
                ]);
            })->toArray();

            $count = $unitsResult->count();
            $transformedUnits = [
                'data' => $data,
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => is_string($perPage) ? $perPage : $count,
                'total' => $count,
                'from' => $count > 0 ? 1 : 0,
                'to' => $count,
                'links' => [],
            ];
        }

        // Get cities data for drawer component
        $cities = Cities::all();

        // Get properties data for filter dropdown
        $properties = PropertyInfoWithoutInsurance::with('city')->get();

        return Inertia::render('Units/Vacant', [
            'units' => $transformedUnits,
            'statistics' => $statistics,
            'filters' => array_merge($filters, ['per_page' => $perPage]),
            'cities' => $cities,
            'properties' => $properties,
        ]);
    }

    public function dashboard(): Response
    {
        $statistics = $this->unitService->getStatistics();
        $vacantUnits = $this->unitService->getVacantUnits();
        $listedUnits = $this->unitService->getListedUnits();

        // Transform units data to include property and city names
        $transformedVacantUnits = $vacantUnits->map(function ($unit) {
            return array_merge($unit->toArray(), [
                'city' => $unit->property->city->city ?? 'Unknown',
                'property' => $unit->property->property_name ?? 'Unknown'
            ]);
        });

        $transformedListedUnits = $listedUnits->map(function ($unit) {
            return array_merge($unit->toArray(), [
                'city' => $unit->property->city->city ?? 'Unknown',
                'property' => $unit->property->property_name ?? 'Unknown'
            ]);
        });

        return Inertia::render('Units/Dashboard', [
            'statistics' => $statistics,
            'vacantUnits' => $transformedVacantUnits,
            'listedUnits' => $transformedListedUnits,
        ]);
    }

    public function showImport(): Response
    {
        return Inertia::render('Units/Import');
    }

    public function import(ImportUnitsRequest $request): RedirectResponse
    {
        try {
            $file = $request->file('file');
            $options = [
                'skip_duplicates' => $request->boolean('skip_duplicates', true),
                'update_existing' => $request->boolean('update_existing', false),
            ];

            $result = $this->unitImportService->import($file, $options);

            if ($result['success']) {
                $message = $result['message'];

                if (!empty($result['warnings'])) {
                    $message .= ' Warnings: ' . implode('; ', array_slice($result['warnings'], 0, 3));
                    if (count($result['warnings']) > 3) {
                        $message .= ' and ' . (count($result['warnings']) - 3) . ' more...';
                    }
                }

                return redirect()->route('units.index')
                    ->with('success', $message)
                    ->with('import_statistics', $result['statistics']);
            } else {
                $errorMessage = $result['message'];
                if (!empty($result['errors'])) {
                    $errorMessage .= ' Errors: ' . implode('; ', array_slice($result['errors'], 0, 3));
                    if (count($result['errors']) > 3) {
                        $errorMessage .= ' and ' . (count($result['errors']) - 3) . ' more...';
                    }
                }

                return redirect()->back()
                    ->with('error', $errorMessage)
                    ->with('import_errors', $result['errors'] ?? [])
                    ->with('import_statistics', $result['statistics'] ?? []);
            }
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Import failed: ' . $e->getMessage());
        }
    }
}
