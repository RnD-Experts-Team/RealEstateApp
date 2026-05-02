import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { router, useForm } from '@inertiajs/react';
import { Pencil, Plus, RotateCcw, Settings2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { InsuranceRepresentative } from '@/types/property';

interface Props {
    reps: InsuranceRepresentative[];
    canCreate: boolean;
    canEdit: boolean;
    canDestroy: boolean;
    onRepUpdated?: () => void;
}

export default function RepresentativePopover({ reps, canCreate, canEdit, canDestroy, onRepUpdated }: Props) {
    const [editingRepId, setEditingRepId] = useState<number | null>(null);
    const [repToDelete, setRepToDelete] = useState<InsuranceRepresentative | null>(null);

    const createForm = useForm({
        name: '',
    });

    const editForm = useForm({
        name: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();

        createForm.post(route('insurance-representatives.store'), {
            preserveScroll: true,
            onSuccess: () => {
                createForm.reset();
                onRepUpdated?.();
            },
        });
    };

    const handleStartEdit = (rep: InsuranceRepresentative) => {
        setEditingRepId(rep.id);
        editForm.setData('name', rep.name);
    };

    const handleUpdate = (repId: number) => {
        editForm.put(route('insurance-representatives.update', repId), {
            preserveScroll: true,
            onSuccess: () => {
                setEditingRepId(null);
                editForm.reset();
                onRepUpdated?.();
            },
        });
    };

    const confirmDelete = () => {
        if (!repToDelete) return;

        router.delete(route('insurance-representatives.destroy', repToDelete.id), {
            preserveScroll: true,
            onSuccess: () => onRepUpdated?.(),
            onFinish: () => setRepToDelete(null),
        });
    };

    const handleRestore = (repId: number) => {
        router.post(
            route('insurance-representatives.restore', repId),
            {},
            {
                preserveScroll: true,
                onSuccess: () => onRepUpdated?.(),
            },
        );
    };

    return (
        <>
            <div className="flex justify-end">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline">
                            <Settings2 className="mr-2 h-4 w-4" />
                            Insurance Representatives
                        </Button>
                    </PopoverTrigger>

                    <PopoverContent align="end" className="w-[420px] p-4">
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Manage Insurance Representatives</h3>
                                <p className="text-sm text-muted-foreground">Create, edit, delete, and restore representatives.</p>
                            </div>

                            {canCreate && (
                                <form onSubmit={handleCreate} className="flex gap-2">
                                    <Input
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="New representative name"
                                    />
                                    <Button type="submit" disabled={createForm.processing}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add
                                    </Button>
                                </form>
                            )}

                            <div className="max-h-80 space-y-2 overflow-y-auto">
                                {reps.map((rep) => {
                                    const isDeleted = !!rep.deleted_at;
                                    const isEditing = editingRepId === rep.id;

                                    return (
                                        <div key={rep.id} className="flex items-center justify-between rounded-md border border-border p-2">
                                            <div className="min-w-0 flex-1">
                                                {isEditing ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={editForm.data.name}
                                                            onChange={(e) => editForm.setData('name', e.target.value)}
                                                        />
                                                        <Button size="sm" onClick={() => handleUpdate(rep.id)} disabled={editForm.processing}>
                                                            Save
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setEditingRepId(null);
                                                                editForm.reset();
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className={`font-medium ${isDeleted ? 'text-muted-foreground line-through' : ''}`}>
                                                            {rep.name}
                                                        </p>
                                                        {isDeleted && <p className="text-xs text-muted-foreground">Deleted</p>}
                                                    </div>
                                                )}
                                            </div>

                                            {!isEditing && (
                                                <div className="ml-3 flex items-center gap-1">
                                                    {canEdit && !isDeleted && (
                                                        <Button variant="outline" size="sm" onClick={() => handleStartEdit(rep)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {canDestroy && !isDeleted && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => setRepToDelete(rep)}
                                                            className="border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}

                                                    {canDestroy && isDeleted && (
                                                        <Button variant="outline" size="sm" onClick={() => handleRestore(rep.id)}>
                                                            <RotateCcw className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {reps.length === 0 && <p className="text-sm text-muted-foreground">No representatives found.</p>}
                            </div>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>

            <AlertDialog
                open={!!repToDelete}
                onOpenChange={(open) => {
                    if (!open) setRepToDelete(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete representative?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will soft-delete {repToDelete?.name}. Existing insurance records already linked to this representative can still keep that link.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
