import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { usePWA } from '../../hooks/usePWA.ts';
import { IOSInstallModal } from '../../features/settings/components/IOSInstallModal.tsx';
import { PrayerWidget } from '../../features/prayer/components/PrayerWidget.tsx';
import { SURAH_DATA } from '../../constants.ts';
import {
  FaBalanceScale,
  FaHandsHelping,
  FaQuran,
  FaBrain,
  FaArrowRight,
  FaDownload,
  FaStethoscope,
  FaTimes,
  FaBookmark,
  FaFire,
  FaQuoteLeft
} from "react-icons/fa";

// --- UTILS ---
const getGregorianDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- DYNAMIC HADITH DATA ---
const HADITH_DB = {
    morning: [
        { text: "Berpagi-pagilah dalam mencari rezeki, karena sesungguhnya berpagi-pagi itu adalah keberkahan.", narrator: "HR. Ath-Thabrani" },
        { text: "Ya Allah, berkahilah umatku di waktu paginya.", narrator: "HR. Abu Daud" },
        { text: "Barangsiapa mengerjakan shalat Dhuha, niscaya akan dicukupi kebutuhannya di akhir siang.", narrator: "HR. Tirmidzi" }
    ],
    day: [
        { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", narrator: "HR. Ahmad" },
        { text: "Tangan di atas (memberi) lebih baik daripada tangan di bawah (meminta).", narrator: "HR. Bukhari" },
        { text: "Sesungguhnya Allah suka apabila seseorang dari kamu melakukan pekerjaan, ia menekuninya.", narrator: "HR. Al-Baihaqi" }
    ],
    afternoon: [
        { text: "Barangsiapa yang tidak menyayangi, maka tidak akan disayangi.", narrator: "HR. Al-Bukhari" },
        { text: "Senyummu di hadapan saudaramu adalah sedekah bagimu.", narrator: "HR. Tirmidzi" },
        { text: "Bertaqwalah kepada Allah di mana saja engkau berada.", narrator: "HR. Tirmidzi" }
    ],
    night: [
        { text: "Dirikanlah shalat malam, karena itu adalah kebiasaan orang-orang saleh sebelum kamu.", narrator: "HR. Tirmidzi" },
        { text: "Dua rakaat fajar (qobliyah subuh) lebih baik daripada dunia dan seisinya.", narrator: "HR. Muslim" },
        { text: "Cukuplah Allah sebagai Penolong kami, dan Allah adalah sebaik-baik Pelindung.", narrator: "HR. Bukhari" }
    ]
};

const getDynamicHadith = () => {
    const hour = new Date().getHours();
    let category: keyof typeof HADITH_DB = 'night';
    
    if (hour >= 4 && hour < 10) category = 'morning';
    else if (hour >= 10 && hour < 15) category = 'day';
    else if (hour >= 15 && hour < 20) category = 'afternoon';
    
    const list = HADITH_DB[category];
    // Pick random daily based on date to keep it somewhat stable per session
    const dateNum = new Date().getDate();
    return list[dateNum % list.length];
};

// --- DYNAMIC DATA HOOKS ---
const useHomeData = () => {
    const [lastRead, setLastRead] = useState<{name: string, ayah: number} | null>(null);
    const [hafalanStats, setHafalanStats] = useState<{level: number, streak: number} | null>(null);

    useEffect(() => {
        // 1. Get Last Read
        try {
            const savedRead = localStorage.getItem('mushaf_lastRead');
            if (savedRead) {
                const parsed = JSON.parse(savedRead);
                const surah = SURAH_DATA.find(s => s.number === parsed.surahId);
                if (surah) {
                    setLastRead({ name: surah.name, ayah: parsed.ayahNumber });
                }
            }
        } catch (e) { console.error(e); }

        // 2. Get Hafalan Stats
        try {
            // Check logged in user first
            const usersStr = localStorage.getItem('nizamy_hafalan_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                if (users.length > 0) {
                    const lastUser = users[users.length - 1]; // Naive latest user
                    const userDataStr = localStorage.getItem(`nizamy_hafalan_data_${lastUser.id}`);
                    if (userDataStr) {
                        const userData = JSON.parse(userDataStr);
                        setHafalanStats({
                            level: userData.gamification.level,
                            streak: userData.gamification.currentStreak
                        });
                    }
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    return { lastRead, hafalanStats };
};

// --- COMPONENTS ---

const BackgroundDecor = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f8fafc] dark:bg-slate-950 transition-colors duration-500">
        <div className="absolute top-0 inset-x-0 h-64 bg-linear-to-b from-indigo-50/80 to-transparent dark:from-indigo-950/20"></div>
        {/* Abstract Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-purple-300/20 dark:bg-purple-900/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[300px] h-[300px] bg-emerald-300/20 dark:bg-emerald-900/10 rounded-full blur-[80px]"></div>
        
        {/* Noise Texture for that "Premium" feel */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>
    </div>
);

const HeaderSection = () => {
    const hadith = useMemo(() => getDynamicHadith(), []);

    return (
        <div className="flex flex-col mb-8 animate-fade-in-down relative">
            {/* Background Quote Icon Decoration */}
            <div className="absolute -right-4 -top-6 text-slate-200 dark:text-slate-800 opacity-50 transform rotate-12 pointer-events-none">
                <FaQuoteLeft size={80} />
            </div>

            <div className="flex items-center gap-2 mb-3 opacity-80">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {getGregorianDate()}
                </span>
            </div>
            
            <div className="relative z-10 pr-4">
                <p className="text-xl md:text-2xl font-serif italic text-slate-800 dark:text-slate-200 leading-relaxed drop-shadow-sm">
                    "{hadith.text}"
                </p>
                <div className="mt-2 flex items-center gap-2">
                    <div className="h-0.5 w-6 bg-indigo-500 rounded-full"></div>
                    <p className="text-xs md:text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                        {hadith.narrator}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- BENTO CARDS ---

const QuranCard = ({ lastRead, onClick }: { lastRead: {name: string, ayah: number} | null, onClick: () => void }) => {
    // Dynamic Font Scaling Logic
    const nameLength = lastRead?.name.length || 0;
    let titleClass = "text-2xl"; // Default for short names (e.g. Yasin, Nuh)
    
    if (nameLength > 15) {
        titleClass = "text-base"; // For very long names (e.g. Al-Mutaffifin)
    } else if (nameLength > 8) {
        titleClass = "text-xl"; // For medium names (e.g. Al-Baqarah)
    }

    return (
        <button 
            onClick={onClick}
            className="group relative w-full h-40 md:h-48 rounded-4xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-xl hover:shadow-teal-500/20"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-linear-to-br from-teal-500 to-emerald-700 dark:from-teal-600 dark:to-emerald-900"></div>
            
            {/* Pattern Decoration */}
            <div className="absolute -right-5 -bottom-10 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <FaQuran size={140} />
            </div>

            {/* Content */}
            <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-lg">
                        <FaQuran />
                    </div>
                    <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-center ">Mushaf</span>
                    </div>
                </div>

                <div>
                    {lastRead ? (
                        <>
                            <div className="flex items-center gap-2 mb-1 text-teal-100 text-xs font-medium">
                                <span className="text-[10px]"><FaBookmark /></span> Terakhir Dibaca
                            </div>
                            <h3 className={`${titleClass} font-bold leading-tight mb-1 line-clamp-2`}>
                                {lastRead.name}
                            </h3>
                            <p className="text-sm opacity-90 font-mono">Ayat {lastRead.ayah}</p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold leading-tight mb-1">Mulai Mengaji</h3>
                            <p className="text-xs text-teal-100 opacity-90">Baca Al-Quran hari ini</p>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
};

const HafalanCard = ({ stats, onClick }: { stats: {level: number, streak: number} | null, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="group relative w-full h-40 md:h-48 rounded-4xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20"
    >
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500 to-violet-700 dark:from-indigo-600 dark:to-violet-900"></div>
        
        {/* Pattern */}
        <div className="absolute -right-5 -bottom-5 text-white/10 transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
            <FaBrain size={120} />
        </div>

        <div className="relative z-10 p-5 flex flex-col justify-between h-full text-white">
            <div className="flex justify-between items-start">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-lg">
                    <FaBrain />
                </div>
                <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider flex items-center justify-center ">Hafalan</span>
                </div>
            </div>

            <div>
                {stats ? (
                    <div className="flex items-end gap-3">
                        <div>
                            <div className="text-indigo-100 text-xs font-bold uppercase mb-1">Level Anda</div>
                            <h3 className="text-3xl font-black leading-none">{stats.level}</h3>
                        </div>
                        <div className="mb-1 pl-3 border-l border-white/30">
                            <div className="flex items-center gap-1 text-orange-300 font-bold">
                                <FaFire /> {stats.streak}
                            </div>
                            <span className="text-[10px] text-indigo-100">Streak Hari</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-bold leading-tight mb-1">Target Hafalan</h3>
                        <p className="text-xs text-indigo-100 opacity-90">Mulai setoran hafalan</p>
                    </>
                )}
            </div>
        </div>
    </button>
);

const UtilityCard = ({ title, icon, color, onClick, desc }: { title: string, desc: string, icon: React.ReactNode, color: string, onClick: () => void }) => {
    const styles: any = {
        emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 hover:border-emerald-300",
        blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800 hover:border-blue-300",
        purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800 hover:border-purple-300",
    };

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col p-4 rounded-3xl border transition-all duration-300 active:scale-95 group h-full justify-between ${styles[color]}`}
        >
            <div className="w-full flex justify-between items-start">
                <span className="text-2xl mb-2">{icon}</span>
            </div>
            <div className="text-left">
                <h4 className="font-bold text-sm md:text-base dark:text-white leading-tight">{title}</h4>
                <p className="text-[10px] md:text-xs opacity-70 mt-1 font-medium dark:text-slate-300">{desc}</p>
            </div>
        </button>
    );
};

const InstallBanner: React.FC<{ onInstall: () => void; onClose: () => void }> = ({ onInstall, onClose }) => (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up">
        <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-xl text-white dark:text-slate-900 p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 ring-1 ring-black/5">
            <div className="flex items-center gap-4 pl-1">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <FaDownload />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Pasang Aplikasi</span>
                    <span className="text-[10px] opacity-70">Akses offline lebih cepat</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={onInstall}
                    className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm"
                >
                    Install
                </button>
                <button 
                    onClick={onClose}
                    className="p-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                    <FaTimes />
                </button>
            </div>
        </div>
    </div>
);

// --- MAIN PAGE ---

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { lastRead, hafalanStats } = useHomeData();
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
      if ((isInstallable || (isIOS && !isStandalone)) && !isStandalone) {
          const timer = setTimeout(() => setShowInstallBanner(true), 3000);
          return () => clearTimeout(timer);
      }
  }, [isInstallable, isIOS, isStandalone]);
  
  const handleInstallClick = () => {
      if (isIOS) {
          setShowIOSGuide(true);
      } else {
          installApp();
      }
      setShowInstallBanner(false);
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
      
      <BackgroundDecor />

      {/* FIX: Added proper top padding to avoid header overlap */}
      <main className="container mx-auto px-4 md:px-6 pt-24 md:pt-32 max-w-5xl">
          <HeaderSection />

          {/* BENTO GRID SYSTEM */}
          <div className="flex flex-col gap-4">
              
              {/* ROW 1: Hero Prayer Widget */}
              <div className="w-full animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                  <PrayerWidget />
              </div>

              {/* ROW 2: Primary Actions (2 Columns on Mobile) */}
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                  <QuranCard lastRead={lastRead} onClick={() => navigate('/mushaf')} />
                  <HafalanCard stats={hafalanStats} onClick={() => navigate('/hafalan')} />
              </div>

              {/* ROW 3: Utilities (3 Columns on Mobile & Desktop) */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                  <UtilityCard 
                    title="Zakat"
                    desc="Hitung Zakat"
                    icon={<FaHandsHelping />}
                    color="emerald"
                    onClick={() => navigate('/zakat')}
                  />
                  <UtilityCard 
                    title="Waris"
                    desc="Hitung Waris"
                    icon={<FaBalanceScale />}
                    color="blue"
                    onClick={() => navigate('/faraidh')}
                  />
                  <UtilityCard 
                    title="Finansial"
                    desc="Cek Halal"
                    icon={<FaStethoscope />}
                    color="purple"
                    onClick={() => navigate('/hede')}
                  />
              </div>

          </div>

          {/* FOOTER QUOTE */}
          <div className="mt-12 text-center opacity-60 pb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
             <p className="font-arabic text-xl text-slate-600 dark:text-slate-400 mb-2 leading-loose" style={{ fontFamily: '"Amiri", serif' }}>
                فَاسْتَبِقُوا الْخَيْرَاتِ
             </p>
             <div className="w-8 h-1 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-3"></div>
             <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                NIZAMY Suite
             </p>
          </div>

      </main>

      {showInstallBanner && (
          <InstallBanner onInstall={handleInstallClick} onClose={() => setShowInstallBanner(false)} />
      )}
    </div>
  );
};