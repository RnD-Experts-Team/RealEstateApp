import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radioGroup';

interface StatusSectionProps {
    status: string;
    onStatusChange: (value: string) => void;
    errors: Partial<Record<string, string>>; // Changed from Record<string, string>
}

export default function StatusSection({ status, onStatusChange, errors }: StatusSectionProps) {
    return (
        <div className="rounded-lg border-l-4 border-l-red-500 p-4">
            <div className="mb-2">
                <Label htmlFor="status" className="text-base font-semibold">
                    Status
                </Label>
            </div>
            <RadioGroup
                value={status}
                onValueChange={onStatusChange}
                name="status"
                options={[
                    { value: '24H', label: '24H' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'On Hold', label: 'On Hold' },
                ]}
                className="flex-wrap"
            />
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
        </div>
    );
}
