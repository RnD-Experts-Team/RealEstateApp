import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { OfferFilters } from '@/types/OfferRenewal';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { Edit, Eye, EyeOff, Trash2 } from 'lucide-react';
import React from 'react';

interface OfferRenewal {
    id: number;
    tenant_id?: number;
    city_name?: string;
    property?: string;
    unit?: string;
    tenant?: string;
    date_sent_offer?: string;
    date_offer_expires?: string;
    status?: string;
    date_of_acceptance?: string;
    last_notice_sent?: string;
    notice_kind?: string;
    lease_sent?: string;
    date_sent_lease?: string;
    lease_expires?: string;
    lease_signed?: string;
    date_signed?: string;
    last_notice_sent_2?: string;
    notice_kind_2?: string;
    notes?: string;
    how_many_days_left?: number;
    expired?: string;
    other_tenants?: string;
    date_of_decline?: string;
    is_archived?: boolean;
    is_hidden?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface OffersTableRowProps {
    offer: OfferRenewal;
    activeTab: 'offers' | 'renewals' | 'both';
    onEdit: (offer: OfferRenewal) => void;
    onDelete: (offer: OfferRenewal) => void;
    onToggleHidden: (offer: OfferRenewal) => void;
    permissions: {
        canView: boolean;
        canEdit: boolean;
        canDelete: boolean;
        canHide: boolean;
    };
    currentFilters: OfferFilters;
    perPage: string | number;
    page: number;
}

const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="outline">N/A</Badge>;

    switch (status.toLowerCase()) {
        case 'accepted':
            return (
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    {status}
                </Badge>
            );
        case 'pending':
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                    {status}
                </Badge>
            );
        case 'rejected':
            return <Badge variant="destructive">{status}</Badge>;
        default:
            return <Badge variant="default">{status}</Badge>;
    }
};

const getYesNoBadge = (value: string | null) => {
    if (!value || value === '-') return <Badge variant="outline">N/A</Badge>;
    // lease_signed uses 'Signed'/'Unsigned' rather than 'Yes'/'No'
    const positive = value === 'Yes' || value === 'Signed';
    return (
        <Badge
            variant={positive ? 'default' : 'secondary'}
            className={
                positive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }
        >
            {value}
        </Badge>
    );
};

const getDaysLeftBadge = (days: string | number | null) => {
    if (!days && days !== 0) return <Badge variant="outline">N/A</Badge>;
    const numDays = typeof days === 'string' ? parseInt(days) : days;
    if (numDays <= 7) {
        return <Badge variant="destructive">{days} days</Badge>;
    } else if (numDays <= 30) {
        return (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                {days} days
            </Badge>
        );
    } else {
        return (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {days} days
            </Badge>
        );
    }
};

export const OffersTableRow: React.FC<OffersTableRowProps> = ({
    offer,
    activeTab,
    onEdit,
    onDelete,
    onToggleHidden,
    permissions,
    currentFilters,
    perPage,
    page,
}) => {
    return (
        <TableRow className="border-border hover:bg-muted/50">
            <TableCell className="sticky left-0 z-10 border border-border bg-muted text-center font-medium text-foreground">
                {offer.city_name || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[120px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {offer.property || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[270px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {offer.unit || 'N/A'}
            </TableCell>
            <TableCell className="sticky left-[390px] z-10 border border-border bg-muted text-center font-medium text-foreground">
                {offer.tenant || 'N/A'}
            </TableCell>

            {(activeTab === 'offers' || activeTab === 'both') && (
                <>
                    <TableCell className="border border-border text-center text-foreground">
                        {offer.other_tenants ? (
                            <div className="max-w-32 truncate" title={offer.other_tenants}>
                                {offer.other_tenants}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )}
                    </TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.date_of_decline)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.date_sent_offer)}</TableCell>
                    <TableCell className="border border-border text-center">{getStatusBadge(offer.status ?? null)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.date_of_acceptance)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.last_notice_sent)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">
                        {offer.notice_kind || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                </>
            )}

            {(activeTab === 'renewals' || activeTab === 'both') && (
                <>
                    <TableCell className="border border-border text-center">{getYesNoBadge(offer.lease_sent ?? null)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.date_sent_lease)}</TableCell>
                    <TableCell className="border border-border text-center">{getYesNoBadge(offer.lease_signed ?? null)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.date_signed)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">{formatDateOnly(offer.last_notice_sent_2)}</TableCell>
                    <TableCell className="border border-border text-center text-foreground">
                        {offer.notice_kind_2 || <span className="text-muted-foreground">N/A</span>}
                    </TableCell>
                    <TableCell className="border border-border text-center">
                        {offer.notes ? (
                            <div className="max-w-24 truncate" title={offer.notes}>
                                {offer.notes}
                            </div>
                        ) : (
                            <span className="text-muted-foreground">N/A</span>
                        )}
                    </TableCell>
                </>
            )}

            <TableCell className="border border-border text-center">{getDaysLeftBadge(offer.how_many_days_left ?? null)}</TableCell>
            <TableCell className="border border-border text-center">
                <Badge variant={offer.expired === 'expired' ? 'destructive' : 'default'}>{offer.expired ?? 'N/A'}</Badge>
            </TableCell>

            {(permissions.canView || permissions.canEdit || permissions.canDelete || permissions.canHide) && (
                <TableCell className="border border-border text-center">
                    <div className="flex gap-1">
                        {permissions.canView && (
                            <Link
                                href={`/offers_and_renewals/${offer.id}?${new URLSearchParams({
                                    city_name: currentFilters.city || '',
                                    property_name: currentFilters.property || '',
                                    unit_name: currentFilters.unit || '',
                                    tenant_name: currentFilters.tenant || '',
                                    is_hidden: currentFilters.is_hidden ? 'true' : '',
                                    lease_filter: currentFilters.lease || '',
                                    per_page: String(perPage || ''),
                                    page: String(page || ''),
                                }).toString()}`}
                            >
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4" />
                                </Button>
                            </Link>
                        )}
                        {permissions.canEdit && (
                            <Button variant="outline" size="sm" onClick={() => onEdit(offer)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                        )}
                        {permissions.canHide &&
                            (offer.is_hidden ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onToggleHidden(offer)}
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-400 dark:hover:bg-blue-950"
                                    title="Unhide"
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onToggleHidden(offer)}
                                    className="border-yellow-200 text-yellow-600 hover:bg-yellow-50 dark:border-yellow-900 dark:text-yellow-400 dark:hover:bg-yellow-950"
                                    title="Hide"
                                >
                                    <EyeOff className="h-4 w-4" />
                                </Button>
                            ))}
                        {permissions.canDelete && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDelete(offer)}
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
};
