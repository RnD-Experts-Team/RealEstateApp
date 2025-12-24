<?php

namespace App\Services;

use App\Models\MoveIn;
use App\Models\Unit;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use App\Services\TenantService;
use Illuminate\Pagination\LengthAwarePaginator;

class MoveInService
{
    public function __construct(
        protected TenantService $tenantService
    ) {}
    public function getAllMoveIns(string|int $perPage = 15, array $filters = []): LengthAwarePaginator
{
    $query = MoveIn::with(['unit.property.city'])
        ->orderBy('move_in_date', 'desc')
        ->orderBy('created_at', 'desc');

    // ✅ hidden filter (default show visible)
    $isHiddenFilter = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $query->where('is_hidden', $isHiddenFilter ? true : false);

    $perPageValue = ($perPage === 'all') ? $query->count() : (int) $perPage;
    return $query->paginate($perPageValue)->withQueryString();
}

  public function searchMoveIns(array $filters, string|int $perPage = 15): LengthAwarePaginator
{
    $query = MoveIn::with(['unit.property.city']);

    // ✅ hidden filter (default show visible)
    $isHiddenFilter = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
    $query->where('is_hidden', $isHiddenFilter ? true : false);

    // city
    if (!empty($filters['city'])) {
        $cityName = $filters['city'];
        $cityIds = Cities::where('city', 'like', "%{$cityName}%")->pluck('id')->toArray();

        if (!empty($cityIds)) {
            $query->whereHas('unit.property', function ($propertyQuery) use ($cityIds) {
                $propertyQuery->whereIn('city_id', $cityIds);
            });
        } else {
            $query->whereRaw('1 = 0');
        }
    }

    // property
    if (!empty($filters['property'])) {
        $propertyName = $filters['property'];
        $propertyIds = PropertyInfoWithoutInsurance::where('property_name', 'like', "%{$propertyName}%")
            ->pluck('id')->toArray();

        if (!empty($propertyIds)) {
            $query->whereHas('unit', function ($unitQuery) use ($propertyIds) {
                $unitQuery->whereIn('property_id', $propertyIds);
            });
        } else {
            $query->whereRaw('1 = 0');
        }
    }

    // unit
    if (!empty($filters['unit'])) {
        $unitName = $filters['unit'];
        $query->whereHas('unit', function ($unitQuery) use ($unitName) {
            $unitQuery->where('unit_name', 'like', "%{$unitName}%");
        });
    }

    $query->orderBy('move_in_date', 'desc')->orderBy('created_at', 'desc');

    $perPageValue = ($perPage === 'all') ? $query->count() : (int) $perPage;
    return $query->paginate($perPageValue)->withQueryString();
}

    public function createMoveIn(array $data): MoveIn
    {
        // Normalize dependent dates based on flags
        if (($data['submitted_insurance'] ?? null) === 'No') {
            $data['date_of_insurance_expiration'] = null;
        }
        if (($data['filled_move_in_form'] ?? null) === 'No') {
            $data['date_of_move_in_form_filled'] = null;
        }

        // Build tenant_name from provided names (frontend sends 'first_name' and 'last_name'; support 'second_name' for compatibility)
        $firstName = trim((string)($data['first_name'] ?? ''));
        $lastNameFromLast = trim((string)($data['last_name'] ?? ''));
        $lastName = $lastNameFromLast !== ''
            ? $lastNameFromLast
            : trim((string)($data['second_name'] ?? ''));

        $fullTenantName = trim($firstName . ' ' . $lastName);
        if ($fullTenantName !== '') {
            $data['tenant_name'] = $fullTenantName;
        }

        // Create move-in record
        $moveIn = MoveIn::create($data);

        // If names + unit_id are provided, create a Tenant (updates unit via TenantService)
        if ($firstName !== '' && $lastName !== '' && !empty($data['unit_id'])) {
            $this->tenantService->createTenant([
                'unit_id' => $data['unit_id'],
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]);
        }

        return $moveIn;
    }

    public function updateMoveIn(MoveIn $moveIn, array $data): bool
    {
        // Normalize dependent dates based on flags
        if (($data['submitted_insurance'] ?? null) === 'No') {
            $data['date_of_insurance_expiration'] = null;
        }
        if (($data['filled_move_in_form'] ?? null) === 'No') {
            $data['date_of_move_in_form_filled'] = null;
        }

        // Build tenant_name from provided names (frontend sends 'first_name' and 'last_name'; support 'second_name' for compatibility)
        $firstName = trim((string)($data['first_name'] ?? ''));
        $lastNameFromLast = trim((string)($data['last_name'] ?? ''));
        $lastName = $lastNameFromLast !== ''
            ? $lastNameFromLast
            : trim((string)($data['second_name'] ?? ''));

        $fullTenantName = trim($firstName . ' ' . $lastName);
        if ($fullTenantName !== '') {
            $data['tenant_name'] = $fullTenantName;
        }

        $updated = $moveIn->update($data);

        // Optionally create Tenant on update if names provided (to append/update unit tenants list)
        if ($firstName !== '' && $lastName !== '' && !empty($data['unit_id'])) {
            $this->tenantService->createTenant([
                'unit_id' => $data['unit_id'],
                'first_name' => $firstName,
                'last_name' => $lastName,
            ]);
        }

        return $updated;
    }

    public function deleteMoveIn(MoveIn $moveIn): bool
    {
        return $moveIn->archive();
    }

    public function getUnitsForDropdown(): array
    {
        $units = Unit::with(['property.city'])
                    ->select('id', 'unit_name', 'property_id')
                    ->orderBy('unit_name')
                    ->get()
                    ->map(function ($unit) {
                        return [
                            'id' => $unit->id,
                            'unit_name' => $unit->unit_name,
                            'property_name' => $unit->property?->property_name ?? 'N/A',
                            'city_name' => $unit->property?->city?->city ?? 'N/A'
                        ];
                    })
                    ->toArray();

        return [
            'units' => $units
        ];
    }

    public function getDropdownData(): array
    {
        // Get cities (non-archived via model scope) and deduplicate by name
        $cities = Cities::orderBy('city')->get()->unique('city')->values();
        
        // Get properties with city relationships (non-archived via model scope) and deduplicate by name
        $properties = PropertyInfoWithoutInsurance::with('city')
                                                 ->orderBy('property_name')
                                                 ->get()
                                                 ->unique('property_name')
                                                 ->values();
        
        // Get units data for dropdowns with relationships
        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get();

        // Create arrays for dropdowns - group by property but include unit IDs
        $unitsByProperty = $properties->mapWithKeys(function ($property) use ($units) {
            $propertyUnits = $units->where('property_id', $property->id);
            return [
                $property->id => $propertyUnits->map(function ($unit) {
                    return [
                        'id' => $unit->id,
                        'unit_name' => $unit->unit_name
                    ];
                })->values()
            ];
        });

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByProperty' => $unitsByProperty,
            'units' => $units->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name,
                    'property_name' => $unit->property?->property_name ?? 'N/A',
                    'city_name' => $unit->property?->city?->city ?? 'N/A'
                ];
            })
        ];
    }


    public function hideMoveIn(MoveIn $moveIn): bool
{
    $moveIn->is_hidden = true;
    return $moveIn->save();
}

public function unhideMoveIn(MoveIn $moveIn): bool
{
    $moveIn->is_hidden = false;
    return $moveIn->save();
}
}
