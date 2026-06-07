import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { VendorTaskTracker, VendorTaskTrackerFormData } from '@/types/vendor-task-tracker';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef, useEffect } from 'react';
import CitySelector from './edit/CitySelector';
import PropertySelector from './edit/PropertySelector';
import UnitSelector from './edit/UnitSelector';
import VendorSelector from './edit/VendorSelector';
import DatePickerField from './edit/DatePickerField';
import TextAreaField from './edit/TextAreaField';
import StatusRadioGroup from './edit/StatusRadioGroup';
import UrgencyRadioGroup from './edit/UrgencyRadioGroup';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
}

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface Props {
    task: VendorTaskTracker;
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
        per_page?: string;
        page?: number;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorTaskTrackerEditDrawer({ 
    task,
    cities,
    vendors,
    unitsByCity, 
    propertiesByCity,
    unitsByProperty,
    filters,
    open, 
    onOpenChange, 
    onSuccess 
}: Props) {
    const cityRef = useRef<HTMLButtonElement>(null!);
    const unitRef = useRef<HTMLButtonElement>(null!);
    const vendorRef = useRef<HTMLButtonElement>(null!);
    const taskSubmissionDateRef = useRef<HTMLButtonElement>(null!);
    const assignedTasksRef = useRef<HTMLTextAreaElement>(null!);
    
    const [validationError, setValidationError] = useState<string>('');
    const [unitValidationError, setUnitValidationError] = useState<string>('');
    const [vendorValidationError, setVendorValidationError] = useState<string>('');
    const [taskSubmissionDateValidationError, setTaskSubmissionDateValidationError] = useState<string>('');
    const [assignedTasksValidationError, setAssignedTasksValidationError] = useState<string>('');
    const [availableUnits, setAvailableUnits] = useState<UnitOption[]>([]);
    const [availableProperties, setAvailableProperties] = useState<PropertyOption[]>([]);
    const [availableVendors, setAvailableVendors] = useState<VendorOption[]>([]);
    
    // Helper state to track selected names for UI display
    const [selectedCity, setSelectedCity] = useState<string>(task.city || '');
    const [selectedProperty, setSelectedProperty] = useState<string>(task.property_name || '');
    const [, setSelectedUnit] = useState<string>(task.unit_name || '');
    const [, setSelectedVendor] = useState<string>(task.vendor_name || '');

    const [calendarStates, setCalendarStates] = useState({
        task_submission_date: false,
        any_scheduled_visits: false,
        task_ending_date: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, put, processing, errors, transform } = useForm<VendorTaskTrackerFormData>({
        vendor_id: task.vendor_id?.toString() || '',
        unit_id: task.unit_id?.toString() || '',
        task_submission_date: task.task_submission_date ?? '',
        assigned_tasks: task.assigned_tasks ?? '',
        any_scheduled_visits: task.any_scheduled_visits ?? '',
        notes: task.notes ?? '',
        task_ending_date: task.task_ending_date ?? '',
        status: task.status ?? '',
        urgent: task.urgent ?? 'No',
    });

    // Keep form and selection state in sync when a different task record is loaded
    useEffect(() => {
        setData({
            vendor_id: task.vendor_id?.toString() || '',
            unit_id: task.unit_id?.toString() || '',
            task_submission_date: task.task_submission_date ?? '',
            assigned_tasks: task.assigned_tasks ?? '',
            any_scheduled_visits: task.any_scheduled_visits ?? '',
            notes: task.notes ?? '',
            task_ending_date: task.task_ending_date ?? '',
            status: task.status ?? '',
            urgent: task.urgent ?? 'No',
        });

        setSelectedCity(task.city || '');
        setSelectedProperty(task.property_name || '');
        setSelectedUnit(task.unit_name || '');
        setSelectedVendor(task.vendor_name || '');
    }, [task]);

    // Initialize available options when component mounts or task changes
    useEffect(() => {
        if (task.city) {
            // Set available properties for the selected city
            if (propertiesByCity[task.city]) {
                setAvailableProperties(propertiesByCity[task.city]);
            } else {
                setAvailableProperties([]);
            }

            // Set all vendors available regardless of city
            setAvailableVendors(vendors);

            // Set available units based on city and property_name
            if (task.property_name && unitsByProperty[task.city] && unitsByProperty[task.city][task.property_name]) {
                setAvailableUnits(unitsByProperty[task.city][task.property_name]);
            } else if (unitsByCity[task.city]) {
                // Fallback to old behavior if property_name is not set
                setAvailableUnits(unitsByCity[task.city]);
            } else {
                setAvailableUnits([]);
            }
        } else {
            setAvailableProperties([]);
            setAvailableVendors([]);
            setAvailableUnits([]);
        }
    }, [task.city, task.property_name, unitsByCity, propertiesByCity, unitsByProperty, vendors]);

    const handleCityChange = (cityName: string) => {
        setSelectedCity(cityName);
        setSelectedProperty('');
        setSelectedUnit('');
        setSelectedVendor('');
        setData('unit_id', '');
        setData('vendor_id', '');
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');

        if (cityName) {
            // Set available properties for the selected city
            if (propertiesByCity[cityName]) {
                setAvailableProperties(propertiesByCity[cityName]);
            } else {
                setAvailableProperties([]);
            }

            // Set all vendors available regardless of city
            setAvailableVendors(vendors);
        } else {
            setAvailableProperties([]);
            setAvailableVendors([]);
        }

        // Clear units since property is reset
        setAvailableUnits([]);
    };

    const handlePropertyChange = (propertyName: string) => {
        setSelectedProperty(propertyName);
        setSelectedUnit('');
        setData('unit_id', '');
        setUnitValidationError('');

        if (selectedCity && propertyName && unitsByProperty[selectedCity] && unitsByProperty[selectedCity][propertyName]) {
            setAvailableUnits(unitsByProperty[selectedCity][propertyName]);
        } else {
            setAvailableUnits([]);
        }
    };

    const handleUnitChange = (unitId: string) => {
        const selectedUnitOption = availableUnits.find(unit => unit.id.toString() === unitId);
        if (selectedUnitOption) {
            setSelectedUnit(selectedUnitOption.unit_name);
            setData('unit_id', unitId);
            setUnitValidationError('');
        }
    };

    const handleVendorChange = (vendorId: string) => {
        const selectedVendorOption = availableVendors.find(vendor => vendor.id.toString() === vendorId);
        if (selectedVendorOption) {
            setSelectedVendor(selectedVendorOption.vendor_name);
            setData('vendor_id', vendorId);
            setVendorValidationError('');
        }
    };

    const handleAssignedTasksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setData('assigned_tasks', e.target.value);
        setAssignedTasksValidationError('');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear any previous validation errors
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        
        let hasValidationErrors = false;
        
        // Validate city is not empty
        if (!selectedCity || selectedCity.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate unit_id is not empty
        if (!data.unit_id || data.unit_id.trim() === '') {
            setUnitValidationError('Please select a unit before submitting the form.');
            if (unitRef.current) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate vendor_id is not empty
        if (!data.vendor_id || data.vendor_id.trim() === '') {
            setVendorValidationError('Please select a vendor before submitting the form.');
            if (vendorRef.current) {
                vendorRef.current.focus();
                vendorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate task_submission_date is not empty
        if (!data.task_submission_date || data.task_submission_date.trim() === '') {
            setTaskSubmissionDateValidationError('Please select a task submission date before submitting the form.');
            if (taskSubmissionDateRef.current) {
                taskSubmissionDateRef.current.focus();
                taskSubmissionDateRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        // Validate assigned_tasks is not empty
        if (!data.assigned_tasks || data.assigned_tasks.trim() === '') {
            setAssignedTasksValidationError('Please enter assigned tasks before submitting the form.');
            if (assignedTasksRef.current) {
                assignedTasksRef.current.focus();
                assignedTasksRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        transform((current) => ({
            ...current,
            redirect_filters: {
                ...filters,
            },
        }));

        put(route('vendor-task-tracker.update', task.id), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setValidationError('');
                setUnitValidationError('');
                setVendorValidationError('');
                setTaskSubmissionDateValidationError('');
                setAssignedTasksValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        // Reset form to original task data
        setData({
            vendor_id: task.vendor_id?.toString() || '',
            unit_id: task.unit_id?.toString() || '',
            task_submission_date: task.task_submission_date ?? '',
            assigned_tasks: task.assigned_tasks ?? '',
            any_scheduled_visits: task.any_scheduled_visits ?? '',
            notes: task.notes ?? '',
            task_ending_date: task.task_ending_date ?? '',
            status: task.status ?? '',
            urgent: task.urgent ?? 'No',
        });
        
        // Reset display state
        setSelectedCity(task.city || '');
        setSelectedProperty(task.property_name || '');
        setSelectedUnit(task.unit_name || '');
        setSelectedVendor(task.vendor_name || '');
        
        setValidationError('');
        setUnitValidationError('');
        setVendorValidationError('');
        setTaskSubmissionDateValidationError('');
        setAssignedTasksValidationError('');
        
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={`Edit Vendor Task #${task.id}`}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CitySelector
                                cities={cities}
                                selectedCity={selectedCity}
                                onCityChange={handleCityChange}
                                cityRef={cityRef}
                                error={errors.city}
                                validationError={validationError}
                            />

                            <PropertySelector
                                properties={availableProperties}
                                selectedProperty={selectedProperty}
                                onPropertyChange={handlePropertyChange}
                                disabled={!selectedCity}
                            />

                            <UnitSelector
                                units={availableUnits}
                                selectedUnitId={data.unit_id}
                                onUnitChange={handleUnitChange}
                                unitRef={unitRef}
                                disabled={!selectedProperty}
                                error={errors.unit_id}
                                validationError={unitValidationError}
                            />

                            <VendorSelector
                                vendors={availableVendors}
                                selectedVendorId={data.vendor_id}
                                onVendorChange={handleVendorChange}
                                vendorRef={vendorRef}
                                disabled={!selectedCity}
                                error={errors.vendor_id}
                                validationError={vendorValidationError}
                            />

                            <DatePickerField
                                label="Task Submission Date"
                                required
                                borderColor="border-l-orange-500"
                                value={data.task_submission_date}
                                onChange={(date) => {
                                    setData('task_submission_date', date);
                                    setTaskSubmissionDateValidationError('');
                                }}
                                dateRef={taskSubmissionDateRef}
                                error={errors.task_submission_date}
                                validationError={taskSubmissionDateValidationError}
                                calendarOpen={calendarStates.task_submission_date}
                                onCalendarOpenChange={(open) => setCalendarOpen('task_submission_date', open)}
                            />

                            <DatePickerField
                                label="Any Scheduled Visits"
                                borderColor="border-l-emerald-500"
                                value={data.any_scheduled_visits}
                                onChange={(date) => setData('any_scheduled_visits', date)}
                                error={errors.any_scheduled_visits}
                                calendarOpen={calendarStates.any_scheduled_visits}
                                onCalendarOpenChange={(open) => setCalendarOpen('any_scheduled_visits', open)}
                                allowClear
                            />

                            <DatePickerField
                                label="Task Ending Date"
                                borderColor="border-l-teal-500"
                                value={data.task_ending_date}
                                onChange={(date) => setData('task_ending_date', date)}
                                error={errors.task_ending_date}
                                calendarOpen={calendarStates.task_ending_date}
                                onCalendarOpenChange={(open) => setCalendarOpen('task_ending_date', open)}
                                allowClear
                            />

                            <TextAreaField
                                label="Assigned Tasks"
                                required
                                borderColor="border-l-indigo-500"
                                value={data.assigned_tasks}
                                onChange={handleAssignedTasksChange}
                                textAreaRef={assignedTasksRef}
                                placeholder="Describe the assigned tasks..."
                                rows={3}
                                error={errors.assigned_tasks}
                                validationError={assignedTasksValidationError}
                            />

                            <TextAreaField
                                label="Notes"
                                borderColor="border-l-pink-500"
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Enter any additional notes..."
                                rows={3}
                                error={errors.notes}
                            />

                            <StatusRadioGroup
                                value={data.status}
                                onChange={(value) => setData('status', value)}
                                error={errors.status}
                            />

                            <UrgencyRadioGroup
                                value={data.urgent}
                                onChange={(value) => setData('urgent', value)}
                                error={errors.urgent}
                            />
                        </form>
                    </div>

                    {/* Action Buttons */}
                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing} className="flex-1">
                                {processing ? 'Updating…' : 'Update Task'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
