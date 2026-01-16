import { useState, useRef, useEffect, useCallback } from 'react';
import { generateResponse, generateSpeech, playAudio } from '../services/aiService';
import {
    loadConversations,
    saveConversation,
    deleteConversation as deleteConv,
    createNewConversation
} from '../services/chatHistoryService';
import { Message, Role, ModelMode, Conversation, APISConfig } from '../types';

export const WELCOME_MESSAGE: Message = {
    id: 'welcome',
    role: Role.ASSISTANT,
    text: "👋 Hello! I'm the APIS Virtual Assistant.\n\nI can help you with information about Angels Palace International School - admissions, fees, facilities, and more.\n\nHow can I assist you today?",
    timestamp: new Date()
};

export const QUICK_REPLIES = [
    { text: 'Admissions', icon: '📋' },
    { text: 'Facilities', icon: '🏫' },
    { text: 'Contact Info', icon: '📞' },
    { text: 'Fee Structure', icon: '💰' },
];

export const FEATURE_CHIPS = [
    { text: 'Admissions 2026-27', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { text: 'Campus Tour', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { text: 'Classes & Streams', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { text: 'Call Reception', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
];

export const useChat = (config: APISConfig) => {
    // Core chat state
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
    const [isLoading, setIsLoading] = useState(false);

    // UI state
    const [mode, setMode] = useState<ModelMode>(ModelMode.FAST);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [isLiveModeOpen, setIsLiveModeOpen] = useState(false);
    const [isWidgetOpen, setIsWidgetOpen] = useState(config.autoOpen);
    const [showWelcome, setShowWelcome] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Load conversations on mount
    useEffect(() => {
        const saved = loadConversations();
        setConversations(saved);
    }, []);

    // Save current conversation when messages change
    useEffect(() => {
        if (activeConversationId && messages.length > 1) {
            const conversation: Conversation = {
                id: activeConversationId,
                title: 'New Chat',
                messages: messages.filter(m => m.id !== 'welcome'),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const updated = saveConversation(conversation);
            setConversations(updated);
        }
    }, [messages, activeConversationId]);

    const handleSendMessage = useCallback(async (text: string) => {
        if (!text.trim()) return;
        setShowWelcome(false);

        // Create conversation if none active
        if (!activeConversationId) {
            const newConv = createNewConversation();
            setActiveConversationId(newConv.id);
        }

        const userMsg: Message = {
            id: Date.now().toString(),
            role: Role.USER,
            text: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const botResponseText = await generateResponse(
                messages.filter(m => m.id !== 'welcome'),
                text,
                mode
            );

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.ASSISTANT,
                text: botResponseText,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
            setIsLoading(false);

            if (autoSpeak) {
                const audioBase64 = await generateSpeech(botResponseText);
                if (audioBase64) {
                    await playAudio(audioBase64);
                }
            }
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);

            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: Role.ASSISTANT,
                text: "I apologize, but I encountered an error. Please try again or contact the school directly.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
    }, [messages, mode, autoSpeak, activeConversationId]);

    const onVoiceInput = (transcript: string) => {
        handleSendMessage(transcript);
        setAutoSpeak(true);
    };

    const handleQuickReply = (text: string) => {
        handleSendMessage(text);
    };

    // Chat history handlers
    const handleNewChat = () => {
        const newConv = createNewConversation();
        setActiveConversationId(newConv.id);
        setMessages([WELCOME_MESSAGE]);
        setShowWelcome(true);
        setIsSidebarOpen(false);
    };

    const handleSelectConversation = (id: string) => {
        const conv = conversations.find(c => c.id === id);
        if (conv) {
            setActiveConversationId(id);
            setMessages([WELCOME_MESSAGE, ...conv.messages]);
            setShowWelcome(false);
            setIsSidebarOpen(false);
        }
    };

    const handleDeleteConversation = (id: string) => {
        const updated = deleteConv(id);
        setConversations(updated);
        if (id === activeConversationId) {
            handleNewChat();
        }
    };

    return {
        // State
        conversations,
        activeConversationId,
        messages,
        isLoading,
        mode,
        autoSpeak,
        isLiveModeOpen,
        isWidgetOpen,
        showWelcome,
        isSidebarOpen,

        // Setters
        setMode,
        setAutoSpeak,
        setIsLiveModeOpen,
        setIsWidgetOpen,
        setShowWelcome,
        setIsSidebarOpen,

        // Handlers
        handleSendMessage,
        onVoiceInput,
        handleQuickReply,
        handleNewChat,
        handleSelectConversation,
        handleDeleteConversation
    };
};
