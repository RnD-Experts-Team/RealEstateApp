import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm } from '@inertiajs/react';
import React, {  useRef, useState } from 'react';
import { CityPropertyUnitSelector } from './create/CityPropertyUnitSelector';
import { ApplicantInformationSection } from './create/ApplicantInformationSection';
import { StatusAndDateSection } from './create/StatusAndDateSection';
import { AdditionalDetailsSection } from './create/AdditionalDetailsSection';
import { CityData, PropertyData, UnitData } from '@/types/application';

type ApplicationFormData = {
    unit_id: number | null;
    name: string;
    co_signer: string;
    phone_number: string;
    email: string;
    status: string;
    applicant_applied_from: string;
    date: string;
    stage_in_progress: string;
    notes: string;
    attachments: File[];
};

interface Props {
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    currentFilters: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
    };
    perPage: string;
    page: number;
}

export default function ApplicationCreateDrawer({ cities, properties, units, open, onOpenChange, onSuccess, currentFilters, perPage, page }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null!);

    const [validationErrors, setValidationErrors] = useState<{
        city?: string;
        property?: string;
        unit?: string;
        name?: string;
        status?: string;
    }>({});

    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [availableProperties, setAvailableProperties] = useState<PropertyData[]>([]);
    const [availableUnits, setAvailableUnits] = useState<UnitData[]>([]);

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<ApplicationFormData>({
        unit_id: null,
        name: '',
        co_signer: '',
        phone_number: '',
        email: '',
        status: '',
        applicant_applied_from: '',
        date: '',
        stage_in_progress: '',
        notes: '',
        attachments: [],
    });

    const clearForm = () => {
        reset();
        clearErrors();
        setValidationErrors({});
        setSelectedCityId(null);
        setSelectedPropertyId(null);
        setAvailableProperties([]);
        setAvailableUnits([]);
        setData({
            unit_id: null,
            name: '',
            co_signer: '',
            phone_number: '',
            email: '',
            status: '',
            applicant_applied_from: '',
            date: '',
            stage_in_progress: '',
            notes: '',
            attachments: [],
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Keep form state when drawer is closed normally; explicit actions handle clearing

    const handleCityChange = (cityId: string) => {
        const selectedId = parseInt(cityId);
        setSelectedCityId(selectedId);
        setSelectedPropertyId(null);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, city: undefined, property: undefined, unit: undefined }));

        if (properties[selectedId]) {
            setAvailableProperties(properties[selectedId]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyId: string) => {
        const selectedId = parseInt(propertyId);
        setSelectedPropertyId(selectedId);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, property: undefined, unit: undefined }));

        if (units[selectedId]) {
            setAvailableUnits(units[selectedId]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        const selectedId = parseInt(unitId);
        setData('unit_id', selectedId);
        setValidationErrors((prev) => ({ ...prev, unit: undefined }));
    };

    const handleNameChange = (name: string) => {
        setData('name', name);
        setValidationErrors((prev) => ({ ...prev, name: undefined }));
    };

    const handleCoSignerChange = (coSigner: string) => {
        setData('co_signer', coSigner);
    };

    const handlePhoneNumberChange = (phoneNumber: string) => {
        setData('phone_number', phoneNumber);
    };

    const handleEmailChange = (email: string) => {
        setData('email', email);
    };

    const handleApplicantAppliedFromChange = (value: string) => {
        setData('applicant_applied_from', value);
    };

    const handleStatusChange = (status: string) => {
        setData('status', status);
        setValidationErrors((prev) => ({ ...prev, status: undefined }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};

        if (!selectedCityId) {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedPropertyId) {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.unit_id) {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.name || data.name.trim() === '') {
            newValidationErrors.name = 'Please enter a name before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.status || data.status.trim() === '') {
            newValidationErrors.status = 'Please select a status before submitting the form.';
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setValidationErrors(newValidationErrors);
            return;
        }

        transform((payload) => ({
            ...payload,
            filter_city: currentFilters.city || '',
            filter_property: currentFilters.property || '',
            filter_unit: currentFilters.unit || '',
            filter_name: currentFilters.name || '',
            filter_applicant_applied_from: currentFilters.applicant_applied_from || '',
            per_page: perPage,
            page,
        }));
        post(route('applications.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                clearForm();
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        clearForm();
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Application">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                unitId={data.unit_id}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <ApplicantInformationSection
                                name={data.name}
                                coSigner={data.co_signer}
                                phoneNumber={data.phone_number}
                                email={data.email}
                                applicantAppliedFrom={data.applicant_applied_from}
                                onNameChange={handleNameChange}
                                onCoSignerChange={handleCoSignerChange}
                                onPhoneNumberChange={handlePhoneNumberChange}
                                onEmailChange={handleEmailChange}
                                onApplicantAppliedFromChange={handleApplicantAppliedFromChange}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <StatusAndDateSection
                                status={data.status}
                                date={data.date}
                                onStatusChange={handleStatusChange}
                                onDateChange={(date) => setData('date', date)}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <AdditionalDetailsSection
                                stageInProgress={data.stage_in_progress}
                                notes={data.notes}
                                attachments={data.attachments}
                                onStageInProgressChange={(value) => setData('stage_in_progress', value)}
                                onNotesChange={(value) => setData('notes', value)}
                                onAttachmentsChange={(files) => setData('attachments', files)}
                                fileInputRef={fileInputRef}
                                errors={errors}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Creating...' : 'Create Application'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
