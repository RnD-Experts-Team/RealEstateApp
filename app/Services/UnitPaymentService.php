<?php

namespace App\Services;

use App\Models\UnitPayment;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class UnitPaymentService
{
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = UnitPayment::with([
            'unit.property.city',
        ]);

        if (
            !array_key_exists('is_hidden', $filters)
            || $filters['is_hidden'] === ''
            || $filters['is_hidden'] === null
        ) {
            $filters['is_hidden'] = 'false';
        }

        $isHidden = filter_var($filters['is_hidden'], FILTER_VALIDATE_BOOLEAN);
        $query->where('is_hidden', $isHidden);

        if (!empty($filters['city_id'])) {
            $query->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('city_id', $filters['city_id']);
            });
        }

        if (!empty($filters['property_id'])) {
            $query->whereHas('unit', function ($q) use ($filters) {
                $q->where('property_id', $filters['property_id']);
            });
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['date'])) {
            $query->whereDate('date', $filters['date']);
        }

        return $query
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): UnitPayment
    {
        return UnitPayment::create($data);
    }

    public function update(UnitPayment $payment, array $data): UnitPayment
    {
        $payment->update($data);
        return $payment;
    }

    public function hide(UnitPayment $payment): bool
    {
        return $payment->update(['is_hidden' => true]);
    }

    public function unhide(UnitPayment $payment): bool
    {
        return $payment->update(['is_hidden' => false]);
    }

    public function delete(UnitPayment $payment): void
    {
        $payment->delete();
    }
}