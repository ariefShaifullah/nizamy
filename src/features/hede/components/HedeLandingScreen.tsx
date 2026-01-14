import React from 'react';
import { FaWallet, FaLightbulb, FaArrowRight } from 'react-icons/fa';

interface HedeLandingScreenProps {
    onStartAudit: () => void;
    onViewFaq: () => void;
}

export const HedeLandingScreen: React.FC<HedeLandingScreenProps> = ({ onStartAudit, onViewFaq }) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-[2.5rem] p-8 md:p-12 text-center shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
            <div className="relative z-raised flex flex-col items-center">
                <div className="w-24 h-24 bg-linear-to-br from-indigo-50 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-3xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 shadow-md border border-white dark:border-slate-700">
                    <div className="icon-wrapper w-12 h-12 flex items-center justify-center text-5xl drop-shadow-sm"><FaWallet /></div>
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white mb-2">Klinik Finansial</h1>
                <p className="font-bold text-purple-600 dark:text-purple-400 text-sm md:text-base uppercase tracking-widest mb-4">Cek Kesehatan Finansial
                </p>
                <p className="hidden md:block text-base md:text-lg font-medium text-slate-500 dark:text-slate-400 mb-12 max-w-2xl leading-relaxed">
                    Cek kesehatan finansial Anda dari Riba, Gharar, & Maysir. Dapatkan roadmap hijrah personal untuk menuju harta yang lebih berkah.
                </p>

                <button onClick={onStartAudit} className="group w-full md:w-auto px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-purple-200/80 dark:shadow-none hover:shadow-2xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3">
                    Mulai Diagnosa
                    <div className="icon-wrapper w-5 h-5 group-hover:translate-x-1 transition-transform flex items-center justify-center"><FaArrowRight /></div>
                </button>

                <div className="flex items-center justify-center gap-4 mt-8 lg:hidden">
                    <button onClick={onViewFaq} className="text-xs font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1.5">
                        <FaLightbulb /> Panduan & FAQ
                    </button>
                </div>

                <p className="mt-6 text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                    🔒 Data diproses 100% lokal di perangkat Anda.
                </p>
            </div>
        </div>
    );
};
