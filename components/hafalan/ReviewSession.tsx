import React, { useState, useEffect } from "react";
import type { HafalanItem } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";
import { fetchQuranVerses } from "../../services/hafalan.service.ts";

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

  useEffect(() => {
    setIsLoadingText(true);
    fetchQuranVerses(item.surahNo, item.startAyah, item.endAyah)
      .then((data) => {
        setQuranText(data);
        setIsLoadingText(false);
      })
      .catch(() => setIsLoadingText(false));
  }, [item]);

  return (
    <div className="animate-fade-in min-h-screen flex flex-col md:justify-center md:items-center md:py-8">
      <div className="w-full max-w-5xl md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:shadow-slate-200/70 md:border md:border-slate-100 flex flex-col overflow-hidden relative md:aspect-[1.4/1] md:max-h-[85vh]">
        <div className="flex justify-between items-center py-4 px-4 md:px-8 md:py-6 bg-white md:bg-transparent z-20 relative">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isPractice
                ? "bg-teal-100 text-teal-700"
                : "bg-indigo-100 text-indigo-700"
            }`}
          >
            {isPractice ? "Mode Latihan" : "Mode Hafalan"}
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

        <div className="text-center px-6 pb-2 z-10">
          <h2 className="text-xl md:text-3xl font-bold text-slate-800">
            {item.surahName}
          </h2>
          <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
            Ayat {item.startAyah} - {item.endAyah}
          </p>
        </div>

        <div
          className="flex-1 overflow-y-auto px-6 md:px-12 py-4 md:py-8 flex flex-col relative custom-scrollbar"
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
            <div className="space-y-8 md:space-y-12 w-full max-w-3xl mx-auto my-auto py-8">
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

              {quranText.map((a) => (
                <div key={a.number} className="relative group">
                  <p className="text-3xl md:text-5xl leading-[2.2] md:leading-[2.4] font-arabic text-slate-800 text-center selection:bg-indigo-100 selection:text-indigo-900">
                    {a.text}
                  </p>
                  <div className="flex justify-center mt-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 text-sm md:text-lg border-2 border-slate-200 rounded-full text-slate-400 font-sans bg-white">
                      {a.number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 md:p-8 bg-white md:bg-transparent border-t border-slate-100 md:border-0 z-20 mt-auto">
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
                className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 active:scale-95 transition-all duration-200 group h-28 md:h-32 shadow-sm"
              >
                <span className="text-3xl md:text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">
                  🤔
                </span>
                <span className="font-bold text-lg md:text-xl">Lupa</span>
                <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-60 mt-1">
                  Ulangi Besok
                </span>
              </button>

              <button
                onClick={() => onSubmitReview("success")}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all duration-200 h-28 md:h-32"
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
  );
};
