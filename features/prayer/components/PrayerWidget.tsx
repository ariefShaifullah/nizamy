
import React, { useEffect, useState, useMemo } from 'react';
import type { PrayerData } from '../../../types.ts';
import { getNextPrayer, formatTimeLeft } from '../logic/prayer.service.ts';
import { usePrayerSchedule } from '../hooks/usePrayerSchedule.ts';
import { FaMapMarkerAlt, FaClock, FaCompass, FaCalendarAlt } from 'react-icons/fa';

export const PrayerWidget: React.FC = () => {
    // USE NEW HOOK: Mode 'daily'
    const { data: prayerData, locationName, loading } = usePrayerSchedule<PrayerData>('daily');
    
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

    // Listen for global refresh events (triggered by PrayerApp smart sync)
    useEffect(() => {
        const handleRefresh = () => {
            // The hook handles internal state, but if we needed to force re-render/re-fetch
            // we could expose a refresh method from the hook.
            // For now, React state updates in the hook will trigger re-render automatically if cache updates.
        };
        window.addEventListener('nizamy-refresh-prayer', handleRefresh);
        return () => window.removeEventListener('nizamy-refresh-prayer', handleRefresh);
    }, []);

    useEffect(() => {
        if (!prayerData) return;

        const next = getNextPrayer(prayerData.timings);
        setNextPrayerName(next.name);

        const now = new Date();
        const [h, m] = next.time.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        
        if (next.isTomorrow) {
            target.setDate(target.getDate() + 1);
        }
        else if (target.getTime() < now.getTime()) {
             target.setDate(target.getDate() + 1); 
        }

        setTargetDate(target);
    }, [prayerData]);

    useEffect(() => {
        if (!targetDate) return;
        const tick = () => {
            const now = new Date().getTime();
            const diff = targetDate.getTime() - now;
            if (diff <= 0) {
                setTimeLeft("00:00:00");
                // Optional: trigger refresh logic
            } else {
                setTimeLeft(formatTimeLeft(diff));
            }
        };
        tick();
        const timerId = setInterval(tick, 1000);
        return () => clearInterval(timerId);
    }, [targetDate]);

    // --- VISUAL LOGIC ---
    const theme = useMemo(() => {
        const base = { gradient: 'from-slate-900 to-black', accent: 'text-slate-300', iconColor: 'text-slate-700' };

        if (!nextPrayerName) return base;
        
        const map: Record<string, { gradient: string, accent: string, iconColor: string }> = {
            'Subuh': { gradient: 'from-slate-900 to-indigo-950', accent: 'text-indigo-400', iconColor: 'text-indigo-900' },
            'Syuruq': { gradient: 'from-slate-900 to-slate-800', accent: 'text-orange-400', iconColor: 'text-orange-900' },
            'Dzuhur': { gradient: 'from-slate-900 to-sky-950', accent: 'text-sky-400', iconColor: 'text-sky-900' },
            'Ashar': { gradient: 'from-slate-900 to-slate-950', accent: 'text-amber-400', iconColor: 'text-amber-900' },
            'Maghrib': { gradient: 'from-slate-900 to-purple-950', accent: 'text-purple-400', iconColor: 'text-purple-900' },
            'Isya': { gradient: 'from-slate-900 to-black', accent: 'text-slate-400', iconColor: 'text-slate-800' },
        };

        return map[nextPrayerName] || base;
    }, [nextPrayerName]);

    const PRAYER_LIST = [
        { key: 'Fajr', label: 'Subuh' },
        { key: 'Dhuhr', label: 'Dzuhur' },
        { key: 'Asr', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isha', label: 'Isya' },
    ];

    if (loading && !prayerData) return (
        <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse shadow-sm border border-slate-200 dark:border-slate-700"></div>
    );

    if (!prayerData) return null;

    return (
        <div className={`relative w-full rounded-2xl shadow-xl overflow-hidden group border border-slate-200 dark:border-slate-800 bg-slate-900 text-white`}>
            
            {/* Atmospheric Background Gradient */}
            <div className={`absolute inset-0 bg-linear-to-br ${theme.gradient} transition-all duration-1000 ease-in-out`}></div>
            
            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
            
            {/* Content Container */}
            <div className="relative z-card px-8 py-7 md:px-10 md:py-8">
                
                {/* Top Row */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 bg-white/5 w-fit px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5 tracking-wide">
                            <span className="icon-wrapper w-3 h-3"><FaMapMarkerAlt /></span>
                            <span className="truncate max-w-[150px] uppercase">{locationName}</span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-400 pl-1 mt-0.5 tracking-wide">
                            {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <div className="flex bg-black/20 rounded-xl p-1.5 backdrop-blur-sm border border-white/5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Arah Kiblat">
                                <span className="icon-wrapper w-4 h-4"><FaCompass /></span>
                            </div>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs text-slate-400 hover:text-white hover:bg-white/10 transition-colors" title="Kalender Sholat">
                                <span className="icon-wrapper w-4 h-4"><FaCalendarAlt /></span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero */}
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-bold uppercase tracking-[0.2em] ${theme.accent}`}>
                                Menuju {nextPrayerName}
                            </span>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${theme.accent.replace('text-', 'bg-')}`}></span>
                        </div>
                        <h2 className="text-5xl md:text-6xl font-medium tracking-tighter font-sans tabular-nums leading-none text-white drop-shadow-lg">
                            {timeLeft}
                        </h2>
                    </div>
                    
                    <div className={`text-6xl md:text-7xl opacity-80 group-hover:scale-110 transition-transform duration-700 ${theme.iconColor}`}>
                        <span className="icon-wrapper w-20 h-20 flex items-center justify-center"><FaClock /></span>
                    </div>
                </div>

                {/* Footer Grid */}
                <div className="grid grid-cols-5 gap-3 border-t border-white/5 pt-6">
                    {PRAYER_LIST.map((p) => {
                        const time = prayerData.timings[p.key as keyof typeof prayerData.timings];
                        const isActive = nextPrayerName === p.label;
                        
                        return (
                            <div key={p.key} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 backdrop-blur-md border border-white/10 shadow-lg scale-105' : 'opacity-40 hover:opacity-70'}`}>
                                <span className={`text-[9px] uppercase mb-1 tracking-wider ${isActive ? theme.accent : 'text-slate-400'}`}>
                                    {p.label}
                                </span>
                                <span className={`text-xs font-sans ${isActive ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                    {time.split(' ')[0]}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
