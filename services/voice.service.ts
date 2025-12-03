
import { IWindow } from '../types.ts';

class VoiceService {
  private recognition: any = null;
  private isSupported: boolean = false;
  
  // Flag: Apakah stop dilakukan manual oleh user (tombol X)?
  private manualStop: boolean = false; 
  
  // Callbacks
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  
  // Timer untuk mencegah infinite loop crash jika browser error terus menerus
  private restartTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'id-ID';
        this.recognition.continuous = false; // Selalu false agar hasil lebih cepat & akurat per kalimat
        this.recognition.interimResults = true; // Agar UI terlihat responsif saat user bicara
        this.isSupported = true;
        this.setupEventListeners();
      }
    }
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      if (this.restartTimer) clearTimeout(this.restartTimer);
    };

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (this.onResultCallback) {
        if (finalTranscript) {
          this.onResultCallback(finalTranscript, true);
        } else if (interimTranscript) {
          this.onResultCallback(interimTranscript, false);
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      // WORLD-CLASS HANDLING:
      // Error 'no-speech' (hening) atau 'network' sering terjadi.
      // Kita abaikan error ini dan biarkan flow masuk ke 'onend' untuk di-restart otomatis.
      // Hanya error fatal (not-allowed) yang kita laporkan ke UI.
      
      if (event.error === 'no-speech' || event.error === 'network') {
          return; // Ignore, let it restart
      }
      
      if (event.error === 'aborted') return;
      
      console.warn("Speech API Error:", event.error);
      if (this.onErrorCallback) this.onErrorCallback(event.error);
    };

    this.recognition.onend = () => {
      // PHOENIX PROTOCOL:
      // Jika mati BUKAN karena user tekan tombol stop, hidupkan lagi seketika.
      if (this.manualStop) {
          if (this.onEndCallback) this.onEndCallback();
      } else {
          // Clear previous timer just in case
          if (this.restartTimer) clearTimeout(this.restartTimer);
          
          this.restartTimer = setTimeout(() => {
              try {
                  // Check flag again before starting inside timeout to be safe
                  if (!this.manualStop && this.recognition) {
                      this.recognition.start();
                  }
              } catch (e) {
                  // Ignore 'already started' errors
              }
          }, 100);
      }
    };
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported) return;
    
    // Reset state
    this.manualStop = false;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    // Pastikan instance bersih sebelum mulai
    try {
        this.recognition.abort();
    } catch(e) {}

    // Delay sedikit untuk memastikan abort selesai
    setTimeout(() => {
        try {
          this.recognition.start();
        } catch(e) {
           console.debug("Start overlap ignored");
        }
    }, 50);
  }

  public stop() {
    this.manualStop = true; // Set flag agar tidak auto-restart
    
    // CRITICAL FIX: Clear timer immediately to prevent zombie restart
    if (this.restartTimer) {
        clearTimeout(this.restartTimer);
        this.restartTimer = null;
    }
    
    if (this.recognition) {
      try {
          this.recognition.stop();
          // Force abort if stop takes too long or fails to trigger onend immediately
          // but usually stop() triggers onend.
      } catch(e) {} 
    }
  }

  public speak(text: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }
}

export const voiceService = new VoiceService();
