// resources/js/types/property.ts

// Insurance Representative interface
export interface InsuranceRepresentative {
    id: number;
    name: string;
    deleted_at?: string | null;
}

// Property Insurance Attachment interface
export interface PropertyInsuranceAttachment {
    id: number;
    file_name: string;
    url: string;
}

// Interface for the property without insurance data
export interface PropertyWithoutInsurance {
    id: number;
    city_id: number | null;
    property_name: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    // Optional city relationship data
    city?: {
        id: number;
        city: string;
        created_at: string;
        updated_at: string;
    };
}

// Updated main Property interface (PropertyInfo model)
export interface Property {
    id: number;
    property_id: number;  // Foreign key reference to PropertyInfoWithoutInsurance
    representative_id?: number | null;  // Foreign key to InsuranceRepresentative
    insurance_company_name: string;
    amount: number;
    policy_number: string;
    effective_date: string;
    expiration_date: string;
    notes?: string;
    status: 'Active' | 'Expired';
    formatted_amount: string;
    is_archived: boolean;
    is_expired: boolean;
    is_expiring_soon: boolean;
    days_left: number;
    created_at: string;
    updated_at: string;

    // Relationships
    property?: PropertyWithoutInsurance;
    representative?: InsuranceRepresentative | null;
    attachments?: PropertyInsuranceAttachment[];
}

// Add these to your existing property types

export interface PaginatedProperties {
    current_page: number;
    data: Property[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}


// Updated form data interface to match request validation
export interface PropertyFormData {
    property_id: number;
    representative_id?: number | null;
    insurance_company_name: string;
    amount: string;
    policy_number: string;
    effective_date: string;
    expiration_date: string;
    notes?: string;
    attachments?: File[];
    delete_attachment_ids?: number[];
}

// Updated filters interface - keeping property_name for UI filtering
export interface PropertyFilters {
    property_name?: string;  // Keep property_name for filtering by name in UI
    property_id?: number;    // Add property_id for internal filtering
    insurance_company_name?: string;
    policy_number?: string;
    status?: 'Active' | 'Expired';
}

// Keep existing interfaces unchanged
export interface PropertyStatistics {
    total: number;
    active: number;
    expired: number;
}
