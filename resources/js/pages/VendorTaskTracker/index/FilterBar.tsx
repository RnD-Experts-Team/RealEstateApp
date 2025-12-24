import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface FilterBarProps {
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
        is_hidden?: string | boolean; // ✅ NEW
    };
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    onSearch: (filters: any) => void;
    onClear: () => void;
}

const STATUS_OPTIONS = [
    { value: 'exclude_completed', label: 'Exclude Completed' },
    { value: 'all', label: 'Show All' },
    { value: 'Completed', label: 'Completed' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Pending', label: 'Pending' },
];

export default function FilterBar({ filters, cities, properties, units, vendors, onSearch, onClear }: FilterBarProps) {
    const [tempFilters, setTempFilters] = useState<any>({
        ...filters,
        is_hidden: String(filters.is_hidden).toLowerCase() === 'true' || filters.is_hidden === true,
    });

    // City autocomplete states
    const [cityInput, setCityInput] = useState(filters.city || '');
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [filteredCities, setFilteredCities] = useState<CityOption[]>([]);
    const cityInputRef = useRef<HTMLInputElement>(null);
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Property autocomplete states
    const [propertyInput, setPropertyInput] = useState(filters.property || '');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const propertyInputRef = useRef<HTMLInputElement>(null);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);

    // Unit autocomplete states
    const [unitInput, setUnitInput] = useState(filters.unit_name || '');
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const unitInputRef = useRef<HTMLInputElement>(null);
    const unitDropdownRef = useRef<HTMLDivElement>(null);

    // Vendor autocomplete states
    const [vendorInput, setVendorInput] = useState(filters.vendor_name || '');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const vendorDropdownRef = useRef<HTMLDivElement>(null);

    // Status filter state
    const [statusInput, setStatusInput] = useState(filters.status || 'exclude_completed');

    useEffect(() => {
        setTempFilters({
            ...filters,
            is_hidden: String(filters.is_hidden).toLowerCase() === 'true' || filters.is_hidden === true,
        });
        setCityInput(filters.city || '');
        setPropertyInput(filters.property || '');
        setUnitInput(filters.unit_name || '');
        setVendorInput(filters.vendor_name || '');
        setStatusInput(filters.status || 'exclude_completed');
    }, [filters]);

    useEffect(() => {
        if (!cities) return;

        if (cityInput.trim() === '') {
            setFilteredCities(cities);
        } else {
            const filtered = cities.filter((city) => city.city.toLowerCase().includes(cityInput.toLowerCase()));
            setFilteredCities(filtered);
        }
    }, [cityInput, cities]);

    const filteredProperties =
        properties?.filter((property) => property.property_name.toLowerCase().includes(propertyInput.toLowerCase())) || [];

    const filteredVendors =
        vendors?.filter((vendor) => vendor.vendor_name.toLowerCase().includes(vendorInput.toLowerCase())) || [];

    const filteredUnits = units?.filter((unit) => unit.unit_name.toLowerCase().includes(unitInput.toLowerCase())) || [];

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
            if (
                vendorDropdownRef.current &&
                !vendorDropdownRef.current.contains(event.target as Node) &&
                vendorInputRef.current &&
                !vendorInputRef.current.contains(event.target as Node)
            ) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTempFilterChange = (key: string, value: any) => {
        setTempFilters((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: string) => {
        setCityInput(city);
        handleTempFilterChange('city', city);
        setShowCityDropdown(false);
    };

    const handleSearchClick = () => {
        const payload: any = { ...tempFilters };

        // only send is_hidden when true (like your MoveIn style)
        if (payload.is_hidden) payload.is_hidden = 'true';
        else delete payload.is_hidden;

        onSearch(payload);
    };

    const handleClearFilters = () => {
        setTempFilters({ status: 'exclude_completed', is_hidden: false });
        setCityInput('');
        setPropertyInput('');
        setUnitInput('');
        setVendorInput('');
        setStatusInput('exclude_completed');
        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowUnitDropdown(false);
        setShowVendorDropdown(false);
        onClear();
    };

    return (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-8">
            {/* City */}
            <div className="relative">
                <Input
                    ref={cityInputRef}
                    type="text"
                    placeholder="Filter by City"
                    value={cityInput}
                    onChange={(e) => {
                        setCityInput(e.target.value);
                        handleTempFilterChange('city', e.target.value);
                        setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showCityDropdown && filteredCities.length > 0 && (
                    <div
                        ref={cityDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredCities.map((city) => (
                            <div
                                key={city.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleCitySelect(city.city)}
                            >
                                {city.city}
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
                    placeholder="Filter by Property"
                    value={propertyInput}
                    onChange={(e) => {
                        setPropertyInput(e.target.value);
                        handleTempFilterChange('property', e.target.value);
                        setShowPropertyDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowPropertyDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showPropertyDropdown && filteredProperties.length > 0 && (
                    <div
                        ref={propertyDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredProperties.map((property) => (
                            <div
                                key={property.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    setPropertyInput(property.property_name);
                                    handleTempFilterChange('property', property.property_name);
                                    setShowPropertyDropdown(false);
                                }}
                            >
                                {property.property_name}
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
                    placeholder="Filter by Unit"
                    value={unitInput}
                    onChange={(e) => {
                        setUnitInput(e.target.value);
                        handleTempFilterChange('unit_name', e.target.value);
                        setShowUnitDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowUnitDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showUnitDropdown && filteredUnits.length > 0 && (
                    <div
                        ref={unitDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredUnits.map((unit) => (
                            <div
                                key={unit.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    setUnitInput(unit.unit_name);
                                    handleTempFilterChange('unit_name', unit.unit_name);
                                    setShowUnitDropdown(false);
                                }}
                            >
                                {unit.unit_name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Vendor */}
            <div className="relative">
                <Input
                    ref={vendorInputRef}
                    type="text"
                    placeholder="Filter by Vendor"
                    value={vendorInput}
                    onChange={(e) => {
                        setVendorInput(e.target.value);
                        handleTempFilterChange('vendor_name', e.target.value);
                        setShowVendorDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => setShowVendorDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showVendorDropdown && filteredVendors.length > 0 && (
                    <div
                        ref={vendorDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredVendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => {
                                    setVendorInput(vendor.vendor_name);
                                    handleTempFilterChange('vendor_name', vendor.vendor_name);
                                    setShowVendorDropdown(false);
                                }}
                            >
                                {vendor.vendor_name}
                                {vendor.city && <span className="ml-2 text-xs text-muted-foreground">({vendor.city})</span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status */}
            <select
                value={statusInput}
                onChange={(e) => {
                    setStatusInput(e.target.value);
                    handleTempFilterChange('status', e.target.value);
                }}
                className="rounded-md border border-input bg-input px-3 py-2 text-sm text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
                {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {/* ✅ Visible/Hidden toggle */}
            <div className="flex items-center">
                <div className="w-full flex items-center rounded-md border border-input bg-input p-1 h-10">
                    <Button
                        type="button"
                        variant={!tempFilters.is_hidden ? 'default' : 'outline'}
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

            <Button onClick={handleSearchClick} variant="default" className="flex items-center">
                <Search className="mr-2 h-4 w-4" />
                Search
            </Button>

            <Button onClick={handleClearFilters} variant="outline" className="flex items-center">
                <X className="mr-2 h-4 w-4" />
                Clear
            </Button>
        </div>
    );
}
