export type AgreementInputType = 'text' | 'long_text' | 'date' | 'number';
export type AgreementScope = 'per_type' | 'per_agreement';
export type AgreementStatus = 'draft' | 'sent' | 'signed';

export interface AgreementVariable {
    id: number;
    agreement_type_id: number;
    key: string;
    label: string;
    input_type: AgreementInputType;
    scope: AgreementScope;
    value: string | null;
    required: boolean;
    sort_order: number;
}

export interface AgreementClauseOption {
    id: number;
    agreement_clause_id: number;
    label: string;
    body: string | null;
    sort_order: number;
}

export interface AgreementClause {
    id: number;
    agreement_type_id: number;
    title: string;
    body: string | null;
    kind: 'standard' | 'options';
    sort_order: number;
    options: AgreementClauseOption[];
}

export interface AgreementType {
    id: number;
    name: string;
    clauses_count?: number;
    clauses?: AgreementClause[];
    variables?: AgreementVariable[];
}

// Instance (snapshot) shapes
export interface AgreementSnapshotClause {
    id: number;
    title: string;
    body: string | null;
    kind: 'standard' | 'options';
    options: Array<{ label: string; body: string | null }> | null;
    selected_option: number | null;
    sort_order: number;
}

export interface AgreementSnapshotField {
    id: number;
    key: string;
    label: string;
    input_type: AgreementInputType;
    scope: AgreementScope;
    value: string | null;
    required: boolean;
    sort_order: number;
}

export interface Agreement {
    id: number;
    token: string;
    reference: string | null;
    type_name: string | null;
    status: AgreementStatus;
    owner_name: string | null;
    owner_signature_url: string | null;
    owner_signed_at: string | null;
    agent_signature_url: string | null;
    agent_signed_at: string | null;
    clauses?: AgreementSnapshotClause[];
    fields?: AgreementSnapshotField[];
}

export interface AgreementListRow {
    id: number;
    token: string;
    reference: string | null;
    type_name: string | null;
    status: AgreementStatus;
    owner_signed_at: string | null;
    agent_signed_at: string | null;
    created_at: string | null;
    sign_url: string;
    edit_url: string;
    pdf_url: string;
}

export interface RenderedClause {
    title: string;
    html: string;
}
