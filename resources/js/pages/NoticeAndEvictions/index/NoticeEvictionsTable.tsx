import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import { NoticeEvictionsTableRow } from './NoticeEvictionsTableRow';

interface NoticeEvictionsTableProps {
    records: NoticeAndEviction[];
    hasShowPermission: boolean;
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    hasAnyActionPermission: boolean;
    onEdit: (record: NoticeAndEviction) => void;
    onDelete: (record: NoticeAndEviction) => void;
    filterQueryString: string;
}

export function NoticeEvictionsTable({
    records,
    hasShowPermission,
    hasEditPermission,
    hasDeletePermission,
    hasAnyActionPermission,
    onEdit,
    onDelete,
    filterQueryString,
}: NoticeEvictionsTableProps) {
    return (
        <Table containerClassName="relative max-h-[600px] overflow-auto" className="border-collapse rounded-md border border-border">
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <TableRow className="border-border">
                    <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">City Name</TableHead>
                    <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                        Property Name
                    </TableHead>
                    <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                        Unit Name
                    </TableHead>
                    <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                        Tenants Name
                    </TableHead>
                    <TableHead className="min-w-[150px] border border-border bg-muted text-muted-foreground">Other Tenants</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Type of Notice</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Have An Exception?</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Evictions</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Sent to Attorney</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Hearing Dates</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Evicted/Payment Plan</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">If Left?</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Writ Date</TableHead>
                    {hasAnyActionPermission && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {records.map((record) => (
                    <NoticeEvictionsTableRow
                        key={record.id}
                        record={record}
                        hasShowPermission={hasShowPermission}
                        hasEditPermission={hasEditPermission}
                        hasDeletePermission={hasDeletePermission}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        filterQueryString={filterQueryString}
                    />
                ))}
            </TableBody>
        </Table>
    );
}
