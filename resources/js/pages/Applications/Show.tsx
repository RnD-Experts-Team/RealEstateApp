// resources/js/pages/Applications/Show.tsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Application, Attachment } from '@/types/application';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
// import { usePermissions } from '@/hooks/usePermissions';
import { Calendar, MapPin, User, Home, FileText, Download, ClipboardList, Clock, Phone, Mail } from 'lucide-react';

interface Props {
    application: Application;
    filters?: {
        city?: string;
        property?: string;
        unit?: string;
        name?: string;
        co_signer?: string;
        status?: string;
        applicant_applied_from?: string;
        stage_in_progress?: string;
        date_from?: string;
        date_to?: string;
    };
    prevId?: number | null;
    nextId?: number | null;
}

export default function Show({ application, filters, prevId, nextId }: Props) {
    // const { hasAllPermissions } = usePermissions();

    const formatDate = (date: string | null) => {
        if (!date) return 'Not Set';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusBadge = (status: string | null) => {
        if (!status) return <Badge variant="outline" className="text-xs">N/A</Badge>;
        const s = status.toLowerCase();
        if (s === 'approved') {
            return <Badge variant="default" className="text-xs bg-green-100 text-green-800 border-green-200">{status}</Badge>;
        }
        if (s === 'undecided') {
            return <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-800">{status}</Badge>;
        }
        if (s === 'new') {
            return <Badge variant="secondary" className="text-xs">{status}</Badge>;
        }
        return <Badge variant="default" className="text-xs">{status}</Badge>;
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

    const buildShowRoute = (id: number) => {
        const params: Record<string, any> = { application: id };
        if (filters) {
            if (filters.city) params.city = filters.city;
            if (filters.property) params.property = filters.property;
            if (filters.unit) params.unit = filters.unit;
            if (filters.name) params.name = filters.name;
            if (filters.co_signer) params.co_signer = filters.co_signer;
            if (filters.status) params.status = filters.status;
            if (filters.applicant_applied_from) params.applicant_applied_from = filters.applicant_applied_from;
            if (filters.stage_in_progress) params.stage_in_progress = filters.stage_in_progress;
            if (filters.date_from) params.date_from = filters.date_from;
            if (filters.date_to) params.date_to = filters.date_to;
        }
        return route('applications.show', params);
    };

    return (
        <AppLayout>
            <Head title={`Application Details #${application.id}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header Section */}
                    <div className="mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Application Record #{application.id}</h1>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                    <MapPin className="h-4 w-4" />
                                    <span>{application.city || 'N/A'} • {application.property || 'N/A'}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {/* {hasAllPermissions(['applications.edit','applications.update']) && (
                                    <Link href={route('applications.edit', application.id)}>
                                        <Button className="bg-blue-600 hover:bg-blue-700">Edit Record</Button>
                                    </Link>
                                )} */}
                                <Link href={route('applications.index', filters || {})}>
                                    <Button variant="outline">Back to List</Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        asChild
                                        variant="outline"
                                        disabled={!prevId}
                                    >
                                        {prevId ? (
                                            <Link href={buildShowRoute(prevId)}>
                                                Previous
                                            </Link>
                                        ) : (
                                            <span>Previous</span>
                                        )}
                                    </Button>
                                    <Button
                                        asChild
                                        variant="outline"
                                        disabled={!nextId}
                                    >
                                        {nextId ? (
                                            <Link href={buildShowRoute(nextId)}>
                                                Next
                                            </Link>
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
                                    value={application.city || 'N/A'}
                                    className="bg-blue-50/50"
                                />
                                <InfoItem
                                    icon={Home}
                                    label="Property"
                                    value={application.property || 'N/A'}
                                    className="bg-green-50/50"
                                />
                                <InfoItem
                                    icon={Home}
                                    label="Unit"
                                    value={application.unit_name || application.unit?.unit_name || 'N/A'}
                                    className="bg-purple-50/50"
                                />
                                <InfoItem
                                    icon={User}
                                    label="Applicant"
                                    value={application.name || 'N/A'}
                                    className="bg-orange-50/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Important Dates Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Calendar className="h-5 w-5" />
                                Important Info
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-red-600" />
                                        <p className="text-sm font-medium text-red-800">Application Date</p>
                                    </div>
                                    <p className="text-lg font-bold text-red-900">
                                        {formatDate(application.date)}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ClipboardList className="h-4 w-4 text-blue-600" />
                                        <p className="text-sm font-medium text-blue-800">Stage in Progress</p>
                                    </div>
                                    <p className="text-lg font-bold text-blue-900">
                                        {application.stage_in_progress || 'Not specified'}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="h-4 w-4 text-green-600" />
                                        <p className="text-sm font-medium text-green-800">Status</p>
                                    </div>
                                    <div className="text-lg font-bold text-green-900">
                                        {getStatusBadge(application.status)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Main Information Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Application Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5" />
                                    Applicant Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <InfoItem icon={User} label="Applicant Name" value={application.name || 'N/A'} />
                                    <InfoItem
                                        icon={User}
                                        label="Co-signer"
                                        value={application.co_signer || <span className="text-gray-400 italic">Not provided</span>}
                                    />
                                    <InfoItem
                                        icon={Phone}
                                        label="Phone Number"
                                        value={application.phone_number || <span className="text-gray-400 italic">Not provided</span>}
                                    />
                                    <InfoItem
                                        icon={Mail}
                                        label="Email"
                                        value={application.email || <span className="text-gray-400 italic">Not provided</span>}
                                    />
                                    <InfoItem
                                        icon={Home}
                                        label="Unit"
                                        value={application.unit_name || application.unit?.unit_name || 'N/A'}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Status & Progress */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Status & Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <InfoItem icon={FileText} label="Status" value={getStatusBadge(application.status)} />
                                    <InfoItem
                                        icon={ClipboardList}
                                        label="Stage in Progress"
                                        value={application.stage_in_progress || 'Not specified'}
                                    />
                                    <InfoItem
                                        icon={Home}
                                        label="Applied From"
                                        value={application.applicant_applied_from || <span className="text-gray-400 italic">Not specified</span>}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Attachments Section */}
                    {application.attachments && application.attachments.length > 0 && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Attachments ({application.attachments.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {application.attachments.map((attachment: Attachment) => (
                                        <div
                                            key={attachment.index}
                                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground truncate">{attachment.name}</p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">Click to download</p>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                size="sm"
                                                variant="outline"
                                                className="flex-shrink-0 ml-2"
                                            >
                                                <a href={attachment.download_url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Download
                                                </a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* No Attachments Message */}
                    {(!application.attachments || application.attachments.length === 0) && (
                        <Card className="mb-6 border-dashed">
                            <CardContent className="pt-6">
                                <div className="text-center py-8">
                                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-muted-foreground">No attachments uploaded for this application</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Notes Section */}
                    {application.notes && (
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <FileText className="h-5 w-5" />
                                    Additional Notes
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{application.notes}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Footer Section */}
                    <Card className="mt-8 bg-gray-50">
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Created: {new Date(application.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>Last Updated: {new Date(application.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
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
