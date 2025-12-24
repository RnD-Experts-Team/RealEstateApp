import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Head, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useState } from 'react';
import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import PageHeader from './index/PageHeader';
import PaginationInfo from './index/PaginationInfo';
import TaskTable from './index/TaskTable';
import VendorTaskTrackerCreateDrawer from './VendorTaskTrackerCreateDrawer';
import VendorTaskTrackerEditDrawer from './VendorTaskTrackerEditDrawer';

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const exportToCSV = (data: VendorTaskTracker[], filename: string = 'vendor-tasks.csv') => {
    const headers = [
        'ID',
        'City',
        'Property',
        'Unit Name',
        'Vendor Name',
        'Submission Date',
        'Assigned Tasks',
        'Scheduled Visits',
        'Task End Date',
        'Notes',
        'Status',
        'Urgent',
    ];

    const csvData = [
        headers.join(','),
        ...data.map((task) => {
            return [
                task.id,
                `"${task.city || ''}"`,
                `"${task.property_name || ''}"`,
                `"${task.unit_name || ''}"`,
                `"${task.vendor_name || ''}"`,
                `"${formatDateOnly(task.task_submission_date, '')}"`,
                `"${(task.assigned_tasks || '').replace(/"/g, '""')}"`,
                `"${formatDateOnly(task.any_scheduled_visits, '')}"`,
                `"${formatDateOnly(task.task_ending_date, '')}"`,
                `"${(task.notes || '').replace(/"/g, '""')}"`,
                `"${task.status || ''}"`,
                `"${task.urgent}"`,
            ].join(',');
        }),
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
    tasks: {
        data: VendorTaskTracker[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
        is_hidden?: string | boolean; // ✅ NEW
        per_page?: string;
        page?: number;
    };
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    drawerCities: CityOption[];
    drawerProperties: PropertyOption[];
    drawerUnits: UnitOption[];
    drawerVendors: VendorOption[];
    drawerUnitsByCity: Record<string, UnitOption[]>;
    drawerPropertiesByCity: Record<string, PropertyOption[]>;
    drawerUnitsByProperty: Record<string, Record<string, UnitOption[]>>;
    drawerVendorsByCity: Record<string, VendorOption[]>;
}

export default function Index({
    tasks,
    filters,
    units,
    cities,
    properties,
    vendors,
    drawerCities,
    drawerProperties,
    drawerUnits,
    drawerVendors,
    drawerUnitsByCity,
    drawerPropertiesByCity,
    drawerUnitsByProperty,
    drawerVendorsByCity,
}: Props) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const [isExporting, setIsExporting] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<VendorTaskTracker | null>(null);

    const handleDrawerSuccess = () => setIsDrawerOpen(false);

    const handleEditDrawerSuccess = () => {
        setIsEditDrawerOpen(false);
        setSelectedTask(null);
    };

    const handleEditTask = (task: VendorTaskTracker) => {
        setSelectedTask(task);
        setIsEditDrawerOpen(true);
    };

    const handleDelete = (task: VendorTaskTracker) => {
        if (confirm('Are you sure you want to archive this task?')) {
            const currentFilters: Record<string, string> = {};
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    currentFilters[key] = String(value);
                }
            });

            router.delete(route('vendor-task-tracker.destroy', task.id), {
                data: { redirect_filters: currentFilters },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const handleCSVExport = () => {
        if (tasks.data.length === 0) {
            alert('No data to export');
            return;
        }

        setIsExporting(true);
        try {
            const filename = `vendor-tasks-${new Date().toISOString().split('T')[0]}.csv`;
            exportToCSV(tasks.data, filename);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleSearch = (searchFilters: any) => {
        const filterParams: Record<string, string> = {};
        Object.entries(searchFilters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                filterParams[key] = String(value);
            }
        });

        if (filters.per_page && filters.per_page !== '') {
            filterParams['per_page'] = String(filters.per_page);
        }

        filterParams['page'] = '1';

        router.get(route('vendor-task-tracker.index'), filterParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleClearFilters = () => {
        const params: Record<string, string> = {};
        if (filters.per_page && filters.per_page !== '') {
            params['per_page'] = String(filters.per_page);
        }
        params['page'] = '1';

        router.get(route('vendor-task-tracker.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const permissions = {
        canView: hasPermission('vendor-task-tracker.show'),
        canEdit: hasAllPermissions(['vendor-task-tracker.edit', 'vendor-task-tracker.update']),
        canDelete: hasPermission('vendor-task-tracker.destroy'),
        hasAnyPermission: hasAnyPermission([
            'vendor-task-tracker.show',
            'vendor-task-tracker.edit',
            'vendor-task-tracker.update',
            'vendor-task-tracker.destroy',
        ]),
    };

    return (
        <AppLayout>
            <Head title="Vendor Task Tracker" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader
                        onExport={handleCSVExport}
                        onAddTask={() => setIsDrawerOpen(true)}
                        isExporting={isExporting}
                        hasExportData={tasks.data.length > 0}
                        canCreate={hasAllPermissions(['vendor-task-tracker.create', 'vendor-task-tracker.store'])}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader>
                            <FilterBar
                                filters={filters}
                                cities={cities}
                                properties={properties}
                                units={units}
                                vendors={vendors}
                                onSearch={handleSearch}
                                onClear={handleClearFilters}
                            />
                        </CardHeader>

                        <CardContent>
                            {tasks.data.length > 0 ? (
                                <>
                                    <TaskTable
                                        tasks={tasks.data}
                                        formatDateOnly={formatDateOnly}
                                        onEdit={handleEditTask}
                                        onDelete={handleDelete}
                                        permissions={permissions}
                                        filters={filters}
                                    />
                                    <PaginationInfo meta={tasks.meta} />

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm">Per page:</span>
                                            <select
                                                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                                                value={filters.per_page ?? '15'}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    const params: Record<string, string> = {};
                                                    Object.entries(filters).forEach(([key, value]) => {
                                                        if (value !== null && value !== undefined && value !== '') {
                                                            params[key] = String(value);
                                                        }
                                                    });
                                                    params['per_page'] = value;
                                                    params['page'] = '1';
                                                    router.get(route('vendor-task-tracker.index'), params, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                <option value="15">15</option>
                                                <option value="30">30</option>
                                                <option value="50">50</option>
                                                <option value="all">All</option>
                                            </select>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button
                                                className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                                disabled={(filters.per_page ?? '15') === 'all' || (tasks.meta?.current_page ?? 1) <= 1}
                                                onClick={() => {
                                                    const current = Number(tasks.meta?.current_page ?? 1);
                                                    const target = current - 1;
                                                    const params: Record<string, string> = {};
                                                    Object.entries(filters).forEach(([key, value]) => {
                                                        if (value !== null && value !== undefined && value !== '') {
                                                            params[key] = String(value);
                                                        }
                                                    });
                                                    params['page'] = String(target);
                                                    router.get(route('vendor-task-tracker.index'), params, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Previous
                                            </button>

                                            <span className="text-sm">
                                                Page {tasks.meta?.current_page ?? 1} of {tasks.meta?.last_page ?? 1}
                                            </span>

                                            <button
                                                className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                                disabled={(filters.per_page ?? '15') === 'all' || (tasks.meta?.current_page ?? 1) >= (tasks.meta?.last_page ?? 1)}
                                                onClick={() => {
                                                    const current = Number(tasks.meta?.current_page ?? 1);
                                                    const target = current + 1;
                                                    const params: Record<string, string> = {};
                                                    Object.entries(filters).forEach(([key, value]) => {
                                                        if (value !== null && value !== undefined && value !== '') {
                                                            params[key] = String(value);
                                                        }
                                                    });
                                                    params['page'] = String(target);
                                                    router.get(route('vendor-task-tracker.index'), params, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                    });
                                                }}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <EmptyState />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <VendorTaskTrackerCreateDrawer
                cities={drawerCities}
                properties={drawerProperties}
                units={drawerUnits}
                vendors={drawerVendors}
                unitsByCity={drawerUnitsByCity}
                propertiesByCity={drawerPropertiesByCity}
                unitsByProperty={drawerUnitsByProperty}
                vendorsByCity={drawerVendorsByCity}
                filters={filters}
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                onSuccess={handleDrawerSuccess}
            />

            {selectedTask && (
                <VendorTaskTrackerEditDrawer
                    task={selectedTask}
                    cities={drawerCities}
                    properties={drawerProperties}
                    units={drawerUnits}
                    vendors={drawerVendors}
                    unitsByCity={drawerUnitsByCity}
                    propertiesByCity={drawerPropertiesByCity}
                    unitsByProperty={drawerUnitsByProperty}
                    vendorsByCity={drawerVendorsByCity}
                    filters={filters}
                    open={isEditDrawerOpen}
                    onOpenChange={setIsEditDrawerOpen}
                    onSuccess={handleEditDrawerSuccess}
                />
            )}
        </AppLayout>
    );
}
