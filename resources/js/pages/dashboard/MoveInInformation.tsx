// resources/js/Components/MoveInInformation.tsx

import { useState } from 'react';
import { MoveIn } from '@/types/dashboard';
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
  FileText, 
  Calendar, 
  CreditCard, 
  Shield, 
  Key,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck
} from 'lucide-react';

interface Props {
    moveIns: MoveIn[];
    selectedUnitId: number | null;
}

export default function MoveInInformation({ moveIns, selectedUnitId }: Props) {
    const [openMoveIns, setOpenMoveIns] = useState<{ [key: number]: boolean }>({});

    const toggleMoveIn = (moveInId: number) => {
        setOpenMoveIns(prev => ({
            ...prev,
            [moveInId]: !prev[moveInId]
        }));
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Move-In Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Complete move-in records for {moveIns.length} record{moveIns.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {moveIns.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No move-in records found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {moveIns.length > 0 && (
                <CardContent className="space-y-4">
                    {moveIns.map((moveIn) => (
                        <Collapsible
                            key={moveIn.id}
                            open={openMoveIns[moveIn.id]}
                            onOpenChange={() => toggleMoveIn(moveIn.id)}
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
                                                    <div className="p-2 rounded-full bg-indigo-100 flex-shrink-0">
                                                        <FileText className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <CardTitle className="text-lg sm:text-xl truncate">
                                                            Move-In Record #{moveIn.id}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                                            <span className="flex items-center">
                                                                <Home className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                <span className="truncate">Unit: {moveIn.unit_name}</span>
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                <span className="truncate">Created: {moveIn.created_at_formatted}</span>
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 flex-shrink-0">
                                                    <Badge 
                                                        variant={moveIn.is_archived ? "destructive" : "default"}
                                                        className="px-3 py-1"
                                                    >
                                                        {moveIn.is_archived ? 'Archived' : 'Active'}
                                                    </Badge>
                                                    {openMoveIns[moveIn.id] ? (
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
                                            {/* Lease Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <FileCheck className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Lease Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileCheck className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Signed Lease
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {moveIn.signed_lease === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-blue-900">
                                                                    {moveIn.signed_lease || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Lease Signing Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {moveIn.lease_signing_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Home className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Move-In Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-green-900">
                                                                {moveIn.move_in_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Payment Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Payment Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <CreditCard className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Security Deposit & First Month
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {moveIn.paid_security_deposit_first_month_rent === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-purple-900">
                                                                    {moveIn.paid_security_deposit_first_month_rent || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Clock className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Scheduled Payment Time
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {moveIn.scheduled_paid_time_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-yellow-50 border-yellow-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Key className="h-4 w-4 text-yellow-600" />
                                                                <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                                                                    Keys Handled
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {moveIn.handled_keys === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-yellow-900">
                                                                    {moveIn.handled_keys || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Forms & Documentation */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <FileText className="h-5 w-5 text-indigo-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Forms & Documentation
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Move-In Form Sent
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {moveIn.move_in_form_sent_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileCheck className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Form Filled
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {moveIn.filled_move_in_form === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {moveIn.filled_move_in_form || 'N/A'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Date Form Filled
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {moveIn.date_of_move_in_form_filled_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Insurance Information */}
                                        <div className="mt-8 pt-6 border-t border-gray-200">
                                            <div className="flex items-center space-x-2 mb-4">
                                                <Shield className="h-5 w-5 text-emerald-600" />
                                                <h4 className="text-lg font-semibold text-gray-900">
                                                    Insurance Information
                                                </h4>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <Card className="bg-emerald-50 border-emerald-200">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <Shield className="h-4 w-4 text-emerald-600" />
                                                            <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                Insurance Submitted
                                                            </label>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {moveIn.submitted_insurance === 'Yes' ? (
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-600" />
                                                            )}
                                                            <p className="text-sm font-medium text-emerald-900">
                                                                {moveIn.submitted_insurance || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                <Card className="bg-red-50 border-red-200">
                                                    <CardContent className="p-4">
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <Calendar className="h-4 w-4 text-red-600" />
                                                            <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                Insurance Expiration
                                                            </label>
                                                        </div>
                                                        <p className="text-sm font-medium text-red-900">
                                                            {moveIn.date_of_insurance_expiration_formatted || 'N/A'}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
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
