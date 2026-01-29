<?php


namespace App\Http\Controllers;


use App\Http\Requests\NoticeAndEvictionRequest;
use App\Models\NoticeAndEviction;
use App\Services\NoticeAndEvictionService;
use App\Models\Tenant;
use App\Models\Notice;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use Inertia\Inertia;
use Illuminate\Http\Request;


class NoticeAndEvictionController extends Controller
{
    protected $service;


    public function __construct(NoticeAndEvictionService $service)
    {
        $this->service = $service;


        $this->middleware('permission:notice-and-evictions.index')->only('index');
        $this->middleware('permission:notice-and-evictions.create')->only('create');
        $this->middleware('permission:notice-and-evictions.store')->only('store');
        $this->middleware('permission:notice-and-evictions.show')->only('show');
        $this->middleware('permission:notice-and-evictions.edit')->only('edit');
        $this->middleware('permission:notice-and-evictions.update')->only('update');
        $this->middleware('permission:notice-and-evictions.destroy')->only('destroy');
    }


    public function index(Request $request)
    {
        // Prepare filters array from request
        $filters = [
            'city_id' => $request->query('city_id') ?? $request->input('city_id'),
            'property_id' => $request->query('property_id') ?? $request->input('property_id'),
            'unit_id' => $request->query('unit_id') ?? $request->input('unit_id'),
            'tenant_id' => $request->query('tenant_id') ?? $request->input('tenant_id'),
            'city_name' => $request->query('city_name') ?? $request->input('city_name'),
            'property_name' => $request->query('property_name') ?? $request->input('property_name'),
            'unit_name' => $request->query('unit_name') ?? $request->input('unit_name'),
            'tenant_name' => $request->query('tenant_name') ?? $request->input('tenant_name'),
            'search' => $request->query('search') ?? $request->input('search'),
            'is_hidden' => $request->query('is_hidden') ?? $request->input('is_hidden'),
        ];

        // Get pagination parameters
        $perPage = $request->query('per_page') ?? $request->input('per_page') ?? 15;
        $page = $request->query('page') ?? $request->input('page') ?? 1;

        // Get filtered records with pagination
        $query = NoticeAndEviction::with(['tenant.unit.property.city'])
            ->where('is_archived', false);
        $query = $this->service->applyFilters($query, $filters);

        // Update evictions status ONLY for paginated records (not all records)
        if ($perPage === 'all') {
            $paginatedRecords = $query->get();
            
            // Update status for visible records only
            foreach ($paginatedRecords as $record) {
                $this->updateEvictionStatus($record);
            }
            
            $records = $paginatedRecords->map(fn($record) => $this->mapRecordToArray($record));
            $paginationData = [
                'data' => $records,
                'current_page' => 1,
                'per_page' => $paginatedRecords->count(),
                'total' => $paginatedRecords->count(),
                'last_page' => 1,
                'from' => 1,
                'to' => $paginatedRecords->count(),
            ];
        } else {
            $perPageInt = (int) $perPage;
            $paginatedRecords = $query->paginate($perPageInt, ['*'], 'page', $page);
            
            // Update status for visible records only
            foreach ($paginatedRecords as $record) {
                $this->updateEvictionStatus($record);
            }
            
            $records = $paginatedRecords->map(fn($record) => $this->mapRecordToArray($record))->toArray();
            $paginationData = [
                'data' => $records,
                'current_page' => $paginatedRecords->currentPage(),
                'per_page' => $paginatedRecords->perPage(),
                'total' => $paginatedRecords->total(),
                'last_page' => $paginatedRecords->lastPage(),
                'from' => $paginatedRecords->firstItem(),
                'to' => $paginatedRecords->lastItem(),
            ];
        }

        // Get minimal dropdown data (only IDs and names, no relationships)
        $cities = Cities::select('id', 'city')->get();
        $notices = Notice::select('id', 'notice_name', 'days')
            ->where('is_archived', false)
            ->get();

        return Inertia::render('NoticeAndEvictions/Index', [
            'paginatedRecords' => $paginationData,
            'cities' => $cities,
            'notices' => $notices,
            'filters' => $filters,
            'pagination' => [
                'current_page' => $paginationData['current_page'],
                'per_page' => $paginationData['per_page'],
                'total' => $paginationData['total'],
                'last_page' => $paginationData['last_page'],
            ],
            // Use Inertia lazy loading for heavy dropdown data
            'properties' => Inertia::lazy(fn () => 
                PropertyInfoWithoutInsurance::select('id', 'city_id', 'property_name')
                    ->orderBy('property_name')
                    ->get()
            ),
            'units' => Inertia::lazy(fn () => 
                Unit::select('id', 'property_id', 'unit_name')
                    ->orderBy('unit_name')
                    ->get()
            ),
            'tenants' => Inertia::lazy(fn () => 
                Tenant::select('id', 'unit_id', 'first_name', 'last_name')
                    ->where('is_archived', false)
                    ->orderBy('first_name')
                    ->get()
            ),
        ]);
    }

