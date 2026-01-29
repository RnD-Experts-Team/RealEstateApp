import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import InlineTenantCreation from './InlineTenantCreation';

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
    tenants: string;
    onTenantsChange: (value: string) => void;
    error?: string;
    newTenantData?: TenantData | null;
    onNewTenantCreate: (tenantData: TenantData) => void;
}

export default function TenantDetails({ tenants, onTenantsChange, error, newTenantData, onNewTenantCreate }: Props) {
    const [showInlineCreate, setShowInlineCreate] = useState(false);

    const handleTenantCreated = (tenantData: TenantData) => {
        onNewTenantCreate(tenantData);
        setShowInlineCreate(false);
    };

    return (
        <div className="space-y-3">
            <div className="rounded-lg border-l-4 border-l-orange-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="tenants" className="text-base font-semibold">
                        Tenants
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                        Enter tenant names or create a new tenant with full details
                    </p>
                </div>
                <Input
                    id="tenants"
                    value={tenants}
                    onChange={(e) => onTenantsChange(e.target.value)}
                    placeholder="Enter tenant names"
                    disabled={!!newTenantData}
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                
                {/* Button to show inline tenant creation */}
                {!showInlineCreate && !newTenantData && (
                    <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => setShowInlineCreate(true)}
                        className="mt-2 h-auto p-0 text-purple-600"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        Create tenant with full details
                    </Button>
                )}
                
                {/* Show new tenant indicator */}
                {newTenantData && (
                    <div className="mt-2 text-sm text-green-600">
                        ✓ New tenant "{newTenantData.first_name} {newTenantData.last_name}" will be created
                    </div>
                )}
            </div>

            {/* Inline tenant creation form */}
            {showInlineCreate && (
                <InlineTenantCreation
                    onTenantCreated={handleTenantCreated}
                    onCancel={() => setShowInlineCreate(false)}
                />
            )}
        </div>
    );
}
