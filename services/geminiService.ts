import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import { APIS_DATA, SYSTEM_INSTRUCTION } from '../constants';
import { Message, ModelMode, Role } from '../types';

// Access API Key safely. The global process polyfill in index.html ensures this doesn't throw.
// We prioritize process.env.API_KEY if available.
const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

// --- Helper Functions ---

/**
 * Decodes raw PCM data (Int16) to an AudioBuffer.
 * Useful for Gemini TTS and Live API which return raw PCM without headers.
 */
const pcmToAudioBuffer = (data: Uint8Array, ctx: AudioContext, sampleRate: number): AudioBuffer => {
  // Ensure the data length is even (multiple of 2 for Int16)
  if (data.byteLength % 2 !== 0) {
    data = data.slice(0, data.byteLength - 1);
  }

  // Use the buffer, offset, and length to correctly view the data
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length;

  // Create buffer with the specific sample rate
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < frameCount; i++) {
    // Normalize Int16 to Float32 [-1.0, 1.0]
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
};

// --- Services ---

/**
 * Generates a text response based on chat history and selected mode.
 */
export const generateResponse = async (
  history: Message[],
  currentMessage: string,
  mode: ModelMode
): Promise<string> => {

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

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I apologize, but I couldn't generate a proper response at this time. Please try asking again.";
  } catch (error: any) {
    // Enhanced Error Logging
    console.error("❌ GenerateContent Error:", {
      message: error.message,
      status: error.status,
      stack: error.stack,
      model: modelName
    });

    // Specific Error Handling
    if (error.message?.includes('API key') || error.status === 403) {
      return "I'm currently experiencing a configuration issue (Invalid API Key). Please contact the school administrator.";
    }

    if (error.status === 429 || error.message?.includes('quota')) {
      return "I'm receiving a high volume of requests right now. Please wait a moment and try again.";
    }

    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return "I'm having trouble connecting to the internet. Please check your network connection.";
    }

    return "I apologize, but I encountered an unexpected error. Please try asking your question again in a moment.";
  }
};

/**
 * Generates speech from text using Gemini TTS.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      console.warn("GenerateSpeech: No audio data returned from model.");
      return null;
    }
    return base64Audio;
  } catch (error: any) {
    console.error("❌ GenerateSpeech Error:", {
      message: error.message,
      status: error.status,
      textPreview: text.substring(0, 50) + "..."
    });
    // Return null so the UI gracefully handles the lack of audio without crashing
    return null;
  }
};

/**
 * Play audio from base64 string using Web Audio API with Manual PCM Decoding.
 */
export const playAudio = async (base64String: string): Promise<void> => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const binaryString = window.atob(base64String);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gemini 2.5 Flash TTS uses 24kHz
    const audioBuffer = pcmToAudioBuffer(bytes, audioContext, 24000);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
  } catch (e) {
    console.error("Audio playback error", e);
  }
};

/**
 * Gemini Live Client for Real-time Voice Interaction
 */
export class GeminiLiveClient {
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private stream: MediaStream | null = null;
  private nextStartTime = 0;
  private sessionPromise: Promise<any> | null = null;
  private active = false;
  private onStatusChange: (status: string) => void;
  private onAudioLevel: (level: number) => void;

  constructor(callbacks: { onStatusChange: (s: string) => void, onAudioLevel: (l: number) => void }) {
    this.onStatusChange = callbacks.onStatusChange;
    this.onAudioLevel = callbacks.onAudioLevel;
  }

  async connect() {
    if (this.active) return;
    this.active = true;
    this.onStatusChange("Connecting...");

    try {
      this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }, // Friendly voice
          },
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION + " Keep your spoken responses concise, conversational, and friendly suitable for voice interaction." }] },
        },
        callbacks: {
          onopen: () => {
            this.onStatusChange("Listening");
            if (this.stream) {
              this.startAudioInput(this.stream);
            }
          },
          onmessage: (message: LiveServerMessage) => this.handleMessage(message),
          onclose: () => {
            console.log("Session closed");
            this.disconnect();
          },
          onerror: (err) => {
            console.error("Session error", err);
            this.onStatusChange("Error");
            this.disconnect();
          }
        }
      });

      // Wait for session to initialize
      await this.sessionPromise;

    } catch (error) {
      console.error("Failed to connect live session:", error);
      this.onStatusChange("Connection Failed");
      await this.disconnect();
    }
  }

  private startAudioInput(stream: MediaStream) {
    if (!this.inputAudioContext) return;

    this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
    // Buffer size 4096 gives ~250ms latency at 16kHz
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);

    this.processor.onaudioprocess = (e) => {
      if (!this.active) return;

      const inputData = e.inputBuffer.getChannelData(0);

      // Calculate volume for visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onAudioLevel(rms);

      // Convert Float32 to Int16 PCM
      const pcm16 = this.floatTo16BitPCM(inputData);
      const base64Data = this.arrayBufferToBase64(pcm16.buffer);

      this.sessionPromise?.then((session) => {
        session.sendRealtimeInput({
          media: {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Data
          }
        });
      });
    };

    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
    const serverContent = message.serverContent;

    // Handle Audio Output
    if (serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
      this.onStatusChange("Speaking");
      const base64Audio = serverContent.modelTurn.parts[0].inlineData.data;
      this.queueAudio(base64Audio);
    }

    if (serverContent?.turnComplete) {
      this.onStatusChange("Listening");
    }

    if (serverContent?.interrupted) {
      this.onStatusChange("Listening");
      if (this.outputAudioContext) {
        this.nextStartTime = this.outputAudioContext.currentTime;
      }
    }
  }

  private async queueAudio(base64Data: string) {
    if (!this.outputAudioContext) return;

    const binaryString = window.atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Decode PCM for playback (24kHz)
    const audioBuffer = pcmToAudioBuffer(bytes, this.outputAudioContext, 24000);

    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);

    const currentTime = this.outputAudioContext.currentTime;
    // Schedule next chunk to ensure smooth playback
    if (this.nextStartTime < currentTime) {
      this.nextStartTime = currentTime;
    }

    source.start(this.nextStartTime);
    this.nextStartTime += audioBuffer.duration;
  }

  private floatTo16BitPCM(input: Float32Array) {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async disconnect() {
    this.active = false;

    // Cleanup Audio Nodes
    if (this.inputSource) {
      try { this.inputSource.disconnect(); } catch (e) { }
      this.inputSource = null;
    }
    if (this.processor) {
      try { this.processor.disconnect(); } catch (e) { }
      this.processor = null;
    }

    // Stop Microphone Stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    // Close Audio Contexts safely
    if (this.inputAudioContext) {
      if (this.inputAudioContext.state !== 'closed') {
        try { await this.inputAudioContext.close(); } catch (e) { }
      }
      this.inputAudioContext = null;
    }
    if (this.outputAudioContext) {
      if (this.outputAudioContext.state !== 'closed') {
        try { await this.outputAudioContext.close(); } catch (e) { }
      }
      this.outputAudioContext = null;
    }

    // Close Session
    if (this.sessionPromise) {
      const promise = this.sessionPromise;
      this.sessionPromise = null;
      try {
        const session = await promise;
        session.close();
      } catch (e) {
        // Silence errors during close
      }
    }

    this.onStatusChange("Disconnected");
  }
}
