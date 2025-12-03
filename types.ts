
export * from './features/faraidh/types.ts';
export * from './features/zakat/types.ts';
export * from './features/hafalan/types.ts';
export * from './features/prayer/types.ts';
export * from './features/mushaf/types.ts';
export * from './features/hede/types.ts';

// --- WEB SPEECH API TYPES DEFINITIONS ---
// Mendefinisikan interface standar W3C untuk Speech Recognition
// agar tidak perlu menggunakan 'any' di service.

export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
}

// Konstruktor untuk SpeechRecognition
export interface SpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

// Extend Window interface
export interface IWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

export interface VoiceCommandState {
  isListening: boolean;
  transcript: string;
  error: string | null;
  isProcessing: boolean;
}
