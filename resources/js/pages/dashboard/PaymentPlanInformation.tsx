// resources/js/Components/PaymentPlanInformation.tsx

import { useState } from 'react';
import { PaymentPlan } from '@/types/dashboard';
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
  Calendar, 
//   CreditCard, 
  User, 
  Building,
  MapPin,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  FileText,
  StickyNote,
  PiggyBank,
  Target,
  Home
} from 'lucide-react';

interface Props {
    paymentPlans: PaymentPlan[];
    selectedUnitId: number | null;
}

export default function PaymentPlanInformation({ paymentPlans, selectedUnitId }: Props) {
    const [openPlans, setOpenPlans] = useState<{ [key: number]: boolean }>({});

    const togglePlan = (planId: number) => {
        setOpenPlans(prev => ({
            ...prev,
            [planId]: !prev[planId]
        }));
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid' || lowerStatus === 'completed') {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'partial' || lowerStatus === 'in-progress') {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (lowerStatus === 'overdue' || lowerStatus === 'defaulted') {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <Target className="h-4 w-4 text-blue-600" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid' || lowerStatus === 'completed') {
            return "default";
        } else if (lowerStatus === 'partial' || lowerStatus === 'in-progress') {
            return "outline";
        } else if (lowerStatus === 'overdue' || lowerStatus === 'defaulted') {
            return "destructive";
        }
        return "secondary";
    };

    const getProgressPercentage = (paid: string | undefined, total: string | undefined) => {
        if (!paid || !total) return 0;
        
        // Extract numeric values from formatted strings
        const paidAmount = parseFloat(paid.replace(/[$,]/g, ''));
        const totalAmount = parseFloat(total.replace(/[$,]/g, ''));
        
        if (totalAmount === 0) return 0;
        return Math.min((paidAmount / totalAmount) * 100, 100);
    };

    const getProgressColor = (percentage: number) => {
        if (percentage === 100) return "bg-green-500";
        if (percentage >= 75) return "bg-blue-500";
        if (percentage >= 50) return "bg-yellow-500";
        if (percentage >= 25) return "bg-orange-500";
        return "bg-red-500";
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Payment Plans</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Payment plan arrangements for {paymentPlans.length} plan{paymentPlans.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {paymentPlans.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No payment plans found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {paymentPlans.length > 0 && (
                <CardContent className="space-y-4">
                    {paymentPlans.map((paymentPlan) => {
                        const progressPercentage = getProgressPercentage(paymentPlan.formatted_paid, paymentPlan.formatted_amount);
                        
                        return (
                            <Collapsible
                                key={paymentPlan.id}
                                open={openPlans[paymentPlan.id]}
                                onOpenChange={() => togglePlan(paymentPlan.id)}
                            >
                                <Card className="transition-all duration-200 hover:shadow-md">
                                    <CollapsibleTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="w-full p-0 h-auto hover:bg-transparent"
                                        >
                                            <CardHeader className="w-full">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                                    <div className="flex items-start space-x-3 min-w-0 flex-1 w-full">
                                                        <div className="p-2 rounded-full bg-purple-100 flex-shrink-0">
                                                            <PiggyBank className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                        <div className="text-left min-w-0 flex-1">
                                                            <CardTitle className="text-lg sm:text-xl truncate">
                                                                Payment Plan #{paymentPlan.id}
                                                            </CardTitle>
                                                            <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                                                {paymentPlan.tenant_name && (
                                                                    <span className="flex items-center">
                                                                        <User className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                        <span className="truncate">{paymentPlan.tenant_name}</span>
                                                                    </span>
                                                                )}
                                                                {paymentPlan.dates_formatted && (
                                                                    <span className="flex items-center">
                                                                        <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
                                                                        <span className="truncate">Due: {paymentPlan.dates_formatted}</span>
                                                                    </span>
                                                                )}
                                                            </CardDescription>
                                                            {/* Progress Bar */}
                                                            <div className="mt-2 w-full">
                                                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                                                    <span>Progress: {progressPercentage.toFixed(0)}%</span>
                                                                    <span className="truncate ml-2">{paymentPlan.formatted_paid} / {paymentPlan.formatted_amount}</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
                                                                        style={{ width: `${progressPercentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-3 flex-shrink-0">
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <Badge 
                                                                variant={paymentPlan.is_archived ? "destructive" : "default"}
                                                                className="px-3 py-1"
                                                            >
                                                                {paymentPlan.is_archived ? 'Archived' : 'Active'}
                                                            </Badge>
                                                            {paymentPlan.status && (
                                                                <div className="flex items-center space-x-1">
                                                                    {getStatusIcon(paymentPlan.status)}
                                                                    <Badge variant={getStatusBadgeVariant(paymentPlan.status)} className="text-xs">
                                                                        {paymentPlan.status}
                                                                    </Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {openPlans[paymentPlan.id] ? (
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
                                                {/* Payment Information */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <DollarSign className="h-5 w-5 text-green-600" />
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Payment Details
                                                        </h4>
                                                    </div>
                                                    
                                                    <div className="space-y-3">
                                                        <Card className="bg-green-50 border-green-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Target className="h-4 w-4 text-green-600" />
                                                                    <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                        Total Amount
                                                                    </label>
                                                                </div>
                                                                <p className="text-2xl font-bold text-green-600">
                                                                    {paymentPlan.formatted_amount || '$0.00'}
                                                                </p>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="bg-blue-50 border-blue-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                                                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                        Amount Paid
                                                                    </label>
                                                                </div>
                                                                <p className="text-2xl font-bold text-blue-600">
                                                                    {paymentPlan.formatted_paid || '$0.00'}
                                                                </p>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="bg-red-50 border-red-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                                    <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                        Remaining Balance
                                                                    </label>
                                                                </div>
                                                                <p className="text-2xl font-bold text-red-600">
                                                                    {paymentPlan.formatted_left_to_pay || '$0.00'}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>

                                                {/* Schedule Information */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <Calendar className="h-5 w-5 text-purple-600" />
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Schedule Information
                                                        </h4>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <Card className="bg-purple-50 border-purple-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Calendar className="h-4 w-4 text-purple-600" />
                                                                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                        Due Date
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-purple-900">
                                                                    {paymentPlan.dates_formatted || 'N/A'}
                                                                </p>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="bg-indigo-50 border-indigo-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <FileText className="h-4 w-4 text-indigo-600" />
                                                                    <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                        Plan ID
                                                                    </label>
                                                                </div>
                                                                <p className="text-lg font-semibold text-indigo-900">
                                                                    #{paymentPlan.id}
                                                                </p>
                                                            </CardContent>
                                                        </Card>

                                                        <Card className="bg-slate-50">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Archive className="h-4 w-4 text-slate-600" />
                                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                        Status
                                                                    </label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    {paymentPlan.is_archived ? (
                                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                                    ) : (
                                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                                    )}
                                                                    <p className="text-sm font-medium text-slate-900">
                                                                        {paymentPlan.is_archived ? 'Archived' : 'Active'}
                                                                    </p>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                </div>

                                                {/* Tenant Information */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <User className="h-5 w-5 text-emerald-600" />
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            Tenant Information
                                                        </h4>
                                                    </div>

                                                    <div className="space-y-3">
                                                        {paymentPlan.tenant_name && (
                                                            <Card className="bg-emerald-50 border-emerald-200">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <User className="h-4 w-4 text-emerald-600" />
                                                                        <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                            Tenant Name
                                                                        </label>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-emerald-900">
                                                                        {paymentPlan.tenant_name}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {paymentPlan.unit_name && (
                                                            <Card className="bg-blue-50 border-blue-200">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <Home className="h-4 w-4 text-blue-600" />
                                                                        <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                            Unit
                                                                        </label>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-blue-900">
                                                                        {paymentPlan.unit_name}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {paymentPlan.property_name && (
                                                            <Card className="bg-orange-50 border-orange-200">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <Building className="h-4 w-4 text-orange-600" />
                                                                        <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                            Property
                                                                        </label>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-orange-900">
                                                                        {paymentPlan.property_name}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        )}

                                                        {paymentPlan.city_name && (
                                                            <Card className="bg-slate-50">
                                                                <CardContent className="p-4">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <MapPin className="h-4 w-4 text-slate-600" />
                                                                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                            City
                                                                        </label>
                                                                    </div>
                                                                    <p className="text-sm font-medium text-slate-900">
                                                                        {paymentPlan.city_name}
                                                                    </p>
                                                                </CardContent>
                                                            </Card>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notes Section */}
                                            {paymentPlan.notes && (
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
                                                                {paymentPlan.notes}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            )}
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        );
                    })}
                </CardContent>
            )}
        </Card>
    );
}
