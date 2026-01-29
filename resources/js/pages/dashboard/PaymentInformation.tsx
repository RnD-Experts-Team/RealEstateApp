// resources/js/Components/PaymentInformation.tsx

import { useState } from 'react';
import { Payment } from '@/types/dashboard';
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
  DollarSign, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  TrendingDown,
  Minus,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  FileText,
  StickyNote,
  RotateCcw,
  Shield
} from 'lucide-react';

interface Props {
    payments: Payment[];
    selectedUnitId: number | null;
}

export default function PaymentInformation({ payments, selectedUnitId }: Props) {
    const [openPayments, setOpenPayments] = useState<{ [key: number]: boolean }>({});

    const togglePayment = (paymentId: number) => {
        setOpenPayments(prev => ({
            ...prev,
            [paymentId]: !prev[paymentId]
        }));
    };

    const getStatusIcon = (status: string | null | undefined) => {
        if (!status) return <Clock className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid') {
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'partial') {
            return <Clock className="h-4 w-4 text-yellow-600" />;
        } else if (lowerStatus === 'unpaid' || lowerStatus === 'overdue') {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <Clock className="h-4 w-4 text-gray-400" />;
    };

    const getStatusBadgeVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
        if (!status) return "secondary";
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'paid') {
            return "default";
        } else if (lowerStatus === 'partial') {
            return "outline";
        } else if (lowerStatus === 'unpaid' || lowerStatus === 'overdue') {
            return "destructive";
        }
        return "secondary";
    };

    const getAmountColor = (amount: number | undefined, type: 'owed' | 'paid' | 'remaining') => {
        if (amount === undefined || amount === 0) return "text-gray-500";
        
        switch (type) {
            case 'owed':
                return amount > 0 ? "text-red-600" : "text-gray-500";
            case 'paid':
                return amount > 0 ? "text-green-600" : "text-gray-500";
            case 'remaining':
                return amount > 0 ? "text-orange-600" : "text-green-600";
            default:
                return "text-gray-900";
        }
    };

    const getAmountIcon = (amount: number | undefined, type: 'owed' | 'paid' | 'remaining') => {
        if (amount === undefined || amount === 0) return <Minus className="h-4 w-4 text-gray-400" />;
        
        switch (type) {
            case 'owed':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            case 'paid':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'remaining':
                return amount > 0 ? <Clock className="h-4 w-4 text-orange-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />;
            default:
                return <DollarSign className="h-4 w-4 text-gray-400" />;
        }
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Payment Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Payment records and transaction history for {payments.length} record{payments.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {payments.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No payments found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {payments.length > 0 && (
                <CardContent className="space-y-4">
                    {payments.map((payment) => (
                        <Collapsible
                            key={payment.id}
                            open={openPayments[payment.id]}
                            onOpenChange={() => togglePayment(payment.id)}
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
                                                    <div className="p-2 rounded-full bg-green-100">
                                                        <DollarSign className="h-5 w-5 text-green-600" />
                                                    </div>
                                                    <div className="text-left">
                                                        <CardTitle className="text-xl">
                                                            Payment #{payment.id}
                                                        </CardTitle>
                                                        <CardDescription className="flex items-center space-x-4">
                                                            <span className="flex items-center">
                                                                <Calendar className="h-4 w-4 mr-1" />
                                                                {payment.date_formatted}
                                                            </span>
                                                            <span className={`flex items-center font-semibold ${getAmountColor(payment.paid, 'paid')}`}>
                                                                <TrendingUp className="h-4 w-4 mr-1" />
                                                                {payment.formatted_paid || `$${payment.paid?.toFixed(2) || '0.00'}`}
                                                            </span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <div className="flex items-center space-x-1">
                                                            {getStatusIcon(payment.status)}
                                                            <Badge 
                                                                variant={getStatusBadgeVariant(payment.status)}
                                                                className="px-3 py-1"
                                                            >
                                                                {payment.status || 'Unknown'}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {payment.permanent === 'Yes' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    Permanent
                                                                </Badge>
                                                            )}
                                                            {payment.is_archived && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    <Archive className="h-3 w-3 mr-1" />
                                                                    Archived
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {openPayments[payment.id] ? (
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
                                            {/* Payment Amounts */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <DollarSign className="h-5 w-5 text-green-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Payment Details
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-red-50 border-red-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getAmountIcon(payment.owes, 'owed')}
                                                                <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                    Amount Owed
                                                                </label>
                                                            </div>
                                                            <p className={`text-2xl font-bold ${getAmountColor(payment.owes, 'owed')}`}>
                                                                {payment.formatted_owes || `$${payment.owes?.toFixed(2) || '0.00'}`}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-green-50 border-green-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getAmountIcon(payment.paid, 'paid')}
                                                                <label className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                                                                    Amount Paid
                                                                </label>
                                                            </div>
                                                            <p className={`text-2xl font-bold ${getAmountColor(payment.paid, 'paid')}`}>
                                                                {payment.formatted_paid || `$${payment.paid?.toFixed(2) || '0.00'}`}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-orange-50 border-orange-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                {getAmountIcon(payment.left_to_pay, 'remaining')}
                                                                <label className="text-xs font-semibold text-orange-700 uppercase tracking-wide">
                                                                    Left to Pay
                                                                </label>
                                                            </div>
                                                            <p className={`text-2xl font-bold ${getAmountColor(payment.left_to_pay, 'remaining')}`}>
                                                                {payment.formatted_left_to_pay || `$${payment.left_to_pay?.toFixed(2) || '0.00'}`}
                                                            </p>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Payment Status Info */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <CreditCard className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Status Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-blue-50 border-blue-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <CreditCard className="h-4 w-4 text-blue-600" />
                                                                <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                    Payment Status
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {getStatusIcon(payment.status)}
                                                                <p className="text-sm font-medium text-blue-900">
                                                                    {payment.status || 'Unknown'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-purple-50 border-purple-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Shield className="h-4 w-4 text-purple-600" />
                                                                <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                    Permanent Record
                                                                </label>
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                {payment.permanent === 'Yes' ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-purple-900">
                                                                    {payment.permanent || 'No'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {payment.reversed_payments && (
                                                        <Card className="bg-red-50 border-red-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <RotateCcw className="h-4 w-4 text-red-600" />
                                                                    <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                        Reversed Payments
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-red-900">
                                                                    {payment.reversed_payments}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Record Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <FileText className="h-5 w-5 text-slate-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Record Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <FileText className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Record ID
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                #{payment.id}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-indigo-50 border-indigo-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Calendar className="h-4 w-4 text-indigo-600" />
                                                                <label className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">
                                                                    Transaction Date
                                                                </label>
                                                            </div>
                                                            <p className="text-sm font-medium text-indigo-900">
                                                                {payment.date_formatted}
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
                                                                {payment.is_archived ? (
                                                                    <XCircle className="h-4 w-4 text-red-600" />
                                                                ) : (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                )}
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {payment.is_archived ? 'Archived' : 'Active'}
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes Section */}
                                        {payment.notes && (
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
                                                            {payment.notes}
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
