import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody } from '@/components/ui/table';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { PaginatedResponse } from '@/types/PaymentPlan';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import OffersAndRenewalsCreateDrawer from './OffersAndRenewalsCreateDrawer';
import OffersAndRenewalsEditDrawer from './OffersAndRenewalsEditDrawer';
import { EmptyState } from './index/EmptyState';
import { FilterBar } from './index/FilterBar';
import { PageHeader } from './index/PageHeader';
import { TabNavigation } from './index/TabNavigation';
import { OffersTableHeader } from './index/TableHeader';
import { OffersTableRow } from './index/TableRow';
import { exportToCSV } from './index/utils/csvExport';

interface OfferRenewal {
    id: number;
    tenant_id?: number;
    city_name?: string;
    property?: string;
    unit?: string;
    tenant?: string;
    date_sent_offer?: string;
    date_offer_expires?: string;
    status?: string;
    date_of_acceptance?: string;
    last_notice_sent?: string;
    notice_kind?: string;
    lease_sent?: string;
    date_sent_lease?: string;
    lease_expires?: string;
    lease_signed?: string;
    date_signed?: string;
    last_notice_sent_2?: string;
    notice_kind_2?: string;
    notes?: string;
    how_many_days_left?: number;
    expired?: string;
    other_tenants?: string;
    date_of_decline?: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    offers: OfferRenewal[] | PaginatedResponse<OfferRenewal>;
    unit_id: string | null;
    tenant_id: string | null;
    city_name?: string | null;
    property_name?: string | null;
    unit_name?: string | null;
    tenant_name?: string | null;
    hierarchicalData: any[];
    filterCityNames: string[];
    filterPropertyNames: string[];
    filterUnitNames: string[];
    filterTenantNames: string[];
    perPage?: number | string;
    page?: number | null;
}

