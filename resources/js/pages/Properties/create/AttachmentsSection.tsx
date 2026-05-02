import { useState, useRef } from 'react';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AttachmentsSectionProps {
    files: File[];
    onChange: (files: File[]) => void;
}

export default function AttachmentsSection({ files, onChange }: AttachmentsSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<{ file: File; preview: string | null }[]>([]);

    const isImage = (file: File) => file.type.startsWith('image/');
    const isPdf = (file: File) => file.type === 'application/pdf';

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = [...files, ...selectedFiles];
        onChange(newFiles);

        const newPreviews = selectedFiles.map(file => ({
            file,
            preview: isImage(file) ? URL.createObjectURL(file) : null,
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);

        if (previews[index].preview) {
            URL.revokeObjectURL(previews[index].preview);
        }
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium">Insurance Documents</label>

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
                    <p className="text-gray-600">Click to upload documents</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP, PDF up to 20MB</p>
                </div>
            </button>

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {previews.map((item, index) => (
                        <div key={index} className="relative">
                            {item.preview ? (
                                <img
                                    src={item.preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-24 object-cover rounded-lg"
                                />
                            ) : (
                                <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-8 w-8 text-gray-400" />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {files.length > 0 && (
                <div className="text-sm text-gray-600">
                    {files.length} document{files.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
}
