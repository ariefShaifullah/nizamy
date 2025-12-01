import React, { useEffect, useState, useCallback } from 'react';
import type { PrayerData } from '../../../types.ts';
import { getCoordinates, fetchPrayerTimes, fetchCityName, getNextPrayer, formatTimeLeft, savePrayerCache, getCachedPrayerData } from '../logic/prayer.service.ts';
import { FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export const PrayerWidget: React.FC = () => {
    const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
    const [loading, setLoading] = useState(true);
    const [locationName, setLocationName] = useState("Memuat lokasi...");
    
    const [targetDate, setTargetDate] = useState<Date | null>(null);
    const [nextPrayerName, setNextPrayerName] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>("00:00:00");

    const loadData = useCallback(async (forceRefresh = false) => {
        setLoading(true);

        const updateLocationInBackground = async (currentData: PrayerData) => {
            try {
                const coords = await getCoordinates();
                const accurateCity = await fetchCityName(coords.latitude, coords.longitude);
                if (accurateCity && accurateCity !== "Lokasi Anda" && accurateCity !== "Lokasi Terdeteksi") {
                    setLocationName(accurateCity);
                    savePrayerCache(currentData, accurateCity);
                }
            } catch { }
        };
        
        if (!forceRefresh) {
            const cached = getCachedPrayerData();
            if (cached) {
                setPrayerData(cached.data);
                setLocationName(cached.city);
                setLoading(false);
                if (cached.city === "Lokasi Anda" || cached.city === "Lokasi Terdeteksi" || cached.city === "Jakarta Pusat") {
                    updateLocationInBackground(cached.data);
                }
                return;
            }
        }

        try {
            const coords = await getCoordinates();
            const [data, city] = await Promise.all([
                fetchPrayerTimes(coords.latitude, coords.longitude),
                fetchCityName(coords.latitude, coords.longitude)
            ]);

            if (data) {
                setPrayerData(data);
                setLocationName(city);
                savePrayerCache(data, city);
            } else {
                 setLocationName("Gagal memuat jadwal");
            }
        } catch (error) {
            const data = await fetchPrayerTimes(-6.1702, 106.8314);
            if (data) {
                setPrayerData(data);
                setLocationName("Jakarta Pusat");
                if (!forceRefresh) savePrayerCache(data, "Jakarta Pusat");
            } else {
                setLocationName("Gagal memuat jadwal");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
        const handleRefresh = () => loadData(true);
        window.addEventListener('nizamy-refresh-prayer', handleRefresh);
        return () => window.removeEventListener('nizamy-refresh-prayer', handleRefresh);
    }, [loadData]);

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
                loadData(false); 
            } else {
                setTimeLeft(formatTimeLeft(diff));
            }
        };

        tick();
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

    if (loading && !prayerData) return (
        <div className="w-full h-24 bg-white dark:bg-slate-800 rounded-3xl animate-pulse shadow-sm border border-slate-100 dark:border-slate-700"></div>
    );

    if (!prayerData) return null;

    return (
        <div className="relative w-full bg-white dark:bg-slate-800 rounded-3xl shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Compact Padding */}
            <div className="px-5 py-4">
                
                {/* Header: Location & Hijri - Single Line */}
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <div  className="text-indigo-500" ><FaMapMarkerAlt/></div>
                        <span className="truncate max-w-[120px]">{locationName}</span>
                    </div>
                    <div className="text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                        {prayerData.date.hijri.day} {prayerData.date.hijri.month.en} {prayerData.date.hijri.year}
                    </div>
                </div>

                {/* Hero: Countdown & Next Prayer */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">
                            Menuju {nextPrayerName}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight font-mono tabular-nums text-slate-800 dark:text-white">
                            {timeLeft}
                        </h2>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 animate-pulse">
                        <FaClock />
                    </div>
                </div>

                {/* Footer: Compact Prayer Grid */}
                <div className="grid grid-cols-5 gap-1 border-t border-slate-100 dark:border-slate-700 pt-3">
                    {PRAYER_LIST.map((p) => {
                        const time = prayerData.timings[p.key as keyof typeof prayerData.timings];
                        const isActive = nextPrayerName === p.label;
                        
                        return (
                            <div key={p.key} className={`flex flex-col items-center justify-center p-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                                <span className={`text-[9px] font-bold uppercase mb-0.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                                    {p.label}
                                </span>
                                <span className={`text-xs font-bold ${isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                                    {time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};