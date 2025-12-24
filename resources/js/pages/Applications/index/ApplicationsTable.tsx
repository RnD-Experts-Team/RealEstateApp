import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Application } from '@/types/application';
import ApplicationsTableRow from './ApplicationsTableRow';

interface ApplicationsTableProps {
    applications: Application[];
    onEdit: (application: Application) => void;
    onDelete: (application: Application) => void;
    onHide: (application: Application) => void;
    onUnhide: (application: Application) => void;
    hasViewPermission: boolean;
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    hasHidePermission: boolean;
    hasAnyActionPermission: boolean;
    filters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
        is_hidden: boolean;
    };
}

export default function ApplicationsTable({
    applications,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    hasViewPermission,
    hasEditPermission,
    hasDeletePermission,
    hasHidePermission,
    hasAnyActionPermission,
    filters,
}: ApplicationsTableProps) {
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
                            Unit
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Name</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Co-signer</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Status</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Applied From</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Stage</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Note</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Files</TableHead>

                        {hasAnyActionPermission && (
                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {applications.map((application) => (
                        <ApplicationsTableRow
                            key={application.id}
                            application={application}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onHide={onHide}
                            onUnhide={onUnhide}
                            hasViewPermission={hasViewPermission}
                            hasEditPermission={hasEditPermission}
                            hasDeletePermission={hasDeletePermission}
                            hasHidePermission={hasHidePermission}
                            filters={filters}
                        />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
