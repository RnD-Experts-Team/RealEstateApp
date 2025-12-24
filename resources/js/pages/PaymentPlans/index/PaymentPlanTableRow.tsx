// resources/js/Pages/PaymentPlans/index/PaymentPlanTableRow.tsx
import { Link, router } from '@inertiajs/react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { PaymentPlan } from '@/types/PaymentPlan';
import { usePermissions } from '@/hooks/usePermissions';
import { formatCurrency } from './formatCurrency';
import { formatDateOnly } from './formatDate';
import StatusBadge from './StatusBadge';

interface Filters {
    city?: string | null;
    property?: string | null;
    unit?: string | null;
    tenant?: string | null;
    is_hidden?: boolean | null;
}

interface PaymentPlanTableRowProps {
    plan: PaymentPlan;
    filters?: Filters;
    perPage?: number | string;
    currentPage?: number;
    search?: string | null;
    onEdit: (plan: PaymentPlan) => void;
    onDelete: (plan: PaymentPlan) => void;
}

export default function PaymentPlanTableRow({ plan, filters, perPage, currentPage, search, onEdit, onDelete }: PaymentPlanTableRowProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const preserveData = {
        search: search ?? null,
        city: filters?.city ?? null,
        property: filters?.property ?? null,
        unit: filters?.unit ?? null,
        tenant: filters?.tenant ?? null,
        is_hidden: filters?.is_hidden ? 'true' : null,
        per_page: perPage ?? null,
        page: currentPage ?? null,
    };

    const canHide = hasAnyPermission(['payment-plans.update', 'payment-plans.edit', 'payment-plans.hide']);

    const handleHide = () => {
        if (!confirm('Are you sure you want to hide this payment plan?')) return;
        router.patch(route('payment-plans.hide', plan.id), preserveData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUnhide = () => {
        if (!confirm('Are you sure you want to unhide this payment plan?')) return;
        router.patch(route('payment-plans.unhide', plan.id), preserveData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.city_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.property}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.unit}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {plan.tenant}
            </TableCell>

            <TableCell className="border border-border text-center font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(plan.amount)}
            </TableCell>
            <TableCell className="border border-border text-center text-green-600 dark:text-green-400">
                {formatCurrency(plan.paid)}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-red-600 dark:text-red-400">
                {formatCurrency(plan.left_to_pay)}
            </TableCell>

            <TableCell className="border border-border text-center">
                <StatusBadge status={plan.status} />
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(plan.dates) || 'N/A'}
            </TableCell>

            <TableCell className="border border-border text-center">
                {plan.notes ? (
                    <div className="max-w-24 truncate" title={plan.notes}>
                        {plan.notes}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>

            {hasAnyPermission(['payment-plans.show', 'payment-plans.edit', 'payment-plans.update', 'payment-plans.destroy', 'payment-plans.hide']) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1 justify-center">
                        {hasPermission('payment-plans.show') && (
                            <Link
                                href={route('payment-plans.show', plan.id)}
                                data={preserveData}
                                preserveState
                                preserveScroll
                            >
                                <Button variant="outline" size="sm" title="View">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}

                        {hasAllPermissions(['payment-plans.update', 'payment-plans.edit']) && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(plan)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {/* ✅ Hide / Unhide */}
                        {canHide && !plan.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleHide}
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                                title="Hide"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {canHide && plan.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnhide}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                                title="Unhide"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {hasPermission('payment-plans.destroy') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(plan)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                title="Delete"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </TableCell>
            )}
        </TableRow>
    );
}
