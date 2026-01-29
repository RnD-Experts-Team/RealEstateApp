import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { NoticeAndEviction } from '@/types/NoticeAndEviction';
import { Link, router } from '@inertiajs/react';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { YesNoBadge } from './YesNoBadge';
import { format } from 'date-fns';

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

interface NoticeEvictionsTableRowProps {
    record: NoticeAndEviction;
    hasShowPermission: boolean;
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    onEdit: (record: NoticeAndEviction) => void;
    onDelete: (record: NoticeAndEviction) => void;
    filterQueryString: string;
}

export function NoticeEvictionsTableRow({
    record,
    hasShowPermission,
    hasEditPermission,
    hasDeletePermission,
    onEdit,
    onDelete,
    filterQueryString,
}: NoticeEvictionsTableRowProps) {
    const handleHide = () => {
        router.patch(
            route('notice_and_evictions.hide', record.id) + filterQueryString,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    const handleUnhide = () => {
        router.patch(
            route('notice_and_evictions.unhide', record.id) + filterQueryString,
            {},
            {
                preserveScroll: true,
                preserveState: true,
            }
        );
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {record.city_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {record.property_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {record.unit_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {record.tenants_name || 'N/A'}
            </TableCell>
            <TableCell className="border border-border text-center">
                {record.other_tenants ? (
                    <div className="max-w-32 truncate" title={record.other_tenants}>
                        {record.other_tenants}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="border border-border text-center">
                <StatusBadge status={record.status ?? null} />
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {formatDateOnly(record.date)}
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {record.type_of_notice || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                <YesNoBadge value={record.have_an_exception ?? null} />
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {record.note ? (
                    <div className="max-w-24 truncate" title={record.note}>
                        {record.note}
                    </div>
                ) : (
                    <span className="text-muted-foreground">N/A</span>
                )}
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {record.evictions || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                <YesNoBadge value={record.sent_to_atorney ?? null} />
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {formatDateOnly(record.hearing_dates)}
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {record.evected_or_payment_plan || <span className="text-muted-foreground">N/A</span>}
            </TableCell>
            <TableCell className="border border-border text-center">
                <YesNoBadge value={record.if_left ?? null} />
            </TableCell>
            <TableCell className="text-foreground border border-border text-center">
                {formatDateOnly(record.writ_date)}
            </TableCell>
            {(hasShowPermission || hasEditPermission || hasDeletePermission) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1 justify-center">
                        {hasShowPermission && (
                            <Link href={`/notice_and_evictions/${record.id}${filterQueryString}`}>
                                <Button variant="outline" size="sm" title="View">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        
                        {/* Hide/Unhide buttons */}
                        {!record.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleHide}
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                                title="Hide"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {record.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleUnhide}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                                title="Unhide"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {hasEditPermission && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(record)} title="Edit">
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {hasDeletePermission && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(record)}
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
