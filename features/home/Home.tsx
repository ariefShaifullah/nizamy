
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
  FaDownload,
  FaStethoscope,
  FaTimes,
  FaFire,
  FaCheckCircle
} from "react-icons/fa";

// --- UTILS ---

const getGregorianDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- DYNAMIC HADITH DATA ---
const HADITH_DB = {
    late_night: [
        { text: "Rabb kita turun ke langit dunia pada sepertiga malam yang akhir dan berfirman: 'Siapa yang berdoa kepada-Ku, maka Aku akan mengabulkannya.'", narrator: "HR. Bukhari & Muslim" },
        { text: "Sebaik-baik shalat setelah shalat fardhu adalah shalat malam (Tahajjud).", narrator: "HR. Muslim" },
        { text: "Dua rakaat fajar (qobliyah subuh) lebih baik daripada dunia dan seisinya.", narrator: "HR. Muslim" }
    ],
    morning: [
        { text: "Berpagi-pagilah dalam mencari rezeki, karena sesungguhnya berpagi-pagi itu adalah keberkahan.", narrator: "HR. Ath-Thabrani" },
        { text: "Ya Allah, berkahilah umatku di waktu paginya.", narrator: "HR. Abu Daud" },
        { text: "Wahai anak Adam, janganlah engkau tinggalkan empat raka’at di awal siang (Dhuha). Maka Aku akan mencukupimu di akhir siang.", narrator: "HR. Tirmidzi" }
    ],
    day: [
        { text: "Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lainnya.", narrator: "HR. Ahmad" },
        { text: "Tangan di atas (memberi) lebih baik daripada tangan di bawah (meminta).", narrator: "HR. Bukhari" },
        { text: "Sesungguhnya Allah suka apabila seseorang dari kamu melakukan pekerjaan, ia menekuninya (Itqan).", narrator: "HR. Al-Baihaqi" }
    ],
    afternoon: [
        { text: "Barangsiapa yang tidak menyayangi, maka tidak akan disayangi.", narrator: "HR. Al-Bukhari" },
        { text: "Senyummu di hadapan saudaramu adalah sedekah bagimu.", narrator: "HR. Tirmidzi" },
        { text: "Bertaqwalah kepada Allah di mana saja engkau berada.", narrator: "HR. Tirmidzi" }
    ],
    night: [
        { text: "Barangsiapa membaca dua ayat terakhir dari surat Al-Baqarah pada malam hari, maka itu mencukupinya (melindunginya).", narrator: "HR. Bukhari & Muslim" },
        { text: "Dirikanlah shalat malam, karena itu adalah kebiasaan orang-orang saleh sebelum kamu dan penghapus dosa.", narrator: "HR. Tirmidzi" },
        { text: "Cukuplah Allah sebagai Penolong kami, dan Allah adalah sebaik-baik Pelindung.", narrator: "HR. Bukhari" }
    ]
};

