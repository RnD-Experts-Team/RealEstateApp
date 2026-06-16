import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { APPLIED_FROM_OPTIONS } from '@/types/application';

interface Props {
    name: string;
    coSigner: string;
    phoneNumber: string;
    email: string;
    applicantAppliedFrom: string;
    onNameChange: (name: string) => void;
    onCoSignerChange: (coSigner: string) => void;
    onPhoneNumberChange: (phoneNumber: string) => void;
    onEmailChange: (email: string) => void;
    onApplicantAppliedFromChange: (value: string) => void;
    errors: Record<string, string>;
    validationErrors: {
        name?: string;
        co_signer?: string;
    };
}

export function ApplicantInformationFields({
    name,
    coSigner,
    phoneNumber,
    email,
    applicantAppliedFrom,
    onNameChange,
    onCoSignerChange,
    onPhoneNumberChange,
    onEmailChange,
    onApplicantAppliedFromChange,
    errors,
    validationErrors,
}: Props) {
    return (
        <>
            {/* Name Field */}
            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="name" className="text-base font-semibold">
                        Name *
                    </Label>
                </div>
                <Input id="name" value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="Enter applicant name" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                {validationErrors.name && <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>}
            </div>

            {/* Co-signer Field */}
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="co_signer" className="text-base font-semibold">
                        Co-signer
                    </Label>
                </div>
                <Input
                    id="co_signer"
                    value={coSigner}
                    onChange={(e) => onCoSignerChange(e.target.value)}
                    placeholder="Enter co-signer name (optional)"
                />
                {errors.co_signer && <p className="mt-1 text-sm text-red-600">{errors.co_signer}</p>}
                {validationErrors.co_signer && <p className="mt-1 text-sm text-red-600">{validationErrors.co_signer}</p>}
            </div>

            {/* Phone Number Field */}
            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="phone_number" className="text-base font-semibold">
                        Phone Number
                    </Label>
                </div>
                <Input
                    id="phone_number"
                    value={phoneNumber}
                    onChange={(e) => onPhoneNumberChange(e.target.value)}
                    placeholder="Enter phone number (optional)"
                />
                {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
            </div>

            {/* Email Field */}
            <div className="rounded-lg border-l-4 border-l-pink-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="email" className="text-base font-semibold">
                        Email
                    </Label>
                </div>
                <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    placeholder="Enter email address (optional)"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Applicant Applied From Field */}
            <div className="rounded-lg border-l-4 border-l-cyan-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="applicant_applied_from" className="text-base font-semibold">
                        Applied From
                    </Label>
                </div>
                <Select onValueChange={onApplicantAppliedFromChange} value={applicantAppliedFrom}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select where applicant applied from" />
                    </SelectTrigger>
                    <SelectContent>
                        {APPLIED_FROM_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {errors.applicant_applied_from && <p className="mt-1 text-sm text-red-600">{errors.applicant_applied_from}</p>}
            </div>
        </>
    );
}
