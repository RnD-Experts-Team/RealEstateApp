import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Search, X } from 'lucide-react';
import React, { useRef, useState, useEffect } from 'react';

interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface MoveInFiltersProps {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    units: UnitData[];
    initialFilters: {
        city: string;
        property: string;
        unit: string;
        is_hidden: boolean; // ✅ NEW
    };
    onSearch: (filters: { city: string; property: string; unit: string; is_hidden: boolean }) => void; // ✅
    onClear: () => void;
    hasActiveFilters: boolean;
}

export default function MoveInFilters({
    cities,
    properties,
    units,
    initialFilters,
    onSearch,
    onClear,
    hasActiveFilters,
}: MoveInFiltersProps) {
    const [tempFilters, setTempFilters] = useState(initialFilters);

    useEffect(() => {
        setTempFilters(initialFilters);
    }, [initialFilters]);

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);

    const filteredCities = cities
        .map((c) => c.city)
        .filter((name, index, self) => self.indexOf(name) === index)
        .filter((name) => name.toLowerCase().includes(tempFilters.city.toLowerCase()));

    const filteredProperties = properties
        .map((p) => p.property_name)
        .filter((name, index, self) => self.indexOf(name) === index)
        .filter((name) => name.toLowerCase().includes(tempFilters.property.toLowerCase()));

    const filteredUnits = Array.from(new Set(units.map((u) => u.unit_name))).filter((name) =>
        name.toLowerCase().includes(tempFilters.unit.toLowerCase()),
    );

    const handleTempFilterChange = (key: keyof typeof tempFilters, value: any) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const { city, property, unit, is_hidden } = tempFilters;
        onSearch({ city, property, unit, is_hidden });
    };

    return (
        <CardHeader>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                    {/* City */}
                    <div className="relative">
                        <Input
                            ref={cityInputRef}
                            type="text"
                            placeholder="Filter by city..."
                            value={tempFilters.city}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('city', value);
                                setShowCityDropdown(true);
                            }}
                            onFocus={() => setShowCityDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCityDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showCityDropdown && filteredCities.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredCities.map((cityName) => (
                                    <div
                                        key={cityName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('city', cityName);
                                            setShowCityDropdown(false);
                                        }}
                                    >
                                        {cityName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Property */}
                    <div className="relative">
                        <Input
                            ref={propertyInputRef}
                            type="text"
                            placeholder="Filter by property..."
                            value={tempFilters.property}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('property', value);
                                setShowPropertyDropdown(true);
                            }}
                            onFocus={() => setShowPropertyDropdown(true)}
                            onBlur={() => setTimeout(() => setShowPropertyDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showPropertyDropdown && filteredProperties.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredProperties.map((propertyName) => (
                                    <div
                                        key={propertyName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('property', propertyName);
                                            setShowPropertyDropdown(false);
                                        }}
                                    >
                                        {propertyName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Unit */}
                    <div className="relative">
                        <Input
                            ref={unitInputRef}
                            type="text"
                            placeholder="Filter by unit..."
                            value={tempFilters.unit}
                            onChange={(e) => {
                                const value = e.target.value;
                                handleTempFilterChange('unit', value);
                                setShowUnitDropdown(true);
                            }}
                            onFocus={() => setShowUnitDropdown(true)}
                            onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                            className="text-input-foreground bg-input"
                        />
                        {showUnitDropdown && filteredUnits.length > 0 && (
                            <div className="absolute top-full right-0 left-0 z-50 mb-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg">
                                {filteredUnits.map((unitName) => (
                                    <div
                                        key={unitName}
                                        className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                        onClick={() => {
                                            handleTempFilterChange('unit', unitName);
                                            setShowUnitDropdown(false);
                                        }}
                                    >
                                        {unitName}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ✅ Visible/Hidden toggle */}
                    <div className="flex items-center">
                        <div className="w-full flex items-center rounded-md border border-input bg-input p-1 h-10">
                            <Button
                                type="button"
                                variant={tempFilters.is_hidden ? 'outline' : 'default'}
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => handleTempFilterChange('is_hidden', false)}
                            >
                                Visible
                            </Button>
                            <Button
                                type="button"
                                variant={tempFilters.is_hidden ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => handleTempFilterChange('is_hidden', true)}
                            >
                                Hidden
                            </Button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" className="w-full lg:w-auto">
                            <Search className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear */}
                    <div className="flex justify-end lg:justify-start">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setTempFilters({ city: '', property: '', unit: '', is_hidden: false });
                                setShowCityDropdown(false);
                                setShowPropertyDropdown(false);
                                setShowUnitDropdown(false);
                                onClear();
                            }}
                            size="sm"
                            className="flex items-center w-full lg:w-auto"
                            disabled={!hasActiveFilters}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Clear
                        </Button>
                    </div>
                </div>
            </form>
        </CardHeader>
    );
}
