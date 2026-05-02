// resources/js/Pages/Properties/PropertyCreateDrawer.tsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { PropertyWithoutInsurance, PropertyFilters as PropertyFiltersType, InsuranceRepresentative } from '@/types/property';
import { City } from '@/types/City';
import CitySelectionSection from './create/CitySelectionSection';
import PropertySelectionSection from './create/PropertySelectionSection';
import InsuranceCompanySection from './create/InsuranceCompanySection';
import AmountPolicySection from './create/AmountPolicySection';
import DatesSection from './create/DatesSection';
import NotesSection from './create/NotesSection';
import RepresentativeSection from './create/RepresentativeSection';
import AttachmentsSection from './create/AttachmentsSection';

interface PropertyCreateDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cities: City[];
    availableProperties: PropertyWithoutInsurance[];
    representatives: InsuranceRepresentative[];
    onSuccess?: () => void;
    // New props for preserving pagination and filters
    currentFilters: PropertyFiltersType;
    currentPage: number;
    currentPerPage: number | 'all';
}

export default function PropertyCreateDrawer({
    open,
    onOpenChange,
    cities = [],
    availableProperties = [],
    representatives = [],
    currentFilters,
    currentPage,
    currentPerPage
}: PropertyCreateDrawerProps) {
    const [selectedCityId, setSelectedCityId] = useState<string>('');
    const [filteredProperties, setFilteredProperties] = useState<PropertyWithoutInsurance[]>([]);
    const [representativeId, setRepresentativeId] = useState<number | null>(null);
    const [newAttachments, setNewAttachments] = useState<File[]>([]);

    // Only validation error for required field (property_id)
    const [propertyIdValidationError, setPropertyIdValidationError] = useState<string>('');

    // Define initial form values
    const initialFormValues = {
        property_id: 0,
        insurance_company_name: '',
        amount: '',
        policy_number: '',
        effective_date: '',
        expiration_date: '',
        notes: '',
    };

    const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm(initialFormValues);

    /**
     * Filter properties by selected city
     * When city changes, reset property selection
     */
    useEffect(() => {
        if (selectedCityId) {
            const filtered = availableProperties.filter(
                property => property.city_id === parseInt(selectedCityId)
            );
            setFilteredProperties(filtered);
        } else {
            setFilteredProperties([]);
        }
        // Reset property selection when city changes
        setData('property_id', 0);
    }, [selectedCityId, availableProperties]);

    /**
     * Preserve form state when drawer reopens unless user cancels or submits.
     * Removing the auto-reset-on-open ensures filled data remains after closing.
     */

    /**
     * Function to reset all form state
     */
    const resetForm = () => {
        reset();
        setSelectedCityId('');
        setFilteredProperties([]);
        setRepresentativeId(null);
        setNewAttachments([]);
        setPropertyIdValidationError('');
        clearErrors();
    };

    /**
     * Handle property ID change
     * Clear validation error when user interacts with field
     */
    const handlePropertyIdChange = (value: string) => {
        setData('property_id', parseInt(value));
        setPropertyIdValidationError('');
    };

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
     * Build namespaced filter & pagination params to include in POST body
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
            representative_id: representativeId,
            attachments: newAttachments,
            ...buildNamespacedParams()
        }));

        post(route('properties-info.store'), {
            preserveState: true,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
                // Intentionally not calling onSuccess to avoid redundant reload;
                // backend redirects with preserved context.
            },
            onError: () => {
                // Errors from backend will be automatically handled
                // They will appear in the errors state and shown in the form
            }
        });
    };

    /**
     * Handle cancel button
     * Resets form and closes drawer
     */
    const handleCancel = () => {
        resetForm();
        onOpenChange(false);
    };

    /**
     * Handle city change
     * Updates selected city and filters properties
     */
    const handleCityChange = (value: string) => {
        setSelectedCityId(value);
        setData('property_id', 0);
        clearErrors();
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Property Insurance">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* City selection - required to filter properties */}
                            <CitySelectionSection
                                selectedCityId={selectedCityId}
                                cities={cities}
                                onCityChange={handleCityChange}
                            />

                            {/* Property selection - REQUIRED */}
                            <PropertySelectionSection
                                propertyId={data.property_id}
                                selectedCityId={selectedCityId}
                                filteredProperties={filteredProperties}
                                onPropertyChange={handlePropertyIdChange}
                                errors={errors}
                                validationError={propertyIdValidationError}
                            />

                            {/* Insurance company - optional (nullable) */}
                            <InsuranceCompanySection
                                value={data.insurance_company_name}
                                onChange={handleInsuranceCompanyChange}
                                errors={errors}
                            />

                            {/* Amount and policy number - optional (nullable) */}
                            <AmountPolicySection
                                amount={data.amount}
                                policyNumber={data.policy_number}
                                onAmountChange={handleAmountChange}
                                onPolicyNumberChange={handlePolicyNumberChange}
                                errors={errors}
                            />

                            {/* Dates - optional (nullable) */}
                            <DatesSection
                                effectiveDate={data.effective_date}
                                expirationDate={data.expiration_date}
                                onEffectiveDateChange={handleEffectiveDateChange}
                                onExpirationDateChange={handleExpirationDateChange}
                                errors={errors}
                            />

                            {/* Notes - optional */}
                            <NotesSection
                                value={data.notes}
                                onChange={handleNotesChange}
                                errors={errors}
                            />

                            {/* Representative - optional */}
                            <RepresentativeSection
                                representatives={representatives}
                                value={representativeId}
                                onChange={setRepresentativeId}
                            />

                            {/* Attachments - optional */}
                            <AttachmentsSection
                                files={newAttachments}
                                onChange={setNewAttachments}
                            />
                        </form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 border-t bg-muted/50 p-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={handleSubmit} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Property'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
