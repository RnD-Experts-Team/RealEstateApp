<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Unit;
use App\Models\Cities;
use App\Models\PropertyInfoWithoutInsurance;
use Illuminate\Pagination\LengthAwarePaginator;

class PaymentService
{
    public function getAllPayments(int|string $perPage = 15): LengthAwarePaginator
    {
        // Default view SHOULD exclude hidden rows
        $query = Payment::with(['unit.property.city'])
            ->where('is_hidden', false)
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        $resolvedPerPage = ($perPage === 'all') ? max(1, $query->count()) : (int) $perPage;
        return $query->paginate($resolvedPerPage);
    }

    public function searchPayments(string $search, int|string $perPage = 15): LengthAwarePaginator
    {
        // Search SHOULD exclude hidden rows by default
        $query = Payment::with(['unit.property.city'])
            ->where(function ($query) use ($search) {
                $query->whereHas('unit.property.city', function ($q) use ($search) {
                    $q->where('city', 'like', "%{$search}%");
                })
                    ->orWhereHas('unit.property', function ($q) use ($search) {
                        $q->where('property_name', 'like', "%{$search}%");
                    })
                    ->orWhereHas('unit', function ($q) use ($search) {
                        $q->where('unit_name', 'like', "%{$search}%");
                    })
                    ->orWhere('status', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%");
            })
            ->where('is_hidden', false)
            ->orderBy('date', 'desc');

        $resolvedPerPage = ($perPage === 'all') ? max(1, $query->count()) : (int) $perPage;
        return $query->paginate($resolvedPerPage);
    }

    public function createPayment(array $data): Payment
    {
        if (!array_key_exists('paid', $data) || $data['paid'] === null || $data['paid'] === '') {
            $data['paid'] = 0;
        }

        // Never allow mass-assign on is_hidden
        unset($data['is_hidden']);

        $data = $this->normalizeFlags($data);

        // If assistance is marked as false, nullify assistance fields
        if (array_key_exists('has_assistance', $data)) {
            $hasAssistance = filter_var($data['has_assistance'], FILTER_VALIDATE_BOOLEAN);
            if ($hasAssistance === false) {
                $data['assistance_amount'] = null;
                $data['assistance_company'] = null;
            }
        }

        if (isset($data['city']) && isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unit = $this->findUnitByNames($data['city'], $data['property_name'] ?? null, $data['unit_name']);
            if ($unit) {
                $data['unit_id'] = $unit->id;
            }
            unset($data['city'], $data['property_name'], $data['unit_name']);
        }

        return Payment::create($data);
    }

    public function updatePayment(Payment $payment, array $data): bool
    {
        if (array_key_exists('paid', $data) && ($data['paid'] === null || $data['paid'] === '')) {
            $data['paid'] = 0;
        }

        unset($data['is_hidden']);

        $data = $this->normalizeFlags($data);

        // If assistance is marked as false, nullify assistance fields
        if (array_key_exists('has_assistance', $data)) {
            $hasAssistance = filter_var($data['has_assistance'], FILTER_VALIDATE_BOOLEAN);
            if ($hasAssistance === false) {
                $data['assistance_amount'] = null;
                $data['assistance_company'] = null;
            }
        }

        if (isset($data['city']) && isset($data['unit_name']) && !isset($data['unit_id'])) {
            $unit = $this->findUnitByNames($data['city'], $data['property_name'] ?? null, $data['unit_name']);
            if ($unit) {
                $data['unit_id'] = $unit->id;
            }
            unset($data['city'], $data['property_name'], $data['unit_name']);
        }

        return $payment->update($data);
    }

    /**
     * Cast the remind / added_to_ledger flags to booleans (null -> false; the columns are NOT NULL)
     */
    private function normalizeFlags(array $data): array
    {
        foreach (['remind', 'added_to_ledger'] as $flag) {
            if (array_key_exists($flag, $data)) {
                $data[$flag] = filter_var($data[$flag], FILTER_VALIDATE_BOOLEAN);
            }
        }

        return $data;
    }

    /**
     * Remind / Added to Ledger filters: null = all, true/false = only matching
     */
    private function applyFlagFilters($query, ?bool $remindFilter, ?bool $addedToLedgerFilter): void
    {
        if ($remindFilter !== null) {
            $query->where('remind', $remindFilter);
        }

        if ($addedToLedgerFilter !== null) {
            $query->where('added_to_ledger', $addedToLedgerFilter);
        }
    }

    public function deletePayment(Payment $payment): bool
    {
        return $payment->archive();
    }

    public function archivePayment(Payment $payment): bool
    {
        return $payment->archive();
    }

    /**
     * Hide a payment (set is_hidden to true) without mass-assignment.
     */
    public function hidePayment(Payment $payment): bool
    {
        $payment->is_hidden = true;
        return $payment->save();
    }

    /**
     * Unhide a payment (set is_hidden to false) without mass-assignment.
     */
    public function unhidePayment(Payment $payment): bool
    {
        $payment->is_hidden = false;
        return $payment->save();
    }

    public function restorePayment(Payment $payment): bool
    {
        return $payment->restore();
    }

    public function getUnitsForDropdowns(): array
    {
        $units = Unit::with(['property.city'])
            ->select('id', 'property_id', 'unit_name')
            ->orderBy('unit_name')
            ->get();

        $cities = [];
        $properties = [];
        $unitsByCity = [];
        $unitsByProperty = [];
        $propertiesByCity = [];
        $unitsData = [];

        foreach ($units as $unit) {
            $cityName = $unit->property && $unit->property->city ? $unit->property->city->city : 'Unknown City';
            $propertyName = $unit->property ? $unit->property->property_name : 'Unknown Property';
            $unitName = $unit->unit_name;

            if (!in_array($cityName, $cities)) $cities[] = $cityName;
            if (!in_array($propertyName, $properties)) $properties[] = $propertyName;

            if (!isset($unitsByCity[$cityName])) $unitsByCity[$cityName] = [];
            if (!in_array($unitName, $unitsByCity[$cityName])) $unitsByCity[$cityName][] = $unitName;

            if (!isset($unitsByProperty[$propertyName])) $unitsByProperty[$propertyName] = [];
            if (!in_array($unitName, $unitsByProperty[$propertyName])) $unitsByProperty[$propertyName][] = $unitName;

            if (!isset($propertiesByCity[$cityName])) $propertiesByCity[$cityName] = [];
            if (!in_array($propertyName, $propertiesByCity[$cityName])) $propertiesByCity[$cityName][] = $propertyName;

            $unitsData[] = [
                'id' => $unit->id,
                'unit_name' => $unitName,
                'property_name' => $propertyName,
                'city' => $cityName,
            ];
        }

        return [
            'cities' => $cities,
            'properties' => $properties,
            'unitsByCity' => $unitsByCity,
            'unitsByProperty' => $unitsByProperty,
            'propertiesByCity' => $propertiesByCity,
            'units' => $unitsData
        ];
    }

    public function getAllCities(): array
    {
        return Cities::orderBy('city')->pluck('city')->toArray();
    }

    public function getAllProperties(): array
    {
        return PropertyInfoWithoutInsurance::orderBy('property_name')->pluck('property_name')->toArray();
    }

    public function findUnitByNames(?string $cityName, ?string $propertyName, string $unitName): ?Unit
    {
        $query = Unit::with(['property.city'])
            ->where('unit_name', $unitName);

        if ($cityName) {
            $query->whereHas('property.city', function ($q) use ($cityName) {
                $q->where('city', $cityName);
            });
        }

        if ($propertyName) {
            $query->whereHas('property', function ($q) use ($propertyName) {
                $q->where('property_name', $propertyName);
            });
        }

        return $query->first();
    }

    public function getUnitById(int $unitId): ?Unit
    {
        return Unit::with(['property.city'])->find($unitId);
    }

    public function updateAllStatuses(): void
    {
        $payments = Payment::all(); // non-archived due to global scope
        foreach ($payments as $payment) {
            $newStatus = $payment->calculateStatus();
            if ($payment->status !== $newStatus) {
                $payment->status = $newStatus;
                $payment->save();
            }
        }
    }

    /**
     * Filter payments by status, permanent, is_hidden, city, property, and unit
     */
    public function filterPayments(
        ?array $permanentFilter = null,
        ?bool $isHiddenFilter = false,
        ?string $city = null,
        ?string $property = null,
        ?string $unit = null,
        int|string $perPage = 15,
        ?bool $remindFilter = null,
        ?bool $addedToLedgerFilter = null
    ): LengthAwarePaginator {
        $query = Payment::with(['unit.property.city']);

        $this->applyFlagFilters($query, $remindFilter, $addedToLedgerFilter);

        // No status filtering; include all statuses

        if ($permanentFilter && count($permanentFilter) > 0) {
            $query->whereIn('permanent', $permanentFilter);
        }

        // Hidden filter:
        // true  -> show ONLY hidden
        // false -> show ONLY non-hidden (default)
        if ($isHiddenFilter === true) {
            $query->where('is_hidden', true);
        } else {
            $query->where('is_hidden', false);
        }

        if ($city) {
            $query->whereHas('unit.property.city', function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%");
            });
        }

        if ($property) {
            $query->whereHas('unit.property', function ($q) use ($property) {
                $q->where('property_name', 'like', "%{$property}%");
            });
        }

        if ($unit) {
            $query->whereHas('unit', function ($q) use ($unit) {
                $q->where('unit_name', 'like', "%{$unit}%");
            });
        }

        $query = $query->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc');

        $resolvedPerPage = ($perPage === 'all') ? max(1, $query->count()) : (int) $perPage;
        return $query->paginate($resolvedPerPage);
    }

