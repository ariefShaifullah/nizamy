import React, { useState, useEffect, useRef } from "react";
import { getAyahAudioUrl } from "../../services/hafalan.service.ts";
import { QORI_LIST } from "../../constants.ts";

interface QuranPlayerProps {
  surahNo: number;
  startAyah: number;
  endAyah: number;
  onHighlight: (ayah: number) => void;
  autoPlay?: boolean;
  jumpToAyah?: number | null; // New Prop for seeking
}

export const QuranPlayer: React.FC<QuranPlayerProps> = ({
  surahNo,
  startAyah,
  endAyah,
  onHighlight,
  autoPlay = false,
  jumpToAyah,
}) => {
  const [currentAyah, setCurrentAyah] = useState(startAyah);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedQori, setSelectedQori] = useState(
    localStorage.getItem("preferredQori") || "Husary_64kbps"
  );
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isBuffering, setIsBuffering] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset player when items change
    setCurrentAyah(startAyah);
    setIsPlaying(autoPlay);
  }, [surahNo, startAyah, endAyah, autoPlay]);

  // Handle Jump/Seek from external click
  useEffect(() => {
    if (jumpToAyah && jumpToAyah >= startAyah && jumpToAyah <= endAyah) {
      setCurrentAyah(jumpToAyah);
      setIsPlaying(true);
    }
  }, [jumpToAyah, startAyah, endAyah]);

  // Effect to handle playback flow
  useEffect(() => {
    if (!audioRef.current) return;

    // Highlighting logic lift-up
    if (isPlaying) {
      onHighlight(currentAyah);
    } else {
      onHighlight(0); // Remove highlight when stopped
    }

    if (isPlaying) {
      const url = getAyahAudioUrl(selectedQori, surahNo, currentAyah);
      // Only reload if src is different to prevent reload on re-render
      // But we must handle the case where currentAyah changed
      const currentSrc = audioRef.current.src;

      if (currentSrc !== url) {
        setIsBuffering(true);
        audioRef.current.src = url;
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.load();

        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsBuffering(false))
            .catch((e) => {
              console.warn("Audio play interrupted", e);
              setIsBuffering(false);
              setIsPlaying(false);
            });
        }
      } else if (audioRef.current.paused) {
        // Resume case
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    } else {
      audioRef.current.pause();
    }
  }, [
    currentAyah,
    isPlaying,
    selectedQori,
    surahNo,
    playbackSpeed,
    onHighlight,
  ]);

  const handleEnded = () => {
    if (currentAyah < endAyah) {
      setCurrentAyah((prev) => prev + 1);
    } else {
      // Sequence finished, loop back to start but pause
      setCurrentAyah(startAyah);
      setIsPlaying(false);
    }
  };

  const handleQoriChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setSelectedQori(newVal);
    localStorage.setItem("preferredQori", newVal);
  };

  const toggleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const nextSpeed =
      speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-slate-100 p-2 md:p-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-30 shadow-sm transition-all">
      <audio
        ref={audioRef}
        onEnded={handleEnded}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          setIsPlaying(false);
          alert("Gagal memuat audio. Periksa koneksi internet.");
        }}
      />

      <div className="flex items-center w-full md:w-auto gap-2">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm flex-shrink-0 ${
            isPlaying
              ? "bg-indigo-100 text-indigo-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isBuffering ? (
            <svg
              className="animate-spin h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-0.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>

        <div className="flex-1 md:w-48">
          <div className="text-xs font-bold text-slate-800 flex justify-between">
            <span>Ayat {currentAyah}</span>
            {isPlaying && (
              <span className="text-indigo-500 animate-pulse text-[10px]">
                Memutar...
              </span>
            )}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentAyah - startAyah) / (endAyah - startAyah + 1)) * 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-50 pt-2 md:pt-0">
        <button
          onClick={toggleSpeed}
          className="px-2 py-1 text-xs font-bold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 min-w-[3rem]"
        >
          {playbackSpeed}x
        </button>

        <select
          value={selectedQori}
          onChange={handleQoriChange}
          className="text-xs border border-slate-200 rounded py-1 px-2 bg-white text-slate-700 outline-none focus:border-indigo-300 w-32 md:w-auto"
        >
          {QORI_LIST.map((q) => (
            <option key={q.id} value={q.id}>
              {q.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
