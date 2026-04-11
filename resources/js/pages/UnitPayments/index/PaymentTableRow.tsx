import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

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

interface PaymentTableRowProps {
    payment: Payment;
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    formatMoney: (value?: string | number | null) => string;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        hasAnyPermission: boolean;
    };
}

export default function PaymentTableRow({
    payment,
    formatDateOnly,
    formatMoney,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    permissions,
}: PaymentTableRowProps) {
    const cityName = payment.unit?.property?.city?.city || '-';
    const propertyName = payment.unit?.property?.property_name || '-';
    const unitName = payment.unit?.unit_name || '-';

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">{cityName}</TableCell>
            <TableCell className="sticky left-[140px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {propertyName}
            </TableCell>
            <TableCell className="border border-border text-center font-medium text-foreground xl:sticky xl:left-[320px] xl:z-10 xl:bg-muted">
                {unitName}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{payment.type}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatMoney(payment.amount)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(payment.date)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{payment.to_whom}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{payment.order_id || '-'}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-52 truncate" title={payment.description || ''}>
                    {payment.description || '-'}
                </div>
            </TableCell>

            <TableCell className="border border-border text-center">
                <Badge variant={payment.is_hidden ? 'secondary' : 'default'}>{payment.is_hidden ? 'Hidden' : 'Visible'}</Badge>
            </TableCell>

            {permissions.hasAnyPermission && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {permissions.canEdit && !payment.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onHide(payment)}
                                title="Hide"
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && payment.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUnhide(payment)}
                                title="Unhide"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(payment)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canDelete && (
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
                </TableCell>
            )}
        </TableRow>
    );
}
