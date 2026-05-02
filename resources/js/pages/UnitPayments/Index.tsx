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

import PaymentDrawer from './PaymentDrawer';
import EmptyState from './index/EmptyState';
import FilterBar from './index/FilterBar';
import PageHeader from './index/PageHeader';
import PaginationInfo from './index/PaginationInfo';
import PaymentsTable from './index/PaymentsTable';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city_id: number;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_id: number;
}

interface Payment {
    id: number;
    unit_id: number;
    type: 'Checks' | 'Credit Card' | 'Zelle';
    amount: string;
    date: string;
    to_whom: string;
    description?: string | null;
    order_id?: string | null;
    is_hidden: boolean;
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
}

interface Props {
    payments: {
        data: Payment[];
        meta: {
            from?: number;
            to?: number;
            total?: number;
            current_page?: number;
            last_page?: number;
        };
    };
    filters: {
        city_id?: string;
        property_id?: string;
        unit_id?: string;
        type?: string;
        date?: string;
        is_hidden?: string | boolean;
    };
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    types: string[];
}

type PendingAction = { type: 'delete'; payment: Payment } | { type: 'hide'; payment: Payment } | { type: 'unhide'; payment: Payment } | null;

const formatDateOnly = (value?: string | null, fallback = '-') => {
    if (!value) return fallback;
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;
    const [, y, mo, d] = m;
    return format(new Date(Number(y), Number(mo) - 1, Number(d)), 'P');
};

const formatMoney = (value?: string | number | null) => {
    if (value === null || value === undefined || value === '') return '-';
    const amount = Number(value);
    if (Number.isNaN(amount)) return '-';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export default function Index({ payments, filters, cities, properties, units, types }: Props) {
    const { auth } = usePage().props as any;
    const permissions: string[] = auth?.user?.permissions || [];

    const canCreate = permissions.includes('reports.create');
    const canEdit = permissions.includes('reports.edit');
    const canDelete = permissions.includes('reports.destroy');

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [pendingAction, setPendingAction] = useState<PendingAction>(null);

    const activeFilters = useMemo(() => {
        return !!(
            filters.city_id ||
            filters.property_id ||
            filters.unit_id ||
            filters.type ||
            filters.date ||
            String(filters.is_hidden).toLowerCase() === 'true'
        );
    }, [filters]);

    const handleCreate = () => {
        setSelectedPayment(null);
        setIsDrawerOpen(true);
    };

    const handleEdit = (payment: Payment) => {
        setSelectedPayment(payment);
        setIsDrawerOpen(true);
    };

    const handleDelete = (payment: Payment) => setPendingAction({ type: 'delete', payment });
    const handleHide = (payment: Payment) => setPendingAction({ type: 'hide', payment });
    const handleUnhide = (payment: Payment) => setPendingAction({ type: 'unhide', payment });

    const confirmPendingAction = () => {
        if (!pendingAction) return;

        if (pendingAction.type === 'delete') {
            router.delete(route('reports.destroy', pendingAction.payment.id), {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            });
            return;
        }

        if (pendingAction.type === 'hide') {
            router.post(
                route('reports.hide', pendingAction.payment.id),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onFinish: () => setPendingAction(null),
                },
            );
            return;
        }

        router.post(
            route('reports.unhide', pendingAction.payment.id),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setPendingAction(null),
            },
        );
    };

    const getDialogCopy = () => {
        if (!pendingAction) {
            return { title: '', description: '', actionLabel: 'Confirm' };
        }

        if (pendingAction.type === 'delete') {
            return {
                title: 'Delete payment?',
                description: `This will permanently delete the payment to ${pendingAction.payment.to_whom}.`,
                actionLabel: 'Delete',
            };
        }

        if (pendingAction.type === 'hide') {
            return {
                title: 'Hide payment?',
                description: `This will hide the payment to ${pendingAction.payment.to_whom} from the visible list.`,
                actionLabel: 'Hide',
            };
        }

        return {
            title: 'Unhide payment?',
            description: `This will make the payment to ${pendingAction.payment.to_whom} visible again.`,
            actionLabel: 'Unhide',
        };
    };

    const dialogCopy = getDialogCopy();

    const handleSearch = (payload: Record<string, string>) => {
        router.get(route('reports.index'), payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleClear = () => {
        router.get(
            route('reports.index'),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    };

    const exportToCSV = (data: Payment[], filename: string = 'payments.csv') => {
        const headers = [
            'ID',
            'City',
            'Property',
            'Unit',
            'Type',
            'Amount',
            'Date',
            'To Whom',
            'Description',
            'Order ID',
            'Visibility'
        ];

        const csvData = [
            headers.join(','),
            ...data.map(payment => [
                payment.id,
                `"${payment.unit?.property?.city?.city || 'N/A'}"`,
                `"${payment.unit?.property?.property_name || 'N/A'}"`,
                `"${payment.unit?.unit_name || 'N/A'}"`,
                `"${payment.type || ''}"`,
                formatMoney(payment.amount),
                `"${formatDateOnly(payment.date)}"`,
                `"${payment.to_whom || ''}"`,
                `"${(payment.description || '').replace(/"/g, '""')}"`,
                `"${payment.order_id || ''}"`,
                payment.is_hidden ? 'Hidden' : 'Visible'
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
        if (payments.data.length === 0) {
            alert('No data to export');
            return;
        }
        const filename = `payments-${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(payments.data, filename);
    };

    return (
        <AppLayout>
            <Head title="Reports" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
                    <PageHeader
                        canCreate={canCreate}
                        onAddPayment={handleCreate}
                        onExport={handleCSVExport}
                        hasActiveFilters={activeFilters}
                        hasExportData={payments.data.length > 0}
                    />

                    <Card className="bg-card text-card-foreground shadow-lg">
                        <CardHeader className="space-y-6">
                            <FilterBar
                                filters={filters}
                                cities={cities}
                                properties={properties}
                                units={units}
                                types={types}
                                onSearch={handleSearch}
                                onClear={handleClear}
                            />
                        </CardHeader>

                        <CardContent>
                            {payments.data.length > 0 ? (
                                <>
                                    <PaymentsTable
                                        payments={payments.data}
                                        formatDateOnly={formatDateOnly}
                                        formatMoney={formatMoney}
                                        onEdit={handleEdit}
                                        onDelete={handleDelete}
                                        onHide={handleHide}
                                        onUnhide={handleUnhide}
                                        permissions={{
                                            canEdit,
                                            canDelete,
                                            hasAnyPermission: canEdit || canDelete,
                                        }}
                                    />

                                    <PaginationInfo meta={payments.meta} />

                                    <div className="mt-4 flex items-center justify-end gap-3">
                                        <button
                                            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                            disabled={(payments.meta?.current_page ?? 1) <= 1}
                                            onClick={() => {
                                                router.get(
                                                    route('reports.index'),
                                                    {
                                                        ...filters,
                                                        page: (payments.meta?.current_page ?? 1) - 1,
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
                                            Page {payments.meta?.current_page ?? 1} of {payments.meta?.last_page ?? 1}
                                        </span>

                                        <button
                                            className="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
                                            disabled={(payments.meta?.current_page ?? 1) >= (payments.meta?.last_page ?? 1)}
                                            onClick={() => {
                                                router.get(
                                                    route('reports.index'),
                                                    {
                                                        ...filters,
                                                        page: (payments.meta?.current_page ?? 1) + 1,
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

            <PaymentDrawer
                open={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                payment={selectedPayment}
                cities={cities}
                properties={properties}
                units={units}
                types={types}
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
