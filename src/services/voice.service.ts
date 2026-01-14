
import { 
  IWindow, 
  ISpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '../types.ts';

class VoiceService {
  private recognition: ISpeechRecognition | null = null;
  private isSupported: boolean = false;
  
  // State Internal
  private finalTranscript: string = '';
  private interimTranscript: string = '';
  
  // Callbacks
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onStateChangeCallback: ((state: 'listening' | 'processing' | 'idle') => void) | null = null;

  // Timers
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly SPEECH_TIMEOUT_MS = 8000; // 8 detik hening = stop

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      // Gunakan prefix webkit untuk Safari/Chrome lama
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'id-ID';
        // Continuous false agar browser auto-stop saat mendeteksi akhir kalimat (lebih reliable di mobile)
        this.recognition.continuous = false; 
        this.recognition.interimResults = true; 
        this.recognition.maxAlternatives = 1;
        this.isSupported = true;
        this.setupEventListeners();
      }
    }
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      // Set safety timeout jika user diam saja
      this.resetSilenceTimer();
      if (this.onStateChangeCallback) this.onStateChangeCallback('listening');
    };

    this.recognition.onresult = (event: Event) => {
      const speechEvent = event as SpeechRecognitionEvent;
      
      // Reset timer setiap ada suara masuk
      this.resetSilenceTimer();

      this.interimTranscript = '';
      let newFinal = '';

      // Loop hasil recognition
      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; ++i) {
        if (speechEvent.results[i].isFinal) {
          newFinal += speechEvent.results[i][0].transcript;
        } else {
          this.interimTranscript += speechEvent.results[i][0].transcript;
        }
      }

      if (newFinal) {
        this.finalTranscript += newFinal;
        // Jika sudah final, browser biasanya akan stop sendiri (continuous=false),
        // tapi kita bisa force stop untuk memastikan UI responsif.
        this.stop(); 
      }

      // Kirim update ke UI (Real-time transcript)
      if (this.onResultCallback) {
        const displayText = this.finalTranscript + this.interimTranscript;
        this.onResultCallback(displayText, !!newFinal);
      }
    };

    this.recognition.onerror = (event: any) => {
      const errorEvent = event as SpeechRecognitionErrorEvent;
      
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      // Ignore benign errors
      if (errorEvent.error === 'no-speech') {
          // No speech bukan error fatal, biarkan onEnd handle
          return; 
      }
      if (errorEvent.error === 'aborted') return;
      
      console.warn("Speech API Error:", errorEvent.error);
      if (this.onErrorCallback) this.onErrorCallback(errorEvent.error);
    };

    this.recognition.onend = () => {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      // --- SAFARI CRITICAL FIX ---
      // Safari sering close session tanpa flag isFinal: true.
      // Kita cek, jika ada interim transcript yang tersisa, anggap itu final.
      const effectiveTranscript = (this.finalTranscript || this.interimTranscript).trim();

      // Jika ada teks tersisa saat sesi berakhir, kirim sebagai final!
      if (effectiveTranscript.length > 0 && this.onResultCallback) {
          this.onResultCallback(effectiveTranscript, true);
      }

      if (this.onEndCallback) this.onEndCallback();
      if (this.onStateChangeCallback) this.onStateChangeCallback('idle');
    };
  }

  private resetSilenceTimer() {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      this.silenceTimer = setTimeout(() => {
          // Jika hening terlalu lama, stop.
          this.stop(); 
      }, this.SPEECH_TIMEOUT_MS);
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void,
    onStateChange?: (state: 'listening' | 'processing' | 'idle') => void
  ) {
    if (!this.isSupported || !this.recognition) {
        onError('not-supported');
        return;
    }
    
    // Reset Internal State
    this.finalTranscript = '';
    this.interimTranscript = '';
    
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;
    this.onStateChangeCallback = onStateChange || null;

    try {
        // Penting untuk iOS: Batalkan speech synthesis (suara robot) sebelum mendengar
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();

        // Abort sesi sebelumnya jika ada (mencegah error 'already started')
        try { this.recognition.abort(); } catch(e) {}
        
        // Synchronous start (Wajib direct call stack untuk iOS Safari)
        this.recognition.start();
    } catch(e) {
       console.error("Speech start error:", e);
       onError('start-failed');
    }
  }

  public stop() {
    if (this.silenceTimer) clearTimeout(this.silenceTimer);
    if (this.recognition) {
      try {
          this.recognition.stop();
      } catch(e) {} 
    }
  }
}

export const voiceService = new VoiceService();
