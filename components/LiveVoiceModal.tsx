import React, { useEffect, useState, useRef } from 'react';
import { GeminiLiveClient } from '../services/geminiService';

interface LiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveVoiceModal: React.FC<LiveVoiceModalProps> = ({ isOpen, onClose }) => {
  const [status, setStatus] = useState("Initializing...");
  const [audioLevel, setAudioLevel] = useState(0);
  const clientRef = useRef<GeminiLiveClient | null>(null);

  useEffect(() => {
    if (isOpen) {
      const client = new GeminiLiveClient({
        onStatusChange: setStatus,
        onAudioLevel: setAudioLevel
      });
      clientRef.current = client;
      client.connect();
    } else {
      clientRef.current?.disconnect();
      clientRef.current = null;
    }

    return () => {
      clientRef.current?.disconnect();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visualScale = 1 + Math.min(audioLevel * 5, 1.5);
  const isSpeaking = status === 'Speaking';

  return (
    <div className="live-modal-overlay">
      {/* Header */}
      <div className="live-modal-header">
        <div className="live-modal-logo">A</div>
        <h2>APIS Voice Assistant</h2>
        <p>Real-time conversation with our AI</p>
      </div>

      {/* Audio Visualizer */}
      <div className="live-visualizer">
        {/* Outer Ripple */}
        <div
          className="ripple"
          style={{
            transform: `scale(${isSpeaking ? 1.2 : visualScale})`,
            background: isSpeaking
              ? 'rgba(251, 191, 36, 0.15)'
              : 'rgba(59, 130, 246, 0.15)'
          }}
        />

        {/* Inner Core */}
        <div
          className={`core ${isSpeaking ? 'speaking' : ''}`}
          style={{
            transform: `scale(${isSpeaking ? 1.1 : Math.max(1, visualScale * 0.8)})`
          }}
        >
          <span className="live-status">{status}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="live-modal-footer">
        <p>Speak naturally. You can interrupt me anytime.</p>

        <button
          onClick={onClose}
          className="end-call-btn"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM17.78 9.22a.75.75 0 10-1.06 1.06L18.44 12l-1.72 1.72a.75.75 0 001.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L20.56 12l1.72-1.72a.75.75 0 00-1.06-1.06l-1.72 1.72-1.72-1.72z" />
          </svg>
          <span>End Call</span>
        </button>
      </div>
    </div>
  );
};

export default LiveVoiceModal;
