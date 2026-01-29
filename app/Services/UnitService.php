<?php
// app/Services/UnitService.php

namespace App\Services;

use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Tenant;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UnitService
{
    /**
     * Get units with filters applied.
     * If $perPage is 'all', returns a Collection without pagination.
     * Otherwise returns a LengthAwarePaginator.
     */
    public function getAllPaginated($perPage = 15, array $filters = []): LengthAwarePaginator|Collection
    {
        $query = Unit::query()->with(['property.city']);

        // Apply filters with relationship joins
        if (!empty($filters['city'])) {
            $query->whereHas('property.city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('property', function ($q) use ($filters) {
                $q->where('property_name', 'like', '%' . $filters['property'] . '%');
            });
        }

        if (!empty($filters['unit_name'])) {
            $query->where('unit_name', 'like', '%' . $filters['unit_name'] . '%');
        }

        if (!empty($filters['vacant']) && strtolower((string) $filters['vacant']) !== 'all') {
            $query->where('vacant', $filters['vacant']);
        }

        if (!empty($filters['listed']) && strtolower((string) $filters['listed']) !== 'all') {
            $query->where('listed', $filters['listed']);
        }

        if (!empty($filters['insurance'])) {
            $query->where('insurance', $filters['insurance']);
        }

        if (!empty($filters['is_new_lease']) && strtolower((string) $filters['is_new_lease']) !== 'all') {
            $query->where('is_new_lease', $filters['is_new_lease']);
        }

        $query = $query->orderBy('property_id')
                       ->orderBy('unit_name');

        // Handle 'all' perPage: return full collection without pagination
        if (is_string($perPage) && strtolower($perPage) === 'all') {
            return $query->get();
        }

        // Default: paginate
        return $query
            ->paginate((int) $perPage)
            ->appends(request()->query());
    }

    public function create(array $data): Unit
    {
        
        
        return DB::transaction(function () use ($data) {
            // Step 1: Check if we need to create a new property
            if (isset($data['new_property']) && is_array($data['new_property'])) {
               
                
                // Create the new property
                $property = PropertyInfoWithoutInsurance::create([
                    'city_id' => $data['new_property']['city_id'],
                    'property_name' => $data['new_property']['property_name'],
                ]);
                
              
                // Use the newly created property's ID
                $data['property_id'] = $property->id;
                
                // Remove new_property from data as it's not a unit field
                unset($data['new_property']);
            }
            
            // Step 2: Store new tenant data temporarily (we'll create it after the unit)
            $newTenantData = null;
            if (isset($data['new_tenant']) && is_array($data['new_tenant'])) {
               
                
                $newTenantData = $data['new_tenant'];
                // Remove new_tenant from data as it's not a unit field
                unset($data['new_tenant']);
            }
            
            // Step 3: Clean empty strings to null for nullable fields
            $data = $this->cleanEmptyStringsForNullableFields($data);
            
           
            
            // Step 4: Create the unit
            $unit = Unit::create($data);
            
           
            
            // Step 5: Create the tenant if new tenant data was provided
            if ($newTenantData) {
                
                // Clean empty strings for tenant data
                $tenantData = $this->cleanEmptyStringsForTenantFields($newTenantData);
                
                // Add the unit_id to tenant data
                $tenantData['unit_id'] = $unit->id;
                
              
                
                // Create the tenant
                $tenant = Tenant::create($tenantData);
                
               
                
                // Update the unit's tenants field with the new tenant's name
                $unit->update([
                    'tenants' => $tenant->first_name . ' ' . $tenant->last_name
                ]);
                
            }
            
            
            return $unit->fresh(['property.city']);
        });
    }

    public function findById(int $id): Unit
    {
        return Unit::with(['property.city'])->findOrFail($id);
    }

    public function update(Unit $unit, array $data): Unit
    {
        // Clean empty strings to null for nullable fields
        $data = $this->cleanEmptyStringsForNullableFields($data);
        $unit->update($data);
        return $unit->fresh(['property.city']);
    }

    public function delete(Unit $unit): bool
    {
        return $unit->archive();
    }

    public function getStatistics(): array
    {
        $total = Unit::count();
        $vacant = Unit::where('vacant', 'Yes')->count();
        $occupied = Unit::where('vacant', 'No')->count();
        $listed = Unit::where('listed', 'Yes')->count();
        $totalApplications = Unit::sum('total_applications');

        $cityStats = Unit::with(['property.city'])
            ->get()
            ->groupBy('property.city.city')
            ->map(function ($units) {
                return $units->count();
            })
            ->sortDesc()
            ->toArray();

        return [
            'total' => $total,
            'vacant' => $vacant,
            'occupied' => $occupied,
            'listed' => $listed,
            'total_applications' => $totalApplications,
            'city_stats' => $cityStats,
        ];
    }

    public function getVacantUnits(): Collection
    {
        return Unit::with(['property.city'])
            ->where('vacant', 'Yes')
            ->orderBy('property_id')
            ->orderBy('unit_name')
            ->get();
    }

    public function getListedUnits(): Collection
    {
        return Unit::with(['property.city'])
            ->where('listed', 'Yes')
            ->orderBy('property_id')
            ->orderBy('unit_name')
            ->get();
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        $nullableFields = [
            'tenants', 'lease_start', 'lease_end', 'count_beds', 'count_baths',
            'lease_status', 'is_new_lease', 'monthly_rent', 'recurring_transaction', 'utility_status',
            'account_number', 'insurance', 'insurance_expiration_date'
        ];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        // If insurance is explicitly set to 'No', enforce expiration date as null
        if (isset($data['insurance']) && $data['insurance'] === 'No') {
            $data['insurance_expiration_date'] = null;
        }

        return $data;
    }

    private function cleanEmptyStringsForTenantFields(array $data): array
    {
        $nullableFields = [
            'street_address_line', 'login_email', 'alternate_email', 'mobile', 
            'emergency_phone', 'cash_or_check', 'has_insurance', 'sensitive_communication',
            'has_assistance', 'assistance_amount', 'assistance_company'
        ];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }
}
