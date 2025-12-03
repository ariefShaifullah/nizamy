
import { 
  IWindow, 
  ISpeechRecognition, 
  SpeechRecognitionEvent, 
  SpeechRecognitionErrorEvent 
} from '../types.ts';

class VoiceService {
  private recognition: ISpeechRecognition | null = null;
  private isSupported: boolean = false;
  
  // Flag: Apakah stop dilakukan manual oleh user (tombol X) atau sistem?
  private manualStop: boolean = false; 
  
  // State untuk menangani iOS Quirk (Final result missing)
  private lastInterimTranscript: string = '';
  private hasSentFinal: boolean = false;
  
  // Callbacks
  private onResultCallback: ((text: string, isFinal: boolean) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  
  // Timers
  private restartTimer: ReturnType<typeof setTimeout> | null = null; // Untuk auto-restart jika error
  private silenceTimer: ReturnType<typeof setTimeout> | null = null; // Untuk mendeteksi kapan user selesai bicara
  
  // Konstanta Waktu Hening (2 Detik)
  // Jika tidak ada suara selama 2 detik, anggap selesai bicara.
  private readonly SILENCE_DURATION = 2000; 

  constructor() {
    if (typeof window !== 'undefined') {
      const win = window as unknown as IWindow;
      const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'id-ID';
        this.recognition.continuous = false; // False agar lebih akurat per command
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
      if (this.restartTimer) clearTimeout(this.restartTimer);
      // Mulai timer hening saat mic nyala
      this.resetSilenceTimer();
    };

    this.recognition.onresult = (event: Event) => {
      // Cast event ke tipe yang benar
      const speechEvent = event as SpeechRecognitionEvent;
      
      // User sedang bicara, reset timer hening
      this.resetSilenceTimer();

      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = speechEvent.resultIndex; i < speechEvent.results.length; ++i) {
        if (speechEvent.results[i].isFinal) {
          finalTranscript += speechEvent.results[i][0].transcript;
        } else {
          interimTranscript += speechEvent.results[i][0].transcript;
        }
      }

      // Update state tracking
      if (finalTranscript) {
          this.hasSentFinal = true;
          this.lastInterimTranscript = ''; 
          if (this.silenceTimer) clearTimeout(this.silenceTimer); // Clear timer jika sudah final native
      } else {
          this.lastInterimTranscript = interimTranscript;
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
      // Note: 'any' digunakan di sini karena ErrorEvent browser sedikit berbeda antar vendor
      // tapi kita cast ke SpeechRecognitionErrorEvent untuk akses properti .error
      const errorEvent = event as SpeechRecognitionErrorEvent;
      
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      if (errorEvent.error === 'no-speech' || errorEvent.error === 'network') {
          return; 
      }
      if (errorEvent.error === 'aborted') return;
      
      console.warn("Speech API Error:", errorEvent.error);
      if (this.onErrorCallback) this.onErrorCallback(errorEvent.error);
    };

    this.recognition.onend = () => {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);

      // --- IOS & SILENCE FALLBACK LOGIC ---
      // Jika sesi mati (karena silence timer kita atau native), 
      // tapi belum kirim hasil final, paksa kirim hasil interim terakhir.
      if (!this.manualStop && !this.hasSentFinal && this.lastInterimTranscript && this.onResultCallback) {
          this.onResultCallback(this.lastInterimTranscript, true);
          this.lastInterimTranscript = ''; 
          this.hasSentFinal = true; 
          
          if (this.onEndCallback) this.onEndCallback();
          return; 
      }

      if (this.manualStop) {
          if (this.onEndCallback) this.onEndCallback();
      } else {
          // Auto restart mechanism (Phoenix Protocol)
          if (this.restartTimer) clearTimeout(this.restartTimer);
          this.restartTimer = setTimeout(() => {
              try {
                  if (!this.manualStop && this.recognition) {
                      this.recognition.start();
                  }
              } catch (e) {}
          }, 100);
      }
    };
  }

  // Helper untuk reset timer hening
  private resetSilenceTimer() {
      if (this.silenceTimer) clearTimeout(this.silenceTimer);
      
      this.silenceTimer = setTimeout(() => {
          // Panggil stop() secara manual. Ini akan memicu 'onend'.
          if (this.recognition) {
              try {
                  this.recognition.stop(); 
              } catch(e) {}
          }
      }, this.SILENCE_DURATION);
  }

  public checkSupport(): boolean {
    return this.isSupported;
  }

  public start(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ) {
    if (!this.isSupported || !this.recognition) return;
    
    this.manualStop = false;
    this.hasSentFinal = false;
    this.lastInterimTranscript = '';
    
    this.onResultCallback = onResult;
    this.onErrorCallback = onError;
    this.onEndCallback = onEnd;

    try {
        this.recognition.abort();
    } catch(e) {}

    setTimeout(() => {
        try {
          this.recognition?.start();
        } catch(e) {
           console.debug("Start overlap ignored");
        }
    }, 50);
  }

  public stop() {
    this.manualStop = true; 
    
    if (this.restartTimer) {
        clearTimeout(this.restartTimer);
        this.restartTimer = null;
    }
    
    if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
    }
    
    if (this.recognition) {
      try {
          this.recognition.stop();
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
