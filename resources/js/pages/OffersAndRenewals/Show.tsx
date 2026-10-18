import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// import { usePermissions } from '@/hooks/usePermissions';
import AppLayout from '@/layouts/app-layout';
import {  OfferRenewalShowProps } from '@/types/OfferRenewal';
import { Head, Link, usePage } from '@inertiajs/react';
import { AlertTriangle, Calendar, CheckCircle, Clock, FileText, Home, Key, MapPin, User, XCircle } from 'lucide-react';
import React from 'react';

const Show: React.FC<OfferRenewalShowProps> = () => {
    const { offer, prevId, nextId, city_name, property_name, unit_name, tenant_name, is_hidden, lease_filter, perPage, page } = usePage().props as any;

    // const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    const formatDate = (date: string | null | undefined): string => {
        if (!date) return 'Not Set';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const formatDateTime = (date: string | null | undefined): string => {
        if (!date) return 'Not Set';
        try {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            console.error('Error formatting datetime:', error);
            return 'Invalid Date';
        }
    };

    const getStatusBadge = (status: string | null | undefined): React.ReactElement => {
        if (!status)
            return (
                <Badge variant="outline" className="text-xs">
                    N/A
                </Badge>
            );

        switch (status.toLowerCase()) {
            case 'accepted':
                return (
                    <Badge variant="default" className="border-green-200 bg-green-100 text-xs text-green-800">
                        {status}
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="border-yellow-200 bg-yellow-100 text-xs text-yellow-800">
                        {status}
                    </Badge>
                );
            case 'rejected':
            case "didn't accept":
                return (
                    <Badge variant="destructive" className="text-xs">
                        {status}
                    </Badge>
                );
            case "didn't respond":
                return (
                    <Badge variant="secondary" className="border-gray-200 bg-gray-100 text-xs text-gray-800">
                        {status}
                    </Badge>
                );
            default:
                return (
                    <Badge variant="default" className="text-xs">
                        {status}
                    </Badge>
                );
        }
    };

    const getYesNoBadge = (value: string | null | undefined): React.ReactElement => {
        if (!value || value === '-')
            return (
                <Badge variant="outline" className="text-xs">
                    N/A
                </Badge>
            );

        const isPositive = value.toLowerCase() === 'yes' || value.toLowerCase() === 'signed';

        return (
            <Badge
                variant={isPositive ? 'default' : 'secondary'}
                className={`text-xs ${isPositive ? 'border-green-200 bg-green-100 text-green-800' : 'border-gray-200 bg-gray-100 text-gray-600'}`}
            >
                {value}
            </Badge>
        );
    };

    const getDaysLeftBadge = (days: string | number | null | undefined): React.ReactElement => {
        if (days === null || days === undefined || days === '') {
            return (
                <Badge variant="outline" className="text-xs">
                    N/A
                </Badge>
            );
        }

        const numDays = typeof days === 'string' ? parseInt(days, 10) : days;

        if (isNaN(numDays)) {
            return (
                <Badge variant="outline" className="text-xs">
                    N/A
                </Badge>
            );
        }

        if (numDays <= 0) {
            return (
                <Badge variant="destructive" className="text-xs">
                    Expired
                </Badge>
            );
        } else if (numDays <= 7) {
            return (
                <Badge variant="destructive" className="text-xs">
                    {numDays} days left
                </Badge>
            );
        } else if (numDays <= 30) {
            return (
                <Badge variant="secondary" className="border-yellow-200 bg-yellow-100 text-xs text-yellow-800">
                    {numDays} days left
                </Badge>
            );
        } else {
            return (
                <Badge variant="default" className="border-green-200 bg-green-100 text-xs text-green-800">
                    {numDays} days left
                </Badge>
            );
        }
    };

    const getExpiredBadge = (expired: string | null | undefined): React.ReactElement => {
        if (!expired)
            return (
                <Badge variant="default" className="text-xs">
                    Active
                </Badge>
            );

        return (
            <Badge variant={expired.toLowerCase() === 'expired' ? 'destructive' : 'default'} className="text-xs">
                {expired.charAt(0).toUpperCase() + expired.slice(1)}
            </Badge>
        );
    };

    const InfoItem = ({
        icon: Icon,
        label,
        value,
        className = '',
    }: {
        icon: React.ComponentType<{ className?: string }>;
        label: string;
        value: React.ReactNode;
        className?: string;
    }) => (
        <div className={`flex items-start gap-3 rounded-lg bg-gray-50/50 p-3 ${className}`}>
            <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">{label}</p>
                <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
            </div>
        </div>
    );

    // Safe access to offer properties with fallbacks
    const safeOffer = {
        id: offer?.id || 0,
        tenant_id: offer?.tenant_id,
        city_name: offer?.city_name,
        property: offer?.property,
        unit: offer?.unit,
        tenant: offer?.tenant,
        other_tenants: offer?.other_tenants,
        date_sent_offer: offer?.date_sent_offer,
        date_offer_expires: offer?.date_offer_expires,
        status: offer?.status,
        date_of_acceptance: offer?.date_of_acceptance,
        date_of_decline: offer?.date_of_decline,
        last_notice_sent: offer?.last_notice_sent,
        notice_kind: offer?.notice_kind,
        lease_sent: offer?.lease_sent,
        date_sent_lease: offer?.date_sent_lease,
        lease_expires: offer?.lease_expires,
        lease_signed: offer?.lease_signed,
        date_signed: offer?.date_signed,
        last_notice_sent_2: offer?.last_notice_sent_2,
        notice_kind_2: offer?.notice_kind_2,
        notes: offer?.notes,
        how_many_days_left: offer?.how_many_days_left,
        expired: offer?.expired,
        is_archived: offer?.is_archived,
        created_at: offer?.created_at,
        updated_at: offer?.updated_at,
    };

    // Check if status is "didn't accept" to show additional fields
    const shouldShowDeclineFields = safeOffer.status?.toLowerCase() === "didn't accept";

    return (
        <AppLayout>
            <Head title={`Offer & Renewal Details #${safeOffer.id}`} />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Offer & Renewal Record #{safeOffer.id}</h1>
                                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>
                                        {safeOffer.city_name && `${safeOffer.city_name} • `}
                                        {safeOffer.property || 'N/A'} • {safeOffer.unit || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex gap-2">
                                    {prevId && Number(prevId) !== Number(safeOffer.id) ? (
                                        <Link
                                            href={`/offers_and_renewals/${prevId}?${new URLSearchParams({
                                                city_name: city_name || '',
                                                property_name: property_name || '',
                                                unit_name: unit_name || '',
                                                tenant_name: tenant_name || '',
                                                is_hidden: is_hidden ? 'true' : '',
                                                lease_filter: lease_filter || '',
                                                per_page: String(perPage || ''),
                                                page: String(page || ''),
                                            }).toString()}`}
                                        >
                                            <Button variant="outline">Previous</Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" disabled>
                                            Previous
                                        </Button>
                                    )}
                                    {nextId && Number(nextId) !== Number(safeOffer.id) ? (
                                        <Link
                                            href={`/offers_and_renewals/${nextId}?${new URLSearchParams({
                                                city_name: city_name || '',
                                                property_name: property_name || '',
                                                unit_name: unit_name || '',
                                                tenant_name: tenant_name || '',
                                                is_hidden: is_hidden ? 'true' : '',
                                                lease_filter: lease_filter || '',
                                                per_page: String(perPage || ''),
                                                page: String(page || ''),
                                            }).toString()}`}
                                        >
                                            <Button variant="outline">Next</Button>
                                        </Link>
                                    ) : (
                                        <Button variant="outline" disabled>
                                            Next
                                        </Button>
                                    )}
                                </div>
                                {/* {hasAllPermissions(['offers-and-renewals.edit','offers-and-renewals.update']) && (
                                    <Link href={`/offers_and_renewals/${safeOffer.id}/edit`}>
                                        <Button className="bg-blue-600 hover:bg-blue-700">
                                            Edit Record
                                        </Button>
                                    </Link>
                                )} */}
                                <Link
                                    href={`/offers_and_renewals?${new URLSearchParams({
                                        city_name: city_name || '',
                                        property_name: property_name || '',
                                        unit_name: unit_name || '',
                                        tenant_name: tenant_name || '',
                                        is_hidden: is_hidden ? 'true' : '',
                                        lease_filter: lease_filter || '',
                                        per_page: String(perPage || ''),
                                        page: String(page || ''),
                                    }).toString()}`}
                                >
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Property Hierarchy Card */}
                    <Card className="mb-6 border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                                <InfoItem icon={MapPin} label="City" value={safeOffer.city_name || 'N/A'} className="bg-indigo-50/50" />
                                <InfoItem icon={Home} label="Property" value={safeOffer.property || 'N/A'} className="bg-blue-50/50" />
                                <InfoItem icon={Home} label="Unit" value={safeOffer.unit || 'N/A'} className="bg-green-50/50" />
                                <InfoItem icon={User} label="Tenant" value={safeOffer.tenant || 'N/A'} className="bg-purple-50/50" />
                                <InfoItem icon={User} label="Other Tenants" value={safeOffer.other_tenants || 'N/A'} className="bg-orange-50/50" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Overview Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <AlertTriangle className="h-5 w-5" />
                                Status Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-lg border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Current Status</p>
                                    </div>
                                    <div className="text-lg font-bold text-blue-900">{getStatusBadge(safeOffer.status)}</div>
                                </div>
                                <div className="rounded-lg border border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                        <p className="text-sm font-medium text-yellow-800">Days Remaining</p>
                                    </div>
                                    <div className="text-lg font-bold text-yellow-900">{getDaysLeftBadge(safeOffer.how_many_days_left)}</div>
                                </div>
                                <div className="rounded-lg border border-red-200 bg-gradient-to-br from-red-50 to-red-100 p-4">
                                    <div className="mb-2 flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-sm font-medium text-red-800">Expiration Status</p>
                                    </div>
                                    <div className="text-lg font-bold text-red-900">{getExpiredBadge(safeOffer.expired)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Conditional Content Based on Status */}
                    {shouldShowDeclineFields ? (
                        /* Show only decline information when status is "didn't accept" */
                        <Card className="mb-6 border-l-4 border-l-red-500">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <XCircle className="h-5 w-5" />
                                    Decline Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">
                                    <InfoItem 
                                        icon={Calendar} 
                                        label="Date of Decline" 
                                        value={formatDate(safeOffer.date_of_decline)} 
                                        className="bg-red-50/50" 
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        /* Show offer, lease, and notice information for all other statuses */
                        <>
                            {/* Main Information Grid */}
                            <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                                {/* Offer Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <FileText className="h-5 w-5" />
                                            Offer Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <InfoItem icon={Calendar} label="Date Sent Offer" value={formatDate(safeOffer.date_sent_offer)} />
                                            <InfoItem icon={Calendar} label="Offer Expires" value={formatDate(safeOffer.date_offer_expires)} />
                                            <InfoItem icon={CheckCircle} label="Date of Acceptance" value={formatDate(safeOffer.date_of_acceptance)} />
                                            <InfoItem icon={Clock} label="Days Left" value={getDaysLeftBadge(safeOffer.how_many_days_left)} />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Lease Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Key className="h-5 w-5" />
                                            Lease Information
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-3">
                                            <InfoItem icon={FileText} label="Lease Sent" value={getYesNoBadge(safeOffer.lease_sent)} />
                                            <InfoItem icon={Calendar} label="Date Sent Lease" value={formatDate(safeOffer.date_sent_lease)} />
                                            <InfoItem icon={Calendar} label="Lease Expires" value={formatDate(safeOffer.lease_expires)} />
                                            <InfoItem icon={CheckCircle} label="Lease Signed" value={getYesNoBadge(safeOffer.lease_signed)} />
                                            <InfoItem icon={Calendar} label="Date Signed" value={formatDate(safeOffer.date_signed)} />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Notice Information Section */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertTriangle className="h-5 w-5" />
                                        Notice Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        <div className="space-y-3">
                                            <h4 className="mb-3 font-semibold text-gray-900">Offer Notice</h4>
                                            <InfoItem icon={Calendar} label="Last Notice Sent" value={formatDate(safeOffer.last_notice_sent)} />
                                            <InfoItem icon={FileText} label="Notice Kind" value={safeOffer.notice_kind || 'N/A'} />
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="mb-3 font-semibold text-gray-900">Renewal Notice</h4>
                                            <InfoItem icon={Calendar} label="2nd Last Notice Sent" value={formatDate(safeOffer.last_notice_sent_2)} />
                                            <InfoItem icon={FileText} label="2nd Notice Kind" value={safeOffer.notice_kind_2 || 'N/A'} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {/* Detailed Information Section */}
                    <div className="space-y-6">

                        {/* Notes Section */}
                        {safeOffer.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FileText className="h-5 w-5" />
                                        Additional Notes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{safeOffer.notes}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Footer Section */}
                    <Card className="mt-8 bg-gray-50">
                        <CardContent className="pt-6">
                            <Separator className="mb-4" />
                            <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 sm:grid-cols-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Created: {formatDateTime(safeOffer.created_at)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Last Updated: {formatDateTime(safeOffer.updated_at)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

export default Show;
