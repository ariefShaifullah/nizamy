import React from 'react';
import { SURAH_DATA } from '../../constants.ts';

interface SurahHeaderProps {
    surah: typeof SURAH_DATA[0];
}

export const SurahHeader: React.FC<SurahHeaderProps> = React.memo(({ surah }) => (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-black dark:to-slate-900 rounded-3xl p-8 text-white text-center shadow-xl mb-8 relative overflow-hidden mx-4 mt-6 group">
        {/* Background Pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('/images/pattern.svg')] bg-repeat"></div>
        
        <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-teal-500/30 transition-colors duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 group-hover:bg-indigo-500/30 transition-colors duration-700"></div>
        
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center mb-4 font-bold text-sm font-serif">
                {surah.number}
            </div>
            
            <h2 className="text-4xl font-bold mb-2 tracking-tight">{surah.name}</h2>
            <p className="text-slate-300 text-sm font-medium mb-6 tracking-wide uppercase opacity-80">{surah.arti} • {surah.type}</p>
            
            <div className="inline-flex items-center bg-white/10 px-5 py-2 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
                <span className="text-xs font-bold tracking-wider uppercase">
                    {surah.verses} Ayat
                </span>
            </div>

            {surah.number !== 1 && surah.number !== 9 && (
                <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs">
                    <p className="font-arabic text-3xl md:text-4xl opacity-90 drop-shadow-lg leading-relaxed">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                </div>
            )}
        </div>
    </div>
));