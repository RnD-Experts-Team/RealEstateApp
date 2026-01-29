// resources/js/Components/TenantInformation.tsx

import { useState } from 'react';
import { Tenant } from '@/types/dashboard';
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
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Shield, 
  HandHeart,
  Home,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  Building
} from 'lucide-react';

interface Props {
    tenants: Tenant[];
    selectedUnitId: number | null;
}

export default function TenantInformation({ tenants, selectedUnitId }: Props) {
    const [openTenants, setOpenTenants] = useState<{ [key: number]: boolean }>({});

    const formatPhoneNumber = (phone: string) => {
        if (!phone) return '';
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    const toggleTenant = (tenantId: number) => {
        setOpenTenants(prev => ({
            ...prev,
            [tenantId]: !prev[tenantId]
        }));
    };

    // Helper function for status icons
    const getStatusIcon = (status: string | null | undefined, type: 'yes-no' | 'insurance' | 'sensitive' = 'yes-no') => {
        if (!status) return <XCircle className="h-4 w-4 text-gray-400" />;
        
        const lowerStatus = status.toLowerCase();
        if (lowerStatus === 'yes') {
            if (type === 'sensitive') {
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            }
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        } else if (lowerStatus === 'no') {
            return <XCircle className="h-4 w-4 text-red-600" />;
        }
        return <XCircle className="h-4 w-4 text-gray-400" />;
    };

    if (!selectedUnitId) {
        return null;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <CardTitle className="text-xl sm:text-2xl font-bold">Tenant Information</CardTitle>
                        <CardDescription className="text-sm sm:text-base">
                            Complete details for {tenants.length} tenant{tenants.length !== 1 ? 's' : ''}
                        </CardDescription>
                    </div>
                    {tenants.length === 0 && (
                        <Badge variant="secondary" className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm flex-shrink-0">
                            No tenants found
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {tenants.length > 0 && (
                <CardContent className="space-y-4">
                    {tenants.map((tenant) => (
                        <Collapsible
                            key={tenant.id}
                            open={openTenants[tenant.id]}
                            onOpenChange={() => toggleTenant(tenant.id)}
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
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div className="text-left min-w-0 flex-1">
                                                        <CardTitle className="text-lg sm:text-xl truncate">
                                                            {tenant.full_name}
                                                        </CardTitle>
                                                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm">
                                                            <span className="flex items-center min-w-0">
                                                                <Mail className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                                                <span className="truncate">{tenant.login_email}</span>
                                                            </span>
                                                            {tenant.mobile && (
                                                                <span className="flex items-center">
                                                                    <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                                                                    <span className="truncate">{formatPhoneNumber(tenant.mobile)}</span>
                                                                </span>
                                                            )}
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3 flex-shrink-0">
                                                    <div className="flex flex-col items-end space-y-1">
                                                        <Badge 
                                                            variant={tenant.is_archived ? "destructive" : "default"}
                                                            className="px-3 py-1"
                                                        >
                                                            {tenant.is_archived ? 'Archived' : 'Active'}
                                                        </Badge>
                                                        {/* Quick status indicators */}
                                                        <div className="flex items-center space-x-1">
                                                            {tenant.has_assistance === 'Yes' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <HandHeart className="h-3 w-3 mr-1" />
                                                                    Assistance
                                                                </Badge>
                                                            )}
                                                            {tenant.has_insurance === 'Yes' && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    <Shield className="h-3 w-3 mr-1" />
                                                                    Insured
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {openTenants[tenant.id] ? (
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
                                        
                                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
                                            {/* Personal Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <User className="h-5 w-5 text-blue-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Personal Information
                                                    </h4>
                                                </div>
                                                
                                                <div className="space-y-3">
                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <User className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    First Name
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                {tenant.first_name}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <User className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Last Name
                                                                </label>
                                                            </div>
                                                            <p className="text-lg font-semibold text-slate-900">
                                                                {tenant.last_name}
                                                            </p>
                                                        </CardContent>
                                                    </Card>

                                                    {tenant.street_address_line && (
                                                        <Card className="bg-slate-50">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Home className="h-4 w-4 text-slate-600" />
                                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                        Street Address
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-900">
                                                                    {tenant.street_address_line}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <Mail className="h-5 w-5 text-green-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Contact Information
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    {tenant.login_email && (
                                                        <Card className="bg-blue-50 border-blue-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                        Login Email
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-blue-900 break-all">
                                                                    {tenant.login_email}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {tenant.alternate_email && (
                                                        <Card className="bg-blue-50 border-blue-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Mail className="h-4 w-4 text-blue-600" />
                                                                    <label className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                                                                        Alternate Email
                                                                    </label>
                                                                </div>
                                                                <p className="text-sm font-medium text-blue-900 break-all">
                                                                    {tenant.alternate_email}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {tenant.mobile && (
                                                        <Card className="bg-slate-50">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <Phone className="h-4 w-4 text-slate-600" />
                                                                    <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                        Mobile Phone
                                                                    </label>
                                                                </div>
                                                                <p className="text-lg font-semibold text-slate-900">
                                                                    {formatPhoneNumber(tenant.mobile)}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    {tenant.emergency_phone && (
                                                        <Card className="bg-red-50 border-red-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                    <label className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                                                                        Emergency Phone
                                                                    </label>
                                                                </div>
                                                                <p className="text-lg font-semibold text-red-900">
                                                                    {formatPhoneNumber(tenant.emergency_phone)}
                                                                </p>
                                                            </CardContent>
                                                        </Card>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment & Insurance Information */}
                                            <div className="space-y-4">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Payment & Insurance
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    {tenant.cash_or_check && (
                                                        <Card className="bg-purple-50 border-purple-200">
                                                            <CardContent className="p-4">
                                                                <div className="flex items-center space-x-2 mb-1">
                                                                    <CreditCard className="h-4 w-4 text-purple-600" />
                                                                    <label className="text-xs font-semibold text-purple-700 uppercase tracking-wide">
                                                                        Payment Method
                                                                    </label>
                                                                </div>
                                                                <div className="mt-2">
                                                                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                                                                        {tenant.cash_or_check}
                                                                    </Badge>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    )}

                                                    <Card className="bg-slate-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <Shield className="h-4 w-4 text-slate-600" />
                                                                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                                                                    Has Insurance
                                                                </label>
                                                            </div>
                                                            <div className="mt-2 flex items-center space-x-2">
                                                                {getStatusIcon(tenant.has_insurance, 'insurance')}
                                                                <Badge 
                                                                    variant={tenant.has_insurance === 'Yes' ? "default" : "destructive"}
                                                                >
                                                                    {tenant.has_insurance || 'Not Specified'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    <Card className="bg-yellow-50 border-yellow-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                                <label className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">
                                                                    Sensitive Communication
                                                                </label>
                                                            </div>
                                                            <div className="mt-2 flex items-center space-x-2">
                                                                {getStatusIcon(tenant.sensitive_communication, 'sensitive')}
                                                                <Badge 
                                                                    variant={tenant.sensitive_communication === 'Yes' ? "destructive" : "secondary"}
                                                                >
                                                                    {tenant.sensitive_communication || 'No'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                </div>
                                            </div>

                                            {/* Assistance Information */}
                                            <div className="space-y-4 lg:col-span-2 xl:col-span-1">
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <HandHeart className="h-5 w-5 text-emerald-600" />
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        Assistance Program
                                                    </h4>
                                                </div>

                                                <div className="space-y-3">
                                                    <Card className="bg-emerald-50 border-emerald-200">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <HandHeart className="h-4 w-4 text-emerald-600" />
                                                                <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                    Has Assistance
                                                                </label>
                                                            </div>
                                                            <div className="mt-2 flex items-center space-x-2">
                                                                {getStatusIcon(tenant.has_assistance, 'yes-no')}
                                                                <Badge 
                                                                    variant={tenant.has_assistance === 'Yes' ? "default" : "secondary"}
                                                                    className={tenant.has_assistance === 'Yes' ? "bg-emerald-100 text-emerald-800" : ""}
                                                                >
                                                                    {tenant.has_assistance || 'No'}
                                                                </Badge>
                                                            </div>
                                                        </CardContent>
                                                    </Card>

                                                    {tenant.has_assistance === 'Yes' && (
                                                        <>
                                                            {tenant.formatted_assistance_amount && (
                                                                <Card className="bg-emerald-50 border-emerald-200">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <DollarSign className="h-4 w-4 text-emerald-600" />
                                                                            <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                                Assistance Amount
                                                                            </label>
                                                                        </div>
                                                                        <p className="mt-1 text-2xl font-bold text-emerald-800">
                                                                            {tenant.formatted_assistance_amount}
                                                                        </p>
                                                                    </CardContent>
                                                                </Card>
                                                            )}

                                                            {tenant.assistance_company && (
                                                                <Card className="bg-emerald-50 border-emerald-200">
                                                                    <CardContent className="p-4">
                                                                        <div className="flex items-center space-x-2 mb-1">
                                                                            <Building className="h-4 w-4 text-emerald-600" />
                                                                            <label className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                                                                                Assistance Company
                                                                            </label>
                                                                        </div>
                                                                        <p className="mt-1 text-lg font-semibold text-emerald-800">
                                                                            {tenant.assistance_company}
                                                                        </p>
                                                                    </CardContent>
                                                                </Card>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
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
