import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Home, User, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import AttachmentInput, { KeptAttachment } from '../Inspection/fill/AttachmentInput';
import SignaturePad from '../Inspection/fill/SignaturePad';
import type { WalkthroughFieldType } from '@/types/walkthrough';

interface RawAttachment { id: number; file_name: string; url: string }
interface RawField {
    type: WalkthroughFieldType | 'repeatable_group';
    title: string;
    is_repeatable: boolean;
    value_bool?: boolean | null;
    value_text?: string;
    value_options?: string[];
    options?: string[];
    attachments?: RawAttachment[];
    inner_type?: WalkthroughFieldType;
    instances?: Array<{
        instance_label: string;
        value_bool?: boolean | null;
        value_text?: string;
        value_options?: string[];
        attachments?: RawAttachment[];
    }>;
}
interface FillData {
    form: {
        token: string;
        form_kind: 'walkthrough' | 'safety_inspection';
        representative_name: string | null;
        property_address: string | null;
        status: 'pending' | 'submitted';
        signature_url: string | null;
        submitted_at: string | null;
    };
    settings: { require_signature: boolean };
    fields: RawField[];
    submit_url: string;
}

interface ClientInstance {
    uid: number;
    instance_label: string;
    value_bool: boolean | null;
    value_text: string;
    value_options: string[];
    kept: KeptAttachment[];
    files: File[];
}
interface ClientField {
    type: WalkthroughFieldType | 'repeatable_group';
    title: string;
    is_repeatable: boolean;
    inner_type?: WalkthroughFieldType;
    options: string[];
    value_bool: boolean | null;
    value_text: string;
    value_options: string[];
    kept: KeptAttachment[];
    files: File[];
    instances: ClientInstance[];
}

let uid = 1;
const nextUid = () => uid++;

const normalize = (fields: RawField[]): ClientField[] =>
    fields.map((f) => ({
        type: f.type,
        title: f.title,
        is_repeatable: f.is_repeatable,
        inner_type: f.inner_type,
        options: f.options ?? [],
        value_bool: f.value_bool ?? null,
        value_text: f.value_text ?? '',
        value_options: f.value_options ?? [],
        kept: f.attachments ?? [],
        files: [],
        instances: (f.instances ?? []).map((inst) => ({
            uid: nextUid(),
            instance_label: inst.instance_label,
            value_bool: inst.value_bool ?? null,
            value_text: inst.value_text ?? '',
            value_options: inst.value_options ?? [],
            kept: inst.attachments ?? [],
            files: [],
        })),
    }));

