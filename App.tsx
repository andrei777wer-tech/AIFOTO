import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateCombinedImage, generateImageFromText } from './services/geminiService';
import { ImageFile } from './types';
import { fileToImageFile } from './utils/fileUtils';

type Mode = 'combine' | 'textToImage';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageFile | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<ImageFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [mode, setMode] = useState<Mode>('combine');

  const handleImageSelect = async (file: File, setImage: React.Dispatch<React.SetStateAction<ImageFile | null>>) => {
    try {
      const imageFile = await fileToImageFile(file);
      setImage(imageFile);
      setGeneratedImage(null);
      setError(null);
    } catch (err) {
      console.error("Ошибка обработки файла:", err);
      setError("Не удалось обработать файл изображения. Пожалуйста, попробуйте другой файл.");
    }
  };

  const handleGenerateClick = useCallback(async () => {
    if (mode === 'combine') {
        if (!personImage || !backgroundImage) {
            setError("Пожалуйста, загрузите оба изображения перед генерацией.");
            return;
        }
    } else {
        if (!prompt.trim()) {
            setError("Пожалуйста, введите текстовый запрос для генерации.");
            return;
        }
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      let resultImageUrl: string;
      if (mode === 'combine' && personImage && backgroundImage) {
         resultImageUrl = await generateCombinedImage(personImage, backgroundImage, prompt);
      } else {
         resultImageUrl = await generateImageFromText(prompt);
      }
      setGeneratedImage(resultImageUrl);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла непредвиденная ошибка.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [mode, personImage, backgroundImage, prompt]);
  
  const handleDownload = () => {
    if (generatedImage) {
        const link = document.createElement('a');
        link.href = generatedImage;
        link.download = 'generated-image.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">ИИ Фото-Генератор</h1>
          <p className="mt-2 text-lg text-gray-400">Создавайте уникальные изображения, совмещая фотографии или генерируя их по текстовому описанию.</p>
        </header>

        <main className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
            <div className="flex justify-center mb-6 border-b border-gray-700">
                <button 
                    onClick={() => setMode('combine')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 rounded-t-lg ${mode === 'combine' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
                >
                    Совмещение изображений
                </button>
                <button 
                    onClick={() => setMode('textToImage')}
                    className={`px-4 py-2 text-lg font-semibold transition-colors duration-300 rounded-t-lg ${mode === 'textToImage' ? 'bg-purple-600 text-white' : 'bg-transparent text-gray-400 hover:bg-gray-700'}`}
                >
                    Генерация по тексту
                </button>
            </div>
            
            <div className="space-y-6">
                {mode === 'combine' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ImageUploader id="person-image" label="1. Загрузите фото человека" onImageSelect={(file) => handleImageSelect(file, setPersonImage)} />
                        <ImageUploader id="background-image" label="2. Загрузите фон" onImageSelect={(file) => handleImageSelect(file, setBackgroundImage)} />
                    </div>
                )}
                
                <div>
                    <label htmlFor="prompt" className="block text-lg font-medium text-gray-300 mb-2">
                      {mode === 'combine' ? 'Дополнительные пожелания (необязательно)' : 'Введите ваш запрос для генерации'}
                    </label>
                    <textarea
                        id="prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={mode === 'combine' ? 'Например: сделай фото в стиле аниме' : 'Например: кот в скафандре на Марсе'}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-300"
                        rows={3}
                    />
                </div>

                <button
                    onClick={handleGenerateClick}
                    disabled={isLoading}
                    className="w-full py-3 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
                >
                    {isLoading ? 'Генерация...' : 'Сгенерировать изображение'}
                </button>
            </div>

            <div className="mt-8 min-h-[200px] flex justify-center items-center">
                {isLoading && <Spinner />}
                {error && <div className="text-center p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300">{error}</div>}
                {generatedImage && (
                    <div className="w-full flex flex-col items-center gap-4">
                        <h3 className="text-2xl font-bold">Ваш результат:</h3>
                        <img src={generatedImage} alt="Сгенерированное изображение" className="max-w-full h-auto rounded-lg shadow-lg border-2 border-purple-500/50" />
                        <button
                          onClick={handleDownload}
                          className="mt-2 px-6 py-2 text-lg font-semibold bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-300"
                        >
                          Скачать изображение
                        </button>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;