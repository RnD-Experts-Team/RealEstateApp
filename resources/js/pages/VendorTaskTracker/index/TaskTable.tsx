import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import TaskTableRow from './TaskTableRow';

interface TaskTableProps {
    tasks: VendorTaskTracker[];
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    onEdit: (task: VendorTaskTracker) => void;
    onDelete: (task: VendorTaskTracker) => void;
    permissions: {
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        hasAnyPermission: boolean;
    };
    filters?: {
        search?: string;
        city?: string;
        property?: string;
        unit_name?: string;
        vendor_name?: string;
        status?: string;
        is_hidden?: string | boolean; // ✅ NEW
        per_page?: string;
        page?: number;
    };
}

export default function TaskTable({ tasks, formatDateOnly, onEdit, onDelete, permissions, filters }: TaskTableProps) {
    return (
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
                            Unit Name
                        </TableHead>
                        <TableHead className="sticky left-[390px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                            Vendor Name
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Submission Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Assigned Tasks</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Scheduled Visits</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Task End Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Urgent</TableHead>

                        {permissions.hasAnyPermission && (
                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tasks.map((task) => (
                        <TaskTableRow
                            key={task.id}
                            task={task}
                            formatDateOnly={formatDateOnly}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            permissions={permissions}
                            filters={filters}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
