
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePWA } from '../../hooks/usePWA.ts';
import { IOSInstallModal } from '../settings/components/IOSInstallModal.tsx';
import { PrayerWidget } from '../prayer/components/PrayerWidget.tsx';
import {
  FaBalanceScale,
  FaHandsHelping,
  FaQuran,
  FaBrain,
  FaChevronRight,
  FaDownload
} from "react-icons/fa";

interface FeatureItem {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    colorClass: string;
    bgClass: string;
    borderClass: string;
    path: string;
}

const getDateString = () => {
    const date = new Date();
    return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

// --- COMPONENT: BENTO CARD ---
const BentoCard: React.FC<{ feature: FeatureItem; onClick: () => void; delay: number }> = React.memo(({ feature, onClick, delay }) => {
    return (
        <button
            onClick={onClick}
            className={`
                group relative overflow-hidden w-full h-full min-h-[160px] md:min-h-[200px]
                flex flex-col items-start justify-between
                bg-white dark:bg-slate-800 
                rounded-[2rem] p-6
                shadow-sm hover:shadow-xl dark:shadow-none
                border border-slate-100 dark:border-slate-700
                hover:border-indigo-100 dark:hover:border-indigo-900
                active:scale-[0.98] transition-all duration-300
                animate-fade-in-up
                backface-hidden
            `}
            style={{ animationDelay: `${delay}ms`, willChange: 'transform' }}
        >
            {/* Decorative Circle Background */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-[0.08] transition-transform duration-500 group-hover:scale-125 ${feature.bgClass}`}></div>
            
            <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl md:text-3xl mb-4 transition-transform duration-300 group-hover:scale-110 ${feature.bgClass} ${feature.colorClass}`}>
                <div className="icon-wrapper w-8 h-8 flex items-center justify-center">{feature.icon}</div>
            </div>

            <div className="relative z-10 text-left w-full">
                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium opacity-80">
                    {feature.subtitle}
                </p>
            </div>

            <div className="absolute bottom-6 right-6 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden md:block text-slate-300 dark:text-slate-600">
                <div className="icon-wrapper w-5 h-5"><FaChevronRight /></div>
            </div>
        </button>
    );
});

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isInstallable, isIOS, isStandalone, installApp } = usePWA();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
      setDateStr(getDateString());
  }, []);
  
  const features: FeatureItem[] = useMemo(() => [
    {
        id: 'mushaf',
        title: 'Al-Quran',
        subtitle: 'Baca & Tajwid',
        icon: <FaQuran />,
        colorClass: 'text-teal-600 dark:text-teal-400',
        bgClass: 'bg-teal-100 dark:bg-teal-900/30',
        borderClass: 'border-teal-100 dark:border-teal-900',
        path: '/mushaf'
    },
    {
      id: 'hafalan',
      title: 'Hafalan',
      subtitle: 'Tracker SRS',
      icon: <FaBrain />,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/30',
      borderClass: 'border-indigo-100 dark:border-indigo-900',
      path: '/hafalan'
    },
    {
      id: 'zakat',
      title: 'Zakat',
      subtitle: 'Hitung Zakat',
      icon: <FaHandsHelping />,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
      borderClass: 'border-emerald-100 dark:border-emerald-900',
      path: '/zakat'
    },
    {
      id: 'faraidh',
      title: 'Waris',
      subtitle: 'Bagi Waris',
      icon: <FaBalanceScale />,
      colorClass: 'text-blue-600 dark:text-blue-400',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      borderClass: 'border-blue-100 dark:border-blue-900',
      path: '/faraidh'
    }
  ], []);

  const showInstallBtn = isInstallable || (isIOS && !isStandalone);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 md:pb-10 overflow-x-hidden">
      {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
      
      <style>{`
        @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient-xy {
            background-size: 200% 200%;
            animation: gradient-xy 15s ease infinite;
        }
      `}</style>

      {/* --- 1. HERO SECTION (ANIMATED AURORA) --- */}
      {/* Increased top padding for fixed header */}
      <div className="relative pt-[calc(env(safe-area-inset-top)+5.5rem)] pb-32 px-6 overflow-hidden shadow-sm group">
          
          {/* Animated Gradient Background */}
          <div className="absolute inset-0 animate-gradient-xy bg-gradient-to-br from-blue-500 via-indigo-500 to-teal-400 dark:from-slate-900 dark:via-indigo-950 dark:to-slate-900 opacity-95 dark:opacity-100 transition-colors duration-1000"></div>
          
          {/* Overlay for depth */}
          <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-b dark:from-transparent dark:to-slate-950/90"></div>

          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-[0.15] dark:opacity-[0.05] pointer-events-none mix-blend-overlay" 
            style={{ backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
          ></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-white/5 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 border border-white/20 shadow-sm transition-transform hover:scale-105">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <p className="text-xs font-bold tracking-wider uppercase text-white shadow-black/10 drop-shadow-sm">{dateStr}</p>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight drop-shadow-sm font-serif mb-3">
                  Assalamu'alaikum,
              </h1>
              <p className="text-indigo-50 text-sm md:text-lg font-medium opacity-90 max-w-lg leading-relaxed drop-shadow-sm">
                  Mari luruskan niat untuk ibadah hari ini. Semoga Allah memberkahi setiap langkah kita.
              </p>
          </div>
      </div>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="w-full px-4 sm:px-6 lg:px-8 relative z-20 -mt-24">
          
          {/* --- 2. PRAYER WIDGET --- */}
          <div className="mb-10 max-w-5xl mx-auto transform transition-transform hover:scale-[1.005] duration-500">
              <PrayerWidget />
          </div>

          {/* --- 3. FEATURES (Bento Grid) --- */}
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    Menu Utama
                </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {features.map((feature, idx) => (
                <BentoCard 
                    key={feature.id} 
                    feature={feature} 
                    onClick={() => navigate(feature.path)} 
                    delay={idx * 75} 
                />
              ))}
            </div>
          </div>

          {/* --- 4. INSTALL BANNER --- */}
          {showInstallBtn && (
            <div className="mt-12 max-w-5xl mx-auto bg-slate-900 dark:bg-black text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden animate-fade-in ring-4 ring-slate-50 dark:ring-slate-800">
                <div className="absolute right-0 top-0 h-full w-3/4 bg-gradient-to-l from-indigo-600/20 to-transparent pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                <span className="icon-wrapper w-6 h-6"><FaDownload /></span>
                            </div>
                            <h3 className="text-xl font-bold">Install NIZAMY</h3>
                        </div>
                        <p className="text-slate-300 text-sm md:text-base max-w-md leading-relaxed">
                            Nikmati akses lebih cepat tanpa internet dan pengalaman layar penuh yang lebih fokus.
                        </p>
                    </div>
                    <button
                        onClick={() => isIOS ? setShowIOSGuide(true) : installApp()}
                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors active:scale-95 shadow-lg whitespace-nowrap w-full md:w-auto"
                    >
                        Install Aplikasi
                    </button>
                </div>
            </div>
          )}

          {/* --- 5. FOOTER QUOTE --- */}
          <div className="mt-20 text-center space-y-4 opacity-60 hover:opacity-100 transition-opacity pb-8 group">
             <p className="font-arabic text-3xl text-slate-600 dark:text-slate-400 leading-loose drop-shadow-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">فَاسْتَبِقُوا الْخَيْرَاتِ</p>
             <p className="text-sm text-slate-500 dark:text-slate-500 italic">"Berlomba-lombalah dalam kebaikan"</p>
             <div className="text-[10px] text-slate-400 dark:text-slate-600 pt-4 font-mono">
                NIZAMY v1.8.7 &copy; {new Date().getFullYear()}
             </div>
          </div>
      </div>
    </div>
  );
};
