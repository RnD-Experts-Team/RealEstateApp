// resources/js/types/PaymentPlan.ts

/**
 * Main PaymentPlan interface representing the data structure from the backend
 * This includes both the database fields and computed/relationship fields
 */
export interface PaymentPlan {
  id: number;
  tenant_id: number | null;
  // Display fields populated from relationships
  tenant: string;
  unit: string;
  property: string;
  city_name: string | null;
  // Core payment fields
  amount: number;
  dates: string;
  paid: number;
  left_to_pay: number;
  status: 'Paid' | 'Paid Partly' | "Didn't Pay" | 'N/A';
  notes: string | null;
  is_hidden: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
}

/**
 * Form data interface for creating/updating payment plans
 * Uses the actual database structure with tenant_id
 */
export interface PaymentPlanFormData {
  tenant_id: number | null;
  amount: number;
  dates: string;
  paid: number;
  notes: string;
}

/**
 * Tenant dropdown item interface for selection components
 */
export interface TenantDropdownItem {
  id: number;
  name: string;
  label: string;
  unit_id: number | null;
  unit_name: string | null;
  property_name: string | null;
  city_name: string | null;
}

/**
 * City dropdown item interface
 */
export interface CityDropdownItem {
  id: number;
  name: string;
}

/**
 * Property dropdown item interface
 */
export interface PropertyDropdownItem {
  id: number;
  name: string;
  city_id: number | null;
  city_name: string | null;
}

/**
 * Unit dropdown item interface
 */
export interface UnitDropdownItem {
  id: number;
  name: string;
  property_id: number | null;
  property_name: string | null;
  city_name: string | null;
}

/**
 * Updated dropdown data structure with proper typing for relationships
 */
export interface DropdownData {
  cities: CityDropdownItem[];
  properties: PropertyDropdownItem[];
  units: UnitDropdownItem[];
  tenants: TenantDropdownItem[];
}

/**
 * Laravel pagination meta information
 */
export interface PaginationMeta {
  current_page: number;
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

/**
 * Laravel pagination link structure
 */
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

/**
 * Generic paginated response interface for Laravel pagination
 */
export interface PaginatedResponse<T> {
  data: T[];
  links: PaginationLink[];
  meta?: PaginationMeta;
  // Legacy support for direct pagination properties
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
  path: string;
}

/**
 * Payment plan index page props
 */
export interface PaymentPlanIndexProps {
  paymentPlans: PaginatedResponse<PaymentPlan>;
  search?: string | null;
  dropdownData?: DropdownData;
}

/**
 * Payment plan create page props
 */
export interface PaymentPlanCreateProps {
  dropdownData: DropdownData;
}

/**
 * Payment plan edit page props
 */
export interface PaymentPlanEditProps {
  paymentPlan: PaymentPlan;
  dropdownData: DropdownData;
}

/**
 * Payment plan show page props
 */
export interface PaymentPlanShowProps {
  paymentPlan: PaymentPlan;
  prevId?: number | null;
  nextId?: number | null;
  filters?: { city?: string | null; property?: string | null; unit?: string | null; tenant?: string | null };
  search?: string | null;
  perPage?: number | string;
  page?: number | null;
}

/**
 * Payment plan statistics interface (for potential dashboard use)
 */
export interface PaymentPlanStats {
  totalPlans: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  paidPlans: number;
  partiallyPaidPlans: number;
  unpaidPlans: number;
}

/**
 * Payment plan filter options
 */
export interface PaymentPlanFilters {
  tenant_id?: number | null;
  property_id?: number | null;
  city_id?: number | null;
  status?: PaymentPlan['status'] | null;
  date_from?: string | null;
  date_to?: string | null;
  amount_min?: number | null;
  amount_max?: number | null;
}

/**
 * API response wrapper for consistent API responses
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
  errors?: Record<string, string[]>;
}

/**
 * Validation error structure from Laravel
 */
export interface ValidationErrors {
  [key: string]: string[];
}

/**
 * Common component props for payment plan components
 */
export interface BasePaymentPlanComponentProps {
  className?: string;
  loading?: boolean;
  disabled?: boolean;
}


// Type guards for runtime type checking
export const isPaymentPlan = (obj: any): obj is PaymentPlan => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'number' &&
    typeof obj.amount === 'number' &&
    typeof obj.dates === 'string'
  );
};

export const isPaginatedResponse = <T>(obj: any): obj is PaginatedResponse<T> => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray(obj.data) &&
    typeof obj.current_page === 'number' &&
    typeof obj.last_page === 'number'
  );
};

// Utility type for creating partial updates
export type PaymentPlanUpdate = Partial<Pick<PaymentPlanFormData, 'tenant_id' | 'amount' | 'dates' | 'paid' | 'notes'>>;

// Status type for better type safety
export type PaymentStatus = PaymentPlan['status'];

// Date range type for filtering
export interface DateRange {
  from: string | null;
  to: string | null;
}

// Sort options for payment plans
export interface PaymentPlanSortOptions {
  field: keyof PaymentPlan;
  direction: 'asc' | 'desc';
}
