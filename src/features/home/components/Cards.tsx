import React from 'react';
import { FaQuran, FaBrain, FaCheckCircle, FaFire } from 'react-icons/fa';

// Shared card base styles
const cardBase = "group relative w-full h-40 md:h-48 rounded-3xl overflow-hidden text-left transition-all duration-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-xl active:scale-[0.98]";

// Quran Card
interface QuranCardProps {
    lastRead: { name: string; ayah: number } | null;
    onClick: () => void;
}

export const QuranCard: React.FC<QuranCardProps> = ({ lastRead, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`${cardBase} hover:border-teal-200 dark:hover:border-teal-800 dark:hover:shadow-teal-900/10`}
        >
            <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-teal-50/50 group-hover:to-white dark:group-hover:from-teal-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>
            <div className="relative z-card p-6 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/30 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:border-teal-100 dark:group-hover:border-teal-800 group-hover:scale-110">
                        <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaQuran /></div>
                    </div>
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

// Hafalan Card
interface HafalanCardProps {
    stats: { level: number; streak: number } | null;
    onClick: () => void;
}

export const HafalanCard: React.FC<HafalanCardProps> = ({ stats, onClick }) => (
    <button
        onClick={onClick}
        className={`${cardBase} hover:border-indigo-200 dark:hover:border-indigo-800 dark:hover:shadow-indigo-900/10`}
    >
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-indigo-50/50 group-hover:to-white dark:group-hover:from-indigo-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>
        <div className="relative z-card p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center border border-slate-100 dark:border-slate-700 transition-all duration-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:border-indigo-100 dark:group-hover:border-indigo-800 group-hover:scale-110">
                    <div className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaBrain /></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-600 opacity-70 group-hover:opacity-100 group-hover:text-indigo-600/70 dark:group-hover:text-indigo-400/70 transition-all">
                    Hafalan
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
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">Hafalan Quran</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium group-hover:text-slate-600 dark:group-hover:text-slate-300">Metode SRS</p>
                    </>
                )}
            </div>
        </div>
    </button>
);

// Amal Card
interface AmalCardProps {
    onClick: () => void;
}

export const AmalCard: React.FC<AmalCardProps> = ({ onClick }) => (
    <button
        onClick={onClick}
        className={`${cardBase} hover:border-emerald-200 dark:hover:border-emerald-800 dark:hover:shadow-emerald-900/10 col-span-2 md:col-span-1`}
    >
        <div className="absolute inset-0 bg-linear-to-br from-transparent to-transparent group-hover:from-emerald-50/50 group-hover:to-white dark:group-hover:from-emerald-900/10 dark:group-hover:to-slate-900 transition-colors duration-500"></div>
        <div className="relative z-card p-6 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
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

// Utility Card
interface UtilityCardProps {
    title: string;
    icon: React.ReactNode;
    color: 'emerald' | 'blue' | 'purple';
    onClick: () => void;
}

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

export const UtilityCard: React.FC<UtilityCardProps> = ({ title, icon, color, onClick }) => {
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
            <h4 className="font-bold text-sm text-slate-600 dark:text-slate-300 transition-colors group-hover:text-slate-800 dark:group-hover:text-white">{title}</h4>
        </button>
    );
};
