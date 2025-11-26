
import React, { useState, useEffect } from "react";
import type { HafalanItem } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";
import { fetchQuranVerses } from "../../services/hafalan.service.ts";
import { QuranPlayer } from "./QuranPlayer.tsx";
import { useWakeLock } from "../../hooks/useWakeLock.ts";
import { FaHandPaper, FaTimes } from "react-icons/fa";

interface ReviewSessionProps {
  item: HafalanItem;
  isPractice: boolean;
  onExit: () => void;
  onCompletePractice: () => void;
  onSubmitReview: (result: "success" | "fail") => void;
}

export const ReviewSession: React.FC<ReviewSessionProps> = ({
  item,
  isPractice,
  onExit,
  onCompletePractice,
  onSubmitReview,
}) => {
  const [quranText, setQuranText] = useState<
    { text: string; number: number }[]
  >([]);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeAudioAyah, setActiveAudioAyah] = useState<number>(0);
  const [showPlayer, setShowPlayer] = useState(isPractice);
  const [manualJumpAyah, setManualJumpAyah] = useState<number | null>(null);
  
  const { requestLock, releaseLock } = useWakeLock();

  const loadVerses = () => {
    setIsLoadingText(true);
    setError(null);
    fetchQuranVerses(item.surahNo, item.startAyah, item.endAyah)
      .then((data) => {
        if (data.length === 0) {
            setError("Gagal memuat ayat. Periksa koneksi internet.");
        } else {
            setQuranText(data);
        }
        setIsLoadingText(false);
      })
      .catch(() => {
        setError("Terjadi kesalahan saat menghubungi server.");
        setIsLoadingText(false);
      });
  };

  useEffect(() => {
    loadVerses();
  }, [item]);

  useEffect(() => {
    if (activeAudioAyah > 0) {
        const element = document.getElementById(`ayah-${activeAudioAyah}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [activeAudioAyah]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    requestLock();
    return () => {
      document.body.style.overflow = originalStyle;
      releaseLock();
    };
  }, [requestLock, releaseLock]);

  const handleAyahClick = (ayahNumber: number) => {
    if (isPractice) {
      if (!showPlayer) setShowPlayer(true);
      triggerJump(ayahNumber);
    } else {
      if (showPlayer) {
        triggerJump(ayahNumber);
      }
    }
  };

  const triggerJump = (ayahNumber: number) => {
    setManualJumpAyah(ayahNumber);
    setTimeout(() => setManualJumpAyah(null), 500);
  };

  return (
    <div className="animate-fade-in">
      <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col h-[100dvh] md:static md:h-auto md:bg-transparent md:z-auto md:block md:inset-auto">
        <div className="w-full h-full flex flex-col md:max-w-5xl md:mx-auto md:bg-white md:dark:bg-slate-900 md:rounded-[2.5rem] md:shadow-2xl md:shadow-slate-200/70 md:dark:shadow-none md:border md:border-slate-100 md:dark:border-slate-800 md:overflow-hidden md:relative md:min-h-[600px] md:h-[85vh]">
          
          <div className="flex-none bg-white dark:bg-slate-900 z-20 relative shadow-sm border-b border-slate-100 dark:border-slate-800 pt-[env(safe-area-inset-top)]">
            <div className="flex justify-between items-center py-3 px-4 md:py-4 md:px-8 border-b border-slate-50 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isPractice
                      ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                      : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  }`}
                >
                  {isPractice ? "Mode Latihan" : "Mode Hafalan"}
                </div>

                {!isPractice && !showPlayer && !error && !isLoadingText && (
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setShowPlayer(true);
                    }}
                    className="bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full transition-colors flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                  >
                    <span className="icon-wrapper w-3 h-3"><FaHandPaper /></span>
                    <span className="text-xs font-medium">Bantu Saya</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  audioService.playClick();
                  onExit();
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors flex items-center text-sm font-medium"
              >
                Keluar
                <span className="icon-wrapper w-4 h-4 ml-1"><FaTimes /></span>
              </button>
            </div>

            <div className="text-center px-6 py-3">
              <h2 className="text-xl md:text-3xl font-bold text-slate-800 dark:text-white">
                {item.surahName}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base mt-1 font-medium">
                Ayat {item.startAyah} - {item.endAyah}
              </p>
            </div>

            {showPlayer && !error && !isLoadingText && (
              <div className="mx-4 md:mx-12 mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm animate-fade-in-down bg-slate-50 dark:bg-slate-800">
                <QuranPlayer
                  surahNo={item.surahNo}
                  startAyah={item.startAyah}
                  endAyah={item.endAyah}
                  onHighlight={setActiveAudioAyah}
                  autoPlay={isPractice}
                  jumpToAyah={manualJumpAyah}
                />
              </div>
            )}
          </div>

          <div
            className="flex-1 overflow-y-auto px-4 md:px-12 py-6 flex flex-col relative custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30 w-full"
            dir="rtl"
          >
            {isLoadingText ? (
              <div className="flex flex-col items-center my-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">
                  Memuat Ayat...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center my-auto text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-800 max-w-sm mx-auto">
                <div className="text-4xl mb-4">📡</div>
                <h3 className="font-bold text-red-700 dark:text-red-300 text-lg mb-2">Gagal Memuat Data</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mb-6">{error}</p>
                <button 
                    onClick={() => {
                        audioService.playClick();
                        loadVerses();
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md"
                >
                    Coba Lagi
                </button>
              </div>
            ) : (
              <div className="space-y-8 w-full max-w-3xl mx-auto my-auto pb-8">
                {item.startAyah === 1 && item.surahNo !== 1 && item.surahNo !== 9 && (
                    <div className="text-center mb-10">
                      <span className="font-arabic text-2xl md:text-4xl text-slate-500 dark:text-slate-400 block mb-4">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </span>
                      <div className="w-16 h-0.5 bg-slate-200 dark:bg-slate-700 mx-auto"></div>
                    </div>
                )}

                {quranText.map((a) => {
                  const isActive = activeAudioAyah === a.number;
                  const isClickable = isPractice || showPlayer;

                  return (
                    <div
                      key={a.number}
                      id={`ayah-${a.number}`}
                      onClick={() => handleAyahClick(a.number)}
                      className={`relative group transition-all duration-300 rounded-2xl p-4 ${
                        isClickable
                          ? "cursor-pointer hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm"
                          : "cursor-default"
                      } ${
                        isActive ? "bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-100 dark:ring-indigo-800 shadow-sm scale-[1.01]" : ""
                      }`}
                    >
                      <p
                        className={`text-3xl md:text-5xl leading-[2.2] md:leading-[2.4] font-arabic text-center selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors ${
                          isActive ? "text-indigo-900 dark:text-indigo-200" : "text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        {a.text}
                      </p>
                      <div className="flex justify-center mt-4 items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 text-sm md:text-lg border-2 rounded-full font-sans transition-colors ${
                            isActive
                              ? "border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 bg-white dark:bg-slate-800"
                              : "border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-transparent"
                          }`}
                        >
                          {a.number}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex-none p-4 md:p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] pb-safe">
             {error || isLoadingText ? (
                 <button
                    disabled
                    className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold rounded-2xl cursor-not-allowed text-lg"
                  >
                    Memuat Data...
                  </button>
             ) : isPractice ? (
              <button
                onClick={() => {
                  audioService.playClick();
                  onCompletePractice();
                }}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-200 dark:shadow-none active:scale-95 transition-all text-lg"
              >
                Selesai Membaca
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
                <button
                  onClick={() => onSubmitReview("fail")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800 hover:text-orange-700 dark:hover:text-orange-400 active:scale-95 transition-all duration-200 group h-24 md:h-32 shadow-sm"
                >
                  <span className="text-3xl md:text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">
                    🤔
                  </span>
                  <span className="font-bold text-lg md:text-xl">
                    Lupa / Salah
                  </span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-60 mt-1">
                    Ulangi Besok
                  </span>
                </button>

                <button
                  onClick={() => onSubmitReview("success")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all duration-200 h-24 md:h-32"
                >
                  <span className="text-3xl md:text-4xl mb-2">✨</span>
                  <span className="font-bold text-lg md:text-xl">Lancar</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-80 mt-1">
                    + XP Bonus
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};