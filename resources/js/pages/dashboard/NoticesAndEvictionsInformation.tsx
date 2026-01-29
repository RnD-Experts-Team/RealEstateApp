// resources/js/Components/NoticesAndEvictionsInformation.tsx

import { useState } from 'react';
import { NoticeAndEviction } from '@/types/dashboard';
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
  AlertTriangle, 
  Calendar, 
  FileText, 
  Gavel, 
  User,
  AlertCircle,
  Clock,
  Scale,
  CheckCircle,
  XCircle,
  Archive,
  StickyNote,
  Banknote,
  Shield
} from 'lucide-react';

interface Props {
    noticesAndEvictions: NoticeAndEviction[];
    selectedUnitId: number | null;
}

export default function NoticesAndEvictionsInformation({ noticesAndEvictions, selectedUnitId }: Props) {
    const [openNotices, setOpenNotices] = useState<{ [key: number]: boolean }>({});

    const toggleNotice = (noticeId: number) => {
        setOpenNotices(prev => ({
            ...prev,
            [noticeId]: !prev[noticeId]
        }));
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'resolved') {
            return "default";
        } else if (lowerStatus === 'active') {
            return "destructive";
        } else if (lowerStatus === 'pending') {
            return "outline";
        }
        return "secondary";
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <AlertCircle className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'resolved') {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'active') {
            return <AlertTriangle className="h-4 w-4 text-red-600" />;
        } else if (lowerStatus === 'pending') {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        }
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    };

    const getNoticeTypeIcon = (type: string | null | undefined) => {
        if (!type) return <FileText className="h-5 w-5 text-gray-600" />;
        
        const lowerType = type.toLowerCase();
        if (lowerType.includes('eviction')) {
            return <Gavel className="h-5 w-5 text-red-600" />;
        } else if (lowerType.includes('notice')) {
            return <AlertTriangle className="h-5 w-5 text-orange-600" />;
        }
        return <FileText className="h-5 w-5 text-blue-600" />;
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Notices and Evictions Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Legal proceedings and notices for {noticesAndEvictions.length} record{noticesAndEvictions.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {noticesAndEvictions.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No notices or evictions found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {noticesAndEvictions.length > 0 && (
                <CardContent className="space-y-4">
                    {noticesAndEvictions.map((noticeEviction) => (
                        <Collapsible
                            key={noticeEviction.id}
                            open={openNotices[noticeEviction.id]}
                            onOpenChange={() => toggleNotice(noticeEviction.id)}
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
                                                    <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
                                                        {getNoticeTypeIcon(noticeEviction.type_of_notice)}
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <CardTitle className="text-lg sm:text-xl truncate">
                                                            {noticeEviction.type_of_notice || 'Notice/Eviction'} #{noticeEviction.id}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                                            <span className="flex items-center">
                                                                <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                <span className="truncate">Tenant: {noticeEviction.tenant_name || 'N/A'}</span>
                                                            </span>
                                                            {noticeEviction.date_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                    <span className="truncate">{noticeEviction.date_formatted}</span>
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(noticeEviction.status)}
                                                        <Badge 
                                                            variant={getStatusBadgeVariant(noticeEviction.status)}
                                                            className="px-3 py-1"
                                                        >
                                                            {noticeEviction.status || 'N/A'}
                                                        </Badge>
                                                    </div>
                                                    {noticeEviction.is_archived && (
                                                        <Badge variant="secondary" className="px-2 py-1">
                                                            <Archive className="h-3 w-3 mr-1" />
                                                            Archived
                                                        </Badge>
                                                    )}
                                                    {openNotices[noticeEviction.id] ? (
                                                        <ChevronUp className="h-5 w-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-500" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Button>
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <CardContent className="pt-0">
                                        <Separator className="mb-6" />
                                        
                                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                            {/* Notice Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Notice Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-orange-50 border-orange-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-orange-600" />
                                                                <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                    Type of Notice
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-orange-900">
                                                                {noticeEviction.type_of_notice || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {noticeEviction.date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <AlertCircle className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(noticeEviction.status)}
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {noticeEviction.status || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-yellow-50 border-yellow-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                                <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                                                                    If Left
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-yellow-900">
                                                                {noticeEviction.if_left || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Eviction Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Gavel className="h-5 w-5 text-red-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Eviction Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Gavel className="h-4 w-4 text-red-600" />
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Evictions
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-red-900">
                                                                {noticeEviction.evictions || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Scale className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Sent to Attorney
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-purple-900">
                                                                {noticeEviction.sent_to_atorney || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Hearing Dates
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {noticeEviction.hearing_dates_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Writ Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {noticeEviction.writ_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Additional Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Shield className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Additional Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-emerald-50 border-emerald-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Banknote className="h-4 w-4 text-emerald-600" />
                                                                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                    Evicted or Payment Plan
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-emerald-900">
                                                                {noticeEviction.evected_or_payment_plan || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Have an Exception
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {noticeEviction.have_an_exception || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Record ID
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                #{noticeEviction.id}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-gray-50 border-gray-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Archive className="h-4 w-4 text-gray-600" />
                                                                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                                                    Archived Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {noticeEviction.is_archived ? (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {noticeEviction.is_archived ? 'Archived' : 'Active'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {noticeEviction.note && (
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
                                                            {noticeEviction.note}
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
