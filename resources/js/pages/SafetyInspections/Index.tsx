import React, { useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ShieldCheck, Plus, Copy, Check, ExternalLink, FileDown, Trash2, RefreshCw } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { Representative } from '@/types/walkthrough';

interface InspectionRow {
    id: number;
    token: string;
    status: 'pending' | 'submitted';
    representative_name: string | null;
    fill_url: string;
    show_url: string;
    pdf_url: string;
    submitted_at: string | null;
    unit_id: number;
    unit_name: string | null;
    property_name: string | null;
    city_name: string | null;
    property_address: string | null;
    created_at: string | null;
}

interface PropertyOpt { id: number; property_name: string; city_id: number }
interface UnitOpt { id: number; unit_name: string; property_id: number }

interface Props {
    inspections: InspectionRow[];
    representatives: Representative[];
    cities: Array<{ id: number; city: string }>;
    propertiesByCityId: Record<number, PropertyOpt[]>;
    unitsByPropertyId: Record<number, UnitOpt[]>;
    filterUnitId: number | null;
}

const CreateDialog: React.FC<{
    open: boolean;
    onOpenChange: (o: boolean) => void;
    representatives: Representative[];
    cities: Props['cities'];
    propertiesByCityId: Props['propertiesByCityId'];
    unitsByPropertyId: Props['unitsByPropertyId'];
}> = ({ open, onOpenChange, representatives, cities, propertiesByCityId, unitsByPropertyId }) => {
    const [cityId, setCityId] = useState('');
    const [propertyId, setPropertyId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [repId, setRepId] = useState('');
    const [busy, setBusy] = useState(false);

    const properties = cityId ? propertiesByCityId[Number(cityId)] ?? [] : [];
    const units = propertyId ? unitsByPropertyId[Number(propertyId)] ?? [] : [];
    const selectableReps = useMemo(() => representatives.filter((r) => !r.deleted_at), [representatives]);

    const submit = () => {
        if (!unitId) return;
        setBusy(true);
        router.post(route('safety-inspections.store'), { unit_id: unitId, representative_id: repId || null }, {
            preserveScroll: true,
            onSuccess: () => { setCityId(''); setPropertyId(''); setUnitId(''); setRepId(''); onOpenChange(false); },
            onFinish: () => setBusy(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>New Safety Inspection</DialogTitle></DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs">City</Label>
                        <select value={cityId} onChange={(e) => { setCityId(e.target.value); setPropertyId(''); setUnitId(''); }} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select city</option>
                            {cities.map((c) => <option key={c.id} value={String(c.id)}>{c.city}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Property</Label>
                        <select value={propertyId} onChange={(e) => { setPropertyId(e.target.value); setUnitId(''); }} disabled={!cityId} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50">
                            <option value="">Select property</option>
                            {properties.map((p) => <option key={p.id} value={String(p.id)}>{p.property_name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Unit</Label>
                        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} disabled={!propertyId} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50">
                            <option value="">Select unit</option>
                            {units.map((u) => <option key={u.id} value={String(u.id)}>{u.unit_name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Representative (optional)</Label>
                        <select value={repId} onChange={(e) => setRepId(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                            <option value="">Select representative</option>
                            {selectableReps.map((r) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
                        </select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={!unitId || busy}>{busy ? 'Creating…' : 'Create'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const Index: React.FC<Props> = ({ inspections, representatives, cities, propertiesByCityId, unitsByPropertyId }) => {
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('safety-inspections.create');
    const canDelete = hasPermission('safety-inspections.destroy');
    const [createOpen, setCreateOpen] = useState(false);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const copy = async (row: InspectionRow) => {
        try {
            await navigator.clipboard.writeText(row.fill_url);
            setCopiedId(row.id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch {
            /* noop */
        }
    };

    const remove = (row: InspectionRow) => {
        if (window.confirm('Remove this safety inspection?')) {
            router.delete(route('safety-inspections.destroy', row.token), { preserveScroll: true });
        }
    };

    const resetInspection = (row: InspectionRow) => {
        if (window.confirm('This will clear the submitted data and generate a new link. The old link will no longer work. Continue?')) {
            router.post(route('walkthroughs.reset', row.token), {}, { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Safety Inspections" />
            <div className="container mx-auto max-w-7xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                            <ShieldCheck className="h-8 w-8 text-primary" /> Safety Inspections
                        </h1>
                        <p className="mt-2 text-muted-foreground">Standalone unit safety inspections — create as many as you need per unit.</p>
                    </div>
                    {canCreate && (
                        <Button onClick={() => setCreateOpen(true)} size="lg"><Plus className="mr-2 h-4 w-4" /> New Safety Inspection</Button>
                    )}
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-lg">All Inspections</CardTitle></CardHeader>
                    <CardContent>
                        {inspections.length === 0 ? (
                            <div className="py-12 text-center">
                                <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground/50" />
                                <p className="mt-4 text-muted-foreground">No safety inspections yet.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Unit</TableHead>
                                        <TableHead>Property</TableHead>
                                        <TableHead>City</TableHead>
                                        <TableHead>Representative</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {inspections.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.unit_name ?? '—'}</TableCell>
                                            <TableCell>{row.property_name ?? '—'}</TableCell>
                                            <TableCell>{row.city_name ?? '—'}</TableCell>
                                            <TableCell>{row.representative_name ?? '—'}</TableCell>
                                            <TableCell>
                                                {row.status === 'submitted' ? (
                                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Submitted</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Pending</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{row.created_at?.slice(0, 10)}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="outline" size="sm" onClick={() => copy(row)} title="Copy link">
                                                        {copiedId === row.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                                    </Button>
                                                    {row.status === 'submitted' && (
                                                        <>
                                                            <a href={row.show_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" title="View"><ExternalLink className="h-4 w-4" /></Button></a>
                                                            <a href={row.pdf_url}><Button variant="outline" size="sm" title="PDF"><FileDown className="h-4 w-4" /></Button></a>
                                                            {canCreate && (
                                                                <Button variant="outline" size="sm" onClick={() => resetInspection(row)} className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950" title="Generate new link (clears submission)">
                                                                    <RefreshCw className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </>
                                                    )}
                                                    {canDelete && (
                                                        <Button variant="outline" size="sm" onClick={() => remove(row)} className="border-destructive/20 text-destructive hover:bg-destructive/10" title="Delete">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateDialog
                open={createOpen}
                onOpenChange={setCreateOpen}
                representatives={representatives}
                cities={cities}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
            />
        </AppLayout>
    );
};

export default Index;
