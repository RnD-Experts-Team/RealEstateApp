import React, { useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';

interface CityAutocompleteProps {
    cities: Array<{ id: number; city: string }>;
    value: string;
    onChange: (value: string) => void;
    onSelect: (city: string) => void;
}

const CityAutocomplete: React.FC<CityAutocompleteProps> = ({ cities, value, onChange, onSelect }) => {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCities = useMemo(() => {
        if (value.trim() === '') return cities;
        return cities.filter((c) => c.city.toLowerCase().includes(value.toLowerCase()));
    }, [value, cities]);

    const handleSelect = (city: string) => {
        onSelect(city);
        setOpen(false);
        requestAnimationFrame(() => inputRef.current?.blur());
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <div
                    className="relative"
                    // IMPORTANT: prevent Radix trigger click-toggle from closing on mouseup
                    onPointerDownCapture={(e) => {
                        e.preventDefault();
                        setOpen(true);
                        requestAnimationFrame(() => inputRef.current?.focus());
                    }}
                    onClick={(e) => {
                        // extra safety: don't let click toggle state
                        e.preventDefault();
                    }}
                >
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder="City"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setOpen(true);
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
                    <CommandEmpty>No city found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-auto">
                        {filteredCities.map((c) => (
                            <CommandItem key={c.id} value={c.city} onSelect={() => handleSelect(c.city)}>
                                {c.city}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default CityAutocomplete;
