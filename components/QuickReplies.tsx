import React from 'react';

const QUICK_REPLIES = [
    { text: 'Admissions', icon: '📋' },
    { text: 'Facilities', icon: '🏫' },
    { text: 'Contact Info', icon: '📞' },
    { text: 'Fee Structure', icon: '💰' },
];

interface QuickRepliesProps {
    onQuickReply: (text: string) => void;
}

const QuickReplies: React.FC<QuickRepliesProps> = ({ onQuickReply }) => {
    return (
        <div className="feature-chips" style={{ marginBottom: '20px', padding: '0 24px' }}>
            {QUICK_REPLIES.map((reply, index) => (
                <button
                    key={index}
                    className="feature-chip"
                    onClick={() => onQuickReply(`Tell me about ${reply.text}`)}
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                    <span>{reply.icon}</span> {reply.text}
                </button>
            ))}
        </div>
    );
};

export default QuickReplies;
