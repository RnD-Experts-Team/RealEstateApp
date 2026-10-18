import { Button } from '@/components/ui/button';
import { Payment, PaymentFilters } from '@/types/payments';
import { Link } from '@inertiajs/react';
import { Edit, Eye, Trash2, EyeOff } from 'lucide-react';

interface PaymentActionsProps {
    payment: Payment;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    hasPermission: (permission: string) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    filters?: PaymentFilters;
}

export default function PaymentActions({
    payment,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    hasPermission,
    hasAllPermissions,
    filters,
}: PaymentActionsProps) {
    const buildShowRoute = () => {
        const params: Record<string, any> = { payment: payment.id };
        if (filters) {
            if (filters.city) params.city = filters.city;
            if (filters.property) params.property = filters.property;
            if (filters.unit) params.unit = filters.unit;
            if (filters.permanent && filters.permanent.length > 0) params.permanent = filters.permanent.join(',');
            if (typeof filters.is_hidden === 'boolean') params.is_hidden = filters.is_hidden ? 'true' : 'false';
            if (typeof filters.remind === 'boolean') params.remind = String(filters.remind);
            if (typeof filters.added_to_ledger === 'boolean') params.added_to_ledger = String(filters.added_to_ledger);
        }
        return route('payments.show', params);
    };
    return (
        <div className="flex gap-1 justify-center">
            {hasPermission('payments.show') && (
                <Link href={buildShowRoute()}>
                    <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                    </Button>
                </Link>
            )}
            {hasAllPermissions(['payments.edit', 'payments.update']) && (
                <Button variant="outline" size="sm" onClick={() => onEdit(payment)}>
                    <Edit className="h-4 w-4" />
                </Button>
            )}
            {!payment.is_hidden && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onHide(payment)}
                    className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                    title="Hide this payment"
                >
                    <EyeOff className="h-4 w-4" />
                </Button>
            )}
            {payment.is_hidden && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnhide(payment)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                    title="Unhide this payment"
                >
                    <Eye className="h-4 w-4" />
                </Button>
            )}
            {hasPermission('payments.destroy') && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(payment)}
                    className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            )}
        </div>
    );
}
