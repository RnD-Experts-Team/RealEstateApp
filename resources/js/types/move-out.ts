export interface MoveOut {
    id: number;
    unit_id: number | null;
    // These are virtual properties from relationships (provided by backend transformation)
    unit_name: string | null;
    city_name: string | null;
    property_name: string | null;
    // Actual database fields
    tenants: string | null;
    move_out_date: string | null;  // ISO string date
    lease_status: string | null;
    date_lease_ending_on_buildium: string | null;  // ISO string date
    keys_location: string | null;
    utilities_under_our_name: 'Yes' | 'No' | null;
    date_utility_put_under_our_name: string | null;  // ISO string date
    walkthrough: string | null;
    all_the_devices_are_off: 'Yes' | 'No' | null;
    repairs: string | null;
    send_back_security_deposit: string | null;
    notes: string | null;
    cleaning: 'cleaned' | 'uncleaned' | null;
    list_the_unit: string | null;
    renter: 'Yes' | 'No' | null;
    move_out_form: 'filled' | 'not filled' | null;
    utility_type: string | null;
    is_hidden: boolean;
    created_at: string;
    updated_at: string;
}

// Form data that matches what the backend expects
export type MoveOutFormData = {
    unit_id: number | null;
    tenants: string;
    move_out_date: string;
    lease_status: string;
    date_lease_ending_on_buildium: string;
    keys_location: string;
    utilities_under_our_name: 'Yes' | 'No' | '';
    date_utility_put_under_our_name: string;
    walkthrough: string;
    all_the_devices_are_off: 'Yes' | 'No' | '';
    repairs: string;
    send_back_security_deposit: string;
    notes: string;
    cleaning: 'cleaned' | 'uncleaned' | '';
    list_the_unit: string;
    renter: 'Yes' | 'No' | '';
    move_out_form: 'filled' | 'not filled' | '';
    utility_type: string;
} & Record<string, any>;

// Updated to match the actual backend data structure
// Note: This interface is kept for compatibility with other modules that may still use tenant data
export interface TenantData {
    id: number;
    full_name: string;
    unit_name: string | null;  // Changed from unit_number to unit_name
    property_name: string | null;
    city_name: string | null;
}

// Define the Property interface inline to avoid import issues
export interface PropertyInfoWithoutInsurance {
    id: number;
    property_name: string;
    city_id?: number | null;
    is_archived: boolean;
}

// Additional interfaces for better type safety
export interface Unit {
    id: number;
    unit_name: string;
    property_id: number | null;
    property?: PropertyInfoWithoutInsurance;
}

// Note: This interface is kept for compatibility with other modules that may still use tenant relationships
export interface TenantsByUnit {
    id: number;
    full_name: string;
    tenant_id: number;
}

export interface AllUnitsData {
    id: number;
    unit_name: string;
    city_name: string | null;
    property_name: string | null;
}

// For dropdown data structure
export interface DropdownData {
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    unitsByProperty: Record<string, string[]>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
}
