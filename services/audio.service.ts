
// Simple Web Audio API Synthesizer (Singleton Pattern)
// Optimized to prevent "max hardware contexts reached" errors and manage memory better.

// Add Webkit AudioContext definition to Window interface
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

class AudioController {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  constructor() {
    // Lazy initialization is handled in getContext()
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.context) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) {
        this.context = new Ctx();
        // Create a master gain node to control overall volume if needed
        this.masterGain = this.context.createGain();
        this.masterGain.gain.value = 0.5; // Master volume at 50% to prevent clipping
        this.masterGain.connect(this.context.destination);
      }
    }
    return this.context;
  }

  /**
   * Resumes the AudioContext. 
   * Must be called inside a user interaction event (click/touch) for browsers with strict autoplay policies.
   */
  public async resume(): Promise<void> {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      await ctx.resume();
    }
  }

  private playTone(
    freq: number, 
    type: OscillatorType, 
    duration: number, 
    startTime: number, 
    vol: number = 0.1
  ) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    // Envelope to prevent clicking sounds (Attack & Release)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(vol, startTime + 0.01); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Release

    osc.connect(gain);
    gain.connect(this.masterGain); // Connect to master gain instead of destination directly

    osc.start(startTime);
    osc.stop(startTime + duration);
    
    // Garbage collection helper
    osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
    };
  }

  // --- PUBLIC METHODS ---

  public playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.resume(); // Try to resume if needed
    
    const now = ctx.currentTime;
    // Major Chord Arpeggio (C - E - G - C)
    this.playTone(523.25, 'sine', 0.3, now, 0.2);       // C5
    this.playTone(659.25, 'sine', 0.3, now + 0.1, 0.2); // E5
    this.playTone(783.99, 'sine', 0.6, now + 0.2, 0.2); // G5
  }

  public playSuccessMajor() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.resume();

    const now = ctx.currentTime;
    // High pitch ping
    this.playTone(880.00, 'triangle', 0.5, now, 0.1);
    this.playTone(1760.00, 'sine', 0.8, now + 0.1, 0.05);
  }

  public playFail() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.resume();

    const now = ctx.currentTime;
    // Gentle descending tone (not harsh)
    this.playTone(300, 'sine', 0.3, now, 0.1);
    this.playTone(200, 'sine', 0.5, now + 0.15, 0.1);
  }

  public playBadgeUnlock() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.resume();

    const now = ctx.currentTime;
    // Fanfare
    this.playTone(523.25, 'square', 0.2, now, 0.1);
    this.playTone(523.25, 'square', 0.2, now + 0.15, 0.1);
    this.playTone(523.25, 'square', 0.2, now + 0.30, 0.1);
    this.playTone(783.99, 'square', 0.8, now + 0.45, 0.1); // Long G
  }

  public playClick() {
    const ctx = this.getContext();
    if (!ctx) return;
    this.resume(); // Essential for mobile Safari tap response

    const now = ctx.currentTime;
    // Very short, subtle click
    this.playTone(800, 'sine', 0.05, now, 0.05);
  }
}

export const audioService = new AudioController();
