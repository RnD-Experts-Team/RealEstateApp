import { Head } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { usePermissions } from '@/hooks/usePermissions';
import { Payment } from '@/types/payments';
import { router } from '@inertiajs/react';
import PageHeader from './index/PageHeader';
import FilterSection from './index/FilterSection';
import PaymentsTable from './index/PaymentsTable';
import PaginationInfo from './index/PaginationInfo';
import EmptyState from './index/EmptyState';
import PaymentCreateDrawer from './PaymentCreateDrawer';
import PaymentEditDrawer from './PaymentEditDrawer';
import { exportToCSV } from './index/paymentUtils';
import PaginationControls from './index/PaginationControls';

interface UnitData {
    id: number;
    unit_name: string;
    property_name: string;
    city: string;
}

interface Statistics {
    total: number;
    paid: number;
    didnt_pay: number;
    paid_partly: number;
    overpaid: number;
}

interface Props {
    payments: {
        data: Payment[];
        links: any[];
        meta: any;
    };
    search: string | null;
    filters: {
        city?: string;
        property?: string;
        unit?: string;
        permanent?: string[];
        is_hidden?: boolean;
        remind?: boolean | null;
        added_to_ledger?: boolean | null;
        per_page?: string;
    };
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    allCities: string[];
    allProperties: string[];
    statistics: Statistics;
}

