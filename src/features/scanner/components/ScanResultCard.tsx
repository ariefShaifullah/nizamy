
import React from 'react';
import type { ScanResult } from '../../../types.ts';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaQuestionCircle,
  FaRedo,
  FaInfoCircle,
  FaFingerprint,
} from "react-icons/fa";

interface ScanResultCardProps {
  result: ScanResult;
  onReset: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onReset }) => {
  // Configuration based on status - High Contrast & A11y
  const config = {
    halal: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      bgSoft: "bg-white/95 dark:bg-slate-900/95",
      accentColor: "text-emerald-500",
      icon: <FaCheckCircle />,
      label: "Insya Allah Halal",
    },
    syubhat: {
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-800",
      bgSoft: "bg-white/95 dark:bg-slate-900/95",
      accentColor: "text-amber-500",
      icon: <FaExclamationTriangle />,
      label: "Syubhat (Hati-hati)",
    },
    haram: {
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-800",
      bgSoft: "bg-white/95 dark:bg-slate-900/95",
      accentColor: "text-red-500",
      icon: <FaTimesCircle />,
      label: "Terindikasi Haram",
    },
    unknown: {
      color: "bg-slate-500",
      textColor: "text-slate-700 dark:text-slate-400",
      borderColor: "border-slate-200 dark:border-slate-700",
      bgSoft: "bg-white/95 dark:bg-slate-900/95",
      accentColor: "text-slate-500",
      icon: <FaQuestionCircle />,
      label: "Hasil Tidak Jelas",
    },
  }[result.status];

  const criticalIngredients = result.ingredients.filter(
    (i) => i.status === "critical",
  );
  const warningIngredients = result.ingredients.filter(
    (i) => i.status === "warning",
  );

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in px-2">
      {/* World-Class Certificate Header */}
      <div
        className={`relative overflow-hidden rounded-3xl shadow-2xl ${config.bgSoft} border-2 ${config.borderColor} text-center p-8 backdrop-blur-2xl transition-colors duration-500`}
      >
        {/* Decorative Pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Background Large Icon */}
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none text-slate-900 dark:text-white">
          <div className="w-32 h-32 flex items-center justify-center text-8xl rotate-12">
            {config.icon}
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={`mx-auto w-20 h-20 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl ${config.color} rotate-3 animate-fade-in-down`}
        >
          <div className="icon-wrapper w-10 h-10 flex items-center justify-center text-4xl">
            {config.icon}
          </div>
        </div>

        <h2
          className={`text-2xl font-black ${config.textColor} mb-1 uppercase tracking-tight`}
        >
          {config.label}
        </h2>

        <p className="text-slate-900 dark:text-white font-black text-xl mb-6 leading-tight">
          {result.productName || "Analisa Selesai"}
        </p>

        {/* Reasoning Box */}
        <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed text-justify shadow-inner border border-slate-200/50 dark:border-white/5 italic relative">
          <span className="absolute -top-3 left-4 bg-white dark:bg-slate-700 px-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border border-slate-100 dark:border-slate-800 rounded">
            AI Reasoning
          </span>
          "{result.reasoning}"
        </div>

        {/* Logos List */}
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {result.detectedLogos.length > 0
            ? result.detectedLogos.map((logo, idx) => (
              <span
                key={idx}
                className="px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm flex items-center gap-2"
              >
                <span className="icon-wrapper w-3 h-3 flex items-center justify-center">
                  <FaCheckCircle />
                </span>
                Logo {logo} Terdeteksi
              </span>
            ))
            : result.status !== "unknown" && (
              <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <span className="icon-wrapper w-3 h-3 flex items-center justify-center">
                  <FaInfoCircle />
                </span>
                Logo Halal Fisik Tidak Terdeteksi
              </span>
            )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${result.confidence === "High" ? "bg-emerald-500" : result.confidence === "Medium" ? "bg-amber-500" : "bg-red-500"} animate-pulse`}
          ></div>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Akurasi AI: {result.confidence}
          </span>
        </div>
      </div>

      {/* Analysis Detail Box */}
      {(criticalIngredients.length > 0 || warningIngredients.length > 0) && (
        <div className="mt-6 bg-white/95 dark:bg-slate-900/95 rounded-3xl border-2 border-slate-100 dark:border-slate-800 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400">
              <span className="icon-wrapper w-4 h-4 flex items-center justify-center">
                <FaFingerprint />
              </span>
            </div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wider">
              Bedah Komposisi
            </h3>
          </div>

          <div className="space-y-3">
            {criticalIngredients.map((item, idx) => (
              <div
                key={`crit-${idx}`}
                className="flex justify-between items-center p-4 bg-red-50/80 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-red-700 dark:text-red-400 text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-red-600/70 dark:text-red-400/60 font-medium leading-tight mt-0.5">
                    {item.reason || "Bahan terlarang"}
                  </p>
                </div>
                <span className="icon-wrapper w-5 h-5 text-red-500 shrink-0 ml-3 flex items-center justify-center">
                  <FaTimesCircle />
                </span>
              </div>
            ))}
            {warningIngredients.map((item, idx) => (
              <div
                key={`warn-${idx}`}
                className="flex justify-between items-center p-4 bg-amber-50/80 dark:bg-amber-950/30 rounded-2xl border border-amber-100 dark:border-amber-900/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-amber-700 dark:text-amber-400 text-sm truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-amber-600/70 dark:text-amber-400/60 font-medium leading-tight mt-0.5">
                    {item.reason || "Sumber perlu dipastikan"}
                  </p>
                </div>
                <span className="icon-wrapper w-5 h-5 text-amber-500 shrink-0 ml-3 flex items-center justify-center">
                  <FaExclamationTriangle />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-10 flex flex-col items-center gap-4">
        <button
          onClick={onReset}
          className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-3xl font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-3 group border border-white/10"
        >
          <span className="icon-wrapper w-5 h-5 flex items-center justify-center group-hover:rotate-180 transition-transform duration-700">
            <FaRedo />
          </span>
          PINDAI ULANG
        </button>
        <div className="flex items-center gap-4 text-slate-400/50">
          <span className="w-12 h-px bg-slate-200 dark:bg-slate-800"></span>
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">
            NIZAMY AI LABS
          </p>
          <span className="w-12 h-px bg-slate-200 dark:bg-slate-800"></span>
        </div>
      </div>
    </div>
  );
};
