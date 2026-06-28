import React, { useMemo, useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SignaturePad from '../Inspection/fill/SignaturePad';
import { ArrowLeft, Save, Copy, Check, Send, FileDown, FileSignature, PenLine } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Agreement, AgreementSnapshotClause, AgreementSnapshotField, AgreementStatus } from '@/types/agreement';

interface Props {
    agreement: Agreement & { clauses: AgreementSnapshotClause[]; fields: AgreementSnapshotField[] };
    rendered: { title: string; html: string }[];
    owner_link: string;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const StatusBadge: React.FC<{ status: AgreementStatus }> = ({ status }) => {
    if (status === 'signed') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Signed</Badge>;
    if (status === 'sent') return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Sent</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
};

const Edit: React.FC<Props> = ({ agreement, owner_link }) => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('agreements.update');
    const locked = !!agreement.owner_signed_at;

    const constants = agreement.fields.filter((f) => f.scope === 'per_type');
    const perAgreement = agreement.fields.filter((f) => f.scope === 'per_agreement');

    const [reference, setReference] = useState(agreement.reference ?? '');
    const [values, setValues] = useState<Record<number, string>>(() => Object.fromEntries(agreement.fields.map((f) => [f.id, f.value ?? ''])));
    const [selections, setSelections] = useState<Record<number, number | null>>(() => Object.fromEntries(agreement.clauses.map((c) => [c.id, c.selected_option])));
    const [copied, setCopied] = useState(false);
    const [agentSig, setAgentSig] = useState<string | null>(null);

    const keyVal = useMemo(() => {
        const map: Record<string, string> = {};
        agreement.fields.forEach((f) => { map[f.key] = values[f.id] ?? f.value ?? ''; });
        return map;
    }, [agreement.fields, values]);

    const renderHtml = (body: string | null) =>
        (body ?? '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, k) => esc(keyVal[k] ?? '').replace(/\n/g, '<br>'));

    const previewClauses = agreement.clauses.map((c) => {
        let body = c.body ?? '';
        if (c.kind === 'options') {
            const idx = selections[c.id];
            body = idx !== null && idx !== undefined && c.options && c.options[idx] ? (c.options[idx].body ?? '') : '';
        }
        return { title: c.title, html: renderHtml(body) };
    });

    const save = () => {
        router.put(route('agreements.update', agreement.token), { reference, fields: values, selections }, { preserveScroll: true, preserveState: true });
    };

    const copyLink = async () => {
        try { await navigator.clipboard.writeText(owner_link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
    };

    const saveAgentSignature = () => {
        if (!agentSig) return;
        router.post(route('agreements.agent-sign', agreement.token), { signature_data: agentSig }, { preserveScroll: true });
    };

    const fieldInput = (f: AgreementSnapshotField) => {
        const common = { value: values[f.id] ?? '', disabled: locked || !canManage, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues({ ...values, [f.id]: e.target.value }) };
        if (f.input_type === 'long_text') return <Textarea {...common} rows={2} />;
        return <Input type={f.input_type === 'date' ? 'date' : f.input_type === 'number' ? 'number' : 'text'} {...common} />;
    };

    return (
        <AppLayout>
            <Head title={`Agreement — ${agreement.reference ?? ''}`} />
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-4 flex items-center justify-between">
                    <Link href={route('agreements.index')}><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
                    <a href={route('agreements.pdf', agreement.token)}><Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download PDF</Button></a>
                </div>

                <div className="mb-6">
                    <h1 className="flex items-center gap-3 text-2xl font-bold"><FileSignature className="h-7 w-7 text-primary" /> {agreement.type_name} <StatusBadge status={agreement.status} /></h1>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Left: fill */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs">Reference / label</Label>
                                    <Input value={reference} onChange={(e) => setReference(e.target.value)} disabled={locked || !canManage} />
                                </div>
                                {perAgreement.map((f) => (
                                    <div key={f.id} className="space-y-1.5">
                                        <Label className="text-xs">{f.label}{f.required && <span className="text-destructive"> *</span>} <code className="ml-1 text-[10px] text-muted-foreground">{`{{${f.key}}}`}</code></Label>
                                        {fieldInput(f)}
                                    </div>
                                ))}
                                {constants.length > 0 && (
                                    <div className="rounded-md border bg-muted/20 p-3">
                                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Constants (from type)</p>
                                        {constants.map((c) => <p key={c.id} className="text-sm"><span className="text-muted-foreground">{c.label}:</span> {c.value}</p>)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {agreement.clauses.some((c) => c.kind === 'options') && (
                            <Card>
                                <CardHeader><CardTitle className="text-lg">Options</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    {agreement.clauses.filter((c) => c.kind === 'options').map((c) => (
                                        <div key={c.id} className="space-y-1.5">
                                            <Label className="text-xs">{c.title}</Label>
                                            <select
                                                value={selections[c.id] ?? ''}
                                                disabled={locked || !canManage}
                                                onChange={(e) => setSelections({ ...selections, [c.id]: e.target.value === '' ? null : Number(e.target.value) })}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            >
                                                <option value="">— choose —</option>
                                                {(c.options ?? []).map((o, i) => <option key={i} value={i}>{o.label}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {canManage && !locked && (
                            <Button onClick={save} size="lg" className="w-full"><Save className="mr-2 h-4 w-4" /> Save Agreement</Button>
                        )}

                        {/* Owner link */}
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Owner Signature</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {agreement.owner_signature_url ? (
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-400">Signed by {agreement.owner_name} on {agreement.owner_signed_at}</p>
                                        <img src={agreement.owner_signature_url} alt="Owner signature" className="mt-2 h-24 w-64 rounded border bg-white object-contain" />
                                    </div>
                                ) : (
                                    <>
                                        <Label className="text-xs">Send this link to the owner to review &amp; sign</Label>
                                        <div className="flex gap-2">
                                            <Input readOnly value={owner_link} className="text-xs" />
                                            <Button variant="outline" size="icon" onClick={copyLink}>{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}</Button>
                                        </div>
                                        {canManage && agreement.status === 'draft' && (
                                            <Button variant="outline" size="sm" onClick={() => router.post(route('agreements.link', agreement.token), {}, { preserveScroll: true })}><Send className="mr-2 h-4 w-4" /> Mark as sent</Button>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Agent signature */}
                        <Card>
                            <CardHeader><CardTitle className="text-lg">Agent Signature</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                {agreement.agent_signature_url ? (
                                    <div>
                                        <p className="text-sm text-green-700 dark:text-green-400">Signed on {agreement.agent_signed_at}</p>
                                        <img src={agreement.agent_signature_url} alt="Agent signature" className="mt-2 h-24 w-64 rounded border bg-white object-contain" />
                                    </div>
                                ) : canManage ? (
                                    <>
                                        <SignaturePad onChange={setAgentSig} />
                                        <Button size="sm" onClick={saveAgentSignature} disabled={!agentSig}><PenLine className="mr-2 h-4 w-4" /> Save agent signature</Button>
                                    </>
                                ) : <p className="text-sm text-muted-foreground">Not yet signed.</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: live preview */}
                    <div>
                        <Card className="lg:sticky lg:top-6">
                            <CardHeader><CardTitle className="text-lg">Preview</CardTitle></CardHeader>
                            <CardContent>
                                <div className="max-h-[70vh] space-y-4 overflow-auto rounded-md border bg-white p-6 text-sm text-gray-900">
                                    {previewClauses.map((c, i) => (
                                        <div key={i}>
                                            <h3 className="mb-1 font-semibold">{c.title}</h3>
                                            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: c.html || '<p class="text-gray-400">—</p>' }} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Edit;
