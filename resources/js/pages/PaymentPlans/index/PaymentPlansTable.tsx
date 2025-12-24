// resources/js/Pages/PaymentPlans/index/PaymentPlansTable.tsx
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaymentPlan, PaginatedResponse } from '@/types/PaymentPlan';
import { usePermissions } from '@/hooks/usePermissions';
import PaymentPlanTableRow from './PaymentPlanTableRow';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

interface Filters {
    city?: string | null;
    property?: string | null;
    unit?: string | null;
    tenant?: string | null;
    is_hidden?: boolean | null;
}

interface PaymentPlansTableProps {
    paymentPlans: PaginatedResponse<PaymentPlan>;
    filters?: Filters;
    perPage: number | string; // may arrive as '15' or 'all' from backend
    search?: string | null;
    onEdit: (plan: PaymentPlan) => void;
    onDelete: (plan: PaymentPlan) => void;
}

export default function PaymentPlansTable({ paymentPlans, filters, perPage, search, onEdit, onDelete }: PaymentPlansTableProps) {
    const { hasAnyPermission } = usePermissions();

    const currentPage = paymentPlans.current_page ?? paymentPlans?.meta?.current_page ?? 1;
    const lastPage = paymentPlans.last_page ?? paymentPlans?.meta?.last_page ?? 1;
    const total = paymentPlans.total ?? paymentPlans?.meta?.total ?? paymentPlans.data.length;
    const from = paymentPlans.from ?? paymentPlans?.meta?.from ?? 0;
    const to = paymentPlans.to ?? paymentPlans?.meta?.to ?? paymentPlans.data.length;

    const selectedPerPage = (() => {
        if (String(perPage).toLowerCase() === 'all') return 'all';
        const n = typeof perPage === 'number' ? perPage : parseInt(String(perPage), 10);
        if (!Number.isNaN(n) && n > 0) return String(n);
        const metaPer = (paymentPlans as any)?.per_page ?? paymentPlans?.meta?.per_page ?? 15;
        return String(metaPer);
    })();

    const isHiddenParam = filters?.is_hidden ? 'true' : undefined;

    const handlePerPageChange = (value: string) => {
        const nextPerPage = value === 'all' ? 'all' : parseInt(value, 10);
        router.get(
            route('payment-plans.index'),
            {
                city: filters?.city || undefined,
                property: filters?.property || undefined,
                unit: filters?.unit || undefined,
                tenant: filters?.tenant || undefined,
                is_hidden: isHiddenParam, // ✅ keep tab
                per_page: nextPerPage,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const goToPage = (page: number) => {
        if (page < 1 || page > lastPage) return;
        router.get(
            route('payment-plans.index'),
            {
                city: filters?.city || undefined,
                property: filters?.property || undefined,
                unit: filters?.unit || undefined,
                tenant: filters?.tenant || undefined,
                is_hidden: isHiddenParam, // ✅ keep tab
                page,
                per_page: selectedPerPage,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <Card className="bg-card text-card-foreground shadow-lg">
            <CardContent>
                <div className="relative overflow-x-auto">
                    <Table className="border-collapse rounded-md border border-border">
                        <TableHeader>
                            <TableRow className="border-border">
                                <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                    City
                                </TableHead>
                                <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                    Property
                                </TableHead>
                                <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                    Unit
                                </TableHead>
                                <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                                    Tenant
                                </TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Amount</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Paid</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground text-right">Left to Pay</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                                <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>

                                {hasAnyPermission(['payment-plans.show', 'payment-plans.edit', 'payment-plans.update', 'payment-plans.destroy']) && (
                                    <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                                )}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paymentPlans.data.map((plan: PaymentPlan) => (
                                <PaymentPlanTableRow
                                    key={plan.id}
                                    plan={plan}
                                    filters={filters}
                                    perPage={selectedPerPage}
                                    currentPage={currentPage}
                                    search={search}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {paymentPlans.data.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                        <p className="text-lg">No payment plans found.</p>
                        <p className="text-sm">Try adjusting your search criteria.</p>
                    </div>
                )}

                <div className="mt-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {from ?? 0}-{to ?? paymentPlans.data.length} of {total}
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
                            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= lastPage}>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
