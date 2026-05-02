import { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { NoticeAndEvictionImage } from '@/types/NoticeAndEviction';

interface ImagesSectionProps {
    existingImages: NoticeAndEvictionImage[];
    newFiles: File[];
    onNewFiles: (files: File[]) => void;
    onDeleteExisting: (id: number) => void;
    deletedImageIds?: number[];
}

export default function ImagesSection({
    existingImages,
    newFiles,
    onNewFiles,
    onDeleteExisting,
    deletedImageIds = [],
}: ImagesSectionProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previews, setPreviews] = useState<{ file: File; preview: string }[]>([]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const updatedFiles = [...newFiles, ...selectedFiles];
        onNewFiles(updatedFiles);

        const newPreviews = selectedFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeNewFile = (index: number) => {
        const newFiles_ = newFiles.filter((_, i) => i !== index);
        onNewFiles(newFiles_);

        URL.revokeObjectURL(previews[index].preview);
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const markForDeletion = (id: number) => {
        onDeleteExisting(id);
    };

    const isMarkedForDeletion = (id: number) => deletedImageIds.includes(id);

    const activeExistingImages = existingImages.filter(
        img => !isMarkedForDeletion(img.id)
    );

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium">Images</label>

            {/* Existing images */}
            {activeExistingImages.length > 0 && (
                <div>
                    <p className="text-xs text-gray-600 mb-2">Existing Images</p>
                    <div className="grid grid-cols-4 gap-3">
                        {activeExistingImages.map(image => (
                            <div key={image.id} className="relative group">
                                <a
                                    href={image.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    <img
                                        src={image.url}
                                        alt={image.file_name}
                                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                    />
                                </a>
                                <button
                                    type="button"
                                    onClick={() => markForDeletion(image.id)}
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
            {deletedImageIds.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2 text-xs text-red-700">
                    {deletedImageIds.length} image{deletedImageIds.length !== 1 ? 's' : ''} marked for deletion
                </div>
            )}

            {/* Upload new images */}
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
                    <p className="text-gray-600 text-sm">Click to add more images</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                </div>
            </button>

            {/* New file previews */}
            {previews.length > 0 && (
                <div>
                    <p className="text-xs text-gray-600 mb-2">New Images</p>
                    <div className="grid grid-cols-4 gap-3">
                        {previews.map((item, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={item.preview}
                                    alt={`New Preview ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                />
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
                    {newFiles.length} new image{newFiles.length !== 1 ? 's' : ''} to upload
                </div>
            )}
        </div>
    );
}
