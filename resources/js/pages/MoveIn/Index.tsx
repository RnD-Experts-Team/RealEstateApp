import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { City } from '@/types/City';
import { MoveIn } from '@/types/move-in';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import MoveInCreateDrawer from './MoveInCreateDrawer';
import MoveInEditDrawer from './MoveInEditDrawer';
import PageHeader from './index/PageHeader';
import MoveInFilters from './index/MoveInFilters';
import MoveInTable from './index/MoveInTable';
import EmptyState from './index/EmptyState';
import PaginationInfo from './index/PaginationInfo';

// Updated Unit interface to include ID
interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}

// CSV Export utility function with fixed date formatting
const exportToCSV = (data: MoveIn[], filename: string = 'move-ins.csv') => {
    try {
        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                const d = new Date(dateStr);
                if (isNaN(d.getTime())) return '';
                return new Intl.DateTimeFormat(undefined, {
                    year: 'numeric',
                    month: 'numeric',
                    day: 'numeric',
                    timeZone: 'UTC',
                }).format(d);
            } catch (error) {
                return dateStr || '';
            }
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'City',
            'Property Name',
            'Unit Name',
            'Tenant Name',
            'Signed Lease',
            'Lease Signing Date',
            'Move-In Date',
            'Paid Security & First Month',
            'Scheduled Payment Date',
            'Handled Keys',
            'Move in form sent On',
            'Filled Move-In Form',
            'Date of move in form filled in',
            'Submitted Insurance',
            'Date of Insurance expiration',
            'Last Notice Sent',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveIn) => {
                    try {
                        return [
                            moveIn.id || '',
                            `"${formatString(moveIn.city_name)}"`,
                            `"${formatString(moveIn.property_name)}"`,
                            `"${formatString(moveIn.unit_name)}"`,
                            `"${formatString(moveIn.tenant_name)}"`,
                            `"${formatString(moveIn.signed_lease)}"`,
                            `"${formatDate(moveIn.lease_signing_date)}"`,
                            `"${formatDate(moveIn.move_in_date)}"`,
                            `"${formatString(moveIn.paid_security_deposit_first_month_rent)}"`,
                            `"${formatDate(moveIn.scheduled_paid_time)}"`,
                            `"${formatString(moveIn.handled_keys)}"`,
                            `"${formatDate(moveIn.move_in_form_sent_date)}"`,
                            `"${formatString(moveIn.filled_move_in_form)}"`,
                            `"${formatDate(moveIn.date_of_move_in_form_filled)}"`,
                            `"${formatString(moveIn.submitted_insurance)}"`,
                            `"${formatDate(moveIn.date_of_insurance_expiration)}"`,
                            `"${formatDate(moveIn.last_notice_sent)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-in row:', moveIn, rowError);
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

interface Props {
    moveIns: {
        data: MoveIn[];
        links: any[];
        meta: any;
    };
    filters: {
        city?: string;
        property?: string;
        unit?: string;
        is_hidden?: string | boolean; // ✅ NEW
        perPage?: string;
        page?: number;
    };
    units: Unit[];
    cities: City[];
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, Array<{ id: number; unit_name: string }>>;
}

export default function Index({ moveIns, filters, units, cities, properties, unitsByProperty }: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveIn, setSelectedMoveIn] = useState<MoveIn | null>(null);

    // ✅ Filters (include hidden)
    const [currentFilters, setCurrentFilters] = useState({
        city: filters?.city || '',
        property: filters?.property || '',
        unit: filters?.unit || '',
        is_hidden: String(filters?.is_hidden).toLowerCase() === 'true' || filters?.is_hidden === true, // ✅
    });

    // Pagination state
    const [currentPerPage, setCurrentPerPage] = useState<string>(filters?.perPage || '15');
    const [currentPage, setCurrentPage] = useState<number>(filters?.page || 1);

    // Update filters when props change
    useEffect(() => {
        setCurrentFilters({
            city: filters?.city || '',
            property: filters?.property || '',
            unit: filters?.unit || '',
            is_hidden: String(filters?.is_hidden).toLowerCase() === 'true' || filters?.is_hidden === true,
        });
        setCurrentPerPage(filters?.perPage || '15');
        setCurrentPage(filters?.page || 1);
    }, [filters]);

    const { hasPermission, hasAnyPermission } = usePermissions();

    // ✅ helper to build query params consistently
    const buildParams = (overrides: Partial<{ perPage: string; page: number }> = {}) => {
        const params: any = {};

        if (currentFilters.city?.trim()) params.city = currentFilters.city.trim();
        if (currentFilters.property?.trim()) params.property = currentFilters.property.trim();
        if (currentFilters.unit?.trim()) params.unit = currentFilters.unit.trim();

        // only send when true
        if (currentFilters.is_hidden) params.is_hidden = 'true';

        params.perPage = overrides.perPage ?? currentPerPage;
        params.page = overrides.page ?? currentPage;

        return params;
    };

    const handleSearch = (newFilters: { city: string; property: string; unit: string; is_hidden: boolean }) => {
        setCurrentFilters(newFilters);

        const params: any = {};
        if (newFilters.city?.trim()) params.city = newFilters.city.trim();
        if (newFilters.property?.trim()) params.property = newFilters.property.trim();
        if (newFilters.unit?.trim()) params.unit = newFilters.unit.trim();
        if (newFilters.is_hidden) params.is_hidden = 'true';

        params.perPage = currentPerPage;
        params.page = 1;

        router.get(route('move-in.index'), params, { preserveState: true, preserveScroll: true });
    };

    const handleClearFilters = () => {
        const clearedFilters = { city: '', property: '', unit: '', is_hidden: false };
        setCurrentFilters(clearedFilters);

        router.get(route('move-in.index'), { perPage: currentPerPage, page: 1 }, { preserveState: true, preserveScroll: true });
    };

    const handlePerPageChange = (newPerPage: string) => {
        setCurrentPerPage(newPerPage);

        router.get(route('move-in.index'), buildParams({ perPage: newPerPage, page: 1 }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);

        router.get(route('move-in.index'), buildParams({ page: newPage }), {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = (moveIn: MoveIn) => {
        if (!confirm('Are you sure you want to delete this move-in record?')) return;

        const params = buildParams();
        const baseUrl = route('move-in.destroy', moveIn.id);
        const urlWithQuery = `${baseUrl}?${new URLSearchParams(
            Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
                if (v === undefined || v === null || v === '') return acc;
                acc[k] = String(v);
                return acc;
            }, {}),
        ).toString()}`;

        router.delete(urlWithQuery, { preserveState: true, preserveScroll: true });
    };

    // ✅ Hide / Unhide
    const handleHide = (moveIn: MoveIn) => {
        if (!confirm('Are you sure you want to hide this move-in record?')) return;

        const params = buildParams();
        const baseUrl = route('move-in.hide', moveIn.id);
        const urlWithQuery = `${baseUrl}?${new URLSearchParams(
            Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
                if (v === undefined || v === null || v === '') return acc;
                acc[k] = String(v);
                return acc;
            }, {}),
        ).toString()}`;

        router.patch(urlWithQuery, {}, { preserveState: true, preserveScroll: true });
    };

    const handleUnhide = (moveIn: MoveIn) => {
        if (!confirm('Are you sure you want to unhide this move-in record?')) return;

        const params = buildParams();
        const baseUrl = route('move-in.unhide', moveIn.id);
        const urlWithQuery = `${baseUrl}?${new URLSearchParams(
            Object.entries(params).reduce((acc: Record<string, string>, [k, v]) => {
                if (v === undefined || v === null || v === '') return acc;
                acc[k] = String(v);
                return acc;
            }, {}),
        ).toString()}`;

        router.patch(urlWithQuery, {}, { preserveState: true, preserveScroll: true });
    };

    const handleCSVExport = () => {
        if (!moveIns || !moveIns.data || moveIns.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `move-ins-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveIns.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            alert(`Export failed: ${errorMessage}. Please check the console for details.`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => router.reload();
    const handleEditDrawerSuccess = () => router.reload();

    const handleEdit = (moveIn: MoveIn) => {
        setSelectedMoveIn(moveIn);
        setIsEditDrawerOpen(true);
    };

    const hasActiveFilters =
        !!currentFilters.city || !!currentFilters.property || !!currentFilters.unit || !!currentFilters.is_hidden;

    // ✅ permission gate for hide/unhide (adjust to your permissions list)
    const canHide = hasAnyPermission(['move-in.hide', 'move-in.unhide', 'move-in.update']);

    return (
        <AppLayout>
            <Head title="Move-In Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        hasActiveFilters={!!hasActiveFilters}
                        isExporting={isExporting}
                        hasData={moveIns?.data && moveIns.data.length > 0}
                        hasCreatePermission={hasPermission('move-in.store')}
                        onExport={handleCSVExport}
                        onCreateClick={() => setIsDrawerOpen(true)}
                    />

                    {/* Filters Card */}
                    <Card className="bg-card text-card-foreground shadow-lg mb-6">
                        <MoveInFilters
                            cities={cities}
                            properties={properties}
                            units={units}
                            initialFilters={currentFilters}
                            onSearch={handleSearch}
                            onClear={handleClearFilters}
                            hasActiveFilters={!!hasActiveFilters}
                        />
                    </Card>

                    {/* Table Card */}
                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardContent>
                            <MoveInTable
                                moveIns={moveIns.data}
                                canEdit={hasPermission('move-in.update')}
                                canDelete={hasPermission('move-in.destroy')}
                                canHide={canHide}
                                showActions={hasAnyPermission([
                                    'move-in.show',
                                    'move-in.edit',
                                    'move-in.update',
                                    'move-in.destroy',
                                    'move-in.hide',
                                    'move-in.unhide',
                                ])}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onHide={handleHide}
                                onUnhide={handleUnhide}
                            />

                            {/* Table Footer Pagination Controls */}
                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Rows per page:</span>
                                    <select
                                        className="border rounded px-2 py-1 bg-background text-foreground"
                                        value={currentPerPage}
                                        onChange={(e) => handlePerPageChange(e.target.value)}
                                    >
                                        <option value="15">15</option>
                                        <option value="30">30</option>
                                        <option value="50">50</option>
                                        <option value="all">All</option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-4">
                                    {currentPerPage !== 'all' && moveIns?.meta ? (
                                        <>
                                            <span className="text-sm">
                                                Page {moveIns.meta?.current_page ?? 1} of {moveIns.meta?.last_page ?? 1}
                                            </span>
                                            <button
                                                className="px-3 py-1 border rounded disabled:opacity-50"
                                                disabled={(moveIns.meta?.current_page ?? 1) <= 1}
                                                onClick={() => handlePageChange((moveIns.meta?.current_page ?? 1) - 1)}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                className="px-3 py-1 border rounded disabled:opacity-50"
                                                disabled={(moveIns.meta?.current_page ?? 1) >= (moveIns.meta?.last_page ?? 1)}
                                                onClick={() => handlePageChange((moveIns.meta?.current_page ?? 1) + 1)}
                                            >
                                                Next
                                            </button>
                                        </>
                                    ) : (
                                        <span className="text-sm">Showing all {moveIns?.data?.length ?? 0} records</span>
                                    )}
                                </div>
                            </div>

                            {moveIns.data.length === 0 && <EmptyState hasActiveFilters={!!hasActiveFilters} />}

                            {moveIns.meta && (
                                <PaginationInfo
                                    from={moveIns.meta.from}
                                    to={moveIns.meta.to}
                                    total={moveIns.meta.total}
                                    hasActiveFilters={!!hasActiveFilters}
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Move-In Create Drawer */}
            <MoveInCreateDrawer
                units={units}
                cities={cities}
                properties={properties}
                unitsByProperty={unitsByProperty}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
                currentFilters={currentFilters}
                currentPerPage={currentPerPage}
                currentPage={currentPage}
            />

            {/* Move-In Edit Drawer */}
            {selectedMoveIn && (
                <MoveInEditDrawer
                    moveIn={selectedMoveIn}
                    units={units}
                    cities={cities}
                    properties={properties}
                    unitsByProperty={unitsByProperty}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                    currentFilters={currentFilters}
                    currentPerPage={currentPerPage}
                    currentPage={currentPage}
                />
            )}
        </AppLayout>
    );
}
