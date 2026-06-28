export type WalkthroughFieldType = 'attachments' | 'yes_no' | 'multi_choice' | 'long_text';
export type WalkthroughKind = 'walkthrough' | 'safety_inspection';

export interface WalkthroughConfigOption {
    id: number;
    walkthrough_field_id: number;
    label: string;
    sort_order: number;
}

export interface WalkthroughConfigField {
    id: number;
    form_kind: WalkthroughKind;
    title: string;
    type: WalkthroughFieldType;
    is_repeatable: boolean;
    sort_order: number;
    options: WalkthroughConfigOption[];
}

export interface WalkthroughSettings {
    id: number;
    form_kind: WalkthroughKind;
    require_signature: boolean;
}

export interface WalkthroughAttachment {
    id: number;
    walkthrough_form_id: number;
    walkthrough_form_field_id: number | null;
    file_name: string;
    file_path: string;
    url: string;
}

// Normalized field for the fill / show pages.
export interface WalkthroughFieldData {
    type: WalkthroughFieldType | 'repeatable_group';
    title: string;
    is_repeatable: boolean;
    // single-field value holders:
    value_bool?: boolean | null;
    value_text?: string;
    value_options?: string[];
    options?: string[]; // available multi-choice options (snapshot/live)
    attachments?: WalkthroughAttachment[];
    // repeatable:
    inner_type?: WalkthroughFieldType;
    instances?: Array<{
        instance_label: string;
        value_bool?: boolean | null;
        value_text?: string;
        value_options?: string[];
        attachments?: WalkthroughAttachment[];
    }>;
}

export interface WalkthroughForm {
    id: number;
    token: string;
    form_kind: WalkthroughKind;
    context_type: 'move_out' | 'unit';
    reference_id: number;
    representative_name: string | null;
    property_address: string | null;
    status: 'pending' | 'submitted';
    signature_url: string | null;
    submitted_at: string | null;
}

// Compact summary used by the Move-Out dialog and the Safety Inspections list.
export interface WalkthroughLink {
    id: number;
    token: string;
    status: 'pending' | 'submitted';
    representative_name: string | null;
    fill_url: string;
    show_url: string;
    pdf_url: string;
    submitted_at: string | null;
}

export interface Representative {
    id: number;
    name: string;
    deleted_at?: string | null;
}
