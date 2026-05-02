import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Check, ChevronsUpDown } from 'lucide-react';
import React, { useState } from 'react';
import FormField from './FormField';

interface Props {
    cities: City[];
    availableProperties: PropertyInfoWithoutInsurance[];
    availableUnits: Array<{ id: number; unit_name: string }>;
    selectedCity: number | null;
    selectedProperty: number | null;
    selectedUnit: number | null;
    validationErrors: {
        city: string;
        property: string;
        unit: string;
    };
    cityRef: React.RefObject<HTMLButtonElement | null>;
    propertyRef: React.RefObject<HTMLButtonElement | null>;
    unitRef: React.RefObject<HTMLButtonElement | null>;
    onCityChange: (value: string) => void;
    onPropertyChange: (value: string) => void;
    onUnitChange: (value: string) => void;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string }>>;
    selectedTenantIds: number[];
    onSelectedTenantsChange: (ids: number[]) => void;
    tenantsError?: string;
}

export default function LocationSection({
    cities,
    availableProperties,
    availableUnits,
    selectedCity,
    selectedProperty,
    selectedUnit,
    validationErrors,
    cityRef,
    propertyRef,
    unitRef,
    onCityChange,
    onPropertyChange,
    onUnitChange,
    tenantsByUnitId,
    selectedTenantIds,
    onSelectedTenantsChange,
    tenantsError,
}: Props) {
    const [openCity, setOpenCity] = useState(false);
    const [openProperty, setOpenProperty] = useState(false);
    const [openUnit, setOpenUnit] = useState(false);
    const [openTenants, setOpenTenants] = useState(false);

    const availableTenants = selectedUnit ? tenantsByUnitId[selectedUnit] || [] : [];
    return (
        <>
            <FormField label="City" borderColor="blue" error={validationErrors.city} required>
                <Popover open={openCity} onOpenChange={setOpenCity}>
                    <PopoverTrigger asChild>
                        <Button ref={cityRef} variant="outline" role="combobox" aria-expanded={openCity} className="w-full justify-between">
                            {selectedCity ? cities.find((c) => c.id === selectedCity)?.city : 'Select city'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search city..." />
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {cities.map((city) => (
                                        <CommandItem
                                            key={city.id}
                                            value={city.city}
                                            onSelect={() => {
                                                onCityChange(city.id.toString());
                                                setOpenCity(false);
                                            }}
                                        >
                                            <Check className={cn('mr-2 h-4 w-4', selectedCity === city.id ? 'opacity-100' : 'opacity-0')} />
                                            {city.city}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormField>

            <FormField label="Property Name" borderColor="green" error={validationErrors.property} required>
                <Popover open={openProperty} onOpenChange={setOpenProperty}>
                    <PopoverTrigger asChild>
                        <Button
                            ref={propertyRef}
                            variant="outline"
                            role="combobox"
                            aria-expanded={openProperty}
                            className="w-full justify-between"
                            disabled={!selectedCity}
                        >
                            {selectedProperty ? availableProperties.find((p) => p.id === selectedProperty)?.property_name : 'Select property'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search property..." />
                            <CommandEmpty>No property found.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {availableProperties.map((property) => (
                                        <CommandItem
                                            key={property.id}
                                            value={property.property_name}
                                            onSelect={() => {
                                                onPropertyChange(property.id.toString());
                                                setOpenProperty(false);
                                            }}
                                        >
                                            <Check className={cn('mr-2 h-4 w-4', selectedProperty === property.id ? 'opacity-100' : 'opacity-0')} />
                                            {property.property_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormField>

            <FormField label="Unit Name" borderColor="purple" error={validationErrors.unit} required>
                <Popover open={openUnit} onOpenChange={setOpenUnit}>
                    <PopoverTrigger asChild>
                        <Button
                            ref={unitRef}
                            variant="outline"
                            role="combobox"
                            aria-expanded={openUnit}
                            className="w-full justify-between"
                            disabled={!selectedProperty}
                        >
                            {selectedUnit ? availableUnits.find((u) => u.id === selectedUnit)?.unit_name : 'Select unit'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search unit..." />
                            <CommandEmpty>No unit found.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {availableUnits.map((unit) => (
                                        <CommandItem
                                            key={unit.id}
                                            value={unit.unit_name}
                                            onSelect={() => {
                                                onUnitChange(unit.id.toString());
                                                setOpenUnit(false);
                                            }}
                                        >
                                            <Check className={cn('mr-2 h-4 w-4', selectedUnit === unit.id ? 'opacity-100' : 'opacity-0')} />
                                            {unit.unit_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormField>

            <FormField label="Tenants" borderColor="orange" error={tenantsError}>
                <Popover open={openTenants} onOpenChange={setOpenTenants}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openTenants}
                            className="w-full justify-between"
                            disabled={!selectedUnit}
                        >
                            {selectedTenantIds.length > 0
                                ? `${selectedTenantIds.length} tenant(s) selected`
                                : 'Select tenants'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                        <Command>
                            <CommandInput placeholder="Search tenants..." />
                            <CommandEmpty>No tenants found.</CommandEmpty>
                            <CommandList>
                                <CommandGroup>
                                    {availableTenants.map((tenant) => (
                                        <CommandItem
                                            key={tenant.id}
                                            value={tenant.full_name}
                                            onSelect={() => {
                                                const newIds = selectedTenantIds.includes(tenant.id)
                                                    ? selectedTenantIds.filter((id) => id !== tenant.id)
                                                    : [...selectedTenantIds, tenant.id];
                                                onSelectedTenantsChange(newIds);
                                            }}
                                        >
                                            <Check className={cn('mr-2 h-4 w-4', selectedTenantIds.includes(tenant.id) ? 'opacity-100' : 'opacity-0')} />
                                            {tenant.full_name}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </FormField>
        </>
    );
}
