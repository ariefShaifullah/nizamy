import React, { useMemo } from 'react';
import type { HedeHistoryEntry, RiskLevel } from '../../../types.ts';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart 
} from 'recharts';
import { formatDate } from '../../../utils.ts';
import { FaHistory, FaArrowRight, FaTrash, FaChartLine, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';
import { useConfirm } from '../../../components/ui/ConfirmContext.tsx';

interface HedeHistoryProps {
    history: HedeHistoryEntry[];
    onLoad: (entry: HedeHistoryEntry) => void;
    onClear: () => void;
}

const getIconForRiskLevel = (level: RiskLevel, className: string = 'w-4 h-4') => {
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

export const HedeHistory: React.FC<HedeHistoryProps> = ({ history, onLoad, onClear }) => {
    const { confirm } = useConfirm();

    const chartData = useMemo(() => {
        // Reverse array to show oldest to newest on chart
        return [...history].reverse().map(entry => ({
            date: new Date(entry.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            score: entry.totalScore,
            fullDate: formatDate(entry.timestamp)
        }));
    }, [history]);

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
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="score" 
                                        stroke="#8b5cf6" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorScore)" 
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* History List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <h3 className="font-bold text-slate-800 dark:text-white">Riwayat Diagnosa</h3>
                            <button onClick={handleClear} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                                <FaTrash /> Bersihkan
                            </button>
                        </div>

                        {history.map((entry) => (
                            <div 
                                key={entry.id} 
                                onClick={() => onLoad(entry)}
                                className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-purple-200 dark:hover:border-purple-800 hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black ${getScoreColor(entry.totalScore)}`}>
                                        {entry.totalScore}
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-0.5">
                                            {formatDate(entry.timestamp)}
                                        </p>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-sm md:text-base flex items-center gap-2">
                                            {getIconForRiskLevel(entry.riskLevel)}
                                            {entry.totalScore > 80 ? 'Kondisi Aman (Halal)' : entry.totalScore > 50 ? 'Perlu Perbaikan (Syubhat)' : 'Perlu Tindakan Segera'}
                                        </h4>
                                    </div>
                                </div>
                                <div className="text-slate-300 group-hover:text-purple-500 transition-colors">
                                    <FaArrowRight />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};