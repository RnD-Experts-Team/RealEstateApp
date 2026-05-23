<?php

namespace App\Services;

use App\Models\Tour;
use App\Models\Representative;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class TourService
{
    public function list(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Tour::with([
            'unit.property.city',
            'representative',
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

        if (!empty($filters['representative_id'])) {
            $query->where('representative_id', $filters['representative_id']);
        }

        if (!empty($filters['unit_id'])) {
            $query->where('unit_id', $filters['unit_id']);
        }

        if (!empty($filters['property_id'])) {
            $query->whereHas('unit', function ($q) use ($filters) {
                $q->where('property_id', $filters['property_id']);
            });
        }

        if (!empty($filters['city_id'])) {
            $query->whereHas('unit.property', function ($q) use ($filters) {
                $q->where('city_id', $filters['city_id']);
            });
        }

        if (!empty($filters['date'])) {
            $query->whereDate('date', $filters['date']);
        }

        if (!empty($filters['prospect'])) {
            $query->where('prospect', 'like', '%' . $filters['prospect'] . '%');
        }

        if (array_key_exists('confirmed', $filters) && $filters['confirmed'] !== '' && $filters['confirmed'] !== null) {
            $confirmed = filter_var($filters['confirmed'], FILTER_VALIDATE_BOOLEAN);
            $query->where('confirmed', $confirmed);
        }

        return $query
            ->orderBy('date', 'desc')
            ->orderBy('time', 'desc')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function createTour(array $data): Tour
    {
        return Tour::create($data);
    }

    public function updateTour(Tour $tour, array $data): Tour
    {
        $tour->update($data);
        return $tour;
    }

    public function hideTour(Tour $tour): bool
    {
        return $tour->update(['is_hidden' => true]);
    }

    public function unhideTour(Tour $tour): bool
    {
        return $tour->update(['is_hidden' => false]);
    }

    public function deleteTour(Tour $tour): void
    {
        $tour->delete();
    }

    public function allRepresentatives()
    {
        return Representative::withTrashed()->orderBy('name')->get();
    }

    public function createRepresentative(array $data): Representative
    {
        return Representative::create($data);
    }

    public function updateRepresentative(Representative $rep, array $data): Representative
    {
        $rep->update($data);
        return $rep;
    }

    public function deleteRepresentative(Representative $rep): void
    {
        $rep->delete();
    }

    public function restoreRepresentative(int $id): ?Representative
    {
        $rep = Representative::withTrashed()->find($id);
        if ($rep) {
            $rep->restore();
        }
        return $rep;
    }
}