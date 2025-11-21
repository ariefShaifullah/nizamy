import React, { useState, useEffect } from "react";
import type { HafalanItem } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";
import { fetchQuranVerses } from "../../services/hafalan.service.ts";
import { QuranPlayer } from "./QuranPlayer.tsx";

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

  // Audio State
  const [activeAudioAyah, setActiveAudioAyah] = useState<number>(0);
  const [showPlayer, setShowPlayer] = useState(isPractice); // Auto-show in practice
  const [manualJumpAyah, setManualJumpAyah] = useState<number | null>(null); // For click-to-play

  useEffect(() => {
    setIsLoadingText(true);
    fetchQuranVerses(item.surahNo, item.startAyah, item.endAyah)
      .then((data) => {
        setQuranText(data);
        setIsLoadingText(false);
      })
      .catch(() => setIsLoadingText(false));
  }, [item]);

  // Lock body scroll when session is active (Mobile only behavior mostly)
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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
      {/* 
        MOBILE: Fixed Fullscreen Overlay (Focus Mode). 
        Using h-[100dvh] ensures it fits mobile viewports with address bars correctly.
        z-[100] ensures it sits above everything (headers, bottom navs).
      */}
      <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col h-[100dvh] md:static md:h-auto md:bg-transparent md:z-auto md:block md:inset-auto">
        {/* 
          DESKTOP CARD CONTAINER 
          On mobile, these classes effectively do nothing because we use the inner flex structure.
          On desktop, this acts as the card wrapper.
        */}
        <div className="w-full h-full flex flex-col md:max-w-5xl md:mx-auto md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:shadow-slate-200/70 md:border md:border-slate-100 md:overflow-hidden md:relative md:min-h-[600px] md:h-[85vh]">
          {/* 1. HEADER SECTION (Fixed/Docked) */}
          <div className="flex-none bg-white z-20 relative shadow-sm border-b border-slate-100">
            {/* Navigation Header */}
            <div className="flex justify-between items-center py-3 px-4 md:py-4 md:px-8 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    isPractice
                      ? "bg-teal-100 text-teal-700"
                      : "bg-indigo-100 text-indigo-700"
                  }`}
                >
                  {isPractice ? "Mode Latihan" : "Mode Hafalan"}
                </div>

                {!isPractice && !showPlayer && (
                  <button
                    onClick={() => {
                      audioService.playClick();
                      setShowPlayer(true);
                    }}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-500 px-2 py-1 rounded-full transition-colors flex items-center gap-1 border border-slate-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs font-medium">Bantu Saya</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  audioService.playClick();
                  onExit();
                }}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors flex items-center text-sm font-medium"
              >
                Keluar
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Title Info */}
            <div className="text-center px-6 py-3">
              <h2 className="text-xl md:text-3xl font-bold text-slate-800">
                {item.surahName}
              </h2>
              <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
                Ayat {item.startAyah} - {item.endAyah}
              </p>
            </div>

            {/* Audio Player */}
            {showPlayer && (
              <div className="mx-4 md:mx-12 mb-3 rounded-xl overflow-hidden border border-slate-200 shadow-sm animate-fade-in-down bg-slate-50">
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

          {/* 2. CONTENT SECTION (Scrollable) */}
          <div
            className="flex-1 overflow-y-auto px-4 md:px-12 py-6 flex flex-col relative custom-scrollbar bg-slate-50/30 w-full"
            dir="rtl"
          >
            {isLoadingText ? (
              <div className="flex flex-col items-center my-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">
                  Memuat Ayat...
                </p>
              </div>
            ) : (
              <div className="space-y-8 w-full max-w-3xl mx-auto my-auto pb-8">
                {item.startAyah === 1 &&
                  item.surahNo !== 1 &&
                  item.surahNo !== 9 && (
                    <div className="text-center mb-10">
                      <span className="font-arabic text-2xl md:text-4xl text-slate-500 block mb-4">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </span>
                      <div className="w-16 h-0.5 bg-slate-200 mx-auto"></div>
                    </div>
                  )}

                {quranText.map((a) => {
                  const isActive = activeAudioAyah === a.number;
                  const isClickable = isPractice || showPlayer;

                  return (
                    <div
                      key={a.number}
                      onClick={() => handleAyahClick(a.number)}
                      className={`relative group transition-all duration-300 rounded-2xl p-4 ${
                        isClickable
                          ? "cursor-pointer hover:bg-white hover:shadow-sm"
                          : "cursor-default"
                      } ${
                        isActive
                          ? "bg-indigo-50 ring-1 ring-indigo-100 shadow-sm"
                          : ""
                      }`}
                    >
                      <p
                        className={`text-3xl md:text-5xl leading-[2.2] md:leading-[2.4] font-arabic text-center selection:bg-indigo-100 selection:text-indigo-900 transition-colors ${
                          isActive ? "text-indigo-900" : "text-slate-800"
                        }`}
                      >
                        {a.text}
                      </p>
                      <div className="flex justify-center mt-4 items-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 text-sm md:text-lg border-2 rounded-full font-sans bg-white transition-colors ${
                            isActive
                              ? "border-indigo-300 text-indigo-600"
                              : "border-slate-200 text-slate-400"
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

          {/* 3. FOOTER SECTION (Fixed) */}
          <div className="flex-none p-4 md:p-8 bg-white border-t border-slate-100 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.02)] pb-safe">
            {isPractice ? (
              <button
                onClick={() => {
                  audioService.playClick();
                  onCompletePractice();
                }}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-200 active:scale-95 transition-all text-lg"
              >
                Selesai Membaca
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
                <button
                  onClick={() => onSubmitReview("fail")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 active:scale-95 transition-all duration-200 group h-24 md:h-32 shadow-sm"
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
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all duration-200 h-24 md:h-32"
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
