import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup } from '@/components/ui/radioGroup';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface TenantData {
    first_name: string;
    last_name: string;
    street_address_line: string;
    login_email: string;
    alternate_email: string;
    mobile: string;
    emergency_phone: string;
    cash_or_check: string;
    has_insurance: string;
    sensitive_communication: string;
    has_assistance: string;
    assistance_amount: string;
    assistance_company: string;
}

interface Props {
    onTenantCreated: (tenantData: TenantData) => void;
    onCancel: () => void;
}

export default function InlineTenantCreation({ onTenantCreated, onCancel }: Props) {
    const [isOpen, setIsOpen] = useState(true);
    const [tenantData, setTenantData] = useState<TenantData>({
        first_name: '',
        last_name: '',
        street_address_line: '',
        login_email: '',
        alternate_email: '',
        mobile: '',
        emergency_phone: '',
        cash_or_check: '',
        has_insurance: '',
        sensitive_communication: '',
        has_assistance: '',
        assistance_amount: '',
        assistance_company: '',
    });
    
    const [errors, setErrors] = useState<Partial<Record<keyof TenantData, string>>>({});

    const handleChange = (field: keyof TenantData, value: string) => {
        setTenantData(prev => ({ ...prev, [field]: value }));
        // Clear error when user types
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof TenantData, string>> = {};
        
        if (!tenantData.first_name.trim()) {
            newErrors.first_name = 'First name is required';
        }
        
        if (!tenantData.last_name.trim()) {
            newErrors.last_name = 'Last name is required';
        }
        
        // Email validation (optional but must be valid if provided)
        if (tenantData.login_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantData.login_email)) {
            newErrors.login_email = 'Invalid email format';
        }
        
        if (tenantData.alternate_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tenantData.alternate_email)) {
            newErrors.alternate_email = 'Invalid email format';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreate = () => {
        if (validate()) {
            onTenantCreated(tenantData);
        }
    };

    return (
        <div className="rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 p-4">
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Create New Tenant</h3>
                    <div className="flex items-center gap-2">
                        <CollapsibleTrigger asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                            >
                                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </Button>
                        </CollapsibleTrigger>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onCancel}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <CollapsibleContent className="space-y-4">
                    {/* Personal Information */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Personal Information</h4>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="tenant-first-name" className="text-sm dark:text-gray-200">
                                    First Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tenant-first-name"
                                    value={tenantData.first_name}
                                    onChange={(e) => handleChange('first_name', e.target.value)}
                                    placeholder="First name"
                                    className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.first_name}</p>
                                )}
                            </div>
                            
                            <div>
                                <Label htmlFor="tenant-last-name" className="text-sm dark:text-gray-200">
                                    Last Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="tenant-last-name"
                                    value={tenantData.last_name}
                                    onChange={(e) => handleChange('last_name', e.target.value)}
                                    placeholder="Last name"
                                    className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="tenant-address" className="text-sm dark:text-gray-200">Street Address</Label>
                            <Input
                                id="tenant-address"
                                value={tenantData.street_address_line}
                                onChange={(e) => handleChange('street_address_line', e.target.value)}
                                placeholder="Street address"
                                className="bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Contact Information</h4>
                        
                        <div>
                            <Label htmlFor="tenant-login-email" className="text-sm dark:text-gray-200">Login Email</Label>
                            <Input
                                id="tenant-login-email"
                                type="email"
                                value={tenantData.login_email}
                                onChange={(e) => handleChange('login_email', e.target.value)}
                                placeholder="email@example.com"
                                className="bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                            {errors.login_email && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.login_email}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="tenant-alt-email" className="text-sm dark:text-gray-200">Alternate Email</Label>
                            <Input
                                id="tenant-alt-email"
                                type="email"
                                value={tenantData.alternate_email}
                                onChange={(e) => handleChange('alternate_email', e.target.value)}
                                placeholder="alternate@example.com"
                                className="bg-white dark:bg-gray-800 dark:border-gray-700"
                            />
                            {errors.alternate_email && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.alternate_email}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="tenant-mobile" className="text-sm dark:text-gray-200">Mobile</Label>
                                <Input
                                    id="tenant-mobile"
                                    value={tenantData.mobile}
                                    onChange={(e) => handleChange('mobile', e.target.value)}
                                    placeholder="(555) 123-4567"
                                    className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="tenant-emergency" className="text-sm dark:text-gray-200">Emergency Phone</Label>
                                <Input
                                    id="tenant-emergency"
                                    value={tenantData.emergency_phone}
                                    onChange={(e) => handleChange('emergency_phone', e.target.value)}
                                    placeholder="(555) 987-6543"
                                    className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment & Preferences */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Payment & Preferences</h4>
                        
                        <div>
                            <Label htmlFor="tenant-payment" className="text-sm dark:text-gray-200">Payment Method</Label>
                            <Select value={tenantData.cash_or_check} onValueChange={(value) => handleChange('cash_or_check', value)}>
                                <SelectTrigger id="tenant-payment" className="bg-white dark:bg-gray-800 dark:border-gray-700">
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cash">Cash</SelectItem>
                                    <SelectItem value="Check">Check</SelectItem>
                                    <SelectItem value="EFT">EFT</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label className="text-sm mb-2 block dark:text-gray-200">Has Insurance?</Label>
                            <RadioGroup 
                                value={tenantData.has_insurance} 
                                onValueChange={(value: string) => handleChange('has_insurance', value)}
                                name="has_insurance"
                                options={[
                                    { value: 'Yes', label: 'Yes' },
                                    { value: 'No', label: 'No' }
                                ]}
                            />
                        </div>

                        <div>
                            <Label className="text-sm mb-2 block dark:text-gray-200">Sensitive Communication?</Label>
                            <RadioGroup 
                                value={tenantData.sensitive_communication} 
                                onValueChange={(value: string) => handleChange('sensitive_communication', value)}
                                name="sensitive_communication"
                                options={[
                                    { value: 'Yes', label: 'Yes' },
                                    { value: 'No', label: 'No' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Assistance */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-purple-800 dark:text-purple-300 uppercase">Assistance</h4>
                        
                        <div>
                            <Label className="text-sm mb-2 block dark:text-gray-200">Has Assistance?</Label>
                            <RadioGroup 
                                value={tenantData.has_assistance} 
                                onValueChange={(value: string) => handleChange('has_assistance', value)}
                                name="has_assistance"
                                options={[
                                    { value: 'Yes', label: 'Yes' },
                                    { value: 'No', label: 'No' }
                                ]}
                            />
                        </div>

                        {tenantData.has_assistance === 'Yes' && (
                            <>
                                <div>
                                    <Label htmlFor="tenant-assistance-amount" className="text-sm dark:text-gray-200">Assistance Amount</Label>
                                    <Input
                                        id="tenant-assistance-amount"
                                        type="number"
                                        step="0.01"
                                        value={tenantData.assistance_amount}
                                        onChange={(e) => handleChange('assistance_amount', e.target.value)}
                                        placeholder="0.00"
                                        className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="tenant-assistance-company" className="text-sm dark:text-gray-200">Assistance Company</Label>
                                    <Input
                                        id="tenant-assistance-company"
                                        value={tenantData.assistance_company}
                                        onChange={(e) => handleChange('assistance_company', e.target.value)}
                                        placeholder="Company name"
                                        className="bg-white dark:bg-gray-800 dark:border-gray-700"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <Button
                        type="button"
                        onClick={handleCreate}
                        size="sm"
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Tenant
                    </Button>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}
