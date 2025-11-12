
import { ImageFile } from '../types';

export const fileToImageFile = (file: File): Promise<ImageFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const parts = dataUrl.split(',');
      if (parts.length !== 2) {
        return reject(new Error('Invalid Data URL format.'));
      }
      
      const mimeTypeMatch = parts[0].match(/:(.*?);/);
      if (!mimeTypeMatch || mimeTypeMatch.length < 2) {
        return reject(new Error('Could not determine MIME type from Data URL.'));
      }
      
      const mimeType = mimeTypeMatch[1];
      const base64 = parts[1];
      
      resolve({ base64, mimeType, dataUrl });
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};
