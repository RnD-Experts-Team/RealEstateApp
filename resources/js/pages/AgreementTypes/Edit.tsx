import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RichTextEditor from '@/components/RichTextEditor';
import { ArrowLeft, Plus, Trash2, Save, Edit as EditIcon, Check, FileSignature, Variable } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { AgreementType, AgreementClause, AgreementClauseOption, AgreementVariable, AgreementInputType, AgreementScope } from '@/types/agreement';

interface Props {
    type: AgreementType;
}

const save = { preserveScroll: true, preserveState: true } as const;
const reload = { preserveScroll: true } as const;

const INPUT_LABELS: Record<AgreementInputType, string> = { text: 'Text', long_text: 'Long text', date: 'Date', number: 'Number' };

// ----- Variables -----
const VariableRow: React.FC<{ v: AgreementVariable; canManage: boolean }> = ({ v, canManage }) => {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ key: v.key, label: v.label, input_type: v.input_type, scope: v.scope, value: v.value ?? '', required: v.required });

    const submit = () => {
        router.put(route('agreement-variables.update', v.id), form, save);
        setEditing(false);
    };

    if (editing) {
        return (
            <div className="space-y-2 rounded-md border p-3">
                <div className="grid grid-cols-2 gap-2">
                    <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label" />
                    <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="key" />
                    <select value={form.input_type} onChange={(e) => setForm({ ...form, input_type: e.target.value as AgreementInputType })} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                        {(Object.keys(INPUT_LABELS) as AgreementInputType[]).map((t) => <option key={t} value={t}>{INPUT_LABELS[t]}</option>)}
                    </select>
                    <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as AgreementScope })} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                        <option value="per_agreement">Per agreement (filled each time)</option>
                        <option value="per_type">Per type (constant)</option>
                    </select>
                </div>
                {form.scope === 'per_type' && <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Constant value" />}
                <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} /> Required</label>
                <div className="flex gap-2">
                    <Button size="sm" onClick={submit}><Check className="mr-1 h-4 w-4" /> Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <div className="text-sm">
                <span className="font-medium">{v.label}</span>
                <code className="ml-2 rounded bg-muted px-1 text-xs">{`{{${v.key}}}`}</code>
                <Badge variant="secondary" className="ml-2 text-[10px]">{INPUT_LABELS[v.input_type]}</Badge>
                <Badge variant="outline" className="ml-1 text-[10px]">{v.scope === 'per_type' ? 'constant' : 'per agreement'}</Badge>
                {v.scope === 'per_type' && v.value && <span className="ml-2 text-xs text-muted-foreground">= {v.value}</span>}
            </div>
            {canManage && (
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><EditIcon className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => router.delete(route('agreement-variables.destroy', v.id), reload)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
            )}
        </div>
    );
};

const AddVariable: React.FC<{ typeId: number }> = ({ typeId }) => {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ key: '', label: '', input_type: 'text' as AgreementInputType, scope: 'per_agreement' as AgreementScope, value: '', required: false });

    const submit = () => {
        if (!form.key.trim() || !form.label.trim()) return;
        router.post(route('agreement-variables.store'), { ...form, agreement_type_id: typeId }, {
            ...reload,
            onSuccess: () => { setForm({ key: '', label: '', input_type: 'text', scope: 'per_agreement', value: '', required: false }); setOpen(false); },
        });
    };

    if (!open) return <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Field</Button>;

    return (
        <div className="space-y-2 rounded-md border border-primary/30 p-3">
            <div className="grid grid-cols-2 gap-2">
                <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Label (e.g. Owner Name)" autoFocus />
                <Input value={form.key} onChange={(e) => setForm({ ...form, key: e.target.value })} placeholder="key (e.g. owner_name)" />
                <select value={form.input_type} onChange={(e) => setForm({ ...form, input_type: e.target.value as AgreementInputType })} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                    {(Object.keys(INPUT_LABELS) as AgreementInputType[]).map((t) => <option key={t} value={t}>{INPUT_LABELS[t]}</option>)}
                </select>
                <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as AgreementScope })} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
                    <option value="per_agreement">Per agreement (filled each time)</option>
                    <option value="per_type">Per type (constant)</option>
                </select>
            </div>
            {form.scope === 'per_type' && <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="Constant value" />}
            <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.required} onChange={(e) => setForm({ ...form, required: e.target.checked })} /> Required</label>
            <div className="flex gap-2">
                <Button size="sm" onClick={submit} disabled={!form.key.trim() || !form.label.trim()}><Plus className="mr-1 h-4 w-4" /> Add</Button>
                <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
        </div>
    );
};

