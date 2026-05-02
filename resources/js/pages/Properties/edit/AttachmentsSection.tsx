import { useState, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { PropertyInsuranceAttachment } from '@/types/property';

interface AttachmentsSectionProps {
    existingAttachments: PropertyInsuranceAttachment[];
    newFiles: File[];
    onNewFiles: (files: File[]) => void;
    onDeleteExisting: (id: number) => void;
    deletedAttachmentIds?: number[];
}

export default function AttachmentsSection({
    existingAttachments,
    newFiles,
    onNewFiles,
    onDeleteExisting,
    deletedAttachmentIds = [],
}: AttachmentsSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<{ file: File; preview: string | null }[]>([]);

    const isImage = (file: File) => file.type.startsWith('image/');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const updatedFiles = [...newFiles, ...selectedFiles];
        onNewFiles(updatedFiles);

        const newPreviews = selectedFiles.map(file => ({
            file,
            preview: isImage(file) ? URL.createObjectURL(file) : null,
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeNewFile = (index: number) => {
        const newFiles_ = newFiles.filter((_, i) => i !== index);
        onNewFiles(newFiles_);

        if (previews[index].preview) {
            URL.revokeObjectURL(previews[index].preview);
        }
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const markForDeletion = (id: number) => {
        onDeleteExisting(id);
    };

    const isMarkedForDeletion = (id: number) => deletedAttachmentIds.includes(id);

    const activeExistingAttachments = existingAttachments.filter(
        att => !isMarkedForDeletion(att.id)
    );

    const isImageUrl = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium">Insurance Documents</label>

            {/* Existing attachments */}
            {activeExistingAttachments.length > 0 && (
                <div>
                    <p className="text-xs text-gray-600 mb-2">Existing Documents</p>
                    <div className="grid grid-cols-4 gap-3">
                        {activeExistingAttachments.map(attachment => (
                            <div key={attachment.id} className="relative group">
                                <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    {isImageUrl(attachment.url) ? (
                                        <img
                                            src={attachment.url}
                                            alt={attachment.file_name}
                                            className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                    ) : (
                                        <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                            <FileText className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                </a>
                                <button
                                    type="button"
                                    onClick={() => markForDeletion(attachment.id)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Marked for deletion notice */}
            {deletedAttachmentIds.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                    {deletedAttachmentIds.length} document{deletedAttachmentIds.length !== 1 ? 's' : ''} marked for deletion
                </div>
            )}

            {/* Upload new attachments */}
            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="text-center">
                    <p className="text-gray-600 text-sm">Click to add more documents</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP, PDF up to 20MB</p>
                </div>
            </button>

            {/* New file previews */}
            {previews.length > 0 && (
                <div>
                    <p className="text-xs text-gray-600 mb-2">New Documents</p>
                    <div className="grid grid-cols-4 gap-3">
                        {previews.map((item, index) => (
                            <div key={index} className="relative group">
                                {item.preview ? (
                                    <img
                                        src={item.preview}
                                        alt={`New Preview ${index + 1}`}
                                        className="w-full h-20 object-cover rounded-lg"
                                    />
                                ) : (
                                    <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-gray-400" />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => removeNewFile(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {newFiles.length > 0 && (
                <div className="text-xs text-gray-600">
                    {newFiles.length} new document{newFiles.length !== 1 ? 's' : ''} to upload
                </div>
            )}
        </div>
    );
}
