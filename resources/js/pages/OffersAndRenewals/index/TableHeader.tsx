import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';

interface TableHeaderProps {
    activeTab: 'offers' | 'renewals' | 'both';
    hasPermissions: boolean;
}

export const OffersTableHeader: React.FC<TableHeaderProps> = ({ activeTab, hasPermissions }) => {
    return (
        <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
            <TableRow className="border-border">
                <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-center text-muted-foreground">
                    City
                </TableHead>
                <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-center text-muted-foreground">
                    Property
                </TableHead>
                <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-center text-muted-foreground">
                    Unit
                </TableHead>
                <TableHead className="sticky left-[390px] z-10 min-w-[150px] border border-border bg-muted text-center text-muted-foreground">
                    Tenant
                </TableHead>
                {(activeTab === 'offers' || activeTab === 'both') && (
                    <>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Other Tenants</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Date of Decline</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Date Sent Offer</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Status</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Date of Acceptance</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Offer Last Notice Sent</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Offer Notice Kind</TableHead>
                    </>
                )}
                {(activeTab === 'renewals' || activeTab === 'both') && (
                    <>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Lease Sent?</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Date Sent Lease</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Lease Signed?</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Date Signed</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Renewal Last Notice Sent</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Renewal Notice Kind</TableHead>
                        <TableHead className="border border-border bg-muted text-center text-muted-foreground">Notes</TableHead>
                    </>
                )}

                <TableHead className="border border-border bg-muted text-center text-muted-foreground">How Many Days Left</TableHead>
                <TableHead className="border border-border bg-muted text-center text-muted-foreground">Expired</TableHead>
                {hasPermissions && <TableHead className="border border-border bg-muted text-center text-muted-foreground">Actions</TableHead>}
            </TableRow>
        </TableHeader>
    );
};
