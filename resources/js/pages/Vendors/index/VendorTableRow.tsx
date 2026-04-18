import { TableCell, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { VendorInfo } from '@/types/vendor';

interface VendorTableRowProps {
    vendor: VendorInfo;
    hasEditPermissions: boolean;
    hasDeletePermission: boolean;
    onEdit: (vendor: VendorInfo) => void;
    onDelete: (vendor: VendorInfo) => void;
}

export default function VendorTableRow({
    vendor,
    hasEditPermissions,
    hasDeletePermission,
    onEdit,
    onDelete,
}: VendorTableRowProps) {
    // Normalize incoming field to an array of trimmed strings
    const toArray = (field: string[] | string | null | undefined): string[] => {
        if (!field) return [];
        if (Array.isArray(field)) return field.map((v) => (typeof v === 'string' ? v.trim() : String(v))).filter(Boolean);
        return String(field)
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean);
    };

    // Render each value on its own line
    const renderLines = (field: string[] | string | null | undefined) => {
        const values = toArray(field);
        if (values.length === 0) return <span className="text-muted-foreground">-</span>;
        return (
            <div className="space-y-1">
                {values.map((v, i) => (
                    <div key={i} className="truncate">
                        {v}
                    </div>
                ))}
            </div>
        );
    };

    // Render every two values on a separate line
    const renderPairsPerLine = (field: string[] | string | null | undefined) => {
        const values = toArray(field);
        if (values.length === 0) return <span className="text-muted-foreground">-</span>;
        const lines: string[] = [];
        for (let i = 0; i < values.length; i += 2) {
            const first = values[i];
            const second = values[i + 1];
            lines.push(second ? `${first}, ${second}` : first);
        }
        return (
            <div className="space-y-1">
                {lines.map((line, idx) => (
                    <div key={idx} className="truncate">
                        {line}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">
                {vendor.city?.city || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-card text-center font-medium text-foreground">
                {vendor.vendor_name}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {renderLines(vendor.number as string[])}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {renderLines(vendor.email as string[])}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {vendor.vendor_type === 'potential' ? 'Potential' : 'Main'}
            </TableCell>
            <TableCell className="border border-border text-center text-foreground">
                {renderPairsPerLine(vendor.service_type as string[])}
            </TableCell>
            <TableCell className="border border-border text-center">
                <div className="flex justify-center gap-2">
                    {hasEditPermissions && (
                        <button
                            onClick={() => onEdit(vendor)}
                            className="text-green-600 hover:text-green-800"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                    )}
                    {hasDeletePermission && (
                        <button
                            onClick={() => onDelete(vendor)}
                            className="text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}