const getDynamicHadith = () => {
    const hour = new Date().getHours();
    let category: keyof typeof HADITH_DB = 'night';
    
    if (hour >= 0 && hour < 4) category = 'late_night'; // 00:00 - 04:00 (Qiyamul Lail)
    else if (hour >= 4 && hour < 10) category = 'morning';
    else if (hour >= 10 && hour < 15) category = 'day';
    else if (hour >= 15 && hour < 18) category = 'afternoon';
    // else 18-00 remains 'night'
    
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
    <div className="fixed inset-0 z-background overflow-hidden pointer-events-none bg-[#f8f9fc] dark:bg-[#0b0f19] transition-colors duration-500">
        <div className="absolute top-0 inset-x-0 h-96 bg-linear-to-b from-white to-transparent dark:from-slate-900/50"></div>
        
        {/* Subtle, desaturated blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-slate-200/40 dark:bg-slate-800/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-slate-200/30 dark:bg-slate-800/10 rounded-full blur-[100px]"></div>
        
        {/* Noise Texture for Texture */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
        </div>
    </div>
);

const HeaderSection = () => {
    const hadith = useMemo(() => getDynamicHadith(), []);

    return (
        <div className="flex flex-col mb-10 animate-fade-in-down relative px-1">
            <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                    {getGregorianDate()}
                </span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
            </div>
            
            <div className="relative z-raised">
                <p className="text-xl md:text-2xl font-serif text-slate-800 dark:text-slate-200 leading-relaxed tracking-tight">
                    <span className="text-slate-300 dark:text-slate-700 text-4xl font-serif mr-2 relative top-2">"</span>
                    {hadith.text}
                </p>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-4 uppercase tracking-wide flex items-center gap-2">
                    <span className="w-4 h-px bg-slate-300 dark:bg-slate-700"></span> {hadith.narrator}
                </p>
            </div>
        </div>
    );
};

// --- ELEGANT CARDS (S-Tier Premium) ---

const QuranCard = ({ lastRead, onClick }: { lastRead: {name: string, ayah: number} | null, onClick: () => void }) => {
    return (
        <button 
            onClick={onClick}
            className="group relative w-full h-40 md:h-48 rounded-3xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-200 dark:hover:border-teal-800 hover:shadow-xl dark:hover:shadow-teal-900/10 active:scale-[0.98]"
        >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-teal-50/50 group-hover:to-white dark:group-hover:from-teal-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>

            <div className="relative z-10 p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    {/* Icon Box: Monochrome -> Color on Hover */}
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:border-teal-100 dark:group-hover:border-teal-800 group-hover:scale-110">
                        <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaQuran /></div>
                    </div>
                    {/* Category Label */}
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 opacity-70 group-hover:opacity-100 group-hover:text-teal-600/70 dark:group-hover:text-teal-400/70 transition-all">
                        Al-Quran
                    </span>
                </div>

                <div>
                    {lastRead ? (
                        <>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                {lastRead.name}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                Lanjut Ayat {lastRead.ayah}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors">
                                Baca Al-Quran
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300">
                                Mushaf Digital
                            </p>
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
        className="group relative w-full h-40 md:h-48 rounded-3xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-xl dark:hover:shadow-indigo-900/10 active:scale-[0.98]"
    >
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-indigo-50/50 group-hover:to-white dark:group-hover:from-indigo-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>
        
        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                {/* Icon Box */}
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-800 group-hover:scale-110">
                    <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaBrain /></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 opacity-70 group-hover:opacity-100 group-hover:text-indigo-600/70 dark:group-hover:text-indigo-400/70 transition-all">
                    Tahfiz
                </span>
            </div>

            <div>
                {stats ? (
                    <div>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white leading-none mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">{stats.level}</h3>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                            <span className="text-amber-500 icon-wrapper w-3 h-3"><FaFire /></span> {stats.streak} Hari
                        </div>
                    </div>
                ) : (
                    <>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">Hafalan</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300">Metode SRS</p>
                    </>
                )}
            </div>
        </div>
    </button>
);

const AmalCard = ({ onClick }: { onClick: () => void }) => (
    <button 
        onClick={onClick}
        className="group relative w-full h-40 md:h-48 rounded-3xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-xl dark:hover:shadow-emerald-900/10 col-span-2 md:col-span-1 active:scale-[0.98]"
    >
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-emerald-50/50 group-hover:to-white dark:group-hover:from-emerald-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>
        
        <div className="relative z-10 p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                {/* Icon Box */}
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/30 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:border-emerald-100 dark:group-hover:border-emerald-800 group-hover:scale-110">
                    <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaCheckCircle /></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 opacity-70 group-hover:opacity-100 group-hover:text-emerald-600/70 dark:group-hover:text-emerald-400/70 transition-all">
                    Amal
                </span>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">Amal Yaumi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300">Catat ibadah harian</p>
            </div>
        </div>
    </button>
);

const UtilityCard = ({ title, icon, color, onClick }: { title: string, icon: React.ReactNode, color: 'emerald' | 'blue' | 'purple', onClick: () => void }) => {
    // Config for Brand Hover Colors
    const colorConfig = {
        emerald: {
            hoverBorder: 'group-hover:border-emerald-200 dark:group-hover:border-emerald-800',
            iconColor: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
            iconBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20'
        },
        blue: {
            hoverBorder: 'group-hover:border-blue-200 dark:group-hover:border-blue-800',
            iconColor: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
            iconBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'
        },
        purple: {
            hoverBorder: 'group-hover:border-purple-200 dark:group-hover:border-purple-800',
            iconColor: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
            iconBg: 'group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20'
        }
    };

    const conf = colorConfig[color];

    return (
        <button 
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-4 h-36 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 group hover:shadow-lg hover:-translate-y-1 active:scale-95 ${conf.hoverBorder}`}
        >
            <div className={`
                w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-3 transition-all duration-300
                bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500
                ${conf.iconBg} ${conf.iconColor} group-hover:scale-110
            `}>
                <span className="icon-wrapper w-6 h-6 flex items-center justify-center">{icon}</span>
            </div>
            <h4 className={`font-bold text-sm text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-800 dark:group-hover:text-white`}>{title}</h4>
        </button>
    );
};

const InstallBanner: React.FC<{ onInstall: () => void; onClose: () => void }> = ({ onInstall, onClose }) => (
    <div className="fixed bottom-6 left-4 right-4 z-sticky animate-fade-in-up">
        <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-xl text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 ring-1 ring-black/5 max-w-lg mx-auto">
            <div className="flex items-center gap-4 pl-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                    <span className="icon-wrapper w-5 h-5"><FaDownload /></span>
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
                    <span className="icon-wrapper w-4 h-4"><FaTimes /></span>
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
    <div className="min-h-screen pb-24 relative overflow-hidden font-sans">
      {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
      
      <BackgroundDecor />

      <main className="container mx-auto px-4 md:px-6 pt-[calc(6rem+env(safe-area-inset-top))] md:pt-[calc(8rem+env(safe-area-inset-top))] max-w-4xl relative z-10">
          <HeaderSection />

          {/* GRID SYSTEM */}
          <div className="flex flex-col gap-8">
              
              {/* HERO: Prayer Widget */}
              <div onClick={() => navigate('/sholat')} className="w-full animate-fade-in-up cursor-pointer active:scale-[0.99] transition-transform duration-300" style={{ animationDelay: '50ms' }}>
                  <PrayerWidget />
              </div>

              {/* SECTION: Main Features */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
                  <div className="col-span-2 md:col-span-1">
                    <QuranCard lastRead={lastRead} onClick={() => navigate('/mushaf')} />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <HafalanCard stats={hafalanStats} onClick={() => navigate('/hafalan')} />
                  </div>
                  <div className="col-span-1 md:col-span-1">
                    <AmalCard onClick={() => navigate('/amal')} />
                  </div>
              </div>

              {/* SECTION: Tools (Compact) */}
              <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
                  <div className="flex items-center gap-4 mb-4 md:mb-5">
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Tools & Kalkulator</h4>
                      <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 md:gap-5">
                      <UtilityCard 
                        title="Zakat"
                        icon={<FaHandsHelping />}
                        color="emerald"
                        onClick={() => navigate('/zakat')}
                      />
                      <UtilityCard 
                        title="Waris"
                        icon={<FaBalanceScale />}
                        color="blue"
                        onClick={() => navigate('/faraidh')}
                      />
                      <UtilityCard 
                        title="Finansial"
                        icon={<FaStethoscope />}
                        color="purple"
                        onClick={() => navigate('/hede')}
                      />
                  </div>
              </div>

          </div>    

          {/* FOOTER QUOTE */}
          <div className="mt-20 text-center opacity-40 pb-8 animate-fade-in" style={{ animationDelay: '400ms' }}>
             <p className="font-arabic text-xl text-slate-500 dark:text-slate-500 mb-3 leading-loose" style={{ fontFamily: '"Amiri", serif' }}>
                فَاسْتَبِقُوا الْخَيْرَاتِ
             </p>
             <div className="w-8 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto rounded-full mb-3"></div>
             <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-slate-400">
                NIZAMY
             </p>
          </div>

      </main>

      {showInstallBanner && (
          <InstallBanner onInstall={handleInstallClick} onClose={() => setShowInstallBanner(false)} />
      )}
    </div>
  );
};
