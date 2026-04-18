import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface VendorFiltersProps {
    tempFilters: {
        city: string;
        vendor_name: string;
        vendor_type: string;
    };
    cities: Array<{ id: number; city: string }>;
    showCityDropdown: boolean;
    onTempFilterChange: (key: string, value: string) => void;
    onCityInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCitySelect: (city: { id: number; city: string }) => void;
    onSearchClick: () => void;
    onClearFilters: () => void;
    setShowCityDropdown: (show: boolean) => void;
}

export default function VendorFiltersComponent({
    tempFilters,
    cities,
    showCityDropdown,
    onTempFilterChange,
    onCityInputChange,
    onCitySelect,
    onSearchClick,
    onClearFilters,
    setShowCityDropdown,
}: VendorFiltersProps) {
    const cityDropdownRef = useRef<HTMLDivElement>(null);

    // Handle clicks outside dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
                setShowCityDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setShowCityDropdown]);

    return (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* City Filter with Dropdown */}
            <div className="relative" ref={cityDropdownRef}>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <Input
                    type="text"
                    placeholder="Select or type city..."
                    value={tempFilters.city}
                    onChange={onCityInputChange}
                    onFocus={() => setShowCityDropdown(true)}
                    className="w-full"
                />
                {showCityDropdown && cities && cities.length > 0 && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                        {cities
                            .filter((city) => city.city.toLowerCase().includes(tempFilters.city.toLowerCase()))
                            .map((city) => (
                                <div
                                    key={city.id}
                                    className="cursor-pointer px-3 py-2 text-sm hover:bg-gray-100"
                                    onClick={() => onCitySelect(city)}
                                >
                                    {city.city}
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Vendor Name Filter */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Vendor Name</label>
                <Input
                    type="text"
                    placeholder="Enter vendor name..."
                    value={tempFilters.vendor_name}
                    onChange={(e) => onTempFilterChange('vendor_name', e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Vendor Type Filter */}
            <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Vendor Type</label>
                <select
                    value={tempFilters.vendor_type}
                    onChange={(e) => onTempFilterChange('vendor_type', e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                    <option value="">All</option>
                    <option value="main">Main</option>
                    <option value="potential">Potential</option>
                </select>
            </div>

            {/* Search and Clear Buttons */}
            <div className="flex items-end gap-2">
                <Button onClick={onSearchClick} className="flex items-center justify-center gap-2">
                    <Search className="h-4 w-4" />
                    Search
                </Button>
                <Button onClick={onClearFilters} variant="outline" className="flex items-center justify-center gap-2">
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
