import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { City, Notice, NoticeAndEviction, PropertyInfoWithoutInsurance, Tenant } from '@/types/NoticeAndEviction';
import { router, useForm } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { AttorneySection } from './edit/AttorneySection';
import { CascadingSelectionSection } from './edit/CascadingSelectionSection';
import { DateSection } from './edit/DateSection';
import { EvictionPaymentPlanSection } from './edit/EvictionPaymentPlanSection';
import { EvictionsSection } from './edit/EvictionsSection';
import { ExceptionSection } from './edit/ExceptionSection';
import { HearingDatesSection } from './edit/HearingDatesSection';
import { IfLeftSection } from './edit/IfLeftSection';
import ImagesSection from './edit/ImagesSection';
import { NoteSection } from './edit/NoteSection';
import { NoticeTypeSection } from './edit/NoticeTypeSection';
import { OtherTenantsSection } from './edit/OtherTenantsSection';
import { SelectionSummary } from './edit/SelectionSummary';
import { StatusSection } from './edit/StatusSection';
import { WritDateSection } from './edit/WritDateSection';

interface Unit {
    id: number;
    property_id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedTenant extends Tenant {
    unit_id: number;
    full_name: string;
    unit_name: string;
    property_name: string;
    city_name: string;
}

interface ExtendedProperty extends PropertyInfoWithoutInsurance {
    city_id: number;
    city_name: string;
}

interface Props {
    record: NoticeAndEviction;
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    notices: Notice[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    queryParams?: Record<string, any>;
}

export default function NoticeAndEvictionsEditDrawer({
    record,
    cities,
    properties,
    units,
    tenants,
    notices,
    open,
    onOpenChange,
    onSuccess,
    queryParams = {},
}: Props) {
    const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);
    const [selectedUnitId, setSelectedUnitId] = useState<number | null>(null);

    const [filteredProperties, setFilteredProperties] = useState<ExtendedProperty[]>([]);
    const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
    const [filteredTenants, setFilteredTenants] = useState<ExtendedTenant[]>([]);

    const [newImages, setNewImages] = useState<File[]>([]);
    const [deleteImageIds, setDeleteImageIds] = useState<number[]>([]);

    const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString || dateString.trim() === '') {
            return '';
        }

