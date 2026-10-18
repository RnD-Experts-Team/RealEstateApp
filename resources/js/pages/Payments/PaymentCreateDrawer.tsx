import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { DateField } from './create/DateField';
import { CityField } from './create/CityField';
import { PropertyField } from './create/PropertyField';
import { UnitField } from './create/UnitField';
import { FinancialFields } from './create/FinancialFields';
import { AssistanceFields } from './create/AssistanceFields';
import { PaymentFlagsFields } from './create/PaymentFlagsFields';
import { PermanentField } from './create/PermanentField';
import { ReversedPaymentsField } from './create/ReversedPaymentsField';
import { NotesField } from './create/NotesField';
import { DebugInfo } from './create/DebugInfo';


interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}


interface Props {
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    filtersContext?: {
        city?: string;
        property?: string;
        unit?: string;
        permanent?: string[];
        is_hidden?: boolean;
        remind?: boolean | null;
        added_to_ledger?: boolean | null;
        per_page?: string;
        page?: number;
    };
}


export default function PaymentCreateDrawer({ 
    units, 
    cities, 
    unitsByCity, 
    propertiesByCity,
    open, 
    onOpenChange, 
    onSuccess,
    filtersContext
}: Props) {
    const [validationError, setValidationError] = useState<string>('');
    const [propertyValidationError, setPropertyValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [owesValidationError, setOwesValidationError] = useState<string>('');

    const [calendarOpen, setCalendarOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedProperty, setSelectedProperty] = useState<string>('');
    const [selectedUnit, setSelectedUnit] = useState<string>('');

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        date: '',
        unit_id: '',
        owes: '',
        paid: '',
        status: '',
        notes: '',
        reversed_payments: '',
        permanent: 'No',
        has_assistance: false as boolean,
        assistance_amount: '',
        assistance_company: '',
        remind: false as boolean,
        added_to_ledger: false as boolean,
    });

    const getAvailableProperties = (): string[] => {
        if (!selectedCity) return [];
        return propertiesByCity[selectedCity] || [];
    };

    const getAvailableUnits = (): string[] => {
        if (!selectedCity) return [];
        if (!selectedProperty) {
            return unitsByCity[selectedCity] || [];
        }
        
        return units
            .filter(unit => unit.city === selectedCity && unit.property_name === selectedProperty)
            .map(unit => unit.unit_name);
    };

    const findUnitId = (cityName: string, propertyName: string, unitName: string): number | null => {
        const unit = units.find(u => 
            u.city === cityName && 
            u.property_name === propertyName && 
            u.unit_name === unitName
        );
        return unit ? unit.id : null;
    };

    useEffect(() => {
        if (selectedCity && selectedProperty) {
            const availableProperties = getAvailableProperties();
            if (!availableProperties.includes(selectedProperty)) {
                setSelectedProperty('');
                setSelectedUnit('');
                setData('unit_id', '');
            }
        }
    }, [selectedCity]);

    useEffect(() => {
        if (selectedProperty && selectedUnit) {
            const availableUnits = getAvailableUnits();
            if (!availableUnits.includes(selectedUnit)) {
                setSelectedUnit('');
                setData('unit_id', '');
            }
        }
    }, [selectedCity, selectedProperty]);

    const handleCityChange = (city: string) => {
        setSelectedCity(city);
        setSelectedProperty('');
        setSelectedUnit('');
        setData('unit_id', '');
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
    };

    const handlePropertyChange = (propertyName: string) => {
        setSelectedProperty(propertyName);
        setSelectedUnit('');
        setData('unit_id', '');
        setPropertyValidationError('');
        setUnitValidationError('');
    };

    const handleUnitChange = (unitName: string) => {
        setSelectedUnit(unitName);
        setUnitValidationError('');
        
        if (selectedCity && selectedProperty && unitName) {
            const unitId = findUnitId(selectedCity, selectedProperty, unitName);
            if (unitId) {
                setData('unit_id', unitId.toString());
            }
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');

        let hasValidationErrors = false;

        if (!data.date || data.date.trim() === '') {
            setDateValidationError('Please select a date before submitting the form.');
            hasValidationErrors = true;
        }

        if (!selectedCity || selectedCity.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            hasValidationErrors = true;
        }

        if (!selectedProperty || selectedProperty.trim() === '') {
            setPropertyValidationError('Please select a property before submitting the form.');
            hasValidationErrors = true;
        }

        if (!selectedUnit || selectedUnit.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            hasValidationErrors = true;
        }

        if (!data.owes || data.owes.trim() === '') {
            setOwesValidationError('Please enter the amount owed before submitting the form.');
            hasValidationErrors = true;
        }

        if (!data.unit_id || data.unit_id.trim() === '') {
            setUnitValidationError('Unable to identify the selected unit. Please try selecting again.');
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            return;
        }

        // Namespace filter context to avoid colliding with form field names
        const params: any = {};
        if (filtersContext?.city) params.filter_city = filtersContext.city;
        if (filtersContext?.property) params.filter_property = filtersContext.property;
        if (filtersContext?.unit) params.filter_unit = filtersContext.unit;
        if (filtersContext?.permanent && filtersContext.permanent.length > 0) {
            params.filter_permanent = filtersContext.permanent.join(',');
        }
        if (filtersContext?.is_hidden) params.filter_is_hidden = 'true';
        if (typeof filtersContext?.remind === 'boolean') params.filter_remind = String(filtersContext.remind);
        if (typeof filtersContext?.added_to_ledger === 'boolean') {
            params.filter_added_to_ledger = String(filtersContext.added_to_ledger);
        }
        if (filtersContext?.per_page) params.filter_per_page = filtersContext.per_page;
        if (filtersContext?.page) params.filter_page = filtersContext.page;

        transform((formData) => ({ ...formData, ...params }));
        post(route('payments.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setSelectedCity('');
                setSelectedProperty('');
                setSelectedUnit('');
                setValidationError('');
                setPropertyValidationError('');
                setUnitValidationError('');
                setDateValidationError('');
                setOwesValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
            }
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCity('');
        setSelectedProperty('');
        setSelectedUnit('');
        setValidationError('');
        setPropertyValidationError('');
        setUnitValidationError('');
        setDateValidationError('');
        setOwesValidationError('');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Payment">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityField
                                cities={cities}
                                selectedCity={selectedCity}
                                onCityChange={handleCityChange}
                                validationError={validationError}
                                unitIdError={errors.unit_id}
                            />

                            <PropertyField
                                selectedProperty={selectedProperty}
                                availableProperties={getAvailableProperties()}
                                onPropertyChange={handlePropertyChange}
                                disabled={!selectedCity}
                                validationError={propertyValidationError}
                            />

                            <UnitField
                                selectedUnit={selectedUnit}
                                availableUnits={getAvailableUnits()}
                                onUnitChange={handleUnitChange}
                                disabled={!selectedCity}
                                validationError={unitValidationError}
                            />

                            <DateField
                                date={data.date}
                                onDateChange={(date) => {
                                    setData('date', date);
                                    setDateValidationError('');
                                }}
                                calendarOpen={calendarOpen}
                                onCalendarOpenChange={setCalendarOpen}
                                validationError={dateValidationError}
                                dateError={errors.date}
                            />

                            <FinancialFields
                                owes={data.owes}
                                paid={data.paid}
                                onOwesChange={(value) => {
                                    setData('owes', value);
                                    setOwesValidationError('');
                                }}
                                onPaidChange={(value) => setData('paid', value)}
                                owesError={errors.owes}
                                paidError={errors.paid}
                                owesValidationError={owesValidationError}
                            />

                            <AssistanceFields
                                hasAssistance={data.has_assistance}
                                assistanceAmount={data.assistance_amount}
                                assistanceCompany={data.assistance_company}
                                onHasAssistanceChange={(value) => setData('has_assistance', value)}
                                onAssistanceAmountChange={(value) => setData('assistance_amount', value)}
                                onAssistanceCompanyChange={(value) => setData('assistance_company', value)}
                                assistanceAmountError={errors.assistance_amount}
                                assistanceCompanyError={errors.assistance_company}
                            />

                            <PaymentFlagsFields
                                remind={data.remind}
                                addedToLedger={data.added_to_ledger}
                                onRemindChange={(value) => setData('remind', value)}
                                onAddedToLedgerChange={(value) => setData('added_to_ledger', value)}
                            />

                            <PermanentField
                                permanent={data.permanent}
                                onPermanentChange={(value) => setData('permanent', value as 'Yes' | 'No')}
                                error={errors.permanent}
                            />

                            <ReversedPaymentsField
                                reversedPayments={data.reversed_payments}
                                onReversedPaymentsChange={(value) => setData('reversed_payments', value)}
                                error={errors.reversed_payments}
                            />

                            <NotesField
                                notes={data.notes}
                                onNotesChange={(value) => setData('notes', value)}
                                error={errors.notes}
                            />

                            <DebugInfo
                                unitId={data.unit_id}
                                selectedCity={selectedCity}
                                selectedProperty={selectedProperty}
                                selectedUnit={selectedUnit}
                            />
                        </form>
                    </div>

                    <DrawerFooter className="border-t bg-muted/50 p-4">
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} disabled={processing}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                onClick={submit}
                                disabled={processing}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {processing ? 'Creating...' : 'Create Payment'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
