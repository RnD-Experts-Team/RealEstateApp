import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, FileDown, ArrowLeft, Home, FileText } from 'lucide-react';

interface Attachment { id: number; file_name: string; url: string }
interface Item { name: string; note: string; attachments?: Attachment[] }
interface Section {
    type: 'fixed' | 'repeatable';
    name: string;
    question: string | null;
    has_problems?: boolean | null;
    note?: string;
    attachments?: Attachment[];
    items?: Item[];
    instances?: Array<{ instance_label: string; has_problems: boolean | null; note: string; attachments?: Attachment[]; items?: Item[] }>;
}
interface Data {
    form: {
        token: string;
        form_type: 'move_in' | 'move_out';
        tenant_name: string | null;
        property_address: string | null;
        status: 'pending' | 'submitted';
        other_comments: string | null;
        acknowledged: boolean;
        acknowledgment_text?: string | null;
        signature_url: string | null;
        submitted_at: string | null;
    };
    settings: { acknowledgment_text: string | null; other_comments_label: string | null };
    sections: Section[];
    general_attachments: Attachment[];
    video_attachments: Attachment[];
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name);

const Attachments: React.FC<{ items?: Attachment[] }> = ({ items }) => {
    if (!items || items.length === 0) return null;
    return (
        <div className="mt-2 flex flex-wrap gap-2">
            {items.map((a) => (
                <a key={a.id} href={a.url} target="_blank" rel="noopener noreferrer" className="block">
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

const Answer: React.FC<{ value: boolean | null | undefined }> = ({ value }) => {
    if (value === true) return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Yes</Badge>;
    if (value === false) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">No</Badge>;
    return <Badge variant="outline">Not answered</Badge>;
};

const ItemBlock: React.FC<{ item: Item }> = ({ item }) => (
    <div className="ml-3 mt-3 border-l-2 border-primary/30 pl-3">
        <p className="text-sm font-semibold">{item.name}</p>
        {item.note && <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{item.note}</p>}
        <Attachments items={item.attachments} />
    </div>
);

const Show: React.FC<{ data: Data }> = ({ data }) => {
    const { form } = data;
    const title = form.form_type === 'move_in' ? 'Move-In Inspection' : 'Move-Out Inspection';

    return (
        <AppLayout>
            <Head title={title} />
            <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.visit(form.form_type === 'move_in' ? '/move-in' : '/move-out')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <a href={route('inspections.pdf', form.token)}>
                        <Button variant="outline"><FileDown className="mr-2 h-4 w-4" /> Download PDF</Button>
                    </a>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <ClipboardCheck className="h-7 w-7 text-primary" /> {title}
                        </CardTitle>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p className="flex items-center gap-2"><Home className="h-4 w-4" /> {form.property_address || '—'}</p>
                            {form.tenant_name && <p>Tenant: <span className="font-medium text-foreground">{form.tenant_name}</span></p>}
                            <p>
                                {form.status === 'submitted' ? (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                        Submitted{form.submitted_at ? ` on ${form.submitted_at}` : ''}
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Pending — not yet submitted</Badge>
                                )}
                            </p>
                        </div>
                    </CardHeader>
                </Card>

                {data.sections.map((s, si) => (
                    <Card key={`${s.name}-${si}`}>
                        <CardHeader className="pb-3"><CardTitle className="text-lg">{s.name}</CardTitle></CardHeader>
                        <CardContent>
                            {s.type === 'fixed' ? (
                                <>
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-medium">{s.question}</p>
                                        <Answer value={s.has_problems} />
                                    </div>
                                    {s.has_problems === true && (
                                        <>
                                            {s.note && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{s.note}</p>}
                                            <Attachments items={s.attachments} />
                                            {(s.items ?? []).map((it, ii) => <ItemBlock key={ii} item={it} />)}
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-3">
                                    {(s.instances ?? []).length === 0 && <p className="text-sm italic text-muted-foreground">None reported.</p>}
                                    {(s.instances ?? []).map((inst, ri) => (
                                        <div key={ri} className="rounded-lg border p-3">
                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-sm font-semibold">{inst.instance_label}</p>
                                                <Answer value={inst.has_problems} />
                                            </div>
                                            {inst.has_problems === true && (
                                                <>
                                                    {inst.note && <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{inst.note}</p>}
                                                    <Attachments items={inst.attachments} />
                                                    {(inst.items ?? []).map((it, ii) => <ItemBlock key={ii} item={it} />)}
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Card>
                    <CardHeader><CardTitle className="text-lg">Final Details</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {form.other_comments && (
                            <div>
                                <p className="text-sm font-medium">{data.settings.other_comments_label || 'Other comments'}</p>
                                <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{form.other_comments}</p>
                            </div>
                        )}
                        {data.general_attachments.length > 0 && (
                            <div><p className="text-sm font-medium">Other attachments</p><Attachments items={data.general_attachments} /></div>
                        )}
                        {data.video_attachments.length > 0 && (
                            <div>
                                <p className="text-sm font-medium">Walkthrough video</p>
                                {data.video_attachments.map((v) => (
                                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-primary underline">{v.file_name}</a>
                                ))}
                            </div>
                        )}
                        {form.signature_url && (
                            <div>
                                <p className="text-sm font-medium">Signature</p>
                                <img src={form.signature_url} alt="Signature" className="mt-1 h-28 w-72 rounded-md border bg-white object-contain" />
                            </div>
                        )}
                        <div className="rounded-md border bg-muted/30 p-3 text-sm">
                            {form.acknowledged ? '☑' : '☐'} {form.acknowledgment_text || data.settings.acknowledgment_text}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default Show;
