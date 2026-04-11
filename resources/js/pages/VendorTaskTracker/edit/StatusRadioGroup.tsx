import { RadioGroup } from '@/components/ui/radioGroup';
import FormSection from './FormSection';

interface StatusRadioGroupProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

export default function StatusRadioGroup({ value, onChange, error }: StatusRadioGroupProps) {
    return (
        <FormSection label="Status" borderColor="border-l-red-500" error={error}>
            <RadioGroup
                value={value}
                onValueChange={onChange}
                name="status"
                options={[
                    { value: '24H', label: '24H' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Completed', label: 'Completed' },
                    { value: 'On Hold', label: 'On Hold' },
                ]}
                className="flex-wrap"
            />
        </FormSection>
    );
}
