export interface NoticeAndEvictionImage {
    id: number;
    file_name: string;
    url: string;
}

export interface NoticeAndEviction {
    id: number;
    tenant_id: number | null;
    // Computed display properties from relationships
    unit_name?: string;
    city_name?: string;
    property_name?: string;
    tenants_name?: string;
    status?: string;
    date?: string;
    type_of_notice?: string;
    have_an_exception?: string; // "Yes" | "No"
    note?: string;
    evictions?: string;
    sent_to_atorney?: string; // "Yes" | "No"
    hearing_dates?: string;
    evected_or_payment_plan?: string; // "Evected" | "Payment Plan"
    if_left?: string; // "Yes" | "No"
    writ_date?: string;
    other_tenants?: string;
    is_archived?: boolean;
    is_hidden?: boolean;
    images?: NoticeAndEvictionImage[];
    created_at?: string;
    updated_at?: string;
}

export interface Tenant {
    id: number;
    unit_id: number | null;
    first_name: string;
    last_name: string;
    street_address_line?: string;
    login_email?: string;
    alternate_email?: string;
    mobile?: string;
    emergency_phone?: string;
    cash_or_check?: 'Cash' | 'Check' | 'EFT';
    has_insurance?: 'Yes' | 'No';
    sensitive_communication?: 'Yes' | 'No';
    has_assistance?: 'Yes' | 'No';
    assistance_amount?: number;
    assistance_company?: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;

    // Computed properties for cascading dropdowns
    full_name?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
}

export interface Notice {
    id: number;
    notice_name: string;
    days?: number;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Extended interfaces for cascading dropdown functionality
export interface Unit {
    id: number;
    property_id: number | null;
    unit_name: string;
    tenants?: string;
    lease_start?: string;
    lease_end?: string;
    count_beds?: number;
    count_baths?: number;
    lease_status?: string;
    monthly_rent?: number;
    recurring_transaction?: string;
    utility_status?: string;
    account_number?: string;
    insurance?: 'Yes' | 'No';
    insurance_expiration_date?: string;
    vacant?: 'Yes' | 'No';
    listed?: 'Yes' | 'No';
    total_applications?: number;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;

    // Computed properties for cascading dropdowns
    property_name?: string;
    city_name?: string;
}

export interface PropertyInfoWithoutInsurance {
    id: number;
    city_id: number | null;
    property_name: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;

    // Computed properties for cascading dropdowns
    city_name?: string;
}

export interface City {
    id: number;
    city: string;
    is_archived?: boolean;
    created_at?: string;
    updated_at?: string;
}

// Type unions for form validation and consistency
export type YesNoOption = 'Yes' | 'No';
export type CashCheckOption = 'Cash' | 'Check';
export type EvictionStatus = 'Evected' | 'Payment Plan';
export type StatusOption = 'Posted' | 'Sent to representative';

// Form data interfaces for create/edit operations
export interface NoticeAndEvictionFormData {
    tenant_id: number | null;
    status?: string;
    date?: string;
    type_of_notice?: string;
    have_an_exception?: YesNoOption | '';
    note?: string;
    evictions?: string;
    sent_to_atorney?: YesNoOption | '';
    hearing_dates?: string;
    evected_or_payment_plan?: EvictionStatus | '';
    if_left?: YesNoOption | '';
    writ_date?: string;
    other_tenants?: string;
    images?: File[];
    delete_image_ids?: number[];
}

// Cascading dropdown data interfaces
export interface CascadingDropdownData {
    cities: City[];
    properties: (PropertyInfoWithoutInsurance & { city_name?: string })[];
    units: Unit[];
    tenants: (Tenant & {
        full_name?: string;
        unit_name?: string;
        property_name?: string;
        city_name?: string;
    })[];
    notices: Notice[];
}

// API response interfaces
export interface NoticeAndEvictionIndexResponse {
    records: NoticeAndEviction[];
    search?: string;
    cities: City[];
    properties: (PropertyInfoWithoutInsurance & { city_name?: string })[];
    units: Unit[];
    tenants: (Tenant & {
        full_name?: string;
        unit_name?: string;
        property_name?: string;
        city_name?: string;
    })[];
    notices: Notice[];
}

export interface NoticeAndEvictionCreateResponse {
    cities: City[];
    properties: (PropertyInfoWithoutInsurance & { city_name?: string })[];
    units: Unit[];
    tenants: (Tenant & {
        full_name?: string;
        unit_name?: string;
        property_name?: string;
        city_name?: string;
    })[];
    notices: Notice[];
}

export interface NoticeAndEvictionEditResponse {
    record: NoticeAndEviction;
    cities: City[];
    properties: (PropertyInfoWithoutInsurance & { city_name?: string })[];
    units: Unit[];
    tenants: (Tenant & {
        full_name?: string;
        unit_name?: string;
        property_name?: string;
        city_name?: string;
    })[];
    notices: Notice[];
}

// Validation error interface
export interface ValidationErrors {
    [key: string]: string;
}

// Export all interfaces for easy importing
// export type {
//   NoticeAndEviction,
//   Tenant,
//   Notice,
//   Unit,
//   PropertyInfoWithoutInsurance,
//   City,
//   NoticeAndEvictionFormData,
//   CascadingDropdownData,
//   NoticeAndEvictionIndexResponse,
//   NoticeAndEvictionCreateResponse,
//   NoticeAndEvictionEditResponse,
//   ValidationErrors
// };
