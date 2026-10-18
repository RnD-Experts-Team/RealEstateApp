// types/OfferRenewal.ts

export interface OfferRenewal {
  id: number;
  tenant_id?: number;
  city_name?: string;
  property?: string;
  unit?: string;
  tenant?: string;
  other_tenants?: string;
  date_sent_offer?: string;
  date_offer_expires?: string;
  status?: string;
  date_of_acceptance?: string;
  date_of_decline?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_expires?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: number;
  expired?: string;
  is_archived?: boolean;
  is_hidden?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type LeaseFilter = '' | 'signed' | 'unsigned';

// Index page filter state (also passed to rows/drawers to keep context on redirect)
export interface OfferFilters {
  city: string;
  property: string;
  unit: string;
  tenant: string;
  is_hidden: boolean;
  lease: LeaseFilter;
}

export interface HierarchicalData {
  id: number;
  name: string;
  properties: Property[];
}

export interface Property {
  id: number;
  name: string;
  city_id: number;
  units: Unit[];
}

export interface Unit {
  id: number;
  name: string;
  property_id: number;
  tenants: TenantInUnit[];
}

export interface TenantInUnit {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  unit_id: number;
}

// Legacy interface for backward compatibility (if still needed elsewhere)
export interface Tenant {
  id?: number;
  property_name?: string;
  unit_number?: string;
  first_name: string;
  last_name: string;
  unit_id?: number;
  is_archived?: boolean;
}

// City interface for the hierarchical structure
export interface City {
  id: number;
  name: string;
  properties?: Property[];
}

// Form data interfaces for create/edit operations
export interface OfferRenewalFormData {
  tenant_id: string;
  city_id: string;
  property_id: string;
  unit_id: string;
  date_sent_offer: string;
  date_offer_expires?: string;
  status?: string;
  date_of_acceptance?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_expires?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: string;
}

// API response types
export interface OfferRenewalResponse {
  offers: OfferRenewal[];
  hierarchicalData: HierarchicalData[];
  search?: string;
}

export interface CreateOfferRenewalResponse {
  message: string;
  offer: OfferRenewal;
}

export interface UpdateOfferRenewalResponse {
  message: string;
  offer: OfferRenewal;
}

// Validation error types
export interface OfferRenewalValidationErrors {
  tenant_id?: string;
  city_id?: string;
  property_id?: string;
  unit_id?: string;
  date_sent_offer?: string;
  date_offer_expires?: string;
  status?: string;
  date_of_acceptance?: string;
  last_notice_sent?: string;
  notice_kind?: string;
  lease_sent?: string;
  date_sent_lease?: string;
  lease_expires?: string;
  lease_signed?: string;
  date_signed?: string;
  last_notice_sent_2?: string;
  notice_kind_2?: string;
  notes?: string;
  how_many_days_left?: string;
}

// Calendar states for date pickers
export interface CalendarStates {
  date_sent_offer: boolean;
  date_offer_expires: boolean;
  date_of_acceptance: boolean;
  last_notice_sent: boolean;
  date_sent_lease: boolean;
  lease_expires: boolean;
  date_signed: boolean;
  last_notice_sent_2: boolean;
}

// Enum-like types for consistent values
export type OfferStatus = 'Accepted' | "Didn't Accept" | "Didn't respond";
export type NoticeKind = 'Email' | 'Call';
export type LeaseSent = 'Yes' | 'No';
export type LeaseSigned = 'Signed' | 'Unsigned';
export type ExpiredStatus = 'expired' | 'active';

// Props interfaces for components
export interface OfferRenewalIndexProps {
  offers: OfferRenewal[];
  hierarchicalData: HierarchicalData[];
  search?: string;
}

export interface OfferRenewalCreateDrawerProps {
  hierarchicalData: HierarchicalData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface OfferRenewalEditDrawerProps {
  offer: OfferRenewal;
  hierarchicalData: HierarchicalData[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export interface OfferRenewalShowProps {
  offer: OfferRenewal;
}

// Utility types
export type OfferRenewalTab = 'offers' | 'renewals' | 'both';

export interface OfferRenewalFilters {
  tab: OfferRenewalTab;
  search?: string;
  city?: string;
  property?: string;
  unit?: string;
  tenant?: string;
  status?: OfferStatus;
  expired?: ExpiredStatus;
}

// Export utility functions types
export interface CSVExportOptions {
  data: OfferRenewal[];
  activeTab: OfferRenewalTab;
  filename?: string;
}

export interface DateParseOptions {
  format?: string;
  fallback?: Date;
  strict?: boolean;
}
