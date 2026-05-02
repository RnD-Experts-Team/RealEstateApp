import { InsuranceRepresentative } from '@/types/property';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface Props {
    representatives: InsuranceRepresentative[];
    value: number | null;
    onChange: (id: number | null) => void;
    error?: string;
}

export default function RepresentativeSection({ representatives, value, onChange, error }: Props) {
    const activeReps = representatives.filter(rep => !rep.deleted_at);

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                Insurance Representative
            </label>
            <Select value={value?.toString() ?? ''} onValueChange={(val) => onChange(val ? parseInt(val) : null)}>
                <SelectTrigger>
                    <SelectValue placeholder="— Select Representative —" />
                </SelectTrigger>
                <SelectContent>
                    {activeReps.map(rep => (
                        <SelectItem key={rep.id} value={rep.id.toString()}>
                            {rep.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
