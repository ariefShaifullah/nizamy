import React, { useRef, useEffect, useState } from 'react';
import type { PrayerData } from '../../../types.ts';
import { FaInfoCircle, FaChevronRight } from 'react-icons/fa';

interface PrayerCalendarProps {
    data: PrayerData[];
    monthLabel: string;
}

export const PrayerCalendar: React.FC<PrayerCalendarProps> = ({ data, monthLabel }) => {
    const today = new Date().toISOString().split('T')[0];
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollHint, setShowScrollHint] = useState(true);
    const [currentPrayer, setCurrentPrayer] = useState<string | null>(null);

    const getFastingType = (item: PrayerData) => {
        const hijriDay = parseInt(item.date.hijri.day, 10);
        // Ayyamul Bidh: 13, 14, 15 Hijri
        if ([13, 14, 15].includes(hijriDay)) return 'ayyamul-bidh';
        
        // Monday (1) & Thursday (4)
        const dayName = item.date.gregorian.weekday.en.toLowerCase();
        if (dayName === 'monday' || dayName === 'thursday') return 'senin-kamis';
        
        return 'none';
    };

    // Auto scroll to today & Determine active prayer slot
    useEffect(() => {
        // Scroll Logic
        if (scrollContainerRef.current) {
            const activeRow = document.getElementById(`prayer-row-active`);
            if (activeRow) {
                activeRow.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
        }

        // Active Prayer Slot Logic
        const now = new Date();
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTime = currentHour * 60 + currentMin;

        // Find today's data
        const todayData = data.find(item => {
            const itemDateStr = `${item.date.gregorian.year}-${item.date.gregorian.month.number.toString().padStart(2,'0')}-${item.date.gregorian.day}`;
            return itemDateStr === today;
        });

        if (todayData) {
            const prayers = [
                { name: 'Fajr', time: todayData.timings.Fajr },
                { name: 'Dhuhr', time: todayData.timings.Dhuhr },
                { name: 'Asr', time: todayData.timings.Asr },
                { name: 'Maghrib', time: todayData.timings.Maghrib },
                { name: 'Isha', time: todayData.timings.Isha },
            ];

            // Convert to minutes and find current active period
            let active = null;
            for (let i = 0; i < prayers.length; i++) {
                const [h, m] = prayers[i].time.split(':').map(Number);
                const pTime = h * 60 + m;
                
                // If current time is AFTER this prayer start, it might be the active one
                // until the next prayer starts
                if (currentTime >= pTime) {
                    active = prayers[i].name;
                }
            }
            setCurrentPrayer(active);
        }

    }, [data, today]);

    const handleScroll = () => {
        if (showScrollHint) setShowScrollHint(false);
    };

    // Helper to check if a specific cell should be highlighted
    const isCellActive = (isTodayRow: boolean, prayerName: string) => {
        return isTodayRow && currentPrayer === prayerName;
    };

    return (
        <div className="animate-fade-in relative">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 px-1 gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl tracking-tight">
                    {monthLabel}
                </h3>
                <div className="flex gap-2 text-[10px] font-bold self-start md:self-auto">
                    <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Senin-Kamis
                    </span>
                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 rounded-lg flex items-center gap-1.5 border border-amber-200 dark:border-amber-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Ayyamul Bidh
                    </span>
                </div>
            </div>

            <div className="my-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl flex items-start gap-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border border-slate-100 dark:border-slate-800">
                <span className="icon-wrapper w-4 h-4 mt-0.5 shrink-0 text-slate-400"><FaInfoCircle /></span>
                <p>
                    <span className="block mb-1 font-bold text-slate-600 dark:text-slate-300">Catatan Akurasi:</span>
                    Jadwal sholat menggunakan metode Kemenag RI. Waktu yang ditampilkan mungkin memiliki selisih 1-2 menit (Ihtiyati) dengan masjid setempat. 
                    Geser tabel ke kiri/kanan untuk melihat waktu sholat lengkap pada layar kecil.
                </p>
            </div>

            {/* Main Table Container */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
                
                {/* Scroll Hint Overlay (Mobile Only) */}
                {showScrollHint && (
                    <div className="md:hidden absolute inset-y-0 right-0 w-16 bg-linear-to-l from-slate-900/20 to-transparent pointer-events-none z-popover flex items-center justify-end pr-2 animate-pulse">
                        <div className="text-white drop-shadow-md"><FaChevronRight /></div>
                    </div>
                )}

                <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="overflow-auto custom-scrollbar max-h-[75vh] w-full"
                >
                    <table className="w-full min-w-[600px] border-collapse text-left relative">
                        <thead className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            <tr className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-700">
                                {/* STICKY CORNER */}
                                <th className="sticky top-0 left-0 z-tooltip bg-slate-50 dark:bg-slate-900 p-4 w-28 border-r border-b border-slate-200 dark:border-slate-700 shadow-[2px_2px_5px_-2px_rgba(0,0,0,0.05)]">
                                    Tanggal
                                </th>
                                {/* STICKY HEADERS */}
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center border-b border-slate-200 dark:border-slate-700">Subuh</th>
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center text-slate-400 font-normal border-b border-slate-200 dark:border-slate-700">Syuruq</th>
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center border-b border-slate-200 dark:border-slate-700">Dzuhur</th>
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center border-b border-slate-200 dark:border-slate-700">Ashar</th>
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center border-b border-slate-200 dark:border-slate-700">Maghrib</th>
                                <th className="sticky top-0 z-dropdown bg-slate-50 dark:bg-slate-900/90 backdrop-blur-sm p-4 text-center border-b border-slate-200 dark:border-slate-700">Isya</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm">
                            {data.map((item, idx) => {
                                const itemDateStr = `${item.date.gregorian.year}-${item.date.gregorian.month.number.toString().padStart(2,'0')}-${item.date.gregorian.day}`;
                                const isTodayRow = itemDateStr === today;
                                const fasting = getFastingType(item);
                                
                                return (
                                    <tr 
                                        key={idx}
                                        id={isTodayRow ? 'prayer-row-active' : undefined}
                                        className={`group transition-colors ${
                                            isTodayRow 
                                            ? 'bg-indigo-50/30 dark:bg-indigo-900/10' 
                                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        {/* STICKY COLUMN (Date) */}
                                        <td className={`sticky left-0 z-card p-3 pl-4 border-r border-slate-100 dark:border-slate-700/50 transition-colors shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] ${
                                            isTodayRow 
                                            ? 'bg-indigo-50/95 dark:bg-slate-900/95 backdrop-blur-md' 
                                            : 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md group-hover:bg-slate-50 dark:group-hover:bg-slate-800'
                                        }`}>
                                            <div className="flex flex-col">
                                                <span className={`font-bold font-mono text-base ${isTodayRow ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                                    {item.date.gregorian.day}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[60px]">
                                                        {item.date.hijri.day} {item.date.hijri.month.en.slice(0,3)}
                                                    </span>
                                                    {fasting !== 'none' && (
                                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${fasting === 'ayyamul-bidh' ? 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]' : 'bg-indigo-500'}`}></span>
                                                    )}
                                                </div>
                                            </div>
                                            {isTodayRow && (
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                                            )}
                                        </td>

                                        {/* Times with Active Highlight */}
                                        <td className={`p-3 text-center font-mono font-medium tabular-nums ${isCellActive(isTodayRow, 'Fajr') ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.timings.Fajr.split(' ')[0]}
                                        </td>
                                        <td className="p-3 text-center font-mono text-xs text-slate-400 tabular-nums">
                                            {item.timings.Sunrise.split(' ')[0]}
                                        </td>
                                        <td className={`p-3 text-center font-mono font-medium tabular-nums ${isCellActive(isTodayRow, 'Dhuhr') ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.timings.Dhuhr.split(' ')[0]}
                                        </td>
                                        <td className={`p-3 text-center font-mono font-medium tabular-nums ${isCellActive(isTodayRow, 'Asr') ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.timings.Asr.split(' ')[0]}
                                        </td>
                                        <td className={`p-3 text-center font-mono font-medium tabular-nums ${isCellActive(isTodayRow, 'Maghrib') ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.timings.Maghrib.split(' ')[0]}
                                        </td>
                                        <td className={`p-3 text-center font-mono font-medium tabular-nums ${isCellActive(isTodayRow, 'Isha') ? 'text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/50 dark:bg-indigo-900/30 rounded-lg' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {item.timings.Isha.split(' ')[0]}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};