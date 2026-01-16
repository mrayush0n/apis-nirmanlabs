import React, { useState, useRef, useEffect } from 'react';
import VoiceControls from './VoiceControls';

interface ChatInputAreaProps {
    onSendMessage: (text: string) => void;
    onVoiceInput: (transcript: string) => void;
    isLoading: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({
    onSendMessage,
    onVoiceInput,
    isLoading
}) => {
    const [inputText, setInputText] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [inputText]);

    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <footer className="chat-input-area">
            <div className="input-wrapper">
                <VoiceControls onTranscript={onVoiceInput} isProcessing={isLoading} />

                <div className="input-box">
                    <textarea
                        ref={textareaRef}
                        placeholder="Ask anything..."
                        rows={1}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!inputText.trim() || isLoading}
                    className="send-btn"
                    aria-label="Send message"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                    </svg>
                </button>
            </div>

            <div className="powered-by">
                Powered by Nirman Labs • © All Rights Reserved
            </div>
        </footer>
    );
};

export default ChatInputArea;
