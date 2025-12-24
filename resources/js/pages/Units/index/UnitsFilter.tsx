import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { UnitFilters } from '@/types/unit';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Search, X } from 'lucide-react';
import CityAutocomplete from './CityAutocomplete';
import PropertyAutocomplete from './PropertyAutocomplete';

interface UnitsFilterProps {
    filters: UnitFilters;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    cityInput: string;
    propertyInput: string;
    onFilterChange: (key: keyof UnitFilters, value: string) => void;
    onCityInputChange: (value: string) => void;
    onCitySelect: (city: string) => void;
    onPropertyInputChange: (value: string) => void;
    onPropertySelect: (property: PropertyInfoWithoutInsurance) => void;
    onSearch: () => void;
    onClear: () => void;
}

const UnitsFilter: React.FC<UnitsFilterProps> = ({
    filters,
    cities,
    properties,
    cityInput,
    propertyInput,
    onFilterChange,
    onCityInputChange,
    onCitySelect,
    onPropertyInputChange,
    onPropertySelect,
    onSearch,
    onClear,
}) => {
    return (
        // Key fixes:
        // - items-end: aligns controls + buttons on the same baseline
        // - consistent field wrappers and consistent control heights (h-9)
        <div className="grid grid-cols-1 gap-4 md:grid-cols-8 md:items-end">
            <div className="space-y-1">
                <Label>City</Label>
                <CityAutocomplete cities={cities} value={cityInput} onChange={onCityInputChange} onSelect={onCitySelect} />
            </div>

            <div className="space-y-1">
                <Label>Property</Label>
                <PropertyAutocomplete properties={properties} value={propertyInput} onChange={onPropertyInputChange} onSelect={onPropertySelect} />
            </div>

            <div className="space-y-1">
                <Label htmlFor="unit_name">Unit Name</Label>
                <Input
                    id="unit_name"
                    type="text"
                    placeholder="Search by unit name"
                    value={filters.unit_name || ''}
                    onChange={(e) => onFilterChange('unit_name', e.target.value)}
                    className="h-9 text-input-foreground bg-input"
                />
            </div>

            <div className="space-y-1">
                <Label>Vacant Status</Label>
                <Select value={filters.vacant || ''} onValueChange={(val) => onFilterChange('vacant', val)}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Vacant Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* keep EXACT values/behavior */}
                        <SelectItem value="all">All Vacant Status</SelectItem>
                        <SelectItem value="Yes">Vacant</SelectItem>
                        <SelectItem value="No">Occupied</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label>Listed Status</Label>
                <Select value={filters.listed || ''} onValueChange={(val) => onFilterChange('listed', val)}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All Listed Status" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* keep EXACT values/behavior */}
                        <SelectItem value="all">All Listed Status</SelectItem>
                        <SelectItem value="Yes">Listed</SelectItem>
                        <SelectItem value="No">Not Listed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1">
                <Label>New Lease</Label>
                <Select value={filters.is_new_lease || ''} onValueChange={(val) => onFilterChange('is_new_lease', val)}>
                    <SelectTrigger className="h-9">
                        <SelectValue placeholder="All New Lease" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* keep EXACT values/behavior */}
                        <SelectItem value="all">All New Lease</SelectItem>
                        <SelectItem value="Yes">New Lease</SelectItem>
                        <SelectItem value="No">Renewal/Existing</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Buttons: same behavior, fixed alignment/height */}
            <div className="flex gap-2">
                <Button onClick={onSearch} variant="default" className="h-9 w-full flex items-center justify-center">
                    <Search className="mr-2 h-4 w-4" />
                    Search
                </Button>
            </div>

            <div className="flex gap-2">
                <Button onClick={onClear} variant="outline" className="h-9 w-full flex items-center justify-center">
                    <X className="mr-2 h-4 w-4" />
                    Clear
                </Button>
            </div>
        </div>
    );
};

export default UnitsFilter;
