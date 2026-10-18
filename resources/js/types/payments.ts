export interface Payment {
    // Primary key
    id: number;
    
    // Foreign key - the actual database field
    unit_id: number | null;
    
    // Relationship data - provided by controller transformation for display
    city: string;
    property_name: string | null;
    unit_name: string;
    
    // Payment data
    date: string;
    owes: number;
    paid: number | null;
    left_to_pay: number | null;
    status: string | null;
    notes: string | null;
    reversed_payments: string | null;
    permanent: 'Yes' | 'No';
    
    // Assistance fields
    has_assistance: boolean;
    assistance_amount: number | null;
    assistance_company: string | null;
    
    // Visibility field - managed only via separate hide/unhide actions
    is_hidden: boolean;

    // Follow-up flags
    remind: boolean; // tenant needs reminding (can't use the portals)
    added_to_ledger: boolean;
    
    // Audit fields
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}


export interface PaymentFormData {
    // Form fields that map to database
    date: string;
    unit_id: string; // String in form, converted to number for submission
    owes: string;
    paid: string;
    status: string;
    notes: string;
    reversed_payments: string;
    permanent: 'Yes' | 'No' | '';
    
    // Additional form utility fields
    [key: string]: any;
}


export interface PaymentCreateFormData {
    // Required fields for creation
    date: string;
    unit_id: string;
    owes: string;
    permanent: 'Yes' | 'No';
    
    // Optional fields
    paid?: string;
    notes?: string;
    reversed_payments?: string;
    
    // NOTE: is_hidden is NOT included - it's managed via separate hide/unhide actions
    // Auto-set to true when status becomes 'Paid' or 'Overpaid'
}


export interface PaymentUpdateFormData extends Partial<PaymentCreateFormData> {
    // At least one field must be provided for updates
    date?: string;
    unit_id?: string;
    owes?: string;
    paid?: string;
    notes?: string;
    reversed_payments?: string;
    permanent?: 'Yes' | 'No';
    
    // NOTE: is_hidden is NOT included - it's managed via separate hide/unhide actions
}


export interface PaymentHideActionData {
    // Used for PATCH /payments/{payment}/hide
    // Body is empty - only sets is_hidden to true
}


export interface PaymentUnhideActionData {
    // Used for PATCH /payments/{payment}/unhide
    // Body is empty - only sets is_hidden to false
}


export interface UnitData {
    // Database fields
    id: number;
    property_id: number | null;
    unit_name: string;
    
    // Relationship data for display
    city: string;
    property_name: string;
    
    // Additional unit information (optional based on actual needs)
    tenants?: string | null;
    lease_start?: string | null;
    lease_end?: string | null;
    count_beds?: number | null;
    count_baths?: number | null;
    lease_status?: string | null;
    monthly_rent?: number | null;
    recurring_transaction?: string | null;
    utility_status?: string | null;
    account_number?: string | null;
    insurance?: 'Yes' | 'No' | null;
    insurance_expiration_date?: string | null;
    vacant?: string;
    listed?: string;
    total_applications?: number;
    is_archived?: boolean;
}


export interface PropertyData {
    id: number;
    city_id: number | null;
    property_name: string;
    is_archived: boolean;
    
    // Relationship data
    city?: string;
}


export interface CityData {
    id: number;
    city: string;
    is_archived: boolean;
}


// Utility types for different contexts
export interface PaymentDisplayData extends Payment {
    // Additional computed or formatted fields for display
    formatted_owes?: string;
    formatted_paid?: string;
    formatted_left_to_pay?: string;
    formatted_date?: string;
}


export interface PaymentFilters {
    city?: string;
    property?: string;
    unit?: string;
    status?: string[];
    permanent?: string[];
    is_hidden?: boolean;
    remind?: boolean | null; // null/undefined = all
    added_to_ledger?: boolean | null;
    date_from?: string;
    date_to?: string;
    search?: string;
}


