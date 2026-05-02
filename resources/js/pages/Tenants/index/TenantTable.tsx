import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tenant } from '@/types/tenant';
import { Edit, Trash2 } from 'lucide-react';
import React from 'react';

interface TenantTableProps {
    tenants: Tenant[];
    onEdit: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
    canEdit: boolean;
    canDelete: boolean;
    showActions: boolean;
}

export const TenantTable: React.FC<TenantTableProps> = ({ tenants, onEdit, onDelete, canEdit, canDelete, showActions }) => {
    const displayValue = (value: string | number | null | undefined): string => {
        if (value === null || value === undefined || value === '') {
            return 'N/A';
        }
        return String(value);
    };

    const getInsuranceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'destructive'}
                className={value === 'Yes' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : undefined}
            >
                {value}
            </Badge>
        );
    };

    const getSensitiveBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'destructive' : 'default'}
                className={value === 'No' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : undefined}
            >
                {value}
            </Badge>
        );
    };

    const getAssistanceBadge = (value: 'Yes' | 'No' | string | null) => {
        if (value === null || value === undefined || value === '') return <Badge variant="outline">N/A</Badge>;
        return (
            <Badge
                variant={value === 'Yes' ? 'default' : 'secondary'}
                className={
                    value === 'Yes'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                }
            >
                {value}
            </Badge>
        );
    };

    return (
        <Table containerClassName="relative max-h-[600px] overflow-auto" className="border-collapse rounded-md border border-border">
            <TableHeader style={{ position: 'sticky', top: 0, zIndex: 20 }}>
                <TableRow className="border-border">
                    <TableHead className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">City</TableHead>
                    <TableHead className="sticky left-[120px] z-10 min-w-[150px] border border-border bg-muted text-muted-foreground">
                        Property Name
                    </TableHead>
                    <TableHead className="sticky left-[270px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                        Unit Number
                    </TableHead>
                    <TableHead className="sticky left-[390px] z-10 min-w-[120px] border border-border bg-muted text-muted-foreground">
                        First Name
                    </TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Last Name</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Street Address</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Login Email</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Alternate Email</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Mobile</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Emergency Phone</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Payment Method</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Has Insurance</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Sensitive Communication</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Has Assistance</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Amount</TableHead>
                    <TableHead className="border border-border bg-muted text-muted-foreground">Assistance Company</TableHead>
                    {showActions && <TableHead className="border border-border bg-muted text-muted-foreground">Actions</TableHead>}
                </TableRow>
            </TableHeader>
            <TableBody>
                {tenants.map((tenant) => (
                    <TableRow key={tenant.id} className="border-border hover:bg-muted/50">
                        <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                            {displayValue(tenant.city_name)}
                        </TableCell>
                        <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                            {displayValue(tenant.property_name)}
                        </TableCell>
                        <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                            {displayValue(tenant.unit_number)}
                        </TableCell>
                        <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                            {displayValue(tenant.first_name)}
                        </TableCell>
                        <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.last_name)}</TableCell>
                        <TableCell className="max-w-[200px] border border-border text-center text-foreground">
                            <div className="truncate" title={tenant.street_address_line || 'N/A'}>
                                {displayValue(tenant.street_address_line)}
                            </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] border border-border text-center text-foreground">
                            <div className="truncate" title={tenant.login_email || 'N/A'}>
                                {displayValue(tenant.login_email)}
                            </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] border border-border text-center text-foreground">
                            <div className="truncate" title={tenant.alternate_email || 'N/A'}>
                                {displayValue(tenant.alternate_email)}
                            </div>
                        </TableCell>
                        <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.mobile)}</TableCell>
                        <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.emergency_phone)}</TableCell>
                        <TableCell className="border border-border text-center text-foreground">{displayValue(tenant.cash_or_check)}</TableCell>
                        <TableCell className="border border-border text-center">{getInsuranceBadge(tenant.has_insurance ?? null)}</TableCell>
                        <TableCell className="border border-border text-center">
                            {getSensitiveBadge(tenant.sensitive_communication ?? null)}
                        </TableCell>
                        <TableCell className="border border-border text-center">{getAssistanceBadge(tenant.has_assistance ?? null)}</TableCell>
                        <TableCell className="border border-border text-center text-foreground">
                            {tenant.assistance_amount ? `$${tenant.assistance_amount}` : <span className="text-muted-foreground">N/A</span>}
                        </TableCell>
                        <TableCell className="max-w-[150px] border border-border text-center text-foreground">
                            <div className="truncate" title={tenant.assistance_company || 'N/A'}>
                                {displayValue(tenant.assistance_company)}
                            </div>
                        </TableCell>
                        {showActions && (
                            <TableCell className="border border-border text-center">
                                <div className="flex gap-1">
                                    {canEdit && (
                                        <Button variant="outline" size="sm" onClick={() => onEdit(tenant)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {canDelete && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(tenant)}
                                            className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </TableCell>
                        )}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};
