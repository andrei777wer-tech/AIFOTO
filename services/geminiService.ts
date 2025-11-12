import { GoogleGenAI, Modality } from "@google/genai";
import { ImageFile } from '../types';

const MODEL_NAME = 'gemini-2.5-flash-image';

const handleApiError = (error: unknown): Error => {
    console.error("Ошибка вызова Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("Image generation is not available in your country") || error.message.includes("FAILED_PRECONDITION")) {
            return new Error("К сожалению, генерация изображений недоступна в вашем регионе. Пожалуйста, проверьте ограничения Gemini API для вашей страны.");
        }
        return new Error(`Ошибка Gemini API: ${error.message}`);
    }
    return new Error("Произошла неизвестная ошибка при взаимодействии с Gemini API.");
};


export const generateCombinedImage = async (
    personImage: ImageFile,
    backgroundImage: ImageFile,
    userPrompt: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("Переменная окружения API_KEY не установлена.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const basePrompt = "Пожалуйста, создай новое изображение, реалистично поместив человека (включая его лицо, тело и одежду) с первого изображения на фон из второго. Конечное изображение должно содержать только объединенную сцену без каких-либо рамок или аннотаций.";
    const finalTextPrompt = userPrompt ? `${basePrompt} ${userPrompt}` : basePrompt;

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    { text: "Первое изображение содержит человека, которого нужно вырезать." },
                    {
                        inlineData: {
                            data: personImage.base64,
                            mimeType: personImage.mimeType,
                        },
                    },
                    { text: "Второе изображение - это фон, на который нужно поместить человека." },
                    {
                        inlineData: {
                            data: backgroundImage.base64,
                            mimeType: backgroundImage.mimeType,
                        },
                    },
                    {
                        text: finalTextPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("В ответе API не было сгенерировано изображение.");

    } catch (error) {
        throw handleApiError(error);
    }
};


export const generateImageFromText = async (
    userPrompt: string
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("Переменная окружения API_KEY не установлена.");
    }
     if (!userPrompt.trim()) {
        throw new Error("Текстовый запрос не может быть пустым.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: {
                parts: [
                    {
                        text: userPrompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const mimeType = part.inlineData.mimeType;
                return `data:${mimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("В ответе API не было сгенерировано изображение.");

    } catch (error) {
        throw handleApiError(error);
    }
};
