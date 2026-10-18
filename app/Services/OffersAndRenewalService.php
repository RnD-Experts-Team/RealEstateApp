<?php

namespace App\Services;

use App\Models\OffersAndRenewal;
use App\Models\Tenant;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OffersAndRenewalService
{
    /**
     * Helper method to calculate expiry for a collection of offers
     */
    private function calculateExpiryForCollection($offers)
    {
        if ($offers instanceof \Illuminate\Pagination\LengthAwarePaginator) {
            $offers->getCollection()->each(function ($offer) {
                $offer->calculateExpiry();
            });
        } elseif ($offers instanceof \Illuminate\Support\Collection) {
            $offers->each(function ($offer) {
                $offer->calculateExpiry();
            });
        } elseif (is_array($offers)) {
            foreach ($offers as $offer) {
                if ($offer instanceof OffersAndRenewal) {
                    $offer->calculateExpiry();
                }
            }
        } elseif ($offers instanceof OffersAndRenewal) {
            $offers->calculateExpiry();
        }

        return $offers;
    }

    public function getAllOffers(): Collection
    {
        $offers = OffersAndRenewal::with(['tenant.unit.property.city'])
            ->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->calculateExpiryForCollection($offers);
    }


    public function createOffer(array $data): OffersAndRenewal
    {
        // Remove display-only fields that shouldn't be stored
        unset(
            $data['city_name'],
            $data['property'],
            $data['unit'],
            $data['tenant'],
            $data['property_name'],
            $data['unit_name'],
            $data['tenant_name'],
            $data['per_page'],
            $data['page']
        );

        $offer = OffersAndRenewal::create($data);
        $offer->calculateExpiry();
        $offer->saveQuietly();
        return $offer;
    }

    public function updateOffer(OffersAndRenewal $offer, array $data): OffersAndRenewal
    {
        // Remove display-only fields that shouldn't be stored
        unset(
            $data['city_name'],
            $data['property'],
            $data['unit'],
            $data['tenant'],
            $data['property_name'],
            $data['unit_name'],
            $data['tenant_name'],
            $data['per_page'],
            $data['page']
        );

        $offer->fill($data);
        $offer->calculateExpiry();
        $offer->saveQuietly();
        return $offer;
    }

    public function deleteOffer(OffersAndRenewal $offer): void
    {
        $offer->archive();
    }

    public function archiveOffer(OffersAndRenewal $offer): bool
    {
        return $offer->archive();
    }

    public function restoreOffer(OffersAndRenewal $offer): bool
    {
        return $offer->restore();
    }

    // Update only is_hidden so the saving hook doesn't rewrite expiry fields
    public function hideOffer(OffersAndRenewal $offer): bool
    {
        return (bool) OffersAndRenewal::whereKey($offer->id)->update(['is_hidden' => true]);
    }

    public function unhideOffer(OffersAndRenewal $offer): bool
    {
        return (bool) OffersAndRenewal::whereKey($offer->id)->update(['is_hidden' => false]);
    }

    public function getArchivedOffers(): Collection
    {
        $offers = OffersAndRenewal::onlyArchived()
            ->with(['tenant.unit.property.city'])
            ->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->calculateExpiryForCollection($offers);
    }

    public function getDropdownData(): array
    {
        $cities = Cities::orderBy('city')->get();

        $properties = PropertyInfoWithoutInsurance::with('city')
            ->orderBy('property_name')
            ->get();

        $units = Unit::with(['property.city'])
            ->orderBy('unit_name')
            ->get();

        // Create ID-keyed lookup maps for cascading
        $propertiesByCityId = $properties->groupBy('city_id')->map(function ($cityProperties) {
            return $cityProperties->map(function ($property) {
                return [
                    'id' => $property->id,
                    'property_name' => $property->property_name
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

        // Get all units with their complete information for edit drawer
        $allUnits = $units->map(function ($unit) {
            return [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city_name' => $unit->property && $unit->property->city ? $unit->property->city->city : null
            ];
        });

        // Format tenants data for frontend with ID-based mapping
        $tenantsData = $tenants->map(function ($tenant) {
            return [
                'id' => $tenant->id,
                'full_name' => $tenant->full_name,
                'unit_name' => $tenant->unit ? $tenant->unit->unit_name : null,
                'property_name' => $tenant->unit && $tenant->unit->property ? $tenant->unit->property->property_name : null,
                'city_name' => $tenant->unit && $tenant->unit->property && $tenant->unit->property->city ? $tenant->unit->property->city->city : null
            ];
        });

        $hierarchicalData = $this->buildHierarchicalData($cities, $properties, $units, $tenants);

        $filterCityNames = $cities->pluck('city')->unique()->sort()->values();
        $filterPropertyNames = $properties->pluck('property_name')->unique()->sort()->values();
        $filterUnitNames = $units->pluck('unit_name')->unique()->sort()->values();
        $filterTenantNames = $tenants->map(function ($tenant) {
            return $tenant->full_name;
        })->unique()->sort()->values();

        return [
            'cities' => $cities,
            'properties' => $properties,
            'propertiesByCityId' => $propertiesByCityId,
            'unitsByPropertyId' => $unitsByPropertyId,
            'tenantsByUnitId' => $tenantsByUnitId,
            'allUnits' => $allUnits,
            'tenantsData' => $tenantsData,
            'hierarchicalData' => $hierarchicalData,
            'filterCityNames' => $filterCityNames,
            'filterPropertyNames' => $filterPropertyNames,
            'filterUnitNames' => $filterUnitNames,
            'filterTenantNames' => $filterTenantNames,
        ];
    }

    /**
     * Build hierarchical data structure for cascading dropdowns
     */
    private function buildHierarchicalData($cities, $properties, $units, $tenants): array
    {
        return $cities->map(function ($city) use ($properties, $units, $tenants) {
            $cityProperties = $properties->where('city_id', $city->id);

            return [
                'id' => $city->id,
                'name' => $city->city,
                'properties' => $cityProperties->map(function ($property) use ($units, $tenants) {
                    $propertyUnits = $units->where('property_id', $property->id);

                    return [
                        'id' => $property->id,
                        'name' => $property->property_name,
                        'city_id' => $property->city_id,
                        'units' => $propertyUnits->map(function ($unit) use ($tenants) {
                            $unitTenants = $tenants->where('unit_id', $unit->id);

                            return [
                                'id' => $unit->id,
                                'name' => $unit->unit_name,
                                'property_id' => $unit->property_id,
                                'tenants' => $unitTenants->map(function ($tenant) {
                                    return [
                                        'id' => $tenant->id,
                                        'name' => $tenant->first_name . ' ' . $tenant->last_name,
                                        'first_name' => $tenant->first_name,
                                        'last_name' => $tenant->last_name,
                                        'unit_id' => $tenant->unit_id,
                                    ];
                                })->values()->toArray()
                            ];
                        })->values()->toArray()
                    ];
                })->values()->toArray()
            ];
        })->values()->toArray();
    }

    /**
     * Get offer with proper relationships for display
     */
    public function getOfferWithRelations(int $id): ?OffersAndRenewal
    {
        $offer = OffersAndRenewal::with(['tenant.unit.property.city'])->find($id);

        if ($offer) {
            $offer->calculateExpiry();
        }

        return $offer;
    }

    /**
     * Search offers with filters using ID-based filtering
     */
    public function searchOffersWithFilters(array $filters): Collection
    {
        $query = OffersAndRenewal::with(['tenant.unit.property.city']);

        // Apply unit filter by ID
        if (!empty($filters['unit_id'])) {
            $query->whereHas('tenant', function ($tenantQuery) use ($filters) {
                $tenantQuery->where('unit_id', $filters['unit_id']);
            });
        }

        // Apply tenant filter by ID
        if (!empty($filters['tenant_id'])) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        // Apply city filter by ID
        if (!empty($filters['city_id'])) {
            $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('city_id', $filters['city_id']);
            });
        }

        // Apply property filter by ID
        if (!empty($filters['property_id'])) {
            $query->whereHas('tenant.unit', function ($unitQuery) use ($filters) {
                $unitQuery->where('property_id', $filters['property_id']);
            });
        }

        $offers = $query->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->calculateExpiryForCollection($offers);
    }

    /**
     * Search offers with name-based filters (converts names to IDs internally)
     */
    public function searchOffersWithNameFilters(array $nameFilters): Collection
    {
        $query = OffersAndRenewal::with(['tenant.unit.property.city']);

        // Apply city filter by name
        if (!empty($nameFilters['city_name'])) {
            $query->whereHas('tenant.unit.property.city', function ($cityQuery) use ($nameFilters) {
                $cityQuery->where('city', 'like', '%' . $nameFilters['city_name'] . '%');
            });
        }

        // Apply property filter by name
        if (!empty($nameFilters['property_name'])) {
            $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($nameFilters) {
                $propertyQuery->where('property_name', 'like', '%' . $nameFilters['property_name'] . '%');
            });
        }

        // Apply unit filter by name
        if (!empty($nameFilters['unit_name'])) {
            $query->whereHas('tenant.unit', function ($unitQuery) use ($nameFilters) {
                $unitQuery->where('unit_name', 'like', '%' . $nameFilters['unit_name'] . '%');
            });
        }

        // Apply tenant filter by name
        if (!empty($nameFilters['tenant_name'])) {
            $query->whereHas('tenant', function ($tenantQuery) use ($nameFilters) {
                $tenantQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $nameFilters['tenant_name'] . '%']);
            });
        }

        $offers = $query->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->calculateExpiryForCollection($offers);
    }

    public function getOffers(array $filters = [], array $nameFilters = [], $perPage = 15, $page = 1, array $flagFilters = [])
    {
        $query = OffersAndRenewal::with(['tenant.unit.property.city']);
        $this->applyFlagFilters($query, $flagFilters);

        $hasNameFilters = !empty(array_filter($nameFilters));
        $hasIdFilters = !empty(array_filter($filters));

        if ($hasNameFilters) {
            if (!empty($nameFilters['city_name'])) {
                $query->whereHas('tenant.unit.property.city', function ($cityQuery) use ($nameFilters) {
                    $cityQuery->where('city', 'like', '%' . $nameFilters['city_name'] . '%');
                });
            }
            if (!empty($nameFilters['property_name'])) {
                $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($nameFilters) {
                    $propertyQuery->where('property_name', 'like', '%' . $nameFilters['property_name'] . '%');
                });
            }
            if (!empty($nameFilters['unit_name'])) {
                $query->whereHas('tenant.unit', function ($unitQuery) use ($nameFilters) {
                    $unitQuery->where('unit_name', 'like', '%' . $nameFilters['unit_name'] . '%');
                });
            }
            if (!empty($nameFilters['tenant_name'])) {
                $query->whereHas('tenant', function ($tenantQuery) use ($nameFilters) {
                    $tenantQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $nameFilters['tenant_name'] . '%']);
                });
            }
        } elseif ($hasIdFilters) {
            if (!empty($filters['unit_id'])) {
                $query->whereHas('tenant', function ($tenantQuery) use ($filters) {
                    $tenantQuery->where('unit_id', $filters['unit_id']);
                });
            }
            if (!empty($filters['tenant_id'])) {
                $query->where('tenant_id', $filters['tenant_id']);
            }
            if (!empty($filters['city_id'])) {
                $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($filters) {
                    $propertyQuery->where('city_id', $filters['city_id']);
                });
            }
            if (!empty($filters['property_id'])) {
                $query->whereHas('tenant.unit', function ($unitQuery) use ($filters) {
                    $unitQuery->where('property_id', $filters['property_id']);
                });
            }
        }

        $query->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc');

        $per = is_string($perPage) ? strtolower($perPage) : $perPage;
        if ($per === 'all') {
            $offers = $query->get();
        } else {
            $offers = $query->paginate((int) $per, ['*'], 'page', (int) $page);
        }

        return $this->calculateExpiryForCollection($offers);
    }

    /**
     * Visible/Hidden and lease-signed filters; applied regardless of name/ID filters.
     */
    private function applyFlagFilters($query, array $flagFilters): void
    {
        $query->where('is_hidden', (bool) ($flagFilters['is_hidden'] ?? false));

        $leaseSigned = $flagFilters['lease_signed'] ?? null;
        if ($leaseSigned === 'signed') {
            $query->where('lease_signed', 'Signed');
        } elseif ($leaseSigned === 'unsigned') {
            $query->where(function ($q) {
                $q->whereNull('lease_signed')->orWhere('lease_signed', '!=', 'Signed');
            });
        }
    }

    private function buildQueryForFilters(array $filters = [], array $nameFilters = [], array $flagFilters = [])
    {
        $query = OffersAndRenewal::with(['tenant.unit.property.city']);
        $this->applyFlagFilters($query, $flagFilters);

        $hasNameFilters = !empty(array_filter($nameFilters));
        $hasIdFilters = !empty(array_filter($filters));

        if ($hasNameFilters) {
            if (!empty($nameFilters['city_name'])) {
                $query->whereHas('tenant.unit.property.city', function ($cityQuery) use ($nameFilters) {
                    $cityQuery->where('city', 'like', '%' . $nameFilters['city_name'] . '%');
                });
            }
            if (!empty($nameFilters['property_name'])) {
                $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($nameFilters) {
                    $propertyQuery->where('property_name', 'like', '%' . $nameFilters['property_name'] . '%');
                });
            }
            if (!empty($nameFilters['unit_name'])) {
                $query->whereHas('tenant.unit', function ($unitQuery) use ($nameFilters) {
                    $unitQuery->where('unit_name', 'like', '%' . $nameFilters['unit_name'] . '%');
                });
            }
            if (!empty($nameFilters['tenant_name'])) {
                $query->whereHas('tenant', function ($tenantQuery) use ($nameFilters) {
                    $tenantQuery->whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $nameFilters['tenant_name'] . '%']);
                });
            }
        } elseif ($hasIdFilters) {
            if (!empty($filters['unit_id'])) {
                $query->whereHas('tenant', function ($tenantQuery) use ($filters) {
                    $tenantQuery->where('unit_id', $filters['unit_id']);
                });
            }
            if (!empty($filters['tenant_id'])) {
                $query->where('tenant_id', $filters['tenant_id']);
            }
            if (!empty($filters['city_id'])) {
                $query->whereHas('tenant.unit.property', function ($propertyQuery) use ($filters) {
                    $propertyQuery->where('city_id', $filters['city_id']);
                });
            }
            if (!empty($filters['property_id'])) {
                $query->whereHas('tenant.unit', function ($unitQuery) use ($filters) {
                    $unitQuery->where('property_id', $filters['property_id']);
                });
            }
        }

        $query->orderBy('date_sent_offer', 'desc')
            ->orderBy('created_at', 'desc');

        return $query;
    }

    public function getNeighborOfferIds(array $filters, array $nameFilters, int $currentId, array $flagFilters = []): array
    {
        $ids = $this->buildQueryForFilters($filters, $nameFilters, $flagFilters)
            ->pluck('id')
            ->toArray();

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
            'prevId' => $prevId,
            'nextId' => $nextId,
        ];
    }

    /**
     * Find city IDs by partial name match
     */
    public function findCityIdsByName(string $cityName): array
    {
        return Cities::where('city', 'like', '%' . $cityName . '%')
            ->pluck('id')
            ->toArray();
    }

    /**
     * Find property IDs by partial name match
     */
    public function findPropertyIdsByName(string $propertyName): array
    {
        return PropertyInfoWithoutInsurance::where('property_name', 'like', '%' . $propertyName . '%')
            ->pluck('id')
            ->toArray();
    }

    /**
     * Find unit IDs by partial name match
     */
    public function findUnitIdsByName(string $unitName): array
    {
        return Unit::where('unit_name', 'like', '%' . $unitName . '%')
            ->pluck('id')
            ->toArray();
    }

    /**
     * Find tenant IDs by partial name match
     */
    public function findTenantIdsByName(string $tenantName): array
    {
        return Tenant::whereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $tenantName . '%'])
            ->pluck('id')
            ->toArray();
    }
}
