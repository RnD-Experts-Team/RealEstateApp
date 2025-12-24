<?php

namespace App\Services;

use App\Models\VendorTaskTracker;
use App\Models\Unit;
use App\Models\VendorInfo;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use Illuminate\Database\Eloquent\Collection;

class VendorTaskTrackerService
{
    public function getTasks(array $filters)
    {
        $query = VendorTaskTracker::with(['vendor.city', 'unit.property.city']);

        // ✅ hidden filter (default visible)
        $isHidden = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $query->where('is_hidden', $isHidden ? true : false);

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'exclude_completed') {
                $query->where(function ($q) {
                    $q->where('status', '!=', 'Completed')
                      ->orWhereNull('status')
                      ->orWhere('status', '');
                });
            } elseif ($filters['status'] !== 'all') {
                $query->where('status', $filters['status']);
            }
        } else {
            $query->where(function ($q) {
                $q->where('status', '!=', 'Completed')
                  ->orWhereNull('status')
                  ->orWhere('status', '');
            });
        }

        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', "%{$filters['city']}%");
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', "%{$filters['property']}%");
            });
        }

        if (!empty($filters['unit_name'])) {
            $query->whereHas('unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', "%{$filters['unit_name']}%");
            });
        }

        if (!empty($filters['vendor_name'])) {
            $query->whereHas('vendor', function ($q) use ($filters) {
                $q->where('vendor_name', 'like', "%{$filters['vendor_name']}%");
            });
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('unit.property.city', function ($subQ) use ($filters) {
                    $subQ->where('city', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit.property', function ($subQ) use ($filters) {
                    $subQ->where('property_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('vendor', function ($subQ) use ($filters) {
                    $subQ->where('vendor_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit', function ($subQ) use ($filters) {
                    $subQ->where('unit_name', 'like', "%{$filters['search']}%");
                })
                ->orWhere('assigned_tasks', 'like', "%{$filters['search']}%")
                ->orWhere('status', 'like', "%{$filters['search']}%")
                ->orWhere('notes', 'like', "%{$filters['search']}%");
            });
        }

        $query->orderBy('task_submission_date', 'desc')
              ->orderBy('created_at', 'desc');

        $perPage = $filters['per_page'] ?? 15;
        if (is_string($perPage) && strtolower($perPage) === 'all') {
            return $query->get();
        }

        $perPageInt = is_numeric($perPage) ? (int) $perPage : 15;
        return $query->paginate($perPageInt)->withQueryString();
    }

    public function getAllTasks(): Collection
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property'])
            ->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAllTasksExcludingCompleted(): Collection
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property'])
            ->where(function ($q) {
                $q->where('status', '!=', 'Completed')
                    ->orWhereNull('status')
                    ->orWhere('status', '');
            })
            ->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function filterTasks(array $filters): Collection
    {
        $query = VendorTaskTracker::with(['vendor.city', 'unit.property.city']);

        // ✅ hidden filter (default visible)
        $isHidden = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $query->where('is_hidden', $isHidden ? true : false);

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'exclude_completed') {
                $query->where('status', '!=', 'Completed');
            } elseif ($filters['status'] !== 'all') {
                $query->where('status', $filters['status']);
            }
        } else {
            $query->where('status', '!=', 'Completed');
        }

        if (!empty($filters['city'])) {
            $query->whereHas('unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', "%{$filters['city']}%");
            });
        }

        if (!empty($filters['property'])) {
            $query->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', "%{$filters['property']}%");
            });
        }

        if (!empty($filters['unit_name'])) {
            $query->whereHas('unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', "%{$filters['unit_name']}%");
            });
        }

        if (!empty($filters['vendor_name'])) {
            $query->whereHas('vendor', function ($q) use ($filters) {
                $q->where('vendor_name', 'like', "%{$filters['vendor_name']}%");
            });
        }

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereHas('unit.property.city', function ($subQ) use ($filters) {
                    $subQ->where('city', 'like', "%{$filters['search']}%");
                })
                    ->orWhereHas('unit.property', function ($subQ) use ($filters) {
                        $subQ->where('property_name', 'like', "%{$filters['search']}%");
                    })
                    ->orWhereHas('vendor', function ($subQ) use ($filters) {
                        $subQ->where('vendor_name', 'like', "%{$filters['search']}%");
                    })
                    ->orWhereHas('unit', function ($subQ) use ($filters) {
                        $subQ->where('unit_name', 'like', "%{$filters['search']}%");
                    })
                    ->orWhere('assigned_tasks', 'like', "%{$filters['search']}%")
                    ->orWhere('status', 'like', "%{$filters['search']}%")
                    ->orWhere('notes', 'like', "%{$filters['search']}%");
            });
        }

        return $query->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createTask(array $data): VendorTaskTracker
    {
        $data = $this->convertNamesToIds($data);
        return VendorTaskTracker::create($data);
    }

    public function updateTask(VendorTaskTracker $task, array $data): bool
    {
        $data = $this->convertNamesToIds($data);
        return $task->update($data);
    }

    public function deleteTask(VendorTaskTracker $task): bool
    {
        return $task->archive();
    }

    public function archiveTask(VendorTaskTracker $task): bool
    {
        return $task->archive();
    }

    public function restoreTask(VendorTaskTracker $task): bool
    {
        return $task->restore();
    }

    public function hideTask(VendorTaskTracker $task): bool
    {
        $task->is_hidden = true;
        return $task->save();
    }

    public function unhideTask(VendorTaskTracker $task): bool
    {
        $task->is_hidden = false;
        return $task->save();
    }

    public function getArchivedTasks(): Collection
    {
        return VendorTaskTracker::onlyArchived()
            ->with(['vendor.city', 'unit.property'])
            ->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getAllTasksWithArchived(): Collection
    {
        return VendorTaskTracker::withArchived()
            ->with(['vendor.city', 'unit.property'])
            ->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getDropdownData(): array
    {
        // (unchanged)
        $cities = Cities::select('id', 'city')->orderBy('city')->get();

        $properties = PropertyInfoWithoutInsurance::with('city')
            ->select('id', 'property_name', 'city_id')
            ->orderBy('property_name')
            ->get();

        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get()
            ->unique('unit_name')
            ->values();

        $vendors = VendorInfo::with('city')
            ->select('id', 'vendor_name', 'city_id')
            ->orderBy('vendor_name')
            ->get();

        $propertiesByCity = [];
        foreach ($properties as $property) {
            if ($property->city) {
                $cityName = $property->city->city;
                if (!isset($propertiesByCity[$cityName])) $propertiesByCity[$cityName] = [];
                $propertiesByCity[$cityName][] = [
                    'id' => $property->id,
                    'property_name' => $property->property_name
                ];
            }
        }

        $unitsByProperty = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                $propertyName = $unit->property->property_name;

                if (!isset($unitsByProperty[$cityName])) $unitsByProperty[$cityName] = [];
                if (!isset($unitsByProperty[$cityName][$propertyName])) $unitsByProperty[$cityName][$propertyName] = [];

                $unitsByProperty[$cityName][$propertyName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            }
        }

        $unitsByCity = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                if (!isset($unitsByCity[$cityName])) $unitsByCity[$cityName] = [];
                $unitsByCity[$cityName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name
                ];
            }
        }

        $vendorsByCity = [];
        foreach ($vendors as $vendor) {
            if ($vendor->city) {
                $cityName = $vendor->city->city;
                if (!isset($vendorsByCity[$cityName])) $vendorsByCity[$cityName] = [];
                $vendorsByCity[$cityName][] = [
                    'id' => $vendor->id,
                    'vendor_name' => $vendor->vendor_name
                ];
            }
        }

        return [
            'cities' => $cities->map(fn ($city) => ['id' => $city->id, 'city' => $city->city])->toArray(),
            'properties' => $properties->map(fn ($property) => [
                'id' => $property->id,
                'property_name' => $property->property_name,
                'city' => $property->city ? $property->city->city : null
            ])->toArray(),
            'units' => $units->map(fn ($unit) => [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city' => $unit->property && $unit->property->city ? $unit->property->city->city : null
            ])->toArray(),
            'vendors' => $vendors->map(fn ($vendor) => [
                'id' => $vendor->id,
                'vendor_name' => $vendor->vendor_name,
                'city' => $vendor->city ? $vendor->city->city : null
            ])->toArray(),
            'propertiesByCity' => $propertiesByCity,
            'unitsByProperty' => $unitsByProperty,
            'unitsByCity' => $unitsByCity,
            'vendorsByCity' => $vendorsByCity,
        ];
    }

    public function getDrawerDropdownData(): array
    {
        // (unchanged)
        $cities = Cities::select('id', 'city')->orderBy('city')->get();

        $properties = PropertyInfoWithoutInsurance::with('city')
            ->select('id', 'property_name', 'city_id')
            ->orderBy('property_name')
            ->get();

        $units = Unit::with(['property.city'])
            ->select('id', 'unit_name', 'property_id')
            ->orderBy('unit_name')
            ->get();

        $vendors = VendorInfo::with('city')
            ->select('id', 'vendor_name', 'city_id')
            ->orderBy('vendor_name')
            ->get();

        $propertiesByCity = [];
        foreach ($properties as $property) {
            if ($property->city) {
                $cityName = $property->city->city;
                if (!isset($propertiesByCity[$cityName])) $propertiesByCity[$cityName] = [];
                $propertiesByCity[$cityName][] = [
                    'id' => $property->id,
                    'property_name' => $property->property_name,
                ];
            }
        }

        $unitsByProperty = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                $propertyName = $unit->property->property_name;
                if (!isset($unitsByProperty[$cityName])) $unitsByProperty[$cityName] = [];
                if (!isset($unitsByProperty[$cityName][$propertyName])) $unitsByProperty[$cityName][$propertyName] = [];
                $unitsByProperty[$cityName][$propertyName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name,
                ];
            }
        }

        $unitsByCity = [];
        foreach ($units as $unit) {
            if ($unit->property && $unit->property->city) {
                $cityName = $unit->property->city->city;
                if (!isset($unitsByCity[$cityName])) $unitsByCity[$cityName] = [];
                $unitsByCity[$cityName][] = [
                    'id' => $unit->id,
                    'unit_name' => $unit->unit_name,
                ];
            }
        }

        $vendorsByCity = [];
        foreach ($vendors as $vendor) {
            if ($vendor->city) {
                $cityName = $vendor->city->city;
                if (!isset($vendorsByCity[$cityName])) $vendorsByCity[$cityName] = [];
                $vendorsByCity[$cityName][] = [
                    'id' => $vendor->id,
                    'vendor_name' => $vendor->vendor_name,
                ];
            }
        }

        return [
            'cities' => $cities->map(fn ($city) => ['id' => $city->id, 'city' => $city->city])->toArray(),
            'properties' => $properties->map(fn ($property) => [
                'id' => $property->id,
                'property_name' => $property->property_name,
                'city' => $property->city ? $property->city->city : null,
            ])->toArray(),
            'units' => $units->map(fn ($unit) => [
                'id' => $unit->id,
                'unit_name' => $unit->unit_name,
                'property_name' => $unit->property ? $unit->property->property_name : null,
                'city' => $unit->property && $unit->property->city ? $unit->property->city->city : null,
            ])->toArray(),
            'vendors' => $vendors->map(fn ($vendor) => [
                'id' => $vendor->id,
                'vendor_name' => $vendor->vendor_name,
                'city' => $vendor->city ? $vendor->city->city : null,
            ])->toArray(),
            'propertiesByCity' => $propertiesByCity,
            'unitsByProperty' => $unitsByProperty,
            'unitsByCity' => $unitsByCity,
            'vendorsByCity' => $vendorsByCity,
        ];
    }

    private function convertNamesToIds(array $data): array
    {
        if (isset($data['vendor_name']) && !isset($data['vendor_id'])) {
            $vendor = VendorInfo::where('vendor_name', $data['vendor_name'])->first();
            if ($vendor) $data['vendor_id'] = $vendor->id;
            unset($data['vendor_name']);
        }

        if (isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unitQuery = Unit::where('unit_name', $data['unit_name']);

            if (isset($data['city'])) {
                $unitQuery->whereHas('property.city', function ($q) use ($data) {
                    $q->where('city', $data['city']);
                });
            }

            $unit = $unitQuery->first();
            if ($unit) $data['unit_id'] = $unit->id;
            unset($data['unit_name']);
        }

        unset($data['city'], $data['property_name']);
        return $data;
    }

    public function getTaskWithNames(int $taskId): ?VendorTaskTracker
    {
        return VendorTaskTracker::with(['vendor.city', 'unit.property.city'])->find($taskId);
    }

    public function getTasksForExport(): array
    {
        // ✅ export visible only (matches default screen)
        return VendorTaskTracker::with(['vendor.city', 'unit.property.city'])
            ->where('is_hidden', false)
            ->get()
            ->map(function ($task) {
                return [
                    'id' => $task->id,
                    'city' => $task->unit?->property?->city?->city ?? '',
                    'property_name' => $task->unit?->property?->property_name ?? '',
                    'unit_name' => $task->unit?->unit_name ?? '',
                    'vendor_name' => $task->vendor?->vendor_name ?? '',
                    'task_submission_date' => $task->task_submission_date,
                    'assigned_tasks' => $task->assigned_tasks,
                    'any_scheduled_visits' => $task->any_scheduled_visits,
                    'task_ending_date' => $task->task_ending_date,
                    'notes' => $task->notes,
                    'status' => $task->status,
                    'urgent' => $task->urgent,
                ];
            })
            ->toArray();
    }

    public function getAdjacentTaskIds(array $filters, int $currentTaskId): array
    {
        $baseQuery = VendorTaskTracker::with(['vendor.city', 'unit.property.city']);

        // ✅ hidden filter (keep navigation within current view)
        $isHidden = filter_var($filters['is_hidden'] ?? false, FILTER_VALIDATE_BOOLEAN);
        $baseQuery->where('is_hidden', $isHidden ? true : false);

        if (!empty($filters['status'])) {
            if ($filters['status'] === 'exclude_completed') {
                $baseQuery->where(function ($q) {
                    $q->where('status', '!=', 'Completed')
                      ->orWhereNull('status')
                      ->orWhere('status', '');
                });
            } elseif ($filters['status'] !== 'all') {
                $baseQuery->where('status', $filters['status']);
            }
        } else {
            $baseQuery->where(function ($q) {
                $q->where('status', '!=', 'Completed')
                  ->orWhereNull('status')
                  ->orWhere('status', '');
            });
        }

        if (!empty($filters['city'])) {
            $baseQuery->whereHas('unit.property.city', function ($q) use ($filters) {
                $q->where('city', 'like', "%{$filters['city']}%");
            });
        }

        if (!empty($filters['property'])) {
            $baseQuery->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('property_name', 'like', "%{$filters['property']}%");
            });
        }

        if (!empty($filters['unit_name'])) {
            $baseQuery->whereHas('unit', function ($q) use ($filters) {
                $q->where('unit_name', 'like', "%{$filters['unit_name']}%");
            });
        }

        if (!empty($filters['vendor_name'])) {
            $baseQuery->whereHas('vendor', function ($q) use ($filters) {
                $q->where('vendor_name', 'like', "%{$filters['vendor_name']}%");
            });
        }

        if (!empty($filters['search'])) {
            $baseQuery->where(function ($q) use ($filters) {
                $q->whereHas('unit.property.city', function ($subQ) use ($filters) {
                    $subQ->where('city', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit.property', function ($subQ) use ($filters) {
                    $subQ->where('property_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('vendor', function ($subQ) use ($filters) {
                    $subQ->where('vendor_name', 'like', "%{$filters['search']}%");
                })
                ->orWhereHas('unit', function ($subQ) use ($filters) {
                    $subQ->where('unit_name', 'like', "%{$filters['search']}%");
                })
                ->orWhere('assigned_tasks', 'like', "%{$filters['search']}%")
                ->orWhere('status', 'like', "%{$filters['search']}%")
                ->orWhere('notes', 'like', "%{$filters['search']}%");
            });
        }

        $current = VendorTaskTracker::find($currentTaskId);
        if (!$current) {
            return ['prev_id' => null, 'next_id' => null];
        }

        $prevQuery = clone $baseQuery;
        $prevId = $prevQuery
            ->where(function ($q) use ($current) {
                $q->where('task_submission_date', '>', $current->task_submission_date)
                  ->orWhere(function ($q2) use ($current) {
                      $q2->where('task_submission_date', '=', $current->task_submission_date)
                         ->where('created_at', '>', $current->created_at);
                  });
            })
            ->orderBy('task_submission_date', 'asc')
            ->orderBy('created_at', 'asc')
            ->value('id');

        $nextQuery = clone $baseQuery;
        $nextId = $nextQuery
            ->where(function ($q) use ($current) {
                $q->where('task_submission_date', '<', $current->task_submission_date)
                  ->orWhere(function ($q2) use ($current) {
                      $q2->where('task_submission_date', '=', $current->task_submission_date)
                         ->where('created_at', '<', $current->created_at);
                  });
            })
            ->orderBy('task_submission_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->value('id');

        return [
            'prev_id' => $prevId ?: null,
            'next_id' => $nextId ?: null,
        ];
    }
}
