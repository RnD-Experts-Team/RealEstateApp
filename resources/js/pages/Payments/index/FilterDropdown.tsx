// components/FilterDropdown.tsx
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface FilterDropdownProps {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: string[];
}

export default function FilterDropdown({
    value,
    onChange,
    placeholder,
    options
}: FilterDropdownProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Narrow the list to what matches the typed text. When the value is already an
    // exact option (i.e. it was picked), keep showing every available option.
    const visibleOptions = useMemo(() => {
        const term = value.trim().toLowerCase();
        if (!term) return options;
        if (options.some((option) => option.toLowerCase() === term)) return options;
        return options.filter((option) => option.toLowerCase().includes(term));
    }, [options, value]);

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => {
                        onChange(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            </div>
            {showDropdown && visibleOptions.length > 0 && (
                <div className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-input bg-popover shadow-lg">
                    {visibleOptions.map((option) => (
                        <div
                            key={option}
                            className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => {
                                onChange(option);
                                setShowDropdown(false);
                            }}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
