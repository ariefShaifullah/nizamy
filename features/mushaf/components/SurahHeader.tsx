
import React from 'react';
import { SURAH_DATA } from '../../../constants.ts';

interface SurahHeaderProps {
    surah: typeof SURAH_DATA[0];
}

export const SurahHeader: React.FC<SurahHeaderProps> = React.memo(({ surah }) => (
    <div className="mx-4 mt-6 mb-8 relative group">
        {/* Glow Effect Behind */}
        <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-3xl transform scale-90 translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-[2rem] p-8 text-white text-center shadow-2xl overflow-hidden border border-white/10">
            
            {/* Decorative Islamic Pattern Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
            </div>
            
            {/* Ambient Orbs */}
            <div className="absolute top-[-50%] left-[-20%] w-96 h-96 bg-teal-500/20 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-50%] right-[-20%] w-96 h-96 bg-emerald-600/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Surah Badge */}
                <div className="w-14 h-14 mb-5 relative flex items-center justify-center">
                    <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
                    <div className="absolute inset-1 border border-emerald-400/50 rounded-full"></div>
                    <span className="font-serif font-bold text-lg text-emerald-400">{surah.number}</span>
                </div>
                
                {/* Title */}
                <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight drop-shadow-sm bg-clip-text text-transparent bg-gradient-to-b from-white to-emerald-100">
                    {surah.name}
                </h2>
                
                {/* Subtitle */}
                <div className="flex items-center gap-2 text-emerald-200/80 text-sm font-medium mb-6 uppercase tracking-widest">
                    <span>{surah.arti}</span>
                    <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                    <span>{surah.type}</span>
                </div>
                
                {/* Stats Pill */}
                <div className="inline-flex items-center bg-white/5 border border-white/10 px-6 py-2 rounded-full backdrop-blur-md shadow-inner">
                    <span className="text-xs font-bold text-emerald-100 tracking-wide">
                        {surah.verses} AYAT
                    </span>
                </div>

                {/* Bismillah */}
                {surah.number !== 1 && surah.number !== 9 && (
                    <div className="mt-10 pt-8 border-t border-white/10 w-full max-w-xs mx-auto">
                        <p className="font-arabic text-3xl md:text-4xl text-emerald-50 opacity-90 drop-shadow-md leading-loose">
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
));
