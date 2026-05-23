import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import { format } from 'date-fns';
import { useMemo, useState } from 'react';

import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import PageHeader from './index/PageHeader';
import PaginationInfo from './index/PaginationInfo';
import ToursTable from './index/ToursTable';
import RepresentativePopover from './RepresentativePopover';
import TourDrawer from './TourDrawer';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city_id: number;
    city?: {
        id: number;
        city: string;
    } | null;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_id: number;
    property?: {
        id: number;
        property_name: string;
        city?: {
            id: number;
            city: string;
        } | null;
    } | null;
}

interface Representative {
    id: number;
    name: string;
    deleted_at?: string | null;
}

interface Tour {
    id: number;
    prospect: string;
    phone: string;
    email?: string | null;
    date: string;
    time: string;
    note?: string | null;
    is_hidden: boolean;
    confirmed: boolean;
    unit?: {
        id: number;
        unit_name?: string | null;
        property?: {
            id: number;
            property_name?: string | null;
            city?: {
                id: number;
                city?: string | null;
            } | null;
        } | null;
    } | null;
    representative?: Representative | null;
}

interface Props {
    tours: {
        data: Tour[];
        meta: {
            from?: number;
            to?: number;
            total?: number;
            current_page?: number;
            last_page?: number;
        };
        links?: any[];
    };
    filters: {
        representative_id?: string;
        city_id?: string;
        property_id?: string;
        unit_id?: string;
        date?: string;
        is_hidden?: string | boolean;
        confirmed?: string | boolean;
        prospect?: string;
        page?: number;
    };
    representatives: Representative[];
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
}

type PendingAction = { type: 'delete'; tour: Tour } | { type: 'hide'; tour: Tour } | { type: 'unhide'; tour: Tour } | null;

const formatDateOnly = (value?: string | null, fallback = '-') => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    return format(new Date(Number(y), Number(mo) - 1, Number(d)), 'P');
};

const formatTimeOnly = (value?: string | null, fallback = '-') => {
    if (!value) return fallback;

    const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
    if (!match) return value;

    const [, hh, mm] = match;
    const h = Number(hh);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const normalized = h % 12 || 12;

    return `${normalized}:${mm} ${suffix}`;
};

