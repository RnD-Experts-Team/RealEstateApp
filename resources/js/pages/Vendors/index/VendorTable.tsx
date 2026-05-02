import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { VendorInfo } from '@/types/vendor';
import VendorTableRow from './VendorTableRow';

interface VendorTableProps {
    vendors: VendorInfo[];
    hasEditPermissions: boolean;
    hasDeletePermission: boolean;
    onEditVendor: (vendor: VendorInfo) => void;
    onDeleteVendor: (vendor: VendorInfo) => void;
}

export default function VendorTable({ vendors, hasEditPermissions, hasDeletePermission, onEditVendor, onDeleteVendor }: VendorTableProps) {
    return (
        <Table containerClassName="relative max-h-[600px] overflow-auto" className="border-collapse rounded-md border border-border">
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <TableRow className="border-border">
                    <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-center text-muted-foreground">
                        City
                    </TableHead>
                    <TableHead className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-center text-muted-foreground">
                        Vendor Name
                    </TableHead>
                    <TableHead className="border border-border bg-muted text-center text-muted-foreground">Phone Number</TableHead>
                    <TableHead className="border border-border bg-muted text-center text-muted-foreground">Email</TableHead>
                    <TableHead className="border border-border bg-muted text-center text-muted-foreground">Vendor Type</TableHead>
                    <TableHead className="border border-border bg-muted text-center text-muted-foreground">Service Type</TableHead>
                    <TableHead className="border border-border bg-muted text-center text-muted-foreground">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {vendors.length > 0 ? (
                    vendors.map((vendor) => (
                        <VendorTableRow
                            key={vendor.id}
                            vendor={vendor}
                            hasEditPermissions={hasEditPermissions}
                            hasDeletePermission={hasDeletePermission}
                            onEdit={onEditVendor}
                            onDelete={onDeleteVendor}
                        />
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            No vendors found
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
