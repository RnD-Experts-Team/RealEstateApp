import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CityData {
    id: number;
    name: string;
}

interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

interface FilterBarProps {
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    onSearch: (filters: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
        is_hidden: boolean;
    }) => void;
    onClear: () => void;
    initialFilters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
        is_hidden: boolean;
    };
}

export default function FilterBar({ cities, properties, units, onSearch, onClear, initialFilters }: FilterBarProps) {
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        name: '',
        applicant_applied_from: '',
        is_hidden: false,
    });

    useEffect(() => {
        if (initialFilters) {
            setTempFilters({
                city: initialFilters.city || '',
                property: initialFilters.property || '',
                unit: initialFilters.unit || '',
                name: initialFilters.name || '',
                applicant_applied_from: initialFilters.applicant_applied_from || '',
                is_hidden: Boolean(initialFilters.is_hidden) || false,
            });
        }
    }, [initialFilters]);

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
    }, []);

    const handleTempFilterChange = (key: keyof typeof tempFilters, value: any) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: CityData) => {
        handleTempFilterChange('city', city.name);
        setShowCityDropdown(false);
    };

    const handlePropertySelect = (property: PropertyData) => {
        handleTempFilterChange('property', property.name);
        setShowPropertyDropdown(false);
    };

    const handleUnitSelect = (unit: UnitData) => {
        handleTempFilterChange('unit', unit.name);
        setShowUnitDropdown(false);
    };

    const handleSearchClick = () => {
        onSearch(tempFilters);
    };

    const handleClearFilters = () => {
        const cleared = {
            city: '',
            property: '',
            unit: '',
            name: '',
            applicant_applied_from: '',
            is_hidden: false,
        };
        setTempFilters(cleared);
        onClear();
    };

    const allProperties = Object.values(properties).flat();
    const filteredProperties = allProperties.filter((p) =>
        p.name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const allUnits = Object.values(units).flat();
    const filteredUnits = allUnits.filter((u) =>
        u.name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredCities = cities.filter((c) => c.name.toLowerCase().includes(tempFilters.city.toLowerCase()));

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* City */}
                <div className="relative">
                    <Input
                        ref={cityInputRef}
                        type="text"
                        placeholder="City"
                        value={tempFilters.city}
                        onChange={(e) => {
                            const value = e.target.value;
                            handleTempFilterChange('city', value);
                            setShowCityDropdown(value.length > 0);
                        }}
                        onFocus={() => setShowCityDropdown(true)}
                        className="bg-input pr-8 text-input-foreground"
                    />
                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    {showCityDropdown && filteredCities.length > 0 && (
                        <div
                            ref={cityDropdownRef}
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                        >
                            {filteredCities.map((city) => (
                                <div
                                    key={city.id}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleCitySelect(city)}
                                >
                                    {city.name}
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
                        onChange={(e) => {
                            const value = e.target.value;
                            handleTempFilterChange('property', value);
                            setShowPropertyDropdown(value.length > 0);
                        }}
                        onFocus={() => setShowPropertyDropdown(true)}
                        className="bg-input pr-8 text-input-foreground"
                    />
                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    {showPropertyDropdown && filteredProperties.length > 0 && (
                        <div
                            ref={propertyDropdownRef}
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                        >
                            {filteredProperties.map((property) => (
                                <div
                                    key={property.id}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handlePropertySelect(property)}
                                >
                                    {property.name}
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
                        onChange={(e) => {
                            const value = e.target.value;
                            handleTempFilterChange('unit', value);
                            setShowUnitDropdown(value.length > 0);
                        }}
                        onFocus={() => setShowUnitDropdown(true)}
                        className="bg-input pr-8 text-input-foreground"
                    />
                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    {showUnitDropdown && filteredUnits.length > 0 && (
                        <div
                            ref={unitDropdownRef}
                            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                        >
                            {filteredUnits.map((unit) => (
                                <div
                                    key={unit.id}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleUnitSelect(unit)}
                                >
                                    {unit.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Name */}
                <Input
                    type="text"
                    placeholder="Application Name"
                    value={tempFilters.name}
                    onChange={(e) => handleTempFilterChange('name', e.target.value)}
                    className="bg-input text-input-foreground"
                />

                {/* Applied From */}
                <Input
                    type="text"
                    placeholder="Applied From"
                    value={tempFilters.applicant_applied_from}
                    onChange={(e) => handleTempFilterChange('applicant_applied_from', e.target.value)}
                    className="bg-input text-input-foreground"
                />

                {/* Visible / Hidden segmented toggle */}
                <div className="flex h-10 items-center rounded-md border border-input bg-input p-1">
                    <Button
                        type="button"
                        variant={tempFilters.is_hidden ? 'outline' : 'default'}
                        size="sm"
                        className="h-8 flex-1"
                        onClick={() => handleTempFilterChange('is_hidden', false)}
                    >
                        Visible
                    </Button>
                    <Button
                        type="button"
                        variant={tempFilters.is_hidden ? 'default' : 'outline'}
                        size="sm"
                        className="h-8 flex-1"
                        onClick={() => handleTempFilterChange('is_hidden', true)}
                    >
                        Hidden
                    </Button>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleSearchClick} variant="default" className="sm:flex-1">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>

                <Button onClick={handleClearFilters} variant="outline" size="sm" className="whitespace-nowrap sm:w-auto">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
