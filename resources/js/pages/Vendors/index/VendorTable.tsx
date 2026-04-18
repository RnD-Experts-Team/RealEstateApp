import { Table, TableBody, TableHead, TableHeader, TableRow ,TableCell } from '@/components/ui/table';
import { VendorInfo } from '@/types/vendor';
import VendorTableRow from './VendorTableRow';

interface VendorTableProps {
    vendors: VendorInfo[];
    hasEditPermissions: boolean;
    hasDeletePermission: boolean;
    onEditVendor: (vendor: VendorInfo) => void;
    onDeleteVendor: (vendor: VendorInfo) => void;
}

export default function VendorTable({
    vendors,
    hasEditPermissions,
    hasDeletePermission,
    onEditVendor,
    onDeleteVendor,
}: VendorTableProps) {
    return (
        <div className="relative overflow-x-auto">
            <Table className="border-collapse rounded-md border border-border">
                <TableHeader>
                    <TableRow className="border-border">
                        <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground text-center">
                            City
                        </TableHead>
                        <TableHead className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground text-center">
                            Vendor Name
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground text-center">
                            Phone Number
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground text-center">
                            Email
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground text-center">
                            Vendor Type
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground text-center">
                            Service Type
                        </TableHead>
                        <TableHead className="border border-border bg-muted text-muted-foreground text-center">Actions</TableHead>
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
        </div>
    );
}
