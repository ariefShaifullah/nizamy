import React from 'react';

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-[#F8FAFC] dark:border-slate-800/60 dark:bg-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:18px_18px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_75%,transparent_100%)]" />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-900/10 blur-[120px] dark:bg-blue-900/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E3A8A] shadow-sm backdrop-blur dark:border-blue-900/40 dark:bg-[#0F172A]/50 dark:text-blue-300">
            Pustaka Keislaman Digital
          </span>

          <h1 className="mt-6 font-['Lexend'] text-4xl font-black tracking-tight text-[#020617] dark:text-white sm:text-5xl md:text-6xl">
            Telusuri Kumpulan <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-[#1E3A8A] to-[#CA8A04] bg-clip-text text-transparent dark:from-blue-400 dark:to-yellow-400">
              Artikel Islami
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl font-['Source_Sans_3'] text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Kajian lengkap seputar faraidh (waris), zakat, hafalan Al-Qur'an, dan ekonomi syariah,
            disajikan dengan navigasi cepat, serta pengalaman membaca yang nyaman.
          </p>
        </div>
      </div>
    </section>
  );
}
