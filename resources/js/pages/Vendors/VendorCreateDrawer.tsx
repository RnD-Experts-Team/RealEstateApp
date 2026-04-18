import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import CityField from './create/CityField';
import VendorNameField from './create/VendorNameField';
import PhoneNumberField from './create/PhoneNumberField';
import EmailField from './create/EmailField';
import ServiceTypeField from './create/ServiceTypeField';

interface Props {
    cities: Array<{ id: number; city: string }>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export default function VendorCreateDrawer({ cities, open, onOpenChange, onSuccess }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const vendorNameRef = useRef<HTMLInputElement>(null);
    const [validationError, setValidationError] = useState<string>('');
    const [vendorNameValidationError, setVendorNameValidationError] = useState<string>('');
    const [, setSelectedCityName] = useState<string>('');

    const { data, setData, post, processing, errors, reset, transform } = useForm({
        city_id: '',
        vendor_name: '',
        vendor_type: 'main',
        number: [] as string[],
        email: [] as string[],
        service_type: [] as string[]
    });

    // Helper function to get array field errors
    const getArrayFieldErrors = (fieldName: string): string | undefined => {
        // Check if parent field has error
        if (errors[fieldName as keyof typeof errors]) {
            return errors[fieldName as keyof typeof errors];
        }
        
        // Check for element-level errors (e.g., "number.0", "number.1")
        const elementError = Object.keys(errors).find(key => 
            key.startsWith(`${fieldName}.`)
        );
        
        if (elementError) {
            return errors[elementError as keyof typeof errors];
        }
        
        return undefined;
    };

    const handleCityChange = (cityId: string) => {
        setData('city_id', cityId);
        
        const selectedCity = cities.find(city => city.id.toString() === cityId);
        setSelectedCityName(selectedCity ? selectedCity.city : '');
        
        setValidationError('');
    };

    const handleVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData('vendor_name', e.target.value);
        setVendorNameValidationError('');
    };

    const handlePhoneNumberChange = (phoneNumbers: string[]) => {
        setData('number', phoneNumbers);
    };

    const handleEmailChange = (emails: string[]) => {
        setData('email', emails);
    };

    const handleServiceTypeChange = (serviceTypes: string[]) => {
        setData('service_type', serviceTypes);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        setValidationError('');
        setVendorNameValidationError('');
        
        let hasValidationErrors = false;
        
        if (!data.city_id || data.city_id.trim() === '') {
            setValidationError('Please select a city before submitting the form.');
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (!data.vendor_name || data.vendor_name.trim() === '') {
            setVendorNameValidationError('Please enter a vendor name before submitting the form.');
            if (vendorNameRef.current) {
                vendorNameRef.current.focus();
                vendorNameRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }
        
        if (hasValidationErrors) {
            return;
        }
        
        // Helper to read current filters/pagination from the URL query
        const getRedirectQuery = (): Record<string, string> => {
            try {
                const params = new URLSearchParams(window.location.search);
                const keys = ['city', 'city_id', 'vendor_name', 'vendor_type', 'number', 'email', 'per_page', 'page'];
                const out: Record<string, string> = {};
                keys.forEach((k) => {
                    const v = params.get(k);
                    if (v !== null) out[k] = v;
                });
                return out;
            } catch {
                return {};
            }
        };

        // Use form.transform to attach filter/pagination params
        transform((payload: typeof data) => {
            const query = getRedirectQuery();
            const extra: Record<string, unknown> = {};
            const map: Array<[string, string]> = [
                ['city', 'filter_city'],
                ['city_id', 'filter_city_id'],
                ['vendor_name', 'filter_vendor_name'],
                ['vendor_type', 'filter_vendor_type'],
                ['number', 'filter_number'],
                ['email', 'filter_email'],
                ['per_page', 'filter_per_page'],
                ['page', 'filter_page'],
            ];
            map.forEach(([from, to]) => {
                if (query[from] !== undefined) {
                    extra[to] = query[from];
                }
            });
            return { ...payload, ...extra };
        });

        post(route('vendors.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setData('vendor_type', 'main');
                setSelectedCityName('');
                setValidationError('');
                setVendorNameValidationError('');
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCityName('');
        setValidationError('');
        setVendorNameValidationError('');
        setData('vendor_type', 'main');
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Vendor">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CityField
                                cities={cities}
                                value={data.city_id}
                                onChange={handleCityChange}
                                error={errors.city_id}
                                validationError={validationError}
                                ref={cityRef}
                            />

                            <VendorNameField
                                value={data.vendor_name}
                                onChange={handleVendorNameChange}
                                error={errors.vendor_name}
                                validationError={vendorNameValidationError}
                                ref={vendorNameRef}
                            />

                            <div>
                                <label className="mb-1 block text-base font-semibold">Vendor Type</label>
                                <select
                                    value={data.vendor_type}
                                    onChange={(e) => setData('vendor_type', e.target.value as 'main' | 'potential')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="main">Main</option>
                                    <option value="potential">Potential</option>
                                </select>
                                {errors.vendor_type && <p className="mt-1 text-sm text-red-600">{errors.vendor_type}</p>}
                            </div>

                            <PhoneNumberField
                                value={data.number}
                                onChange={handlePhoneNumberChange}
                                error={getArrayFieldErrors('number')}
                            />

                            <EmailField
                                value={data.email}
                                onChange={handleEmailChange}
                                error={getArrayFieldErrors('email')}
                            />

                            <ServiceTypeField
                                value={data.service_type}
                                onChange={handleServiceTypeChange}
                                error={getArrayFieldErrors('service_type')}
                            />
                        </form>
                    </div>

                    <DrawerFooter className="flex-row justify-end gap-2 border-t bg-muted/50 p-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" onClick={submit} disabled={processing}>
                            {processing ? 'Creating...' : 'Create Vendor'}
                        </Button>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
