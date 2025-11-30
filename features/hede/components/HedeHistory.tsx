
import React, { useMemo } from 'react';
import type { HedeHistoryEntry, RiskLevel, HedeResult } from '../../../types.ts';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Line
} from 'recharts';
import { formatDate } from '../../../utils.ts';
import { FaHistory, FaArrowRight, FaTrash, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaMedal, FaLightbulb } from 'react-icons/fa';
import { useConfirm } from '../../../components/ui/ConfirmContext.tsx';
import { calculateDynamicScore } from '../logic/hede.service.ts';

interface HedeHistoryProps {
    history: HedeHistoryEntry[];
    onLoad: (entry: HedeHistoryEntry) => void;
    onClear: () => void;
    currentResult: HedeResult | null;
    completedSteps: string[];
}

const getIconForRiskLevel = (level: RiskLevel, isResolved: boolean, className: string = 'w-4 h-4') => {
    if (isResolved) {
        return <div className={`icon-wrapper ${className} text-teal-500`}><FaMedal /></div>;
    }

    switch(level) {
        case 'safe':
        case 'low':
            return <div className={`icon-wrapper ${className} text-emerald-500`}><FaCheckCircle /></div>;
        case 'medium':
        case 'high':
            return <div className={`icon-wrapper ${className} text-yellow-500`}><FaExclamationTriangle /></div>;
        case 'critical':
            return <div className={`icon-wrapper ${className} text-red-500`}><FaExclamationCircle /></div>;
        default:
            return null;
    }
}

// Custom Dot untuk membedakan titik "Proyeksi"
const CustomizedDot = (props: any) => {
    const { cx, cy, payload } = props;
  
    if (payload.type === 'projected') {
      return (
        <svg x={cx - 6} y={cy - 6} width={12} height={12} fill="white" viewBox="0 0 1024 1024">
            <circle cx="512" cy="512" r="512" fill="#8b5cf6" fillOpacity="0.3" className="animate-ping" />
            <circle cx="512" cy="512" r="300" fill="#8b5cf6" stroke="white" strokeWidth="50" />
        </svg>
      );
    }
  
    return (
        <circle cx={cx} cy={cy} r={4} stroke="#8b5cf6" strokeWidth={2} fill="white" />
    );
};

