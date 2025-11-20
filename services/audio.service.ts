// Simple Web Audio API Synthesizer to avoid loading external MP3 assets
// This keeps the app lightweight while adding "Game Juice"

let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (
  freq: number,
  type: OscillatorType,
  duration: number,
  startTime: number,
  vol: number = 0.1
) => {
  const ctx = initAudio();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);

  gain.gain.setValueAtTime(vol, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration);
};

export const audioService = {
  playSuccess: () => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Major Chord Arpeggio (C - E - G - C)
    playTone(523.25, "sine", 0.3, now, 0.1); // C5
    playTone(659.25, "sine", 0.3, now + 0.1, 0.1); // E5
    playTone(783.99, "sine", 0.6, now + 0.2, 0.1); // G5
  },

  playSuccessMajor: () => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // High pitch ping
    playTone(880.0, "triangle", 0.5, now, 0.1);
    playTone(1760.0, "sine", 0.8, now + 0.1, 0.05);
  },

  playFail: () => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Gentle descending tone (not harsh)
    playTone(300, "sine", 0.3, now, 0.05);
    playTone(200, "sine", 0.5, now + 0.15, 0.05);
  },

  playBadgeUnlock: () => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Fanfare
    playTone(523.25, "square", 0.2, now, 0.1);
    playTone(523.25, "square", 0.2, now + 0.15, 0.1);
    playTone(523.25, "square", 0.2, now + 0.3, 0.1);
    playTone(783.99, "square", 0.8, now + 0.45, 0.1); // Long G
  },

  playClick: () => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    // Very short, subtle click
    playTone(800, "sine", 0.05, now, 0.02);
  },
};
