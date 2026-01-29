// resources/js/Components/MoveOutInformation.tsx

import { useState } from 'react';
import { MoveOut } from '@/types/dashboard';
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
  LogOut, 
  Calendar, 
  Key, 
  FileText, 
  Zap, 
  Wrench,
//   User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Home,
  DollarSign,
  ClipboardList,
  StickyNote
} from 'lucide-react';

interface Props {
    moveOuts: MoveOut[];
    selectedUnitId: number | null;
}

export default function MoveOutInformation({ moveOuts, selectedUnitId }: Props) {
    const [openMoveOuts, setOpenMoveOuts] = useState<{ [key: number]: boolean }>({});

    const toggleMoveOut = (moveOutId: number) => {
        setOpenMoveOuts(prev => ({
            ...prev,
            [moveOutId]: !prev[moveOutId]
        }));
    };

    // Update the helper functions at the top of the component

const getStatusIcon = (status: string | null | undefined) => {
    if (!status) return <XCircle className="h-4 w-4 text-gray-400" />;
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'yes' || lowerStatus === 'filled' || lowerStatus === 'cleaned') {
        return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (lowerStatus === 'no' || lowerStatus === 'not filled' || lowerStatus === 'uncleaned') {
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
};

const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    if (!status) return "secondary";
    
    const lowerStatus = status.toLowerCase();
    if (lowerStatus === 'yes' || lowerStatus === 'filled' || lowerStatus === 'cleaned') {
        return "default";
    } else if (lowerStatus === 'no' || lowerStatus === 'not filled' || lowerStatus === 'uncleaned') {
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
                        <CardTitle className="text-xl sm:text-2xl font-bold">Move-Out Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Complete move-out records for {moveOuts.length} record{moveOuts.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {moveOuts.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No move-outs found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {moveOuts.length > 0 && (
                <CardContent className="space-y-4">
                    {moveOuts.map((moveOut) => (
                        <Collapsible
                            key={moveOut.id}
                            open={openMoveOuts[moveOut.id]}
                            onOpenChange={() => toggleMoveOut(moveOut.id)}
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
                                                    <div className="p-2 rounded-full bg-orange-100 flex-shrink-0">
                                                        <LogOut className="h-5 w-5 text-orange-600" />
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <CardTitle className="text-lg sm:text-xl truncate">
                                                            Move-Out #{moveOut.id}
                                                            {moveOut.tenant_name && ` - ${moveOut.tenant_name}`}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center space-x-2 text-xs sm:text-sm">
                                                            {moveOut.move_out_date_formatted && (
                                                                <span className="flex items-center">
                                                                    <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                    <span className="truncate">{moveOut.move_out_date_formatted}</span>
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 flex-shrink-0">
                                                    <Badge 
                                                        variant={moveOut.is_archived ? "destructive" : "default"}
                                                        className="px-3 py-1"
                                                    >
                                                        {moveOut.is_archived ? 'Archived' : 'Active'}
                                                    </Badge>
                                                    {openMoveOuts[moveOut.id] ? (
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
                                            {/* Move-Out Details */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <LogOut className="h-5 w-5 text-orange-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Move-Out Details
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-orange-50 border-orange-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-orange-600" />
                                                                <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                    Move-Out Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-orange-900">
                                                                {moveOut.move_out_date_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Lease Status
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {moveOut.lease_status || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Lease Ending Date (Buildium)
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {moveOut.date_lease_ending_on_buildium_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-yellow-50 border-yellow-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Key className="h-4 w-4 text-yellow-600" />
                                                                <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                                                                    Keys Location
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-yellow-900">
                                                                {moveOut.keys_location || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Utilities & Services */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Zap className="h-5 w-5 text-purple-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Utilities & Services
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Zap className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Utilities Under Our Name
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(moveOut.utilities_under_our_name)}
                                                                <Badge variant={getStatusBadgeVariant(moveOut.utilities_under_our_name)}>
                                                                    {moveOut.utilities_under_our_name || 'N/A'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Utility Transfer Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-slate-900">
                                                                {moveOut.date_utility_put_under_our_name_formatted || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Home className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Walkthrough
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {moveOut.walkthrough || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Cleaning Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(moveOut.cleaning)}
                                                                <Badge variant={getStatusBadgeVariant(moveOut.cleaning)}>
                                                                    {moveOut.cleaning
                                                                        ? moveOut.cleaning.charAt(0).toUpperCase() + moveOut.cleaning.slice(1)
                                                                        : 'N/A'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Administrative Tasks */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <ClipboardList className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Administrative Tasks
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Wrench className="h-4 w-4 text-red-600" />
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Repairs
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-red-900">
                                                                {moveOut.repairs || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-emerald-50 border-emerald-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <DollarSign className="h-4 w-4 text-emerald-600" />
                                                                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                    Security Deposit Return
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-emerald-900">
                                                                {moveOut.send_back_security_deposit || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <MapPin className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    List the Unit
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-blue-900">
                                                                {moveOut.list_the_unit || 'N/A'}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Move-Out Form
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(moveOut.move_out_form)}
                                                                <Badge variant={getStatusBadgeVariant(moveOut.move_out_form)}>
                                                                    {moveOut.move_out_form
                                                                        ? moveOut.move_out_form.charAt(0).toUpperCase() + moveOut.move_out_form.slice(1)
                                                                        : 'N/A'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {moveOut.notes && (
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
                                                            {moveOut.notes}
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