export default function Index({ tours, filters, representatives, cities, properties, units }: Props) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.user?.permissions || [];

    const canCreate = permissions.includes('tour.create');
    const canEdit = permissions.includes('tour.edit');
    const canDelete = permissions.includes('tour.destroy');

    const repCreate = permissions.includes('representative.create');
    const repEdit = permissions.includes('representative.edit');
    const repDestroy = permissions.includes('representative.destroy');

    const hasAnyRepPermission = repCreate || repEdit || repDestroy;
    const hasAnyTourActionPermission = canEdit || canDelete;

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const activeFilters = useMemo(() => {
        return !!(
            filters.representative_id ||
            filters.city_id ||
            filters.property_id ||
            filters.unit_id ||
            filters.date ||
            filters.prospect ||
            String(filters.is_hidden).toLowerCase() === 'true'
        );
    }, [filters]);

    const handleCreate = () => {
        setSelectedTour(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (tour: Tour) => {
        setSelectedTour(tour);
        setIsDrawerOpen(true);
    };

    const handleDelete = (tour: Tour) => {
        setPendingAction({ type: 'delete', tour });
    };

    const handleHide = (tour: Tour) => {
        setPendingAction({ type: 'hide', tour });
    };

    const handleUnhide = (tour: Tour) => {
        setPendingAction({ type: 'unhide', tour });
    };

    const confirmPendingAction = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'delete') {
            router.delete(route('tours.destroy', pendingAction.tour.id), {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            });
            return;
        }

        if (pendingAction.type === 'hide') {
            router.post(
                route('tours.hide', pendingAction.tour.id),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setPendingAction(null),
                },
            );
            return;
        }

        if (pendingAction.type === 'unhide') {
            router.post(
                route('tours.unhide', pendingAction.tour.id),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setPendingAction(null),
                },
            );
        }
    };

    const handleSearch = (payload: Record<string, string>) => {
        router.get(route('tours.index'), payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClear = () => {
        router.get(
            route('tours.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const exportToCSV = (data: Tour[], filename: string = 'tours.csv') => {
        const headers = [
            'ID',
            'City',
            'Property',
            'Unit',
            'Representative',
            'Prospect',
            'Phone',
            'Email',
            'Date',
            'Time',
            'Note',
            'Confirmed',
            'Visibility'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(tour => [
                tour.id,
                `"${tour.unit?.property?.city?.city || 'N/A'}"`,
                `"${tour.unit?.property?.property_name || 'N/A'}"`,
                `"${tour.unit?.unit_name || 'N/A'}"`,
                `"${tour.representative?.name || 'N/A'}"`,
                `"${tour.prospect || ''}"`,
                `"${tour.phone || ''}"`,
                `"${tour.email || ''}"`,
                `"${formatDateOnly(tour.date)}"`,
                `"${formatTimeOnly(tour.time)}"`,
                `"${(tour.note || '').replace(/"/g, '""')}"`,
                tour.confirmed ? 'Yes' : 'No',
                tour.is_hidden ? 'Hidden' : 'Visible'
            ].join(','))
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
    };

    const handleCSVExport = () => {
        if (tours.data.length === 0) {
            alert('No data to export');
            return;
        }
        const filename = `tours-${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(tours.data, filename);
    };

    const getDialogCopy = () => {
        if (!pendingAction) {
            return {
                title: '',
                description: '',
                actionLabel: 'Confirm',
            };
        }

        if (pendingAction.type === 'delete') {
            return {
                title: 'Delete tour?',
                description: `This will permanently delete the tour for ${pendingAction.tour.prospect}.`,
                actionLabel: 'Delete',
            };
        }

        if (pendingAction.type === 'hide') {
            return {
                title: 'Hide tour?',
                description: `This will hide the tour for ${pendingAction.tour.prospect} from the visible list.`,
                actionLabel: 'Hide',
            };
        }

        return {
            title: 'Unhide tour?',
            description: `This will make the tour for ${pendingAction.tour.prospect} visible again.`,
            actionLabel: 'Unhide',
        };
    };

    const dialogCopy = getDialogCopy();

    return (
        <AppLayout>
            <Head title="Tours" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        canCreate={canCreate}
                        onAddTour={handleCreate}
                        onExport={handleCSVExport}
                        hasActiveFilters={activeFilters}
                        hasExportData={tours.data.length > 0}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader className="space-y-6">
                            <FilterBar
                                filters={filters}
                                representatives={representatives}
                                cities={cities}
                                properties={properties}
                                units={units}
                                onSearch={handleSearch}
                                onClear={handleClear}
                            />

                            {hasAnyRepPermission && (
                                <div className="flex justify-start sm:justify-end">
                                    <RepresentativePopover
                                        reps={representatives}
                                        canCreate={repCreate}
                                        canEdit={repEdit}
                                        canDestroy={repDestroy}
                                        onRepUpdated={() =>
                                            router.reload({
                                                only: ['representatives', 'tours'],
                                            })
                                        }
                                    />
                                </div>
                            )}
                        </CardHeader>

                        <CardContent>
                            {tours.data.length > 0 ? (
                                <>
                                    <ToursTable
                                        tours={tours.data}
                                        formatDateOnly={formatDateOnly}
                                        formatTimeOnly={formatTimeOnly}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onHide={handleHide}
                                        onUnhide={handleUnhide}
                                        permissions={{
                                            canEdit,
                                            canDelete,
                                            hasAnyPermission: hasAnyTourActionPermission,
                                        }}
                                    />

                                    <PaginationInfo meta={tours.meta} />

                                    <div className="mt-4 flex items-center justify-end gap-3">
                                        <button
                                            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                            disabled={(tours.meta?.current_page ?? 1) <= 1}
                                            onClick={() => {
                                                router.get(
                                                    route('tours.index'),
                                                    {
                                                        ...filters,
                                                        page: (tours.meta?.current_page ?? 1) - 1,
                                                    },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true,
                                                    },
                                                );
                                            }}
                                        >
                                            Previous
                                        </button>

                                        <span className="text-sm">
                                            Page {tours.meta?.current_page ?? 1} of {tours.meta?.last_page ?? 1}
                                        </span>

                                        <button
                                            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                            disabled={(tours.meta?.current_page ?? 1) >= (tours.meta?.last_page ?? 1)}
                                            onClick={() => {
                                                router.get(
                                                    route('tours.index'),
                                                    {
                                                        ...filters,
                                                        page: (tours.meta?.current_page ?? 1) + 1,
                                                    },
                                                    {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        replace: true,
                                                    },
                                                );
                                            }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <TourDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                tour={selectedTour}
                representatives={representatives}
                cities={cities}
                properties={properties}
                units={units}
            />

            <AlertDialog
                open={!!pendingAction}
                onOpenChange={(open) => {
                    if (!open) setPendingAction(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogCopy.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialogCopy.description}</AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmPendingAction}>{dialogCopy.actionLabel}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
