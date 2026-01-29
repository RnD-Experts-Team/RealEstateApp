// resources/js/Components/VendorTasksInformation.tsx

import { useState } from 'react';
import { VendorTask } from '@/types/dashboard';
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
  Wrench, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Target,
  Truck,
  FileText,
  StickyNote,
  Zap
} from 'lucide-react';

interface Props {
    vendorTasks: VendorTask[];
    selectedUnitId: number | null;
}

export default function VendorTasksInformation({ vendorTasks, selectedUnitId }: Props) {
    const [openTasks, setOpenTasks] = useState<{ [key: number]: boolean }>({});

    const formatPhoneNumber = (phone: string | number | string[] | null | undefined): string => {
        if (Array.isArray(phone)) {
            const formatted: string[] = phone
                .filter(p => typeof p === 'string' && p.length > 0)
                .map(p => formatPhoneNumber(p))
                .filter(p => typeof p === 'string' && p.length > 0);
            return formatted.join(', ');
        }
        if (phone === null || phone === undefined) return '';
        const str = String(phone);
        if (!str) return '';
        const cleaned = str.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        if (cleaned.length === 11 && cleaned.startsWith('1')) {
            return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
        }
        return str;
    };

    const toggleTask = (taskId: number) => {
        setOpenTasks(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const getUrgencyIcon = (urgent: string | null | undefined) => {
        if (urgent === 'Yes') {
            return <AlertTriangle className="h-4 w-4 text-red-600" />;
        }
        return <Clock className="h-4 w-4 text-green-600" />;
    };

    const getUrgencyBadgeVariant = (urgent: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (urgent === 'Yes') {
            return "destructive";
        }
        return "default";
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('completed') || lowerStatus.includes('done') || lowerStatus.includes('finished')) {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus.includes('in progress') || lowerStatus.includes('active') || lowerStatus.includes('working')) {
            return <Clock className="h-4 w-4 text-blue-600" />;
        } else if (lowerStatus.includes('pending') || lowerStatus.includes('waiting')) {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (lowerStatus.includes('cancelled') || lowerStatus.includes('failed')) {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <Target className="h-4 w-4 text-blue-600" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus.includes('completed') || lowerStatus.includes('done') || lowerStatus.includes('finished')) {
            return "default";
        } else if (lowerStatus.includes('in progress') || lowerStatus.includes('active') || lowerStatus.includes('working')) {
            return "outline";
        } else if (lowerStatus.includes('cancelled') || lowerStatus.includes('failed')) {
            return "destructive";
        }
        return "secondary";
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Vendor Tasks Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Service tasks and vendor assignments for {vendorTasks.length} task{vendorTasks.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {vendorTasks.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No vendor tasks found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {vendorTasks.length > 0 && (
                <CardContent className="space-y-4">
                    {vendorTasks.map((vendorTask) => (
                        <Collapsible
                            key={vendorTask.id}
                            open={openTasks[vendorTask.id]}
                            onOpenChange={() => toggleTask(vendorTask.id)}
                        >
                            <Card className="transition-all duration-200 hover:shadow-md">
                                <CollapsibleTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full p-0 h-auto hover:bg-transparent"
                                    >
                                        <CardHeader className="w-full">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`p-2 rounded-full ${
                                                        vendorTask.urgent === 'Yes' ? 'bg-red-100' : 'bg-blue-100'
                                                    }`}>
                                                        <Wrench className={`h-5 w-5 ${
                                                            vendorTask.urgent === 'Yes' ? 'text-red-600' : 'text-blue-600'
                                                        }`} />
                                                    </div>
                                                    <div className="text-left">
                                                        <CardTitle className="text-xl">
                                                            Task #{vendorTask.id}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center space-x-4">
                                                            {vendorTask.vendor_name && (
                                                                <span className="flex items-center">
                                                                    <User className="h-4 w-4 mr-1" />
                                                                    {vendorTask.vendor_name}
                                                                </span>
                                                            )}
                                                            {vendorTask.vendor_service_type && (
                                                                <span className="flex items-center">
                                                                    <Building className="h-4 w-4 mr-1" />
                                                                    {vendorTask.vendor_service_type}
                                                                </span>
                                                            )}
                                                            {vendorTask.task_submission_date_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-1" />
                                                                    {vendorTask.task_submission_date_formatted}
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <div className="flex items-center space-x-1">
                                                            {getUrgencyIcon(vendorTask.urgent)}
                                                            <Badge 
                                                                variant={getUrgencyBadgeVariant(vendorTask.urgent)}
                                                                className="px-3 py-1"
                                                            >
                                                                {vendorTask.urgent === 'Yes' ? 'Urgent' : 'Normal'}
                                                            </Badge>
                                                        </div>
                                                        {vendorTask.status && (
                                                            <div className="flex items-center space-x-1">
                                                                {getStatusIcon(vendorTask.status)}
                                                                <Badge variant={getStatusBadgeVariant(vendorTask.status)} className="text-xs">
                                                                    {vendorTask.status}
                                                                </Badge>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {openTasks[vendorTask.id] ? (
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
                                            {/* Task Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Wrench className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Task Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Assigned Tasks
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {vendorTask.assigned_tasks || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Submission Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-green-900">
                                                                {vendorTask.task_submission_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Truck className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Scheduled Visits
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-purple-900">
                                                                {vendorTask.any_scheduled_visits_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-red-600" />
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Task End Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-red-900">
                                                                {vendorTask.task_ending_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Vendor Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <User className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Vendor Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-emerald-50 border-emerald-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <User className="h-4 w-4 text-emerald-600" />
                                                                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                    Vendor Name
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-emerald-900">
                                                                {vendorTask.vendor_name || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Building className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Service Type
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {vendorTask.vendor_service_type || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Phone className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Phone Number
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                {vendorTask.vendor_number
                                                                    ? formatPhoneNumber(vendorTask.vendor_number)
                                                                    : 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Mail className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Email
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900 break-all">
                                                                {vendorTask.vendor_email || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-orange-50 border-orange-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <MapPin className="h-4 w-4 text-orange-600" />
                                                                <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                    Vendor City
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-orange-900">
                                                                {vendorTask.vendor_city_name || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Task Status & Priority */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Target className="h-5 w-5 text-purple-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Status & Priority
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className={`${
                                                        vendorTask.urgent === 'Yes' 
                                                            ? 'bg-red-50 border-red-200' 
                                                            : 'bg-green-50 border-green-200'
                                                    }`}>
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getUrgencyIcon(vendorTask.urgent)}
                                                                <label className={`text-xs font-semibold uppercase tracking-wide ${
                                                                    vendorTask.urgent === 'Yes' 
                                                                        ? 'text-red-700' 
                                                                        : 'text-green-700'
                                                                }`}>
                                                                    Priority Level
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {vendorTask.urgent === 'Yes' && (
                                                                    <Zap className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <Badge 
                                                                    variant={getUrgencyBadgeVariant(vendorTask.urgent)}
                                                                    className="font-semibold"
                                                                >
                                                                    {vendorTask.urgent === 'Yes' ? 'URGENT' : 'Normal Priority'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {vendorTask.status && (
                                                        <Card className="bg-blue-50 border-blue-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Target className="h-4 w-4 text-blue-600" />
                                                                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                        Current Status
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    {getStatusIcon(vendorTask.status)}
                                                                    <Badge variant={getStatusBadgeVariant(vendorTask.status)} className="font-semibold">
                                                                        {vendorTask.status}
                                                                    </Badge>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Task ID
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                #{vendorTask.id}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {vendorTask.notes && (
                                            <div className="mt-8 pt-6 border-t border-gray-200">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <StickyNote className="h-5 w-5 text-amber-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Task Notes
                                                    </h4>
                                                </div>
                                                <Card className="bg-amber-50 border-amber-200">
                                                    <CardContent className="p-4">
                                                        <p className="text-sm text-amber-900 whitespace-pre-wrap">
                                                            {vendorTask.notes}
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