    /**
     * Return ordered payment IDs for the given filters, used for next/previous navigation.
     * Ordering matches the index: date desc, then created_at desc.
     */
    public function getFilteredOrderedPaymentIds(
        ?array $permanentFilter = null,
        ?bool $isHiddenFilter = false,
        ?string $city = null,
        ?string $property = null,
        ?string $unit = null,
        ?bool $remindFilter = null,
        ?bool $addedToLedgerFilter = null
    ): array {
        $query = Payment::query()->with(['unit.property.city']);

        $this->applyFlagFilters($query, $remindFilter, $addedToLedgerFilter);

        if ($permanentFilter && count($permanentFilter) > 0) {
            $query->whereIn('permanent', $permanentFilter);
        }

        if ($isHiddenFilter === true) {
            $query->where('is_hidden', true);
        } else {
            $query->where('is_hidden', false);
        }

        if ($city) {
            $query->whereHas('unit.property.city', function ($q) use ($city) {
                $q->where('city', 'like', "%{$city}%");
            });
        }

        if ($property) {
            $query->whereHas('unit.property', function ($q) use ($property) {
                $q->where('property_name', 'like', "%{$property}%");
            });
        }

        if ($unit) {
            $query->whereHas('unit', function ($q) use ($unit) {
                $q->where('unit_name', 'like', "%{$unit}%");
            });
        }

        return $query
            ->orderBy('date', 'desc')
            ->orderBy('created_at', 'desc')
            ->pluck('id')
            ->toArray();
    }
}
