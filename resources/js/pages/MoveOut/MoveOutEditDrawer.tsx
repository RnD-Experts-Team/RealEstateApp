import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { MoveOut, MoveOutFormData } from '@/types/move-out';
import { City } from '@/types/City';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import { LocationSelectionFields } from './edit/LocationSelectionFields';
import { MoveOutDateFields } from './edit/MoveOutDateFields';
import { MoveOutDetailsFields } from './edit/MoveOutDetailsFields';
import { MoveOutStatusFields } from './edit/MoveOutStatusFields';

interface Props {
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    moveOut: MoveOut;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    redirectContext?: {
        city?: string | null;
        property?: string | null;
        unit?: string | null;
        page?: string | number | null;
        perPage?: string | null;
    };
}

export default function MoveOutEditDrawer({ 
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    allUnits,
    moveOut,
    open, 
    onOpenChange, 
    onSuccess,
    redirectContext
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null!);
    const propertyRef = useRef<HTMLButtonElement>(null!);
    const unitRef = useRef<HTMLButtonElement>(null!);
    
    const [validationErrors, setValidationErrors] = useState({
        city: '',
        property: '',
        unit: ''
    });
    
    const [selectedCity, setSelectedCity] = useState<number | null>(null);
    const [selectedProperty, setSelectedProperty] = useState<number | null>(null);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
    
    const [availableProperties, setAvailableProperties] = useState<PropertyInfoWithoutInsurance[]>([]);
    const [availableUnits, setAvailableUnits] = useState<Array<{ id: number; unit_name: string }>>([]);

    const { data, setData, put, processing, errors, transform } = useForm<MoveOutFormData>({
        unit_id: moveOut.unit_id || null,
        tenants: moveOut.tenants || '',
        move_out_date: moveOut.move_out_date || '',
        lease_status: moveOut.lease_status || '',
        date_lease_ending_on_buildium: moveOut.date_lease_ending_on_buildium || '',
        keys_location: moveOut.keys_location || '',
        utilities_under_our_name: moveOut.utilities_under_our_name || '',
        date_utility_put_under_our_name: moveOut.date_utility_put_under_our_name || '',
        walkthrough: moveOut.walkthrough || '',
        all_the_devices_are_off: moveOut.all_the_devices_are_off || '',
        repairs: moveOut.repairs || '',
        send_back_security_deposit: moveOut.send_back_security_deposit || '',
        notes: moveOut.notes || '',
        cleaning: moveOut.cleaning || '',
        list_the_unit: moveOut.list_the_unit || '',
        renter: moveOut.renter || '',
        move_out_form: moveOut.move_out_form || '',
        got_pics: moveOut.got_pics || false,
        utility_type: moveOut.utility_type || '',
    });

    useEffect(() => {
        if (moveOut && allUnits && Array.isArray(allUnits) && Array.isArray(cities) && Array.isArray(properties)) {
            const unitInfo = allUnits.find(unit => unit.unit_name === moveOut.unit_name);
            
            if (unitInfo) {
                const selectedCityObj = cities.find(c => c.city === moveOut.city_name);
                const selectedPropertyObj = properties.find(p => p.property_name === moveOut.property_name);
                
                if (selectedCityObj) {
                    setSelectedCity(selectedCityObj.id);
                    if (propertiesByCityId && propertiesByCityId[selectedCityObj.id]) {
                        setAvailableProperties(propertiesByCityId[selectedCityObj.id]);
                    }
                }
                
                if (selectedPropertyObj) {
                    setSelectedProperty(selectedPropertyObj.id);
                    if (unitsByPropertyId && unitsByPropertyId[selectedPropertyObj.id]) {
                        setAvailableUnits(unitsByPropertyId[selectedPropertyObj.id]);
                    }
                }
                
                setSelectedUnit(unitInfo.id);
                setData('unit_id', unitInfo.id);
            }
        }
    }, [moveOut, allUnits, cities, properties, propertiesByCityId, unitsByPropertyId]);

    const handleCityChange = (cityId: string) => {
        const cityIdNum = parseInt(cityId);
        setSelectedCity(cityIdNum);
        setSelectedProperty(null);
        setSelectedUnit(null);
        setData('unit_id', null);
        
        setValidationErrors(prev => ({ ...prev, city: '', property: '', unit: '' }));

        if (cityIdNum && propertiesByCityId[cityIdNum]) {
            setAvailableProperties(propertiesByCityId[cityIdNum]);
        } else {
            setAvailableProperties([]);
        }
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyId: string) => {
        const propertyIdNum = parseInt(propertyId);
        setSelectedProperty(propertyIdNum);
        setSelectedUnit(null);
        setData('unit_id', null);
        
        setValidationErrors(prev => ({ ...prev, property: '', unit: '' }));

        if (propertyIdNum && unitsByPropertyId[propertyIdNum]) {
            setAvailableUnits(unitsByPropertyId[propertyIdNum]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        const unitIdNum = parseInt(unitId);
        setSelectedUnit(unitIdNum);
        setData('unit_id', unitIdNum);
        
        setValidationErrors(prev => ({ ...prev, unit: '' }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setValidationErrors({
            city: '',
            property: '',
            unit: ''
        });
        
        let hasValidationErrors = false;
        
        if (!selectedCity) {
            setValidationErrors(prev => ({ ...prev, city: 'Please select a city before submitting the form.' }));
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!selectedProperty) {
            setValidationErrors(prev => ({ ...prev, property: 'Please select a property before submitting the form.' }));
            if (propertyRef.current) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!selectedUnit || !data.unit_id) {
            setValidationErrors(prev => ({ ...prev, unit: 'Please select a unit before submitting the form.' }));
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }

        transform((form) => ({
            ...form,
            move_out_date: form.move_out_date?.trim() ? form.move_out_date : null,
            date_lease_ending_on_buildium: form.date_lease_ending_on_buildium?.trim() ? form.date_lease_ending_on_buildium : null,
            date_utility_put_under_our_name: form.date_utility_put_under_our_name?.trim() ? form.date_utility_put_under_our_name : null,
            redirect_city: redirectContext?.city ?? null,
            redirect_property: redirectContext?.property ?? null,
            redirect_unit: redirectContext?.unit ?? null,
            redirect_page: redirectContext?.page ?? null,
            redirect_perPage: redirectContext?.perPage ?? null,
        }));

        put(route('move-out.update', moveOut.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                handleCancel();
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        setData({
            unit_id: moveOut.unit_id || null,
            tenants: moveOut.tenants || '',
            move_out_date: moveOut.move_out_date || '',
            lease_status: moveOut.lease_status || '',
            date_lease_ending_on_buildium: moveOut.date_lease_ending_on_buildium || '',
            keys_location: moveOut.keys_location || '',
            utilities_under_our_name: moveOut.utilities_under_our_name || '',
            date_utility_put_under_our_name: moveOut.date_utility_put_under_our_name || '',
            walkthrough: moveOut.walkthrough || '',
            all_the_devices_are_off: moveOut.all_the_devices_are_off || '',
            repairs: moveOut.repairs || '',
            send_back_security_deposit: moveOut.send_back_security_deposit || '',
            notes: moveOut.notes || '',
            cleaning: moveOut.cleaning || '',
            list_the_unit: moveOut.list_the_unit || '',
            renter: moveOut.renter || '',
            move_out_form: moveOut.move_out_form || '',
            got_pics: moveOut.got_pics || false,
            utility_type: moveOut.utility_type || '',
        });
        
        setValidationErrors({
            city: '',
            property: '',
            unit: ''
        });
        
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Edit Move-Out Record">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <LocationSelectionFields
                                cities={cities}
                                availableProperties={availableProperties}
                                availableUnits={availableUnits}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                                validationErrors={validationErrors}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                tenants={data.tenants}
                                tenantsError={errors.tenants}
                                onTenantsChange={(value) => setData('tenants', value)}
                            />

                            <MoveOutDateFields
                                data={data}
                                errors={errors}
                                onDataChange={setData}
                            />

                            <MoveOutDetailsFields
                                data={data}
                                errors={errors}
                                onDataChange={setData}
                            />

                            <MoveOutStatusFields
                                data={data}
                                errors={errors}
                                onDataChange={setData}
                            />
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="flex-1"
                            >
                                {processing ? 'Updating...' : 'Update Move-Out Record'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
