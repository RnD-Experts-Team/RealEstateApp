import React, { useMemo, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Home, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import AttachmentInput, { KeptAttachment } from './fill/AttachmentInput';
import SignaturePad from './fill/SignaturePad';

interface RawAttachment { id: number; file_name: string; url: string }
interface RawItem { name: string; note: string; attachments?: RawAttachment[] }
interface RawSection {
    type: 'fixed' | 'repeatable';
    name: string;
    question: string | null;
    has_problems?: boolean | null;
    note?: string;
    attachments?: RawAttachment[];
    items?: RawItem[];
    item_template?: { name: string }[];
    instances?: Array<{
        instance_label: string;
        has_problems: boolean | null;
        note: string;
        attachments?: RawAttachment[];
        items?: RawItem[];
    }>;
}

interface FillData {
    form: {
        token: string;
        form_type: 'move_in' | 'move_out';
        tenant_name: string | null;
        property_address: string | null;
        status: 'pending' | 'submitted';
        other_comments: string | null;
        acknowledged: boolean;
        signature_url: string | null;
        submitted_at: string | null;
    };
    settings: {
        acknowledgment_text: string | null;
        other_comments_label: string | null;
        require_video: boolean;
        require_signature: boolean;
        require_acknowledgment: boolean;
    };
    sections: RawSection[];
    general_attachments: RawAttachment[];
    video_attachments: RawAttachment[];
    submit_url: string;
}

// ---- Client-side editable model -------------------------------------------------

interface ClientItem { name: string; note: string; kept: KeptAttachment[]; files: File[] }
interface ClientInstance {
    uid: number;
    instance_label: string;
    has_problems: boolean | null;
    note: string;
    kept: KeptAttachment[];
    files: File[];
    items: ClientItem[];
}
interface ClientFixed {
    type: 'fixed';
    name: string;
    question: string | null;
    has_problems: boolean | null;
    note: string;
    kept: KeptAttachment[];
    files: File[];
    items: ClientItem[];
}
interface ClientRepeatable {
    type: 'repeatable';
    name: string;
    question: string | null;
    item_template: { name: string }[];
    instances: ClientInstance[];
}
type ClientSection = ClientFixed | ClientRepeatable;

let uidCounter = 1;
const nextUid = () => uidCounter++;

const toItem = (i: RawItem): ClientItem => ({
    name: i.name,
    note: i.note ?? '',
    kept: i.attachments ?? [],
    files: [],
});

const normalize = (sections: RawSection[]): ClientSection[] =>
    sections.map((s) => {
        if (s.type === 'repeatable') {
            return {
                type: 'repeatable',
                name: s.name,
                question: s.question,
                item_template: s.item_template ?? [],
                instances: (s.instances ?? []).map((inst) => ({
                    uid: nextUid(),
                    instance_label: inst.instance_label,
                    has_problems: inst.has_problems ?? null,
                    note: inst.note ?? '',
                    kept: inst.attachments ?? [],
                    files: [],
                    items: (inst.items ?? []).map(toItem),
                })),
            };
        }
        return {
            type: 'fixed',
            name: s.name,
            question: s.question,
            has_problems: s.has_problems ?? null,
            note: s.note ?? '',
            kept: s.attachments ?? [],
            files: [],
            items: (s.items ?? []).map(toItem),
        };
    });

const YesNo: React.FC<{ value: boolean | null; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
    <div className="inline-flex overflow-hidden rounded-md border">
        <button
            type="button"
            onClick={() => onChange(false)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${value === false ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
        >
            No
        </button>
        <button
            type="button"
            onClick={() => onChange(true)}
            className={`px-4 py-1.5 text-sm font-medium transition-colors ${value === true ? 'bg-destructive text-white' : 'bg-background hover:bg-muted'}`}
        >
            Yes
        </button>
    </div>
);

const Fill: React.FC<{ data: FillData }> = ({ data }) => {
    const page = usePage<{ errors: Record<string, string>; flash?: { success?: string; error?: string } }>();
    const errors = page.props.errors ?? {};
    const flashSuccess = page.props.flash?.success;
    const flashError = page.props.flash?.error;

    const [sections, setSections] = useState<ClientSection[]>(() => normalize(data.sections));
    const [otherComments, setOtherComments] = useState(data.form.other_comments ?? '');
    const [acknowledged, setAcknowledged] = useState(data.form.acknowledged);
    const [generalKept, setGeneralKept] = useState<KeptAttachment[]>(data.general_attachments);
    const [generalFiles, setGeneralFiles] = useState<File[]>([]);
    const [videoKept, setVideoKept] = useState<KeptAttachment[]>(data.video_attachments);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [signatureKept, setSignatureKept] = useState<boolean>(!!data.form.signature_url);
    const [submitting, setSubmitting] = useState(false);

    const submitted = data.form.status === 'submitted';
    const isMoveIn = data.form.form_type === 'move_in';
    const title = isMoveIn ? 'Move-In Inspection Form' : 'Move-Out Inspection Form';

    // ---- immutable updaters ----
    const patchSection = (si: number, patch: Partial<ClientFixed>) =>
        setSections((prev) => prev.map((s, i) => (i === si ? { ...s, ...patch } as ClientSection : s)));

    const patchItem = (si: number, ii: number, patch: Partial<ClientItem>) =>
        setSections((prev) =>
            prev.map((s, i) => {
                if (i !== si || s.type !== 'fixed') return s;
                return { ...s, items: s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) };
            }),
        );

    const patchInstance = (si: number, uid: number, patch: Partial<ClientInstance>) =>
        setSections((prev) =>
            prev.map((s, i) => {
                if (i !== si || s.type !== 'repeatable') return s;
                return { ...s, instances: s.instances.map((inst) => (inst.uid === uid ? { ...inst, ...patch } : inst)) };
            }),
        );

    const patchInstanceItem = (si: number, uid: number, ii: number, patch: Partial<ClientItem>) =>
        setSections((prev) =>
            prev.map((s, i) => {
                if (i !== si || s.type !== 'repeatable') return s;
                return {
                    ...s,
                    instances: s.instances.map((inst) =>
                        inst.uid === uid ? { ...inst, items: inst.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : inst,
                    ),
                };
            }),
        );

    const addInstance = (si: number) =>
        setSections((prev) =>
            prev.map((s, i) => {
                if (i !== si || s.type !== 'repeatable') return s;
                const label = `${s.name} ${s.instances.length + 1}`;
                return {
                    ...s,
                    instances: [
                        ...s.instances,
                        {
                            uid: nextUid(),
                            instance_label: label,
                            has_problems: null,
                            note: '',
                            kept: [],
                            files: [],
                            items: s.item_template.map((t) => ({ name: t.name, note: '', kept: [], files: [] })),
                        },
                    ],
                };
            }),
        );

    const removeInstance = (si: number, uid: number) =>
        setSections((prev) =>
            prev.map((s, i) => {
                if (i !== si || s.type !== 'repeatable') return s;
                return { ...s, instances: s.instances.filter((inst) => inst.uid !== uid) };
            }),
        );

    const buildPayload = useMemo(
        () => () => {
            const files: Record<string, File[]> = {};

            const itemPayload = (it: ClientItem, slot: string) => {
                if (it.files.length) files[slot] = it.files;
                return {
                    name: it.name,
                    note: it.note,
                    kept_attachment_ids: it.kept.map((a) => a.id),
                    new_attachment_slots: it.files.length ? [slot] : [],
                };
            };

            const payloadSections = sections.map((s, si) => {
                if (s.type === 'fixed') {
                    if (s.files.length) files[`s${si}`] = s.files;
                    return {
                        type: 'fixed',
                        name: s.name,
                        question: s.question,
                        has_problems: s.has_problems,
                        note: s.note,
                        kept_attachment_ids: s.kept.map((a) => a.id),
                        new_attachment_slots: s.files.length ? [`s${si}`] : [],
                        items: s.items.map((it, ii) => itemPayload(it, `s${si}_it${ii}`)),
                    };
                }
                return {
                    type: 'repeatable',
                    name: s.name,
                    question: s.question,
                    item_template: s.item_template,
                    instances: s.instances.map((inst, ri) => {
                        if (inst.files.length) files[`s${si}_i${ri}`] = inst.files;
                        return {
                            instance_label: inst.instance_label,
                            has_problems: inst.has_problems,
                            note: inst.note,
                            kept_attachment_ids: inst.kept.map((a) => a.id),
                            new_attachment_slots: inst.files.length ? [`s${si}_i${ri}`] : [],
                            items: inst.items.map((it, ii) => itemPayload(it, `s${si}_i${ri}_it${ii}`)),
                        };
                    }),
                };
            });

            if (generalFiles.length) files['general'] = generalFiles;
            if (videoFiles.length) files['video'] = videoFiles;

            const payload = {
                other_comments: otherComments,
                acknowledged,
                signature_data: signatureData,
                signature_kept: signatureKept && !signatureData,
                sections: payloadSections,
                general_kept_attachment_ids: generalKept.map((a) => a.id),
                general_new_attachment_slots: generalFiles.length ? ['general'] : [],
                video_kept_attachment_ids: videoKept.map((a) => a.id),
                video_new_attachment_slots: videoFiles.length ? ['video'] : [],
            };

            return { payload, files };
        },
        [sections, otherComments, acknowledged, signatureData, signatureKept, generalKept, generalFiles, videoKept, videoFiles],
    );

    const submit = () => {
        const { payload, files } = buildPayload();
        router.post(
            data.submit_url,
            { payload: JSON.stringify(payload), files },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setSubmitting(true),
                onFinish: () => setSubmitting(false),
            },
        );
    };

    const renderItems = (
        items: ClientItem[],
        update: (ii: number, patch: Partial<ClientItem>) => void,
        keyPrefix: string,
    ) => (
        <div className="space-y-4">
            {items.map((it, ii) => (
                <div key={`${keyPrefix}-${ii}`} className="rounded-md border-l-4 border-l-primary/40 bg-muted/20 p-3">
                    <p className="mb-2 text-sm font-semibold">{it.name}</p>
                    <Textarea
                        value={it.note}
                        onChange={(e) => update(ii, { note: e.target.value })}
                        placeholder={`Describe the issue with ${it.name.toLowerCase()}…`}
                        rows={2}
                        className="mb-2"
                    />
                    <AttachmentInput
                        kept={it.kept}
                        newFiles={it.files}
                        onRemoveKept={(id) => update(ii, { kept: it.kept.filter((a) => a.id !== id) })}
                        onAddFiles={(f) => update(ii, { files: [...it.files, ...f] })}
                        onRemoveNew={(idx) => update(ii, { files: it.files.filter((_, k) => k !== idx) })}
                        label="Add photos / files"
                    />
                </div>
            ))}
        </div>
    );

    const renderProblemBody = (
        note: string,
        onNote: (v: string) => void,
        kept: KeptAttachment[],
        files: File[],
        onKept: (k: KeptAttachment[]) => void,
        onFiles: (f: File[]) => void,
        items: React.ReactNode,
    ) => (
        <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
                <Label className="text-xs">Comments / notes</Label>
                <Textarea value={note} onChange={(e) => onNote(e.target.value)} rows={3} placeholder="Describe the problem in detail…" />
            </div>
            <div className="space-y-1.5">
                <Label className="text-xs">Attachments</Label>
                <AttachmentInput
                    kept={kept}
                    newFiles={files}
                    onRemoveKept={(id) => onKept(kept.filter((a) => a.id !== id))}
                    onAddFiles={(f) => onFiles([...files, ...f])}
                    onRemoveNew={(idx) => onFiles(files.filter((_, k) => k !== idx))}
                    label="Add photos / files"
                />
            </div>
            {items}
        </div>
    );

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <Head title={title} />
            <div className="mx-auto max-w-3xl space-y-6 px-4">
                {/* Header */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <ClipboardCheck className="h-7 w-7 text-primary" />
                            {title}
                        </CardTitle>
                        <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-2"><Home className="h-4 w-4" /> {data.form.property_address || '—'}</span>
                            {data.form.tenant_name && <span>Tenant: <span className="font-medium text-foreground">{data.form.tenant_name}</span></span>}
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

                {/* Sections — pointer-events-none when submitted so the form is read-only */}
                <div className={submitted ? 'pointer-events-none select-none opacity-70' : ''}>
                {sections.map((s, si) => (
                    <Card key={`${s.name}-${si}`}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{s.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {s.type === 'fixed' ? (
                                <>
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm font-medium">{s.question}</p>
                                        <YesNo value={s.has_problems} onChange={(v) => patchSection(si, { has_problems: v })} />
                                    </div>
                                    {s.has_problems === true &&
                                        renderProblemBody(
                                            s.note,
                                            (v) => patchSection(si, { note: v }),
                                            s.kept,
                                            s.files,
                                            (k) => patchSection(si, { kept: k }),
                                            (f) => patchSection(si, { files: f }),
                                            s.items.length > 0 ? renderItems(s.items, (ii, patch) => patchItem(si, ii, patch), `s${si}`) : null,
                                        )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {s.instances.length === 0 && (
                                        <p className="text-sm text-muted-foreground italic">None added yet.</p>
                                    )}
                                    {s.instances.map((inst) => (
                                        <div key={inst.uid} className="rounded-lg border p-4">
                                            <div className="mb-2 flex items-center justify-between">
                                                <input
                                                    value={inst.instance_label}
                                                    onChange={(e) => patchInstance(si, inst.uid, { instance_label: e.target.value })}
                                                    className="rounded border-0 bg-transparent text-base font-semibold focus:outline-none focus:ring-0"
                                                />
                                                <Button type="button" variant="ghost" size="sm" onClick={() => removeInstance(si, inst.uid)}>
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-sm font-medium">{s.question}</p>
                                                <YesNo value={inst.has_problems} onChange={(v) => patchInstance(si, inst.uid, { has_problems: v })} />
                                            </div>
                                            {inst.has_problems === true &&
                                                renderProblemBody(
                                                    inst.note,
                                                    (v) => patchInstance(si, inst.uid, { note: v }),
                                                    inst.kept,
                                                    inst.files,
                                                    (k) => patchInstance(si, inst.uid, { kept: k }),
                                                    (f) => patchInstance(si, inst.uid, { files: f }),
                                                    inst.items.length > 0
                                                        ? renderItems(inst.items, (ii, patch) => patchInstanceItem(si, inst.uid, ii, patch), `s${si}-${inst.uid}`)
                                                        : null,
                                                )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" className="border-dashed" onClick={() => addInstance(si)}>
                                        <Plus className="mr-2 h-4 w-4" /> Add {s.name}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {/* Closing */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Final Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-sm">{data.settings.other_comments_label || 'Any other comments?'}</Label>
                            <Textarea value={otherComments} onChange={(e) => setOtherComments(e.target.value)} rows={3} />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm">Any other attachments?</Label>
                            <AttachmentInput
                                kept={generalKept}
                                newFiles={generalFiles}
                                onRemoveKept={(id) => setGeneralKept(generalKept.filter((a) => a.id !== id))}
                                onAddFiles={(f) => setGeneralFiles([...generalFiles, ...f])}
                                onRemoveNew={(idx) => setGeneralFiles(generalFiles.filter((_, k) => k !== idx))}
                                label="Add attachments"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-sm">
                                Please take a video of the home{data.settings.require_video && <span className="text-destructive"> *</span>}
                            </Label>
                            <AttachmentInput
                                kept={videoKept}
                                newFiles={videoFiles}
                                onRemoveKept={(id) => setVideoKept(videoKept.filter((a) => a.id !== id))}
                                onAddFiles={(f) => setVideoFiles([...videoFiles, ...f])}
                                onRemoveNew={(idx) => setVideoFiles(videoFiles.filter((_, k) => k !== idx))}
                                accept="video/*"
                                icon="video"
                                label="Add video"
                            />
                            {errors.video && <p className="text-sm text-destructive">{errors.video}</p>}
                        </div>

                        {(data.settings.require_signature || data.form.signature_url) && (
                            <div className="space-y-1.5">
                                <Label className="text-sm">
                                    Signature{data.settings.require_signature && <span className="text-destructive"> *</span>}
                                </Label>
                                <SignaturePad existingUrl={data.form.signature_url} onChange={(d) => { setSignatureData(d); if (d) setSignatureKept(false); }} />
                                {errors.signature && <p className="text-sm text-destructive">{errors.signature}</p>}
                            </div>
                        )}

                        <label className="flex items-start gap-3 rounded-md border bg-muted/30 p-3 text-sm">
                            <Checkbox checked={acknowledged} onCheckedChange={(v) => setAcknowledged(Boolean(v))} className="mt-0.5" />
                            <span>{data.settings.acknowledgment_text}</span>
                        </label>
                        {errors.acknowledged && (
                            <p className="flex items-center gap-1 text-sm text-destructive"><AlertCircle className="h-4 w-4" /> {errors.acknowledged}</p>
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
                        {submitting ? 'Submitting…' : 'Submit Inspection Form'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default Fill;
