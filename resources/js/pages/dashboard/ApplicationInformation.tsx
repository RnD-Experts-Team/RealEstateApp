// resources/js/Components/ApplicationInformation.tsx

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Application } from '@/types/dashboard';
import {
    AlertCircle,
    Archive,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    Clock,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    Paperclip,
    StickyNote,
    Target,
    User,
    UserCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    applications: Application[];
    selectedUnitId: number | null;
}

export default function ApplicationInformation({ applications, selectedUnitId }: Props) {
    const [openApplications, setOpenApplications] = useState<{ [key: number]: boolean }>({});

    const toggleApplication = (applicationId: number) => {
        setOpenApplications((prev) => ({
            ...prev,
            [applicationId]: !prev[applicationId],
        }));
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;

        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'approved' || lowerStatus === 'accepted') {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'pending' || lowerStatus === 'submitted') {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (lowerStatus === 'under review' || lowerStatus === 'reviewing') {
            return <Eye className="h-4 w-4 text-blue-600" />;
        } else if (lowerStatus === 'rejected' || lowerStatus === 'denied' || lowerStatus === 'declined') {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (!status) return 'secondary';

        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'approved' || lowerStatus === 'accepted') {
            return 'default';
        } else if (lowerStatus === 'pending' || lowerStatus === 'submitted') {
            return 'outline';
        } else if (lowerStatus === 'under review' || lowerStatus === 'reviewing') {
            return 'secondary';
        } else if (lowerStatus === 'rejected' || lowerStatus === 'denied' || lowerStatus === 'declined') {
            return 'destructive';
        }
        return 'secondary';
    };

    const getStageIcon = (stage: string | null | undefined) => {
        if (!stage) return <Target className="h-4 w-4 text-gray-400" />;

        const lowerStage = stage.toLowerCase();
        if (lowerStage.includes('background') || lowerStage.includes('check')) {
            return <UserCheck className="h-4 w-4 text-purple-600" />;
        } else if (lowerStage.includes('document') || lowerStage.includes('paperwork')) {
            return <FileCheck className="h-4 w-4 text-blue-600" />;
        } else if (lowerStage.includes('review') || lowerStage.includes('verification')) {
            return <Eye className="h-4 w-4 text-orange-600" />;
        }
        return <Target className="h-4 w-4 text-indigo-600" />;
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Applications</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Rental applications and applicant information for {applications.length} application{applications.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {applications.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No applications found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {applications.length > 0 && (
                <CardContent className="space-y-4">
                    {applications.map((application) => (
                        <Collapsible
                            key={application.id}
                            open={openApplications[application.id]}
                            onOpenChange={() => toggleApplication(application.id)}
                        >
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" className="h-auto w-full p-0 hover:bg-transparent">
                                        <CardHeader className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className="rounded-full bg-indigo-100 p-2">
                                                        <FileText className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <CardTitle className="text-xl">{application.name || 'Unknown Applicant'}</CardTitle>
                                                        <CardDescription className="flex items-center space-x-4">
                                                            {application.date_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="mr-1 h-4 w-4" />
                                                                    Applied: {application.date_formatted}
                                                                </span>
                                                            )}
                                                            {application.co_signer && (
                                                                <span className="flex items-center">
                                                                    <Users className="mr-1 h-4 w-4" />
                                                                    Co-signer: {application.co_signer}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <Badge variant={application.is_archived ? 'destructive' : 'default'} className="px-3 py-1">
                                                            {application.is_archived ? 'Archived' : 'Active'}
                                                        </Badge>
                                                        {application.status && (
                                                            <div className="flex items-center space-x-1">
                                                                {getStatusIcon(application.status)}
                                                                <Badge variant={getStatusBadgeVariant(application.status)} className="text-xs">
                                                                    {application.status}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                        {application.attachments && application.attachments.length > 0 && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                <Paperclip className="mr-1 h-3 w-3" />
                                                                {application.attachments.length} Attachment
                                                                {application.attachments.length !== 1 ? 's' : ''}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {openApplications[application.id] ? (
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
                                            {/* Applicant Information */}
                                            <div className="space-y-4">
                                                <div className="mb-4 flex items-center space-x-2">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Applicant Information</h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="border-blue-200 bg-blue-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-blue-700 uppercase">
                                                                    Applicant Name
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">{application.name || 'N/A'}</p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-purple-200 bg-purple-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <Users className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-purple-700 uppercase">
                                                                    Co-Signer
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-purple-900">{application.co_signer || 'None'}</p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <Target className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                                    Application Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(application.status)}
                                                                <p className="text-sm font-medium text-slate-900">{application.status || 'N/A'}</p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Application Details */}
                                            <div className="space-y-4">
                                                <div className="mb-4 flex items-center space-x-2">
                                                    <FileText className="h-5 w-5 text-green-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Application Details</h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="border-green-200 bg-green-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <Calendar className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-green-700 uppercase">
                                                                    Application Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-green-900">
                                                                {application.date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    {application.stage_in_progress && (
                                                        <Card className="border-orange-200 bg-orange-50">
                                                            <CardContent className="p-4">
                                                                <div className="mb-1 flex items-center space-x-2">
                                                                    {getStageIcon(application.stage_in_progress)}
                                                                    <label className="text-xs font-semibold tracking-wide text-orange-700 uppercase">
                                                                        Current Stage
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-orange-900">{application.stage_in_progress}</p>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {/* ✅ UPDATED: Attachments Section - Now supports multiple files */}
                                                    {application.attachments && application.attachments.length > 0 && (
                                                        <div className="space-y-4">
                                                            <div className="mb-4 flex items-center space-x-2">
                                                                <Paperclip className="h-5 w-5 text-purple-600" />
                                                                <h4 className="text-lg font-semibold text-gray-900">
                                                                    Attachments ({application.attachments.length})
                                                                </h4>
                                                            </div>

                                                            <div className="space-y-3">
                                                                {application.attachments.map((attachment, idx) => (
                                                                    <Card
                                                                        key={`${application.id}-attachment-${idx}`}
                                                                        className="border-purple-200 bg-purple-50 transition-colors hover:bg-purple-100"
                                                                    >
                                                                        <CardContent className="p-4">
                                                                            <div className="flex items-center justify-between">
                                                                                <div className="flex min-w-0 flex-1 items-center space-x-3">
                                                                                    <Paperclip className="h-4 w-4 flex-shrink-0 text-purple-600" />
                                                                                    <div className="min-w-0 flex-1">
                                                                                        <p className="truncate text-sm font-medium text-purple-900">
                                                                                            {attachment.name}
                                                                                        </p>
                                                                                        <p className="text-xs text-purple-600">
                                                                                            Attachment {attachment.index + 1}
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <a
                                                                                    href={attachment.download_url}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="ml-3 flex-shrink-0"
                                                                                >
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        className="text-purple-600 hover:bg-purple-100 hover:text-purple-800"
                                                                                    >
                                                                                        <ExternalLink className="mr-1 h-4 w-4" />
                                                                                        Download
                                                                                    </Button>
                                                                                </a>
                                                                            </div>
                                                                        </CardContent>
                                                                    </Card>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Record Information */}
                                            <div className="space-y-4">
                                                <div className="mb-4 flex items-center space-x-2">
                                                    <Archive className="h-5 w-5 text-slate-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Record Information</h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                                                                    Application ID
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">#{application.id}</p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="border-gray-200 bg-gray-50">
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                <Archive className="h-4 w-4 text-gray-600" />
                                                                <label className="text-xs font-semibold tracking-wide text-gray-600 uppercase">
                                                                    Archived Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {application.is_archived ? (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {application.is_archived ? 'Archived' : 'Active'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {/* Status Summary Card */}
                                                    <Card
                                                        className={`${
                                                            application.status?.toLowerCase() === 'approved'
                                                                ? 'border-green-200 bg-green-50'
                                                                : application.status?.toLowerCase() === 'pending'
                                                                  ? 'border-yellow-200 bg-yellow-50'
                                                                  : application.status?.toLowerCase() === 'rejected'
                                                                    ? 'border-red-200 bg-red-50'
                                                                    : 'border-blue-200 bg-blue-50'
                                                        }`}
                                                    >
                                                        <CardContent className="p-4">
                                                            <div className="mb-1 flex items-center space-x-2">
                                                                {getStatusIcon(application.status)}
                                                                <label
                                                                    className={`text-xs font-semibold tracking-wide uppercase ${
                                                                        application.status?.toLowerCase() === 'approved'
                                                                            ? 'text-green-700'
                                                                            : application.status?.toLowerCase() === 'pending'
                                                                              ? 'text-yellow-700'
                                                                              : application.status?.toLowerCase() === 'rejected'
                                                                                ? 'text-red-700'
                                                                                : 'text-blue-700'
                                                                    }`}
                                                                >
                                                                    Application Status
                                                                </label>
                                                            </div>
                                                            <Badge variant={getStatusBadgeVariant(application.status)} className="font-semibold">
                                                                {application.status || 'Status Unknown'}
                                                            </Badge>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {application.notes && (
                                            <div className="mt-8 border-t border-gray-200 pt-6">
                                                <div className="mb-4 flex items-center space-x-2">
                                                    <StickyNote className="h-5 w-5 text-amber-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">Application Notes</h4>
                                                </div>
                                                <Card className="border-amber-200 bg-amber-50">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm whitespace-pre-wrap text-amber-900">{application.notes}</p>
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
