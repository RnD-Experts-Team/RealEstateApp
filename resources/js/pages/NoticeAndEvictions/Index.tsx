import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City, Notice, NoticeAndEviction } from '@/types/NoticeAndEviction';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import NoticeAndEvictionsCreateDrawer from './NoticeAndEvictionsCreateDrawer';
import NoticeAndEvictionsEditDrawer from './NoticeAndEvictionsEditDrawer';
import { FilterBar } from './index/FilterBar';
import { NoticeEvictionsTable } from './index/NoticeEvictionsTable';
import { PageHeader } from './index/PageHeader';
import { PaginationControls } from './index/PaginationControls';
import { ExtendedProperty, ExtendedTenant, Unit } from './index/types';

const formatDateForInput = (value?: string | null): string => {
    if (!value) return '';

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return '';

    const [, y, mo, d] = m;
    return `${y}-${mo}-${d}`;
};

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const exportToCSV = (data: NoticeAndEviction[], filename: string = 'notice-evictions.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'Unit Name',
            'City Name',
            'Property Name',
            'Tenants Name',
            'Other Tenants',
            'Status',
            'Date',
            'Type of Notice',
            'Have An Exception',
            'Note',
            'Evictions',
            'Sent to Attorney',
            'Hearing Dates',
            'Evicted/Payment Plan',
            'If Left',
            'Writ Date',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((record) => {
                    try {
                        return [
                            record.id || '',
                            `"${formatString(record.unit_name)}"`,
                            `"${formatString(record.city_name)}"`,
                            `"${formatString(record.property_name)}"`,
                            `"${formatString(record.tenants_name)}"`,
                            `"${formatString(record.other_tenants)}"`,
                            `"${formatString(record.status)}"`,
                            `"${formatDateOnly(record.date, '')}"`,
                            `"${formatString(record.type_of_notice)}"`,
                            `"${formatString(record.have_an_exception)}"`,
                            `"${formatString(record.note)}"`,
                            `"${formatString(record.evictions)}"`,
                            `"${formatString(record.sent_to_atorney)}"`,
                            `"${formatDateOnly(record.hearing_dates, '')}"`,
                            `"${formatString(record.evected_or_payment_plan)}"`,
                            `"${formatString(record.if_left)}"`,
                            `"${formatDateOnly(record.writ_date, '')}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing record row:', record, rowError);
                        return '';
                    }
                })
                .filter((row) => row !== ''),
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

interface PaginationData {
    current_page: number;
    per_page: number | string;
    total: number;
    last_page: number;
    from: number;
    to: number;
}

interface Props {
    paginatedRecords: {
        data: NoticeAndEviction[];
        current_page: number;
        per_page: number | string;
        total: number;
        last_page: number;
        from: number;
        to: number;
    };
    search?: string;
    cities: City[];
    properties: ExtendedProperty[];
    units: Unit[];
    tenants: ExtendedTenant[];
    notices: Notice[];
    filters: {
        city_id?: number;
        property_id?: number;
        unit_id?: number;
        tenant_id?: number;
        city_name?: string;
        property_name?: string;
        unit_name?: string;
        tenant_name?: string;
        search?: string;
    };
    pagination: {
        current_page: number;
        per_page: number | string;
        total: number;
        last_page: number;
    };
}

const Index = ({
    paginatedRecords,
    cities = [],
    properties = [],
    units = [],
    tenants = [],
    notices = [],
    pagination: initialPagination = { current_page: 1, per_page: 15, total: 0, last_page: 1 },
}: Props) => {
    const [isExporting, setIsExporting] = useState(false);
    const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<NoticeAndEviction | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<NoticeAndEviction | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(initialPagination.current_page);
    const [perPage, setPerPage] = useState<number | string>(initialPagination.per_page);
    const [pagination] = useState<PaginationData>(paginatedRecords);

    // Filter state
    const [tempFilters, setTempFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
        is_hidden: false,
    });

    const [, setFilters] = useState({
        city: '',
        property: '',
        unit: '',
        tenant: '',
        is_hidden: false,
    });

    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showTenantDropdown, setShowTenantDropdown] = useState(false);

    const handleTempFilterChange = (key: string, value: string) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleCitySelect = (city: City) => {
        handleTempFilterChange('city', city.city);
        setShowCityDropdown(false);
    };

    const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('city', value);
        setShowCityDropdown(value.length > 0);
    };

    const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('property', value);
        setShowPropertyDropdown(value.length > 0);
    };

    const handlePropertySelect = (property: ExtendedProperty) => {
        handleTempFilterChange('property', property.property_name);
        setShowPropertyDropdown(false);
    };

    const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('unit', value);
        setShowUnitDropdown(value.length > 0);
    };

    const handleUnitSelect = (unit: Unit) => {
        handleTempFilterChange('unit', unit.unit_name);
        setShowUnitDropdown(false);
    };

    const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        handleTempFilterChange('tenant', value);
        setShowTenantDropdown(value.length > 0);
    };

    const handleTenantSelect = (tenant: ExtendedTenant) => {
        handleTempFilterChange('tenant', tenant.full_name);
        setShowTenantDropdown(false);
    };

    /**
     * Build query parameters with filters and pagination
     */
    const buildQueryParams = (page: number = 1, pageSize: number | string = perPage) => {
        const selectedCity = cities.find((city) => city.city === tempFilters.city);
        const selectedProperty = properties.find((property) => property.property_name === tempFilters.property);
        const selectedUnit = units.find((unit) => unit.unit_name === tempFilters.unit);
        const selectedTenant = tenants.find((tenant) => tenant.full_name === tempFilters.tenant);

        const params: Record<string, any> = {
            page,
            per_page: pageSize,
        };

        if (selectedCity?.id) {
            params.city_id = selectedCity.id;
        } else if (tempFilters.city.trim()) {
            params.city_name = tempFilters.city.trim();
        }

        if (selectedProperty?.id) {
            params.property_id = selectedProperty.id;
        } else if (tempFilters.property.trim()) {
            params.property_name = tempFilters.property.trim();
        }

        if (selectedUnit?.id) {
            params.unit_id = selectedUnit.id;
        } else if (tempFilters.unit.trim()) {
            params.unit_name = tempFilters.unit.trim();
        }

        if (selectedTenant?.id) {
            params.tenant_id = selectedTenant.id;
        } else if (tempFilters.tenant.trim()) {
            params.tenant_name = tempFilters.tenant.trim();
        }

        if (tempFilters.is_hidden) {
            params.is_hidden = 'true';
        }

        return params;
    };

    /**
     * Build filter query string for passing to show page
     */
    const buildFilterQueryString = (): string => {
        const params = buildQueryParams(currentPage, perPage);
        const queryParts: string[] = [];

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
            }
        });

        return queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    };

    const handleSearchClick = () => {
        setFilters(tempFilters);
        const params = buildQueryParams(1); // Reset to page 1 on search
        router.get(route('notice_and_evictions.index'), params, { preserveState: true });
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
            is_hidden: false,
        });
        setFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
            is_hidden: false,
        });

        setShowCityDropdown(false);
        setShowPropertyDropdown(false);
        setShowUnitDropdown(false);
        setShowTenantDropdown(false);

        router.get(route('notice_and_evictions.index'), {}, { preserveState: false });
    };

    /**
     * Handle page change
     */
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        const params = buildQueryParams(newPage, perPage);
        router.get(route('notice_and_evictions.index'), params, { preserveState: true });
    };

    /**
     * Handle per_page change
     */
    const handlePerPageChange = (newPerPage: number | string) => {
        setPerPage(newPerPage);
        setCurrentPage(1); // Reset to page 1 when changing per_page
        const params = buildQueryParams(1, newPerPage);
        router.get(route('notice_and_evictions.index'), params, { preserveState: true });
    };

    /**
     * Get current filter and pagination params for drawer submission
     */
    const getCurrentQueryParams = () => {
        return buildQueryParams(currentPage, perPage);
    };

    /**
     * Handle delete with filters and pagination
     */
    const handleDelete = (record: NoticeAndEviction) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const performDelete = async () => {
    if (!recordToDelete) return;
    setIsDeleting(true);
    try {
        const params = getCurrentQueryParams();
        const queryString = new URLSearchParams(params).toString();
        router.delete(
            `/notice_and_evictions/${recordToDelete.id}?${queryString}`,
            {
                onFinish: () => {
                    setIsDeleteDialogOpen(false);
                    setRecordToDelete(null);
                },
            }
        );
    } finally {
        setIsDeleting(false);
    }
};


    const handleEdit = (record: NoticeAndEviction) => {
        setSelectedRecord(record);
        setIsEditDrawerOpen(true);
    };

    const handleEditSuccess = () => {
        setIsEditDrawerOpen(false);
        setSelectedRecord(null);
        router.reload();
    };

    const handleCreateSuccess = () => {
        setIsCreateDrawerOpen(false);
        router.reload();
    };

    const handleCSVExport = () => {
        if (!paginatedRecords.data || paginatedRecords.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `notice-evictions-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(paginatedRecords.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const filterQueryString = buildFilterQueryString();

    return (
        <AppLayout>
            <Head title="Notice & Evictions" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        title="Notice & Evictions"
                        onExport={handleCSVExport}
                        onAdd={() => setIsCreateDrawerOpen(true)}
                        isExporting={isExporting}
                        hasRecords={paginatedRecords.data && paginatedRecords.data.length > 0}
                        canCreate={hasAllPermissions(['notice-and-evictions.create', 'notice-and-evictions.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                tempFilters={tempFilters}
                                cities={cities}
                                properties={properties}
                                units={units}
                                tenants={tenants}
                                showCityDropdown={showCityDropdown}
                                showPropertyDropdown={showPropertyDropdown}
                                showUnitDropdown={showUnitDropdown}
                                showTenantDropdown={showTenantDropdown}
                                setShowCityDropdown={setShowCityDropdown}
                                setShowPropertyDropdown={setShowPropertyDropdown}
                                setShowUnitDropdown={setShowUnitDropdown}
                                setShowTenantDropdown={setShowTenantDropdown}
                                onCityInputChange={handleCityInputChange}
                                onPropertyInputChange={handlePropertyInputChange}
                                onUnitInputChange={handleUnitInputChange}
                                onTenantInputChange={handleTenantInputChange}
                                onCitySelect={handleCitySelect}
                                onPropertySelect={handlePropertySelect}
                                onUnitSelect={handleUnitSelect}
                                onTenantSelect={handleTenantSelect}
                                onIsHiddenChange={(isHidden) => setTempFilters((prev) => ({ ...prev, is_hidden: isHidden }))}
                                onSearch={handleSearchClick}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            <NoticeEvictionsTable
                                records={paginatedRecords.data}
                                hasShowPermission={hasPermission('notice-and-evictions.show')}
                                hasEditPermission={hasAllPermissions(['notice-and-evictions.edit', 'notice-and-evictions.update'])}
                                hasDeletePermission={hasPermission('notice-and-evictions.destroy')}
                                hasAnyActionPermission={hasAnyPermission([
                                    'notice-and-evictions.show',
                                    'notice-and-evictions.edit',
                                    'notice-and-evictions.update',
                                    'notice-and-evictions.destroy',
                                ])}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                filterQueryString={filterQueryString}
                            />

                            {paginatedRecords.data.length === 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <p className="text-lg">No records found.</p>
                                    <p className="text-sm">Try adjusting your search criteria.</p>
                                </div>
                            )}

                            {paginatedRecords.data.length > 0 && (
                                <div className="mt-6 border-t border-border pt-4">
                                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} records
                                        </div>
                                        <PaginationControls
                                            currentPage={pagination.current_page}
                                            lastPage={pagination.last_page}
                                            perPage={perPage}
                                            onPageChange={handlePageChange}
                                            onPerPageChange={handlePerPageChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <NoticeAndEvictionsCreateDrawer
                open={isCreateDrawerOpen}
                onOpenChange={setIsCreateDrawerOpen}
                cities={cities}
                properties={properties}
                units={units}
                tenants={tenants}
                notices={notices}
                onSuccess={handleCreateSuccess}
                queryParams={getCurrentQueryParams()}
            />

            {selectedRecord && (
                <NoticeAndEvictionsEditDrawer
                    key={selectedRecord.id} // ⬅️ important: remount when record changes
                    record={{
                        ...selectedRecord,
                        date: formatDateForInput(selectedRecord.date),
                        hearing_dates: formatDateForInput(selectedRecord.hearing_dates),
                        writ_date: formatDateForInput(selectedRecord.writ_date),
                    }}
                    cities={cities}
                    properties={properties}
                    units={units}
                    tenants={tenants}
                    notices={notices}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditSuccess}
                    queryParams={getCurrentQueryParams()}
                />
            )}

            {/* Delete confirmation dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => {
                setIsDeleteDialogOpen(open);
                if (!open) setRecordToDelete(null);
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Record</DialogTitle>
                        <DialogDescription>
                            Delete this record? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-sm text-muted-foreground">
                        {recordToDelete && (
                            <p>
                                You are deleting record ID <span className="font-medium text-foreground">{recordToDelete.id}</span>.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setIsDeleteDialogOpen(false);
                                setRecordToDelete(null);
                            }}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={performDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting…' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Index;
