import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AMAL_TASKS, AMAL_FAQ } from './constants.ts';
import { getLogForDate, toggleTaskCompletion, getHistoryRange, getLogDateKey } from './logic/amal.service.ts';
import type { DailyAmalLog, AmalCategory } from './types.ts';
import { Heatmap } from './components/Heatmap.tsx';
import {
    FaChevronLeft, FaChevronRight, FaCalendarAlt,
    FaFire, FaCheckDouble, FaMosque, FaSun, FaHandHoldingHeart,
    FaCheck
} from 'react-icons/fa';
import { audioService } from '../../services/audio.service.ts';
import { useWakeLock } from '../../hooks/useWakeLock.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { FAQ } from '../../components/ui/FAQ.tsx';

// --- CONSTANTS ---
const CATEGORY_META: Record<AmalCategory, { title: string; subtitle: string; icon: React.ReactNode; color: string; gradient: string }> = {
    wajib: {
        title: 'Fardhu',
        subtitle: 'Tiang Agama',
        icon: <FaMosque />,
        color: 'text-emerald-600 dark:text-emerald-400',
        gradient: 'from-emerald-500 to-teal-600'
    },
    sunnah: {
        title: 'Sunnah',
        subtitle: 'Penyempurna',
        icon: <FaSun />,
        color: 'text-blue-600 dark:text-blue-400',
        gradient: 'from-blue-500 to-indigo-600'
    },
    social: {
        title: 'Sosial',
        subtitle: 'Hablum Minannas',
        icon: <FaHandHoldingHeart />,
        color: 'text-rose-600 dark:text-rose-400',
        gradient: 'from-rose-500 to-pink-600'
    }
};

// --- COMPONENT: CONFETTI OVERLAY ---
const CelebrationOverlay = ({ onDismiss }: { onDismiss: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="fixed inset-0 z-notification pointer-events-none flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] animate-fade-in"></div>
            <div className="relative animate-bounce-slow text-center">
                <div className="text-9xl filter drop-shadow-2xl animate-pulse">🎉</div>
                <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mt-4 tracking-tighter">
                    SEMPURNA!
                </h2>
                <p className="text-white/90 font-bold text-lg mt-2 drop-shadow-md">Istiqomah terus ya!</p>
            </div>
            {/* Simple CSS Particles */}
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full animate-ping"
                    style={{
                        top: `${Math.random() * 100}%`,
                        left: `${Math.random() * 100}%`,
                        backgroundColor: ['#34d399', '#f472b6', '#60a5fa', '#fbbf24'][Math.floor(Math.random() * 4)],
                        animationDuration: `${0.5 + Math.random()}s`,
                        animationDelay: `${Math.random()}s`
                    }}
                ></div>
            ))}
        </div>
    );
};

// --- COMPONENT: SCORE RING (REFINED) ---
const ScoreRing: React.FC<{ percentage: number; label: string }> = ({ percentage, label }) => {
    const radius = 55;
    const stroke = 8;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Gradient ID for SVG
    const gradientId = "scoreGradient";

    return (
        <div className="relative w-40 h-40 flex items-center justify-center mx-auto my-4 group">
            {/* Ambient Glow */}
            <div className={`absolute inset-0 rounded-full blur-2xl opacity-30 transition-colors duration-700 ${percentage === 100 ? 'bg-emerald-400' : 'bg-indigo-500'}`}></div>

            <svg
                height="100%"
                width="100%"
                viewBox={`0 0 ${radius * 2} ${radius * 2}`}
                className="transform -rotate-90 drop-shadow-lg relative z-card"
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={percentage === 100 ? "#34d399" : "#6366f1"} />
                        <stop offset="100%" stopColor={percentage === 100 ? "#10b981" : "#a855f7"} />
                    </linearGradient>
                </defs>
                {/* Track */}
                <circle
                    stroke="rgba(255,255,255,0.1)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress */}
                <circle
                    stroke={`url(#${gradientId})`}
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-dropdown">
                <span className="text-4xl font-black tracking-tighter leading-none font-mono">
                    {percentage}<span className="text-lg align-top opacity-60">%</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">
                    {label}
                </span>
            </div>
        </div>
    );
};

