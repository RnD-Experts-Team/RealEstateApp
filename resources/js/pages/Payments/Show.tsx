import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Payment, PaymentFilters } from '@/types/payments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Home, Calendar, DollarSign, FileText, AlertCircle, User, Clock, EyeOff } from 'lucide-react';

interface Props {
    payment: Payment;
    prevPaymentId?: number | null;
    nextPaymentId?: number | null;
    filters?: PaymentFilters;
}

export default function Show({ payment, prevPaymentId, nextPaymentId, filters }: Props) {

    const buildShowRoute = (id: number) => {
        const query: Record<string, any> = { payment: id };
        if (filters) {
            if (filters.city) query.city = filters.city;
            if (filters.property) query.property = filters.property;
            if (filters.unit) query.unit = filters.unit;
            if (filters.permanent && filters.permanent.length > 0) query.permanent = filters.permanent.join(',');
            if (typeof filters.is_hidden === 'boolean') query.is_hidden = filters.is_hidden ? 'true' : 'false';
            if (typeof filters.remind === 'boolean') query.remind = String(filters.remind);
            if (typeof filters.added_to_ledger === 'boolean') query.added_to_ledger = String(filters.added_to_ledger);
        }
        return route('payments.show', query);
    };

    const buildIndexRoute = () => {
        const query: Record<string, any> = {};
        if (filters) {
            if (filters.city) query.city = filters.city;
            if (filters.property) query.property = filters.property;
            if (filters.unit) query.unit = filters.unit;
            if (filters.permanent && filters.permanent.length > 0) query.permanent = filters.permanent.join(',');
            if (filters.is_hidden === true) query.is_hidden = 'true';
            if (typeof filters.remind === 'boolean') query.remind = String(filters.remind);
            if (typeof filters.added_to_ledger === 'boolean') query.added_to_ledger = String(filters.added_to_ledger);
        }
        return route('payments.index', query);
    };

    const formatCurrency = (amount: number | null) => {
        if (amount === null) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline">No Status</Badge>;
        const lowered = status.toLowerCase();
        const isPaid = lowered.includes('paid');
        const isPending = lowered.includes('pending');
        const classes = isPaid
            ? 'bg-green-100 text-green-800 border-green-200'
            : isPending
                ? 'bg-orange-100 text-orange-800 border-orange-200'
                : 'bg-gray-100 text-gray-700 border-gray-200';
        return (
            <Badge variant={isPaid ? 'default' : isPending ? 'secondary' : 'outline'} className={`text-xs ${classes}`}>
                {status}
            </Badge>
        );
    };

    const getYesNoBadge = (
        value: 'Yes' | 'No' | string | number | boolean | null
    ) => {
        if (value === null || value === '') {
            return <Badge variant="outline" className="text-xs">N/A</Badge>;
        }

        let isYes = false;
        let isNo = false;

        if (typeof value === 'number') {
            isYes = value === 1;
            isNo = value === 0;
        } else if (typeof value === 'boolean') {
            isYes = value === true;
            isNo = value === false;
        } else {
            const lowered = String(value).trim().toLowerCase();
            isYes = lowered === 'yes' || lowered === '1' || lowered === 'true';
            isNo = lowered === 'no' || lowered === '0' || lowered === 'false';
        }

        const displayText = isYes ? 'Yes' : isNo ? 'No' : String(value);
        const isAffirmative = isYes;

        return (
            <Badge
                variant={isAffirmative ? 'default' : 'secondary'}
                className={`text-xs ${
                    isAffirmative
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                }`}
            >
                {displayText}
            </Badge>
        );
    };

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const InfoItem = ({ icon: Icon, label, value, className = "" }: {
        icon: any;
        label: string;
        value: React.ReactNode;
        className?: string;
    }) => (
        <div className={`flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 ${className}`}>
            <Icon className="h-4 w-4 mt-0.5 text-gray-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                <div className="text-sm font-semibold text-gray-900 mt-1">{value}</div>
            </div>
        </div>
    );


    return (
        <AppLayout>
            <Head title={`Payment Details #${payment.id}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Payment Record #{payment.id}</h1>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>{payment.city || 'N/A'} • {payment.property_name || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Link href={buildIndexRoute()}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        disabled={!prevPaymentId}
                                        asChild
                                    >
                                        {prevPaymentId ? (
                                            <Link href={buildShowRoute(prevPaymentId)}>Previous</Link>
                                        ) : (
                                            <span>Previous</span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={!nextPaymentId}
                                        asChild
                                    >
                                        {nextPaymentId ? (
                                            <Link href={buildShowRoute(nextPaymentId)}>Next</Link>
                                        ) : (
                                            <span>Next</span>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property Hierarchy Card */}
                    <Card className="mb-6 border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <InfoItem
                                    icon={MapPin}
                                    label="City"
                                    value={payment.city || 'N/A'}
                                    className="bg-blue-50/50"
                                />
                                <InfoItem
                                    icon={Home}
                                    label="Property"
                                    value={payment.property_name || 'N/A'}
                                    className="bg-green-50/50"
                                />
                                <InfoItem
                                    icon={Home}
                                    label="Unit"
                                    value={payment.unit_name || 'N/A'}
                                    className="bg-purple-50/50"
                                />
                                <InfoItem
                                    icon={User}
                                    label="Permanent"
                                    value={getYesNoBadge(payment.permanent as any)}
                                    className="bg-orange-50/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Financial Highlights Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <DollarSign className="h-5 w-5" />
                                Financial Highlights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="h-4 w-4 text-red-600" />
                                        <p className="text-sm font-medium text-red-800">Amount Owed</p>
                                    </div>
                                    <p className="text-lg font-bold text-red-900">
                                        {formatCurrency(payment.owes)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Amount Paid</p>
                                    </div>
                                    <p className="text-lg font-bold text-blue-900">
                                        {formatCurrency(payment.paid)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-medium text-green-800">Left to Pay</p>
                                    </div>
                                    <p className="text-lg font-bold text-green-900">
                                        {formatCurrency(payment.left_to_pay)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-gray-600" />
                                        <p className="text-sm font-medium text-gray-800">Status</p>
                                    </div>
                                    <div className="text-lg font-bold">
                                        {getStatusBadge(payment.status)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Calendar className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <InfoItem
                                        icon={Calendar}
                                        label="Date"
                                        value={formatDate(payment.date)}
                                    />
                                    <InfoItem
                                        icon={EyeOff}
                                        label="Hidden"
                                        value={getYesNoBadge(payment.is_hidden as any)}
                                    />
                                    <InfoItem
                                        icon={AlertCircle}
                                        label="Remind"
                                        value={getYesNoBadge(payment.remind as any)}
                                    />
                                    <InfoItem
                                        icon={FileText}
                                        label="Added to Ledger"
                                        value={getYesNoBadge(payment.added_to_ledger as any)}
                                    />
                                    {payment.reversed_payments && (
                                        <InfoItem
                                            icon={FileText}
                                            label="Reversed Payments"
                                            value={payment.reversed_payments}
                                        />
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assistance */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Assistance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <InfoItem
                                        icon={FileText}
                                        label="Has Assistance"
                                        value={getYesNoBadge(payment.has_assistance as any)}
                                    />
                                    <InfoItem
                                        icon={DollarSign}
                                        label="Assistance Amount"
                                        value={formatCurrency(payment.assistance_amount as any)}
                                    />
                                    <InfoItem
                                        icon={User}
                                        label="Assistance Company"
                                        value={payment.assistance_company || 'N/A'}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Notes Section */}
                    {payment.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {payment.notes}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer Section */}
                    <Card className="mt-8 bg-gray-50">
                        <CardContent className="pt-6">
                            <Separator className="mb-4" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Created: {new Date(payment.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Last Updated: {new Date(payment.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
