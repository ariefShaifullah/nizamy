
import React from 'react';
import { SURAH_DATA } from '../../../constants.ts';
import { FaCertificate, FaMosque } from 'react-icons/fa';

interface SurahHeaderProps {
    surah: typeof SURAH_DATA[0];
}

export const SurahHeader: React.FC<SurahHeaderProps> = React.memo(({ surah }) => (
  <div className="mx-4 mt-6 mb-8 relative group">
    {/* Glow Effect Behind */}
    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-3xl transform scale-90 translate-y-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

    <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-[2.5rem] p-8 text-white text-center shadow-2xl overflow-hidden border border-white/10">
      {/* Background Decoration: Large Icon Pattern */}
      {/* Fixed color (text-white/5) to ensure visibility on the dark gradient background regardless of Light/Dark mode */}
      <div className="absolute -left-10 -bottom-10 text-white/5 pointer-events-none transform rotate-12">
        <FaMosque size={200} />
      </div>

      {/* Ambient Orbs */}
      <div className="absolute top-[-50%] right-[-20%] w-96 h-96 bg-teal-500/20 rounded-full blur-[80px]"></div>

      <div className="relative z-raised flex flex-col items-center">
        {/* Surah Badge (Rub el Hizb Style using FaCertificate) */}
        <div className="w-16 h-16 mb-4 relative flex items-center justify-center text-emerald-400">
          <div className="w-full h-full drop-shadow-lg">
            <FaCertificate size="100%" />
          </div>
          <span className="absolute inset-0 flex items-center justify-center font-serif font-bold text-xl text-slate-900 pt-1">
            {surah.number}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight drop-shadow-sm bg-clip-text text-transparent bg-linear-to-b from-white to-emerald-100">
          {surah.name}
        </h2>

        {/* Subtitle */}
        <div className="flex items-center gap-3 text-emerald-200/90 text-sm font-bold mb-6 uppercase tracking-widest">
          <span>{surah.arti}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>{surah.type}</span>
        </div>

        {/* Stats Pill */}
        <div className="inline-flex items-center bg-white/10 border border-white/10 px-5 py-1.5 rounded-full backdrop-blur-md shadow-inner">
          <span className="text-xs font-bold text-emerald-50 tracking-wide">
            {surah.verses} AYAT
          </span>
        </div>

        {/* Bismillah */}
        {surah.number !== 1 && surah.number !== 9 && (
          <div className="mt-10 pt-8 border-t border-white/10 w-full max-w-xs mx-auto">
            <p
              className="font-arabic text-3xl md:text-4xl text-emerald-50 opacity-90 drop-shadow-md leading-loose"
              style={{ fontFamily: '"Amiri", serif' }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
));
