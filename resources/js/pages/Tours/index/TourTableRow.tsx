import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';

interface Representative {
    id: number;
    name: string;
    deleted_at?: string | null;
}

interface Tour {
    id: number;
    prospect: string;
    phone: string;
    email?: string | null;
    date: string;
    time: string;
    note?: string | null;
    is_hidden: boolean;
    unit?: {
        id: number;
        name?: string | null;
        unit_name?: string | null;
        property?: {
            id: number;
            property_name?: string | null;
            city?: {
                id: number;
                city?: string | null;
                name?: string | null;
            } | null;
        } | null;
    } | null;
    representative?: Representative | null;
}

interface TourTableRowProps {
    tour: Tour;
    formatDateOnly: (value?: string | null, fallback?: string) => string;
    formatTimeOnly: (value?: string | null, fallback?: string) => string;
    onEdit: (tour: Tour) => void;
    onDelete: (tour: Tour) => void;
    onHide: (tour: Tour) => void;
    onUnhide: (tour: Tour) => void;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        hasAnyPermission: boolean;
    };
}

export default function TourTableRow({ tour, formatDateOnly, formatTimeOnly, onEdit, onDelete, onHide, onUnhide, permissions }: TourTableRowProps) {
    const cityName = tour.unit?.property?.city?.city || tour.unit?.property?.city?.name || '-';
    const propertyName = tour.unit?.property?.property_name || '-';
    const unitName = tour.unit?.name || tour.unit?.unit_name || '-';

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">{cityName}</TableCell>
            <TableCell className="sticky left-[140px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {propertyName}
            </TableCell>
            <TableCell className="sticky left-[320px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {unitName}
            </TableCell>

            <TableCell className="border border-border text-center text-foreground">{tour.representative?.name || '-'}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{tour.prospect || '-'}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{tour.phone || '-'}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{tour.email || '-'}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatDateOnly(tour.date)}</TableCell>
            <TableCell className="border border-border text-center text-foreground">{formatTimeOnly(tour.time)}</TableCell>

            <TableCell className="border border-border text-center text-foreground">
                <div className="max-w-52 truncate" title={tour.note || ''}>
                    {tour.note || '-'}
                </div>
            </TableCell>

            <TableCell className="border border-border text-center">
                <Badge variant={tour.is_hidden ? 'secondary' : 'default'}>{tour.is_hidden ? 'Hidden' : 'Visible'}</Badge>
            </TableCell>

            {permissions.hasAnyPermission && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {permissions.canEdit && !tour.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onHide(tour)}
                                title="Hide"
                                className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                            >
                                <EyeOff className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && tour.is_hidden && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUnhide(tour)}
                                title="Unhide"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                            >
                                <Eye className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(tour)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}

                        {permissions.canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(tour)}
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
