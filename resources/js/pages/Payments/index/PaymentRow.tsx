import { TableCell, TableRow } from '@/components/ui/table';
import { Payment, PaymentFilters } from '@/types/payments';
import { formatDateOnly } from './paymentUtils';
import PaymentActions from './PaymentActions';
import StatusBadge from './StatusBadge';
import PermanentBadge from './PermanentBadge';

interface PaymentRowProps {
    payment: Payment;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    showActions: boolean;
    hasPermission: (permission: string) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    filters?: PaymentFilters;
}

export default function PaymentRow({
    payment,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    showActions,
    hasPermission,
    hasAllPermissions,
    filters
}: PaymentRowProps) {
    const formatCurrency = (amount: number | null) => {
        if (amount === null || amount === undefined || isNaN(amount)) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">
                {payment.city}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">
                {payment.property_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">
                {payment.unit_name}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(payment.date)}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-red-600 dark:text-red-400">
                {formatCurrency(payment.owes)}
            </TableCell>
            <TableCell className="border border-border text-center text-green-600 dark:text-green-400">
                {formatCurrency(payment.paid)}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-blue-600 dark:text-blue-400">
                {formatCurrency(payment.left_to_pay)}
            </TableCell>
            <TableCell className="border border-border text-center">
                <StatusBadge status={payment.status} />
            </TableCell>
            <TableCell className="border border-border text-center text-foreground max-w-32 truncate">
                {payment.notes}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground max-w-32 truncate">
                {payment.reversed_payments}
            </TableCell>
            <TableCell className="border border-border text-center">
                <PermanentBadge permanent={payment.permanent} />
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {payment.has_assistance ? (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">
                        Yes
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {payment.assistance_amount && payment.has_assistance
                    ? formatCurrency(payment.assistance_amount)
                    : <span className="text-muted-foreground">-</span>
                }
            </TableCell>
            <TableCell className="border border-border text-center text-foreground max-w-32 truncate">
                {payment.assistance_company || <span className="text-muted-foreground">-</span>}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {payment.remind ? (
                    <span className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 px-2 py-1 rounded text-sm font-medium">
                        Yes
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {payment.added_to_ledger ? (
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded text-sm font-medium">
                        Yes
                    </span>
                ) : (
                    <span className="text-muted-foreground text-sm">No</span>
                )}
            </TableCell>
            {showActions && (
                <TableCell className="border border-border text-center">
                    <PaymentActions
                        payment={payment}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onHide={onHide}
                        onUnhide={onUnhide}
                        hasPermission={hasPermission}
                        hasAllPermissions={hasAllPermissions}
                        filters={filters}
                    />
                </TableCell>
            )}
        </TableRow>
    );
}
