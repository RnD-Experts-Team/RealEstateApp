<?php

namespace App\Services;

use App\Models\PaymentPlan;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;

class PaymentPlanService
{
    public function getAllPaymentPlans($perPage = 15, bool $isHidden = false)
{
    $perPageValue = ($perPage === 'all')
        ? PaymentPlan::where('is_hidden', $isHidden)->count()
        : (int) $perPage;

    return PaymentPlan::with(['tenant.unit.property.city'])
        ->where('is_hidden', $isHidden) // ✅ NEW
        ->orderBy('created_at', 'desc')
        ->paginate($perPageValue)
        ->withQueryString();
}

    /**
     * Filter payment plans by NAME-based filters for city, property, unit, and tenant.
     * Uses LIKE matching similar to Payments filters.
     */
    public function filterPaymentPlansByNames(?string $city = null, ?string $property = null, ?string $unit = null, ?string $tenant = null, $perPage = 15, bool $isHidden = false )
    {
        $query = PaymentPlan::with(['tenant.unit.property.city'])->where('is_hidden', $isHidden);

        if (!empty($tenant)) {
            $query->whereHas('tenant', function ($q) use ($tenant) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenant}%"]);
            });
        }

        if (!empty($unit)) {
            $query->whereHas('tenant.unit', function ($q) use ($unit) {
                $q->where('unit_name', 'like', "%{$unit}%");
            });
        }

        if (!empty($property)) {
            $query->whereHas('tenant.unit.property', function ($q) use ($property) {
                $q->where('property_name', 'like', "%{$property}%");
            });
        }

        if (!empty($city)) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%");
            });
        }

        $perPageValue = ($perPage === 'all')
            ? (clone $query)->count()
            : (int) $perPage;

        return $query->orderBy('created_at', 'desc')
            ->paginate($perPageValue)
            ->withQueryString();
    }

    /**
     * Get previous and next payment plan IDs relative to the current record,
     * using the same NAME-based filters and ordering (created_at desc) as the index.
     */
    public function getAdjacentPaymentPlanIds(int $currentId, ?string $city = null, ?string $property = null, ?string $unit = null, ?string $tenant = null, bool $isHidden = false): array
    {
        $query = PaymentPlan::with(['tenant.unit.property.city'])->where('is_hidden', $isHidden);

        if (!empty($tenant)) {
            $query->whereHas('tenant', function ($q) use ($tenant) {
                $q->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenant}%"]);
            });
        }

        if (!empty($unit)) {
            $query->whereHas('tenant.unit', function ($q) use ($unit) {
                $q->where('unit_name', 'like', "%{$unit}%");
            });
        }

        if (!empty($property)) {
            $query->whereHas('tenant.unit.property', function ($q) use ($property) {
                $q->where('property_name', 'like', "%{$property}%");
            });
        }

        if (!empty($city)) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%");
            });
        }

        // Order by created_at desc to match index page ordering
        $ids = $query->orderBy('created_at', 'desc')->pluck('id')->values()->toArray();

        $prevId = null;
        $nextId = null;

        $index = array_search($currentId, $ids, true);
        if ($index !== false) {
            if ($index > 0) {
                $prevId = $ids[$index - 1];
            }
            if ($index < count($ids) - 1) {
                $nextId = $ids[$index + 1];
            }
        }

        return [
            'prev' => $prevId,
            'next' => $nextId,
        ];
    }

    public function getPaymentPlan($id)
    {
        return PaymentPlan::with(['tenant.unit.property.city'])->findOrFail($id);
    }

    public function createPaymentPlan(array $data)
    {
        // If tenant_id is provided, use it directly
        if (isset($data['tenant_id'])) {
            return PaymentPlan::create($data);
        }

        // If tenant name is provided, find the tenant_id
        if (isset($data['tenant_name'])) {
            $tenant = $this->findTenantByName($data['tenant_name']);
            if ($tenant) {
                $data['tenant_id'] = $tenant->id;
                unset($data['tenant_name']);
                return PaymentPlan::create($data);
            }
        }

        return PaymentPlan::create($data);
    }

    public function updatePaymentPlan($id, array $data)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        
        // If tenant name is provided, find the tenant_id
        if (isset($data['tenant_name'])) {
            $tenant = $this->findTenantByName($data['tenant_name']);
            if ($tenant) {
                $data['tenant_id'] = $tenant->id;
                unset($data['tenant_name']);
            }
        }

        $paymentPlan->update($data);
        return $paymentPlan;
    }

    public function deletePaymentPlan($id)
    {
        $paymentPlan = PaymentPlan::findOrFail($id);
        return $paymentPlan->archive();
    }

    public function getDropdownData()
    {
        // Get cities (deduplicated by name)
        $cities = Cities::orderBy('city')->get()->unique('city')->values();
        
        // Get properties with city relationships
        $properties = PropertyInfoWithoutInsurance::with('city')
                     ->orderBy('property_name')
                     ->get();
        $propertiesUniqueByName = $properties->unique('property_name')->values();
        
        // Get units with their relationships for dropdowns
        $units = Unit::with(['property.city'])
                    ->orderBy('unit_name')
                    ->get();

        // Create ID-keyed lookup maps for cascading
        $propertiesByCityId = $properties->groupBy('city_id')->map(function ($cityProperties) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'city_id' => $property->city_id,
                    'created_at' => $property->created_at,
                    'updated_at' => $property->updated_at
                ];
            })->values();
        });

        $unitsByPropertyId = $units->groupBy('property_id')->map(function ($propertyUnits) {
            return $propertyUnits->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            })->values();
        });

        // Get tenants with their relationships
        $tenants = Tenant::with(['unit.property.city'])
                         ->orderBy('first_name')
                         ->orderBy('last_name')
                         ->get();

        // Group tenants by unit ID
        $tenantsByUnitId = $tenants->groupBy('unit_id')->map(function ($unitTenants) {
            return $unitTenants->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'full_name' => $tenant->full_name,
                    'tenant_id' => $tenant->id
                ];
            })->values();
        });

        // Get all units with their complete information for edit drawer (dedup by unit_name)
        $allUnits = $units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city_name' => $unit->property && $unit->property->city ? $unit->property->city->city : null
            ];
        })->unique('unit_name')->values();

        // Format tenants data for frontend with ID-based mapping (dedup by full_name)
        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
            ];
        })->unique('full_name')->values();

        return [
            'cities' => $cities,
            'properties' => $propertiesUniqueByName->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                    'city_id' => $property->city_id,
                    'created_at' => $property->created_at,
                    'updated_at' => $property->updated_at
                ];
            }),
            'propertiesByCityId' => $propertiesByCityId,
            'unitsByPropertyId' => $unitsByPropertyId,
            'tenantsByUnitId' => $tenantsByUnitId,
            'allUnits' => $allUnits,
            'tenantsData' => $tenantsData->map(function ($tenant) {
                return [
                    'id' => $tenant['id'],
                    'full_name' => $tenant['full_name'],
                    'tenant_id' => $tenant['id'],
                    'unit_name' => $tenant['unit_name'],
                    'property_name' => $tenant['property_name'],
                    'city_name' => $tenant['city_name']
                ];
            })
        ];
    }

    private function findTenantByName(string $tenantName)
    {
        return Tenant::whereRaw("CONCAT(first_name, ' ', last_name) = ?", [$tenantName])->first();
    }

    public function getTenantsForDropdown()
    {
        return Tenant::with(['unit.property.city'])
            ->get()
            ->map(function ($tenant) {
                return [
                    'id' => $tenant->id,
                    'label' => $tenant->full_name . 
                        ($tenant->unit ? ' - ' . $tenant->unit->unit_name : '') .
                        ($tenant->unit && $tenant->unit->property ? ' (' . $tenant->unit->property->property_name . ')' : ''),
                    'unit_id' => $tenant->unit_id,
                    'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                    'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                    'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
                ];
            })
            ->values()
            ->toArray();
    }

    public function hidePaymentPlan(PaymentPlan $plan): bool
{
    $plan->is_hidden = true;
    return $plan->save();
}

public function unhidePaymentPlan(PaymentPlan $plan): bool
{
    $plan->is_hidden = false;
    return $plan->save();
}

}
