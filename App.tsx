import React, { useRef, useEffect, useState } from 'react';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import Auth from './components/Auth';
import { useChat } from './hooks/useChat';
import { useTheme } from './hooks/useTheme';
import { APISConfig } from './types';
import ChatMessage from './components/ChatMessage';
import LiveVoiceModal from './components/LiveVoiceModal';
import ChatHistorySidebar from './components/ChatHistorySidebar';
import ChatHeader from './components/ChatHeader';
import ChatInputArea from './components/ChatInputArea';
import WelcomeBanner from './components/WelcomeBanner';
import QuickReplies from './components/QuickReplies';

// Get embed configuration from window
declare global {
  interface Window {
    APIS_CONFIG?: APISConfig;
  }
}

function App() {
  const config = window.APIS_CONFIG || { mode: 'fullscreen', position: 'bottom-right', theme: 'light', autoOpen: false };
  const isWidgetMode = config.mode === 'widget';

  const { theme, setTheme } = useTheme();

  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    autoSpeak,
    setAutoSpeak,
    isLiveModeOpen,
    setIsLiveModeOpen,
    isWidgetOpen,
    setIsWidgetOpen,
    showWelcome,
    setShowWelcome,
    isSidebarOpen,
    setIsSidebarOpen,
    handleSendMessage,
    onVoiceInput,
    handleQuickReply,
    handleNewChat,
    handleSelectConversation,
    handleDeleteConversation
  } = useChat(config);

  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Render chat content
  const renderChatContent = () => (
    <>
      <ChatHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isLiveModeOpen={isLiveModeOpen}
        setIsLiveModeOpen={setIsLiveModeOpen}
        autoSpeak={autoSpeak}
        setAutoSpeak={setAutoSpeak}
        isWidgetMode={isWidgetMode}
        setIsWidgetOpen={setIsWidgetOpen}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Welcome Banner - Only in fullscreen/widget first load */}
      {!isWidgetMode && showWelcome && messages.length <= 1 && (
        <WelcomeBanner onSuggestionClick={handleSendMessage} />
      )}

      {/* For widget mode, we might want a smaller welcome or just the messages. 
          Original code had WelcomeBanner only for !isWidgetMode.
          "RefApp.tsx:282: {!isWidgetMode && showWelcome && messages.length <= 1 && ("
      */}

      {/* Chat Messages */}
      <main className="chat-area">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <ChatMessage key={msg.id} message={msg} index={index} />
          ))}

          {isLoading && (
            <div className="message assistant">
              <div className="message-avatar">A</div>
              <div className="message-content">
                <div className="message-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Replies - Show when not loading and few messages */}
      {!isLoading && messages.length <= 3 && (
        <QuickReplies onQuickReply={handleQuickReply} />
      )}

      {/* Input Area */}
      <ChatInputArea
        onSendMessage={handleSendMessage}
        onVoiceInput={onVoiceInput}
        isLoading={isLoading}
      />
    </>
  );

  if (authLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-deep)', color: 'var(--text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={(u) => setUser(u)} />;
  }

  // Widget Mode Layout
  if (isWidgetMode) {
    return (
      <>
        {/* Sidebar */}
        <ChatHistorySidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
        />

        {/* Live Voice Modal */}
        <LiveVoiceModal isOpen={isLiveModeOpen} onClose={() => setIsLiveModeOpen(false)} />

        {/* Floating Widget Button */}
        <button
          onClick={() => setIsWidgetOpen(!isWidgetOpen)}
          className={`widget-trigger ${config.position === 'bottom-left' ? 'position-left' : ''}`}
          aria-label="Open APIS Assistant"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            border: 'none',
            boxShadow: '0 4px 15px var(--accent-primary-glow)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            transition: 'transform 0.2s',
            color: 'white' // Ensure icon color is right
          }}
        >
          {isWidgetOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L10 8.94l3.47-3.47a.75.75 0 111.06 1.06L11.06 10l3.47 3.47a.75.75 0 11-1.06 1.06L10 11.06l-3.47 3.47a.75.75 0 01-1.06-1.06L8.94 10 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Widget Chat Container */}
        <div
          className={`widget-container ${isWidgetOpen ? 'open' : ''} ${config.position === 'bottom-left' ? 'position-left' : ''}`}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            height: '600px',
            maxHeight: 'calc(100vh - 120px)',
            background: 'var(--bg-deep)',
            borderRadius: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.4), 0 0 0 1px var(--glass-panel-border)',
            display: isWidgetOpen ? 'flex' : 'none',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999
          }}
        >
          {renderChatContent()}
        </div>
      </>
    );
  }

  // Fullscreen Mode Layout
  return (
    <div className="fullscreen-container">
      {/* Sidebar */}
      <ChatHistorySidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Live Voice Modal */}
      <LiveVoiceModal isOpen={isLiveModeOpen} onClose={() => setIsLiveModeOpen(false)} />

      {renderChatContent()}
    </div>
  );
}

export default App;
