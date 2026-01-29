import { RadioGroupField } from './RadioGroupField';

interface PaymentAndPreferencesSectionProps {
    cashOrCheck: string;
    hasInsurance: string;
    sensitiveCommunication: string;
    hasAssistance: string;
    onCashOrCheckChange: (value: string) => void;
    onHasInsuranceChange: (value: string) => void;
    onSensitiveCommunicationChange: (value: string) => void;
    onHasAssistanceChange: (value: string) => void;
    cashOrCheckError?: string;
    hasInsuranceError?: string;
    sensitiveCommunicationError?: string;
    hasAssistanceError?: string;
}

export function PaymentAndPreferencesSection({
    cashOrCheck,
    hasInsurance,
    sensitiveCommunication,
    hasAssistance,
    onCashOrCheckChange,
    onHasInsuranceChange,
    onSensitiveCommunicationChange,
    onHasAssistanceChange,
    cashOrCheckError,
    hasInsuranceError,
    sensitiveCommunicationError,
    hasAssistanceError,
}: PaymentAndPreferencesSectionProps) {
    return (
        <>
            <RadioGroupField
                name="cash_or_check"
                label="Payment Method"
                value={cashOrCheck}
                onChange={onCashOrCheckChange}
                options={[
                    { value: 'Cash', label: 'Cash' },
                    { value: 'Check', label: 'Check' },
                    { value: 'EFT', label: 'EFT' }
                ]}
                borderColor="red"
                error={cashOrCheckError}
            />

            <RadioGroupField
                name="has_insurance"
                label="Has Insurance"
                value={hasInsurance}
                onChange={onHasInsuranceChange}
                options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                ]}
                borderColor="yellow"
                error={hasInsuranceError}
            />

            <RadioGroupField
                name="sensitive_communication"
                label="Sensitive Communication"
                value={sensitiveCommunication}
                onChange={onSensitiveCommunicationChange}
                options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                ]}
                borderColor="cyan"
                error={sensitiveCommunicationError}
            />

            <RadioGroupField
                name="has_assistance"
                label="Has Assistance"
                value={hasAssistance}
                onChange={onHasAssistanceChange}
                options={[
                    { value: 'Yes', label: 'Yes' },
                    { value: 'No', label: 'No' }
                ]}
                borderColor="violet"
                error={hasAssistanceError}
            />
        </>
    );
}
