import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import PaymentTableRow from './PaymentTableRow';

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

interface PaymentsTableProps {
    payments: Payment[];
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

export default function PaymentsTable({
    payments,
    formatDateOnly,
    formatMoney,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    permissions,
}: PaymentsTableProps) {
    return (
        <div className="relative w-full overflow-x-auto">
            <Table className="min-w-[1200px] border-collapse rounded-md border border-border">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="sticky left-0 z-10 min-w-[140px] border border-border bg-muted text-muted-foreground">City</TableHead>
                        <TableHead className="sticky left-[140px] z-10 min-w-[180px] border border-border bg-muted text-muted-foreground">
                            Property
                        </TableHead>
                        <TableHead className="min-w-[140px] border border-border bg-muted text-muted-foreground xl:sticky xl:left-[320px] xl:z-10">
                            Unit
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Type</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Amount</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">To Whom</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Order ID</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Description</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Visibility</TableHead>

                        {permissions.hasAnyPermission && (
                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {payments.map((payment) => (
                        <PaymentTableRow
                            key={payment.id}
                            payment={payment}
                            formatDateOnly={formatDateOnly}
                            formatMoney={formatMoney}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onHide={onHide}
                            onUnhide={onUnhide}
                            permissions={permissions}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
