import React from 'react';
import CityField from './CityField';
import PropertyField from './PropertyField';
import UnitField from './UnitField';
import DateField from './DateField';
import OwesField from './OwesField';
import PaidField from './PaidField';
import AssistanceField from './AssistanceField';
import { PaymentFlagsFields } from '../create/PaymentFlagsFields';
import PermanentField from './PermanentField';
import ReversedPaymentsField from './ReversedPaymentsField';
import NotesField from './NotesField';
import DebugInfo from './DebugInfo';
import { Payment } from '@/types/payments';


interface PaymentFormProps {
    data: any;
    setData: (data: any) => void;
    errors: any;
    cities: string[];
    selectedCity: string;
    selectedProperty: string;
    selectedUnit: string;
    getAvailableProperties: () => string[];
    getAvailableUnits: () => string[];
    handleCityChange: (city: string) => void;
    handlePropertyChange: (property: string) => void;
    handleUnitChange: (unit: string) => void;
    handleDateChange: (date: Date | undefined) => void;
    handleOwesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    calendarOpen: boolean;
    setCalendarOpen: (open: boolean) => void;
    cityRef: React.RefObject<HTMLButtonElement>;
    propertyRef: React.RefObject<HTMLButtonElement>;
    unitNameRef: React.RefObject<HTMLButtonElement>;
    dateRef: React.RefObject<HTMLButtonElement>;
    owesRef: React.RefObject<HTMLInputElement>;
    validationError: string;
    propertyValidationError: string;
    unitValidationError: string;
    dateValidationError: string;
    owesValidationError: string;
    payment: Payment;
    onSubmit: (e: React.FormEvent) => void;
}


export default function PaymentForm({
    data,
    setData,
    errors,
    cities,
    selectedCity,
    selectedProperty,
    selectedUnit,
    getAvailableProperties,
    getAvailableUnits,
    handleCityChange,
    handlePropertyChange,
    handleUnitChange,
    handleDateChange,
    handleOwesChange,
    calendarOpen,
    setCalendarOpen,
    cityRef,
    propertyRef,
    unitNameRef,
    dateRef,
    owesRef,
    validationError,
    propertyValidationError,
    unitValidationError,
    dateValidationError,
    owesValidationError,
    payment,
    onSubmit,
}: PaymentFormProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <CityField
                cities={cities}
                selectedCity={selectedCity}
                handleCityChange={handleCityChange}
                cityRef={cityRef}
                errors={errors}
                validationError={validationError}
            />

            <PropertyField
                selectedProperty={selectedProperty}
                selectedCity={selectedCity}
                getAvailableProperties={getAvailableProperties}
                handlePropertyChange={handlePropertyChange}
                propertyRef={propertyRef}
                propertyValidationError={propertyValidationError}
            />

            <UnitField
                selectedUnit={selectedUnit}
                selectedCity={selectedCity}
                getAvailableUnits={getAvailableUnits}
                handleUnitChange={handleUnitChange}
                unitNameRef={unitNameRef}
                unitValidationError={unitValidationError}
            />

            <DateField
                data={data}
                handleDateChange={handleDateChange}
                calendarOpen={calendarOpen}
                setCalendarOpen={setCalendarOpen}
                dateRef={dateRef}
                errors={errors}
                dateValidationError={dateValidationError}
            />

            <OwesField
                data={data}
                handleOwesChange={handleOwesChange}
                owesRef={owesRef}
                errors={errors}
                owesValidationError={owesValidationError}
            />

            <PaidField
                data={data}
                setData={setData}
                errors={errors}
            />

            <AssistanceField
                data={data}
                setData={setData}
                errors={errors}
            />

            <PaymentFlagsFields
                remind={data.remind}
                addedToLedger={data.added_to_ledger}
                onRemindChange={(value) => setData((prev: any) => ({ ...prev, remind: value }))}
                onAddedToLedgerChange={(value) => setData((prev: any) => ({ ...prev, added_to_ledger: value }))}
            />

            <PermanentField
                data={data}
                setData={setData}
                errors={errors}
            />

            <ReversedPaymentsField
                data={data}
                setData={setData}
                errors={errors}
            />

            <NotesField
                data={data}
                setData={setData}
                errors={errors}
            />

            <DebugInfo
                payment={payment}
                data={data}
                selectedCity={selectedCity}
                selectedProperty={selectedProperty}
                selectedUnit={selectedUnit}
            />
        </form>
    );
}
