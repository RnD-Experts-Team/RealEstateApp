<?php

namespace App\Services;

use App\Models\NoticeAndEviction;
use Illuminate\Database\Eloquent\Builder;

class NoticeAndEvictionService
{
    public function create(array $data): NoticeAndEviction
    {
        $nev = NoticeAndEviction::create($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function update(NoticeAndEviction $nev, array $data): NoticeAndEviction
    {
        $nev->fill($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function delete(NoticeAndEviction $nev): void
    {
        $nev->archive();
    }

    /**
     * Apply filters to query builder
     */
    public function applyFilters(Builder $query, array $filters = []): Builder
    {
        // ✅ hidden filter (default visible)
        $isHiddenFilter = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $query->where('is_hidden', $isHiddenFilter ? true : false);

        // Handle individual filter parameters (ID-based filtering)
        if (isset($filters['city_id']) && $filters['city_id']) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($filters) {
                $q->where('id', $filters['city_id']);
            });
        }

        if (isset($filters['property_id']) && $filters['property_id']) {
            $query->whereHas('tenant.unit.property', function ($q) use ($filters) {
                $q->where('id', $filters['property_id']);
            });
        }

        if (isset($filters['unit_id']) && $filters['unit_id']) {
            $query->whereHas('tenant.unit', function ($q) use ($filters) {
                $q->where('id', $filters['unit_id']);
            });
        }

        if (isset($filters['tenant_id']) && $filters['tenant_id']) {
            $query->where('tenant_id', $filters['tenant_id']);
        }

        // Handle name-based filter parameters (for partial name searches)
        if (isset($filters['city_name']) && $filters['city_name']) {
            $query->whereHas('tenant.unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city_name'] . '%');
            });
        }

        if (isset($filters['property_name']) && $filters['property_name']) {
            $query->whereHas('tenant.unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', '%' . $filters['property_name'] . '%');
            });
        }

        if (isset($filters['unit_name']) && $filters['unit_name']) {
            $query->whereHas('tenant.unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', '%' . $filters['unit_name'] . '%');
            });
        }

        // Updated tenant_name filter to search in both tenant and other_tenants
        if (isset($filters['tenant_name']) && $filters['tenant_name']) {
            $tenantName = $filters['tenant_name'];
            $query->where(function ($q) use ($tenantName) {
                // Search in main tenant
                $q->whereHas('tenant', function ($subQ) use ($tenantName) {
                    $subQ->where('first_name', 'like', "%{$tenantName}%")
                        ->orWhere('last_name', 'like', "%{$tenantName}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$tenantName}%"]);
                })
                    // Also search in other_tenants field
                    ->orWhere('other_tenants', 'like', "%{$tenantName}%");
            });
        }

        // Handle general search functionality
        if (isset($filters['search']) && $filters['search']) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->whereHas('tenant', function ($subQ) use ($searchTerm) {
                    $subQ->where('first_name', 'like', "%{$searchTerm}%")
                        ->orWhere('last_name', 'like', "%{$searchTerm}%")
                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ["%{$searchTerm}%"]);
                })
                    ->orWhereHas('tenant.unit', function ($subQ) use ($searchTerm) {
                        $subQ->where('unit_name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('tenant.unit.property', function ($subQ) use ($searchTerm) {
                        $subQ->where('property_name', 'like', "%{$searchTerm}%");
                    })
                    ->orWhereHas('tenant.unit.property.city', function ($subQ) use ($searchTerm) {
                        $subQ->where('city', 'like', "%{$searchTerm}%");
                    })
                    ->orWhere('status', 'like', "%{$searchTerm}%")
                    ->orWhere('type_of_notice', 'like', "%{$searchTerm}%")
                    ->orWhere('other_tenants', 'like', "%{$searchTerm}%");
            });
        }

        return $query;
    }

    public function listAll($filters = [])
    {
        $query = NoticeAndEviction::with(['tenant.unit.property.city']);
        return $this->applyFilters($query, $filters)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int $id)
    {
        return NoticeAndEviction::with(['tenant.unit.property.city'])->findOrFail($id);
    }

    /**
     * Get next and previous records based on current filters
     * Returns an array with 'previous' and 'next' record IDs and basic info
     */
    public function getNavigationRecords($currentRecordId, $filters = [])
    {
        // Build base query with filters applied
        $query = NoticeAndEviction::with(['tenant.unit.property.city'])
            ->where('is_archived', false);

        // Apply filters
        if (!empty($filters)) {
            $query = $this->applyFilters($query, $filters);
        }

        // Get all filtered record IDs ordered by newest first
        $filteredIds = $query->orderBy('created_at', 'desc')->pluck('id')->toArray();
        $currentPosition = array_search($currentRecordId, $filteredIds);

        return [
            'previous' => $currentPosition > 0
                ? $this->getRecordBasicInfo($filteredIds[$currentPosition - 1])
                : null,
            'next' => $currentPosition < count($filteredIds) - 1
                ? $this->getRecordBasicInfo($filteredIds[$currentPosition + 1])
                : null,
            'total_in_filter' => count($filteredIds),
            'current_position' => $currentPosition !== false ? $currentPosition + 1 : null,
        ];
    }

    private function getRecordBasicInfo($recordId)
    {
        $record = NoticeAndEviction::with(['tenant.unit'])
            ->find($recordId);

        return [
            'id' => $record->id,
            'tenant_name' => $record->tenant ? $record->tenant->first_name . ' ' . $record->tenant->last_name : 'N/A',
            'unit_name' => $record->tenant?->unit?->unit_name ?? 'N/A',
        ];
    }

    /**
     * Hide a notice and eviction record (set is_hidden to true)
     */
    public function hideNoticeAndEviction(NoticeAndEviction $noticeAndEviction): bool
    {
        $noticeAndEviction->is_hidden = true;
        return $noticeAndEviction->save();
    }

    /**
     * Unhide a notice and eviction record (set is_hidden to false)
     */
    public function unhideNoticeAndEviction(NoticeAndEviction $noticeAndEviction): bool
    {
        $noticeAndEviction->is_hidden = false;
        return $noticeAndEviction->save();
    }
}
