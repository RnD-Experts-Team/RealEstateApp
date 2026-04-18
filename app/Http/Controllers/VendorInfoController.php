<?php
// app/Http/Controllers/VendorInfoController.php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVendorInfoRequest;
use App\Http\Requests\UpdateVendorInfoRequest;
use App\Models\Cities;
use App\Services\VendorInfoService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class VendorInfoController extends Controller
{
    public function __construct(
        private VendorInfoService $vendorInfoService
    ) {
        $this->middleware('permission:vendors.index')->only('index');
        $this->middleware('permission:vendors.create')->only('create');
        $this->middleware('permission:vendors.store')->only('store');
        $this->middleware('permission:vendors.show')->only('show');
        $this->middleware('permission:vendors.edit')->only('edit');
        $this->middleware('permission:vendors.update')->only('update');
        $this->middleware('permission:vendors.destroy')->only('destroy');
    }

    public function index(Request $request): Response
    {
        $perPage = $request->get('per_page', 15);
        $filters = $request->only(['city', 'city_id', 'vendor_name', 'vendor_type', 'number', 'email', 'per_page']);
        // Ensure filters always contain per_page for UI state
        $filters['per_page'] = $perPage;

        $vendors = $this->vendorInfoService->getAllPaginated($perPage, $filters);
        // $statistics = $this->vendorInfoService->getStatistics();
        $cities = $this->vendorInfoService->getCities();

        return Inertia::render('Vendors/Index', [
            'vendors' => $vendors,
            // 'statistics' => $statistics,
            'filters' => $filters,
            'cities' => $cities,
        ]);
    }

    public function store(StoreVendorInfoRequest $request): RedirectResponse
    {
        try {
            $this->vendorInfoService->create($request->validated());

            // Redirect to index with preserved filters/pagination from namespaced POST keys
            return redirect()->route('vendors.index', $this->indexRedirectParams($request))
                ->with('success', 'Vendor created successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to create vendor: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function update(UpdateVendorInfoRequest $request, string $id): RedirectResponse
    {
        try {
            $vendor = $this->vendorInfoService->findById((int) $id);
            $this->vendorInfoService->update($vendor, $request->validated());

            return redirect()->route('vendors.index', $this->indexRedirectParams($request))
                ->with('success', 'Vendor updated successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to update vendor: ' . $e->getMessage())
                ->withInput();
        }
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $vendor = $this->vendorInfoService->findById((int) $id);
            $this->vendorInfoService->delete($vendor);

            return redirect()->route('vendors.index', $this->indexRedirectParams(request()))
                ->with('success', 'Vendor deleted successfully');
        } catch (\Exception $e) {
            return redirect()->back()
                ->with('error', 'Failed to delete vendor: ' . $e->getMessage());
        }
    }

    public function dashboard(): Response
    {
        // $statistics = $this->vendorInfoService->getStatistics();
        $recentVendors = $this->vendorInfoService->getRecentVendors(10);

        return Inertia::render('Vendors/Dashboard', [
            // 'statistics' => $statistics,
            'recentVendors' => $recentVendors,
        ]);
    }

    public function byCity(string $city): Response
    {
        $vendors = $this->vendorInfoService->getByCity($city);

        return Inertia::render('Vendors/ByCity', [
            'vendors' => $vendors,
            'city' => $city,
        ]);
    }

    public function byCityId(int $cityId): Response
    {
        $vendors = $this->vendorInfoService->getByCityId($cityId);
        $city = Cities::findOrFail($cityId);

        return Inertia::render('Vendors/ByCity', [
            'vendors' => $vendors,
            'city' => $city->city,
        ]);
    }

    /**
     * Collect filters and pagination params to persist on redirects.
     * Use namespaced keys during POST/PUT to avoid colliding with form fields.
     */
    private function indexRedirectParams(Request $request): array
    {
        $params = [];

        if ($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('delete')) {
            $map = [
                'filter_city' => 'city',
                'filter_city_id' => 'city_id',
                'filter_vendor_name' => 'vendor_name',
                'filter_vendor_type' => 'vendor_type',
                'filter_number' => 'number',
                'filter_email' => 'email',
                'filter_per_page' => 'per_page',
                'filter_page' => 'page',
            ];
            foreach ($map as $from => $to) {
                if ($request->has($from)) {
                    $params[$to] = $request->input($from);
                }
            }
        } else {
            $keys = ['city', 'city_id', 'vendor_name', 'vendor_type', 'number', 'email', 'per_page', 'page'];
            foreach ($keys as $key) {
                if ($request->has($key)) {
                    $params[$key] = $request->input($key);
                }
            }
        }

        return $params;
    }
}
