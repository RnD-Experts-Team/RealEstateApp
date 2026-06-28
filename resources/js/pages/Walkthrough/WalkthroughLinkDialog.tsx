import React, { useMemo, useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Footprints, Copy, Check, ExternalLink, FileDown, Link2, RefreshCw } from 'lucide-react';
import type { WalkthroughLink, Representative } from '@/types/walkthrough';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    moveOutId: number;
    walkthrough: WalkthroughLink | null;
    representatives: Representative[];
}

const WalkthroughLinkDialog: React.FC<Props> = ({ open, onOpenChange, moveOutId, walkthrough, representatives }) => {
    const [copied, setCopied] = useState(false);
    const [busy, setBusy] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [repId, setRepId] = useState<string>('');

    const selectableReps = useMemo(() => representatives.filter((r) => !r.deleted_at), [representatives]);

    const generate = () => {
        setBusy(true);
        router.post(route('walkthroughs.generate'), { move_out_id: moveOutId, representative_id: repId || null }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setBusy(false),
        });
    };

    const generateNew = () => {
        if (!walkthrough) return;
        if (!window.confirm('This will clear the submitted form data and generate a new link. The old link will no longer work. Continue?')) return;
        setResetting(true);
        router.post(route('walkthroughs.reset', walkthrough.token), {}, {
            preserveScroll: true,
            onFinish: () => setResetting(false),
        });
    };

    const copyLink = async () => {
        if (!walkthrough) return;
        try {
            await navigator.clipboard.writeText(walkthrough.fill_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            (document.getElementById('walkthrough-link-input') as HTMLInputElement | null)?.select();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Footprints className="h-5 w-5 text-primary" /> Walkthrough Form
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {walkthrough && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            {walkthrough.status === 'submitted' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Submitted</Badge>
                            ) : (
                                <Badge variant="secondary">Pending</Badge>
                            )}
                            {walkthrough.representative_name && <span className="text-xs text-muted-foreground">· {walkthrough.representative_name}</span>}
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <Label className="text-xs">Representative</Label>
                        <select
                            value={repId}
                            onChange={(e) => setRepId(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        >
                            <option value="">{walkthrough?.representative_name ? `Keep: ${walkthrough.representative_name}` : 'Select representative (optional)'}</option>
                            {selectableReps.map((r) => <option key={r.id} value={String(r.id)}>{r.name}</option>)}
                        </select>
                    </div>

                    <Button onClick={generate} disabled={busy} className="w-full">
                        <Link2 className="mr-2 h-4 w-4" />
                        {busy ? 'Working…' : walkthrough ? 'Update representative' : 'Generate Walkthrough Link'}
                    </Button>

                    {walkthrough && (
                        <>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Shareable link</Label>
                                <div className="flex gap-2">
                                    <Input id="walkthrough-link-input" readOnly value={walkthrough.fill_url} className="text-xs" />
                                    <Button variant="outline" size="icon" onClick={copyLink}>
                                        {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">Send this to the representative. The form is read-only once submitted.</p>
                            </div>

                            {walkthrough.status === 'submitted' && (
                                <>
                                    <div className="flex gap-2 border-t pt-3">
                                        <a href={walkthrough.show_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full"><ExternalLink className="mr-2 h-4 w-4" /> View</Button>
                                        </a>
                                        <a href={walkthrough.pdf_url} className="flex-1">
                                            <Button variant="outline" className="w-full"><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
                                        </a>
                                    </div>
                                    <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950" onClick={generateNew} disabled={resetting}>
                                        <RefreshCw className="mr-2 h-4 w-4" /> {resetting ? 'Resetting…' : 'Generate New Link (clears submission)'}
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default WalkthroughLinkDialog;
