
import React from 'react';
import type { ScanResult } from '../../../types.ts';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaQuestionCircle, FaRedo, FaInfoCircle } from 'react-icons/fa';

interface ScanResultCardProps {
    result: ScanResult;
    onReset: () => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onReset }) => {
  // Enhanced Config with Dark Mode Support
  const config = {
    halal: {
      color: "bg-emerald-500",
      textColor: "text-emerald-700 dark:text-emerald-400",
      borderColor: "border-emerald-200 dark:border-emerald-900/50",
      bgSoft: "bg-emerald-50 dark:bg-emerald-950/40",
      icon: <FaCheckCircle size={48} />,
      label: "Insya Allah Halal",
    },
    syubhat: {
      color: "bg-amber-500",
      textColor: "text-amber-700 dark:text-amber-400",
      borderColor: "border-amber-200 dark:border-amber-900/50",
      bgSoft: "bg-amber-50 dark:bg-amber-950/40",
      icon: <FaExclamationTriangle size={48} />,
      label: "Syubhat (Hati-hati)",
    },
    haram: {
      color: "bg-red-500",
      textColor: "text-red-700 dark:text-red-400",
      borderColor: "border-red-200 dark:border-red-900/50",
      bgSoft: "bg-red-50 dark:bg-red-950/40",
      icon: <FaTimesCircle size={48} />,
      label: "Terindikasi Haram",
    },
    unknown: {
      color: "bg-slate-500",
      textColor: "text-slate-700 dark:text-slate-400",
      borderColor: "border-slate-200 dark:border-slate-800",
      bgSoft: "bg-slate-50 dark:bg-slate-900/40",
      icon: <FaQuestionCircle size={48} />,
      label: "Data Kurang",
    },
  }[result.status];

  const criticalIngredients = result.ingredients.filter(
    (i) => i.status === "critical",
  );
  const warningIngredients = result.ingredients.filter(
    (i) => i.status === "warning",
  );

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in-up">
      {/* Status Card */}
      <div
        className={`relative overflow-hidden rounded-3xl shadow-xl ${config.bgSoft} border ${config.borderColor} text-center p-8 backdrop-blur-md`}
      >
        <div className="absolute top-0 inset-x-0 h-2 bg-linear-to-r from-transparent via-white/20 dark:via-white/5 to-transparent opacity-50"></div>

        <div
          className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center text-white mb-4 shadow-lg ${config.color}`}
        >
          {config.icon}
        </div>

        <h2
          className={`text-2xl font-black ${config.textColor} mb-1 uppercase tracking-tight`}
        >
          {config.label}
        </h2>

        <p className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-4">
          {result.productName || "Produk Tidak Dikenal"}
        </p>

        <div className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed backdrop-blur-sm border border-black/5 dark:border-white/5">
          {result.reasoning}
        </div>

        {result.detectedLogos.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {result.detectedLogos.map((logo, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1"
              >
                <FaCheckCircle size={10} /> Logo {logo}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ingredient Warning Details */}
      {(criticalIngredients.length > 0 || warningIngredients.length > 0) && (
        <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 text-sm flex items-center gap-2">
            <div className="text-slate-400">
              <FaInfoCircle />
            </div>{" "}
            Komposisi Perlu Perhatian
          </h3>
          <div className="space-y-2">
            {criticalIngredients.map((item, idx) => (
              <div
                key={`crit-${idx}`}
                className="flex justify-between items-start text-xs p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/50"
              >
                <span className="font-bold text-red-700 dark:text-red-300">
                  {item.name}
                </span>
                <span className="text-red-600/70 dark:text-red-400/70 italic text-[10px] text-right ml-2">
                  {item.reason || "Haram"}
                </span>
              </div>
            ))}
            {warningIngredients.map((item, idx) => (
              <div
                key={`warn-${idx}`}
                className="flex justify-between items-start text-xs p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50"
              >
                <span className="font-bold text-amber-700 dark:text-amber-300">
                  {item.name}
                </span>
                <span className="text-amber-600/70 dark:text-amber-400/70 italic text-[10px] text-right ml-2">
                  {item.reason || "Syubhat"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 text-center">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
          *Hasil ini adalah analisis AI berdasarkan teks/visual.{" "}
          <strong>Bukan fatwa resmi.</strong> Selalu verifikasi logo halal fisik
          pada kemasan produk.
        </p>
      </div>

      {/* Action */}
      <button
        onClick={onReset}
        className="mt-8 w-full py-4 bg-slate-900 dark:bg-indigo-600 text-white dark:text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-2"
      >
        <FaRedo /> Scan Lagi
      </button>
    </div>
  );
};;
