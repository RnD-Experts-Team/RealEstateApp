import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { City } from '@/types/City';
import { useForm } from '@inertiajs/react';
import React, { useEffect, useState, useRef } from 'react';
import { OriginalPaymentInfo } from './edit/OriginalPaymentInfo';
import { CascadingSelectionFields } from './edit/CascadingSelectionFields';
import { PaymentDetailsFields } from './edit/PaymentDetailsFields';
import { NotesField } from './edit/NotesField';
import { useCascadingDropdowns } from './edit/useCascadingDropdowns';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface PaymentPlan {
    id: number;
    tenant_id: number | null;
    tenant: string;
    unit: string;
    property: string;
    city_name: string | null;
    amount: number;
    paid: number;
    left_to_pay: number;
    status: string;
    dates: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

type PaymentPlanFormData = {
    tenant_id: number | null;
    amount: number;
    dates: string;
    paid: number;
    notes: string;
}

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: TenantData[];
    paymentPlan: PaymentPlan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    // Context for preserving filters and pagination after update
    search?: string | null;
    filters?: { city?: string | null; property?: string | null; unit?: string | null; tenant?: string | null };
    perPage?: number | string;
    currentPage?: number;
}

export default function PaymentPlanEditDrawer({ 
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    allUnits,
    tenantsData,
    paymentPlan, 
    open, 
    onOpenChange, 
    onSuccess,
    search,
    filters,
    perPage,
    currentPage
}: Props) {
    const [originalPaidAmount, setOriginalPaidAmount] = useState(paymentPlan.paid);
    const [dateError, setDateError] = useState<string>('');
    
    // Refs for focusing on validation errors
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitRef = useRef<HTMLButtonElement>(null!);
    const tenantRef = useRef<HTMLButtonElement>(null!);
    const dateRef = useRef<HTMLButtonElement>(null!);

    // Normalize incoming date to 'yyyy-MM-dd' to avoid off-by-one issues
    const normalizeDate = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        const str = String(dateString);
        // If string already starts with YYYY-MM-DD, take the first 10 chars
        const match = str.match(/^\d{4}-\d{2}-\d{2}/);
        if (match) return match[0];
        // Fallback: try Date parsing and format as YYYY-MM-DD without timezone shifts
        try {
            const d = new Date(str);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        } catch {
            return '';
        }
    };

    const { data, setData, put, processing, errors, transform } = useForm<PaymentPlanFormData>({
        tenant_id: paymentPlan.tenant_id,
        amount: paymentPlan.amount,
        dates: normalizeDate(paymentPlan.dates),
        paid: paymentPlan.paid,
        notes: paymentPlan.notes || ''
    });

    const {
        selectedCity,
        selectedProperty,
        selectedUnit,
        selectedTenant,
        availableProperties,
        availableUnits,
        availableTenants,
        validationErrors,
        handleCityChange,
        handlePropertyChange,
        handleUnitChange,
        handleTenantChange,
        resetSelections,
        setValidationErrors
    } = useCascadingDropdowns({
        cities,
        properties,
        propertiesByCityId,
        unitsByPropertyId,
        tenantsByUnitId,
        allUnits,
        tenantsData,
        paymentPlan,
        setData
    });

    // When switching to a different record, sync the form with that record
    useEffect(() => {
        setData({
            tenant_id: paymentPlan.tenant_id,
            amount: paymentPlan.amount,
            dates: normalizeDate(paymentPlan.dates),
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        setOriginalPaidAmount(paymentPlan.paid);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentPlan.id]);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous validation errors
        setValidationErrors({
            city: '',
            property: '',
            unit: '',
            tenant: ''
        });
        setDateError('');
        
        let hasValidationErrors = false;
        
        // Validate city selection
        if (!selectedCity) {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate property selection
        if (!selectedProperty) {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit selection
        if (!selectedUnit) {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate tenant selection
        if (!selectedTenant || !data.tenant_id) {
            setValidationErrors(prev => ({ ...prev, tenant: 'Please select a tenant before submitting the form.' }));
            if (tenantRef.current) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Require payment date
        if (!data.dates || !String(data.dates).trim()) {
            setDateError('Please select a payment date.');
            if (dateRef.current) {
                dateRef.current.focus();
                dateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }

        // Merge context into payload to preserve state after redirect
        const perPageNormalized = perPage;
        transform((current) => ({
            ...current,
            search: search ?? null,
            city: filters?.city ?? null,
            property: filters?.property ?? null,
            unit: filters?.unit ?? null,
            tenant: filters?.tenant ?? null,
            per_page: perPageNormalized ?? null,
            page: currentPage ?? null,
        }));

        put(route('payment-plans.update', paymentPlan.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset to original values
        setData({
            tenant_id: paymentPlan.tenant_id,
            amount: paymentPlan.amount,
            dates: paymentPlan.dates,
            paid: paymentPlan.paid,
            notes: paymentPlan.notes || ''
        });
        
        resetSelections();
        onOpenChange(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setData('amount', value);
    };

    const handlePaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value) || 0;
        setData('paid', value);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Payment Plan">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <OriginalPaymentInfo paymentPlan={paymentPlan} />

                            <CascadingSelectionFields
                                cities={cities}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                                selectedTenant={selectedTenant}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                availableTenants={availableTenants}
                                validationErrors={validationErrors}
                                formErrors={errors}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                onTenantChange={handleTenantChange}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                tenantRef={tenantRef}
                            />

            <PaymentDetailsFields
                dates={data.dates}
                amount={data.amount}
                paid={data.paid}
                originalPaidAmount={originalPaidAmount}
                errors={dateError ? { ...errors, dates: dateError } : errors}
                onDateChange={(date) => {
                    setData('dates', date);
                    setDateError('');
                }}
                onAmountChange={handleAmountChange}
                onPaidChange={handlePaidChange}
                dateRef={dateRef}
            />

                            <NotesField
                                notes={data.notes}
                                error={errors.notes}
                                onChange={(value) => setData('notes', value)}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 w-full">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating...' : 'Update Payment Plan'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
