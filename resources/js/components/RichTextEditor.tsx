import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Heading2, Heading3, List, ListOrdered } from 'lucide-react';

interface FieldOption {
    key: string;
    label: string;
}

interface Props {
    value: string;
    onChange: (html: string) => void;
    fields?: FieldOption[];
    placeholder?: string;
}

const RichTextEditor: React.FC<Props> = ({ value, onChange, fields = [] }) => {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value || '',
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none min-h-[140px] rounded-b-md border border-t-0 border-input bg-background px-3 py-2 focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    // Keep the editor in sync if the value is reset externally (e.g. after cancel).
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value || '');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    if (!editor) return null;

    const btn = (active: boolean) =>
        `h-8 w-8 p-0 ${active ? 'bg-primary text-primary-foreground' : ''}`;

    return (
        <div className="rounded-md">
            <div className="flex flex-wrap items-center gap-1 rounded-t-md border border-input bg-muted/40 p-1">
                <Button type="button" variant="ghost" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
                <Button type="button" variant="ghost" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>

                {fields.length > 0 && (
                    <select
                        value=""
                        onChange={(e) => {
                            if (e.target.value) {
                                editor.chain().focus().insertContent(`{{${e.target.value}}}`).run();
                                e.target.value = '';
                            }
                        }}
                        className="ml-auto rounded border border-input bg-background px-2 py-1 text-xs"
                        title="Insert a merge field"
                    >
                        <option value="">Insert field…</option>
                        {fields.map((f) => <option key={f.key} value={f.key}>{f.label} ({`{{${f.key}}}`})</option>)}
                    </select>
                )}
            </div>
            <EditorContent editor={editor} />
        </div>
    );
};

export default RichTextEditor;
