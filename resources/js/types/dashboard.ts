// resources/js/types/dashboard.ts

export interface City {
    id: number;
    city: string;
}

export interface Property {
    id: number;
    property_name: string;
    city_id: number;
}

export interface Unit {
    id: number;
    unit_name: string;
    property_id: number;
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
    insurance?: string;
    insurance_expiration_date?: string;
    vacant: string;
    listed?: string;
    total_applications?: number;
    formatted_monthly_rent?: string;
    property?: Property & {
        city?: City;
    };
    applications?: Application[];
}

export interface NoticeAndEviction {
    id: number;
    tenant_id?: number;
    status?: string;
    date?: string;
    date_formatted?: string;
    type_of_notice?: string;
    have_an_exception?: string;
    note?: string;
    evictions?: string;
    sent_to_atorney?: string;
    hearing_dates?: string;
    hearing_dates_formatted?: string;
    evected_or_payment_plan?: string;
    if_left?: string;
    writ_date?: string;
    writ_date_formatted?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    tenant_name?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    tenant?: Tenant & {
        unit?: Unit & {
            property?: Property & {
                city?: City;
            };
        };
    };
}

export interface OffersAndRenewal {
    id: number;
    tenant_id?: number;
    date_sent_offer?: string;
    date_sent_offer_formatted?: string;
    date_offer_expires?: string;
    date_offer_expires_formatted?: string;
    status?: string;
    date_of_acceptance?: string;
    date_of_acceptance_formatted?: string;
    last_notice_sent?: string;
    last_notice_sent_formatted?: string;
    notice_kind?: string;
    lease_sent?: string;
    date_sent_lease?: string;
    date_sent_lease_formatted?: string;
    lease_expires?: string;
    lease_expires_formatted?: string;
    lease_signed?: string;
    date_signed?: string;
    date_signed_formatted?: string;
    last_notice_sent_2?: string;
    last_notice_sent_2_formatted?: string;
    notice_kind_2?: string;
    notes?: string;
    how_many_days_left?: number;
    expired?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    tenant_name?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    tenant?: Tenant & {
        unit?: Unit & {
            property?: Property & {
                city?: City;
            };
        };
    };
}

export interface Tenant {
    id: number;
    unit_id: number;
    first_name: string;
    last_name: string;
    full_name: string;
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
    formatted_assistance_amount?: string;
    assistance_company?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
    notices_and_evictions?: NoticeAndEviction[];
    offers_and_renewals?: OffersAndRenewal[];
}

export interface MoveIn {
    id: number;
    unit_id: number;
    signed_lease?: string;
    lease_signing_date?: string;
    lease_signing_date_formatted?: string;
    move_in_date?: string;
    move_in_date_formatted?: string;
    paid_security_deposit_first_month_rent?: string;
    scheduled_paid_time?: string;
    scheduled_paid_time_formatted?: string;
    handled_keys?: string;
    move_in_form_sent_date?: string;
    move_in_form_sent_date_formatted?: string;
    filled_move_in_form?: string;
    date_of_move_in_form_filled?: string;
    date_of_move_in_form_filled_formatted?: string;
    submitted_insurance?: string;
    date_of_insurance_expiration?: string;
    date_of_insurance_expiration_formatted?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
}

export interface MoveOut {
    id: number;
    unit_id: number;
    tenants?: string; // Tenant names as string
    move_out_date?: string;
    move_out_date_formatted?: string;
    lease_status?: string;
    date_lease_ending_on_buildium?: string;
    date_lease_ending_on_buildium_formatted?: string;
    keys_location?: string;
    utilities_under_our_name?: 'Yes' | 'No';
    date_utility_put_under_our_name?: string;
    date_utility_put_under_our_name_formatted?: string;
    walkthrough?: string;
    repairs?: string;
    send_back_security_deposit?: string;
    notes?: string;
    cleaning?: 'cleaned' | 'uncleaned';
    list_the_unit?: string;
    move_out_form?: 'filled' | 'not filled';
    utility_type?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    tenant_name?: string; // Derived from tenants field
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
}

