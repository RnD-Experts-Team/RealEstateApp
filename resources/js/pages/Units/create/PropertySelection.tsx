import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { forwardRef, useMemo, useState } from 'react';
import { ChevronsUpDown, Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import InlinePropertyCreation from './InlinePropertyCreation';

interface Props {
    availableProperties: PropertyInfoWithoutInsurance[];
    selectedCityId: string;
    propertyId: string;
    onPropertyChange: (propertyId: string) => void;
    error?: string;
    validationError?: string;
    cities: Array<{ id: number; city: string }>;
    newPropertyData?: { city_id: string; property_name: string } | null;
    onNewPropertyCreate: (cityId: string, propertyName: string) => void;
}

const PropertySelection = forwardRef<HTMLButtonElement, Props>(
    ({ availableProperties, selectedCityId, propertyId, onPropertyChange, error, validationError, cities, newPropertyData, onNewPropertyCreate }, ref) => {
        const [open, setOpen] = useState(false);
        const [showInlineCreate, setShowInlineCreate] = useState(false);

        const selectedLabel = useMemo(() => {
            // Check if we have a new property being created
            if (newPropertyData) {
                return newPropertyData.property_name;
            }
            
            const found = availableProperties?.find((p) => p.id.toString() === propertyId);
            return found ? found.property_name : '';
        }, [availableProperties, propertyId, newPropertyData]);

        const disabled = !selectedCityId;

        const handleNewPropertyCreate = (cityId: string, propertyName: string) => {
            onNewPropertyCreate(cityId, propertyName);
            setShowInlineCreate(false);
        };

        return (
            <div className="space-y-3">
                <div className="rounded-lg border-l-4 border-l-green-500 p-4">
                    <div className="mb-2">
                        <Label htmlFor="property_id" className="text-base font-semibold">
                            Property *
                        </Label>
                    </div>
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="property_id"
                                ref={ref}
                                variant="outline"
                                role="combobox"
                                aria-expanded={open}
                                className="w-full justify-between"
                                disabled={disabled}
                            >
                                {selectedLabel || (!selectedCityId ? 'Select city first' : 'Select property')}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search property..." />
                                <CommandList>
                                    <CommandEmpty>No property found.</CommandEmpty>
                                    <CommandGroup>
                                        {availableProperties?.map((property) => (
                                            <CommandItem
                                                key={property.id}
                                                value={property.property_name}
                                                onSelect={() => {
                                                    onPropertyChange(property.id.toString());
                                                    setOpen(false);
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        'mr-2 h-4 w-4',
                                                        propertyId === property.id.toString() ? 'opacity-100' : 'opacity-0'
                                                    )}
                                                />
                                                {property.property_name}
                                            </CommandItem>
                                        )) || []}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                    {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
                    
                    {/* Button to show inline property creation */}
                    {!showInlineCreate && !newPropertyData && (
                        <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setShowInlineCreate(true)}
                            className="mt-2 h-auto p-0 text-blue-600"
                            disabled={!selectedCityId}
                        >
                            <Plus className="mr-1 h-4 w-4" />
                            Create new property
                        </Button>
                    )}
                    
                    {/* Show new property indicator */}
                    {newPropertyData && (
                        <div className="mt-2 text-sm text-green-600">
                            ✓ New property "{newPropertyData.property_name}" will be created
                        </div>
                    )}
                </div>

                {/* Inline property creation form */}
                {showInlineCreate && (
                    <InlinePropertyCreation
                        cities={cities}
                        onPropertyCreated={handleNewPropertyCreate}
                        onCancel={() => setShowInlineCreate(false)}
                    />
                )}
            </div>
        );
    }
);

PropertySelection.displayName = 'PropertySelection';

export default PropertySelection;
