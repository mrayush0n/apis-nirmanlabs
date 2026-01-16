import { GoogleGenAI, Modality } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { Message, ModelMode, Role } from '../types';

// Access API Keys safely - check multiple possible env var names
const getEnvVar = (key: string) => {
    // Check process.env
    if (process.env[key]) return process.env[key];
    // Check import.meta.env if available (Vite)
    try {
        // @ts-ignore
        if (import.meta.env && import.meta.env[key]) return import.meta.env[key];
    } catch (e) {
        // Ignore error if import.meta is not available
    }
    return '';
};

const geminiApiKey = getEnvVar('VITE_GEMINI_API_KEY') || getEnvVar('GEMINI_API_KEY') || getEnvVar('VITE_API_KEY') || getEnvVar('API_KEY') || '';

const geminiAI = new GoogleGenAI({ apiKey: geminiApiKey });

// --- Main Service (Gemini Only) ---

/**
 * Generates a response using Google Gemini
 */
export const generateResponse = async (
    history: Message[],
    currentMessage: string,
    mode: ModelMode
): Promise<string> => {
    try {
        if (!geminiApiKey) {
            return "Gemini is not configured. Please add your Gemini API key to use this feature.";
        }

        const modelName = mode === ModelMode.FAST
            ? 'gemini-3-flash-preview'
            : 'gemini-3-pro-preview';

        const contents = history.map(msg => ({
            role: msg.role === Role.USER ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));

        contents.push({
            role: 'user',
            parts: [{ text: currentMessage }]
        });

        const response = await geminiAI.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.7,
            }
        });

        return response.text || "I apologize, but I couldn't generate a proper response at this time.";
    } catch (error: any) {
        console.error('❌ Gemini Error - Full Details:', error);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error status:', error.status);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));

        if (error.message?.includes('API key') || error.status === 403 || error.status === 401) {
            return "I'm experiencing a configuration issue with Gemini. Please check the API key.";
        }

        if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('rate')) {
            return "I'm receiving too many requests right now. Please wait a moment and try again.";
        }

        if (error.message?.includes('network') || error.message?.includes('fetch')) {
            return "I'm having trouble connecting to the internet. Please check your network connection.";
        }

        return "I apologize, but I encountered an unexpected error. Please try again.";
    }
};

/**
 * Check if Gemini is available (has API key configured)
 */
export const isGeminiAvailable = (): boolean => {
    return !!geminiApiKey;
};

// Re-export TTS functions from geminiService for compatibility
export { generateSpeech, playAudio, GeminiLiveClient } from './geminiService';
