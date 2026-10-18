import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm, router } from '@inertiajs/react';
import React, { useState, useRef } from 'react';
import CascadingSelectors from './create/CascadingSelectors';
import OfferInformationSection from './create/OfferInformationSection';
import AcceptanceSection from './create/AcceptanceSection';
import LeaseInformationSection from './create/LeaseInformationSection';
import RenewalInformationSection from './create/RenewalInformationSection';
import AdditionalFieldsSection from './create/AdditionalFieldsSection';
import DateOfDeclineSection from './create/DateOfDeclineSection';
import { OfferFilters } from '@/types/OfferRenewal';

interface HierarchicalData {
    id: number;
    name: string;
    properties: {
        id: number;
        name: string;
        city_id: number;
        units: {
            id: number;
            name: string;
            property_id: number;
            tenants: {
                id: number;
                name: string;
                first_name: string;
                last_name: string;
                unit_id: number;
            }[];
        }[];
    }[];
}

interface Props {
    hierarchicalData: HierarchicalData[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    currentFilters: OfferFilters;
    perPage: string | number;
    page: number;
}

export default function OffersAndRenewalsCreateDrawer({ hierarchicalData, open, onOpenChange, onSuccess, currentFilters, perPage, page }: Props) {
    const cityRef = useRef<HTMLButtonElement>(null);
    const propertyRef = useRef<HTMLButtonElement>(null);
    const unitRef = useRef<HTMLButtonElement>(null);
    const tenantRef = useRef<HTMLButtonElement>(null);

    const [validationErrors, setValidationErrors] = useState<{
        city?: string;
        property?: string;
        unit?: string;
        tenant?: string;
        date_sent_offer?: string;
    }>({});

    const [calendarStates, setCalendarStates] = useState({
        date_sent_offer: false,
        date_of_acceptance: false,
        last_notice_sent: false,
        date_sent_lease: false,
        date_signed: false,
        last_notice_sent_2: false,
        date_of_decline: false,
    });

    const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
        setCalendarStates((prev) => ({ ...prev, [field]: open }));
    };

    const { data, setData, processing, errors, reset } = useForm({
        tenant_id: '',
        city_id: '',
        property_id: '',
        unit_id: '',
        other_tenants: '',
        date_sent_offer: '',
        status: '',
        date_of_acceptance: '',
        last_notice_sent: '',
        notice_kind: '',
        lease_sent: '',
        date_sent_lease: '',
        lease_signed: '',
        date_signed: '',
        last_notice_sent_2: '',
        notice_kind_2: '',
        notes: '',
        date_of_decline: '',
        city_name: '',
        property_name: '',
        unit_name: '',
        tenant_name: '',
        per_page: '',
        page: 1,
    });

    const handleCityChange = (cityId: string) => {
        setData({
            ...data,
            city_id: cityId,
            property_id: '',
            unit_id: '',
            tenant_id: ''
        });
        setValidationErrors(prev => ({ ...prev, city: undefined }));
    };

    const handlePropertyChange = (propertyId: string) => {
        setData({
            ...data,
            property_id: propertyId,
            unit_id: '',
            tenant_id: ''
        });
        setValidationErrors(prev => ({ ...prev, property: undefined }));
    };

    const handleUnitChange = (unitId: string) => {
        setData({
            ...data,
            unit_id: unitId,
            tenant_id: ''
        });
        setValidationErrors(prev => ({ ...prev, unit: undefined }));
    };

    const handleTenantChange = (tenantId: string) => {
        setData('tenant_id', tenantId);
        setValidationErrors(prev => ({ ...prev, tenant: undefined }));
    };

    const handleOtherTenantsChange = (value: string) => {
        setData('other_tenants', value);
    };

    const handleDateSentOfferChange = (date: string | null) => {
        setData('date_sent_offer', date || '');
        setValidationErrors(prev => ({ ...prev, date_sent_offer: undefined }));
    };

