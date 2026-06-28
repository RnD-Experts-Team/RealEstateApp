export interface InspectionSettings {
    id: number;
    acknowledgment_text: string | null;
    other_comments_label: string | null;
    require_video: boolean;
    require_signature: boolean;
    require_acknowledgment: boolean;
}

export interface InspectionConfigItem {
    id: number;
    inspection_section_id: number;
    name: string;
    sort_order: number;
}

export interface InspectionConfigSection {
    id: number;
    name: string;
    question: string | null;
    is_repeatable: boolean;
    sort_order: number;
    items: InspectionConfigItem[];
}

export interface InspectionAttachment {
    id: number;
    inspection_form_id: number;
    inspection_form_section_id: number | null;
    inspection_form_section_item_id: number | null;
    kind: 'section' | 'item' | 'general' | 'video';
    file_name: string;
    file_path: string;
    url: string;
}

export interface InspectionFormItem {
    id: number;
    inspection_form_section_id: number;
    name: string;
    note: string | null;
    sort_order: number;
    attachments?: InspectionAttachment[];
}

export interface InspectionFormSection {
    id: number;
    inspection_form_id: number;
    name: string;
    question: string | null;
    is_repeatable: boolean;
    instance_label: string | null;
    has_problems: boolean | null;
    note: string | null;
    sort_order: number;
    items: InspectionFormItem[];
    attachments?: InspectionAttachment[];
}

export interface InspectionForm {
    id: number;
    token: string;
    form_type: 'move_in' | 'move_out';
    reference_id: number;
    tenant_name: string | null;
    property_address: string | null;
    status: 'pending' | 'submitted';
    acknowledged: boolean;
    acknowledgment_text: string | null;
    other_comments: string | null;
    signature_required: boolean;
    signature_path: string | null;
    signature_url: string | null;
    submitted_at: string | null;
    sections?: InspectionFormSection[];
    attachments?: InspectionAttachment[];
}

// Compact summary attached to each Move-In / Move-Out row for the link dialog.
export interface InspectionLink {
    id: number;
    token: string;
    status: 'pending' | 'submitted';
    fill_url: string;
    show_url: string;
    pdf_url: string;
    submitted_at: string | null;
}
