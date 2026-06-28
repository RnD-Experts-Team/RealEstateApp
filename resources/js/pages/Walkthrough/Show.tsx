import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, FileDown, ArrowLeft, Home, User, FileText } from 'lucide-react';
import type { WalkthroughFieldType } from '@/types/walkthrough';

interface Attachment { id: number; file_name: string; url: string }
interface Field {
    type: WalkthroughFieldType | 'repeatable_group';
    title: string;
    is_repeatable: boolean;
    value_bool?: boolean | null;
    value_text?: string;
    value_options?: string[];
    options?: string[];
    attachments?: Attachment[];
    inner_type?: WalkthroughFieldType;
    instances?: Array<{ instance_label: string; value_bool?: boolean | null; value_text?: string; value_options?: string[]; attachments?: Attachment[] }>;
}
interface Data {
    form: {
        token: string;
        form_kind: 'walkthrough' | 'safety_inspection';
        context_type: 'move_out' | 'unit';
        representative_name: string | null;
        property_address: string | null;
        status: 'pending' | 'submitted';
        signature_url: string | null;
        submitted_at: string | null;
    };
    fields: Field[];
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name);

const Attachments: React.FC<{ items?: Attachment[] }> = ({ items }) => {
    if (!items || items.length === 0) return <p className="text-sm italic text-muted-foreground">No files.</p>;
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer">
                    {isImage(a.file_name) ? (
                        <img src={a.url} alt={a.file_name} className="h-24 w-24 rounded-md border object-cover" />
                    ) : (
                        <div className="flex h-24 w-24 flex-col items-center justify-center rounded-md border p-1 text-center">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                            <span className="mt-1 line-clamp-2 text-[10px]">{a.file_name}</span>
                        </div>
                    )}
                </a>
            ))}
        </div>
    );
};

const ValueView: React.FC<{ type: WalkthroughFieldType; field: Pick<Field, 'value_bool' | 'value_text' | 'value_options' | 'attachments'> }> = ({ type, field }) => {
    switch (type) {
        case 'yes_no':
            return field.value_bool === true
                ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Yes</Badge>
                : field.value_bool === false
                    ? <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">No</Badge>
                    : <Badge variant="outline">Not answered</Badge>;
        case 'long_text':
            return field.value_text ? <p className="whitespace-pre-line text-sm">{field.value_text}</p> : <p className="text-sm italic text-muted-foreground">—</p>;
        case 'multi_choice':
            return (field.value_options && field.value_options.length > 0)
                ? <div className="flex flex-wrap gap-1">{field.value_options.map((o) => <Badge key={o} variant="secondary">{o}</Badge>)}</div>
                : <p className="text-sm italic text-muted-foreground">None selected</p>;
        case 'attachments':
            return <Attachments items={field.attachments} />;
    }
};

const Show: React.FC<{ data: Data }> = ({ data }) => {
    const { form } = data;
    const title = form.form_kind === 'walkthrough' ? 'Walkthrough' : 'Safety Inspection';
    const backUrl = form.context_type === 'move_out' ? '/move-out' : '/safety-inspections';

    return (
        <AppLayout>
            <Head title={title} />
            <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.visit(backUrl)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <a href={route('walkthroughs.pdf', form.token)}>
                        <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </a>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl"><ClipboardCheck className="h-7 w-7 text-primary" /> {title}</CardTitle>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2"><Home className="h-4 w-4" /> {form.property_address || '—'}</p>
                            {form.representative_name && <p className="flex items-center gap-2"><User className="h-4 w-4" /> Representative: <span className="font-medium text-foreground">{form.representative_name}</span></p>}
                            <p>
                                {form.status === 'submitted'
                                    ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Submitted{form.submitted_at ? ` on ${form.submitted_at}` : ''}</Badge>
                                    : <Badge variant="secondary">Pending — not yet submitted</Badge>}
                            </p>
                        </div>
                    </CardHeader>
                </Card>

                {data.fields.map((f, fi) => (
                    <Card key={`${f.title}-${fi}`}>
                        <CardHeader className="pb-3"><CardTitle className="text-lg">{f.title}</CardTitle></CardHeader>
                        <CardContent>
                            {f.type !== 'repeatable_group' ? (
                                <ValueView type={f.type} field={f} />
                            ) : (
                                <div className="space-y-3">
                                    {(f.instances ?? []).length === 0 && <p className="text-sm italic text-muted-foreground">None added.</p>}
                                    {(f.instances ?? []).map((inst, ii) => (
                                        <div key={ii} className="rounded-lg border p-3">
                                            <p className="mb-2 text-sm font-semibold">{inst.instance_label}</p>
                                            <ValueView type={f.inner_type as WalkthroughFieldType} field={inst} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {form.signature_url && (
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Signature</CardTitle></CardHeader>
                        <CardContent>
                            <img src={form.signature_url} alt="Signature" className="h-28 w-72 rounded-md border bg-white object-contain" />
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
};

export default Show;
