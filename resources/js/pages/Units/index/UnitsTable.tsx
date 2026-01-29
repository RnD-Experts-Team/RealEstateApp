import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Unit } from '@/types/unit';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface UnitsTableProps {
    units: Unit[];
    hasEditPermission: boolean;
    hasDeletePermission: boolean;
    onEdit: (unit: Unit) => void;
    onDelete: (unit: Unit) => void;
}

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const UnitsTable: React.FC<UnitsTableProps> = ({ units, hasEditPermission, hasDeletePermission, onEdit, onDelete }) => {
    const getVacantBadge = (vacant: string) => {
        if (!vacant) return <Badge variant="outline">-</Badge>;
        return <Badge variant={vacant === 'Yes' ? 'destructive' : 'default'}>{vacant}</Badge>;
    };

    const getListedBadge = (listed: string) => {
        if (!listed) return <Badge variant="outline">-</Badge>;
        return <Badge variant={listed === 'Yes' ? 'default' : 'secondary'}>{listed}</Badge>;
    };

    const getInsuranceBadge = (insurance: string | null) => {
        if (!insurance || insurance === '-') return <Badge variant="outline">N/A</Badge>;
        return <Badge variant={insurance === 'Yes' ? 'default' : 'destructive'}>{insurance}</Badge>;
    };

    return (
        <div className="relative max-h-[600px] overflow-auto border border-border rounded-md">
            <table className="w-full caption-bottom text-sm border-collapse">
                <thead style={{ position: 'sticky', top: 0, zIndex: 20 }} className="[&_tr]:border-b bg-background">
                    <tr className="border-border bg-background">
                        <th className="sticky left-0 z-30 min-w-[120px] border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            City
                        </th>
                        <th className="sticky left-[120px] z-30 min-w-[120px] border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Property
                        </th>
                        <th className="sticky left-[240px] z-30 min-w-[120px] border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Unit Name
                        </th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Tenants</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Lease Start</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Lease End</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Beds</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Baths</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Lease Status</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">New Lease</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Monthly Rent</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">
                            Recurring Transaction
                        </th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Utility Status</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Account Number</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Insurance</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Insurance Exp.</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Vacant</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Listed</th>
                        <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Applications</th>
                        {(hasEditPermission || hasDeletePermission) && (
                            <th className="border border-border bg-muted text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap">Actions</th>
                        )}
                    </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                    {units.map((unit) => (
                        <tr key={unit.id} className="border-border hover:bg-muted/50 border-b transition-colors">
                            <td className="sticky left-0 z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.city}
                            </td>
                            <td className="sticky left-[120px] z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.property}
                            </td>
                            <td className="sticky left-[240px] z-10 min-w-[120px] border border-border bg-muted text-center font-medium text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.unit_name}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.tenants || '-'}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {formatDateOnly(unit.lease_start)}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {formatDateOnly(unit.lease_end)}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.count_beds || '-'}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.count_baths || '-'}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.lease_status || '-'}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.is_new_lease || '-'}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                <span className="font-medium">{unit.formatted_monthly_rent}</span>
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                <div className="max-w-32 truncate" title={unit.recurring_transaction || ''}>
                                    {unit.recurring_transaction || '-'}
                                </div>
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                <div className="max-w-24 truncate" title={unit.utility_status || ''}>
                                    {unit.utility_status || '-'}
                                </div>
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                <div className="max-w-24 truncate" title={unit.account_number || ''}>
                                    {unit.account_number || '-'}
                                </div>
                            </td>
                            <td className="border border-border text-center p-2 align-middle whitespace-nowrap">
                                {getInsuranceBadge(unit.insurance)}
                            </td>
                            <td className="border border-border text-center text-foreground p-2 align-middle whitespace-nowrap">
                                {unit.insurance_expiration_date ? formatDateOnly(unit.insurance_expiration_date) : '-'}
                            </td>
                            <td className="border border-border text-center p-2 align-middle whitespace-nowrap">{getVacantBadge(unit.vacant)}</td>
                            <td className="border border-border text-center p-2 align-middle whitespace-nowrap">{getListedBadge(unit.listed)}</td>
                            <td className="border border-border text-center p-2 align-middle whitespace-nowrap">
                                <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                                    {unit.total_applications}
                                </Badge>
                            </td>
                            {(hasEditPermission || hasDeletePermission) && (
                                <td className="border border-border text-center p-2 align-middle whitespace-nowrap">
                                    <div className="flex gap-1">
                                        {hasEditPermission && (
                                            <Button variant="outline" size="sm" onClick={() => onEdit(unit)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        )}
                                        {hasDeletePermission && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onDelete(unit)}
                                                className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UnitsTable;
