import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { FileSignature, Plus, Pencil, FileDown, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { AgreementListRow, AgreementType, AgreementStatus } from '@/types/agreement';

interface Props {
    agreements: AgreementListRow[];
    types: Pick<AgreementType, 'id' | 'name'>[];
}

const StatusBadge: React.FC<{ status: AgreementStatus }> = ({ status }) => {
    if (status === 'signed') return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Signed</Badge>;
    if (status === 'sent') return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Sent</Badge>;
    return <Badge variant="secondary">Draft</Badge>;
};

const Index: React.FC<Props> = ({ agreements, types }) => {
    const { hasPermission } = usePermissions();
    const canCreate = hasPermission('agreements.create');
    const canDelete = hasPermission('agreements.destroy');
    const [open, setOpen] = useState(false);
    const [typeId, setTypeId] = useState('');
    const [reference, setReference] = useState('');
    const [busy, setBusy] = useState(false);

    const create = () => {
        if (!typeId) return;
        setBusy(true);
        router.post(route('agreements.store'), { agreement_type_id: typeId, reference }, { onFinish: () => setBusy(false) });
    };

    const remove = (row: AgreementListRow) => {
        if (window.confirm('Remove this agreement?')) {
            router.delete(route('agreements.destroy', row.token), { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Agreements" />
            <div className="container mx-auto max-w-6xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                            <FileSignature className="h-8 w-8 text-primary" /> Agreements
                        </h1>
                        <p className="mt-2 text-muted-foreground">Create an agreement from a type, fill it in, then send the owner a link to sign.</p>
                    </div>
                    {canCreate && <Button onClick={() => setOpen(true)} size="lg"><Plus className="mr-2 h-4 w-4" /> New Agreement</Button>}
                </div>

                <Card>
                    <CardHeader><CardTitle className="text-lg">All Agreements</CardTitle></CardHeader>
                    <CardContent>
                        {agreements.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">No agreements yet.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Owner signed</TableHead>
                                        <TableHead>Agent signed</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agreements.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell className="font-medium">{row.reference || '—'}</TableCell>
                                            <TableCell>{row.type_name}</TableCell>
                                            <TableCell><StatusBadge status={row.status} /></TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{row.owner_signed_at || '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{row.agent_signed_at || '—'}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{row.created_at}</TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link href={row.edit_url}><Button variant="outline" size="sm"><Pencil className="mr-1 h-4 w-4" /> Open</Button></Link>
                                                    <a href={row.pdf_url}><Button variant="outline" size="sm" title="PDF"><FileDown className="h-4 w-4" /></Button></a>
                                                    {canDelete && <Button variant="outline" size="sm" onClick={() => remove(row)} className="border-destructive/20 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>}
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

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>New Agreement</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Agreement type</Label>
                            <select value={typeId} onChange={(e) => setTypeId(e.target.value)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                                <option value="">Select type</option>
                                {types.map((t) => <option key={t.id} value={String(t.id)}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Reference / label</Label>
                            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 123 Main St — John Owner" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button onClick={create} disabled={!typeId || busy}>{busy ? 'Creating…' : 'Create & open'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default Index;
