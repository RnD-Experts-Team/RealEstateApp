import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface MoveOutFiltersProps {
    cities: string[];
    properties: string[];
    allUnits: string[];
    onSearch: (filters: { city_id: string | null; property_id: string | null; unit_id: string | null; is_hidden: boolean }) => void;
    onClear: () => void;
    initialFilters?: { city?: string; property?: string; unit?: string; is_hidden?: boolean };
}

export default function MoveOutFilters({ cities, properties, allUnits, onSearch, onClear, initialFilters }: MoveOutFiltersProps) {
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        is_hidden: false, // ✅ NEW
    });

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);

    const cityDropdownRef = useRef<HTMLDivElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const unitInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialFilters) {
            setTempFilters({
                city: initialFilters.city ?? '',
                property: initialFilters.property ?? '',
                unit: initialFilters.unit ?? '',
                is_hidden: initialFilters.is_hidden ?? false,
            });
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                cityDropdownRef.current &&
                !cityDropdownRef.current.contains(event.target as Node) &&
                cityInputRef.current &&
                !cityInputRef.current.contains(event.target as Node)
            ) {
                setShowCityDropdown(false);
            }
            if (
                propertyDropdownRef.current &&
                !propertyDropdownRef.current.contains(event.target as Node) &&
                propertyInputRef.current &&
                !propertyInputRef.current.contains(event.target as Node)
            ) {
                setShowPropertyDropdown(false);
            }
            if (
                unitDropdownRef.current &&
                !unitDropdownRef.current.contains(event.target as Node) &&
                unitInputRef.current &&
                !unitInputRef.current.contains(event.target as Node)
            ) {
                setShowUnitDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [initialFilters]);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (cityName: string) => {
        handleTempFilterChange('city', cityName);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(true);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(true);
    };

    const handlePropertySelect = (propertyName: string) => {
        handleTempFilterChange('property', propertyName);
        setShowPropertyDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(true);
    };

    const handleUnitSelect = (unitName: string) => {
        handleTempFilterChange('unit', unitName);
        setShowUnitDropdown(false);
    };

    const handleSearchClick = () => {
        onSearch({
            city_id: tempFilters.city || null,
            property_id: tempFilters.property || null,
            unit_id: tempFilters.unit || null,
            is_hidden: tempFilters.is_hidden, // ✅ NEW
        });
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            is_hidden: false, // ✅ NEW
        });
        onClear();
    };

    const filteredCities = cities.filter((cityName) => cityName.toLowerCase().includes(tempFilters.city.toLowerCase()));
    const filteredProperties = properties.filter((propertyName) =>
        propertyName.toLowerCase().includes(tempFilters.property.toLowerCase()),
    );
    const filteredUnits = allUnits.filter((unitName) => unitName.toLowerCase().includes(tempFilters.unit.toLowerCase()));

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {/* City */}
            <div className="relative">
                <Input
                    ref={cityInputRef}
                    type="text"
                    placeholder="City"
                    value={tempFilters.city}
                    onChange={handleCityInputChange}
                    onFocus={() => setShowCityDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showCityDropdown && filteredCities.length > 0 && (
                    <div
                        ref={cityDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredCities.map((name) => (
                            <div
                                key={name}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleCitySelect(name)}
                            >
                                {name}
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
                    placeholder="Property"
                    value={tempFilters.property}
                    onChange={handlePropertyInputChange}
                    onFocus={() => setShowPropertyDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showPropertyDropdown && filteredProperties.length > 0 && (
                    <div
                        ref={propertyDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredProperties.map((name) => (
                            <div
                                key={name}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handlePropertySelect(name)}
                            >
                                {name}
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
                    placeholder="Unit"
                    value={tempFilters.unit}
                    onChange={handleUnitInputChange}
                    onFocus={() => setShowUnitDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showUnitDropdown && filteredUnits.length > 0 && (
                    <div
                        ref={unitDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredUnits.map((name) => (
                            <div
                                key={name}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleUnitSelect(name)}
                            >
                                {name}
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
                        onClick={() => setTempFilters((p) => ({ ...p, is_hidden: false }))}
                    >
                        Visible
                    </Button>
                    <Button
                        type="button"
                        variant={tempFilters.is_hidden ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => setTempFilters((p) => ({ ...p, is_hidden: true }))}
                    >
                        Hidden
                    </Button>
                </div>
            </div>

            {/* Search/Clear */}
            <div className="flex gap-2">
                <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
                <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
