import React, { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface PropertyAutocompleteProps {
    properties: PropertyInfoWithoutInsurance[];
    value: string;
    onChange: (value: string) => void;
    onSelect: (property: PropertyInfoWithoutInsurance) => void;
}

const PropertyAutocomplete: React.FC<PropertyAutocompleteProps> = ({ properties, value, onChange, onSelect }) => {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredProperties = useMemo(() => {
        return properties.filter((p) => p.property_name.toLowerCase().includes(value.toLowerCase()));
    }, [value, properties]);

    const handleSelect = (property: PropertyInfoWithoutInsurance) => {
        onSelect(property);
        setOpen(false);
        requestAnimationFrame(() => inputRef.current?.blur());
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className="relative"
                    onPointerDownCapture={(e) => {
                        // Fix the “open then instantly close on release” toggle problem
                        e.preventDefault();
                        setOpen(true);
                        requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    onClick={(e) => {
                        e.preventDefault();
                    }}
                >
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="Property"
                        value={value}
                        onChange={(e) => {
                            const next = e.target.value;
                            onChange(next);

                            // KEEP your original behavior exactly:
                            // showDropdown(e.target.value.length > 0)
                            setOpen(next.length > 0);
                        }}
                        onFocus={() => setOpen(true)}
                        className="h-9 text-input-foreground bg-input pr-8"
                    />
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                </div>
            </PopoverTrigger>

            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                    {/* no CommandInput => no magnifier icon */}
                    <CommandEmpty>No property found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                        {filteredProperties.map((p) => (
                            <CommandItem key={p.id} value={p.property_name} onSelect={() => handleSelect(p)}>
                                {p.property_name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default PropertyAutocomplete;