export interface VendorInfo {
    id: number;
    city_id: number;
    vendor_name: string;
    number?: string;
    email?: string;
    service_type?: string;
    is_archived: boolean;
    city?: City;
}

export interface VendorTask {
    id: number;
    task_submission_date: string;
    task_submission_date_formatted?: string;
    vendor_id?: number;
    unit_id?: number;
    assigned_tasks: string;
    any_scheduled_visits?: string;
    any_scheduled_visits_formatted?: string;
    notes?: string;
    task_ending_date?: string;
    task_ending_date_formatted?: string;
    status?: string;
    urgent: 'Yes' | 'No';
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    vendor_name?: string;
    vendor_email?: string;
    vendor_number?: string;
    vendor_service_type?: string;
    vendor_city_name?: string;
    unit_name?: string;
    property_name?: string;
    unit_city_name?: string;
    vendor?: VendorInfo;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
}

export interface Payment {
    id: number;
    date: string;
    date_formatted?: string;
    unit_id?: number;
    owes: number;
    paid?: number;
    left_to_pay: number;
    status: string;
    notes?: string;
    reversed_payments?: string;
    permanent: 'Yes' | 'No';
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    formatted_owes?: string;
    formatted_paid?: string;
    formatted_left_to_pay?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
}

export interface PaymentPlan {
    id: number;
    tenant_id?: number;
    amount: number;
    dates: string;
    dates_formatted?: string;
    paid?: number;
    notes?: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    left_to_pay?: number;
    status?: string;
    formatted_amount?: string;
    formatted_paid?: string;
    formatted_left_to_pay?: string;
    tenant_name?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    tenant?: Tenant & {
        unit?: Unit & {
            property?: Property & {
                city?: City;
            };
        };
    };
}

export interface Application {
    id: number;
    unit_id?: number;
    name: string;
    co_signer?: string | null; // ✅ Now nullable
    status?: string;
    applicant_applied_from?: string | null; // ✅ NEW field
    date?: string;
    date_formatted?: string;
    stage_in_progress?: string;
    notes?: string;

    // ✅ CHANGED: These are now arrays
    attachment_name?: string[];
    attachment_path?: string[];

    // ✅ NEW: Formatted attachments array
    attachments?: Array<{
        index: number;
        name: string;
        path: string;
        url: string;
        download_url: string;
    }>;

    // ✅ DEPRECATED: Remove these single-value fields
    // attachment_url?: string;

    has_attachment?: boolean;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
    created_at_formatted?: string;
    updated_at_formatted?: string;
    unit_name?: string;
    property_name?: string;
    city_name?: string;
    unit?: Unit & {
        property?: Property & {
            city?: City;
        };
    };
}

export interface DashboardState {
    selectedCityId: number | null;
    selectedPropertyId: number | null;
    selectedUnitId: number | null;
    cities: City[];
    properties: Property[];
    units: Unit[];
    unitInfo: Unit | null;
    tenants: Tenant[];
    moveIns: MoveIn[];
    moveOuts: MoveOut[];
    vendorTasks: VendorTask[];
    payments: Payment[];
    paymentPlans: PaymentPlan[];
    applications: Application[];
    offersAndRenewals: OffersAndRenewal[];
    noticesAndEvictions: NoticeAndEviction[];
    loading: {
        properties: boolean;
        units: boolean;
        unitInfo: boolean;
        tenants: boolean;
        moveIns: boolean;
        moveOuts: boolean;
        vendorTasks: boolean;
        payments: boolean;
        paymentPlans: boolean;
        applications: boolean;
        offersAndRenewals: boolean;
        noticesAndEvictions: boolean;
    };
    errors: {
        properties: string | null;
        units: string | null;
        unitInfo: string | null;
        tenants: string | null;
        moveIns: string | null;
        moveOuts: string | null;
        vendorTasks: string | null;
        payments: string | null;
        paymentPlans: string | null;
        applications: string | null;
        offersAndRenewals: string | null;
        noticesAndEvictions: string | null;
    };
}
