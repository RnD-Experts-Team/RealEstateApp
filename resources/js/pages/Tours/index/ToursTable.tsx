import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TourTableRow from './TourTableRow';

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

interface ToursTableProps {
    tours: Tour[];
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

export default function ToursTable({ tours, formatDateOnly, formatTimeOnly, onEdit, onDelete, onHide, onUnhide, permissions }: ToursTableProps) {
    return (
        <div className="relative overflow-x-auto">
            <Table className="border-collapse rounded-md border border-border">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="sticky left-0 z-10 min-w-[140px] border border-border bg-muted text-muted-foreground">City</TableHead>
                        <TableHead className="sticky left-[140px] z-10 min-w-[180px] border border-border bg-muted text-muted-foreground">
                            Property
                        </TableHead>
                        <TableHead className="sticky left-[320px] z-10 min-w-[140px] border border-border bg-muted text-muted-foreground">
                            Unit
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Representative</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Prospect</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Phone</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Email</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Date</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Time</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Notes</TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground">Visibility</TableHead>

                        {permissions.hasAnyPermission && (
                            <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {tours.map((tour) => (
                        <TourTableRow
                            key={tour.id}
                            tour={tour}
                            formatDateOnly={formatDateOnly}
                            formatTimeOnly={formatTimeOnly}
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
