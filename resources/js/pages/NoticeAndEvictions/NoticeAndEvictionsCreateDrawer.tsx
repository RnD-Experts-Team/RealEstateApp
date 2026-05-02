import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { City, Notice, PropertyInfoWithoutInsurance, Tenant } from '@/types/NoticeAndEviction';
import { useForm, router } from '@inertiajs/react';
import React, { useState } from 'react';
import CascadingSelectionFields from './create/CascadingSelectionFields';
import SelectionSummary from './create/SelectionSummary';
import NoticeFormFields from './create/NoticeFormFields';
import ImagesField from './create/ImagesField';

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

export default function NoticeAndEvictionsCreateDrawer({
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

    const [images, setImages] = useState<File[]>([]);

    const { data, setData, processing, errors, reset } = useForm({
        tenant_id: null as number | null,
        status: '',
        date: '',
        type_of_notice: '',
        have_an_exception: '',
        note: '',
        evictions: '',
        sent_to_atorney: '',
        hearing_dates: '',
        evected_or_payment_plan: '',
        if_left: '',
        writ_date: '',
        other_tenants: '',
    });

    const handleCascadingChange = {
        city: (cityId: string) => {
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
        },
        property: (propertyId: string) => {
            const propertyIdNum = parseInt(propertyId);
            setSelectedPropertyId(propertyIdNum);
            setSelectedUnitId(null);
            setData('tenant_id', null);
            setData('other_tenants', '');

            const filtered = units.filter((unit) => unit.property_id === propertyIdNum);
            setFilteredUnits(filtered);
            setFilteredTenants([]);

            setValidationErrors((prev) => ({ ...prev, property: '', unit: '', tenant: '' }));
        },
        unit: (unitId: string) => {
            const unitIdNum = parseInt(unitId);
            setSelectedUnitId(unitIdNum);
            setData('tenant_id', null);
            setData('other_tenants', '');

            const filtered = tenants.filter((tenant) => tenant.unit_id === unitIdNum);
            setFilteredTenants(filtered);

            setValidationErrors((prev) => ({ ...prev, unit: '', tenant: '' }));
        },
        tenant: (tenantId: string) => {
            const tenantIdNum = parseInt(tenantId);
            setData('tenant_id', tenantIdNum);
            setValidationErrors((prev) => ({ ...prev, tenant: '' }));
        },
    };

    const resetForm = () => {
        reset();
        setSelectedCityId(null);
        setSelectedPropertyId(null);
        setSelectedUnitId(null);
        setFilteredProperties([]);
        setFilteredUnits([]);
        setFilteredTenants([]);
        setValidationErrors({});
        setImages([]);
    };

    /**
     * Build query string from pagination and filter params
     */
    const buildQueryString = (): string => {
        const params = new URLSearchParams();
        
        Object.entries(queryParams).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                params.append(key, String(value));
            }
        });
        
        return params.toString() ? `?${params.toString()}` : '';
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

        // Build the URL with query parameters
        const queryString = buildQueryString();
        const url = `/notice_and_evictions${queryString}`;

        // POST form data to URL with query parameters
        router.post(url, {
            ...data,
            images,
        }, {
            forceFormData: true,
            onSuccess: () => {
                resetForm();
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.log('Form submission errors:', errors);
            },
        });
    };

    const handleCancel = () => {
        resetForm();
        onOpenChange(false);
    };

    const getSelectedNames = () => {
        const city = cities.find((c) => c.id === selectedCityId);
        const property = filteredProperties.find((p) => p.id === selectedPropertyId);
        const unit = filteredUnits.find((u) => u.id === selectedUnitId);
        const tenant = filteredTenants.find((t) => t.id === data.tenant_id);

        return {
            cityName: city?.city || '',
            propertyName: property?.property_name || '',
            unitName: unit?.unit_name || '',
            tenantName: tenant ? `${tenant.first_name} ${tenant.last_name}` : '',
        };
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Notice & Eviction">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CascadingSelectionFields
                                cities={cities}
                                filteredProperties={filteredProperties}
                                filteredUnits={filteredUnits}
                                filteredTenants={filteredTenants}
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={selectedUnitId}
                                selectedTenantId={data.tenant_id}
                                onCityChange={handleCascadingChange.city}
                                onPropertyChange={handleCascadingChange.property}
                                onUnitChange={handleCascadingChange.unit}
                                onTenantChange={handleCascadingChange.tenant}
                                validationErrors={validationErrors}
                                errors={errors}
                            />

                            <SelectionSummary
                                selectedCityId={selectedCityId}
                                selectedPropertyId={selectedPropertyId}
                                selectedUnitId={selectedUnitId}
                                selectedTenantId={data.tenant_id}
                                selectedNames={getSelectedNames()}
                            />

                            <NoticeFormFields
                                data={data}
                                setData={setData}
                                errors={errors}
                                notices={notices}
                                filteredTenants={filteredTenants}
                                selectedUnitId={selectedUnitId}
                                otherTenantsValue={data.other_tenants}
                                onOtherTenantsChange={(value) => setData('other_tenants', value)}
                            />

                            <div className="border-t pt-4">
                                <ImagesField files={images} onChange={setImages} />
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Creating...' : 'Create Notice & Eviction'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
