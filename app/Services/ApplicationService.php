<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Unit;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Cities;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;



class ApplicationService
{
    public function getAllPaginated(int|string $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Application::with(['unit.property.city'])
            ->whereHas('unit', function ($unitQuery) {
                $unitQuery->where('is_archived', false);
            });
$isHiddenFilter = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
if ($isHiddenFilter) {
    $query->where('is_hidden', true);
} else {
    $query->where('is_hidden', false);
}
        // Apply filters using relationships
        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($cityQuery) use ($filters) {
                $cityQuery->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('property_name', 'like', '%' . $filters['property'] . '%');
            });
        }

        if (!empty($filters['unit'])) {
            $query->whereHas('unit', function ($unitQuery) use ($filters) {
                $unitQuery->where('unit_name', 'like', '%' . $filters['unit'] . '%');
            });
        }

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['co_signer'])) {
            $query->where('co_signer', 'like', '%' . $filters['co_signer'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['applicant_applied_from'])) {
            $query->where('applicant_applied_from', $filters['applicant_applied_from']);
        }

        if (!empty($filters['stage_in_progress'])) {
            $query->where('stage_in_progress', $filters['stage_in_progress']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        if ($perPage === 'all') {
            $items = $query->orderBy('date', 'desc')->get();
            $paginator = new LengthAwarePaginator(
                $items,
                $items->count(),
                $items->count(),
                1,
                [
                    'path' => request()->url(),
                    'pageName' => 'page',
                ]
            );
            $paginator->appends(array_merge($filters, ['per_page' => 'all']));
            return $paginator;
        }

        $paginator = $query->orderBy('date', 'desc')->paginate((int) $perPage);
        $paginator->appends(array_merge($filters, ['per_page' => $perPage]));
        return $paginator;
    }

    public function create(array $data): Application
    {
        unset($data['is_hidden']); // ✅ prevent mass assignment
        // Handle file uploads if attachments are present
        if (isset($data['attachments']) && is_array($data['attachments'])) {
            $attachmentData = $this->handleFileUploads($data['attachments']);
            $data['attachment_name'] = $attachmentData['names'];
            $data['attachment_path'] = $attachmentData['paths'];
            unset($data['attachments']);
        }

        // Clean empty strings to null for nullable fields only
        $data = $this->cleanEmptyStringsForNullableFields($data);

        return Application::create($data);
    }

    public function findById(int $id): Application
    {
        return Application::with(['unit.property.city'])->findOrFail($id);
    }

    // App\Services\ApplicationService.php
    public function update(Application $application, array $data): Application
    {
        unset($data['is_hidden']); // ✅ prevent mass assignment

        Log::info('UPDATE payload', [
            'id' => $application->id,
            'removed' => $data['removed_attachment_indices'],
            'files_count' => is_array($data['attachments']) ? count($data['attachments']) : 0,
        ]);
        if (!empty($data['removed_attachment_indices'])) {
            $this->removeAttachmentsByIndices($application, $data['removed_attachment_indices']);
            unset($data['removed_attachment_indices']);
            $application->refresh(); // ✅ ensure we see arrays after removal
        }

        if (!empty($data['attachments'])) {
            $attachmentData = $this->handleFileUploads($data['attachments']);
            $existingNames = $application->attachment_name ?? [];
            $existingPaths = $application->attachment_path ?? [];

            $data['attachment_name'] = array_merge($existingNames, $attachmentData['names']);
            $data['attachment_path'] = array_merge($existingPaths, $attachmentData['paths']);
            unset($data['attachments']);
        }

        // optional: normalize date if still ''
        if (isset($data['date']) && $data['date'] === '') $data['date'] = null;

        $data = $this->cleanEmptyStringsForNullableFields($data);
        $application->update($data);

        return $application->fresh(['unit.property.city']);
    }


    public function delete(Application $application): bool
    {
        // Delete associated files before archiving
        $this->deleteAttachments($application);

        // Use soft delete by archiving instead of hard delete
        return $application->archive();
    }

    public function archive(Application $application): bool
    {
        return $application->archive();
    }

    public function restore(Application $application): bool
    {
        return $application->restore();
    }

    public function deleteAttachment(Application $application, int $index): bool
    {
        $names = $application->attachment_name ?? [];
        $paths = $application->attachment_path ?? [];

        if (isset($paths[$index])) {
            // Delete the file from storage
            Storage::disk('public')->delete($paths[$index]);

            // Remove from arrays
            unset($names[$index]);
            unset($paths[$index]);

            // Re-index arrays
            $names = array_values($names);
            $paths = array_values($paths);

            // Update the application
            $application->update([
                'attachment_name' => $names,
                'attachment_path' => $paths,
            ]);

            return true;
        }

        return false;
    }

    public function getByStatus(string $status): Collection
    {
        return Application::with(['unit.property.city'])
            ->where('status', $status)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getByStage(string $stage): Collection
    {
        return Application::with(['unit.property.city'])
            ->where('stage_in_progress', $stage)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getStatistics(): array
    {
        $total = Application::count();
        $statusCounts = Application::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $stageCounts = Application::selectRaw('stage_in_progress, COUNT(*) as count')
            ->groupBy('stage_in_progress')
            ->pluck('count', 'stage_in_progress')
            ->toArray();

        $appliedFromCounts = Application::selectRaw('applicant_applied_from, COUNT(*) as count')
            ->whereNotNull('applicant_applied_from')
            ->groupBy('applicant_applied_from')
            ->pluck('count', 'applicant_applied_from')
            ->toArray();

        return [
            'total' => $total,
            'status_counts' => $statusCounts,
            'stage_counts' => $stageCounts,
            'applied_from_counts' => $appliedFromCounts,
        ];
    }

    public function getRecentApplications(int $limit = 10): Collection
    {
        return Application::with(['unit.property.city'])
            ->orderBy('date', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getApplicationsThisMonth(): Collection
    {
        return Application::with(['unit.property.city'])
            ->whereMonth('date', now()->month)
            ->whereYear('date', now()->year)
            ->orderBy('date', 'desc')
            ->get();
    }

    /**
     * Get distinct, non-archived city names for filters
     */
    public function getFilterCityNames(): array
    {
        return Cities::select('city')
            ->distinct()
            ->orderBy('city')
            ->pluck('city')
            ->toArray();
    }

    /**
     * Get distinct, non-archived property names for filters
     */
    public function getFilterPropertyNames(): array
    {
        return PropertyInfoWithoutInsurance::select('property_name')
            ->distinct()
            ->orderBy('property_name')
            ->pluck('property_name')
            ->toArray();
    }

    /**
     * Get distinct, non-archived unit names for filters
     */
    public function getFilterUnitNames(): array
    {
        return Unit::select('unit_name')
            ->distinct()
            ->orderBy('unit_name')
            ->pluck('unit_name')
            ->toArray();
    }

    private function handleFileUploads(array $files): array
    {
        $names = [];
        $paths = [];

        foreach ($files as $file) {
            if ($file instanceof UploadedFile) {
                $originalName = $file->getClientOriginalName();
                $path = $file->store('applications', 'public');

                $names[] = $originalName;
                $paths[] = $path;
            }
        }

        return [
            'names' => $names,
            'paths' => $paths,
        ];
    }

    private function removeAttachmentsByIndices(Application $application, array $indices): void
    {
        $names = $application->attachment_name ?? [];
        $paths = $application->attachment_path ?? [];

        // Delete files from storage for the specified indices
        foreach ($indices as $index) {
            if (isset($paths[$index])) {
                Storage::disk('public')->delete($paths[$index]);
            }
        }

        // Remove items at specified indices (in reverse order to maintain correct indexing)
        foreach (array_reverse($indices) as $index) {
            unset($names[$index]);
            unset($paths[$index]);
        }

        // Re-index arrays
        $names = array_values($names);
        $paths = array_values($paths);

        // Update the application
        $application->update([
            'attachment_name' => $names,
            'attachment_path' => $paths,
        ]);
    }

    private function deleteAttachments(Application $application): void
    {
        $paths = $application->attachment_path ?? [];

        foreach ($paths as $path) {
            if (Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }
    }

    private function cleanEmptyStringsForNullableFields(array $data): array
    {
        // Updated list of nullable fields including new ones
        $nullableFields = ['status', 'applicant_applied_from', 'stage_in_progress', 'notes', 'co_signer'];

        foreach ($nullableFields as $field) {
            if (isset($data[$field]) && $data[$field] === '') {
                $data[$field] = null;
            }
        }

        return $data;
    }

    /**
     * Get ordered application IDs matching filters (used for prev/next navigation)
     */
    public function getFilteredOrderedApplicationIds(array $filters = []): array
    {
        $query = Application::with(['unit.property.city'])
            ->whereHas('unit', function ($unitQuery) {
                $unitQuery->where('is_archived', false);
            });
$isHiddenFilter = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
if ($isHiddenFilter) {
    $query->where('is_hidden', true);
} else {
    $query->where('is_hidden', false);
}
        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($cityQuery) use ($filters) {
                $cityQuery->where('city', 'like', '%' . $filters['city'] . '%');
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($propertyQuery) use ($filters) {
                $propertyQuery->where('property_name', 'like', '%' . $filters['property'] . '%');
            });
        }

        if (!empty($filters['unit'])) {
            $query->whereHas('unit', function ($unitQuery) use ($filters) {
                $unitQuery->where('unit_name', 'like', '%' . $filters['unit'] . '%');
            });
        }

        if (!empty($filters['name'])) {
            $query->where('name', 'like', '%' . $filters['name'] . '%');
        }

        if (!empty($filters['co_signer'])) {
            $query->where('co_signer', 'like', '%' . $filters['co_signer'] . '%');
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['applicant_applied_from'])) {
            $query->where('applicant_applied_from', $filters['applicant_applied_from']);
        }

        if (!empty($filters['stage_in_progress'])) {
            $query->where('stage_in_progress', $filters['stage_in_progress']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('date', '<=', $filters['date_to']);
        }

        return $query
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->pluck('id')
            ->toArray();
    }

    /**
     * Compute previous and next application IDs within the filtered ordering.
     */
    public function getAdjacentApplicationIds(array $filters, int $currentId): array
    {
        $ids = $this->getFilteredOrderedApplicationIds($filters);

        $prevId = null;
        $nextId = null;

        if (!empty($ids)) {
            $index = array_search($currentId, $ids, true);
            if ($index !== false) {
                if ($index > 0) {
                    $prevId = $ids[$index - 1];
                }
                if ($index < (count($ids) - 1)) {
                    $nextId = $ids[$index + 1];
                }
            }
        }

        return [
            'prev_id' => $prevId,
            'next_id' => $nextId,
        ];
    }

    public function hideApplication(Application $application): bool
{
    $application->is_hidden = true;
    return $application->save();
}

public function unhideApplication(Application $application): bool
{
    $application->is_hidden = false;
    return $application->save();
}

}
