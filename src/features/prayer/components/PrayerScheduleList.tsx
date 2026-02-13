import React, { useEffect, useRef } from 'react';
import type { PrayerData } from '../../../types.ts';
import { BsSunrise, BsSun, BsCloudSun, BsSunset, BsMoonStars } from 'react-icons/bs';

interface PrayerScheduleListProps {
    data: PrayerData[];
    monthLabel: string;
}

export const PrayerScheduleList: React.FC<PrayerScheduleListProps> = ({ data, monthLabel }) => {
    const today = new Date().toISOString().split('T')[0];
    const itemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        // Scroll to today
        if (itemRefs.current[today]) {
            itemRefs.current[today]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [today, data]);

    const getFastingType = (item: PrayerData) => {
        const hijriDay = parseInt(item.date.hijri.day, 10);
        // Ayyamul Bidh: 13, 14, 15 Hijri
        if ([13, 14, 15].includes(hijriDay)) return 'ayyamul-bidh';

        // Monday (1) & Thursday (4)
        const dayName = item.date.gregorian.weekday.en.toLowerCase();
        if (dayName === 'monday' || dayName === 'thursday') return 'senin-kamis';

        if (dayName === 'monday' || dayName === 'thursday') return 'senin-kamis';
        return 'none';
    };

    const getDayNameID = (enDay: string) => {
        const map: Record<string, string> = {
            'Sunday': 'Ahad',
            'Monday': 'Senin',
            'Tuesday': 'Selasa',
            'Wednesday': 'Rabu',
            'Thursday': 'Kamis',
            'Friday': 'Jumat',
            'Saturday': 'Sabtu'
        };
        return map[enDay] || enDay;
    };

    const getMonthNameID = (enMonth: string) => {
        const map: Record<string, string> = {
            'January': 'Januari',
            'February': 'Februari',
            'March': 'Maret',
            'April': 'April',
            'May': 'Mei',
            'June': 'Juni',
            'July': 'Juli',
            'August': 'Agustus',
            'September': 'September',
            'October': 'Oktober',
            'November': 'November',
            'December': 'Desember'
        };
        return map[enMonth] || enMonth;
    };

    return (
        <div className="space-y-4 animate-fade-in pb-20">
            <div className="flex flex-col mb-4 px-1 gap-2">
                <h3 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">
                    {monthLabel}
                </h3>
            </div>

            {data.map((item, idx) => {
                const itemDateStr = `${item.date.gregorian.year}-${item.date.gregorian.month.number.toString().padStart(2, '0')}-${item.date.gregorian.day}`;
                const isToday = itemDateStr === today;
                const fasting = getFastingType(item);

                return (
                    <div
                        key={idx}
                        ref={el => itemRefs.current[itemDateStr] = el}
                        className={`rounded-2xl p-4 border transition-all ${isToday
                            ? 'bg-white dark:bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        {/* Header: Date & Hijri */}
                        <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                            <div>
                                <h4 className={`font-bold text-lg ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                    {getDayNameID(item.date.gregorian.weekday.en)}, {item.date.gregorian.day} {getMonthNameID(item.date.gregorian.month.en)}
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                    {item.date.hijri.day} {item.date.hijri.month.en} {item.date.hijri.year}H
                                </p>
                            </div>
                            {fasting !== 'none' && (
                                <span className={`px-2 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wide ${fasting === 'ayyamul-bidh'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                                    : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                    }`}>
                                    {fasting === 'ayyamul-bidh' ? 'Ayyamul Bidh' : 'Senin Kamis'}
                                </span>
                            )}
                        </div>

                        {/* Times Grid */}
                        <div className="grid grid-cols-5 gap-2">
                            {/* Subuh */}
                            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-[10px] text-slate-400 mb-1"><BsSunrise /></span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    {item.timings.Fajr.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-1 uppercase">Subuh</span>
                            </div>

                            {/* Syuruq (Optional Logic) - Not displayed here but nice to have distinct icon if added */}
                            {/* Dzuhur (High Noon) */}
                            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-[10px] text-slate-400 mb-1"><BsSun /></span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    {item.timings.Dhuhr.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-1 uppercase">Dzuhur</span>
                            </div>

                            {/* Ashar (Lowering Sun) */}
                            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-[10px] text-slate-400 mb-1"><BsCloudSun /></span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    {item.timings.Asr.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-1 uppercase">Ashar</span>
                            </div>

                            {/* Maghrib */}
                            <div className="flex flex-col items-center p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30">
                                <span className="text-[10px] text-orange-500 mb-1"><BsSunset /></span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    {item.timings.Maghrib.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-1 uppercase">Maghrib</span>
                            </div>

                            {/* Isya */}
                            <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <span className="text-[10px] text-slate-400 mb-1"><BsMoonStars /></span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm">
                                    {item.timings.Isha.split(' ')[0]}
                                </span>
                                <span className="text-[9px] text-slate-400 mt-1 uppercase">Isya</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