export default function Index({
    payments,
    filters,
    units,
    cities,
    properties,
    unitsByCity,
    unitsByProperty,
    propertiesByCity,
    allCities,
    allProperties,
    statistics
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
    const [isExporting, setIsExporting] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

    // Location filters
    const [cityFilter, setCityFilter] = useState(filters?.city || '');
    const [propertyFilter, setPropertyFilter] = useState(filters?.property || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit || '');

    // Status and other filters
    const [permanentFilter, setPermanentFilter] = useState<string[]>(filters?.permanent || []);
    const [isHiddenFilter, setIsHiddenFilter] = useState<boolean>(filters?.is_hidden || false);
    const [remindFilter, setRemindFilter] = useState<boolean | null>(filters?.remind ?? null);
    const [addedToLedgerFilter, setAddedToLedgerFilter] = useState<boolean | null>(filters?.added_to_ledger ?? null);

    // Shared per-page state for pagination and search
    const [perPage, setPerPage] = useState<string>(filters?.per_page || '15');
    useEffect(() => {
        // Sync local perPage when server-provided filters change
        setPerPage(filters?.per_page || '15');
    }, [filters?.per_page]);

    // Current filters as passed to child components
    const currentFilters = {
        city: cityFilter || undefined,
        property: propertyFilter || undefined,
        unit: unitFilter || undefined,
        permanent: permanentFilter,
        is_hidden: isHiddenFilter,
        remind: remindFilter,
        added_to_ledger: addedToLedgerFilter,
    };

    // Query params for the current filters, per-page and page
    const buildFilterParams = (page: number = payments?.meta?.current_page || 1) => {
        const params: any = {};
        if (cityFilter) params.city = cityFilter;
        if (propertyFilter) params.property = propertyFilter;
        if (unitFilter) params.unit = unitFilter;
        if (permanentFilter && permanentFilter.length > 0) params.permanent = permanentFilter.join(',');
        if (isHiddenFilter) params.is_hidden = 'true';
        if (remindFilter !== null) params.remind = String(remindFilter);
        if (addedToLedgerFilter !== null) params.added_to_ledger = String(addedToLedgerFilter);
        params.per_page = perPage;
        params.page = page;
        return params;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Ensure current per-page is respected and reset to first page
        const params = buildFilterParams(1);

        router.get(route('payments.index'), params, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const clearFilters = () => {
        setCityFilter('');
        setPropertyFilter('');
        setUnitFilter('');
        setPermanentFilter([]);
        setIsHiddenFilter(false);
        setRemindFilter(null);
        setAddedToLedgerFilter(null);
        // Reset per_page to 15 and page to 1 when clearing filters
        setPerPage('15');
        router.get(route('payments.index'), { per_page: '15', page: 1 }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleDelete = (payment: Payment) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            const params = buildFilterParams();

            router.delete(route('payments.destroy', payment.id), {
                data: params,
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleHide = (payment: Payment) => {
        if (confirm('Are you sure you want to hide this payment?')) {
            const params = buildFilterParams();

            router.patch(route('payments.hide', payment.id), params, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleUnhide = (payment: Payment) => {
        if (confirm('Are you sure you want to unhide this payment?')) {
            const params = buildFilterParams();

            router.patch(route('payments.unhide', payment.id), params, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleEdit = (payment: Payment) => {
        // Ensure date is in 'yyyy-MM-dd' format for the edit drawer
        const normalizedDate = (() => {
            if (!payment.date) return '' as string;
            const match = payment.date.match(/^(\d{4}-\d{2}-\d{2})/);
            return match ? match[1] : payment.date;
        })();

        setSelectedPayment({ ...payment, date: normalizedDate });
        setEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        router.reload();
    };

    const handleCSVExport = () => {
        if (!payments || !payments.data || payments.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting payments data:', payments.data);
            const filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(payments.data, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <AppLayout>
            <Head title="Payments" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        onExport={handleCSVExport}
                        onAddPayment={() => setDrawerOpen(true)}
                        isExporting={isExporting}
                        hasData={payments?.data && payments.data.length > 0}
                        canCreate={hasAllPermissions(['payments.create', 'payments.store'])}
                        statistics={statistics}
                    />

                    <FilterSection
                        cityFilter={cityFilter}
                        propertyFilter={propertyFilter}
                        unitFilter={unitFilter}
                        permanentFilter={permanentFilter}
                        isHiddenFilter={isHiddenFilter}
                        setCityFilter={setCityFilter}
                        setPropertyFilter={setPropertyFilter}
                        setUnitFilter={setUnitFilter}
                        setPermanentFilter={setPermanentFilter}
                        setIsHiddenFilter={setIsHiddenFilter}
                        remindFilter={remindFilter}
                        setRemindFilter={setRemindFilter}
                        addedToLedgerFilter={addedToLedgerFilter}
                        setAddedToLedgerFilter={setAddedToLedgerFilter}
                        uniqueCities={allCities}
                        uniqueProperties={allProperties}
                        units={units}
                        onSearch={handleSearch}
                        onClear={clearFilters}
                    />

                    {payments.data.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            <PaymentsTable
                                payments={payments.data}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onHide={handleHide}
                                onUnhide={handleUnhide}
                                hasAnyPermission={hasAnyPermission}
                                hasAllPermissions={hasAllPermissions}
                                hasPermission={hasPermission}
                                filters={currentFilters}
                            />
                            <PaginationControls
                                meta={payments.meta}
                                links={payments.links}
                                perPage={perPage}
                                onPerPageChange={setPerPage}
                                filters={currentFilters}
                            />
                            <PaginationInfo meta={payments.meta} />
                        </>
                    )}
                </div>
            </div>

            <PaymentCreateDrawer
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                units={units}
                cities={cities}
                properties={properties}
                unitsByCity={unitsByCity}
                unitsByProperty={unitsByProperty}
                propertiesByCity={propertiesByCity}
                filtersContext={{
                    ...currentFilters,
                    per_page: perPage,
                    page: payments?.meta?.current_page || 1,
                }}
            />

            {selectedPayment && (
                <PaymentEditDrawer
                    payment={selectedPayment}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByCity={unitsByCity}
                    unitsByProperty={unitsByProperty}
                    propertiesByCity={propertiesByCity}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                    filtersContext={{
                        ...currentFilters,
                        per_page: perPage,
                        page: payments?.meta?.current_page || 1,
                    }}
                />
            )}
        </AppLayout>
    );
}
