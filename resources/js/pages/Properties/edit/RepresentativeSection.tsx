import { InsuranceRepresentative } from '@/types/property';
import { AlertCircle } from 'lucide-react';
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
    const currentRep = representatives.find(rep => rep.id === value);
    const isCurrentRepDeleted = currentRep && currentRep.deleted_at;

    return (
        <div className="space-y-2">
            {isCurrentRepDeleted && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                        The selected representative "{currentRep?.name}" has been deleted. You can still keep this link or select an active representative.
                    </p>
                </div>
            )}

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
                    {isCurrentRepDeleted && currentRep && (
                        <SelectItem value={currentRep.id.toString()}>
                            {currentRep.name} (Deleted - currently assigned)
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    );
}
