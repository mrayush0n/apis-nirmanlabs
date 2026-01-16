import React from 'react';
import { ThemeMode } from '../hooks/useTheme';

interface ChatHeaderProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    isLiveModeOpen: boolean;
    setIsLiveModeOpen: (isOpen: boolean) => void;
    autoSpeak: boolean;
    setAutoSpeak: (autoSpeak: boolean) => void;
    isWidgetMode: boolean;
    setIsWidgetOpen: (isOpen: boolean) => void;
    theme: ThemeMode;
    onThemeChange: (theme: ThemeMode) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
    isSidebarOpen,
    setIsSidebarOpen,
    isLiveModeOpen,
    setIsLiveModeOpen,
    autoSpeak,
    setAutoSpeak,
    isWidgetMode,
    setIsWidgetOpen,
    theme,
    onThemeChange
}) => {
    const getThemeIcon = () => {
        switch (theme) {
            case 'light': return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM15.657 4.343a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zM6.464 13.536a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.061 0zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM15.657 15.657a.75.75 0 01-1.061 0l-1.06-1.061a.75.75 0 111.06-1.06l1.06 1.06a.75.75 0 010 1.061zM6.464 6.464a.75.75 0 01-1.061 0l-1.06-1.06a.75.75 0 011.06-1.06l1.06 1.06a.75.75 0 010 1.06zM10 5.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
                </svg>
            );
            case 'dark': return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
                </svg>
            );
            case 'auto': return (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M2.24 6.8a.75.75 0 001.06-.04l1.95-2.1v8.59a.75.75 0 001.5 0V4.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0L2.2 5.74a.75.75 0 00.04 1.06zm8 6.4a.75.75 0 00-1.06.04l-1.95 2.1V6.75a.75.75 0 00-1.5 0v8.59l-1.95-2.1a.75.75 0 10-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 00-.04-1.06z" clipRule="evenodd" />
                    <path d="M12.5 5a.5.5 0 100-1 .5.5 0 000 1zM12.5 16a.5.5 0 100-1 .5.5 0 000 1zM18.5 5a.5.5 0 100-1 .5.5 0 000 1zM18.5 16a.5.5 0 100-1 .5.5 0 000 1z" />
                </svg>
            );
        }
    };

    const cycleTheme = () => {
        if (theme === 'auto') onThemeChange('light');
        else if (theme === 'light') onThemeChange('dark');
        else onThemeChange('auto');
    };

    return (
        <header className="chat-header">
            <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Sidebar Toggle */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="header-btn menu-btn"
                    title="Chat History"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 01-.75-.75z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="header-brand">
                    <div className="header-logo">
                        <span>A</span>
                    </div>
                    <div className="header-info">
                        <h1>APIS Assistant</h1>
                        <p className="status">
                            <span className="status-dot"></span>
                            <span>Online</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="header-actions">
                {/* Theme Toggle */}
                <button
                    onClick={cycleTheme}
                    className="header-btn"
                    title={`Theme: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
                >
                    {getThemeIcon()}
                </button>

                {/* Live Voice Button */}
                <button
                    onClick={() => setIsLiveModeOpen(true)}
                    className="header-btn live-call-btn"
                    title="Start Live Voice Call"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Live Mode</span>
                </button>

                {/* TTS Toggle */}
                <button
                    onClick={() => setAutoSpeak(!autoSpeak)}
                    className={`header-btn ${autoSpeak ? 'active' : ''}`}
                    title={autoSpeak ? "Voice responses ON" : "Voice responses OFF"}
                >
                    {autoSpeak ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75zM15.95 5.05a.75.75 0 00-1.06 1.061 5.5 5.5 0 010 7.778.75.75 0 001.06 1.06 7 7 0 000-9.899z" />
                            <path d="M13.829 7.172a.75.75 0 00-1.061 1.06 2.5 2.5 0 010 3.536.75.75 0 001.06 1.06 4 4 0 000-5.656z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 3.75a.75.75 0 00-1.264-.546L4.703 7H3.167a.75.75 0 00-.7.48A6.985 6.985 0 002 10c0 .887.165 1.737.468 2.52.111.29.39.48.7.48h1.535l4.033 3.796A.75.75 0 0010 16.25V3.75z" />
                        </svg>
                    )}
                </button>

                {/* Widget Close/Minimize */}
                {isWidgetMode && (
                    <button
                        onClick={() => setIsWidgetOpen(false)}
                        className="header-btn"
                        title="Minimize"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M5 10a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 10z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>
        </header>
    );
};

export default ChatHeader;
