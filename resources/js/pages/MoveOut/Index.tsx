import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { MoveOut } from '@/types/move-out';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import MoveOutCreateDrawer from './MoveOutCreateDrawer';
import MoveOutEditDrawer from './MoveOutEditDrawer';
import MoveOutEmptyState from './index/MoveOutEmptyState';
import MoveOutFilters from './index/MoveOutFilters';
import MoveOutPageHeader from './index/MoveOutPageHeader';
import MoveOutPagination from './index/MoveOutPagination';
import MoveOutTable from './index/MoveOutTable';

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;
    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const formatDateForInput = (value?: string | null): string => {
    if (!value) return '';
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return '';
    const [, y, mo, d] = m;
    return `${y}-${mo}-${d}`;
};

const exportToCSV = (data: MoveOut[], filename: string = 'move-outs.csv') => {
    try {
        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const headers = [
            'ID',
            'City Name',
            'Property Name',
            'Unit Name',
            'Tenants',
            'Move Out Date',
            'Lease Status',
            'Lease Ending on Buildium',
            'Keys Location',
            'Utilities Under Our Name',
            'Date Utility Put Under Our Name',
            'Walkthrough',
            'All The Devices Are Off',
            'Repairs',
            'Send Back Security Deposit',
            'Notes',
            'Cleaning',
            'List the Unit',
            'Renter',
            'Move Out Form',
            'Utility Type',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((moveOut) => {
                    try {
                        return [
                            moveOut.id || '',
                            `"${formatString(moveOut.city_name)}"`,
                            `"${formatString(moveOut.property_name)}"`,
                            `"${formatString(moveOut.unit_name)}"`,
                            `"${formatString(moveOut.tenants)}"`,
                            `"${formatDateOnly(moveOut.move_out_date, '')}"`,
                            `"${formatString(moveOut.lease_status)}"`,
                            `"${formatDateOnly(moveOut.date_lease_ending_on_buildium, '')}"`,
                            `"${formatString(moveOut.keys_location)}"`,
                            `"${formatString(moveOut.utilities_under_our_name)}"`,
                            `"${formatDateOnly(moveOut.date_utility_put_under_our_name, '')}"`,
                            `"${formatString(moveOut.walkthrough)}"`,
                            `"${formatString(moveOut.all_the_devices_are_off)}"`,
                            `"${formatString(moveOut.repairs)}"`,
                            `"${formatString(moveOut.send_back_security_deposit)}"`,
                            `"${formatString(moveOut.notes)}"`,
                            `"${formatString(moveOut.cleaning)}"`,
                            `"${formatString(moveOut.list_the_unit)}"`,
                            `"${formatString(moveOut.renter)}"`,
                            `"${formatString(moveOut.move_out_form)}"`,
                            `"${formatString(moveOut.utility_type)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing move-out row:', moveOut, rowError);
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
    moveOuts: {
        data: MoveOut[];
        links: any[];
        meta: any;
    };
    unit?: string | null;
    cities: any[];
    properties: any[];
    propertiesByCityId: Record<number, any[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    filterCities: string[];
    filterProperties: string[];
    filterUnits: string[];
    perPage?: string;

    // ✅ NEW
    filters?: {
        city?: string | null;
        property?: string | null;
        unit?: string | null;
        is_hidden?: string | boolean | null;
    };
}

export default function Index({
    moveOuts,
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    allUnits,
    filterCities,
    filterProperties,
    filterUnits,
    perPage: perPageProp,
    filters,
}: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedMoveOut, setSelectedMoveOut] = useState<MoveOut | null>(null);
    const [perPage, setPerPage] = useState<string>(perPageProp ?? '15');

    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();

    // ✅ include is_hidden
    const currentFilters = {
        city: params.get('city') || (filters?.city ?? undefined) || undefined,
        property: params.get('property') || (filters?.property ?? undefined) || undefined,
        unit: params.get('unit') || (filters?.unit ?? undefined) || undefined,
        is_hidden:
            (params.get('is_hidden') || '').toLowerCase() === 'true' ||
            String(filters?.is_hidden ?? '').toLowerCase() === 'true' ||
            filters?.is_hidden === true,
    };

    const currentPage = moveOuts?.meta?.current_page ?? 1;

    // ✅ helper for consistent query params
    const buildParams = (overrides: Partial<{ page: number; perPage: string }> = {}) => {
        const p: any = {};

        if (currentFilters.city) p.city = currentFilters.city;
        if (currentFilters.property) p.property = currentFilters.property;
        if (currentFilters.unit) p.unit = currentFilters.unit;

        if (currentFilters.is_hidden) p.is_hidden = 'true';

        p.perPage = overrides.perPage ?? perPage;
        p.page = overrides.page ?? currentPage;

        return p;
    };

    const handleSearch = (f: { city_id: string | null; property_id: string | null; unit_id: string | null; is_hidden: boolean }) => {
        const p: any = {};
        if (f.city_id) p.city = f.city_id;
        if (f.property_id) p.property = f.property_id;
        if (f.unit_id) p.unit = f.unit_id;
        if (f.is_hidden) p.is_hidden = 'true';

        p.perPage = perPage;
        p.page = 1;

        router.get(route('move-out.index'), p, { preserveState: true, preserveScroll: true });
    };

    const handleClearFilters = () => {
        router.get(route('move-out.index'), { perPage, page: 1 }, { preserveState: false, preserveScroll: true });
    };

    const handleDelete = (moveOut: MoveOut) => {
        if (confirm('Are you sure you want to delete this move-out record?')) {
            router.delete(route('move-out.destroy', moveOut.id), {
                data: {
                    redirect_city: currentFilters.city ?? null,
                    redirect_property: currentFilters.property ?? null,
                    redirect_unit: currentFilters.unit ?? null,
                    redirect_page: String(currentPage),
                    redirect_perPage: perPage,

                    // ✅ NEW
                    redirect_is_hidden: currentFilters.is_hidden ? 'true' : '',
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);

        router.get(
            route('move-out.index'),
            {
                ...buildParams({ perPage: value, page: 1 }),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCSVExport = () => {
        if (!moveOuts || !moveOuts.data || moveOuts.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);

        try {
            const filename = `move-outs-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(moveOuts.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleDrawerSuccess = () => router.reload();
    const handleEditDrawerSuccess = () => router.reload();

    const handleEditClick = (moveOut: MoveOut) => {
        setSelectedMoveOut(moveOut);
        setIsEditDrawerOpen(true);
    };

    const handleHide = (moveOut: MoveOut) => {
        if (!confirm('Are you sure you want to hide this move-out record?')) return;

        const baseUrl = route('move-out.hide', moveOut.id);
        const urlWithQuery = `${baseUrl}?${new URLSearchParams(
            Object.entries(buildParams()).reduce((acc: Record<string, string>, [k, v]) => {
                if (v === undefined || v === null || v === '') return acc;
                acc[k] = String(v);
                return acc;
            }, {}),
        ).toString()}`;

        router.patch(urlWithQuery, {}, { preserveState: true, preserveScroll: true });
    };

    const handleUnhide = (moveOut: MoveOut) => {
        if (!confirm('Are you sure you want to unhide this move-out record?')) return;

        const baseUrl = route('move-out.unhide', moveOut.id);
        const urlWithQuery = `${baseUrl}?${new URLSearchParams(
            Object.entries(buildParams()).reduce((acc: Record<string, string>, [k, v]) => {
                if (v === undefined || v === null || v === '') return acc;
                acc[k] = String(v);
                return acc;
            }, {}),
        ).toString()}`;

        router.patch(urlWithQuery, {}, { preserveState: true, preserveScroll: true });
    };

    return (
        <AppLayout>
            <Head title="Move-Out Management" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <MoveOutPageHeader
                        hasCreatePermission={hasAllPermissions(['move-out.create', 'move-out.store'])}
                        isExporting={isExporting}
                        hasData={moveOuts?.data && moveOuts.data.length > 0}
                        onExport={handleCSVExport}
                        onAddNew={() => setIsDrawerOpen(true)}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <MoveOutFilters
                                cities={filterCities}
                                properties={filterProperties}
                                allUnits={filterUnits}
                                initialFilters={{
                                    city: currentFilters.city ?? '',
                                    property: currentFilters.property ?? '',
                                    unit: currentFilters.unit ?? '',
                                    is_hidden: currentFilters.is_hidden,
                                }}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {moveOuts.data.length > 0 ? (
                                <>
                                    <MoveOutTable
                                        moveOuts={moveOuts.data}
                                        formatDateOnly={formatDateOnly}
                                        hasPermission={hasPermission}
                                        hasAnyPermission={hasAnyPermission}
                                        hasAllPermissions={hasAllPermissions}
                                        onHide={handleHide}
                                        onUnhide={handleUnhide}
                                        onEdit={handleEditClick}
                                        onDelete={handleDelete}
                                        filters={{
                                            city: currentFilters.city ?? undefined,
                                            property: currentFilters.property ?? undefined,
                                            unit: currentFilters.unit ?? undefined,
                                            is_hidden: currentFilters.is_hidden ? 'true' : undefined,
                                            perPage,
                                        }}
                                    />

                                    {moveOuts.meta && (
                                        <MoveOutPagination
                                            meta={moveOuts.meta}
                                            perPage={perPage}
                                            onPageChange={(page) => {
                                                router.get(route('move-out.index'), buildParams({ page }), {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                });
                                            }}
                                        />
                                    )}

                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <span className="text-sm text-muted-foreground">Rows per page</span>
                                        <select
                                            value={perPage}
                                            onChange={(e) => handlePerPageChange(e.target.value)}
                                            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                        >
                                            <option value="15">15</option>
                                            <option value="30">30</option>
                                            <option value="50">50</option>
                                            <option value="all">All</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <MoveOutEmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <MoveOutCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                allUnits={allUnits}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
                redirectContext={{
                    city: currentFilters.city ?? null,
                    property: currentFilters.property ?? null,
                    unit: currentFilters.unit ?? null,
                    page: String(currentPage),
                    perPage,

                }}
            />

            {selectedMoveOut && (
                <MoveOutEditDrawer
                    key={selectedMoveOut.id}
                    cities={cities}
                    properties={properties}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    allUnits={allUnits}
                    moveOut={{
                        ...selectedMoveOut,
                        move_out_date: formatDateForInput(selectedMoveOut.move_out_date),
                        date_lease_ending_on_buildium: formatDateForInput(selectedMoveOut.date_lease_ending_on_buildium),
                        date_utility_put_under_our_name: formatDateForInput(selectedMoveOut.date_utility_put_under_our_name),
                    }}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                    redirectContext={{
                        city: currentFilters.city ?? null,
                        property: currentFilters.property ?? null,
                        unit: currentFilters.unit ?? null,
                        page: String(currentPage),
                        perPage,
                    }}
                />
            )}
        </AppLayout>
    );
}
