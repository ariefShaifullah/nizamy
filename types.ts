
export * from './features/faraidh/types.ts';
export * from './features/zakat/types.ts';
export * from './features/hafalan/types.ts';
export * from './features/prayer/types.ts';
export * from './features/mushaf/types.ts';
export * from './features/hede/types.ts';

// --- WEB SPEECH API TYPES ---
export interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

export interface VoiceCommandState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isProcessing: boolean;
}
    