import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Copy, Check, ExternalLink, FileDown, Link2, RefreshCw } from 'lucide-react';
import type { InspectionLink } from '@/types/inspection';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    formType: 'move_in' | 'move_out';
    referenceId: number;
    inspection: InspectionLink | null;
}

const InspectionLinkDialog: React.FC<Props> = ({ open, onOpenChange, formType, referenceId, inspection }) => {
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [resetting, setResetting] = useState(false);

    const generate = () => {
        setGenerating(true);
        router.post(route('inspections.generate'), { form_type: formType, reference_id: referenceId }, {
            preserveScroll: true,
            preserveState: true,
            onFinish: () => setGenerating(false),
        });
    };

    const generateNew = () => {
        if (!inspection) return;
        if (!window.confirm('This will clear the submitted form data and generate a new link. The old link will no longer work. Continue?')) return;
        setResetting(true);
        router.post(route('inspections.reset', inspection.token), {}, {
            preserveScroll: true,
            onFinish: () => setResetting(false),
        });
    };

    const copyLink = async () => {
        if (!inspection) return;
        try {
            await navigator.clipboard.writeText(inspection.fill_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: select the input so the user can copy manually.
            const input = document.getElementById('inspection-link-input') as HTMLInputElement | null;
            input?.select();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        Tenant Inspection Form
                    </DialogTitle>
                </DialogHeader>

                {!inspection ? (
                    <div className="space-y-4 py-2">
                        <p className="text-sm text-muted-foreground">
                            Generate a secure link the tenant can use to fill out the condition inspection form for this {formType === 'move_in' ? 'move-in' : 'move-out'}.
                        </p>
                        <Button onClick={generate} disabled={generating} className="w-full">
                            <Link2 className="mr-2 h-4 w-4" />
                            {generating ? 'Generating…' : 'Generate Inspection Link'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Status:</span>
                            {inspection.status === 'submitted' ? (
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Submitted</Badge>
                            ) : (
                                <Badge variant="secondary">Pending</Badge>
                            )}
                            {inspection.submitted_at && (
                                <span className="text-xs text-muted-foreground">on {inspection.submitted_at}</span>
                            )}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Shareable link</label>
                            <div className="flex gap-2">
                                <Input id="inspection-link-input" readOnly value={inspection.fill_url} className="text-xs" />
                                <Button variant="outline" size="icon" onClick={copyLink}>
                                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Send this to the tenant. The form is read-only once submitted.</p>
                        </div>

                        {inspection.status === 'submitted' && (
                            <>
                                <div className="flex gap-2 border-t pt-3">
                                    <a href={inspection.show_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <ExternalLink className="mr-2 h-4 w-4" /> View Filled Form
                                        </Button>
                                    </a>
                                    <a href={inspection.pdf_url} className="flex-1">
                                        <Button variant="outline" className="w-full">
                                            <FileDown className="mr-2 h-4 w-4" /> Download PDF
                                        </Button>
                                    </a>
                                </div>
                                <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950" onClick={generateNew} disabled={resetting}>
                                    <RefreshCw className="mr-2 h-4 w-4" /> {resetting ? 'Resetting…' : 'Generate New Link (clears submission)'}
                                </Button>
                            </>
                        )}
                    </div>
                )}

                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default InspectionLinkDialog;
