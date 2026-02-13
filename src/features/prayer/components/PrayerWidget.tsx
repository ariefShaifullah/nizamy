import React, { useEffect, useState, useMemo } from 'react';
import type { PrayerData } from '../../../types.ts';
import { getNextPrayer, formatTimeLeft } from '../logic/prayer.service.ts';
import { usePrayerSchedule } from '../hooks/usePrayerSchedule.ts';
import { FaMapMarkerAlt } from 'react-icons/fa';

// --- SKELETON COMPONENT (COMPACT) ---
const PrayerWidgetSkeleton = () => (
    <div className="w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-300 dark:bg-slate-700 rounded-xl"></div>
                <div className="flex flex-col gap-1.5">
                    <div className="h-3 w-20 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    <div className="h-5 w-16 bg-slate-300 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className="h-2.5 w-6 bg-slate-300 dark:bg-slate-700 rounded"></div>
                        <div className="h-3 w-8 bg-slate-300 dark:bg-slate-700 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const PrayerWidget: React.FC = () => {
    const { data: prayerData, locationName, loading } = usePrayerSchedule<PrayerData>('daily');

    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("--:--:--");

    useEffect(() => {
        const handleRefresh = () => { };
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

            if (isNaN(diff)) {
                setTimeLeft("--:--:--");
                return;
            }

            if (diff <= 0) {
                setTimeLeft("00:00:00");
            } else {
                setTimeLeft(formatTimeLeft(diff));
            }
        };

        tick();
        const timerId = setInterval(tick, 1000);
        return () => clearInterval(timerId);
    }, [targetDate]);

    const theme = useMemo(() => {
        if (!nextPrayerName) return {
            bg: 'bg-slate-900',
            accent: 'text-teal-400',
            iconBg: 'bg-teal-500/20'
        };

        const THEMES: Record<string, { bg: string, accent: string, iconBg: string }> = {
            'Subuh': {
                bg: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900',
                accent: 'text-indigo-300',
                iconBg: 'bg-indigo-400/20'
            },
            'Syuruq': {
                bg: 'bg-gradient-to-br from-orange-800 via-amber-800 to-slate-900',
                accent: 'text-amber-300',
                iconBg: 'bg-amber-400/20'
            },
            'Dzuhur': {
                bg: 'bg-gradient-to-br from-sky-800 via-blue-800 to-indigo-900',
                accent: 'text-sky-300',
                iconBg: 'bg-sky-400/20'
            },
            'Ashar': {
                bg: 'bg-gradient-to-br from-amber-700 via-orange-800 to-stone-900',
                accent: 'text-amber-300',
                iconBg: 'bg-amber-400/20'
            },
            'Maghrib': {
                bg: 'bg-gradient-to-br from-purple-900 via-fuchsia-900 to-slate-900',
                accent: 'text-fuchsia-300',
                iconBg: 'bg-fuchsia-400/20'
            },
            'Isya': {
                bg: 'bg-gradient-to-br from-slate-900 via-indigo-950 to-black',
                accent: 'text-indigo-300',
                iconBg: 'bg-indigo-400/20'
            }
        };

        return THEMES[nextPrayerName] || THEMES['Subuh'];
    }, [nextPrayerName]);

    const PRAYER_LIST = [
        { key: 'Fajr', label: 'Subuh' },
        { key: 'Dhuhr', label: 'Dzuhur' },
        { key: 'Asr', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isha', label: 'Isya' },
    ];

    if (loading || !prayerData) return <PrayerWidgetSkeleton />;

    return (
        <div className={`relative w-full rounded-2xl overflow-hidden transition-all duration-1000 ${theme.bg} text-white shadow-xl`}>
            {/* Decorative Noise Texture */}
            <div className="absolute inset-0 opacity-20 bg-noise mix-blend-overlay pointer-events-none"></div>

            {/* Decorative Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20.5V18h2v2.5h-2zM20 5.5V3h2v2.5h-2zM20-9.5v-2.5h2v2.5h-2zM5.5 20H3v2h2.5v-2zM-9.5 20h-2.5v2h2.5v-2zM20 35.5V33h2v2.5h-2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }} />

            {/* Dynamic Glow */}
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse-slow pointer-events-none"></div>

            <div className="relative z-card px-5 py-5 sm:px-6 sm:py-6">
                {/* Single Row: Next Prayer + Countdown + All Times */}
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Next Prayer Info */}
                    <div className="flex items-center gap-4 shrink-0">

                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 mb-1">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme.accent}`}>
                                    {nextPrayerName}
                                </span>
                                <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-white`}></span>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight tabular-nums leading-none text-white drop-shadow-sm">
                                {timeLeft}
                            </h2>
                        </div>
                    </div>

                    {/* Right: Prayer Times */}
                    <div className="hidden sm:flex items-center gap-4">
                        {PRAYER_LIST.map((p) => {
                            const time = prayerData.timings[p.key as keyof typeof prayerData.timings];
                            const isActive = nextPrayerName === p.label;
                            return (
                                <div key={p.key} className={`flex flex-col items-center transition-all duration-300 ${isActive ? 'opacity-100 scale-105' : 'opacity-50'}`}>
                                    <span className={`text-[9px] uppercase tracking-wider mb-0.5 ${isActive ? theme.accent : 'text-slate-300'}`}>
                                        {p.label}
                                    </span>
                                    <span className={`text-sm tabular-nums ${isActive ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                        {time ? time.split(' ')[0] : '--:--'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Mobile: Compact Prayer Times */}
                    <div className="flex sm:hidden items-center gap-1.5 overflow-x-auto hide-scrollbar">
                        {PRAYER_LIST.map((p) => {
                            const time = prayerData.timings[p.key as keyof typeof prayerData.timings];
                            const isActive = nextPrayerName === p.label;
                            return (
                                <div key={p.key} className={`flex flex-col items-center px-2 py-1.5 rounded-lg transition-all shrink-0 ${isActive ? 'bg-white/10 backdrop-blur-md border border-white/10 shadow-sm' : 'opacity-40'}`}>
                                    <span className={`text-[7px] uppercase tracking-wider ${isActive ? theme.accent : 'text-slate-300'}`}>
                                        {p.label}
                                    </span>
                                    <span className={`text-[10px] tabular-nums ${isActive ? 'font-bold text-white' : 'font-medium text-slate-300'}`}>
                                        {time ? time.split(' ')[0] : '--:--'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom: Location + Hijri Date */}
                <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-300 font-medium tracking-wide">
                        <span className="icon-wrapper w-3 h-3"><FaMapMarkerAlt /></span>
                        <span className="truncate max-w-[120px]">{locationName}</span>
                    </div>
                    <span className="text-slate-500">·</span>
                    <span className="text-[10px] text-slate-300 opacity-80">
                        {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
                    </span>
                </div>
            </div>
        </div>
    );
};