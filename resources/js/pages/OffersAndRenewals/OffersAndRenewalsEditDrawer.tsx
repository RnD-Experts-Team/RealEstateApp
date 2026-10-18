import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { useForm, router } from '@inertiajs/react';
import { format, parse, isValid } from 'date-fns';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import CitySelector from './edit/CitySelector';
import PropertySelector from './edit/PropertySelector';
import UnitSelector from './edit/UnitSelector';
import TenantSelector from './edit/TenantSelector';
import DatePickerField from './edit/DatePickerField';
import RadioGroupField from './edit/RadioGroupField';
import TextAreaField from './edit/TextAreaField';
import DateOfDeclineSectionEdit from './edit/DateOfDeclineSectionEdit';
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

interface OfferRenewal {
  id: number;
  tenant_id?: number;
  city_name?: string;
  property?: string;
  unit?: string;
  tenant?: string;
  other_tenants?: string;
  date_sent_offer?: string;
  status?: string;
  date_of_acceptance?: string;
  date_of_decline?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: number;
}

interface Props {
  offer: OfferRenewal;
  hierarchicalData: HierarchicalData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currentFilters: OfferFilters;
  perPage: string | number;
  page: number;
}

/**
 * Convert any backend date-ish string to a strict date-only "yyyy-MM-dd".
 * - Works for "yyyy-MM-dd" and "yyyy-MM-ddTHH:mm:ssZ" (takes first 10 chars).
 * - Never constructs a Date() from the raw string (avoids TZ shifts).
 */
const toDateOnlyString = (raw?: string | null): string => {
  if (!raw) return '';
  const datePart = raw.slice(0, 10); // 'yyyy-MM-dd'
  const d = parse(datePart, 'yyyy-MM-dd', new Date());
  return isValid(d) ? format(d, 'yyyy-MM-dd') : '';
};

