import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Plus, Trash2, Edit, Check, X, Save, ListChecks } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { WalkthroughConfigField, WalkthroughConfigOption, WalkthroughSettings, WalkthroughKind, WalkthroughFieldType } from '@/types/walkthrough';

interface Props {
    fields: Record<WalkthroughKind, WalkthroughConfigField[]>;
    settings: Record<WalkthroughKind, WalkthroughSettings>;
}

const opts = { preserveScroll: true, preserveState: false } as const;

const TYPE_LABELS: Record<WalkthroughFieldType, string> = {
    attachments: 'Attachments',
    yes_no: 'Yes / No',
    multi_choice: 'Multiple choice',
    long_text: 'Long text',
};

const KIND_LABELS: Record<WalkthroughKind, string> = {
    walkthrough: 'Walkthrough (after move-out)',
    safety_inspection: 'Safety Inspection (per unit)',
};

const OptionRow: React.FC<{ option: WalkthroughConfigOption; canManage: boolean }> = ({ option, canManage }) => {
    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(option.label);

    const save = () => {
        if (!label.trim()) return;
        router.put(route('walkthrough-settings.options.update', option.id), { walkthrough_field_id: option.walkthrough_field_id, label: label.trim() }, opts);
        setEditing(false);
    };

    return (
        <div className="flex items-center gap-2 rounded bg-muted/40 px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            {editing ? (
                <>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-7 flex-1" autoFocus />
                    <Button size="sm" variant="ghost" onClick={save}><Check className="h-3.5 w-3.5 text-green-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setLabel(option.label); }}><X className="h-3.5 w-3.5" /></Button>
                </>
            ) : (
                <>
                    <span className="flex-1 text-sm">{option.label}</span>
                    {canManage && (
                        <>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Edit className="h-3 w-3" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => router.delete(route('walkthrough-settings.options.destroy', option.id), opts)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const FieldCard: React.FC<{ field: WalkthroughConfigField; kind: WalkthroughKind; canManage: boolean }> = ({ field, kind, canManage }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(field.title);
    const [type, setType] = useState<WalkthroughFieldType>(field.type);
    const [repeatable, setRepeatable] = useState(field.is_repeatable);
    const [newOption, setNewOption] = useState('');

    const save = () => {
        if (!title.trim()) return;
        router.put(route('walkthrough-settings.fields.update', field.id), { form_kind: kind, title: title.trim(), type, is_repeatable: repeatable }, opts);
        setEditing(false);
    };

    const remove = () => {
        if (window.confirm(`Remove field "${field.title}"? Already-filled forms keep their copy.`)) {
            router.delete(route('walkthrough-settings.fields.destroy', field.id), opts);
        }
    };

    const addOption = () => {
        if (!newOption.trim()) return;
        router.post(route('walkthrough-settings.options.store'), { walkthrough_field_id: field.id, label: newOption.trim() }, opts);
        setNewOption('');
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                {editing ? (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Title</Label>
                            <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Type</Label>
                            <select value={type} onChange={(e) => setType(e.target.value as WalkthroughFieldType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                {(Object.keys(TYPE_LABELS) as WalkthroughFieldType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                            </select>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={repeatable} onCheckedChange={(v) => setRepeatable(Boolean(v))} />
                            Repeatable (filler adds several labeled entries)
                        </label>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={save}><Save className="mr-1 h-4 w-4" /> Save</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setTitle(field.title); setType(field.type); setRepeatable(field.is_repeatable); }}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                                {field.title}
                                <Badge variant="secondary" className="text-xs">{TYPE_LABELS[field.type]}</Badge>
                                {field.is_repeatable && <Badge variant="outline" className="text-xs">repeatable</Badge>}
                            </CardTitle>
                        </div>
                        {canManage && (
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>

            {field.type === 'multi_choice' && (
                <CardContent className="space-y-2">
                    <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5" /> Options
                    </p>
                    {field.options.length === 0 && <p className="text-sm italic text-muted-foreground">No options yet.</p>}
                    {field.options.map((o) => <OptionRow key={o.id} option={o} canManage={canManage} />)}
                    {canManage && (
                        <div className="flex gap-2 pt-1">
                            <Input value={newOption} onChange={(e) => setNewOption(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(); } }} placeholder="Add an option" className="h-9" />
                            <Button size="sm" variant="outline" onClick={addOption} disabled={!newOption.trim()}><Plus className="h-4 w-4" /></Button>
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
};

const AddFieldForm: React.FC<{ kind: WalkthroughKind }> = ({ kind }) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<WalkthroughFieldType>('attachments');
    const [repeatable, setRepeatable] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [tempOption, setTempOption] = useState('');

    const submit = () => {
        if (!title.trim()) return;
        router.post(route('walkthrough-settings.fields.store'), { form_kind: kind, title: title.trim(), type, is_repeatable: repeatable, options }, {
            ...opts,
            onSuccess: () => { setTitle(''); setType('attachments'); setRepeatable(false); setOptions([]); setOpen(false); },
        });
    };

    if (!open) {
        return <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Field</Button>;
    }

    return (
        <Card className="border-primary/30">
            <CardContent className="space-y-3 pt-6">
                <div className="space-y-1.5">
                    <Label className="text-xs">Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Photos of the kitchen" autoFocus />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <select value={type} onChange={(e) => setType(e.target.value as WalkthroughFieldType)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                        {(Object.keys(TYPE_LABELS) as WalkthroughFieldType[]).map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                    </select>
                </div>
                {type === 'multi_choice' && (
                    <div className="space-y-1.5">
                        <Label className="text-xs">Options</Label>
                        <div className="flex gap-2">
                            <Input value={tempOption} onChange={(e) => setTempOption(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tempOption.trim()) { setOptions([...options, tempOption.trim()]); setTempOption(''); } } }} placeholder="Add an option" className="h-9" />
                            <Button size="sm" variant="outline" type="button" onClick={() => { if (tempOption.trim()) { setOptions([...options, tempOption.trim()]); setTempOption(''); } }}><Plus className="h-4 w-4" /></Button>
                        </div>
                        {options.map((o, i) => (
                            <div key={i} className="flex items-center justify-between rounded bg-muted/40 px-2 py-1 text-sm">
                                {o}
                                <button type="button" onClick={() => setOptions(options.filter((_, k) => k !== i))}><Trash2 className="h-3.5 w-3.5 text-destructive" /></button>
                            </div>
                        ))}
                    </div>
                )}
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={repeatable} onCheckedChange={(v) => setRepeatable(Boolean(v))} />
                    Repeatable (filler adds several labeled entries)
                </label>
                <div className="flex gap-2">
                    <Button size="sm" onClick={submit} disabled={!title.trim()}><Plus className="mr-1 h-4 w-4" /> Add</Button>
                    <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const SettingsPanel: React.FC<{ kind: WalkthroughKind; settings: WalkthroughSettings; canManage: boolean }> = ({ kind, settings, canManage }) => {
    const [requireSignature, setRequireSignature] = useState(settings.require_signature);

    const save = () => {
        router.put(route('walkthrough-settings.update'), { form_kind: kind, require_signature: requireSignature }, opts);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader><CardTitle className="text-base">Requirements</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={requireSignature} onCheckedChange={(v) => setRequireSignature(Boolean(v))} disabled={!canManage} />
                    Require a signature
                </label>
                {canManage && <Button onClick={save} className="w-full"><Save className="mr-2 h-4 w-4" /> Save</Button>}
            </CardContent>
        </Card>
    );
};

const Index: React.FC<Props> = ({ fields, settings }) => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('walkthrough-settings.update');
    const [kind, setKind] = useState<WalkthroughKind>('walkthrough');

    return (
        <AppLayout>
            <Head title="Walkthrough & Safety Settings" />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        Walkthrough &amp; Safety Inspection Settings
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Each form is configured independently. Changes only affect new forms — already-filled forms keep what was submitted.
                    </p>
                </div>

                <div className="mb-6 inline-flex overflow-hidden rounded-md border">
                    {(Object.keys(KIND_LABELS) as WalkthroughKind[]).map((k) => (
                        <button
                            key={k}
                            onClick={() => setKind(k)}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${kind === k ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-muted'}`}
                        >
                            {KIND_LABELS[k]}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8">
                        {fields[kind].map((field) => <FieldCard key={field.id} field={field} kind={kind} canManage={canManage} />)}
                        {canManage && <AddFieldForm key={kind} kind={kind} />}
                    </div>
                    <div className="lg:col-span-4">
                        <SettingsPanel key={kind} kind={kind} settings={settings[kind]} canManage={canManage} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