export const HedeHistory: React.FC<HedeHistoryProps> = ({ history, onLoad, onClear, currentResult, completedSteps }) => {
    const { confirm } = useConfirm();

    const chartData = useMemo(() => {
        // Base historical data
        const data = [...history].reverse().map(entry => ({
            date: new Date(entry.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            score: entry.totalScore,
            fullDate: formatDate(entry.timestamp),
            type: 'history',
            riskLevel: entry.riskLevel
        }));

        // Append Current Dynamic State
        if (currentResult && data.length > 0) {
            const roadmapSteps = currentResult.roadmap.length;
            const completedCount = currentResult.roadmap.filter(s => completedSteps.includes(s.action)).length;
            
            const currentDynamicScore = calculateDynamicScore(currentResult.totalScore, roadmapSteps, completedCount);
            
            // If current score is significantly different from the last history entry, plot it as "Today"
            const lastEntry = data[data.length - 1];
            
            // Always show projection to indicate "Live Status"
            data.push({
                date: 'Sekarang',
                score: currentDynamicScore,
                fullDate: 'Status Saat Ini (Proyeksi Roadmap)',
                type: 'projected',
                riskLevel: currentDynamicScore > 80 ? 'safe' : currentDynamicScore > 50 ? 'medium' : 'critical'
            });
        }

        return data;
    }, [history, currentResult, completedSteps]);

    const handleClear = async () => {
        const isConfirmed = await confirm({
            title: 'Hapus Jurnal?',
            message: 'Semua catatan perkembangan hijrah Anda akan dihapus permanen.',
            confirmText: 'Hapus',
            variant: 'danger'
        });
        if (isConfirmed) onClear();
    };

    const getScoreColor = (score: number) => {
        if (score > 80) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30';
        if (score > 50) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4 md:px-0">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-purple-600 dark:text-purple-400"><FaHistory /></span> Jurnal Hijrah
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Pantau progres perbaikan ekonomi syariah Anda dari waktu ke waktu.
                    </p>
                </div>
            </div>

            {history.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <div className="icon-wrapper w-20 h-20 text-slate-300 dark:text-slate-600 mx-auto mb-4 flex items-center justify-center">
                        <FaChartLine size="3rem" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Catat Perjalanan Hijrahmu</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">
                        Setiap diagnosa yang kamu selesaikan akan tersimpan di sini. Pantau progresmu dari waktu ke waktu dan lihat seberapa jauh kamu telah melangkah.
                    </p>
                </div>
            ) : (
                <>
                    {/* Chart Section */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="mb-6 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
                                Grafik Tren Kepatuhan
                            </h3>
                            <span className="text-xs font-medium bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 px-3 py-1 rounded-full">
                                {history.length} Catatan
                            </span>
                        </div>
                        
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        domain={[0, 100]} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        labelFormatter={(label, payload) => {
                                            if (payload && payload.length > 0 && payload[0].payload.type === 'projected') {
                                                return "Proyeksi Saat Ini";
                                            }
                                            return label;
                                        }}
                                        formatter={(value: number, name: string, props: any) => {
                                            if (props.payload.type === 'projected') {
                                                return [`${value} (Dinamis)`, 'Skor'];
                                            }
                                            return [value, 'Skor'];
                                        }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="none"
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        dot={<CustomizedDot />}
                                        activeDot={{ r: 6, strokeWidth: 0 }}
                                        animationDuration={1500}
                                    />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* Legend for Projection */}
                        {chartData.some(d => d.type === 'projected') && (
                            <div className="flex items-start gap-2 mt-4 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                               <div className="text-yellow-500 mt-0.5 shrink-0" ><FaLightbulb /></div>
                                <p>
                                    Titik berdenyut menunjukkan <strong>Skor Dinamis</strong> yang naik seiring Anda menyelesaikan tugas di Roadmap, tanpa perlu melakukan diagnosa ulang.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <h3 className="font-bold text-slate-800 dark:text-white">Catatan Jurnal</h3>
                            <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                                <FaTrash /> Bersihkan
                            </button>
                        </div>

                        {history.map((entry) => {
                            // Calculate Real-time Status based on Roadmap Completion
                            const roadmap = entry.result.roadmap || [];
                            const totalSteps = roadmap.length;
                            // Only count steps relevant to this history entry's roadmap
                            const completedCount = roadmap.filter(step => completedSteps.includes(step.action)).length;
                            
                            const progress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 100;
                            const isResolved = progress === 100;
                            const hasProgress = progress > 0 && progress < 100;
                            
                            // Dynamic score for the list item view
                            const itemDynamicScore = calculateDynamicScore(entry.totalScore, totalSteps, completedCount);

                            return (
                                <div 
                                    key={entry.id} 
                                    onClick={() => onLoad(entry)}
                                    className={`group bg-white dark:bg-slate-800 p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden ${
                                        isResolved 
                                        ? 'border-teal-200 dark:border-teal-900/50 shadow-sm' 
                                        : 'border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md'
                                    }`}
                                >
                                    {isResolved && (
                                        <div className="absolute top-0 right-0 bg-teal-500 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl shadow-sm">
                                            SELESAI
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${
                                                isResolved 
                                                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' 
                                                : getScoreColor(itemDynamicScore)
                                            }`}>
                                                {itemDynamicScore}
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                                                    {formatDate(entry.timestamp)}
                                                </p>
                                                <h4 className={`font-bold text-sm md:text-base flex items-center gap-2 ${
                                                    isResolved ? 'text-teal-700 dark:text-teal-400' : 'text-slate-800 dark:text-white'
                                                }`}>
                                                    {getIconForRiskLevel(entry.riskLevel, isResolved)}
                                                    {isResolved 
                                                        ? 'Ikhtiar Tuntas (Resolved)' 
                                                        : itemDynamicScore > 80 
                                                            ? 'Kondisi Aman' 
                                                            : itemDynamicScore > 50 
                                                                ? 'Perlu Perbaikan' 
                                                                : 'Perlu Tindakan Segera'
                                                    }
                                                </h4>
                                            </div>
                                        </div>
                                        <div className="text-slate-300 group-hover:text-purple-500 transition-colors">
                                            <FaArrowRight />
                                        </div>
                                    </div>

                                    {/* Progress Bar for incomplete items */}
                                    {hasProgress && (
                                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                                            <div 
                                                className="h-full bg-indigo-500 rounded-full transition-all duration-1000"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};