    /**
     * Update eviction status for a single record
     */
    private function updateEvictionStatus(NoticeAndEviction $record): void
    {
        if ($record->have_an_exception === 'Yes') {
            $record->evictions = 'Have An Exception';
        } elseif ($record->type_of_notice && $record->date) {
            $notice = Notice::where('notice_name', $record->type_of_notice)->first();
            if ($notice) {
                $days = $notice->days;
                $alertDate = \Carbon\Carbon::parse($record->date)->addDays($days);
                if ($alertDate->lessThanOrEqualTo(now())) {
                    $record->evictions = 'Alert';
                } else {
                    $record->evictions = '';
                }
            }
        }
        $record->save();
    }


    public function store(NoticeAndEvictionRequest $request)
    {
        // Create the record using only validated entity data
        $nev = $this->service->create($request->getValidatedData());

        // Get pagination/filter parameters for redirect
        $redirectParams = $this->getRedirectParams($request);

        return redirect()->route('notice_and_evictions.index', $redirectParams)
            ->with('success', 'Created successfully.');
    }


    public function show(NoticeAndEviction $notice_and_eviction, Request $request)
    {
        $notice_and_eviction->load(['tenant.unit.property.city']);
        $recordData = $this->mapRecordToArray($notice_and_eviction);

        // Get filters from query string or request body
        $filters = [
            'city_id' => $request->query('city_id') ?? $request->input('city_id'),
            'property_id' => $request->query('property_id') ?? $request->input('property_id'),
            'unit_id' => $request->query('unit_id') ?? $request->input('unit_id'),
            'tenant_id' => $request->query('tenant_id') ?? $request->input('tenant_id'),
            'city_name' => $request->query('city_name') ?? $request->input('city_name'),
            'property_name' => $request->query('property_name') ?? $request->input('property_name'),
            'unit_name' => $request->query('unit_name') ?? $request->input('unit_name'),
            'tenant_name' => $request->query('tenant_name') ?? $request->input('tenant_name'),
            'search' => $request->query('search') ?? $request->input('search'),
        ];

        // Remove null/empty filters
        $filters = array_filter($filters);

        // IMPORTANT: Pass filters to getNavigationRecords
        $navigation = $this->service->getNavigationRecords(
            $notice_and_eviction->id,
            $filters  // Include filters here
        );

        // Build filter query string for navigation links
        $filterQueryString = http_build_query(array_filter([
            'city_id' => $request->query('city_id') ?? $request->input('city_id'),
            'property_id' => $request->query('property_id') ?? $request->input('property_id'),
            'unit_id' => $request->query('unit_id') ?? $request->input('unit_id'),
            'tenant_id' => $request->query('tenant_id') ?? $request->input('tenant_id'),
            'city_name' => $request->query('city_name') ?? $request->input('city_name'),
            'property_name' => $request->query('property_name') ?? $request->input('property_name'),
            'unit_name' => $request->query('unit_name') ?? $request->input('unit_name'),
            'tenant_name' => $request->query('tenant_name') ?? $request->input('tenant_name'),
            'search' => $request->query('search') ?? $request->input('search'),
        ]));

        return Inertia::render('NoticeAndEvictions/Show', [
            'record' => $recordData,
            'navigation' => $navigation,
            'filters' => $filters,
            'filterQueryString' => $filterQueryString ? '?' . $filterQueryString : '',
        ]);
    }



