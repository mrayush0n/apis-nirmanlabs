import React, { useState } from 'react';
import { Conversation } from '../types';
import { formatConversationDate } from '../services/chatHistoryService';
import { auth } from '../firebaseConfig';

interface ChatHistorySidebarProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onNewChat: () => void;
    onDeleteConversation: (id: string) => void;
}

const ChatHistorySidebar: React.FC<ChatHistorySidebarProps> = ({
    isOpen,
    onClose,
    conversations,
    activeConversationId,
    onSelectConversation,
    onNewChat,
    onDeleteConversation
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const user = auth.currentUser;

    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group conversations by date
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = (date: Date) => date.toDateString() === today.toDateString();
    const isYesterday = (date: Date) => date.toDateString() === yesterday.toDateString();

    const groupedConversations = {
        today: filteredConversations.filter(c => isToday(new Date(c.updatedAt))),
        yesterday: filteredConversations.filter(c => isYesterday(new Date(c.updatedAt))),
        older: filteredConversations.filter(c => !isToday(new Date(c.updatedAt)) && !isYesterday(new Date(c.updatedAt)))
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`chat-sidebar ${isOpen ? 'open' : ''}`}>
                {/* Top Actions */}
                <div className="sidebar-top">
                    <button className="sidebar-icon-btn" onClick={onClose} title="Close sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="9" y1="3" x2="9" y2="21"></line>
                        </svg>
                    </button>
                    <button className="sidebar-icon-btn" onClick={onNewChat} title="New chat">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"></path>
                        </svg>
                    </button>
                </div>

                {/* New Chat Button */}
                <button onClick={onNewChat} className="new-chat-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>New chat</span>
                </button>

                {/* Search */}
                <div className="sidebar-search">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.3-4.3"></path>
                    </svg>
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Conversation List */}
                <div className="conversation-list">
                    {filteredConversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No conversations yet</p>
                            <span>Start a new chat to begin</span>
                        </div>
                    ) : (
                        <>
                            {groupedConversations.today.length > 0 && (
                                <div className="conversation-group">
                                    <div className="group-label">Today</div>
                                    {groupedConversations.today.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conv={conv}
                                            isActive={conv.id === activeConversationId}
                                            onSelect={() => onSelectConversation(conv.id)}
                                            onDelete={() => onDeleteConversation(conv.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedConversations.yesterday.length > 0 && (
                                <div className="conversation-group">
                                    <div className="group-label">Yesterday</div>
                                    {groupedConversations.yesterday.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conv={conv}
                                            isActive={conv.id === activeConversationId}
                                            onSelect={() => onSelectConversation(conv.id)}
                                            onDelete={() => onDeleteConversation(conv.id)}
                                        />
                                    ))}
                                </div>
                            )}

                            {groupedConversations.older.length > 0 && (
                                <div className="conversation-group">
                                    <div className="group-label">Previous</div>
                                    {groupedConversations.older.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conv={conv}
                                            isActive={conv.id === activeConversationId}
                                            onSelect={() => onSelectConversation(conv.id)}
                                            onDelete={() => onDeleteConversation(conv.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* User Profile */}
                <div className="sidebar-user">
                    <div className="user-avatar">
                        {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user?.displayName || 'User'}</span>
                        <span className="user-email">{user?.email}</span>
                    </div>
                </div>
            </aside>
        </>
    );
};

// Conversation Item Component
const ConversationItem: React.FC<{
    conv: Conversation;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}> = ({ conv, isActive, onSelect, onDelete }) => {
    return (
        <div
            className={`conversation-item ${isActive ? 'active' : ''}`}
            onClick={onSelect}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="conv-title">{conv.title}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="delete-btn"
                title="Delete"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                </svg>
            </button>
        </div>
    );
};

export default ChatHistorySidebar;
