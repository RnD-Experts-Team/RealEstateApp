// resources/js/types/tenant.ts

export interface Tenant {
    id: number;
    unit_id: number;
    // Display fields provided by the backend for user-friendly interface
    property_name: string;
    unit_number: string;
    city_name: string;
    first_name: string;
    last_name: string;
    street_address_line?: string | null;
    login_email?: string | null;
    alternate_email?: string | null;
    mobile?: string | null;
    emergency_phone?: string | null;
    cash_or_check?: 'Cash' | 'Check' | 'EFT' | null;
    has_insurance?: 'Yes' | 'No' | null;
    sensitive_communication?: 'Yes' | 'No' | null;
    has_assistance?: 'Yes' | 'No' | null;
    assistance_amount?: number | null;
    assistance_company?: string | null;
    created_at: string;
    updated_at: string;
}

export interface TenantFormData {
    unit_id: string;
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
    city_id: string;
}

// Updated interfaces for dropdown data
export interface UnitData {
    id: number;
    unit_name: string;
    property_id: number;
}

export interface UnitOption {
    id: number;
    unit_name: string;
}

export interface TenantDropdownData {
    units: UnitData[];
    properties: string[];
    unitsByProperty: Record<string, UnitOption[]>;
}

// Legacy interface for backward compatibility (if needed)
export interface LegacyTenantFormData {
    property_name: string;
    unit_number: string;
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
