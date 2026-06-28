import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Trash2, FileText, Video } from 'lucide-react';
import type { InspectionAttachment } from '@/types/inspection';

export interface KeptAttachment {
    id: number;
    file_name: string;
    url: string;
}

interface Props {
    kept: KeptAttachment[];
    newFiles: File[];
    onRemoveKept: (id: number) => void;
    onAddFiles: (files: File[]) => void;
    onRemoveNew: (index: number) => void;
    accept?: string;
    label?: string;
    icon?: 'paperclip' | 'video';
}

const isImage = (name: string) => /\.(png|jpe?g|gif|webp|bmp|heic)$/i.test(name);

const AttachmentInput: React.FC<Props> = ({ kept, newFiles, onRemoveKept, onAddFiles, onRemoveNew, accept, label, icon = 'paperclip' }) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onAddFiles(Array.from(e.target.files));
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <input ref={inputRef} type="file" accept={accept} multiple onChange={handleChange} className="hidden" />
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
                {icon === 'video' ? <Video className="mr-2 h-4 w-4" /> : <Paperclip className="mr-2 h-4 w-4" />}
                {label ?? 'Add attachments'}
            </Button>

            {(kept.length > 0 || newFiles.length > 0) && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {kept.map((att) => (
                        <div key={`kept-${att.id}`} className="group relative overflow-hidden rounded-md border bg-muted/30">
                            {isImage(att.file_name) ? (
                                <img src={att.url} alt={att.file_name} className="h-24 w-full object-cover" />
                            ) : (
                                <div className="flex h-24 w-full flex-col items-center justify-center p-2 text-center">
                                    <FileText className="h-6 w-6 text-muted-foreground" />
                                    <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{att.file_name}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemoveKept(att.id)}
                                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                title="Remove"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                    {newFiles.map((file, index) => (
                        <div key={`new-${index}`} className="group relative overflow-hidden rounded-md border border-primary/40 bg-primary/5">
                            {isImage(file.name) ? (
                                <img src={URL.createObjectURL(file)} alt={file.name} className="h-24 w-full object-cover" />
                            ) : (
                                <div className="flex h-24 w-full flex-col items-center justify-center p-2 text-center">
                                    <FileText className="h-6 w-6 text-primary" />
                                    <span className="mt-1 line-clamp-2 text-xs">{file.name}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => onRemoveNew(index)}
                                className="absolute right-1 top-1 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                title="Remove"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export type { InspectionAttachment };
export default AttachmentInput;
