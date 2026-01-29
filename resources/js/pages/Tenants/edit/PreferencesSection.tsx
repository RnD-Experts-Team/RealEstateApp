import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radioGroup';

interface PreferencesSectionProps {
    cashOrCheck: string;
    hasInsurance: string;
    sensitiveCommunication: string;
    hasAssistance: string;
    onCashOrCheckChange: (value: string) => void;
    onHasInsuranceChange: (value: string) => void;
    onSensitiveCommunicationChange: (value: string) => void;
    onHasAssistanceChange: (value: string) => void;
    errors: Record<string, string>;
}

export default function PreferencesSection({
    cashOrCheck,
    hasInsurance,
    sensitiveCommunication,
    hasAssistance,
    onCashOrCheckChange,
    onHasInsuranceChange,
    onSensitiveCommunicationChange,
    onHasAssistanceChange,
    errors,
}: PreferencesSectionProps) {
    return (
        <>
            {/* Payment Method */}
            <div className="rounded-lg border-l-4 border-l-red-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="cash_or_check" className="text-base font-semibold">
                        Payment Method
                    </Label>
                </div>
                <RadioGroup
                    value={cashOrCheck}
                    onValueChange={onCashOrCheckChange}
                    name="cash_or_check"
                    options={[
                        { value: 'Cash', label: 'Cash' },
                        { value: 'Check', label: 'Check' },
                        { value: 'EFT', label: 'EFT' }
                    ]}
                />
                {errors.cash_or_check && <p className="mt-1 text-sm text-red-600">{errors.cash_or_check}</p>}
            </div>

            {/* Has Insurance */}
            <div className="rounded-lg border-l-4 border-l-yellow-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="has_insurance" className="text-base font-semibold">
                        Has Insurance
                    </Label>
                </div>
                <RadioGroup
                    value={hasInsurance}
                    onValueChange={onHasInsuranceChange}
                    name="has_insurance"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
                {errors.has_insurance && <p className="mt-1 text-sm text-red-600">{errors.has_insurance}</p>}
            </div>

            {/* Sensitive Communication */}
            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="sensitive_communication" className="text-base font-semibold">
                        Sensitive Communication
                    </Label>
                </div>
                <RadioGroup
                    value={sensitiveCommunication}
                    onValueChange={onSensitiveCommunicationChange}
                    name="sensitive_communication"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
                {errors.sensitive_communication && <p className="mt-1 text-sm text-red-600">{errors.sensitive_communication}</p>}
            </div>

            {/* Has Assistance */}
            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="has_assistance" className="text-base font-semibold">
                        Has Assistance
                    </Label>
                </div>
                <RadioGroup
                    value={hasAssistance}
                    onValueChange={onHasAssistanceChange}
                    name="has_assistance"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' }
                    ]}
                />
                {errors.has_assistance && <p className="mt-1 text-sm text-red-600">{errors.has_assistance}</p>}
            </div>
        </>
    );
}
