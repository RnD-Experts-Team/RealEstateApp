import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoveIn } from '@/types/move-in';
import { InspectionLink } from '@/types/inspection';
import MoveInTableRow from './MoveInTableRow';

interface MoveInTableProps {
    moveIns: MoveIn[];
    canEdit: boolean;
    canDelete: boolean;
    canHide: boolean; // ✅ NEW
    canInspect: boolean;
    inspectionMap: Record<number, InspectionLink>;
    showActions: boolean;
    onEdit: (moveIn: MoveIn) => void;
    onDelete: (moveIn: MoveIn) => void;
    onHide: (moveIn: MoveIn) => void; // ✅ NEW
    onUnhide: (moveIn: MoveIn) => void; // ✅ NEW
    onInspection: (moveIn: MoveIn) => void;
}

export default function MoveInTable({ moveIns, canEdit, canDelete, canHide, canInspect, inspectionMap, showActions, onEdit, onDelete, onHide, onUnhide, onInspection }: MoveInTableProps) {
    return (
        <Table containerClassName="relative max-h-[600px] overflow-auto" className="border-collapse rounded-md border border-border">
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <TableRow className="border-border">
                    <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">City</TableHead>
                    <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                        Property Name
                    </TableHead>
                    <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                        Unit Name
                    </TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Tenant Name</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Signed Lease</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Lease Signing Date</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Move-In Date</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Paid Security & First Month</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Scheduled Payment Date</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Handled Keys</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Move in form sent On</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Filled Move-In Form</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Date of move in form filled in</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Submitted Insurance</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Date of Insurance expiration</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Delisted</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Utilities Under Their Name</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Got The Lockbox From Tenant</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Last Notice Sent</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>

                    {showActions && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                </TableRow>
            </TableHeader>

            <TableBody>
                {moveIns.map((moveIn) => (
                    <MoveInTableRow
                        key={moveIn.id}
                        moveIn={moveIn}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canHide={canHide}
                        canInspect={canInspect}
                        inspection={inspectionMap[moveIn.id] ?? null}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onHide={onHide}
                        onUnhide={onUnhide}
                        onInspection={onInspection}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
