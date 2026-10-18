import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface BooleanFilterProps {
    label: string;
    value: boolean | null; // null = all
    onChange: (value: boolean | null) => void;
}


// Radix Select can't use '' as an item value, so 'all' stands in for no filter
const toSelectValue = (value: boolean | null) => (value === null ? 'all' : value ? 'yes' : 'no');
const fromSelectValue = (value: string) => (value === 'all' ? null : value === 'yes');


export default function BooleanFilter({ label, value, onChange }: BooleanFilterProps) {
    return (
        <Select value={toSelectValue(value)} onValueChange={(v) => onChange(fromSelectValue(v))}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{label}: All</SelectItem>
                <SelectItem value="yes">{label}: Yes</SelectItem>
                <SelectItem value="no">{label}: No</SelectItem>
            </SelectContent>
        </Select>
    );
}
