<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorTaskTrackerRequest;
use App\Http\Requests\UpdateVendorTaskTrackerRequest;
use App\Models\VendorTaskTracker;
use App\Services\VendorTaskTrackerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VendorTaskTrackerController extends Controller
{
    public function __construct(
        protected VendorTaskTrackerService $vendorTaskTrackerService
    ) {
        $this->middleware('permission:vendor-task-tracker.index')->only('index');
        $this->middleware('permission:vendor-task-tracker.create')->only('create');
        $this->middleware('permission:vendor-task-tracker.store')->only('store');
        $this->middleware('permission:vendor-task-tracker.show')->only('show');
        $this->middleware('permission:vendor-task-tracker.edit')->only('edit');
        $this->middleware('permission:vendor-task-tracker.update')->only('update');
        $this->middleware('permission:vendor-task-tracker.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $filters = $request->only([
            'search',
            'city',
            'property',
            'unit_name',
            'vendor_name',
            'status',
            'per_page',
            'is_hidden', // ✅ NEW
        ]);

        if (!isset($filters['status']) || empty($filters['status'])) {
            $filters['status'] = 'exclude_completed';
        }

        if (!isset($filters['per_page']) || empty($filters['per_page'])) {
            $filters['per_page'] = 15;
        }

        // ✅ default visible (false)
        if (!array_key_exists('is_hidden', $filters) || $filters['is_hidden'] === '' || $filters['is_hidden'] === null) {
            $filters['is_hidden'] = 'false';
        }

        $tasksResult = $this->vendorTaskTrackerService->getTasks($filters);

        if ($tasksResult instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $collection = $tasksResult->getCollection()->map(function ($task) {
                $task->city = $task->unit?->property?->city?->city ?? '';
                $task->property_name = $task->unit?->property?->property_name ?? '';
                $task->unit_name = $task->unit?->unit_name ?? '';
                $task->vendor_name = $task->vendor?->vendor_name ?? '';
                $task->is_hidden = (bool) ($task->is_hidden ?? false); // ✅ NEW
                return $task;
            });

            $tasksResult->setCollection($collection);

            $tasksPayload = [
                'data' => $tasksResult->items(),
                'links' => [],
                'meta' => [
                    'total' => $tasksResult->total(),
                    'current_page' => $tasksResult->currentPage(),
                    'last_page' => $tasksResult->lastPage(),
                    'per_page' => $tasksResult->perPage(),
                    'from' => $tasksResult->firstItem(),
                    'to' => $tasksResult->lastItem(),
                ],
            ];
        } else {
            $tasks = $tasksResult->map(function ($task) {
                $task->city = $task->unit?->property?->city?->city ?? '';
                $task->property_name = $task->unit?->property?->property_name ?? '';
                $task->unit_name = $task->unit?->unit_name ?? '';
                $task->vendor_name = $task->vendor?->vendor_name ?? '';
                $task->is_hidden = (bool) ($task->is_hidden ?? false); // ✅ NEW
                return $task;
            });

            $tasksPayload = [
                'data' => $tasks,
                'links' => [],
                'meta' => [
                    'total' => $tasks->count(),
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $tasks->count(),
                    'from' => $tasks->count() > 0 ? 1 : null,
                    'to' => $tasks->count(),
                ],
            ];
        }

        $dropdownData = $this->vendorTaskTrackerService->getDropdownData();
        $drawerData = $this->vendorTaskTrackerService->getDrawerDropdownData();

        return Inertia::render('VendorTaskTracker/Index', [
            'tasks' => $tasksPayload,
            'filters' => array_merge($filters, ['page' => (int) $request->input('page', 1)]),
            'cities' => $dropdownData['cities'],
            'properties' => $dropdownData['properties'],
            'units' => $dropdownData['units'],
            'vendors' => $dropdownData['vendors'],
            'unitsByCity' => $dropdownData['unitsByCity'],
            'propertiesByCity' => $dropdownData['propertiesByCity'],
            'unitsByProperty' => $dropdownData['unitsByProperty'],
            'vendorsByCity' => $dropdownData['vendorsByCity'],
            'drawerCities' => $drawerData['cities'],
            'drawerProperties' => $drawerData['properties'],
            'drawerUnits' => $drawerData['units'],
            'drawerVendors' => $drawerData['vendors'],
            'drawerUnitsByCity' => $drawerData['unitsByCity'],
            'drawerPropertiesByCity' => $drawerData['propertiesByCity'],
            'drawerUnitsByProperty' => $drawerData['unitsByProperty'],
            'drawerVendorsByCity' => $drawerData['vendorsByCity'],
        ]);
    }

    public function store(StoreVendorTaskTrackerRequest $request): RedirectResponse
    {
        $this->vendorTaskTrackerService->createTask($request->validated());

        $redirectFilters = (array) $request->input('redirect_filters', []);
        $allowedKeys = ['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden'];
        $filters = [];
        foreach ($allowedKeys as $key) {
            if (isset($redirectFilters[$key]) && $redirectFilters[$key] !== '') {
                $filters[$key] = $redirectFilters[$key];
            }
        }

        return redirect()
            ->route('vendor-task-tracker.index', $filters)
            ->with('success', 'Task created successfully.');
    }

    public function show(Request $request, VendorTaskTracker $vendorTaskTracker): Response
    {
        $vendorTaskTracker->load(['vendor.city', 'unit.property.city']);
        $vendorTaskTracker->city = $vendorTaskTracker->unit?->property?->city?->city ?? '';
        $vendorTaskTracker->property_name = $vendorTaskTracker->unit?->property?->property_name ?? '';
        $vendorTaskTracker->unit_name = $vendorTaskTracker->unit?->unit_name ?? '';
        $vendorTaskTracker->vendor_name = $vendorTaskTracker->vendor?->vendor_name ?? '';
        $vendorTaskTracker->is_hidden = (bool) ($vendorTaskTracker->is_hidden ?? false);

        $filters = $request->only(['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden']);
        if (!isset($filters['status']) || empty($filters['status'])) {
            $filters['status'] = 'exclude_completed';
        }
        if (!array_key_exists('is_hidden', $filters) || $filters['is_hidden'] === '' || $filters['is_hidden'] === null) {
            $filters['is_hidden'] = 'false';
        }

        $adjacent = $this->vendorTaskTrackerService->getAdjacentTaskIds($filters, $vendorTaskTracker->id);

        return Inertia::render('VendorTaskTracker/Show', [
            'task' => $vendorTaskTracker,
            'filters' => $filters,
            'prevId' => $adjacent['prev_id'],
            'nextId' => $adjacent['next_id'],
        ]);
    }

    public function update(UpdateVendorTaskTrackerRequest $request, VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->updateTask($vendorTaskTracker, $request->validated());

        $redirectFilters = (array) $request->input('redirect_filters', []);
        $allowedKeys = ['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden'];
        $filters = [];
        foreach ($allowedKeys as $key) {
            if (isset($redirectFilters[$key]) && $redirectFilters[$key] !== '') {
                $filters[$key] = $redirectFilters[$key];
            }
        }

        return redirect()
            ->route('vendor-task-tracker.index', $filters)
            ->with('success', 'Task updated successfully.');
    }

    public function destroy(VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->deleteTask($vendorTaskTracker);

        $redirectFilters = (array) request()->input('redirect_filters', []);
        $allowedKeys = ['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden'];
        $filters = [];
        foreach ($allowedKeys as $key) {
            if (isset($redirectFilters[$key]) && $redirectFilters[$key] !== '') {
                $filters[$key] = $redirectFilters[$key];
            }
        }

        return redirect()
            ->route('vendor-task-tracker.index', $filters)
            ->with('success', 'Task archived successfully.');
    }

    public function hide(Request $request, VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->hideTask($vendorTaskTracker);

        $redirectFilters = (array) $request->input('redirect_filters', []);
        $allowedKeys = ['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden'];
        $filters = [];
        foreach ($allowedKeys as $key) {
            if (isset($redirectFilters[$key]) && $redirectFilters[$key] !== '') {
                $filters[$key] = $redirectFilters[$key];
            }
        }

        return redirect()
            ->route('vendor-task-tracker.index', $filters)
            ->with('success', 'Task hidden.');
    }

    public function unhide(Request $request, VendorTaskTracker $vendorTaskTracker): RedirectResponse
    {
        $this->vendorTaskTrackerService->unhideTask($vendorTaskTracker);

        $redirectFilters = (array) $request->input('redirect_filters', []);
        $allowedKeys = ['search', 'city', 'property', 'unit_name', 'vendor_name', 'status', 'per_page', 'page', 'is_hidden'];
        $filters = [];
        foreach ($allowedKeys as $key) {
            if (isset($redirectFilters[$key]) && $redirectFilters[$key] !== '') {
                $filters[$key] = $redirectFilters[$key];
            }
        }

        return redirect()
            ->route('vendor-task-tracker.index', $filters)
            ->with('success', 'Task unhidden.');
    }

    /**
     * Export tasks data
     */
    public function export()
    {
        $tasks = $this->vendorTaskTrackerService->getTasksForExport();
        return response()->json($tasks);
    }
}
