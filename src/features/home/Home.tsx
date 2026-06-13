
import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { usePWA } from '../../hooks/usePWA.ts';
import { IOSInstallModal } from '../../features/settings/components/IOSInstallModal.tsx';
import { PrayerWidget } from '../../features/prayer/components/PrayerWidget.tsx';
import { useSurahData } from '../../hooks/useSurahData.ts';
import {
    FaBalanceScale,
    FaHandsHelping,
    FaQuran,
    FaBrain,
    FaDownload,
    FaWallet,
    FaTimes,
    FaCheckCircle,
    FaCamera,
    FaArrowRight,
} from "react-icons/fa";
import { useBlogPosts } from '../../hooks/useBlogPosts.ts';
import BlogCard from '../../components/blog/BlogCard.tsx';

// --- UTILS ---
const getGregorianDate = () => {
    return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- HOME DATA HOOK ---
const useHomeData = () => {
    const { surahs: SURAH_DATA } = useSurahData();
    const [lastRead, setLastRead] = useState<{ name: string, ayah: number } | null>(null);
    const [hafalanStats, setHafalanStats] = useState<{ level: number, streak: number } | null>(null);

    useEffect(() => {
        try {
            const savedRead = localStorage.getItem('mushaf_lastRead');
            if (savedRead && SURAH_DATA.length > 0) {
                const parsed = JSON.parse(savedRead);
                const surah = SURAH_DATA.find(s => s.number === parsed.surahId);
                if (surah) {
                    setLastRead({ name: surah.name, ayah: parsed.ayahNumber });
                }
            }
        } catch (e) { console.error(e); }

        try {
            const usersStr = localStorage.getItem('nizamy_hafalan_users');
            if (usersStr) {
                const users = JSON.parse(usersStr);
                if (users.length > 0) {
                    const lastUser = users[users.length - 1];
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
    }, [SURAH_DATA]);

    return { lastRead, hafalanStats };
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

    if (hour >= 0 && hour < 4) category = 'late_night';
    else if (hour >= 4 && hour < 10) category = 'morning';
    else if (hour >= 10 && hour < 15) category = 'day';
    else if (hour >= 15 && hour < 18) category = 'afternoon';

    const list = HADITH_DB[category]; // Fix: Explicitly check key
    const dateNum = new Date().getDate();
    return list[dateNum % list.length];
};

const HadithSection = () => {
    const hadith = useMemo(() => getDynamicHadith(), []);
    return (
        <div className="mb-5 md:mb-6 animate-fade-in">
            <div className="relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 md:p-5">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-6xl text-slate-400 dark:text-slate-500 font-serif leading-none">❝</div>
                <p className="relative z-10 text-sm md:text-base font-medium text-slate-700 dark:text-slate-300 italic leading-relaxed">
                    "{hadith.text}"
                </p>
                <div className="relative z-10 flex items-center gap-2 mt-3">
                    <div className="h-px w-8 bg-teal-500/50"></div>
                    <span className="text-[10px] md:text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">{hadith.narrator}</span>
                </div>
            </div>
        </div>
    );
};

// ============================================================
// CARD COMPONENTS — 3 tiers of visual weight
// ============================================================

// --- HERO CARD (Al-Quran — the primary action) ---
const HeroCard = ({ lastRead, onClick }: {
    lastRead: { name: string; ayah: number } | null;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="group relative w-full h-full min-h-[200px] md:min-h-[260px] rounded-3xl overflow-hidden text-left transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/20 active:scale-[0.98]"
    >
        {/* Richer Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-800 transition-all duration-700 group-hover:scale-105" />

        {/* Animated Grain/Noise Overlay */}
        <div className="absolute inset-0 opacity-20 bg-noise mix-blend-overlay pointer-events-none"></div>

        {/* Decorative Ornament - Covers whole card but fades out using CSS mask so only top-right is visible */}
        <img
            src="/images/ornaments.svg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay pointer-events-none scale-125 rotate-2 group-hover:rotate-6 group-hover:scale-[1.5] transition-all duration-700"
            style={{
                WebkitMaskImage: 'linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)',
                maskImage: 'linear-gradient(225deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 60%)'
            }}
        />

        {/* Dynamic Glow */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl group-hover:bg-emerald-400/30 transition-all duration-700 animate-pulse-slow" />

        {/* Content */}
        <div className="relative z-10 p-6 md:p-8 flex flex-col justify-between h-full text-white">
            <div>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-5 border border-white/20 group-hover:bg-white/20 group-hover:rotate-6 transition-all duration-500 shadow-lg shadow-black/10">
                    <span className="icon-wrapper w-7 h-7 md:w-8 md:h-8 flex items-center justify-center"><FaQuran /></span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-2 drop-shadow-md">
                    {lastRead ? lastRead.name : 'Baca Al-Quran'}
                </h3>
                <p className="text-sm md:text-base text-emerald-100 font-medium opacity-90">
                    {lastRead ? `Lanjutkan Ayat ${lastRead.ayah}` : 'Mushaf Digital & Tajwid'}
                </p>
            </div>

            <div className="flex items-center gap-3 mt-8">
                <div className="pl-5 pr-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center gap-3">
                    <span>BUKA MUSHAF</span>
                    <span className="icon-wrapper w-3 h-3"><FaArrowRight /></span>
                </div>
            </div>
        </div>
    </button>
);

// --- FEATURE CARD (Hafalan, Amal — horizontal 2-column layout) ---
const FeatureCard = ({ title, subtitle, icon, onClick, gradient, iconBg }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
    gradient: string;
    iconBg: string;
}) => (
    <button
        onClick={onClick}
        className="group relative w-full h-full rounded-3xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 active:scale-[0.98]"
    >
        {/* Dynamic Gradient Overlay on Hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />

        <div className="relative z-10 flex h-full">
            {/* Left: Full-height icon column */}
            <div className={`w-20 md:w-30 shrink-0 bg-gradient-to-b ${gradient} flex items-center justify-center`}>
                <span className="icon-wrapper w-12 h-12 md:w-16 md:h-16 flex items-center justify-center text-white text-2xl md:text-5xl drop-shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    {icon}
                </span>
            </div>

            {/* Right: Text content */}
            <div className="flex-1 p-4 md:p-5 flex flex-col justify-center min-w-0">
                <h3 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                    {title}
                </h3>
                <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 leading-relaxed truncate">
                    {subtitle}
                </p>
            </div>
        </div>
    </button>
);

// --- TOOL CARD (Zakat, Waris, etc. — compact visual weight) ---
const ToolCard = ({ title, subtitle, icon, onClick, iconGradient }: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    onClick: () => void;
    iconGradient: string;
}) => (
    <button
        onClick={onClick}
        className="group relative w-full rounded-2xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 active:scale-[0.98] group-hover:-translate-y-1"
    >
        <div className="absolute inset-0 bg-linear-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900/50 opacity-100" />

        <div className="relative z-10 p-4 md:p-5 flex flex-col items-center text-center md:items-start md:text-left h-full">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${iconGradient} text-white flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <span className="icon-wrapper w-6 h-6 flex items-center justify-center">{icon}</span>
            </div>
            <h3 className="text-xs md:text-sm font-extrabold text-slate-700 dark:text-slate-200 leading-tight mt-auto">
                {title}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 mt-1 hidden md:block font-medium">
                {subtitle}
            </p>
        </div>
    </button>
);

// --- INSTALL BANNER ---
const INSTALL_DISMISS_KEY = 'nizamy_install_dismissed';

const InstallBanner: React.FC<{ onInstall: () => void; onClose: () => void }> = ({ onInstall, onClose }) => (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-sticky animate-fade-in-up">
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 border border-slate-700 max-w-lg mx-auto">
            <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shrink-0">
                    <span className="icon-wrapper w-4 h-4"><FaDownload /></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Pasang Aplikasi</span>
                    <span className="text-[10px] text-slate-400">Akses offline lebih cepat</span>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <button onClick={onInstall} className="bg-white text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">Install</button>
                <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white transition-colors"><span className="icon-wrapper w-3.5 h-3.5"><FaTimes /></span></button>
            </div>
        </div>
    </div>
);

// ============================================================
// MAIN PAGE
// ============================================================

export const Home: React.FC = () => {
    const navigate = useNavigate();
    const { lastRead, hafalanStats } = useHomeData();
    const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
    const [showIOSGuide, setShowIOSGuide] = useState(false);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    const { posts: latestPosts, loading: blogLoading } = useBlogPosts({ page: 1, per_page: 3 });

    useEffect(() => {
        const dismissed = localStorage.getItem(INSTALL_DISMISS_KEY);
        if (dismissed) {
            const dismissedAt = parseInt(dismissed, 10);
            const sevenDays = 7 * 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedAt < sevenDays) return;
        }

        if ((isInstallable || (isIOS && !isStandalone)) && !isStandalone) {
            const timer = setTimeout(() => setShowInstallBanner(true), 5000);
            return () => clearTimeout(timer);
        }
    }, [isInstallable, isIOS, isStandalone]);

    const handleInstallClick = () => {
        if (isIOS) { setShowIOSGuide(true); }
        else { installApp(); }
        setShowInstallBanner(false);
    };

    const handleDismissInstall = () => {
        localStorage.setItem(INSTALL_DISMISS_KEY, Date.now().toString());
        setShowInstallBanner(false);
    };

    const dateStr = useMemo(() => getGregorianDate(), []);

    return (
        <div className="min-h-screen pb-24 md:pb-8 relative font-sans">
            {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}

            <main className="container mx-auto px-4 md:px-6 lg:px-8 pt-[calc(5rem+env(safe-area-inset-top))] max-w-6xl relative">

                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4 px-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
                        {dateStr}
                    </span>
                    <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
                </div>

                {/* Daily Hadith */}
                <HadithSection />

                {/* Prayer Widget (Full Width) */}
                <div onClick={() => navigate('/sholat')} className="w-full cursor-pointer active:scale-[0.995] transition-transform duration-200 mb-5 md:mb-6">
                    <PrayerWidget />
                </div>

                {/* === BENTO GRID === */}
                {/* Mobile: stacked | Desktop: 3-column bento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
                    {/* Hero — Al-Quran (spans 2 cols on desktop) */}
                    <div className="md:col-span-2 md:row-span-2">
                        <HeroCard
                            lastRead={lastRead}
                            onClick={() => navigate('/mushaf')}
                        />
                    </div>

                    {/* Hafalan Quran */}
                    <FeatureCard
                        title="Hafalan Quran"
                        subtitle={hafalanStats ? `Level ${hafalanStats.level} · 🔥 ${hafalanStats.streak} Hari` : "Metode Spaced Repetition"}
                        icon={<FaBrain />}
                        gradient="from-indigo-500 to-purple-600"
                        iconBg="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                        onClick={() => navigate('/hafalan')}
                    />

                    {/* Amal Yaumi */}
                    <FeatureCard
                        title="Amal Yaumi"
                        subtitle="Catat ibadah harian Anda"
                        icon={<FaCheckCircle />}
                        gradient="from-emerald-500 to-teal-600"
                        iconBg="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400"
                        onClick={() => navigate('/amal')}
                    />
                </div>

                {/* === TOOLS ROW === */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Kalkulator & Tools</h4>
                        <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
                        <ToolCard
                            title="Kalkulator Zakat"
                            subtitle="Fitrah, Maal, Emas"
                            icon={<FaHandsHelping />}
                            iconGradient="from-emerald-500 to-emerald-600"
                            onClick={() => navigate('/zakat')}
                        />
                        <ToolCard
                            title="Kalkulator Waris"
                            subtitle="Hitung Faraidh"
                            icon={<FaBalanceScale />}
                            iconGradient="from-blue-500 to-blue-600"
                            onClick={() => navigate('/faraidh')}
                        />
                        <ToolCard
                            title="Cek Finansial"
                            subtitle="Diagnosa Syariah"
                            icon={<FaWallet />}
                            iconGradient="from-purple-500 to-purple-600"
                            onClick={() => navigate('/hede')}
                        />
                        <ToolCard
                            title="Cek Halal"
                            subtitle="Scan Produk"
                            icon={<FaCamera />}
                            iconGradient="from-teal-500 to-teal-600"
                            onClick={() => navigate('/scanner')}
                        />
                    </div>
                </div>

                {/* === ARTIKEL TERBARU === */}
                {latestPosts && latestPosts.length > 0 && (
                    <div className="hidden md:block mb-10 animate-fade-in">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-3">
                                <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Artikel Terbaru</h4>
                                <div className="h-px w-8 bg-slate-200 dark:bg-slate-800"></div>
                            </div>
                            <button
                                onClick={() => navigate('/blog')}
                                className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1.5 transition-colors"
                            >
                                Lihat Semua <span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaArrowRight /></span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {latestPosts.slice(0, 3).map(post => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center opacity-30 pb-4">
                    <p className="font-arabic text-lg text-slate-500 dark:text-slate-500 mb-2 leading-loose" style={{ fontFamily: '"Amiri", serif' }}>
                        فَاسْتَبِقُوا الْخَيْرَاتِ
                    </p>
                    <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto rounded-full mb-2"></div>
                    <p className="text-[9px] uppercase font-bold tracking-[0.3em] text-slate-400">
                        NIZAMY
                    </p>
                </div>

            </main>

            {showInstallBanner && (
                <InstallBanner onInstall={handleInstallClick} onClose={handleDismissInstall} />
            )}
        </div>
    );
};
