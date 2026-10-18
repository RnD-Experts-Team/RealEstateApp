import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import React from 'react';
import FilterDropdown from './FilterDropdown';
import PermanentFilter from './PermanentFilter';
import HiddenFilter from './HiddenFilter';
import BooleanFilter from './BooleanFilter';


interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}


interface FilterSectionProps {
    cityFilter: string;
    propertyFilter: string;
    unitFilter: string;
    permanentFilter: string[];
    isHiddenFilter: boolean;
    setCityFilter: (value: string) => void;
    setPropertyFilter: (value: string) => void;
    setUnitFilter: (value: string) => void;
    setPermanentFilter: (value: string[]) => void;
    setIsHiddenFilter: (value: boolean) => void;
    remindFilter: boolean | null;
    setRemindFilter: (value: boolean | null) => void;
    addedToLedgerFilter: boolean | null;
    setAddedToLedgerFilter: (value: boolean | null) => void;
    uniqueCities: string[];
    uniqueProperties: string[];
    units: UnitData[];
    onSearch: (e: React.FormEvent) => void;
    onClear: () => void;
}


export default function FilterSection({
    cityFilter,
    propertyFilter,
    unitFilter,
    permanentFilter,
    isHiddenFilter,
    setCityFilter,
    setPropertyFilter,
    setUnitFilter,
    setPermanentFilter,
    setIsHiddenFilter,
    remindFilter,
    setRemindFilter,
    addedToLedgerFilter,
    setAddedToLedgerFilter,
    uniqueCities,
    uniqueProperties,
    units,
    onSearch,
    onClear
}: FilterSectionProps) {
    const getFilteredProperties = (): string[] => {
        // Properties should be independent of city selection
        return uniqueProperties;
    };

    const getFilteredUnits = (): string[] => {
        // Units should be independent of city and property selection
        return [...new Set(units.map(unit => unit.unit_name))].sort();
    };

    return (
        <Card className="bg-card text-card-foreground shadow-lg mb-6">
            <CardHeader>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-7">
                    <FilterDropdown
                        value={cityFilter}
                        onChange={setCityFilter}
                        placeholder="Filter by city..."
                        options={uniqueCities}
                    />

                    <FilterDropdown
                        value={propertyFilter}
                        onChange={setPropertyFilter}
                        placeholder="Filter by property..."
                        options={getFilteredProperties()}
                    />

                    <FilterDropdown
                        value={unitFilter}
                        onChange={setUnitFilter}
                        placeholder="Filter by unit..."
                        options={getFilteredUnits()}
                    />

                    <PermanentFilter
                        value={permanentFilter}
                        onChange={setPermanentFilter}
                    />

                    <BooleanFilter
                        label="Remind"
                        value={remindFilter}
                        onChange={setRemindFilter}
                    />

                    <BooleanFilter
                        label="Ledger"
                        value={addedToLedgerFilter}
                        onChange={setAddedToLedgerFilter}
                    />

                    <HiddenFilter
                        value={isHiddenFilter}
                        onChange={setIsHiddenFilter}
                    />
                </div>

                <div className="flex gap-2 mt-4">
                    <Button onClick={onSearch} variant="default" className="flex-1">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>
                    
                    <Button 
                        onClick={onClear} 
                        variant="outline" 
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Clear
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}
