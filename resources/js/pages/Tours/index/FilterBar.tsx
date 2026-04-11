import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface Representative {
    id: number;
    name: string;
    deleted_at?: string | null;
}

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city_id: number;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_id: number;
}

interface FilterBarProps {
    filters: {
        representative_id?: string;
        city_id?: string;
        property_id?: string;
        unit_id?: string;
        date?: string;
        is_hidden?: string | boolean;
    };
    representatives: Representative[];
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    onSearch: (filters: Record<string, string>) => void;
    onClear: () => void;
}

export default function FilterBar({ filters, representatives, cities, properties, units, onSearch, onClear }: FilterBarProps) {
    const [tempFilters, setTempFilters] = useState({
        representative_id: filters.representative_id || '',
        city_id: filters.city_id || '',
        property_id: filters.property_id || '',
        unit_id: filters.unit_id || '',
        date: filters.date || '',
        is_hidden: String(filters.is_hidden).toLowerCase() === 'true' || filters.is_hidden === true,
    });

    useEffect(() => {
        setTempFilters({
            representative_id: filters.representative_id || '',
            city_id: filters.city_id || '',
            property_id: filters.property_id || '',
            unit_id: filters.unit_id || '',
            date: filters.date || '',
            is_hidden: String(filters.is_hidden).toLowerCase() === 'true' || filters.is_hidden === true,
        });
    }, [filters]);

    const availableProperties = useMemo(() => {
        if (!tempFilters.city_id) return [];
        return properties.filter((property) => String(property.city_id) === String(tempFilters.city_id));
    }, [properties, tempFilters.city_id]);

    const availableUnits = useMemo(() => {
        if (!tempFilters.property_id) return [];
        return units.filter((unit) => String(unit.property_id) === String(tempFilters.property_id));
    }, [units, tempFilters.property_id]);

    const handleSearch = () => {
        const payload: Record<string, string> = {};

        if (tempFilters.representative_id) payload.representative_id = tempFilters.representative_id;
        if (tempFilters.city_id) payload.city_id = tempFilters.city_id;
        if (tempFilters.property_id) payload.property_id = tempFilters.property_id;
        if (tempFilters.unit_id) payload.unit_id = tempFilters.unit_id;
        if (tempFilters.date) payload.date = tempFilters.date;
        if (tempFilters.is_hidden) payload.is_hidden = 'true';

        onSearch(payload);
    };

    const handleClear = () => {
        setTempFilters({
            representative_id: '',
            city_id: '',
            property_id: '',
            unit_id: '',
            date: '',
            is_hidden: false,
        });
        onClear();
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Representative</label>
                    <select
                        value={tempFilters.representative_id}
                        onChange={(e) => setTempFilters((prev) => ({ ...prev, representative_id: e.target.value }))}
                        className="text-input-foreground w-full rounded-md border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="">All Representatives</option>
                        {representatives.map((rep) => (
                            <option key={rep.id} value={String(rep.id)}>
                                {rep.name}
                                {rep.deleted_at ? ' (Deleted)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">City</label>
                    <select
                        value={tempFilters.city_id}
                        onChange={(e) =>
                            setTempFilters((prev) => ({
                                ...prev,
                                city_id: e.target.value,
                                property_id: '',
                                unit_id: '',
                            }))
                        }
                        className="text-input-foreground w-full rounded-md border border-input bg-input px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
                    >
                        <option value="">All Cities</option>
                        {cities.map((city) => (
                            <option key={city.id} value={String(city.id)}>
                                {city.city}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Property</label>
                    <select
                        value={tempFilters.property_id}
                        onChange={(e) =>
                            setTempFilters((prev) => ({
                                ...prev,
                                property_id: e.target.value,
                                unit_id: '',
                            }))
                        }
                        disabled={!tempFilters.city_id}
                        className="text-input-foreground w-full rounded-md border border-input bg-input px-3 py-2 text-sm disabled:opacity-50"
                    >
                        <option value="">All Properties</option>
                        {availableProperties.map((property) => (
                            <option key={property.id} value={String(property.id)}>
                                {property.property_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Unit</label>
                    <select
                        value={tempFilters.unit_id}
                        onChange={(e) => setTempFilters((prev) => ({ ...prev, unit_id: e.target.value }))}
                        disabled={!tempFilters.property_id}
                        className="text-input-foreground w-full rounded-md border border-input bg-input px-3 py-2 text-sm disabled:opacity-50"
                    >
                        <option value="">All Units</option>
                        {availableUnits.map((unit) => (
                            <option key={unit.id} value={String(unit.id)}>
                                {unit.unit_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Date</label>
                    <Input
                        type="date"
                        value={tempFilters.date}
                        onChange={(e) => setTempFilters((prev) => ({ ...prev, date: e.target.value }))}
                        className="text-input-foreground w-full bg-input"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Visibility</label>
                    <div className="flex h-10 w-full items-center rounded-md border border-input bg-input p-1">
                        <Button
                            type="button"
                            variant={!tempFilters.is_hidden ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 flex-1"
                            onClick={() => setTempFilters((prev) => ({ ...prev, is_hidden: false }))}
                        >
                            Visible
                        </Button>
                        <Button
                            type="button"
                            variant={tempFilters.is_hidden ? 'default' : 'outline'}
                            size="sm"
                            className="h-8 flex-1"
                            onClick={() => setTempFilters((prev) => ({ ...prev, is_hidden: true }))}
                        >
                            Hidden
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button onClick={handleClear} variant="outline" className="w-full sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>

                <Button onClick={handleSearch} className="w-full sm:w-auto">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </div>
        </div>
    );
}
