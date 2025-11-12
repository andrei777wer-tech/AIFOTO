import React, { useState, useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageSelect: (file: File) => void;
}

const UploadIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageSelect }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-lg font-medium text-gray-300 mb-2">{label}</label>
      <div
        onClick={handleAreaClick}
        className="w-full aspect-video bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex justify-center items-center cursor-pointer hover:border-purple-500 hover:bg-gray-700 transition-colors duration-300"
      >
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {imagePreview ? (
          <img src={imagePreview} alt="Предпросмотр" className="w-full h-full object-contain rounded-lg p-2" />
        ) : (
          <div className="text-center text-gray-500">
            <UploadIcon />
            <p>Нажмите, чтобы загрузить</p>
          </div>
        )}
      </div>
    </div>
  );
};