export default function OffersAndRenewalsEditDrawer({ offer, hierarchicalData, open, onOpenChange, onSuccess, currentFilters, perPage, page }: Props) {
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
    date_of_decline: false,
    last_notice_sent: false,
    date_sent_lease: false,
    date_signed: false,
    last_notice_sent_2: false,
  });

  const setCalendarOpen = (field: keyof typeof calendarStates, open: boolean) => {
    setCalendarStates((prev) => ({ ...prev, [field]: open }));
  };

  const findInitialSelections = () => {
    if (!offer.tenant_id) return { cityId: '', propertyId: '', unitId: '', tenantId: '' };

    for (const city of hierarchicalData) {
      for (const property of city.properties) {
        for (const unit of property.units) {
          const tenant = unit.tenants.find((t) => t.id === offer.tenant_id);
          if (tenant) {
            return {
              cityId: city.id.toString(),
              propertyId: property.id.toString(),
              unitId: unit.id.toString(),
              tenantId: tenant.id.toString(),
            };
          }
        }
      }
    }

    return { cityId: '', propertyId: '', unitId: '', tenantId: '' };
  };

  const initialSelections = findInitialSelections();

  const { data, setData, processing, errors } = useForm({
    tenant_id: offer.tenant_id?.toString() || '',
    city_id: initialSelections.cityId,
    property_id: initialSelections.propertyId,
    unit_id: initialSelections.unitId,
    other_tenants: offer.other_tenants || '',
    date_sent_offer: toDateOnlyString(offer.date_sent_offer),
    status: offer.status || '',
    date_of_acceptance: toDateOnlyString(offer.date_of_acceptance),
    date_of_decline: toDateOnlyString(offer.date_of_decline),
    last_notice_sent: toDateOnlyString(offer.last_notice_sent),
    notice_kind: offer.notice_kind || '',
    lease_sent: offer.lease_sent || '',
    date_sent_lease: toDateOnlyString(offer.date_sent_lease),
    lease_signed: offer.lease_signed || '',
    date_signed: toDateOnlyString(offer.date_signed),
    last_notice_sent_2: toDateOnlyString(offer.last_notice_sent_2),
    notice_kind_2: offer.notice_kind_2 || '',
    notes: offer.notes || '',
    how_many_days_left: offer.how_many_days_left?.toString() || '',
  });

  useEffect(() => {
    if (offer) {
      const newInitialSelections = findInitialSelections();
      setData({
        tenant_id: offer.tenant_id?.toString() || '',
        city_id: newInitialSelections.cityId,
        property_id: newInitialSelections.propertyId,
        unit_id: newInitialSelections.unitId,
        other_tenants: offer.other_tenants || '',
        date_sent_offer: toDateOnlyString(offer.date_sent_offer),
        status: offer.status || '',
        date_of_acceptance: toDateOnlyString(offer.date_of_acceptance),
        date_of_decline: toDateOnlyString(offer.date_of_decline),
        last_notice_sent: toDateOnlyString(offer.last_notice_sent),
        notice_kind: offer.notice_kind || '',
        lease_sent: offer.lease_sent || '',
        date_sent_lease: toDateOnlyString(offer.date_sent_lease),
        lease_signed: offer.lease_signed || '',
        date_signed: toDateOnlyString(offer.date_signed),
        last_notice_sent_2: toDateOnlyString(offer.last_notice_sent_2),
        notice_kind_2: offer.notice_kind_2 || '',
        notes: offer.notes || '',
        how_many_days_left: offer.how_many_days_left?.toString() || '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offer]);

  const availableProperties = useMemo(() => {
    if (!data.city_id) return [];
    const selectedCity = hierarchicalData.find((city) => city.id.toString() === data.city_id);
    return selectedCity ? selectedCity.properties : [];
  }, [hierarchicalData, data.city_id]);

  const availableUnits = useMemo(() => {
    if (!data.property_id) return [];
    const selectedProperty = availableProperties.find((property) => property.id.toString() === data.property_id);
    return selectedProperty ? selectedProperty.units : [];
  }, [availableProperties, data.property_id]);

  const availableTenants = useMemo(() => {
    if (!data.unit_id) return [];
    const selectedUnit = availableUnits.find((unit) => unit.id.toString() === data.unit_id);
    return selectedUnit ? selectedUnit.tenants : [];
  }, [availableUnits, data.unit_id]);

  const handleCityChange = (cityId: string) => {
    setData({
      ...data,
      city_id: cityId,
      property_id: '',
      unit_id: '',
      tenant_id: '',
    });
    setValidationErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handlePropertyChange = (propertyId: string) => {
    setData({
      ...data,
      property_id: propertyId,
      unit_id: '',
      tenant_id: '',
    });
    setValidationErrors((prev) => ({ ...prev, property: undefined }));
  };

  const handleUnitChange = (unitId: string) => {
    setData({
      ...data,
      unit_id: unitId,
      tenant_id: '',
    });
    setValidationErrors((prev) => ({ ...prev, unit: undefined }));
  };

  const handleTenantChange = (tenantId: string) => {
    setData('tenant_id', tenantId);
    setValidationErrors((prev) => ({ ...prev, tenant: undefined }));
  };

  const handleOtherTenantsChange = (value: string) => {
    setData('other_tenants', value);
  };

  const handleDateSentOfferChange = (date: string | null) => {
    setData('date_sent_offer', date || '');
    setValidationErrors((prev) => ({ ...prev, date_sent_offer: undefined }));
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

    router.put(route('offers_and_renewals.update', offer.id), submitWithContext, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => {
        setValidationErrors({});
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const handleCancel = () => {
    const resetSelections = findInitialSelections();
    setData({
      tenant_id: offer.tenant_id?.toString() || '',
      city_id: resetSelections.cityId,
      property_id: resetSelections.propertyId,
      unit_id: resetSelections.unitId,
      other_tenants: offer.other_tenants || '',
      date_sent_offer: toDateOnlyString(offer.date_sent_offer),
      status: offer.status || '',
      date_of_acceptance: toDateOnlyString(offer.date_of_acceptance),
      date_of_decline: toDateOnlyString(offer.date_of_decline),
      last_notice_sent: toDateOnlyString(offer.last_notice_sent),
      notice_kind: offer.notice_kind || '',
      lease_sent: offer.lease_sent || '',
      date_sent_lease: toDateOnlyString(offer.date_sent_lease),
      lease_signed: offer.lease_signed || '',
      date_signed: toDateOnlyString(offer.date_signed),
      last_notice_sent_2: toDateOnlyString(offer.last_notice_sent_2),
      notice_kind_2: offer.notice_kind_2 || '',
      notes: offer.notes || '',
      how_many_days_left: offer.how_many_days_left?.toString() || '',
    });
    setValidationErrors({});
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
      <DrawerContent size="half" title={`Edit Offer/Renewal (ID: ${offer.id})`}>
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto p-6">
            <form onSubmit={submit} className="space-y-4">
              {/* Cascading Selection */}
              <CitySelector
                cities={hierarchicalData}
                value={data.city_id}
                onChange={handleCityChange}
                error={errors.city_id}
                validationError={validationErrors.city}
                cityRef={cityRef}
              />

              <PropertySelector
                properties={availableProperties}
                value={data.property_id}
                onChange={handlePropertyChange}
                error={errors.property_id}
                validationError={validationErrors.property}
                propertyRef={propertyRef}
                citySelected={!!data.city_id}
              />

              <UnitSelector
                units={availableUnits}
                value={data.unit_id}
                onChange={handleUnitChange}
                error={errors.unit_id}
                validationError={validationErrors.unit}
                unitRef={unitRef}
                propertySelected={!!data.property_id}
              />

              <TenantSelector
                tenants={availableTenants}
                value={data.tenant_id}
                onChange={handleTenantChange}
                error={errors.tenant_id}
                validationError={validationErrors.tenant}
                tenantRef={tenantRef}
                unitSelected={!!data.unit_id}
                otherTenants={data.other_tenants}
                onOtherTenantsChange={handleOtherTenantsChange}
              />

              {/* Offer Information */}
              <DatePickerField
                label="Date Sent Offer"
                value={data.date_sent_offer}
                onChange={handleDateSentOfferChange}
                error={errors.date_sent_offer}
                validationError={validationErrors.date_sent_offer}
                required={true}
                borderColor="border-l-orange-500"
                isOpen={calendarStates.date_sent_offer}
                onOpenChange={(open) => setCalendarOpen('date_sent_offer', open)}
                allowClear={false}
              />

              <RadioGroupField
                label="Status"
                name="status"
                value={data.status}
                onChange={(value) => setData('status', value)}
                options={[
                  { value: 'Accepted', label: 'Accepted' },
                  { value: "Didn't Accept", label: "Didn't Accept" },
                  { value: "Didn't respond", label: "Didn't respond" },
                ]}
                error={errors.status}
                borderColor="border-l-emerald-500"
              />

              {/* Conditional rendering based on status */}
              {data.status === "Didn't Accept" ? (
                <DateOfDeclineSectionEdit
                  value={data.date_of_decline}
                  onChange={handleDateOfDeclineChange}
                  error={errors.date_of_decline}
                  isOpen={calendarStates.date_of_decline}
                  onOpenChange={(open) => setCalendarOpen('date_of_decline', open)}
                />
              ) : (
                <>
                  <DatePickerField
                    label="Date of Acceptance"
                    value={data.date_of_acceptance}
                    onChange={(value) => setData('date_of_acceptance', value || '')}
                    error={errors.date_of_acceptance}
                    borderColor="border-l-teal-500"
                    isOpen={calendarStates.date_of_acceptance}
                    onOpenChange={(open) => setCalendarOpen('date_of_acceptance', open)}
                  />

                  <DatePickerField
                    label="Offer Last Notice Sent"
                    value={data.last_notice_sent}
                    onChange={(value) => setData('last_notice_sent', value || '')}
                    error={errors.last_notice_sent}
                    borderColor="border-l-indigo-500"
                    isOpen={calendarStates.last_notice_sent}
                    onOpenChange={(open) => setCalendarOpen('last_notice_sent', open)}
                  />

                  <RadioGroupField
                    label="Offer Notice Kind"
                    name="notice_kind"
                    value={data.notice_kind}
                    onChange={(value) => setData('notice_kind', value)}
                    options={[
                      { value: 'Email', label: 'Email' },
                      { value: 'Call', label: 'Call' },
                      { value: 'Messages', label: 'Messages' },
                    ]}
                    error={errors.notice_kind}
                    borderColor="border-l-pink-500"
                  />

                  {/* Lease Information */}
                  <RadioGroupField
                    label="Lease Sent?"
                    name="lease_sent"
                    value={data.lease_sent}
                    onChange={(value) => setData('lease_sent', value)}
                    options={[
                      { value: 'Yes', label: 'Yes' },
                      { value: 'No', label: 'No' },
                    ]}
                    error={errors.lease_sent}
                    borderColor="border-l-red-500"
                  />

                  <DatePickerField
                    label="Date Sent Lease"
                    value={data.date_sent_lease}
                    onChange={(value) => setData('date_sent_lease', value || '' )}
                    error={errors.date_sent_lease}
                    borderColor="border-l-yellow-500"
                    isOpen={calendarStates.date_sent_lease}
                    onOpenChange={(open) => setCalendarOpen('date_sent_lease', open)}
                  />

                  <RadioGroupField
                    label="Lease Signed?"
                    name="lease_signed"
                    value={data.lease_signed}
                    onChange={(value) => setData('lease_signed', value)}
                    options={[
                      { value: 'Signed', label: 'Signed' },
                      { value: 'Unsigned', label: 'Unsigned' },
                    ]}
                    error={errors.lease_signed}
                    borderColor="border-l-cyan-500"
                  />

                  <DatePickerField
                    label="Date Signed"
                    value={data.date_signed}
                    onChange={(value) => setData('date_signed', value || '')}
                    error={errors.date_signed}
                    borderColor="border-l-violet-500"
                    isOpen={calendarStates.date_signed}
                    onOpenChange={(open) => setCalendarOpen('date_signed', open)}
                  />

                  {/* Renewal Information */}
                  <DatePickerField
                    label="Renewal Last Notice Sent"
                    value={data.last_notice_sent_2}
                    onChange={(value) => setData('last_notice_sent_2', value || '')}
                    error={errors.last_notice_sent_2}
                    borderColor="border-l-rose-500"
                    isOpen={calendarStates.last_notice_sent_2}
                    onOpenChange={(open) => setCalendarOpen('last_notice_sent_2', open)}
                  />

                  <RadioGroupField
                    label="Renewal Notice Kind"
                    name="notice_kind_2"
                    value={data.notice_kind_2}
                    onChange={(value) => setData('notice_kind_2', value)}
                    options={[
                      { value: 'Email', label: 'Email' },
                      { value: 'Call', label: 'Call' },
                      { value: 'Messages', label: 'Messages' },
                    ]}
                    error={errors.notice_kind_2}
                    borderColor="border-l-amber-500"
                  />

                  <TextAreaField
                    label="Notes"
                    value={data.notes}
                    onChange={(value) => setData('notes', value)}
                    error={errors.notes}
                    borderColor="border-l-slate-500"
                    placeholder="Add any additional notes..."
                    rows={3}
                  />
                </>
              )}
            </form>
          </div>

          <DrawerFooter>
            <div className="flex gap-2">
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={submit} disabled={processing} className="flex-1">
                {processing ? 'Updating...' : 'Update Offer'}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
