import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Application } from '@/types/application';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Eye, Trash2, FileText, EyeOff } from 'lucide-react';

interface ApplicationsTableRowProps {
    application: Application;
    onEdit: (application: Application) => void;
    onDelete: (application: Application) => void;
    onHide: (application: Application) => void;
    onUnhide: (application: Application) => void;
    hasViewPermission: boolean;
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    hasHidePermission: boolean;
    filters?: {
        city: string;
        property: string;
        unit: string;
        name: string;
        applicant_applied_from: string;
        is_hidden: boolean;
    };
}

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">No Status</Badge>;
    return <Badge variant="default">{status}</Badge>;
};

export default function ApplicationsTableRow({
    application,
    onEdit,
    onDelete,
    onHide,
    onUnhide,
    hasViewPermission,
    hasEditPermission,
    hasDeletePermission,
    hasHidePermission,
    filters,
}: ApplicationsTableRowProps) {
    const attachmentCount = application.attachments?.length || 0;

    const buildShowRoute = () => {
        const params: Record<string, any> = { application: application.id };

        if (filters) {
            if (filters.city) params.city = filters.city;
            if (filters.property) params.property = filters.property;
            if (filters.unit) params.unit = filters.unit;
            if (filters.name) params.name = filters.name;
            if (filters.applicant_applied_from) params.applicant_applied_from = filters.applicant_applied_from;
            if (filters.is_hidden) params.is_hidden = 'true'; // only include when true (mimic Payments)
        }

        return route('applications.show', params);
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.city}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.property}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {application.unit_name}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{application.name}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                {application.co_signer || <span className="text-muted-foreground">N/A</span>}
            </TableCell>

            <TableCell className="border border-border text-center">{getStatusBadge(application.status)}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                {application.applicant_applied_from || <span className="text-muted-foreground">N/A</span>}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">
                {formatDateOnly(application.date)}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">
                {application.stage_in_progress || 'N/A'}
            </TableCell>

            <TableCell className="border border-border text-center">
                {application.notes ? (
                    <div className="max-w-24 truncate" title={application.notes}>
                        {application.notes}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>

            <TableCell className="border border-border text-center">
                {attachmentCount > 0 ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {attachmentCount} {attachmentCount === 1 ? 'file' : 'files'}
                    </Badge>
                ) : (
                    <span className="text-sm text-muted-foreground">No files</span>
                )}
            </TableCell>

            {(hasViewPermission || hasEditPermission || hasDeletePermission || hasHidePermission) && (
                <TableCell className="border border-border text-center">
                    <div className="flex justify-center gap-1">
                        {hasViewPermission && (
                            <Link href={buildShowRoute()}>
                                <Button variant="outline" size="sm" title="View">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}

                        {hasEditPermission && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(application)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {/* ✅ Hide/Unhide like Payments */}
                        {hasHidePermission && !application.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onHide(application)}
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                                title="Hide"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {hasHidePermission && application.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUnhide(application)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                                title="Unhide"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {hasDeletePermission && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(application)}
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
