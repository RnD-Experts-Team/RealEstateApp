import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Payment, PaymentFilters } from '@/types/payments';
import PaymentRow from './PaymentRow';

interface PaymentsTableProps {
    payments: Payment[];
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    hasPermission: (permission: string) => boolean;
    filters?: PaymentFilters;
}

export default function PaymentsTable({
    payments,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    hasAnyPermission,
    hasAllPermissions,
    hasPermission,
    filters,
}: PaymentsTableProps) {
    const showActions = hasAnyPermission(['payments.show', 'payments.edit', 'payments.update', 'payments.destroy', 'payments.hide']);

    return (
        <Card className="bg-card text-card-foreground shadow-lg">
            <CardContent>
                <Table containerClassName="relative max-h-[600px] overflow-auto" className="border-collapse rounded-md border border-border">
                    <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                        <TableRow className="border-border">
                            <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                City
                            </TableHead>
                            <TableHead className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                Property Name
                            </TableHead>
                            <TableHead className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                                Unit Name
                            </TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Owes</TableHead>
                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Paid</TableHead>
                            <TableHead className="border border-border bg-muted text-right text-muted-foreground">Left to Pay</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Reversed Payments</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Permanent</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Has Assistance</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Amount</TableHead>
                            <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Company</TableHead>
                            {showActions && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment) => (
                            <PaymentRow
                                key={payment.id}
                                payment={payment}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                onHide={onHide}
                                onUnhide={onUnhide}
                                showActions={showActions}
                                hasPermission={hasPermission}
                                hasAllPermissions={hasAllPermissions}
                                filters={filters}
                            />
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
