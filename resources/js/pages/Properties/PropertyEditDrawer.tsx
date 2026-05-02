// resources/js/pages/Properties/PropertyEditDrawer.tsx
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { City } from '@/types/City';
import { InsuranceRepresentative, Property, PropertyFilters as PropertyFiltersType, PropertyWithoutInsurance } from '@/types/property';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import CitySelectionSection from './create/CitySelectionSection';
import PropertySelectionSection from './create/PropertySelectionSection';
import AmountPolicyFields from './edit/AmountPolicyFields';
import AttachmentsSection from './edit/AttachmentsSection';
import DateFields from './edit/DateFields';
import InsuranceCompanyField from './edit/InsuranceCompanyField';
import NotesField from './edit/NotesField';
import RepresentativeSection from './edit/RepresentativeSection';

interface PropertyEditDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    property: Property;
    availableProperties: PropertyWithoutInsurance[];
    representatives: InsuranceRepresentative[];
    onSuccess?: () => void;
    // New props for preserving pagination and filters
    currentFilters: PropertyFiltersType;
    currentPage: number;
    currentPerPage: number | 'all';
    // Cities to enable city selection like create drawer
    cities: City[];
}

export default function PropertyEditDrawer({
    open,
    onOpenChange,
    property,
    availableProperties = [],
    representatives = [],
    onSuccess,
    currentFilters,
    currentPage,
    currentPerPage,
    cities = [],
}: PropertyEditDrawerProps) {
    // Only validation error for required field (property_id)
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');

    // City selection state (behaves like create drawer)
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [filteredProperties, setFilteredProperties] = useState<PropertyWithoutInsurance[]>([]);

    // Representative and attachments state
    const [representativeId, setRepresentativeId] = useState<number | null>(null);
    const [newAttachments, setNewAttachments] = useState<File[]>([]);
    const [deleteAttachmentIds, setDeleteAttachmentIds] = useState<number[]>([]);

    const { data, setData, post, processing, errors, clearErrors, transform } = useForm({
        property_id: property.property_id || 0,
        insurance_company_name: property.insurance_company_name || '',
        amount: property.amount ? property.amount.toString() : '',
        policy_number: property.policy_number || '',
        effective_date: property.effective_date || '',
        expiration_date: property.expiration_date || '',
        notes: property.notes || '',
    });

    /**
     * Reset form data when property changes
     */
    useEffect(() => {
        if (property) {
            setData({
                property_id: property.property_id || 0,
                insurance_company_name: property.insurance_company_name || '',
                amount: property.amount ? property.amount.toString() : '',
                policy_number: property.policy_number || '',
                effective_date: property.effective_date || '',
                expiration_date: property.expiration_date || '',
                notes: property.notes || '',
            });
            setPropertyIdValidationError('');
            setRepresentativeId(property.representative_id ?? null);
            setNewAttachments([]);
            setDeleteAttachmentIds([]);

            // Initialize city selection based on the current property's city
            const currentProperty = property.property;
            const initialCityId = currentProperty?.city_id ? currentProperty.city_id.toString() : '';
            setSelectedCityId(initialCityId);
        }
    }, [property]);

    /**
     * Filter properties by selected city and include current property if missing
     * Mirrors create drawer behavior but ensures the current property is selectable
     */
    useEffect(() => {
        if (selectedCityId) {
            const cityIdNum = parseInt(selectedCityId);
            let filtered = availableProperties.filter((p) => p.city_id === cityIdNum);

            // Ensure the currently selected property is included even if not in availableProperties
            const currentProperty = property?.property;
            if (currentProperty && currentProperty.city_id === cityIdNum) {
                const exists = filtered.some((p) => p.id === currentProperty.id);
                if (!exists) {
                    filtered = [
                        {
                            id: currentProperty.id,
                            city_id: currentProperty.city_id ?? null,
                            property_name: currentProperty.property_name,
                            is_archived: currentProperty.is_archived,
                            created_at: currentProperty.created_at,
                            updated_at: currentProperty.updated_at,
                            city: currentProperty.city,
                        },
                        ...filtered,
                    ];
                }
            }
            setFilteredProperties(filtered);
        } else {
            setFilteredProperties([]);
        }
        // Do not auto-reset here; handleCityChange controls property_id reset
    }, [selectedCityId, availableProperties, property]);

    // Property ID change handled inline via PropertySelectionSection

    /**
     * Handle insurance company name change
     * No validation needed - field is nullable
     */
    const handleInsuranceCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('insurance_company_name', e.target.value);
    };

    /**
     * Handle amount change
     * No validation needed - field is nullable
     */
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('amount', e.target.value);
    };

    /**
     * Handle policy number change
     * No validation needed - field is nullable
     */
    const handlePolicyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('policy_number', e.target.value);
    };

    /**
     * Handle effective date change
     * No validation needed - field is nullable
     */
    const handleEffectiveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('effective_date', e.target.value);
    };

    /**
     * Handle expiration date change
     * No validation needed - field is nullable
     */
    const handleExpirationDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('expiration_date', e.target.value);
    };

    /**
     * Handle notes change
     * No validation needed - field is optional
     */
    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('notes', e.target.value);
    };

    /**
     * Handle city change (like create drawer)
     * Updates selected city, resets property selection, and clears errors
     */
    const handleCityChange = (value: string) => {
        setSelectedCityId(value);
        setData('property_id', 0);
        clearErrors();
        setPropertyIdValidationError('');
    };

    /**
     * Build namespaced filter & pagination params to include in PUT body
     * Mirrors the Payments flow to avoid collisions with form fields
     */
    const buildNamespacedParams = (): Record<string, any> => {
        const params: Record<string, any> = {};

        // Pagination context
        if (currentPerPage) params.filter_per_page = String(currentPerPage);
        if (currentPage && currentPage > 0) params.filter_page = currentPage;

        // Filters context
        const { property_name, insurance_company_name, policy_number, status } = currentFilters || {};
        if (property_name) params.filter_property_name = property_name;
        if (insurance_company_name) params.filter_insurance_company_name = insurance_company_name;
        if (policy_number) params.filter_policy_number = policy_number;
        if (status) params.filter_status = status;

        return params;
    };

    /**
     * Handle form submission
     * Only validates that property_id is selected (required field)
     * All other fields are optional/nullable
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Only validate required field: property_id
        if (!data.property_id || data.property_id === 0) {
            setPropertyIdValidationError('Please select a property before submitting the form.');
            return;
        }

        // Namespace filters/pagination into body to preserve context on redirect
        transform((formData) => ({
            ...formData,
            _method: 'post',
            representative_id: representativeId,
            attachments: newAttachments,
            delete_attachment_ids: deleteAttachmentIds,
            ...buildNamespacedParams(),
        }));

        // Use POST instead of PUT to support multipart file uploads
        // Form method spoofing with _method: 'put' allows the server to treat this as a PUT request
        post(route('properties-info.update', property.id), {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setPropertyIdValidationError('');
                onOpenChange(false);
                if (onSuccess) {
                    // onSuccess();
                }
            },
            onError: () => {
                // Errors from backend will be automatically handled
                // They will appear in the errors state and shown in the form
            },
        });
    };

    /**
     * Handle cancel button
     * Resets to original property data and closes drawer
     */
    const handleCancel = () => {
        // Reset to original property data
        setData({
            property_id: property.property_id || 0,
            insurance_company_name: property.insurance_company_name || '',
            amount: property.amount ? property.amount.toString() : '',
            policy_number: property.policy_number || '',
            effective_date: property.effective_date || '',
            expiration_date: property.expiration_date || '',
            notes: property.notes || '',
        });
        clearErrors();
        setPropertyIdValidationError('');
        setRepresentativeId(property.representative_id ?? null);
        setNewAttachments([]);
        setDeleteAttachmentIds([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Property - ${property.property?.property_name || 'Unknown'}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* City selection - used to filter properties (same as create) */}
                            <CitySelectionSection selectedCityId={selectedCityId} cities={cities} onCityChange={handleCityChange} />

                            {/* Property selection - REQUIRED (same as create) */}
                            <PropertySelectionSection
                                propertyId={data.property_id}
                                selectedCityId={selectedCityId}
                                filteredProperties={filteredProperties}
                                onPropertyChange={(value) => {
                                    setData('property_id', parseInt(value));
                                    setPropertyIdValidationError('');
                                }}
                                errors={errors}
                                validationError={propertyIdValidationError}
                            />

                            {/* Insurance company - optional (nullable) */}
                            <InsuranceCompanyField
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                error={errors.insurance_company_name}
                            />

                            {/* Amount and policy number - optional (nullable) */}
                            <AmountPolicyFields
                                amountValue={data.amount}
                                policyNumberValue={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                amountError={errors.amount}
                                policyNumberError={errors.policy_number}
                            />

                            {/* Dates - optional (nullable) */}
                            <DateFields
                                effectiveDateValue={data.effective_date}
                                expirationDateValue={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                effectiveDateError={errors.effective_date}
                                expirationDateError={errors.expiration_date}
                            />

                            {/* Notes - optional */}
                            <NotesField value={data.notes} onChange={handleNotesChange} error={errors.notes} />

                            {/* Representative - optional */}
                            <RepresentativeSection representatives={representatives} value={representativeId} onChange={setRepresentativeId} />

                            {/* Attachments - optional */}
                            <AttachmentsSection
                                existingAttachments={property.attachments || []}
                                newFiles={newAttachments}
                                onNewFiles={setNewAttachments}
                                onDeleteExisting={(id) => {
                                    setDeleteAttachmentIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
                                }}
                                deletedAttachmentIds={deleteAttachmentIds}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleSubmit} disabled={processing}>
                                {processing ? 'Updating...' : 'Update Property'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
