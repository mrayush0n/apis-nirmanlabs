export enum Role {
  USER = 'user',
  ASSISTANT = 'model'
}

export enum ModelMode {
  FAST = 'fast', // Gemini 2.0 Flash for quick responses
  DEEP = 'deep'  // Gemini 2.0 Flash for deep analysis
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  isAudioPlaying?: boolean;
}

export interface EmailContact {
  address: string;
  label: string;
}

export interface SchoolData {
  name: string;
  board: string;
  location: string;
  fullAddress: string;
  contact: {
    phones: string[];
    emails: EmailContact[];
    website: string;
    socialMedia: {
      facebook: string;
      twitter: string;
      youtube: string;
    };
  };
  leadership: {
    mentor: string;
    principalMessage?: string;
  };
  classes: string;
  streams: string[];
  facilities: string[];
  focusAreas: string[];
  latestUpdates: {
    title: string;
    date: string;
    description: string;
  }[];
}

export interface APISConfig {
  mode: 'widget' | 'fullscreen';
  position: 'bottom-right' | 'bottom-left';
  theme: 'light' | 'dark';
  autoOpen: boolean;
}