export interface PaymentStatistics {
    total: number;
    paid: number;
    didnt_pay: number;
    paid_partly: number;
    overpaid: number;
    total_owes?: number;
    total_paid?: number;
    total_left_to_pay?: number;
}


// Dropdown data structures
export interface DropdownData {
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
    units: UnitData[];
}


// API Response structures
export interface PaymentsPaginatedResponse {
    data: Payment[];
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    meta: {
        current_page: number;
        from: number | null;
        last_page: number;
        per_page: number;
        to: number | null;
        total: number;
    };
}


export interface PaymentApiResponse {
    payment: Payment;
    message?: string;
}


// Form validation types
export interface PaymentValidationErrors {
    date?: string;
    unit_id?: string;
    owes?: string;
    paid?: string;
    notes?: string;
    reversed_payments?: string;
    permanent?: string;
}


// Component prop types
export interface PaymentComponentProps {
    payments: PaymentsPaginatedResponse;
    search?: string | null;
    filters?: PaymentFilters;
    dropdownData: DropdownData;
    statistics?: PaymentStatistics;
}


export interface PaymentDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
    units: UnitData[];
    cities: string[];
    properties: string[];
    unitsByCity: Record<string, string[]>;
    unitsByProperty: Record<string, string[]>;
    propertiesByCity: Record<string, string[]>;
}


export interface PaymentCreateDrawerProps extends PaymentDrawerProps {
    // No additional props needed for create
}


export interface PaymentEditDrawerProps extends PaymentDrawerProps {
    payment: Payment;
}


export interface PaymentTableProps {
    payments: Payment[];
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    hasAnyPermission: (permissions: string[]) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
    hasPermission: (permission: string) => boolean;
}


export interface PaymentActionsProps {
    payment: Payment;
    onEdit: (payment: Payment) => void;
    onDelete: (payment: Payment) => void;
    onHide: (payment: Payment) => void;
    onUnhide: (payment: Payment) => void;
    hasPermission: (permission: string) => boolean;
    hasAllPermissions: (permissions: string[]) => boolean;
}


// Type guards
export const isValidPayment = (obj: any): obj is Payment => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.date === 'string' &&
        typeof obj.city === 'string' &&
        typeof obj.unit_name === 'string' &&
        typeof obj.owes === 'number' &&
        typeof obj.is_hidden === 'boolean' &&
        (obj.permanent === 'Yes' || obj.permanent === 'No')
    );
};


export const isValidUnitData = (obj: any): obj is UnitData => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.id === 'number' &&
        typeof obj.unit_name === 'string' &&
        typeof obj.city === 'string' &&
        typeof obj.property_name === 'string'
    );
};


export const isPaymentHidden = (payment: Payment): boolean => {
    return payment.is_hidden === true;
};


export const isPaymentVisible = (payment: Payment): boolean => {
    return payment.is_hidden === false;
};


export const isPaidOrOverpaid = (payment: Payment): boolean => {
    return payment.status === 'Paid' || payment.status === 'Overpaid';
};


// Utility type transformations
export type OptionalNullable<T> = {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
} & {
    [K in keyof T as null extends T[K] ? never : K]: T[K];
};


export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;


export type PaymentWithRequiredUnit = RequiredFields<Payment, 'unit_id'>;


export type HiddenPayment = Payment & { is_hidden: true };


export type VisiblePayment = Payment & { is_hidden: false };


export type PaidPayment = Payment & { status: 'Paid' | 'Overpaid'; is_hidden: true };


// Export commonly used type combinations
export type PaymentFormSubmission = PaymentCreateFormData | PaymentUpdateFormData;


export type PaymentWithRelations = Payment & {
    unit?: UnitData;
    property?: PropertyData;
    city_data?: CityData;
};


// Action types for hide/unhide operations
export type PaymentVisibilityAction = 'hide' | 'unhide';


export interface PaymentVisibilityChange {
    paymentId: number;
    action: PaymentVisibilityAction;
    previousState: boolean;
    newState: boolean;
}