// --- COMPONENT: TASK CARD (ULTRA PREMIUM) ---
const TaskCard: React.FC<{
    task: typeof AMAL_TASKS[0];
    isCompleted: boolean;
    onToggle: (id: string) => void;
}> = React.memo(({ task, isCompleted, onToggle }) => {

    // Dynamic styles based on completion
    const bgClass = isCompleted
        ? `bg-linear-to-r ${CATEGORY_META[task.category].gradient} text-white border-transparent`
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700/50 hover:border-slate-200 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300';

    return (
        <button
            onClick={() => onToggle(task.id)}
            className={`
                group relative w-full flex items-center p-3.5 rounded-2xl border transition-all duration-300 ease-out outline-none 
                hover:shadow-lg hover:scale-[1.01] active:scale-[0.98]
                ${bgClass}
                ${isCompleted ? 'shadow-lg shadow-emerald-500/20' : 'shadow-sm'}
            `}
        >
            {/* Icon Box */}
            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center text-xl mr-4 transition-all duration-300 shrink-0 relative overflow-hidden
                ${isCompleted ? 'bg-white/20 text-white rotate-3' : 'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 group-hover:bg-slate-100 dark:group-hover:bg-slate-800'}
            `}>
                <span className={`relative z-card transition-transform duration-300 ${isCompleted ? 'scale-110' : 'group-hover:scale-110'}`}>{task.icon}</span>
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
                <h4 className={`font-bold text-sm leading-snug transition-colors ${isCompleted ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                    {task.label}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[10px] font-bold px-1.5 rounded-md ${isCompleted ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {task.points} XP
                    </span>
                </div>
            </div>

            {/* Checkmark Animator */}
            <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center ml-2 transition-all duration-300
                ${isCompleted ? 'bg-white border-white text-emerald-600 scale-100' : 'border-slate-200 dark:border-slate-600 bg-transparent text-transparent scale-90 group-hover:border-slate-300'}
            `}>
                <span className={`flex items-center justify-center w-full h-full transition-all duration-300 ${isCompleted ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
                    <FaCheck />
                </span>
            </div>
        </button>
    );
});

export const AmalYaumiApp: React.FC = () => {
    const { showToast } = useToast();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentLog, setCurrentLog] = useState<DailyAmalLog | null>(null);
    const [history, setHistory] = useState<DailyAmalLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    useWakeLock();

    const loadData = useCallback(async () => {
        setLoading(true);
        const dateKey = getLogDateKey(selectedDate);
        try {
            const [log, hist] = await Promise.all([
                getLogForDate(dateKey),
                getHistoryRange(150)
            ]);
            setCurrentLog(log);
            setHistory(hist);
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleToggle = async (taskId: string) => {
        const dateKey = getLogDateKey(selectedDate);
        const currentCompleted = currentLog?.completedTasks || [];
        const isNowCompleted = !currentCompleted.includes(taskId);

        // Instant UI Feedback
        if (isNowCompleted) audioService.playClick();
        else audioService.playClick();

        const newLog = await toggleTaskCompletion(dateKey, taskId);
        setCurrentLog(newLog);

        setHistory(prev => {
            const idx = prev.findIndex(p => p.date === dateKey);
            if (idx >= 0) {
                const copy = [...prev];
                copy[idx] = newLog;
                return copy;
            }
            return [...prev, newLog];
        });

        // 100% Celebration Trigger
        if (newLog.totalScore === 100 && currentLog?.totalScore !== 100) {
            audioService.playSuccessMajor();
            setShowCelebration(true);
        }
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        if (newDate > new Date()) return;
        setSelectedDate(newDate);
        audioService.playClick();
    };

    const completionPercent = currentLog ? currentLog.totalScore : 0;
    const isToday = getLogDateKey(selectedDate) === getLogDateKey(new Date());

    const streak = useMemo(() => {
        let count = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].totalScore > 0) count++;
            else if (i !== history.length - 1 && history[i].date < getLogDateKey(new Date())) break;
        }
        return count;
    }, [history]);

    const taskGroups = useMemo(() => {
        const groups: Record<AmalCategory, typeof AMAL_TASKS> = { wajib: [], sunnah: [], social: [] };
        AMAL_TASKS.forEach(t => groups[t.category].push(t));
        return groups;
    }, []);

    const markAllFardhu = async () => {
        const wajibIds = AMAL_TASKS.filter(t => t.category === 'wajib').map(t => t.id);
        const currentIds = currentLog?.completedTasks || [];
        const toAdd = wajibIds.filter(id => !currentIds.includes(id));

        if (toAdd.length === 0) {
            showToast("Semua Fardhu sudah selesai!", 'info');
            return;
        }

        for (const id of toAdd) {
            await handleToggle(id);
        }
        audioService.playSuccess();
        showToast("Alhamdulillah, Fardhu tuntas!", 'success');
    };

    const getMotivationText = (score: number) => {
        if (score === 100) return "Sempurna! Masya Allah.";
        if (score >= 80) return "Hebat! Pertahankan.";
        if (score >= 50) return "Bagus, tingkatkan lagi.";
        return "Ayo semangat beramal!";
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500 animate-fade-in relative overflow-x-hidden">

            {showCelebration && <CelebrationOverlay onDismiss={() => setShowCelebration(false)} />}

            {/* Background Noise Texture */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-background"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            {/* Main Content with CORRECT SPACING */}
            <div className="container mx-auto px-4 md:px-6 py-6 pb-24 md:pb-12 max-w-7xl relative z-raised">
                <div className="lg:grid lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT SIDEBAR (STICKY COMMAND CENTER) --- */}
                    <div className="lg:col-span-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:custom-scrollbar lg:pr-2 space-y-6 mb-8 lg:mb-0 transition-all duration-300">

                        {/* 1. Master Score Widget (Dark Glass) */}
                        <div className="relative overflow-hidden bg-slate-850 text-white rounded-3xl shadow-2xl shadow-indigo-900/20 p-6 text-center border border-white/5 group">
                            {/* Decorative Blobs */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="relative z-card">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="text-left">
                                        <h2 className="text-lg font-bold tracking-tight">Amal Yaumi</h2>
                                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                                            {selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-2 shadow-inner">
                                        <span className="text-orange-400"><FaFire /></span>
                                        <span className="font-mono font-bold text-sm">{streak}</span>
                                    </div>
                                </div>

                                <div className="py-2">
                                    <ScoreRing percentage={completionPercent} label="Selesai" />
                                </div>

                                <p className="text-sm font-medium text-slate-300 mt-2 bg-white/5 py-2 rounded-lg border border-white/5">
                                    "{getMotivationText(completionPercent)}"
                                </p>

                                {/* Date Navigation (Pill) */}
                                <div className="mt-6 flex items-center justify-between bg-black/20 rounded-full p-1.5 border border-white/5 backdrop-blur-sm">
                                    <button onClick={() => changeDate(-1)} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-slate-300 hover:text-white">
                                        <FaChevronLeft size={12} />
                                    </button>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                                        <span className="text-indigo-400"><FaCalendarAlt /></span>
                                        {isToday ? "Hari Ini" : "Arsip"}
                                    </div>
                                    <button onClick={() => changeDate(1)} disabled={isToday} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isToday ? 'text-slate-700 cursor-not-allowed' : 'text-slate-300 hover:text-white hover:bg-white/10'}`}>
                                        <FaChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. Quick Actions */}
                        {isToday && completionPercent < 100 && (
                            <button
                                onClick={markAllFardhu}
                                className="w-full py-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-200 dark:hover:border-indigo-800 hover:text-indigo-700 dark:hover:text-indigo-400 transition-all active:scale-[0.98]"
                            >
                                <span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400"><FaCheckDouble /></span>
                                Tandai Semua Fardhu
                            </button>
                        )}

                        {/* 3. Heatmap Widget */}
                        <div className="hidden lg:block">
                            <Heatmap data={history} />
                        </div>
                    </div>

                    {/* --- RIGHT CONTENT (TASK LISTS) --- */}
                    <div className="lg:col-span-8 space-y-8">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 text-slate-400">
                                <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                                <p className="text-sm font-medium">Memuat catatan...</p>
                            </div>
                        ) : (
                            <>
                                {/* Categories Loop */}
                                {(Object.keys(taskGroups) as AmalCategory[]).map(cat => {
                                    const tasks = taskGroups[cat];
                                    const completedCount = tasks.filter(t => currentLog?.completedTasks.includes(t.id)).length;
                                    const meta = CATEGORY_META[cat];

                                    return (
                                        <div key={cat} className="animate-fade-in-up">
                                            {/* Category Header */}
                                            <div className="flex items-center justify-between mb-4 pl-1">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${meta.gradient} text-white flex items-center justify-center shadow-md`}>
                                                        {meta.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className={`text-lg font-bold text-slate-800 dark:text-white leading-none`}>
                                                            {meta.title}
                                                        </h3>
                                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                                                            {meta.subtitle}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-2xl font-black text-slate-200 dark:text-slate-700">{completedCount}</span>
                                                    <span className="text-sm font-bold text-slate-300 dark:text-slate-600">/{tasks.length}</span>
                                                </div>
                                            </div>

                                            {/* Task Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {tasks.map(task => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        isCompleted={currentLog?.completedTasks.includes(task.id) || false}
                                                        onToggle={handleToggle}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Mobile Heatmap (Visible only on small screens) */}
                                <div className="lg:hidden pt-8 border-t border-slate-200 dark:border-slate-800">
                                    <Heatmap data={history} />
                                </div>
                            </>
                        )}
                    </div>

                </div>

                {/* FAQ SECTION (MOVED TO BOTTOM FULL WIDTH) */}
                <div className="mt-16 md:mt-20 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <FAQ
                        title="Tentang Amal Yaumi"
                        subtitle="Muhasabah Harian & Konsistensi"
                        data={AMAL_FAQ}
                    />
                </div>
            </div>
        </div>
    );
};

export default AmalYaumiApp;