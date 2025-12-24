// resources/js/types/application.ts

// Base interfaces for hierarchical data structure
export interface CityData {
    id: number;
    name: string;
}

export interface PropertyData {
    id: number;
    name: string;
    city_id: number;
}

export interface UnitData {
    id: number;
    name: string;
    property_id: number;
}

// Attachment interface for structured file data
export interface Attachment {
    index: number;
    name: string;
    path: string;
    url: string;
    download_url: string;
}

// Main Application interface
export interface Application {
    id: number;
    unit_id: number;
    name: string;
    co_signer: string | null;
    status: string | null;
    applicant_applied_from: string | null;
    date: string | null;
    stage_in_progress: string | null;
    notes: string | null;
    attachment_name: string[] | null;
    attachment_path: string[] | null;
    attachments?: Attachment[];
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    
    // Display properties (added by controller for frontend display)
    city?: string;
    property?: string;
    unit_name?: string;
    
    // Selection helpers for edit forms (added by controller)
    selected_city_id?: number;
    selected_property_id?: number;
    
    // Computed properties
    formatted_date?: string | null;
    attachment_url?: string | null;
    is_hidden?: boolean;

    // Relationship data (when loaded with relationships)
    unit?: {
        id: number;
        unit_name: string;
        property_id: number;
        property?: {
            id: number;
            property_name: string;
            city_id: number;
            city?: {
                id: number;
                city: string;
            };
        };
    };
}

// Form data interfaces
export interface ApplicationFormData {
    unit_id: number | null;
    name: string;
    co_signer: string;
    status: string;
    applicant_applied_from: string;
    date: string;
    stage_in_progress: string;
    notes: string;
    attachments?: File[] | null;
}

// For create/update requests that include validation helper fields
export interface ApplicationRequestData extends ApplicationFormData {
    city_id?: number;
    property_id?: number;
}

// Hierarchical dropdown data structure
export interface DropdownData {
    cities: CityData[];
    properties: Record<string, PropertyData[]>; // Key: city_id, Value: properties in that city
    units: Record<string, UnitData[]>; // Key: property_id, Value: units in that property
}

// Legacy interface for backward compatibility (if needed)
export interface LegacyUnitData {
    city: string;
    property: string;
    unit_name: string;
}

// Statistics interface
export interface ApplicationStatistics {
    total: number;
    status_counts: Record<string, number>;
    stage_counts: Record<string, number>;
    applied_from_counts: Record<string, number>;
}

// Pagination interface
export interface PaginatedApplications {
    data: Application[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

// Filter interfaces
export interface ApplicationFilters {
    city?: string;
    property?: string;
    name?: string;
    co_signer?: string;
    unit?: string;
    status?: string;
    applicant_applied_from?: string;
    stage_in_progress?: string;
    date_from?: string;
    date_to?: string;
    [key: string]: string | undefined;
}

// Enhanced filter interface for ID-based filtering (if needed)
export interface ApplicationFiltersById {
    city_id?: number;
    property_id?: number;
    unit_id?: number;
    name?: string;
    co_signer?: string;
    status?: string;
    applicant_applied_from?: string;
    stage_in_progress?: string;
    date_from?: string;
    date_to?: string;
}

// Option interfaces for dropdowns
export interface StatusOption {
    value: string;
    label: string;
}

export interface StageOption {
    value: string;
    label: string;
}

export interface AppliedFromOption {
    value: string;
    label: string;
}

// Predefined status options
export const STATUS_OPTIONS: StatusOption[] = [
    { value: 'New', label: 'New' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Undecided', label: 'Undecided' },
];

// Common stage options (can be customized per application)
export const COMMON_STAGE_OPTIONS: StageOption[] = [
    { value: 'Document Review', label: 'Document Review' },
    { value: 'Background Check', label: 'Background Check' },
    { value: 'Credit Check', label: 'Credit Check' },
    { value: 'Reference Verification', label: 'Reference Verification' },
    { value: 'Final Review', label: 'Final Review' },
    { value: 'Lease Preparation', label: 'Lease Preparation' },
];

// Applicant applied from options
export const APPLIED_FROM_OPTIONS: AppliedFromOption[] = [
    { value: 'buildium', label: 'Buildium' },
    { value: 'Zillow', label: 'Zillow' },
];

// Type guards for runtime type checking
export function isApplication(obj: any): obj is Application {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.unit_id === 'number' &&
        typeof obj.name === 'string' &&
        (typeof obj.co_signer === 'string' || obj.co_signer === null)
    );
}

export function isCityData(obj: any): obj is CityData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string'
    );
}

export function isPropertyData(obj: any): obj is PropertyData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.city_id === 'number'
    );
}

export function isUnitData(obj: any): obj is UnitData {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.property_id === 'number'
    );
}

export function isAttachment(obj: any): obj is Attachment {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.index === 'number' &&
        typeof obj.name === 'string' &&
        typeof obj.path === 'string' &&
        typeof obj.url === 'string' &&
        typeof obj.download_url === 'string'
    );
}

// Utility types for form handling
export type ApplicationCreateData = Omit<ApplicationFormData, 'attachments'> & {
    attachments?: File[];
};

export type ApplicationUpdateData = Partial<ApplicationCreateData>;

// Export types for form validation
export interface ApplicationValidationErrors {
    unit_id?: string;
    city_id?: string;
    property_id?: string;
    name?: string;
    co_signer?: string;
    status?: string;
    applicant_applied_from?: string;
    date?: string;
    stage_in_progress?: string;
    notes?: string;
    attachments?: string;
    'attachments.*'?: string;
}

// Props interfaces for components
export interface ApplicationIndexProps {
    applications: PaginatedApplications;
    statistics: ApplicationStatistics;
    filters: ApplicationFilters;
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
}

export interface ApplicationCreateProps {
    cities: CityData[];
    properties: Record<string, PropertyData[]>;
    units: Record<string, UnitData[]>;
}

export interface ApplicationEditProps extends ApplicationCreateProps {
    application: Application;
}

export interface ApplicationShowProps {
    application: Application;
}

// Event handler types
export type ApplicationSubmitHandler = (data: ApplicationFormData) => void;
export type ApplicationDeleteHandler = (application: Application) => void;
export type ApplicationFilterHandler = (filters: ApplicationFilters) => void;
export type AttachmentDeleteHandler = (applicationId: number, attachmentIndex: number) => void;
