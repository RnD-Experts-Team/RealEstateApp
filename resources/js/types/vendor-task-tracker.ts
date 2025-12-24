// Base interfaces for related entities
export interface CityOption {
    id: number;
    city: string;
}

export interface PropertyOption {
    id: number;
    property_name: string;
    city?: string;
    city_id?: number;
}

export interface UnitOption {
    id: number;
    unit_name: string;
    property_name?: string;
    city?: string;
    property_id?: number;
}

export interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
    city_id?: number;
}

// Main VendorTaskTracker interface
export interface VendorTaskTracker {
    id: number;
    // Foreign key fields (for database operations)
    vendor_id?: number | null;
    unit_id?: number | null;
    
    // Display fields (computed from relationships)
    city?: string;
    property_name?: string | null;
    vendor_name?: string;
    unit_name?: string;
    
    // Core task fields
    task_submission_date: string;  // ISO string date
    assigned_tasks: string;
    any_scheduled_visits?: string | null;  // ISO string date
    notes?: string | null;
    task_ending_date?: string | null;  // ISO string date
    status?: string | null;
    urgent: 'Yes' | 'No';
    is_archived: boolean;
    created_at: string;
    updated_at: string;

    is_hidden: boolean;
    
    // Relationship data (optional, loaded with relationships)
    vendor?: {
        id: number;
        vendor_name: string;
        city_id?: number;
        city?: {
            id: number;
            city: string;
        };
    };
    unit?: {
        id: number;
        unit_name: string;
        property_id?: number;
        property?: {
            id: number;
            property_name: string;
            city_id?: number;
            city?: {
                id: number;
                city: string;
            };
        };
    };
}

// Form data interface for creating/updating tasks
export type VendorTaskTrackerFormData = {
    // Use foreign key IDs for form submission
    vendor_id: string;
    unit_id: string;
    
    // Core task fields
    task_submission_date: string;
    assigned_tasks: string;
    any_scheduled_visits: string;
    notes: string;
    task_ending_date: string;
    status: string;
    urgent: 'Yes' | 'No';
} & Record<string, any>;

// Legacy interfaces for backward compatibility (deprecated)
/**
 * @deprecated Use UnitOption instead
 */
export interface UnitData {
    city: string;
    unit_name: string;
}

/**
 * @deprecated Use VendorOption instead
 */
export interface VendorData {
    vendor_name: string;
}

// Paginated response interface
export interface PaginatedVendorTaskTracker {
    data: VendorTaskTracker[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        path: string;
        per_page: number;
        to: number | null;
        total: number;
    };
}

// Filter interface
export interface VendorTaskTrackerFilters {
    search?: string;
    city?: string;
    property?: string;
    unit_name?: string;
    vendor_name?: string;
    status?: string;
    urgent?: 'Yes' | 'No';
    archived?: boolean;
}

// Dropdown data structure for forms
export interface VendorTaskTrackerDropdownData {
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
}

// Validation error interface
export interface VendorTaskTrackerValidationErrors {
    vendor_id?: string[];
    unit_id?: string[];
    task_submission_date?: string[];
    assigned_tasks?: string[];
    any_scheduled_visits?: string[];
    notes?: string[];
    task_ending_date?: string[];
    status?: string[];
    urgent?: string[];
}

// API response interfaces
export interface VendorTaskTrackerCreateResponse {
    message: string;
    task: VendorTaskTracker;
}

export interface VendorTaskTrackerUpdateResponse {
    message: string;
    task: VendorTaskTracker;
}

export interface VendorTaskTrackerDeleteResponse {
    message: string;
}

// Export data interface
export interface VendorTaskTrackerExportData {
    id: number;
    city: string;
    property_name: string;
    unit_name: string;
    vendor_name: string;
    task_submission_date: string;
    assigned_tasks: string;
    any_scheduled_visits: string;
    task_ending_date: string;
    notes: string;
    status: string;
    urgent: string;
}

// Props interfaces for components
export interface VendorTaskTrackerIndexProps {
    tasks: PaginatedVendorTaskTracker;
    filters: VendorTaskTrackerFilters;
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    vendors: VendorOption[];
    unitsByCity: Record<string, UnitOption[]>;
    propertiesByCity: Record<string, PropertyOption[]>;
    unitsByProperty: Record<string, Record<string, UnitOption[]>>;
    vendorsByCity: Record<string, VendorOption[]>;
}

export interface VendorTaskTrackerCreateProps extends VendorTaskTrackerDropdownData {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export interface VendorTaskTrackerEditProps extends VendorTaskTrackerDropdownData {
    task: VendorTaskTracker;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export interface VendorTaskTrackerShowProps {
    task: VendorTaskTracker;
}

// Status and urgency enums for better type safety
export enum TaskStatus {
    PENDING = 'Pending',
    IN_PROGRESS = 'In Progress',
    COMPLETED = 'Completed',
    ON_HOLD = 'On Hold'
}

export enum TaskUrgency {
    YES = 'Yes',
    NO = 'No'
}

// Utility type for partial updates
export type PartialVendorTaskTrackerFormData = Partial<VendorTaskTrackerFormData>;

// Type guards for runtime type checking
export function isVendorTaskTracker(obj: any): obj is VendorTaskTracker {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.task_submission_date === 'string' &&
        typeof obj.assigned_tasks === 'string' &&
        (obj.urgent === 'Yes' || obj.urgent === 'No')
    );
}

export function isCityOption(obj: any): obj is CityOption {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.city === 'string'
    );
}

export function isUnitOption(obj: any): obj is UnitOption {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.unit_name === 'string'
    );
}

export function isVendorOption(obj: any): obj is VendorOption {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.vendor_name === 'string'
    );
}
