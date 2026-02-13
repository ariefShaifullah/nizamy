
import React, { useState, useEffect } from 'react';
import { usePrayerSchedule } from './hooks/usePrayerSchedule.ts';
import { exportPrayerSchedulePdf } from './logic/pdf-export.ts';
import type { PrayerData } from '../../types.ts';
import { QiblaCompass } from './components/QiblaCompass.tsx';
import { PrayerCalendar } from './components/PrayerCalendar.tsx';
import { PrayerScheduleList } from './components/PrayerScheduleList.tsx';
import { useToast } from '../../components/ui/Toast.tsx';
import { useRouter } from '../../hooks/useRouter.ts';
import {
    FaCompass,
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaSpinner,
    FaChevronLeft,
    FaChevronRight,
    FaPrint
} from 'react-icons/fa';

type Tab = 'calendar' | 'qibla';

const PrayerApp: React.FC = () => {
    const { searchParams } = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('calendar');
    const { showToast } = useToast();

    // --- Voice Command Listener ---
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'qibla') {
            setActiveTab('qibla');
        } else if (tabParam === 'calendar') {
            setActiveTab('calendar');
        }
    }, [searchParams]);

    const {
        data: calendarData,
        locationName,
        coords,
        loading,
        currentDate,
        nextMonth,
        prevMonth,
        resetToToday
    } = usePrayerSchedule<PrayerData[]>('monthly');

    const [compassPermission, setCompassPermission] = useState(false);

    const monthLabel = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

    const handleDownloadPdf = async () => {
        if (!calendarData || calendarData.length === 0) {
            showToast("Data jadwal belum tersedia.", "error");
            return;
        }
        showToast("Menyiapkan dokumen PDF...", "info");
        try {
            // Using logic export with Smart Pagination
            await exportPrayerSchedulePdf(calendarData, locationName, monthLabel);
            showToast("Download dimulai.", "success");
        } catch (e) {
            console.error(e);
            showToast("Gagal membuat PDF.", "error");
        }
    };

    return (
        <div className="min-h-screen pb-24 max-w-4xl mx-auto animate-fade-in px-4 md:px-6">

            {/* Header Card */}
            <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <FaCompass size={150} />
                </div>

                <div className="relative z-raised">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Jadwal Sholat & Kiblat</h1>
                    <div className="flex items-center gap-2 text-slate-300 text-sm font-medium bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
                        {loading ? (
                            <span className="animate-spin block"><FaSpinner /></span>
                        ) : (
                            <span className="text-red-400 block"><FaMapMarkerAlt /></span>
                        )}
                        {locationName}
                    </div>
                </div>
            </div>

            {/* Tabs - Sticky with precise offset to clear Fixed Header (5rem approx) + Safe Area */}
            <div className="sticky top-[calc(4rem+env(safe-area-inset-top))] z-sticky flex p-1.5 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl mb-8 shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all">
                <button
                    onClick={() => {
                        setActiveTab('calendar');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'calendar' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <span className="icon-wrapper w-4 h-4"><FaCalendarAlt /></span>
                    <span>Jadwal</span>
                </button>
                <button
                    onClick={() => {
                        setActiveTab('qibla');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'qibla' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
                >
                    <span className="icon-wrapper w-4 h-4"><FaCompass /></span>
                    <span>Arah Kiblat</span>
                </button>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {activeTab === 'calendar' ? (
                    <div className="space-y-6">
                        {/* Month Navigation Control */}
                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                            <button
                                onClick={prevMonth}
                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
                                aria-label="Bulan Sebelumnya"
                            >
                                <FaChevronLeft />
                            </button>

                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{monthLabel}</h3>
                                {!isCurrentMonth && (
                                    <button
                                        onClick={resetToToday}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline mt-0.5"
                                    >
                                        Kembali ke Hari Ini
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={nextMonth}
                                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400"
                                aria-label="Bulan Berikutnya"
                            >
                                <FaChevronRight />
                            </button>
                        </div>

                        {/* Calendar View */}
                        {loading ? (
                            <div className="space-y-4 animate-pulse">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
                                        <div className="flex justify-between">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2">
                                            {[1, 2, 3, 4, 5].map((j) => (
                                                <div key={j} className="h-10 bg-slate-100 dark:bg-slate-700/50 rounded-xl"></div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="hidden md:block">
                                    <PrayerCalendar data={calendarData || []} monthLabel={monthLabel} />
                                </div>
                                <div className="md:hidden">
                                    <PrayerScheduleList data={calendarData || []} monthLabel={monthLabel} />
                                </div>
                            </>
                        )}

                        {/* Print Action */}
                        <button
                            onClick={handleDownloadPdf}
                            disabled={loading || !calendarData || calendarData.length === 0}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            <span className="icon-wrapper w-5 h-5"><FaPrint /></span>
                            Unduh PDF Jadwal
                        </button>
                    </div>
                ) : (
                    <div className="animate-fade-in-up">
                        {/* Render directly, skeleton inside QiblaCompass handles loading state */}
                        <QiblaCompass
                            latitude={coords?.lat ?? null}
                            longitude={coords?.lng ?? null}
                            hasPermission={compassPermission}
                            onPermissionGranted={() => setCompassPermission(true)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrayerApp;
