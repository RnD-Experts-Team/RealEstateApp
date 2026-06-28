import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Plus, Trash2, Edit, X, Check, GripVertical, Save } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { InspectionConfigSection, InspectionConfigItem, InspectionSettings } from '@/types/inspection';

interface Props {
    sections: InspectionConfigSection[];
    settings: InspectionSettings;
}

const mutationOpts = { preserveScroll: true, preserveState: false } as const;

const ItemRow: React.FC<{ item: InspectionConfigItem; canManage: boolean }> = ({ item, canManage }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(item.name);

    const save = () => {
        if (!name.trim()) return;
        router.put(route('inspection-settings.items.update', item.id), { name: name.trim() }, mutationOpts);
        setEditing(false);
    };

    const remove = () => {
        if (window.confirm(`Remove sub-item "${item.name}"? Already-filled forms keep their copy.`)) {
            router.delete(route('inspection-settings.items.destroy', item.id), mutationOpts);
        }
    };

    return (
        <div className="flex items-center gap-2 rounded-md bg-muted/40 px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
            {editing ? (
                <>
                    <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 flex-1" autoFocus />
                    <Button size="sm" variant="ghost" onClick={save}><Check className="h-4 w-4 text-green-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => { setEditing(false); setName(item.name); }}><X className="h-4 w-4" /></Button>
                </>
            ) : (
                <>
                    <span className="flex-1 text-sm">{item.name}</span>
                    {canManage && (
                        <>
                            <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button size="sm" variant="ghost" onClick={remove}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

const SectionCard: React.FC<{ section: InspectionConfigSection; canManage: boolean }> = ({ section, canManage }) => {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(section.name);
    const [question, setQuestion] = useState(section.question ?? '');
    const [repeatable, setRepeatable] = useState(section.is_repeatable);
    const [newItem, setNewItem] = useState('');

    const saveSection = () => {
        if (!name.trim()) return;
        router.put(route('inspection-settings.sections.update', section.id), {
            name: name.trim(),
            question: question.trim(),
            is_repeatable: repeatable,
        }, mutationOpts);
        setEditing(false);
    };

    const removeSection = () => {
        if (window.confirm(`Remove section "${section.name}" and its sub-items? Already-filled forms keep their copy.`)) {
            router.delete(route('inspection-settings.sections.destroy', section.id), mutationOpts);
        }
    };

    const addItem = () => {
        if (!newItem.trim()) return;
        router.post(route('inspection-settings.items.store'), {
            inspection_section_id: section.id,
            name: newItem.trim(),
        }, mutationOpts);
        setNewItem('');
    };

    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-3">
                {editing ? (
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Section name</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Question shown to tenant</Label>
                            <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Are there any problems in the ...?" />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <Checkbox checked={repeatable} onCheckedChange={(v) => setRepeatable(Boolean(v))} />
                            Repeatable (tenant can add several, e.g. multiple bedrooms)
                        </label>
                        <div className="flex gap-2">
                            <Button size="sm" onClick={saveSection}><Save className="mr-1 h-4 w-4" /> Save</Button>
                            <Button size="sm" variant="outline" onClick={() => { setEditing(false); setName(section.name); setQuestion(section.question ?? ''); setRepeatable(section.is_repeatable); }}>Cancel</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                            <GripVertical className="mt-1 h-4 w-4 text-muted-foreground" />
                            <div>
                                <CardTitle className="flex items-center gap-2 text-base">
                                    {section.name}
                                    {section.is_repeatable && <Badge variant="secondary" className="text-xs">repeatable</Badge>}
                                </CardTitle>
                                <p className="mt-1 text-sm text-muted-foreground">{section.question}</p>
                            </div>
                        </div>
                        {canManage && (
                            <div className="flex gap-1">
                                <Button size="sm" variant="ghost" onClick={() => setEditing(true)}><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" onClick={removeSection}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Sub-items (shown when tenant answers “Yes”)
                </p>
                {section.items.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">No sub-items — tenant just leaves a note + attachments.</p>
                )}
                {section.items.map((item) => (
                    <ItemRow key={item.id} item={item} canManage={canManage} />
                ))}
                {canManage && (
                    <div className="flex gap-2 pt-1">
                        <Input
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
                            placeholder="Add a sub-item (e.g. Beds, Doors, Windows)"
                            className="h-9"
                        />
                        <Button size="sm" variant="outline" onClick={addItem} disabled={!newItem.trim()}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const AddSectionForm: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState('');
    const [question, setQuestion] = useState('');
    const [repeatable, setRepeatable] = useState(false);

    const submit = () => {
        if (!name.trim()) return;
        router.post(route('inspection-settings.sections.store'), {
            name: name.trim(),
            question: question.trim(),
            is_repeatable: repeatable,
        }, {
            ...mutationOpts,
            onSuccess: () => { setName(''); setQuestion(''); setRepeatable(false); setOpen(false); },
        });
    };

    if (!open) {
        return (
            <Button variant="outline" className="w-full border-dashed" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
        );
    }

    return (
        <Card className="border-primary/30">
            <CardContent className="space-y-3 pt-6">
                <div className="space-y-1.5">
                    <Label className="text-xs">Section name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Balcony" autoFocus />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Question shown to tenant (optional)</Label>
                    <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Defaults to “Are there any problems in the …?”" />
                </div>
                <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={repeatable} onCheckedChange={(v) => setRepeatable(Boolean(v))} />
                    Repeatable (tenant can add several)
                </label>
                <div className="flex gap-2">
                    <Button size="sm" onClick={submit} disabled={!name.trim()}><Plus className="mr-1 h-4 w-4" /> Add</Button>
                    <Button size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const SettingsPanel: React.FC<{ settings: InspectionSettings; canManage: boolean }> = ({ settings, canManage }) => {
    const [ack, setAck] = useState(settings.acknowledgment_text ?? '');
    const [label, setLabel] = useState(settings.other_comments_label ?? '');
    const [requireVideo, setRequireVideo] = useState(settings.require_video);
    const [requireSignature, setRequireSignature] = useState(settings.require_signature);
    const [requireAck, setRequireAck] = useState(settings.require_acknowledgment);

    const save = () => {
        router.put(route('inspection-settings.update'), {
            acknowledgment_text: ack,
            other_comments_label: label,
            require_video: requireVideo,
            require_signature: requireSignature,
            require_acknowledgment: requireAck,
        }, mutationOpts);
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base">Closing &amp; Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-1.5">
                    <Label className="text-xs">“Other comments” label</Label>
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} disabled={!canManage} />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Acknowledgment text</Label>
                    <Textarea value={ack} onChange={(e) => setAck(e.target.value)} rows={4} disabled={!canManage} />
                </div>
                <div className="space-y-2 rounded-md border p-3">
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={requireAck} onCheckedChange={(v) => setRequireAck(Boolean(v))} disabled={!canManage} />
                        Require the acknowledgment checkbox
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={requireVideo} onCheckedChange={(v) => setRequireVideo(Boolean(v))} disabled={!canManage} />
                        Require a walkthrough video
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                        <Checkbox checked={requireSignature} onCheckedChange={(v) => setRequireSignature(Boolean(v))} disabled={!canManage} />
                        Require a signature
                    </label>
                </div>
                {canManage && (
                    <Button onClick={save} className="w-full"><Save className="mr-2 h-4 w-4" /> Save Settings</Button>
                )}
            </CardContent>
        </Card>
    );
};

const Index: React.FC<Props> = ({ sections, settings }) => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('inspection-settings.update');

    return (
        <AppLayout>
            <Head title="Inspection Form Settings" />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-8">
                    <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                        <ClipboardList className="h-8 w-8 text-primary" />
                        Inspection Form Settings
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        This single template is used for both Move-In and Move-Out tenant forms. Changes only affect new forms — already-filled forms keep what the tenant submitted.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8">
                        {sections.map((section) => (
                            <SectionCard key={section.id} section={section} canManage={canManage} />
                        ))}
                        {canManage && <AddSectionForm />}
                    </div>
                    <div className="lg:col-span-4">
                        <SettingsPanel settings={settings} canManage={canManage} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default Index;
