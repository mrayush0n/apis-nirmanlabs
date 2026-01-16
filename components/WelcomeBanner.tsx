import React from 'react';

const FEATURE_CHIPS = [
    { text: 'Admissions 2026-27', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { text: 'Campus Tour', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { text: 'Classes & Streams', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { text: 'Call Reception', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
];

interface WelcomeBannerProps {
    onSuggestionClick: (text: string) => void;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ onSuggestionClick }) => {
    return (
        <div className="welcome-banner">
            <div className="welcome-header">
                <h2>Welcome to APIS Assistant 🎓</h2>
                <p>Your intelligent companion for Angels Palace International School.</p>
            </div>
            <div className="feature-chips">
                {FEATURE_CHIPS.map((chip, index) => (
                    <button
                        key={index}
                        className="feature-chip"
                        onClick={() => onSuggestionClick(`Tell me about ${chip.text}`)}
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div style={{ color: 'var(--accent-secondary)' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d={chip.icon} />
                            </svg>
                        </div>
                        <span>{chip.text}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default WelcomeBanner;
