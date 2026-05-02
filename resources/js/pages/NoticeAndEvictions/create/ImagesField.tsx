import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagesFieldProps {
    files: File[];
    onChange: (files: File[]) => void;
}

export default function ImagesField({ files, onChange }: ImagesFieldProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const newFiles = [...files, ...selectedFiles];
        onChange(newFiles);

        const newPreviews = selectedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onChange(newFiles);

        URL.revokeObjectURL(previews[index].preview);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium">Upload Images</label>

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors"
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                />
                <div className="text-center">
                    <p className="text-gray-600">Click to upload images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                </div>
            </button>

            {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                    {previews.map((item, index) => (
                        <div key={index} className="relative">
                            <img
                                src={item.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg"
                            />
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
                    {files.length} image{files.length !== 1 ? 's' : ''} selected
                </div>
            )}
        </div>
    );
}
