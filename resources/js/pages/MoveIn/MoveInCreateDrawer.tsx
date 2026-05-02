import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import { CityPropertyUnitSelector } from './create/CityPropertyUnitSelector';
import { DatePickerField as CreateDatePickerField } from './create/DatePickerField';
import { InsuranceInformationFields } from './create/InsuranceInformationFields';
import { KeysAndFormsFields } from './create/KeysAndFormsFields';
import { LeaseInformationFields } from './create/LeaseInformationFields';
import { PaymentInformationFields } from './create/PaymentInformationFields';

interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

type MoveInFormData = {
    unit_id: number | '';
    signed_lease: 'Yes' | 'No' | '';
    lease_signing_date: string;
    move_in_date: string;
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | '';
    scheduled_paid_time: string;
    handled_keys: 'Yes' | 'No' | '';
    move_in_form_sent_date: string;
    filled_move_in_form: 'Yes' | 'No' | '';
    date_of_move_in_form_filled: string;
    submitted_insurance: 'Yes' | 'No' | '';
    date_of_insurance_expiration: string;
    delisted: boolean;
    utilities_under_their_name: boolean;
    got_lockbox_from_tenant: boolean;
    first_name: string;
    last_name: string;
    last_notice_sent: string;
    notes: string;
};

interface Props {
    units: Unit[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{ id: number; unit_name: string }>>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    // Preserve filters and pagination context from Index
    currentFilters: { city: string; property: string; unit: string };
    currentPerPage: string;
    currentPage: number;
}

export default function MoveInCreateDrawer({
    cities,
    properties,
    unitsByProperty,
    open,
    onOpenChange,
    onSuccess,
    currentFilters,
    currentPerPage,
    currentPage,
}: Props) {
    const DRAFT_STORAGE_KEY = 'moveInCreateDraft';
    const SKIP_RESTORE_KEY = 'moveInCreateDraftSkipRestore';
    const unitRef = useRef<HTMLButtonElement>(null!);
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const [validationError, setValidationError] = useState<string>('');
    const [cityValidationError, setCityValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<Array<{ id: number; unit_name: string }>>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

    const { data, setData, post, processing, errors, reset } = useForm<MoveInFormData>({
        unit_id: '',
        signed_lease: 'No',
        lease_signing_date: '',
        move_in_date: '',
        paid_security_deposit_first_month_rent: 'No',
        scheduled_paid_time: '',
        handled_keys: 'No',
        move_in_form_sent_date: '',
        filled_move_in_form: 'No',
        date_of_move_in_form_filled: '',
        submitted_insurance: 'No',
        date_of_insurance_expiration: '',
        delisted: false,
        utilities_under_their_name: false,
        got_lockbox_from_tenant: false,
        first_name: '',
        last_name: '',
        last_notice_sent: '',
        notes: '',
    });

    const resetFormState = () => {
        reset();
        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');
        setAvailableUnits([]);
        setAvailableProperties([]);
        setSelectedCityId('');
        setSelectedPropertyId('');
    };

    const handleCityChange = (cityId: string) => {
        setSelectedCityId(cityId);
        setSelectedPropertyId('');
        setData('unit_id', '');
        setCityValidationError('');
        setPropertyValidationError('');
        setValidationError('');

        if (cityId) {
            const filteredProperties = properties.filter((property) => property.city_id?.toString() === cityId);
            setAvailableProperties(filteredProperties);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyId: string) => {
        setSelectedPropertyId(propertyId);
        setData('unit_id', '');
        setPropertyValidationError('');
        setValidationError('');

        if (propertyId && unitsByProperty && unitsByProperty[propertyId]) {
            setAvailableUnits(unitsByProperty[propertyId]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        setData('unit_id', parseInt(unitId));
        setValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationError('');
        setCityValidationError('');
        setPropertyValidationError('');

        let hasValidationErrors = false;

        if (!selectedCityId || selectedCityId.trim() === '') {
            setCityValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!selectedPropertyId || selectedPropertyId.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.unit_id || (typeof data.unit_id === 'number' && data.unit_id <= 0)) {
            setValidationError('Please select a unit before submitting the form.');
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            return;
        }

        post(
            route('move-in.store', {
                city: currentFilters.city?.trim() || undefined,
                property: currentFilters.property?.trim() || undefined,
                unit: currentFilters.unit?.trim() || undefined,
                perPage: currentPerPage,
                page: currentPage,
            }),
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    // Clear saved draft after successful creation and skip next restore
                    try {
                        localStorage.removeItem(DRAFT_STORAGE_KEY);
                        localStorage.setItem(SKIP_RESTORE_KEY, 'true');
                    } catch {}
                    resetFormState();
                    onOpenChange(false);
                    onSuccess?.();
                },
            },
        );
    };

    const handleCancel = () => {
        // Clear saved draft explicitly when cancelling and skip next restore
        try {
            localStorage.removeItem(DRAFT_STORAGE_KEY);
            localStorage.setItem(SKIP_RESTORE_KEY, 'true');
        } catch {}
        resetFormState();
        onOpenChange(false);
    };

    // Restore saved state on mount (keep data when drawer is closed, unless cancelled)
    useEffect(() => {
        try {
            const skip = localStorage.getItem(SKIP_RESTORE_KEY) === 'true';
            if (skip) {
                localStorage.removeItem(SKIP_RESTORE_KEY);
                return; // do not restore after cancel or successful creation
            }
            const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
            if (saved) {
                const parsed: {
                    data: MoveInFormData;
                    selectedCityId: string;
                    selectedPropertyId: string;
                } = JSON.parse(saved);

                // Restore form data
                setData((prev) => ({ ...prev, ...parsed.data }));

                // Restore city and property selections
                const cityId = parsed.selectedCityId || '';
                const propertyId = parsed.selectedPropertyId || '';
                setSelectedCityId(cityId);
                setSelectedPropertyId(propertyId);

                // Recompute available properties based on city
                if (cityId) {
                    const filteredProperties = properties.filter((property) => property.city_id?.toString() === cityId);
                    setAvailableProperties(filteredProperties);
                }

                // Recompute available units based on property
                if (propertyId && unitsByProperty && unitsByProperty[propertyId]) {
                    setAvailableUnits(unitsByProperty[propertyId]);
                }
            }
        } catch {}
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Persist form and selection state locally whenever it changes
    useEffect(() => {
        try {
            if (open) {
                const payload = {
                    data,
                    selectedCityId,
                    selectedPropertyId,
                };
                localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload));
            }
        } catch {}
    }, [open, data, selectedCityId, selectedPropertyId]);

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Move-In Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                unitId={data.unit_id}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                errors={errors}
                                cityValidationError={cityValidationError}
                                propertyValidationError={propertyValidationError}
                                validationError={validationError}
                            />

                            <LeaseInformationFields
                                signedLease={data.signed_lease}
                                leaseSigningDate={data.lease_signing_date}
                                moveInDate={data.move_in_date}
                                onSignedLeaseChange={(value) => setData('signed_lease', value)}
                                onLeaseSigningDateChange={(value) => setData('lease_signing_date', value)}
                                onMoveInDateChange={(value) => setData('move_in_date', value)}
                                errors={errors}
                            />

                            <PaymentInformationFields
                                paidSecurityDeposit={data.paid_security_deposit_first_month_rent}
                                scheduledPaidTime={data.scheduled_paid_time}
                                onPaidSecurityDepositChange={(value) => setData('paid_security_deposit_first_month_rent', value)}
                                onScheduledPaidTimeChange={(value) => setData('scheduled_paid_time', value)}
                                errors={errors}
                            />

                            <KeysAndFormsFields
                                handledKeys={data.handled_keys}
                                moveInFormSentDate={data.move_in_form_sent_date}
                                filledMoveInForm={data.filled_move_in_form}
                                dateOfMoveInFormFilled={data.date_of_move_in_form_filled}
                                onHandledKeysChange={(value) => setData('handled_keys', value)}
                                onMoveInFormSentDateChange={(value) => setData('move_in_form_sent_date', value)}
                                onFilledMoveInFormChange={(value) => {
                                    setData('filled_move_in_form', value);
                                    if (value !== 'Yes') {
                                        setData('date_of_move_in_form_filled', '');
                                    }
                                }}
                                onDateOfMoveInFormFilledChange={(value) => setData('date_of_move_in_form_filled', value)}
                                errors={errors}
                            />

                            <InsuranceInformationFields
                                submittedInsurance={data.submitted_insurance}
                                dateOfInsuranceExpiration={data.date_of_insurance_expiration}
                                onSubmittedInsuranceChange={(value) => {
                                    setData('submitted_insurance', value);
                                    if (value !== 'Yes') {
                                        setData('date_of_insurance_expiration', '');
                                    }
                                }}
                                onDateOfInsuranceExpirationChange={(value) => setData('date_of_insurance_expiration', value)}
                                errors={errors}
                            />

                            {/* Additional Move-In Fields */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="delisted"
                                        checked={data.delisted}
                                        onChange={(e) => setData('delisted', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="delisted" className="cursor-pointer text-base font-semibold">
                                        Delisted
                                    </Label>
                                </div>
                                {errors.delisted && <p className="mt-1 text-sm text-red-600">{errors.delisted}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="utilities_under_their_name"
                                        checked={data.utilities_under_their_name}
                                        onChange={(e) => setData('utilities_under_their_name', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="utilities_under_their_name" className="cursor-pointer text-base font-semibold">
                                        Utilities Under Their Name
                                    </Label>
                                </div>
                                {errors.utilities_under_their_name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.utilities_under_their_name}</p>
                                )}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="got_lockbox_from_tenant"
                                        checked={data.got_lockbox_from_tenant}
                                        onChange={(e) => setData('got_lockbox_from_tenant', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="got_lockbox_from_tenant" className="cursor-pointer text-base font-semibold">
                                        Got The Lockbox From Tenant
                                    </Label>
                                </div>
                                {errors.got_lockbox_from_tenant && <p className="mt-1 text-sm text-red-600">{errors.got_lockbox_from_tenant}</p>}
                            </div>

                            {/* Tenant & Notice Information */}
                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="first_name" className="text-base font-semibold">
                                        First Name
                                    </Label>
                                </div>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={data.first_name}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    placeholder="Enter first name"
                                />
                                {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>}
                            </div>

                            <div className="rounded-lg border-l-4 border-l-blue-500 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="last_name" className="text-base font-semibold">
                                        Last Name
                                    </Label>
                                </div>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={data.last_name}
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    placeholder="Enter last name"
                                />
                                {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>}
                            </div>

                            <CreateDatePickerField
                                label="Last Notice Sent"
                                value={data.last_notice_sent}
                                onChange={(value) => setData('last_notice_sent', value ?? '')}
                                error={errors.last_notice_sent}
                                borderColor="border-l-blue-500"
                            />

                            <div className="rounded-lg border-l-4 border-l-slate-400 p-4">
                                <div className="mb-2">
                                    <Label htmlFor="notes" className="text-base font-semibold">
                                        Notes
                                    </Label>
                                </div>
                                <textarea
                                    id="notes"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                                    rows={3}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Enter any additional notes..."
                                />
                                {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex w-full justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} onClick={submit}>
                                {processing ? 'Creating...' : 'Create Move-In Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