// ----- Options (within an options-clause) -----
const OptionRow: React.FC<{ option: AgreementClauseOption; fields: { key: string; label: string }[]; canManage: boolean }> = ({ option, fields, canManage }) => {
    const [label, setLabel] = useState(option.label);
    const [body, setBody] = useState(option.body ?? '');

    return (
        <div className="space-y-2 rounded-md border-l-4 border-l-primary/40 bg-muted/20 p-3">
            <div className="flex items-center gap-2">
                <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 max-w-xs" placeholder="Option label" />
                {canManage && (
                    <>
                        <Button size="sm" variant="outline" onClick={() => router.put(route('agreement-options.update', option.id), { label, body }, save)}><Save className="mr-1 h-3.5 w-3.5" /> Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => router.delete(route('agreement-options.destroy', option.id), reload)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </>
                )}
            </div>
            <RichTextEditor value={body} onChange={setBody} fields={fields} />
        </div>
    );
};

// ----- Clause -----
const ClauseCard: React.FC<{ clause: AgreementClause; fields: { key: string; label: string }[]; canManage: boolean }> = ({ clause, fields, canManage }) => {
    const [title, setTitle] = useState(clause.title);
    const [kind, setKind] = useState(clause.kind);
    const [body, setBody] = useState(clause.body ?? '');
    const [newOption, setNewOption] = useState('');

    const saveClause = () => router.put(route('agreement-clauses.update', clause.id), { title, kind, body }, save);
    const remove = () => { if (window.confirm(`Remove clause "${clause.title}"?`)) router.delete(route('agreement-clauses.destroy', clause.id), reload); };
    const addOption = () => {
        if (!newOption.trim()) return;
        router.post(route('agreement-options.store'), { agreement_clause_id: clause.id, label: newOption.trim() }, { ...reload, onSuccess: () => setNewOption('') });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center gap-2">
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} className="max-w-sm font-semibold" placeholder="Clause title" />
                    <select value={kind} onChange={(e) => setKind(e.target.value as 'standard' | 'options')} className="rounded-md border border-input bg-background px-2 py-1 text-sm" disabled={!canManage}>
                        <option value="standard">Standard</option>
                        <option value="options">Choose-one options</option>
                    </select>
                    {canManage && (
                        <div className="ml-auto flex gap-1">
                            <Button size="sm" onClick={saveClause}><Save className="mr-1 h-4 w-4" /> Save</Button>
                            <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {kind === 'standard' ? (
                    <RichTextEditor value={body} onChange={setBody} fields={fields} />
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Options (staff pick one per agreement)</p>
                        {clause.options.length === 0 && <p className="text-sm italic text-muted-foreground">No options yet.</p>}
                        {clause.options.map((o) => <OptionRow key={o.id} option={o} fields={fields} canManage={canManage} />)}
                        {canManage && (
                            <div className="flex gap-2">
                                <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} placeholder="New option label (e.g. Month-to-month)" className="h-9" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }} />
                                <Button size="sm" variant="outline" onClick={addOption} disabled={!newOption.trim()}><Plus className="h-4 w-4" /></Button>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">Tip: save the clause as “Choose-one options” first, then add options and write each option's content.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AddClause: React.FC<{ typeId: number }> = ({ typeId }) => {
    const [title, setTitle] = useState('');
    const submit = () => {
        if (!title.trim()) return;
        router.post(route('agreement-clauses.store'), { agreement_type_id: typeId, title: title.trim(), kind: 'standard' }, { ...reload, onSuccess: () => setTitle('') });
    };
    return (
        <div className="flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New clause title (e.g. Term)" onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
            <Button variant="outline" onClick={submit} disabled={!title.trim()}><Plus className="mr-1 h-4 w-4" /> Add Clause</Button>
        </div>
    );
};

const Edit: React.FC<Props> = ({ type }) => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('agreement-types.update');
    const [name, setName] = useState(type.name);
    const fields = (type.variables ?? []).map((v) => ({ key: v.key, label: v.label }));

    return (
        <AppLayout>
            <Head title={`Edit ${type.name}`} />
            <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
                <div className="flex items-center justify-between">
                    <Link href={route('agreement-types.index')}><Button variant="ghost"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button></Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><FileSignature className="h-6 w-6 text-primary" /> Agreement Type</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-end gap-2">
                        <div className="flex-1 space-y-1.5">
                            <Label className="text-xs">Name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} />
                        </div>
                        {canManage && <Button onClick={() => router.put(route('agreement-types.update', type.id), { name }, save)}><Save className="mr-1 h-4 w-4" /> Save</Button>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Variable className="h-5 w-5" /> Merge Fields</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">Insert these into clauses as <code className="rounded bg-muted px-1">{`{{key}}`}</code>. “Per type” fields are constants set here; “per agreement” fields are filled each time an agreement is created.</p>
                        {(type.variables ?? []).map((v) => <VariableRow key={v.id} v={v} canManage={canManage} />)}
                        {canManage && <AddVariable typeId={type.id} />}
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Clauses</h2>
                    {(type.clauses ?? []).map((c) => <ClauseCard key={c.id} clause={c} fields={fields} canManage={canManage} />)}
                    {canManage && <AddClause typeId={type.id} />}
                </div>
            </div>
        </AppLayout>
    );
};

export default Edit;