    public function update(NoticeAndEvictionRequest $request, NoticeAndEviction $notice_and_eviction)
    {
        // Update the record using only validated entity data
        $this->service->update($notice_and_eviction, $request->getValidatedData());

        // Get pagination/filter parameters for redirect
        $redirectParams = $this->getRedirectParams($request);

        return redirect()->route('notice_and_evictions.index', $redirectParams)
            ->with('success', 'Updated successfully.');
    }


    public function destroy(NoticeAndEvictionRequest $request, NoticeAndEviction $notice_and_eviction)
    {
        $this->service->delete($notice_and_eviction);

        // Get pagination/filter parameters for redirect
        $redirectParams = $this->getRedirectParams($request);

        return redirect()->route('notice_and_evictions.index', $redirectParams)
            ->with('success', 'Deleted successfully.');
    }


    /**
     * Map record to array format for response
     */
    private function mapRecordToArray(NoticeAndEviction $record): array
    {
        return [
            'id' => $record->id,
            'tenant_id' => $record->tenant_id,
            'unit_name' => $record->tenant?->unit?->unit_name ?? 'N/A',
            'city_name' => $record->tenant?->unit?->property?->city?->city ?? 'N/A',
            'property_name' => $record->tenant?->unit?->property?->property_name ?? 'N/A',
            'tenants_name' => $record->tenant ? $record->tenant->first_name . ' ' . $record->tenant->last_name : 'N/A',
            'status' => $record->status,
            'date' => $record->date,
            'type_of_notice' => $record->type_of_notice,
            'have_an_exception' => $record->have_an_exception,
            'note' => $record->note,
            'evictions' => $record->evictions,
            'sent_to_atorney' => $record->sent_to_atorney,
            'hearing_dates' => $record->hearing_dates,
            'evected_or_payment_plan' => $record->evected_or_payment_plan,
            'if_left' => $record->if_left,
            'writ_date' => $record->writ_date,
            'other_tenants' => $record->other_tenants,
            'is_hidden' => (bool) $record->is_hidden,
            'created_at' => $record->created_at,
            'updated_at' => $record->updated_at,
        ];
    }


    /**
     * Get redirect parameters from query string only
     * This preserves only actual filter parameters, not form submission data
     */
    private function getRedirectParams(Request $request): array
    {
        return array_filter([
            'page' => $request->query('page'),
            'per_page' => $request->query('per_page'),
            'city_id' => $request->query('city_id'),
            'property_id' => $request->query('property_id'),
            'unit_id' => $request->query('unit_id'),
            'tenant_id' => $request->query('tenant_id'),
            'city_name' => $request->query('city_name'),
            'property_name' => $request->query('property_name'),
            'unit_name' => $request->query('unit_name'),
            'tenant_name' => $request->query('tenant_name'),
            'search' => $request->query('search'),
            'is_hidden' => $request->query('is_hidden'),
        ]);
    }

    /**
     * Hide a notice and eviction record
     */
    public function hide(Request $request, NoticeAndEviction $notice_and_eviction)
    {
        $notice_and_eviction->is_hidden = true;
        $notice_and_eviction->save();

        return redirect()->route('notice_and_evictions.index', $this->getRedirectParams($request))
            ->with('success', 'Record hidden successfully.');
    }

    /**
     * Unhide a notice and eviction record
     */
    public function unhide(Request $request, NoticeAndEviction $notice_and_eviction)
    {
        $notice_and_eviction->is_hidden = false;
        $notice_and_eviction->save();

        return redirect()->route('notice_and_evictions.index', $this->getRedirectParams($request))
            ->with('success', 'Record unhidden successfully.');
    }
}
