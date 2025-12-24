import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { MoveIn } from '@/types/move-in';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';

interface MoveInTableRowProps {
    moveIn: MoveIn;
    canEdit: boolean;
    canDelete: boolean;
    canHide: boolean; // ✅ NEW
    onEdit: (moveIn: MoveIn) => void;
    onDelete: (moveIn: MoveIn) => void;
    onHide: (moveIn: MoveIn) => void; // ✅ NEW
    onUnhide: (moveIn: MoveIn) => void; // ✅ NEW
}

export default function MoveInTableRow({
    moveIn,
    canEdit,
    canDelete,
    canHide,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
}: MoveInTableRowProps) {
    const formatDateUTC = (dateStr?: string | null) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return 'N/A';
        return new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'UTC' }).format(d);
    };

    const getYesNoBadge = (value: 'Yes' | 'No' | null) => {
        if (value === null) return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }
            >
                {value}
            </Badge>
        );
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.city_name}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.property_name}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {moveIn.unit_name}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{moveIn.tenant_name || 'N/A'}</TableCell>
            <TableCell className="border border-border text-center">{getYesNoBadge(moveIn.signed_lease)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.lease_signing_date)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.move_in_date)}</TableCell>
            <TableCell className="border border-border text-center">{getYesNoBadge(moveIn.paid_security_deposit_first_month_rent)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.scheduled_paid_time)}</TableCell>
            <TableCell className="border border-border text-center">{getYesNoBadge(moveIn.handled_keys)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.move_in_form_sent_date)}</TableCell>
            <TableCell className="border border-border text-center">{getYesNoBadge(moveIn.filled_move_in_form)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.date_of_move_in_form_filled)}</TableCell>
            <TableCell className="border border-border text-center">{getYesNoBadge(moveIn.submitted_insurance)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.date_of_insurance_expiration)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateUTC(moveIn.last_notice_sent)}</TableCell>

            {(canEdit || canDelete || canHide) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1 justify-center">
                        {canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(moveIn)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {/* ✅ Hide / Unhide */}
                        {canHide && !moveIn.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onHide(moveIn)}
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                                title="Hide"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {canHide && moveIn.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUnhide(moveIn)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                                title="Unhide"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(moveIn)}
                                className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
