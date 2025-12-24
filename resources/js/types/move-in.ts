export interface MoveIn {
    id: number;
    unit_id: number;
    unit_name: string;
    city_name: string;
    property_name: string;
    tenant_name: string | null;
    last_notice_sent: string | null;  // ISO string date
    signed_lease: 'Yes' | 'No' | null;
    lease_signing_date: string | null;  // ISO string date
    move_in_date: string | null;  // ISO string date
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | null;
    scheduled_paid_time: string | null;  // ISO string date
    handled_keys: 'Yes' | 'No' | null;
    move_in_form_sent_date: string | null;  // ISO string date
    filled_move_in_form: 'Yes' | 'No' | null;
    date_of_move_in_form_filled: string | null;  // ISO string date
    submitted_insurance: 'Yes' | 'No' | null;
    date_of_insurance_expiration: string | null;  // ISO string date
    is_hidden: boolean; // ✅ NEW
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export type MoveInFormData = {
    unit_id: number | '';
    signed_lease: 'Yes' | 'No' | '';
    lease_signing_date: string;
    move_in_date: string;
    paid_security_deposit_first_month_rent: 'Yes' | 'No' | '';
    scheduled_paid_time: string;
    handled_keys: 'Yes' | 'No' | '';
    move_in_form_sent_date: string;
    filled_move_in_form: 'Yes' | 'No' | '';
    date_of_move_in_form_filled: string;
    submitted_insurance: 'Yes' | 'No' | '';
    date_of_insurance_expiration: string;
} & Record<string, any>;

// Additional interface for unit objects used in dropdowns
export interface Unit {
    id: number;
    unit_name: string;
    property_name: string;
    city_name: string;
}
