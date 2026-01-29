// resources/js/Components/OffersAndRenewalsInformation.tsx

import { useState } from 'react';
import { OffersAndRenewal } from '@/types/dashboard';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  ChevronUp, 
  Handshake, 
  Calendar, 
  FileText, 
  Bell, 
//   User,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Send,
  FileCheck,
//   Archive,
  StickyNote,
  CalendarX,
  TimerIcon
} from 'lucide-react';

interface Props {
    offersAndRenewals: OffersAndRenewal[];
    selectedUnitId: number | null;
}

export default function OffersAndRenewalsInformation({ offersAndRenewals, selectedUnitId }: Props) {
    const [openOffers, setOpenOffers] = useState<{ [key: number]: boolean }>({});

    const toggleOffer = (offerId: number) => {
        setOpenOffers(prev => ({
            ...prev,
            [offerId]: !prev[offerId]
        }));
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('signed') || lowerStatus.includes('accepted')) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus.includes('expired') || lowerStatus.includes('rejected')) {
            return <XCircle className="h-4 w-4 text-red-600" />;
        } else if (lowerStatus.includes('pending') || lowerStatus.includes('sent')) {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        }
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('signed') || lowerStatus.includes('accepted')) {
            return "default";
        } else if (lowerStatus.includes('expired') || lowerStatus.includes('rejected')) {
            return "destructive";
        } else if (lowerStatus.includes('pending') || lowerStatus.includes('sent')) {
            return "outline";
        }
        return "secondary";
    };

    const getDaysLeftColor = (daysLeft: number | undefined) => {
        if (daysLeft === undefined) return "text-gray-900";
        if (daysLeft <= 3) return "text-red-600";
        if (daysLeft <= 7) return "text-yellow-600";
        return "text-green-600";
    };

    const getDaysLeftIcon = (daysLeft: number | undefined) => {
        if (daysLeft === undefined) return <Clock className="h-4 w-4 text-gray-400" />;
        if (daysLeft <= 3) return <AlertTriangle className="h-4 w-4 text-red-600" />;
        if (daysLeft <= 7) return <TimerIcon className="h-4 w-4 text-yellow-600" />;
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Offers and Renewals</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Lease offers and renewal records for {offersAndRenewals.length} record{offersAndRenewals.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {offersAndRenewals.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No offers and renewals found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {offersAndRenewals.length > 0 && (
                <CardContent className="space-y-4">
                    {offersAndRenewals.map((offerRenewal) => (
                        <Collapsible
                            key={offerRenewal.id}
                            open={openOffers[offerRenewal.id]}
                            onOpenChange={() => toggleOffer(offerRenewal.id)}
                        >
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full p-0 h-auto hover:bg-transparent"
                                    >
                                        <CardHeader className="w-full">
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                <div className="flex items-center space-x-3 min-w-0 flex-1">
                                                    <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                                                        <Handshake className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <CardTitle className="text-lg sm:text-xl truncate">
                                                            {offerRenewal.tenant_name || 'Unknown Tenant'}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                                            {offerRenewal.date_of_acceptance_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                                                    <span className="truncate">Accepted: {offerRenewal.date_of_acceptance_formatted}</span>
                                                                </span>
                                                            )}
                                                            {offerRenewal.how_many_days_left !== undefined && (
                                                                <span className={`flex items-center ${getDaysLeftColor(offerRenewal.how_many_days_left)}`}>
                                                                    {getDaysLeftIcon(offerRenewal.how_many_days_left)}
                                                                    <span className="ml-1 truncate">{offerRenewal.how_many_days_left} days left</span>
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <Badge 
                                                            variant={offerRenewal.is_archived ? "destructive" : "default"}
                                                            className="px-2 py-1 sm:px-3 text-xs sm:text-sm"
                                                        >
                                                            {offerRenewal.is_archived ? 'Archived' : 'Active'}
                                                        </Badge>
                                                        {offerRenewal.status && (
                                                            <div className="flex items-center space-x-1">
                                                                {getStatusIcon(offerRenewal.status)}
                                                                <Badge variant={getStatusBadgeVariant(offerRenewal.status)} className="text-xs">
                                                                    {offerRenewal.status}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {offerRenewal.expired && (
                                                            <Badge 
                                                                variant={offerRenewal.expired === 'Yes' ? "destructive" : "default"}
                                                                className="text-xs"
                                                            >
                                                                <CalendarX className="h-3 w-3 mr-1 flex-shrink-0" />
                                                                {offerRenewal.expired === 'Yes' ? 'Expired' : 'Valid'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {openOffers[offerRenewal.id] ? (
                                                        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <Separator className="mb-6" />

                                        {/* Quick Status Overview */}
                                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <Card className="bg-blue-50 border-blue-200">
                                                <CardContent className="p-4">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <Calendar className="h-4 w-4 text-blue-600" />
                                                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                            Date of Acceptance
                                                        </label>
                                                    </div>
                                                    <p className="text-sm font-medium text-blue-900">
                                                        {offerRenewal.date_of_acceptance_formatted || 'N/A'}
                                                    </p>
                                                </CardContent>
                                            </Card>

                                            {offerRenewal.how_many_days_left !== undefined && (
                                                <Card className={`${
                                                    offerRenewal.how_many_days_left <= 3 ? 'bg-red-50 border-red-200' :
                                                    offerRenewal.how_many_days_left <= 7 ? 'bg-yellow-50 border-yellow-200' :
                                                    'bg-green-50 border-green-200'
                                                }`}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            {getDaysLeftIcon(offerRenewal.how_many_days_left)}
                                                            <label className={`text-xs font-semibold uppercase tracking-wide ${
                                                                offerRenewal.how_many_days_left <= 3 ? 'text-red-700' :
                                                                offerRenewal.how_many_days_left <= 7 ? 'text-yellow-700' :
                                                                'text-green-700'
                                                            }`}>
                                                                Days Left
                                                            </label>
                                                        </div>
                                                        <p className={`text-lg font-bold ${getDaysLeftColor(offerRenewal.how_many_days_left)}`}>
                                                            {offerRenewal.how_many_days_left} days
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            )}

                                            {offerRenewal.expired && (
                                                <Card className={`${
                                                    offerRenewal.expired === 'Yes' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
                                                }`}>
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            {offerRenewal.expired === 'Yes' ? (
                                                                <CalendarX className="h-4 w-4 text-red-600" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            )}
                                                            <label className={`text-xs font-semibold uppercase tracking-wide ${
                                                                offerRenewal.expired === 'Yes' ? 'text-red-700' : 'text-green-700'
                                                            }`}>
                                                                Expiration Status
                                                            </label>
                                                        </div>
                                                        <Badge 
                                                            variant={offerRenewal.expired === 'Yes' ? "destructive" : "default"}
                                                            className="font-semibold"
                                                        >
                                                            {offerRenewal.expired === 'Yes' ? 'Expired' : 'Valid'}
                                                        </Badge>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {/* Offer Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Handshake className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Offer Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Send className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Date Sent Offer
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {offerRenewal.date_sent_offer_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <CalendarX className="h-4 w-4 text-red-600" />
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Offer Expires
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-red-900">
                                                                {offerRenewal.date_offer_expires_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileCheck className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Lease Signed
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {offerRenewal.lease_signed === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-green-900">
                                                                    {offerRenewal.lease_signed || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Date Signed
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {offerRenewal.date_signed_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Notice Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Bell className="h-5 w-5 text-purple-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Notice Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Bell className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Last Notice Sent
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-purple-900">
                                                                {offerRenewal.last_notice_sent_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Notice Kind
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {offerRenewal.notice_kind || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Bell className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Renewal Last Notice Sent
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {offerRenewal.last_notice_sent_2_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Renewal Notice Kind
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {offerRenewal.notice_kind_2 || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Lease Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <FileCheck className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Lease Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-emerald-50 border-emerald-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Send className="h-4 w-4 text-emerald-600" />
                                                                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                    Lease Sent
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {offerRenewal.lease_sent === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-emerald-900">
                                                                    {offerRenewal.lease_sent || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Date Sent Lease
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {offerRenewal.date_sent_lease_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <CalendarX className="h-4 w-4 text-red-600" />
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Lease Expires
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-red-900">
                                                                {offerRenewal.lease_expires_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {offerRenewal.notes && (
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <StickyNote className="h-5 w-5 text-amber-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Notes
                                                    </h4>
                                                </div>
                                                <Card className="bg-amber-50 border-amber-200">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm text-amber-900 whitespace-pre-wrap">
                                                            {offerRenewal.notes}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        )}
                                    </CardContent>
                                </CollapsibleContent>
                            </Card>
                        </Collapsible>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}
