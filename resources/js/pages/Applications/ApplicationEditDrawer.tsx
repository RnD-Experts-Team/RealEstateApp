import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Application, CityData, PropertyData, UnitData } from '@/types/application';
import { useForm } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ApplicantInformationFields } from './edit/ApplicantInformationFields';
import { AttachmentField } from './edit/AttachmentField';
import { CityPropertyUnitSelector } from './edit/CityPropertyUnitSelector';
import { CurrentSelectionDisplay } from './edit/CurrentSelectionDisplay';
import { StageAndNotesFields } from './edit/StageAndNotesFields';
import { StatusAndDateFields } from './edit/StatusAndDateFields';

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
    removed_attachment_indices?: number[];
};

interface Props {
    application: Application;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    currentFilters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
    };
    perPage?: string;
    page?: number;
}

export default function ApplicationEditDrawer({ application, cities, properties, units, open, onOpenChange, onSuccess, currentFilters, perPage = '15', page = 1 }: Props) {
    const [validationErrors, setValidationErrors] = useState<{
        city?: string;
        property?: string;
        unit?: string;
        name?: string;
        status?: string;
    }>({});

    const [selectedCityId, setSelectedCityId] = useState<number | null>(application.selected_city_id || null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(application.selected_property_id || null);
    const [availableProperties, setAvailableProperties] = useState<PropertyData[]>([]);
    const [availableUnits, setAvailableUnits] = useState<UnitData[]>([]);
    const [removedAttachmentIndices, setRemovedAttachmentIndices] = useState<number[]>([]);
    const [newAttachments, setNewAttachments] = useState<File[]>([]);

    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const raw = dateString.trim();
        if (!raw || raw === '0000-00-00') return '';

        try {
            const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
            if (m) {
                const [, y, mo, d] = m;
                const localDate = new Date(Number(y), Number(mo) - 1, Number(d));
                if (isValid(localDate)) {
                    return format(localDate, 'yyyy-MM-dd');
                }
            }

            const parsed = parse(raw, 'yyyy-MM-dd', new Date(2000, 0, 1));
            if (isValid(parsed)) {
                return format(parsed, 'yyyy-MM-dd');
            }

            return '';
        } catch (error) {
            console.warn('Date parsing error:', error);
            return '';
        }
    };

    const { data, setData, post, processing, errors, transform } = useForm<ApplicationFormData>({
        unit_id: application.unit_id,
        name: application.name || '',
        co_signer: application.co_signer ?? '',
        phone_number: application.phone_number ?? '',
        email: application.email ?? '',
        status: application.status || 'New',
        applicant_applied_from: application.applicant_applied_from ?? '',
        date: formatDateForInput(application.date),
        stage_in_progress: application.stage_in_progress || '',
        notes: application.notes || '',
        attachments: [],
        removed_attachment_indices: [],
    });

    // Derive selected city and property from the record if not explicitly provided
    const deriveSelectionFromRecord = (): { cityId: number | null; propertyId: number | null } => {
        let propertyId: number | null = application.selected_property_id ?? null;
        let cityId: number | null = application.selected_city_id ?? null;

        // If propertyId missing, attempt to find it by locating the unit in the units mapping
        if ((!propertyId || isNaN(propertyId)) && application.unit_id) {
            for (const [propIdStr, unitList] of Object.entries(units || {})) {
                if (unitList?.some((u) => u.id === application.unit_id)) {
                    propertyId = parseInt(propIdStr, 10);
                    break;
                }
            }
        }

        // If cityId missing, attempt to find it by locating the property in the properties mapping
        if ((!cityId || isNaN(cityId)) && propertyId) {
            for (const [cityIdStr, propertyList] of Object.entries(properties || {})) {
                if (propertyList?.some((p) => p.id === propertyId)) {
                    cityId = parseInt(cityIdStr, 10);
                    break;
                }
            }
        }

        return { cityId: cityId ?? null, propertyId: propertyId ?? null };
    };

    // Initialize form data when application changes
    useEffect(() => {
        if (application && open) {
            const { cityId, propertyId } = deriveSelectionFromRecord();

            setSelectedCityId(cityId);
            setSelectedPropertyId(propertyId);
            setRemovedAttachmentIndices([]);
            setNewAttachments([]);

            // Set available properties for the city
            if (cityId && properties[cityId]) {
                setAvailableProperties(properties[cityId]);
            } else {
                setAvailableProperties([]);
            }

            // Set available units for the property
            if (propertyId && units[propertyId]) {
                setAvailableUnits(units[propertyId]);
            } else {
                setAvailableUnits([]);
            }

            // Update form data
            setData({
                unit_id: application.unit_id,
                name: application.name || '',
                co_signer: application.co_signer ?? '',
                phone_number: application.phone_number ?? '',
                email: application.email ?? '',
                status: application.status || 'New',
                applicant_applied_from: application.applicant_applied_from ?? '',
                date: formatDateForInput(application.date),
                stage_in_progress: application.stage_in_progress || '',
                notes: application.notes || '',
                attachments: [],
                removed_attachment_indices: [],
            });
        }
    }, [application, open, properties, units]);

    // Reset form when drawer closes
    useEffect(() => {
        if (!open) {
            setValidationErrors({});
            setRemovedAttachmentIndices([]);
            setNewAttachments([]);
        }
    }, [open]);

    // Handle city selection
    const handleCityChange = (cityId: string) => {
        const selectedId = parseInt(cityId);
        setSelectedCityId(selectedId);
        setSelectedPropertyId(null);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, city: undefined, property: undefined, unit: undefined }));

        // Get properties for selected city
        if (properties[selectedId]) {
            setAvailableProperties(properties[selectedId]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    // Handle property selection
    const handlePropertyChange = (propertyId: string) => {
        const selectedId = parseInt(propertyId);
        setSelectedPropertyId(selectedId);
        setData('unit_id', null);
        setValidationErrors((prev) => ({ ...prev, property: undefined, unit: undefined }));

        // Get units for selected property
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

    const handleRemoveAttachment = (index: number) => {
        if (!removedAttachmentIndices.includes(index)) {
            const newRemovedIndices = [...removedAttachmentIndices, index];
            setRemovedAttachmentIndices(newRemovedIndices);
            setData('removed_attachment_indices', newRemovedIndices);
        }
    };

    const handleUndoRemoveAttachment = (index: number) => {
        const newRemovedIndices = removedAttachmentIndices.filter((i) => i !== index);
        setRemovedAttachmentIndices(newRemovedIndices);
        setData('removed_attachment_indices', newRemovedIndices);
    };

    const handleAddAttachments = (files: File[]) => {
        // Combine new files with existing new attachments
        const combinedFiles = [...newAttachments, ...files];
        setNewAttachments(combinedFiles);
        setData('attachments', combinedFiles);
    };

    const handleRemoveNewAttachment = (index: number) => {
        const updatedFiles = newAttachments.filter((_, i) => i !== index);
        setNewAttachments(updatedFiles);
        setData('attachments', updatedFiles);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Clear any previous validation errors
        setValidationErrors({});

        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};

        // Validate required fields
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
            _method: 'put',
            filter_city: currentFilters?.city || '',
            filter_property: currentFilters?.property || '',
            filter_unit: currentFilters?.unit || '',
            filter_name: currentFilters?.name || '',
            filter_applicant_applied_from: currentFilters?.applicant_applied_from || '',
            per_page: perPage,
            page,
        }));

        // Use put method for UPDATE request
        post(route('applications.update', application.id), {
            forceFormData: true,
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setValidationErrors({});
                setNewAttachments([]);
                setRemovedAttachmentIndices([]);
                onOpenChange(false);
                onSuccess?.();
            },
            onError: () => console.error('Update failed'),
        });
    };

    const handleCancel = () => {
        setValidationErrors({});
        setRemovedAttachmentIndices([]);
        setNewAttachments([]);
        onOpenChange(false);
    };

    // Filter out removed attachments for display
    const visibleAttachments = (application.attachments || []).filter((_, index) => !removedAttachmentIndices.includes(index));

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Application - ${application.name}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityPropertyUnitSelector
                                cities={cities}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={data.unit_id}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <CurrentSelectionDisplay city={application.city} property={application.property} unitName={application.unit_name} />

                            <ApplicantInformationFields
                                name={data.name}
                                coSigner={data.co_signer}
                                phoneNumber={data.phone_number}
                                email={data.email}
                                applicantAppliedFrom={data.applicant_applied_from}
                                onNameChange={(name) => {
                                    setData('name', name);
                                    setValidationErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                onCoSignerChange={(coSigner) => {
                                    setData('co_signer', coSigner);
                                }}
                                onPhoneNumberChange={(phoneNumber) => {
                                    setData('phone_number', phoneNumber);
                                }}
                                onEmailChange={(email) => {
                                    setData('email', email);
                                }}
                                onApplicantAppliedFromChange={(value) => {
                                    setData('applicant_applied_from', value);
                                }}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <StatusAndDateFields
                                status={data.status}
                                date={data.date}
                                onStatusChange={(status) => {
                                    setData('status', status);
                                    setValidationErrors((prev) => ({ ...prev, status: undefined }));
                                }}
                                onDateChange={(date) => setData('date', date)}
                                errors={errors}
                                validationErrors={validationErrors}
                            />

                            <StageAndNotesFields
                                stageInProgress={data.stage_in_progress}
                                notes={data.notes}
                                onStageChange={(stage) => setData('stage_in_progress', stage)}
                                onNotesChange={(notes) => setData('notes', notes)}
                                errors={errors}
                            />

                            <AttachmentField
                                currentAttachments={visibleAttachments}
                                allAttachments={application.attachments}
                                removedAttachmentIndices={removedAttachmentIndices}
                                newAttachments={newAttachments}
                                onRemoveAttachment={handleRemoveAttachment}
                                onUndoRemoveAttachment={handleUndoRemoveAttachment}
                                onAddAttachments={handleAddAttachments}
                                onRemoveNewAttachment={handleRemoveNewAttachment}
                                errors={errors}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} onClick={submit}>
                                {processing ? 'Updating…' : 'Update Application'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
