
import React, { useState, useEffect } from 'react';
import { usePWA } from '../hooks/usePWA.ts';
import { IOSInstallModal } from './IOSInstallModal.tsx';
import { PrayerWidget } from './PrayerWidget.tsx';
import {
  FaBalanceScale,
  FaHandsHelping,
  FaQuran,
  FaBookOpen,
  FaChevronRight
} from "react-icons/fa";

interface HomeProps {
  setView: (view: 'faraidh' | 'zakat' | 'hafalan' | 'mushaf') => void;
}

interface FeatureItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    accentColor: string;
}

const getDateString = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- COMPONENT: BENTO CARD ---
const BentoCard: React.FC<{ feature: FeatureItem; onClick: () => void; delay: number }> = ({ feature, onClick, delay }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative overflow-hidden w-full aspect-[1/0.85] md:aspect-auto md:h-48
                flex flex-col items-start justify-between
                bg-white dark:bg-slate-800 
                rounded-3xl p-5 md:p-6
                shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-none
                border border-slate-100 dark:border-slate-700/50
                hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1
                active:scale-[0.96]
                transition-all duration-300 ease-out
                animate-fade-in-up
            `}
            style={{ animationDelay: `${delay}ms` }}
        >
            {/* Background Abstract Shape */}
            <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out ${feature.bgClass}`}></div>
            
            {/* Icon Container */}
            <div className={`relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-2 ${feature.bgClass} ${feature.colorClass}`}>
                {feature.icon}
            </div>

            {/* Text Content */}
            <div className="relative z-10 text-left w-full">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium line-clamp-1 opacity-80 group-hover:opacity-100">
                    {feature.subtitle}
                </p>
            </div>

            {/* Hover Indicator (Desktop) */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 hidden md:block text-slate-300 dark:text-slate-600">
                <FaChevronRight />
            </div>
        </button>
    );
};

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
      setDateStr(getDateString());
  }, []);
  
  const features: FeatureItem[] = [
    {
        id: 'mushaf',
        title: 'Al-Quran',
        subtitle: 'Baca & Tajwid',
        icon: <FaBookOpen />,
        colorClass: 'text-teal-600 dark:text-teal-400',
        bgClass: 'bg-teal-100 dark:bg-teal-900/30',
        accentColor: 'teal'
    },
    {
      id: 'hafalan',
      title: 'Hafalan',
      subtitle: 'Tracker SRS',
      icon: <FaQuran />,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
      accentColor: 'indigo'
    },
    {
      id: 'zakat',
      title: 'Zakat',
      subtitle: 'Hitung Harta',
      icon: <FaHandsHelping />,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      accentColor: 'emerald'
    },
    {
      id: 'faraidh',
      title: 'Waris',
      subtitle: 'Bagi Faraidh',
      icon: <FaBalanceScale />,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      accentColor: 'blue'
    }
  ];

  const showInstallBtn = isInstallable || (isIOS && !isStandalone);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-10 -mt-4 md:-mt-8 -mx-4 md:-mx-0">
      {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}

      {/* --- 1. HERO SECTION --- */}
      <div className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-indigo-800 dark:from-emerald-900 dark:via-teal-900 dark:to-slate-900 pt-[calc(env(safe-area-inset-top)+2rem)] pb-32 px-6  shadow-xl shadow-teal-900/20 overflow-hidden">
          
          {/* Decorative Pattern Overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay" 
               style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          </div>
          
          {/* Glowing Orbs */}
          <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[0%] right-[-10%] w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10 max-w-5xl mx-auto text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full mb-4 border border-white/10 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <p className="text-xs font-medium tracking-wide uppercase text-emerald-50">{dateStr}</p>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight drop-shadow-md font-serif mb-2">
                  Assalamualaikum
              </h1>
              <p className="text-teal-100 text-base md:text-lg font-medium opacity-90 max-w-md leading-relaxed">
                  Mari luruskan niat untuk ibadah hari ini. Semoga Allah memberkahi setiap langkah kita.
              </p>
          </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-20 -mt-20">
          
          {/* --- 2. PRAYER WIDGET (Floating Clean Card) --- */}
          <div className="transform transition-transform hover:scale-[1.005] duration-500 ease-out">
              <PrayerWidget />
          </div>

          {/* --- 3. FEATURES (Bento Grid) --- */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-5 px-2">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Menu Utama</h3>
                <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, idx) => (
                <BentoCard 
                    key={feature.id} 
                    feature={feature} 
                    onClick={() => setView(feature.id as any)} 
                    delay={idx * 100 + 100}
                />
              ))}
            </div>
          </div>

          {/* --- 4. INSTALL BANNER --- */}
          {showInstallBtn && (
            <div className="mt-10 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden animate-fade-in">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-white/5 -skew-x-12 transform origin-bottom-right"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold">Install NIZAMY</h3>
                        </div>
                        <p className="text-slate-300 text-sm max-w-md leading-relaxed">
                            Akses lebih cepat tanpa internet dan tampilan layar penuh yang lebih nyaman.
                        </p>
                    </div>
                    <button
                        onClick={() => isIOS ? setShowIOSGuide(true) : installApp()}
                        className="bg-white text-slate-900 px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors active:scale-95 shadow-lg whitespace-nowrap w-full md:w-auto"
                    >
                        Install Aplikasi
                    </button>
                </div>
            </div>
          )}

          {/* --- 5. FOOTER QUOTE --- */}
          <div className="mt-16 text-center space-y-3 opacity-60 hover:opacity-100 transition-opacity pb-8">
             <p className="font-arabic text-xl text-slate-600 dark:text-slate-400">فَاسْتَبِقُوا الْخَيْرَاتِ</p>
             <p className="text-xs text-slate-500 dark:text-slate-500 italic">"Berlomba-lombalah dalam kebaikan"</p>
             <div className="text-[10px] text-slate-400 pt-4">
                NIZAMY v1.8.0 &copy; {new Date().getFullYear()}
             </div>
          </div>
      </div>
    </div>
  );
};
