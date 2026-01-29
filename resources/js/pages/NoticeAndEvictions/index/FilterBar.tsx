import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import React from 'react';
import { FilterDropdown } from './FilterDropdown';
import { City } from '@/types/NoticeAndEviction';
import { Unit, ExtendedTenant, ExtendedProperty } from './types';

interface FilterBarProps {
    tempFilters: {
        city: string;
        property: string;
        unit: string;
        tenant: string;
        is_hidden: boolean;
    };
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    showCityDropdown: boolean;
    showPropertyDropdown: boolean;
    showUnitDropdown: boolean;
    showTenantDropdown: boolean;
    setShowCityDropdown: (show: boolean) => void;
    setShowPropertyDropdown: (show: boolean) => void;
    setShowUnitDropdown: (show: boolean) => void;
    setShowTenantDropdown: (show: boolean) => void;
    onCityInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPropertyInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onUnitInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTenantInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onCitySelect: (city: City) => void;
    onPropertySelect: (property: ExtendedProperty) => void;
    onUnitSelect: (unit: Unit) => void;
    onTenantSelect: (tenant: ExtendedTenant) => void;
    onIsHiddenChange: (isHidden: boolean) => void;
    onSearch: () => void;
    onClear: () => void;
}

export function FilterBar({
    tempFilters,
    cities,
    properties,
    units,
    tenants,
    showCityDropdown,
    showPropertyDropdown,
    showUnitDropdown,
    showTenantDropdown,
    setShowCityDropdown,
    setShowPropertyDropdown,
    setShowUnitDropdown,
    setShowTenantDropdown,
    onCityInputChange,
    onPropertyInputChange,
    onUnitInputChange,
    onTenantInputChange,
    onCitySelect,
    onPropertySelect,
    onUnitSelect,
    onTenantSelect,
    onIsHiddenChange,
    onSearch,
    onClear,
}: FilterBarProps) {
    const filteredCities = cities.filter((city) =>
        city.city.toLowerCase().includes(tempFilters.city.toLowerCase())
    );

    const filteredProperties = properties.filter((property) =>
        property.property_name.toLowerCase().includes(tempFilters.property.toLowerCase())
    );

    const filteredUnits = units.filter((unit) =>
        unit.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase())
    );

    const filteredTenants = tenants.filter((tenant) =>
        tenant.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase())
    );

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
            {/* City Filter */}
            <FilterDropdown
                value={tempFilters.city}
                placeholder="City"
                items={filteredCities}
                displayKey="city"
                onInputChange={onCityInputChange}
                onItemSelect={onCitySelect}
                showDropdown={showCityDropdown}
                setShowDropdown={setShowCityDropdown}
            />

            {/* Property Filter */}
            <FilterDropdown
                value={tempFilters.property}
                placeholder="Property"
                items={filteredProperties}
                displayKey="property_name"
                onInputChange={onPropertyInputChange}
                onItemSelect={onPropertySelect}
                showDropdown={showPropertyDropdown}
                setShowDropdown={setShowPropertyDropdown}
            />

            {/* Unit Filter */}
            <FilterDropdown
                value={tempFilters.unit}
                placeholder="Unit"
                items={filteredUnits}
                displayKey="unit_name"
                onInputChange={onUnitInputChange}
                onItemSelect={onUnitSelect}
                showDropdown={showUnitDropdown}
                setShowDropdown={setShowUnitDropdown}
            />

            {/* Tenant Filter */}
            <FilterDropdown
                value={tempFilters.tenant}
                placeholder="Tenant"
                items={filteredTenants}
                displayKey="full_name"
                onInputChange={onTenantInputChange}
                onItemSelect={onTenantSelect}
                showDropdown={showTenantDropdown}
                setShowDropdown={setShowTenantDropdown}
            />

            {/* Visible/Hidden toggle */}
            <div className="flex items-center">
                <div className="w-full flex items-center rounded-md border border-input bg-input p-1 h-10">
                    <Button
                        type="button"
                        variant={tempFilters.is_hidden ? 'outline' : 'default'}
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => onIsHiddenChange(false)}
                    >
                        Visible
                    </Button>
                    <Button
                        type="button"
                        variant={tempFilters.is_hidden ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 h-8"
                        onClick={() => onIsHiddenChange(true)}
                    >
                        Hidden
                    </Button>
                </div>
            </div>

            {/* Search and Clear Buttons */}
            <div className="flex gap-2">
                <Button onClick={onSearch} variant="default" className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
                <Button onClick={onClear} variant="outline" className="flex items-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
}
