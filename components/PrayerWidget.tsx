import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type { PrayerData } from '../types.ts';
import { getCoordinates, fetchPrayerTimes, getNextPrayer, formatTimeLeft, savePrayerCache, getCachedPrayerData } from '../services/prayer.service.ts';

export const PrayerWidget: React.FC = () => {
    const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState("Jakarta");
    
    // Optimized State: Only update 'timeLeft' every second.
    // 'targetDate' and 'nextPrayerName' are calculated only when needed.
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

    const loadData = useCallback(async (forceRefresh = false) => {
        setLoading(true);
        
        if (!forceRefresh) {
            const cached = getCachedPrayerData();
            if (cached) {
                setPrayerData(cached.data);
                setLocationName(cached.city);
                setLoading(false);
                return;
            }
        }

        try {
            const coords = await getCoordinates();
            const data = await fetchPrayerTimes(coords.latitude, coords.longitude);
            if (data) {
                setPrayerData(data);
                setLocationName("Lokasi Anda");
                savePrayerCache(data, "Lokasi Anda");
            }
        } catch (error) {
            const data = await fetchPrayerTimes(-6.1702, 106.8314);
            if (data) {
                setPrayerData(data);
                setLocationName("Jakarta Pusat");
                if (!forceRefresh) savePrayerCache(data, "Jakarta Pusat");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        loadData();
        const handleRefresh = () => loadData(true);
        window.addEventListener('nizamy-refresh-prayer', handleRefresh);
        return () => window.removeEventListener('nizamy-refresh-prayer', handleRefresh);
    }, [loadData]);

    // OPTIMIZATION 1: Calculate Target ONCE when prayerData changes
    // Instead of calculating "Which prayer is next?" every second, we do it once here.
    useEffect(() => {
        if (!prayerData) return;

        const next = getNextPrayer(prayerData.timings);
        setNextPrayerName(next.name);

        const now = new Date();
        const [h, m] = next.time.split(':').map(Number);
        const target = new Date();
        target.setHours(h, m, 0, 0);
        
        // Handle overflow to next day logic from service
        if (next.isTomorrow) {
            target.setDate(target.getDate() + 1);
        }
        // Correction if target is in the past (safety check)
        else if (target.getTime() < now.getTime()) {
             // This shouldn't happen with correct getNextPrayer logic, but as fallback:
             target.setDate(target.getDate() + 1); 
        }

        setTargetDate(target);
    }, [prayerData]);

    // OPTIMIZATION 2: The Interval only does simple math (O(1))
    useEffect(() => {
        if (!targetDate) return;

        const tick = () => {
            const now = new Date().getTime();
            const diff = targetDate.getTime() - now;

            if (diff <= 0) {
                // Time passed! Trigger a soft reload to find next prayer
                setTimeLeft("00:00:00");
                // Re-run logic to find NEXT prayer (e.g. from Maghrib to Isya)
                // We can simply toggle prayerData to force re-calc or call loadData
                loadData(false); 
            } else {
                setTimeLeft(formatTimeLeft(diff));
            }
        };

        tick(); // Run immediately
        const timerId = setInterval(tick, 1000);

        return () => clearInterval(timerId);
    }, [targetDate, loadData]);

    const PRAYER_LIST = [
        { key: 'Fajr', label: 'Subuh' },
        { key: 'Dhuhr', label: 'Dzuhur' },
        { key: 'Asr', label: 'Ashar' },
        { key: 'Maghrib', label: 'Maghrib' },
        { key: 'Isha', label: 'Isya' },
    ];

    if (loading) return (
        <div className="w-full h-40 bg-white dark:bg-slate-800 rounded-3xl animate-pulse shadow-xl flex items-center justify-center text-slate-300 border border-slate-100 dark:border-slate-700">
            <span className="sr-only">Memuat Jadwal...</span>
        </div>
    );

    if (!prayerData) return null;

    return (
        <div className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] dark:shadow-black/50 border border-slate-100 dark:border-slate-700 overflow-hidden transform transition-transform hover:scale-[1.01] duration-500 will-change-transform">
            <div className="p-6 md:p-8">
                {/* Top Row: Location & Hijri */}
                <div className="flex justify-between items-center mb-6 text-xs md:text-sm font-medium text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate max-w-[150px]">{locationName}</span>
                    </div>
                    <span className="font-arabic text-slate-500 dark:text-slate-300">
                        {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
                    </span>
                </div>

                {/* Middle Row: Countdown */}
                <div className="text-center mb-8">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-bold">Menuju {nextPrayerName}</p>
                    {/* Added tabular-nums to prevent layout jitter during countdown */}
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-indigo-600 dark:from-teal-400 dark:to-indigo-400">
                        {timeLeft}
                    </h2>
                </div>

                {/* Bottom Row: Grid Times */}
                <div className="grid grid-cols-5 gap-1 md:gap-4 border-t border-slate-50 dark:border-slate-700/50 pt-6">
                    {PRAYER_LIST.map((p) => {
                        const time = prayerData.timings[p.key as keyof typeof prayerData.timings];
                        const isActive = nextPrayerName === p.label;
                        
                        return (
                            <div key={p.key} className="flex flex-col items-center group cursor-default">
                                <span className={`text-[10px] font-bold uppercase mb-1 transition-colors ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
                                    {p.label}
                                </span>
                                <span className={`text-xs md:text-sm font-bold transition-all tabular-nums ${isActive ? 'text-slate-900 dark:text-white scale-110' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {time}
                                </span>
                                {/* Status Indicator Dot */}
                                <div className={`w-1 h-1 rounded-full mt-1 transition-colors duration-300 ${isActive ? 'bg-teal-500' : 'bg-transparent'}`}></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};