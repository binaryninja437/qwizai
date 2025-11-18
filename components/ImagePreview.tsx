
import React from 'react';

interface ImagePreviewProps {
    imageSrc: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({ imageSrc }) => {
    return (
        <div className="w-full max-w-md mx-auto bg-gray-800 p-2 rounded-lg shadow-lg">
            <img
                src={imageSrc}
                alt="Selected"
                className="w-full h-auto object-contain rounded-md max-h-96"
            />
        </div>
    );
};
