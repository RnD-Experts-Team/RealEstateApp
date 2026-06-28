import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileSignature, CheckCircle2 } from 'lucide-react';
import SignaturePad from '../Inspection/fill/SignaturePad';

interface SignData {
    token: string;
    reference: string | null;
    type_name: string | null;
    status: 'draft' | 'sent' | 'signed';
    owner_name: string | null;
    owner_signature_url: string | null;
    owner_signed_at: string | null;
    clauses: { title: string; html: string }[];
}

const Sign: React.FC<{ data: SignData; submit_url: string }> = ({ data, submit_url }) => {
    const page = usePage<{ errors: Record<string, string>; flash?: { success?: string } }>();
    const errors = page.props.errors ?? {};
    const flashSuccess = page.props.flash?.success;

    const [ownerName, setOwnerName] = useState(data.owner_name ?? '');
    const [signature, setSignature] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const alreadySigned = !!data.owner_signature_url;

    const submit = () => {
        router.post(submit_url, { owner_name: ownerName, signature_data: signature }, {
            preserveScroll: true,
            onStart: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <div className="min-h-screen bg-muted/30 py-8">
            <Head title={data.type_name ?? 'Agreement'} />
            <div className="mx-auto max-w-3xl space-y-6 px-4">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><FileSignature className="h-7 w-7 text-primary" /> {data.type_name}</CardTitle>
                        {data.reference && <p className="text-sm text-muted-foreground">{data.reference}</p>}
                        {alreadySigned && <Badge className="mt-2 w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Signed{data.owner_signed_at ? ` on ${data.owner_signed_at}` : ''}</Badge>}
                    </CardHeader>
                </Card>

                {flashSuccess && (
                    <div className="flex items-center gap-2 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="h-5 w-5" /> {flashSuccess}
                    </div>
                )}

                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-5 rounded-md border bg-white p-6 text-sm text-gray-900">
                            {data.clauses.map((c, i) => (
                                <div key={i}>
                                    <h3 className="mb-1 text-base font-semibold">{c.title}</h3>
                                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: c.html || '<p>—</p>' }} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle className="text-lg">Sign</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {alreadySigned ? (
                            <div>
                                <p className="text-sm text-muted-foreground">Signed by {data.owner_name}.</p>
                                <img src={data.owner_signature_url!} alt="Signature" className="mt-2 h-28 w-72 rounded-md border bg-white object-contain" />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Your full name <span className="text-destructive">*</span></Label>
                                    <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Type your full name" />
                                    {errors.owner_name && <p className="text-sm text-destructive">{errors.owner_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-sm">Signature <span className="text-destructive">*</span></Label>
                                    <SignaturePad onChange={setSignature} />
                                    {errors.signature_data && <p className="text-sm text-destructive">{errors.signature_data}</p>}
                                </div>
                                <Button onClick={submit} disabled={submitting || !ownerName.trim() || !signature} size="lg" className="w-full">
                                    {submitting ? 'Submitting…' : 'Sign & Submit'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Sign;
