import React from 'react';

export default function BlogHero() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 bg-[url('/images/ornaments.svg')] bg-[length:320px] bg-repeat opacity-[0.03] invert mix-blend-multiply dark:invert-0 dark:opacity-5 dark:mix-blend-screen pointer-events-none [mask-image:linear-gradient(to_bottom,black_10%,transparent_90%)]"
        />
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-900/10 blur-[120px] dark:bg-blue-900/20" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-[calc(7rem+env(safe-area-inset-top))] pb-16 md:pt-[calc(9rem+env(safe-area-inset-top))] md:pb-24">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E3A8A] shadow-sm backdrop-blur dark:border-blue-900/40 dark:bg-[#0F172A]/50 dark:text-blue-300">
            Pustaka Keislaman Digital
          </span>

          <h1 className="mt-6 font-['Lexend'] text-4xl font-black tracking-tight text-[#020617] dark:text-white sm:text-5xl md:text-6xl">
            Telusuri Kumpulan <br className="hidden sm:block" />
            <span>
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
