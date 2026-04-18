<?php
// app/Services/VendorInfoService.php

namespace App\Services;

use App\Models\VendorInfo;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Collection as SupportCollection;

class VendorInfoService
{
    public function getAllPaginated(int|string $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = VendorInfo::with('city');

        // Apply filters using relationships
        if (!empty($filters['city'])) {
            $query->whereHas('city', function ($q) use ($filters) {
                $q->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['city_id'])) {
            $query->where('city_id', $filters['city_id']);
        }

        if (!empty($filters['vendor_name'])) {
            $query->where('vendor_name', 'like', '%' . $filters['vendor_name'] . '%');
        }

        if (!empty($filters['vendor_type'])) {
            $query->where('vendor_type', $filters['vendor_type']);
        }

        // Filter by phone number within JSON array
        if (!empty($filters['number'])) {
            $query->whereJsonContains('number', $filters['number']);
        }

        // Filter by email within JSON array
        if (!empty($filters['email'])) {
            $query->whereJsonContains('email', $filters['email']);
        }

        // Handle per-page option, including 'all' which should return all records
        $perPageRaw = $perPage;
        if (is_string($perPage) && strtolower($perPage) === 'all') {
            $count = (clone $query)->count();
            // Ensure at least 1 to avoid paginate(0)
            $perPage = $count > 0 ? $count : 1;
        }

        $paginator = $query
            ->orderBy('city_id', 'asc')
            ->orderBy('vendor_name', 'asc')
            ->paginate($perPage)
            ->appends(array_merge($filters, ['per_page' => $perPageRaw]));

        return $paginator;
    }

    public function create(array $data): VendorInfo
    {
        // Clean empty strings/arrays and convert to proper format
        $data = $this->cleanAndFormatJsonFields($data);
        return VendorInfo::create($data);
    }

    public function findById(int $id): VendorInfo
    {
        return VendorInfo::with('city')->findOrFail($id);
    }

    public function update(VendorInfo $vendorInfo, array $data): VendorInfo
    {
        // Clean empty strings/arrays and convert to proper format
        $data = $this->cleanAndFormatJsonFields($data);
        $vendorInfo->update($data);
        return $vendorInfo->fresh('city');
    }

    public function delete(VendorInfo $vendorInfo): bool
    {
        // Use soft delete by setting is_archived to true
        $vendorInfo->archive();
        return true;
    }

    public function getByCityId(int $cityId): Collection
    {
        return VendorInfo::with('city')
            ->where('city_id', $cityId)
            ->orderBy('vendor_name', 'asc')
            ->get();
    }

    public function getByCity(string $cityName): Collection
    {
        return VendorInfo::with('city')
            ->whereHas('city', function ($q) use ($cityName) {
                $q->where('city', $cityName);
            })
            ->orderBy('vendor_name', 'asc')
            ->get();
    }

    public function getRecentVendors(int $limit = 10): Collection
    {
        return VendorInfo::with('city')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getCities(): SupportCollection
    {
        return Cities::query()
            ->orderBy('city', 'asc')
            ->get(['id', 'city']); // returns Collection with id and city
    }

    /**
     * Clean and format JSON fields for storage
     * Converts empty strings/arrays to null, and ensures JSON fields are properly formatted
     */
    private function cleanAndFormatJsonFields(array $data): array
    {
        if (empty($data['vendor_type'])) {
            $data['vendor_type'] = 'main';
        }

        // Fields that should be stored as JSON arrays
        $jsonArrayFields = ['number', 'email', 'service_type'];

        foreach ($jsonArrayFields as $field) {
            if (isset($data[$field])) {
                // If it's an empty string or empty array, set to null
                if ($data[$field] === '' || (is_array($data[$field]) && count($data[$field]) === 0)) {
                    $data[$field] = null;
                }
                // If it's a string, convert to single-element array
                elseif (is_string($data[$field])) {
                    $data[$field] = [$data[$field]];
                }
                // If it's already an array, filter out empty strings
                elseif (is_array($data[$field])) {
                    $data[$field] = array_values(array_filter($data[$field], fn($item) => $item !== '' && $item !== null));
                    // If array becomes empty after filtering, set to null
                    if (count($data[$field]) === 0) {
                        $data[$field] = null;
                    }
                }
            }
        }

        return $data;
    }
}
