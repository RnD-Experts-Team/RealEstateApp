import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileSignature, Plus, Pencil, Trash2, X } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import type { AgreementType } from '@/types/agreement';

interface Props {
    types: AgreementType[];
}

const Index: React.FC<Props> = ({ types }) => {
    const { hasPermission } = usePermissions();
    const canManage = hasPermission('agreement-types.update');
    const [adding, setAdding] = useState(false);
    const [name, setName] = useState('');

    const create = () => {
        if (!name.trim()) return;
        router.post(route('agreement-types.store'), { name: name.trim() }, { onSuccess: () => { setName(''); setAdding(false); } });
    };

    const remove = (type: AgreementType) => {
        if (window.confirm(`Remove agreement type "${type.name}"? Existing agreements created from it are kept.`)) {
            router.delete(route('agreement-types.destroy', type.id), { preserveScroll: true });
        }
    };

    return (
        <AppLayout>
            <Head title="Agreement Types" />
            <div className="container mx-auto max-w-5xl px-4 py-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground">
                            <FileSignature className="h-8 w-8 text-primary" /> Agreement Types
                        </h1>
                        <p className="mt-2 text-muted-foreground">Each type is a different lease/agreement template. Editing a type never changes agreements already created from it.</p>
                    </div>
                    {canManage && !adding && (
                        <Button onClick={() => setAdding(true)} size="lg"><Plus className="mr-2 h-4 w-4" /> New Type</Button>
                    )}
                </div>

                {adding && (
                    <Card className="mb-6 border-primary/30">
                        <CardContent className="flex items-end gap-2 pt-6">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-xs font-medium">Type name</label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ohio Property Management Agreement" autoFocus onKeyDown={(e) => { if (e.key === 'Enter') create(); }} />
                            </div>
                            <Button onClick={create} disabled={!name.trim()}><Plus className="mr-1 h-4 w-4" /> Create</Button>
                            <Button variant="ghost" onClick={() => setAdding(false)}><X className="h-4 w-4" /></Button>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader><CardTitle className="text-lg">All Types</CardTitle></CardHeader>
                    <CardContent>
                        {types.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">No agreement types yet.</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Clauses</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {types.map((type) => (
                                        <TableRow key={type.id}>
                                            <TableCell className="font-medium">{type.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{type.clauses_count ?? 0}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Link href={route('agreement-types.edit', type.id)}>
                                                        <Button variant="outline" size="sm"><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
                                                    </Link>
                                                    {canManage && (
                                                        <Button variant="outline" size="sm" onClick={() => remove(type)} className="border-destructive/20 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></Button>
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
        </AppLayout>
    );
};

export default Index;
