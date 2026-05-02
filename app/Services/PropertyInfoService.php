<?php
// app/Services/PropertyInfoService.php

namespace App\Services;

use App\Models\PropertyInfo;
use App\Models\PropertyInsuranceAttachment;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class PropertyInfoService
{
    /**
     * Get all property info records with pagination and filters applied.
     * This method supports dynamic per_page values from the frontend.
     *
     * @param int $perPage Number of records per page (controlled by frontend)
     * @param array $filters Array of filter criteria (property_name, insurance_company_name, policy_number, status)
     * @return LengthAwarePaginator Paginated results with metadata (current_page, last_page, total, etc.)
     */
    public function getAllPaginated(int|string $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        // Start query with eager loading of the property and its city to avoid N+1 queries
        $query = PropertyInfo::with(['property.city', 'representative', 'attachments']);

        // Apply property name filter through the relationship
        if (!empty($filters['property_name'])) {
            $query->whereHas('property', function ($subQuery) use ($filters) {
                $subQuery->where('property_name', 'like', '%' . $filters['property_name'] . '%');
            });
        }

        // Apply insurance company name filter
        if (!empty($filters['insurance_company_name'])) {
            $query->where('insurance_company_name', 'like', '%' . $filters['insurance_company_name'] . '%');
        }

        // Apply policy number filter
        if (!empty($filters['policy_number'])) {
            $query->where('policy_number', 'like', '%' . $filters['policy_number'] . '%');
        }

        // Apply status filter (Active/Expired)
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Resolve per-page: if 'all', paginate with total count so all appear in one page
        $resolvedPerPage = ($perPage === 'all') ? max(1, $query->count()) : (int) $perPage;

        // Order by expiration date and paginate
        // The paginate() method automatically handles page parameter from the request
        return $query->orderBy('expiration_date', 'asc')->paginate($resolvedPerPage);
    }

    /**
     * Create a new property info record.
     *
     * @param array $data Validated data from the request
     * @return PropertyInfo Created property info instance with loaded relationship
     */
    public function create(array $data): PropertyInfo
    {
        $uploadedFiles = $data['attachments'] ?? [];
        unset($data['attachments']);

        $property = PropertyInfo::create($data);
        $property->updateStatus();

        if (!empty($uploadedFiles)) {
            $this->saveAttachments($property, $uploadedFiles);
        }

        return $property->load(['property', 'representative', 'attachments']);
    }

    /**
     * Find a property info record by ID with its relationship.
     *
     * @param int $id Property info ID
     * @return PropertyInfo
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException
     */
    public function findById(int $id): PropertyInfo
    {
        return PropertyInfo::with(['property.city', 'representative', 'attachments'])->findOrFail($id);
    }

    /**
     * Update an existing property info record.
     *
     * @param PropertyInfo $propertyInfo The property info instance to update
     * @param array $data Validated data from the request
     * @return PropertyInfo Updated property info instance with fresh relationship data
     */
    public function update(PropertyInfo $propertyInfo, array $data): PropertyInfo
    {
        $deleteIds = $data['delete_attachment_ids'] ?? [];
        $uploadedFiles = $data['attachments'] ?? [];
        unset($data['attachments'], $data['delete_attachment_ids']);

        if (!empty($deleteIds)) {
            $this->deleteAttachmentsByIds($propertyInfo, $deleteIds);
        }

        $propertyInfo->update($data);
        $propertyInfo->updateStatus();

        if (!empty($uploadedFiles)) {
            $this->saveAttachments($propertyInfo, $uploadedFiles);
        }

        return $propertyInfo->fresh(['property', 'representative', 'attachments']);
    }

    /**
     * Soft delete (archive) a property info record.
     *
     * @param PropertyInfo $propertyInfo The property info instance to archive
     * @return bool
     */
    public function delete(PropertyInfo $propertyInfo): bool
    {
        $this->deleteAllAttachments($propertyInfo);
        return $propertyInfo->archive();
    }

    /**
     * Get statistics about property info records.
     * Returns total count, expired count, and active count.
     *
     * @return array Associative array with 'total', 'expired', and 'active' counts
     */
    public function getStatistics(): array
    {
        $total = PropertyInfo::count();
        $expired = PropertyInfo::where('status', 'Expired')->count();
        $active = PropertyInfo::where('status', 'Active')->count();

        return [
            'total' => $total,
            'expired' => $expired,
            'active' => $active,
        ];
    }

    /**
     * Update status for all property info records based on current date.
     * This checks if properties have expired and updates their status accordingly.
     *
     * @return void
     */
    public function updateAllStatuses(): void
    {
        $properties = PropertyInfo::all();

        foreach ($properties as $property) {
            $today = Carbon::now()->startOfDay();
            $expirationDate = Carbon::parse($property->getAttributes()['expiration_date'])->startOfDay();

            // Expired when today is >= expiration date
            $newStatus = $today->gte($expirationDate) ? 'Expired' : 'Active';

            if ($property->status !== $newStatus) {
                $property->status = $newStatus;
                $property->save();
            }
        }
    }

    /**
     * Get the IDs of all filtered records in the correct order.
     * This is used for next/previous navigation in the show page.
     *
     * @param array $filters Array of filter criteria
     * @return array Array of property info IDs matching the filters
     */
    public function getFilteredIds(array $filters = []): array
    {
        // Build the same query as getAllPaginated but only select IDs
        $query = PropertyInfo::query();

        // Apply the same filters as in getAllPaginated
        if (!empty($filters['property_name'])) {
            $query->whereHas('property', function ($subQuery) use ($filters) {
                $subQuery->where('property_name', 'like', '%' . $filters['property_name'] . '%');
            });
        }

        if (!empty($filters['insurance_company_name'])) {
            $query->where('insurance_company_name', 'like', '%' . $filters['insurance_company_name'] . '%');
        }

        if (!empty($filters['policy_number'])) {
            $query->where('policy_number', 'like', '%' . $filters['policy_number'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Return array of IDs in the same order as the index page
        return $query->orderBy('expiration_date', 'asc')->pluck('id')->toArray();
    }

    /**
     * Get the next and previous record IDs based on current ID and filters.
     * This allows navigation through filtered results in the show page.
     *
     * @param int $currentId Current property info ID
     * @param array $filters Applied filters from the index page
     * @return array Associative array with 'next_id' and 'previous_id' (null if at boundaries)
     */
    public function getNextPreviousIds(int $currentId, array $filters = []): array
    {
        // Get all filtered IDs in the correct order
        $filteredIds = $this->getFilteredIds($filters);

        // Find the position of the current ID in the filtered results
        $currentPosition = array_search($currentId, $filteredIds);

        // Initialize next and previous IDs as null
        $nextId = null;
        $previousId = null;

        // If current ID is found in the filtered results
        if ($currentPosition !== false) {
            // Get previous ID if not at the start
            if ($currentPosition > 0) {
                $previousId = $filteredIds[$currentPosition - 1];
            }

            // Get next ID if not at the end
            if ($currentPosition < count($filteredIds) - 1) {
                $nextId = $filteredIds[$currentPosition + 1];
            }
        }

        return [
            'next_id' => $nextId,
            'previous_id' => $previousId,
        ];
    }

    private function saveAttachments(PropertyInfo $property, array $files): void
    {
        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $originalName = $file->getClientOriginalName();
                $path = $file->store('property_insurance_attachments', 'public');

                PropertyInsuranceAttachment::create([
                    'property_info_id' => $property->id,
                    'file_name' => $originalName,
                    'file_path' => $path,
                ]);
            }
        }
    }

    private function deleteAttachmentsByIds(PropertyInfo $property, array $ids): void
    {
        $attachments = $property->attachments()->whereIn('id', $ids)->get();

        foreach ($attachments as $attachment) {
            if (Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }
            $attachment->delete();
        }
    }

    private function deleteAllAttachments(PropertyInfo $property): void
    {
        $attachments = $property->attachments()->get();

        foreach ($attachments as $attachment) {
            if (Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }
            $attachment->delete();
        }
    }
}