        try {
            const parsedDate = new Date(dateString);
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString().split('T')[0];
            }
            return '';
        } catch (error) {
            console.warn('Date formatting error:', error);
            return '';
        }
    };

    const { data, setData, processing, errors } = useForm({
        tenant_id: record.tenant_id || null,
        status: record.status || '',
        date: formatDateForInput(record.date) || '',
        type_of_notice: record.type_of_notice || '',
        have_an_exception: record.have_an_exception || '',
        note: record.note || '',
        evictions: record.evictions || '',
        sent_to_atorney: record.sent_to_atorney || '',
        hearing_dates: formatDateForInput(record.hearing_dates) || '',
        evected_or_payment_plan: record.evected_or_payment_plan || '',
        if_left: record.if_left || '',
        writ_date: formatDateForInput(record.writ_date) || '',
        other_tenants: record.other_tenants || '',
    });

    useEffect(() => {
        if (open) {
            setNewImages([]);
            setDeleteImageIds([]);
        }

        if (record && record.tenant_id && open) {
            const currentTenant = tenants.find((t) => t.id === record.tenant_id);
            if (currentTenant) {
                const currentUnit = units.find((u) => u.id === currentTenant.unit_id);
                if (currentUnit) {
                    const currentProperty = properties.find((p) => p.id === currentUnit.property_id);
                    if (currentProperty) {
                        setSelectedCityId(currentProperty.city_id);

                        const filteredProps = properties.filter((p) => p.city_id === currentProperty.city_id);
                        setFilteredProperties(filteredProps);
                        setSelectedPropertyId(currentProperty.id);

                        const filteredUnits = units.filter((u) => u.property_id === currentProperty.id);
                        setFilteredUnits(filteredUnits);
                        setSelectedUnitId(currentUnit.id);

                        const filteredTenants = tenants.filter((t) => t.unit_id === currentUnit.id);
                        setFilteredTenants(filteredTenants);
                    }
                }
            }
        }
    }, [record, tenants, units, properties, open]);

    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCityId(cityIdNum);
        setSelectedPropertyId(null);
        setSelectedUnitId(null);
        setData('tenant_id', null);
        setData('other_tenants', '');

        const filtered = properties.filter((property) => property.city_id === cityIdNum);
        setFilteredProperties(filtered);
        setFilteredUnits([]);
        setFilteredTenants([]);

        setValidationErrors((prev) => ({ ...prev, city: '', property: '', unit: '', tenant: '' }));
    };

    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedPropertyId(propertyIdNum);
        setSelectedUnitId(null);
        setData('tenant_id', null);
        setData('other_tenants', '');

        const filtered = units.filter((unit) => unit.property_id === propertyIdNum);
        setFilteredUnits(filtered);
        setFilteredTenants([]);

        setValidationErrors((prev) => ({ ...prev, property: '', unit: '', tenant: '' }));
    };

    const handleUnitChange = (unitId: string) => {
        const unitIdNum = parseInt(unitId);
        setSelectedUnitId(unitIdNum);
        setData('tenant_id', null);
        setData('other_tenants', '');

        const filtered = tenants.filter((tenant) => tenant.unit_id === unitIdNum);
        setFilteredTenants(filtered);

        setValidationErrors((prev) => ({ ...prev, unit: '', tenant: '' }));
    };

    const handleTenantChange = (tenantId: string) => {
        const tenantIdNum = parseInt(tenantId);
        setData('tenant_id', tenantIdNum);

        setValidationErrors((prev) => ({ ...prev, tenant: '' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        let hasValidationErrors = false;
        const newErrors: { [key: string]: string } = {};

        if (!selectedCityId) {
            newErrors.city = 'Please select a city before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedPropertyId) {
            newErrors.property = 'Please select a property before submitting the form.';
            hasValidationErrors = true;
        }

        if (!selectedUnitId) {
            newErrors.unit = 'Please select a unit before submitting the form.';
            hasValidationErrors = true;
        }

        if (!data.tenant_id) {
            newErrors.tenant = 'Please select a tenant before submitting the form.';
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setValidationErrors(newErrors);
            return;
        }

        // Merge form data with pagination/filter parameters in request body
        const submitData = {
            ...data,
            ...queryParams,
            _method: 'post',
            images: newImages,
            delete_image_ids: deleteImageIds,
        };

        // POST form data with images (with method spoofing for PUT)
        router.post(`/notice_and_evictions/${record.id}`, submitData, {
            forceFormData: true,
            onSuccess: () => {
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        setData({
            tenant_id: record.tenant_id || null,
            status: record.status || '',
            date: formatDateForInput(record.date) || '',
            type_of_notice: record.type_of_notice || '',
            have_an_exception: record.have_an_exception || '',
            note: record.note || '',
            evictions: record.evictions || '',
            sent_to_atorney: record.sent_to_atorney || '',
            hearing_dates: formatDateForInput(record.hearing_dates) || '',
            evected_or_payment_plan: record.evected_or_payment_plan || '',
            if_left: record.if_left || '',
            writ_date: formatDateForInput(record.writ_date) || '',
            other_tenants: record.other_tenants || '',
        });
        setValidationErrors({});
        setNewImages([]);
        setDeleteImageIds([]);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Notice & Eviction (ID: ${record.id})`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CascadingSelectionSection
                                cities={cities}
                                filteredProperties={filteredProperties}
                                filteredUnits={filteredUnits}
                                filteredTenants={filteredTenants}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={selectedUnitId}
                                tenantId={data.tenant_id}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                onTenantChange={handleTenantChange}
                                validationErrors={validationErrors}
                                errors={errors}
                            />

                            <SelectionSummary
                                cities={cities}
                                filteredProperties={filteredProperties}
                                filteredUnits={filteredUnits}
                                filteredTenants={filteredTenants}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={selectedUnitId}
                                tenantId={data.tenant_id}
                            />

                            <OtherTenantsSection
                                value={data.other_tenants}
                                onChange={(value) => setData('other_tenants', value)}
                                error={errors.other_tenants}
                                tenants={filteredTenants}
                                disabled={!selectedUnitId}
                            />

                            <StatusSection value={data.status} onChange={(value) => setData('status', value)} error={errors.status} />

                            <DateSection value={data.date} onChange={(value) => setData('date', value)} error={errors.date} />

                            <NoticeTypeSection
                                value={data.type_of_notice}
                                onChange={(value) => setData('type_of_notice', value)}
                                notices={notices}
                                error={errors.type_of_notice}
                            />

                            <ExceptionSection
                                value={data.have_an_exception}
                                onChange={(value) => setData('have_an_exception', value)}
                                error={errors.have_an_exception}
                            />

                            <NoteSection value={data.note || ''} onChange={(value) => setData('note', value)} error={errors.note} />

                            <EvictionsSection
                                value={data.evictions || ''}
                                onChange={(value) => setData('evictions', value)}
                                error={errors.evictions}
                            />

                            <AttorneySection
                                value={data.sent_to_atorney}
                                onChange={(value) => setData('sent_to_atorney', value)}
                                error={errors.sent_to_atorney}
                            />

                            <HearingDatesSection
                                value={data.hearing_dates}
                                onChange={(value) => setData('hearing_dates', value)}
                                error={errors.hearing_dates}
                            />

                            <EvictionPaymentPlanSection
                                value={data.evected_or_payment_plan}
                                onChange={(value) => setData('evected_or_payment_plan', value)}
                                error={errors.evected_or_payment_plan}
                            />

                            <IfLeftSection value={data.if_left} onChange={(value) => setData('if_left', value)} error={errors.if_left} />

                            <WritDateSection value={data.writ_date} onChange={(value) => setData('writ_date', value)} error={errors.writ_date} />

                            <div className="border-t pt-4">
                                <ImagesSection
                                    existingImages={record.images ?? []}
                                    newFiles={newImages}
                                    onNewFiles={setNewImages}
                                    onDeleteExisting={(id) => setDeleteImageIds((prev) => [...prev, id])}
                                    deletedImageIds={deleteImageIds}
                                />
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating...' : 'Update Notice & Eviction'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