    const handleDateOfDeclineChange = (date: string | null) => {
        setData('date_of_decline', date || '');
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        setValidationErrors({});

        let hasValidationErrors = false;
        const newValidationErrors: typeof validationErrors = {};

        if (!data.city_id || data.city_id.trim() === '') {
            newValidationErrors.city = 'Please select a city before submitting the form.';
            if (cityRef.current) {
                cityRef.current.focus();
                cityRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.property_id || data.property_id.trim() === '') {
            newValidationErrors.property = 'Please select a property before submitting the form.';
            if (propertyRef.current && !hasValidationErrors) {
                propertyRef.current.focus();
                propertyRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.unit_id || data.unit_id.trim() === '') {
            newValidationErrors.unit = 'Please select a unit before submitting the form.';
            if (unitRef.current && !hasValidationErrors) {
                unitRef.current.focus();
                unitRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (!data.tenant_id || data.tenant_id.trim() === '') {
            newValidationErrors.tenant = 'Please select a tenant before submitting the form.';
            if (tenantRef.current && !hasValidationErrors) {
                tenantRef.current.focus();
                tenantRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hasValidationErrors = true;
        }

        if (hasValidationErrors) {
            setValidationErrors(newValidationErrors);
            return;
        }

        const submitWithContext = {
            ...data,
            city_name: currentFilters.city || '',
            property_name: currentFilters.property || '',
            unit_name: currentFilters.unit || '',
            tenant_name: currentFilters.tenant || '',
            is_hidden: currentFilters.is_hidden ? 'true' : '',
            lease_filter: currentFilters.lease || '',
            per_page: String(perPage),
            page: page,
        };

        router.post(route('offers_and_renewals.store'), submitWithContext, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setValidationErrors({});
                onOpenChange(false);
                onSuccess?.();
            },
        });
    };

    const handleCancel = () => {
        reset();
        setValidationErrors({});
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title="Create New Offer/Renewal">
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <CascadingSelectors
                                hierarchicalData={hierarchicalData}
                                cityId={data.city_id}
                                propertyId={data.property_id}
                                unitId={data.unit_id}
                                tenantId={data.tenant_id}
                                otherTenants={data.other_tenants}
                                onCityChange={handleCityChange}
                                onPropertyChange={handlePropertyChange}
                                onUnitChange={handleUnitChange}
                                onTenantChange={handleTenantChange}
                                onOtherTenantsChange={handleOtherTenantsChange}
                                errors={errors}
                                validationErrors={validationErrors}
                                cityRef={cityRef}
                                propertyRef={propertyRef}
                                unitRef={unitRef}
                                tenantRef={tenantRef}
                            />

                            <OfferInformationSection
                                dateSentOffer={data.date_sent_offer}
                                status={data.status}
                                onDateSentOfferChange={handleDateSentOfferChange}
                                onStatusChange={(value) => setData('status', value)}
                                errors={errors}
                                validationErrors={validationErrors}
                                calendarOpen={calendarStates.date_sent_offer}
                                onCalendarOpenChange={(open) => setCalendarOpen('date_sent_offer', open)}
                            />

                            {data.status === "Didn't Accept" ? (
                                <DateOfDeclineSection
                                    dateOfDecline={data.date_of_decline}
                                    onDateOfDeclineChange={handleDateOfDeclineChange}
                                    errors={errors}
                                    calendarOpen={calendarStates.date_of_decline}
                                    onCalendarOpenChange={(open) => setCalendarOpen('date_of_decline', open)}
                                />
                            ) : (
                                <>
                                    <AcceptanceSection
                                        dateOfAcceptance={data.date_of_acceptance}
                                        lastNoticeSent={data.last_notice_sent}
                                        noticeKind={data.notice_kind}
                                        onDateOfAcceptanceChange={(date) => setData('date_of_acceptance', date || '')}
                                        onLastNoticeSentChange={(date) => setData('last_notice_sent', date || '')}
                                        onNoticeKindChange={(value) => setData('notice_kind', value)}
                                        errors={errors}
                                        calendarStates={{
                                            date_of_acceptance: calendarStates.date_of_acceptance,
                                            last_notice_sent: calendarStates.last_notice_sent
                                        }}
                                        onCalendarOpenChange={setCalendarOpen}
                                    />

                                    <LeaseInformationSection
                                        leaseSent={data.lease_sent}
                                        dateSentLease={data.date_sent_lease}
                                        leaseSigned={data.lease_signed}
                                        dateSigned={data.date_signed}
                                        onLeaseSentChange={(value) => setData('lease_sent', value)}
                                        onDateSentLeaseChange={(date) => setData('date_sent_lease', date || '')}
                                        onLeaseSignedChange={(value) => setData('lease_signed', value)}
                                        onDateSignedChange={(date) => setData('date_signed', date || '')}
                                        errors={errors}
                                        calendarStates={{
                                            date_sent_lease: calendarStates.date_sent_lease,
                                            date_signed: calendarStates.date_signed
                                        }}
                                        onCalendarOpenChange={setCalendarOpen}
                                    />

                                    <RenewalInformationSection
                                        lastNoticeSent2={data.last_notice_sent_2}
                                        noticeKind2={data.notice_kind_2}
                                        onLastNoticeSent2Change={(date) => setData('last_notice_sent_2', date || '')}
                                        onNoticeKind2Change={(value) => setData('notice_kind_2', value)}
                                        errors={errors}
                                        calendarOpen={calendarStates.last_notice_sent_2}
                                        onCalendarOpenChange={(open) => setCalendarOpen('last_notice_sent_2', open)}
                                    />

                                    <AdditionalFieldsSection
                                        notes={data.notes}
                                        onNotesChange={(value) => setData('notes', value)}
                                        errors={errors}
                                    />
                                </>
                            )}
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2 justify-end">
                            <Button type="button" variant="outline" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button type="submit" onClick={submit} disabled={processing}>
                                {processing ? 'Creating...' : 'Create Offer/Renewal'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