const Index = ({
    offers,
    hierarchicalData,
    filterCityNames,
    filterPropertyNames,
    filterUnitNames,
    filterTenantNames,
    perPage: perPageProp,
    city_name,
    property_name,
    unit_name,
    tenant_name,
}: Props) => {
    const [activeTab, setActiveTab] = useState<'offers' | 'renewals' | 'both'>('offers');
    const [isExporting, setIsExporting] = useState(false);
    const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<OfferRenewal | null>(null);

    const [tempFilters, setTempFilters] = useState({
        city: city_name || '',
        property: property_name || '',
        unit: unit_name || '',
        tenant: tenant_name || '',
    });

    const [, setFilters] = useState({
        city: city_name || '',
        property: property_name || '',
        unit: unit_name || '',
        tenant: tenant_name || '',
    });

    useEffect(() => {
        setTempFilters({
            city: city_name || '',
            property: property_name || '',
            unit: unit_name || '',
            tenant: tenant_name || '',
        });
        setFilters({
            city: city_name || '',
            property: property_name || '',
            unit: unit_name || '',
            tenant: tenant_name || '',
        });
    }, [city_name, property_name, unit_name, tenant_name]);

    const isPaginated = useMemo(() => {
        return !!(offers && (offers as any).data && Array.isArray((offers as any).data));
    }, [offers]);

    const offersData = useMemo(() => {
        if (!offers) return [];
        if (Array.isArray(offers)) return offers;
        if (isPaginated) return (offers as PaginatedResponse<OfferRenewal>).data;
        return [];
    }, [offers, isPaginated]);

    const currentPage = useMemo(() => {
        if (!isPaginated) return 1;
        const o = offers as PaginatedResponse<OfferRenewal>;
        return o.current_page ?? (o as any)?.meta?.current_page ?? 1;
    }, [offers, isPaginated]);

    const lastPage = useMemo(() => {
        if (!isPaginated) return 1;
        const o = offers as PaginatedResponse<OfferRenewal>;
        return o.last_page ?? (o as any)?.meta?.last_page ?? 1;
    }, [offers, isPaginated]);

    const total = useMemo(() => {
        if (isPaginated) {
            const o = offers as PaginatedResponse<OfferRenewal>;
            return o.total ?? (o as any)?.meta?.total ?? o.data.length;
        }
        return offersData.length;
    }, [offers, offersData, isPaginated]);

    const from = useMemo(() => {
        if (isPaginated) {
            const o = offers as PaginatedResponse<OfferRenewal>;
            return o.from ?? (o as any)?.meta?.from ?? 0;
        }
        return offersData.length ? 1 : 0;
    }, [offers, offersData, isPaginated]);

    const to = useMemo(() => {
        if (isPaginated) {
            const o = offers as PaginatedResponse<OfferRenewal>;
            return o.to ?? (o as any)?.meta?.to ?? o.data.length;
        }
        return offersData.length;
    }, [offers, offersData, isPaginated]);

    const selectedPerPage = useMemo(() => {
        const incoming =
            typeof perPageProp !== 'undefined' ? perPageProp : isPaginated ? ((offers as any)?.per_page ?? (offers as any)?.meta?.per_page) : 15;
        const val = String(incoming).toLowerCase();
        if (val === 'all') return 'all';
        const n = parseInt(val, 10);
        return Number.isNaN(n) ? '15' : String(n);
    }, [perPageProp, isPaginated, offers]);

    const filterCities = useMemo(() => filterCityNames || [], [filterCityNames]);
    const filterProperties = useMemo(() => filterPropertyNames || [], [filterPropertyNames]);
    const filterUnits = useMemo(() => filterUnitNames || [], [filterUnitNames]);
    const filterTenants = useMemo(() => filterTenantNames || [], [filterTenantNames]);

    const filtered = offersData;

    const handlePerPageChange = (value: string) => {
        const nextPerPage = value === 'all' ? 'all' : parseInt(value, 10);
        router.get(
            route('offers_and_renewals.index'),
            {
                city_name: tempFilters.city || undefined,
                property_name: tempFilters.property || undefined,
                unit_name: tempFilters.unit || undefined,
                tenant_name: tempFilters.tenant || undefined,
                per_page: nextPerPage,
                page: 1,
            },
            { preserveState: true },
        );
    };

    const goToPage = (page: number) => {
        if (page < 1) return;
        if (isPaginated && page > lastPage) return;
        router.get(
            route('offers_and_renewals.index'),
            {
                city_name: tempFilters.city || undefined,
                property_name: tempFilters.property || undefined,
                unit_name: tempFilters.unit || undefined,
                tenant_name: tempFilters.tenant || undefined,
                page,
                per_page: selectedPerPage,
            },
            { preserveState: true },
        );
    };

    const handleSearchClick = () => {
        setFilters(tempFilters);

        router.get(
            route('offers_and_renewals.index'),
            {
                city_name: tempFilters.city || null,
                property_name: tempFilters.property || null,
                unit_name: tempFilters.unit || null,
                tenant_name: tempFilters.tenant || null,
                page: 1,
                per_page: selectedPerPage,
            },
            { preserveState: true },
        );
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });
        setFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
        });

        router.get(route('offers_and_renewals.index'), { per_page: selectedPerPage }, { preserveState: false });
    };

    const handleDelete = (offer: OfferRenewal) => {
        if (window.confirm('Are you sure you want to delete this offer? This action cannot be undone.')) {
            const context = {
                city_name: tempFilters.city || '',
                property_name: tempFilters.property || '',
                unit_name: tempFilters.unit || '',
                tenant_name: tempFilters.tenant || '',
                per_page: selectedPerPage,
                page: currentPage,
            };

            router.delete(route('offers_and_renewals.destroy', offer.id), {
                data: context,
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleEdit = (offer: OfferRenewal) => {
        setSelectedOffer(offer);
        setEditDrawerOpen(true);
    };

    const handleCSVExport = () => {
        if (!filtered || filtered.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            console.log('Exporting offers and renewals data:', filtered);
            const filename = `offers-renewals-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(filtered, activeTab, filename);
            console.log('Export completed successfully');
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const permissions = {
        canView: hasPermission('offers-and-renewals.show'),
        canEdit: hasAllPermissions(['offers-and-renewals.edit', 'offers-and-renewals.update']),
        canDelete: hasPermission('offers-and-renewals.destroy'),
    };

    return (
        <AppLayout>
            <Head title="Offers and Renewals" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        onExport={handleCSVExport}
                        onAddNew={() => setCreateDrawerOpen(true)}
                        isExporting={isExporting}
                        hasData={filtered.length > 0}
                        canCreate={hasAllPermissions(['offers-and-renewals.create', 'offers-and-renewals.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                cities={filterCities}
                                properties={filterProperties}
                                units={filterUnits}
                                tenants={filterTenants}
                                tempFilters={tempFilters}
                                onTempFiltersChange={setTempFilters}
                                onSearch={handleSearchClick}
                                onClear={handleClearFilters}
                            />

                            <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
                        </CardHeader>

                        <CardContent>
                            <Table
                                containerClassName="relative max-h-[600px] overflow-auto"
                                className="border-collapse rounded-md border border-border"
                            >
                                <OffersTableHeader
                                    activeTab={activeTab}
                                    hasPermissions={hasAnyPermission([
                                        'offers-and-renewals.show',
                                        'offers-and-renewals.edit',
                                        'offers-and-renewals.update',
                                        'offers-and-renewals.destroy',
                                    ])}
                                />
                                <TableBody>
                                    {filtered.map((offer) => (
                                        <OffersTableRow
                                            key={offer.id}
                                            offer={offer}
                                            activeTab={activeTab}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            permissions={permissions}
                                            currentFilters={tempFilters}
                                            perPage={selectedPerPage}
                                            page={currentPage}
                                        />
                                    ))}
                                </TableBody>
                            </Table>

                            {filtered.length === 0 && <EmptyState />}

                            <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {from ?? 0}-{to ?? filtered.length} of {total}
                                </div>

                                <div className="flex items-center gap-3">
                                    <label className="text-sm text-muted-foreground">Rows per page:</label>
                                    <select
                                        className="rounded-md border border-border bg-background p-1 text-sm"
                                        value={selectedPerPage}
                                        onChange={(e) => handlePerPageChange(e.target.value)}
                                    >
                                        <option value="15">15</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                        <option value="all">All</option>
                                    </select>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage - 1)}
                                            disabled={!isPaginated || currentPage <= 1 || selectedPerPage === 'all'}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => goToPage(currentPage + 1)}
                                            disabled={!isPaginated || currentPage >= lastPage || selectedPerPage === 'all'}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <OffersAndRenewalsCreateDrawer
                hierarchicalData={hierarchicalData}
                open={createDrawerOpen}
                onOpenChange={setCreateDrawerOpen}
                currentFilters={tempFilters}
                perPage={selectedPerPage}
                page={currentPage}
            />

            {selectedOffer && (
                <OffersAndRenewalsEditDrawer
                    offer={selectedOffer}
                    hierarchicalData={hierarchicalData}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    currentFilters={tempFilters}
                    perPage={selectedPerPage}
                    page={currentPage}
                    onSuccess={() => {
                        router.reload();
                    }}
                />
            )}
        </AppLayout>
    );
};

export default Index;
