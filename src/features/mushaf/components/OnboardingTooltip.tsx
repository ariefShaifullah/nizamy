import React from 'react';

interface OnboardingTooltipProps {
    onClose: () => void;
}

/**
 * Non-blocking onboarding tooltip for Mushaf reader.
 * Positioned at bottom of screen to avoid obscuring Quran text.
 */
export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({ onClose }) => (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-tooltip w-full max-w-xs px-4 animate-fade-in-up">
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl relative text-center">
            <div className="font-bold text-sm mb-1">👆 Tips Cepat</div>
            <p className="text-xs text-slate-300 leading-relaxed">
                Tekan <span className="text-teal-400 font-bold">tahan lama</span> pada ayat untuk membuka Kamus, Tafsir, dan Simpan Ayat.
            </p>
            <button
                onClick={onClose}
                className="mt-3 bg-white text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold hover:bg-slate-100 transition-colors"
            >
                Mengerti
            </button>
            {/* Arrow pointing down */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full border-8 border-transparent border-t-slate-900"></div>
        </div>
    </div>
);
