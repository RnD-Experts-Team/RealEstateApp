import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { VendorTaskTracker } from '@/types/vendor-task-tracker';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

interface TaskTableRowProps {
    task: VendorTaskTracker;
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
        is_hidden?: string | boolean;
        per_page?: string;
        page?: number;
    };
}

export default function TaskTableRow({ task, formatDateOnly, onEdit, onDelete, permissions, filters }: TaskTableRowProps) {
    const getUrgentBadge = (urgent: 'Yes' | 'No') => {
        return <Badge variant={urgent === 'Yes' ? 'destructive' : 'secondary'}>{urgent}</Badge>;
    };

    const getStatusBadge = (status: string | null | undefined) => {
        const normalizedStatus = status ?? null;

        if (!normalizedStatus) return <Badge variant="outline">No Status</Badge>;

        const variant = normalizedStatus.toLowerCase().includes('completed')
            ? 'default'
            : normalizedStatus.toLowerCase().includes('pending')
            ? 'secondary'
            : 'outline';

        return <Badge variant={variant}>{normalizedStatus}</Badge>;
    };

    const buildRedirectFilters = (): Record<string, string> => {
        const params: Record<string, string> = {};
        Object.entries(filters || {}).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') params[k] = String(v);
        });
        return params;
    };

    const handleHide = () => {
        if (!confirm('Are you sure you want to hide this task?')) return;

        router.patch(
            route('vendor-task-tracker.hide', task.id),
            { redirect_filters: buildRedirectFilters() },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleUnhide = () => {
        if (!confirm('Are you sure you want to unhide this task?')) return;

        router.patch(
            route('vendor-task-tracker.unhide', task.id),
            { redirect_filters: buildRedirectFilters() },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.city || '-'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.property_name || '-'}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.unit_name || '-'}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {task.vendor_name || '-'}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(task.task_submission_date)}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-32 truncate" title={task.assigned_tasks || ''}>
                    {task.assigned_tasks || '-'}
                </div>
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(task.any_scheduled_visits)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(task.task_ending_date)}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-24 truncate" title={task.notes || ''}>
                    {task.notes || '-'}
                </div>
            </TableCell>

            <TableCell className="border border-border text-center">{getStatusBadge(task.status)}</TableCell>
            <TableCell className="border border-border text-center">{getUrgentBadge(task.urgent)}</TableCell>

            {permissions.hasAnyPermission && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {permissions.canView && (
                            <Link
                                href={
                                    route('vendor-task-tracker.show', task.id) +
                                    (() => {
                                        const params: Record<string, string> = {};
                                        Object.entries(filters || {}).forEach(([k, v]) => {
                                            if (v !== null && v !== undefined && v !== '') params[k] = String(v);
                                        });
                                        const qs = new URLSearchParams(params).toString();
                                        return qs ? `?${qs}` : '';
                                    })()
                                }
                            >
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}

                        {/* ✅ Hide/Unhide: use existing permissions.canEdit (no canHide prop) */}
                        {permissions.canEdit && !task.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleHide}
                                title="Hide"
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && task.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnhide}
                                title="Unhide"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(task)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(task)}
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
