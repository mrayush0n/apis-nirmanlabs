import { Conversation, Message } from '../types';

const STORAGE_KEY = 'apis_chat_history';

/**
 * Generate a unique conversation ID
 */
export const generateConversationId = (): string => {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Generate a title from the first user message
 */
export const generateTitle = (messages: Message[]): string => {
    const firstUserMessage = messages.find(m => m.role === 'user');
    if (firstUserMessage) {
        const text = firstUserMessage.text.trim();
        return text.length > 40 ? text.substring(0, 40) + '...' : text;
    }
    return 'New Chat';
};

/**
 * Load all conversations from localStorage
 */
export const loadConversations = (): Conversation[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        return parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
            }))
        }));
    } catch (error) {
        console.error('Failed to load conversations:', error);
        return [];
    }
};

/**
 * Save conversations to localStorage
 */
export const saveConversations = (conversations: Conversation[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        console.error('Failed to save conversations:', error);
    }
};

/**
 * Save or update a single conversation
 */
export const saveConversation = (conversation: Conversation): Conversation[] => {
    const conversations = loadConversations();
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    const updatedConversation = {
        ...conversation,
        updatedAt: new Date(),
        title: conversation.messages.length > 1 ? generateTitle(conversation.messages) : conversation.title
    };

    if (existingIndex >= 0) {
        conversations[existingIndex] = updatedConversation;
    } else {
        conversations.unshift(updatedConversation);
    }

    saveConversations(conversations);
    return conversations;
};

/**
 * Delete a conversation by ID
 */
export const deleteConversation = (id: string): Conversation[] => {
    const conversations = loadConversations();
    const filtered = conversations.filter(c => c.id !== id);
    saveConversations(filtered);
    return filtered;
};

/**
 * Create a new empty conversation
 */
export const createNewConversation = (): Conversation => {
    return {
        id: generateConversationId(),
        title: 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };
};

/**
 * Format date for display
 */
export const formatConversationDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return date.toLocaleDateString([], { weekday: 'short' });
    } else {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
};