const YesNo: React.FC<{ value: boolean | null; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
    <div className="inline-flex overflow-hidden rounded-md border">
        <button type="button" onClick={() => onChange(true)} className={`px-4 py-1.5 text-sm font-medium ${value === true ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>Yes</button>
        <button type="button" onClick={() => onChange(false)} className={`px-4 py-1.5 text-sm font-medium ${value === false ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}>No</button>
    </div>
);

const MultiChoice: React.FC<{ options: string[]; value: string[]; onChange: (v: string[]) => void }> = ({ options, value, onChange }) => (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {options.map((opt) => {
            const checked = value.includes(opt);
            return (
                <label key={opt} className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2 text-sm">
                    <Checkbox checked={checked} onCheckedChange={(c) => onChange(c ? [...value, opt] : value.filter((o) => o !== opt))} />
                    {opt}
                </label>
            );
        })}
        {options.length === 0 && <p className="text-sm italic text-muted-foreground">No options configured.</p>}
    </div>
);

const Fill: React.FC<{ data: FillData }> = ({ data }) => {
    const page = usePage<{ errors: Record<string, string>; flash?: { success?: string; error?: string } }>();
    const errors = page.props.errors ?? {};
    const flashSuccess = page.props.flash?.success;
    const flashError = page.props.flash?.error;

    const [fields, setFields] = useState<ClientField[]>(() => normalize(data.fields));
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [signatureKept, setSignatureKept] = useState<boolean>(!!data.form.signature_url);
    const [submitting, setSubmitting] = useState(false);

    const submitted = data.form.status === 'submitted';
    const title = data.form.form_kind === 'walkthrough' ? 'Walkthrough Form' : 'Safety Inspection Form';

    const patchField = (fi: number, patch: Partial<ClientField>) =>
        setFields((prev) => prev.map((f, i) => (i === fi ? { ...f, ...patch } : f)));

    const patchInstance = (fi: number, instUid: number, patch: Partial<ClientInstance>) =>
        setFields((prev) =>
            prev.map((f, i) => (i === fi ? { ...f, instances: f.instances.map((inst) => (inst.uid === instUid ? { ...inst, ...patch } : inst)) } : f)));

    const addInstance = (fi: number) =>
        setFields((prev) =>
            prev.map((f, i) => {
                if (i !== fi) return f;
                return {
                    ...f,
                    instances: [...f.instances, { uid: nextUid(), instance_label: `${f.title} ${f.instances.length + 1}`, value_bool: null, value_text: '', value_options: [], kept: [], files: [] }],
                };
            }));

    const removeInstance = (fi: number, instUid: number) =>
        setFields((prev) => prev.map((f, i) => (i === fi ? { ...f, instances: f.instances.filter((inst) => inst.uid !== instUid) } : f)));

    const renderInput = (
        type: WalkthroughFieldType,
        options: string[],
        valueBool: boolean | null,
        valueText: string,
        valueOptions: string[],
        kept: KeptAttachment[],
        files: File[],
        on: (patch: { value_bool?: boolean | null; value_text?: string; value_options?: string[]; kept?: KeptAttachment[]; files?: File[] }) => void,
    ) => {
        switch (type) {
            case 'yes_no':
                return <YesNo value={valueBool} onChange={(v) => on({ value_bool: v })} />;
            case 'long_text':
                return <Textarea value={valueText} onChange={(e) => on({ value_text: e.target.value })} rows={3} placeholder="Type here…" />;
            case 'multi_choice':
                return <MultiChoice options={options} value={valueOptions} onChange={(v) => on({ value_options: v })} />;
            case 'attachments':
                return (
                    <AttachmentInput
                        kept={kept}
                        newFiles={files}
                        onRemoveKept={(id) => on({ kept: kept.filter((a) => a.id !== id) })}
                        onAddFiles={(f) => on({ files: [...files, ...f] })}
                        onRemoveNew={(idx) => on({ files: files.filter((_, k) => k !== idx) })}
                        label="Add files / photos"
                    />
                );
        }
    };

    const submit = () => {
        const filesOut: Record<string, File[]> = {};
        const payloadFields = fields.map((f, fi) => {
            if (f.type === 'repeatable_group') {
                return {
                    type: 'repeatable_group',
                    title: f.title,
                    inner_type: f.inner_type,
                    options: f.options,
                    instances: f.instances.map((inst, ii) => {
                        if (inst.files.length) filesOut[`f${fi}_i${ii}`] = inst.files;
                        return {
                            instance_label: inst.instance_label,
                            value_bool: inst.value_bool,
                            value_text: inst.value_text,
                            value_options: inst.value_options,
                            kept_attachment_ids: inst.kept.map((a) => a.id),
                            new_attachment_slots: inst.files.length ? [`f${fi}_i${ii}`] : [],
                        };
                    }),
                };
            }
            if (f.files.length) filesOut[`f${fi}`] = f.files;
            return {
                type: f.type,
                title: f.title,
                options: f.options,
                value_bool: f.value_bool,
                value_text: f.value_text,
                value_options: f.value_options,
                kept_attachment_ids: f.kept.map((a) => a.id),
                new_attachment_slots: f.files.length ? [`f${fi}`] : [],
            };
        });

        const payload = { signature_data: signatureData, signature_kept: signatureKept && !signatureData, fields: payloadFields };

        router.post(data.submit_url, { payload: JSON.stringify(payload), files: filesOut }, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <Head title={title} />
            <div className="mx-auto max-w-3xl space-y-6 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <ClipboardCheck className="h-7 w-7 text-primary" /> {title}
                        </CardTitle>
                        <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2"><Home className="h-4 w-4" /> {data.form.property_address || '—'}</span>
                            {data.form.representative_name && <span className="flex items-center gap-2"><User className="h-4 w-4" /> Representative: <span className="font-medium text-foreground">{data.form.representative_name}</span></span>}
                        </div>
                        {submitted && (
                            <Badge className="mt-2 w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Submitted{data.form.submitted_at ? ` on ${data.form.submitted_at}` : ''} — read-only
                            </Badge>
                        )}
                    </CardHeader>
                </Card>

                {flashSuccess && (
                    <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="h-5 w-5" /> {flashSuccess}
                    </div>
                )}
                {flashError && (
                    <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-5 w-5" /> {flashError}
                    </div>
                )}

                <div className={submitted ? 'pointer-events-none select-none opacity-70' : ''}>
                {fields.map((f, fi) => (
                    <Card key={`${f.title}-${fi}`}>
                        <CardHeader className="pb-3"><CardTitle className="text-lg">{f.title}</CardTitle></CardHeader>
                        <CardContent>
                            {f.type !== 'repeatable_group' ? (
                                renderInput(f.type, f.options, f.value_bool, f.value_text, f.value_options, f.kept, f.files, (patch) => patchField(fi, patch))
                            ) : (
                                <div className="space-y-4">
                                    {f.instances.length === 0 && <p className="text-sm italic text-muted-foreground">None added yet.</p>}
                                    {f.instances.map((inst) => (
                                        <div key={inst.uid} className="rounded-lg border p-4">
                                            <div className="mb-3 flex items-center justify-between gap-2">
                                                <input value={inst.instance_label} onChange={(e) => patchInstance(fi, inst.uid, { instance_label: e.target.value })} className="rounded border-0 bg-transparent text-base font-semibold focus:outline-none focus:ring-0" />
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeInstance(fi, inst.uid)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                            {renderInput(f.inner_type!, f.options, inst.value_bool, inst.value_text, inst.value_options, inst.kept, inst.files, (patch) => patchInstance(fi, inst.uid, patch))}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="border-dashed" onClick={() => addInstance(fi)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add {f.title}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardContent className="space-y-5 pt-6">
                        {(data.settings.require_signature || data.form.signature_url) && (
                            <div className="space-y-1.5">
                                <Label className="text-sm">Signature{data.settings.require_signature && <span className="text-destructive"> *</span>}</Label>
                                <SignaturePad existingUrl={data.form.signature_url} onChange={(d) => { setSignatureData(d); if (d) setSignatureKept(false); }} />
                                {errors.signature && <p className="text-sm text-destructive">{errors.signature}</p>}
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>{/* end read-only wrapper */}

                {submitted ? (
                    <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        This form has been submitted and is read-only. Contact the property manager if changes are needed.
                    </div>
                ) : (
                    <Button onClick={submit} disabled={submitting} size="lg" className="w-full">
                        {submitting ? 'Submitting…' : 'Submit Form'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Fill;
