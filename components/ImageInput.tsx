
import React, { useRef } from 'react';
import { UploadIcon, CameraIcon } from './icons/Icons';

interface ImageInputProps {
    onImageSelect: (imageData: string, mimeType: string) => void;
    onOpenCamera: () => void;
}

const fileToDataUrl = (file: File): Promise<{ data: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ data: reader.result as string, mimeType: file.type });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const ImageInput: React.FC<ImageInputProps> = ({ onImageSelect, onOpenCamera }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const { data, mimeType } = await fileToDataUrl(file);
                onImageSelect(data, mimeType);
            } catch (error) {
                console.error("Error reading file:", error);
                alert("Failed to read the image file. Please try again.");
            }
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full p-8 border-2 border-dashed border-gray-600 rounded-2xl bg-gray-800/50 flex flex-col items-center justify-center text-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />
            <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-200">Provide an Image</h2>
                 <p className="text-gray-400">Upload a file or use your camera to get started.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleUploadClick}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg shadow-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75 transition-colors"
                    >
                        <UploadIcon />
                        Upload Image
                    </button>
                    <button
                        onClick={onOpenCamera}
                        className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
                    >
                        <CameraIcon />
                        Use Camera
                    </button>
                </div>
            </div>
        </div>
    );
};
