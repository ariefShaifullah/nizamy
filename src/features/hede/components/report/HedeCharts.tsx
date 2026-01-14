import React, { forwardRef } from 'react';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, TooltipProps 
} from 'recharts';
import type { HedeResult, RiskLevel } from '../../../../types.ts';
import { CATEGORY_LABELS, RISK_CONFIG } from '../../constants.ts';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaMedal } from 'react-icons/fa';

interface HedeChartsProps {
    result: HedeResult;
    isResolved?: boolean;
    dynamicScore?: number;
}

// Strict typing for Recharts Tooltip
interface CustomRadarTooltipProps extends TooltipProps<number, string> {
    active?: boolean;
    payload?: any[];
}

const CustomRadarTooltip: React.FC<CustomRadarTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length && payload[0].payload) {
        const data = payload[0].payload;
        return (
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl text-sm z-50">
                <p className="font-bold text-slate-800 dark:text-white mb-2 text-center border-b border-slate-100 dark:border-slate-700 pb-2">
                    {data.fullSubject}
                </p>
                <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">Skor Keamanan</span>
                    <span className="font-black text-indigo-600 dark:text-indigo-400 text-lg">{payload[0].value}/100</span>
                </div>
            </div>
        );
    }
    return null;
};

const getIconForRiskLevel = (level: RiskLevel) => {
    switch(level) {
        case 'safe':
        case 'low':
            return <FaCheckCircle />;
        case 'medium':
        case 'high':
            return <FaExclamationTriangle />;
        case 'critical':
            return <FaExclamationCircle />;
        default:
            return null;
    }
}

export const HedeCharts = forwardRef<HTMLDivElement, HedeChartsProps>(({ result, isResolved, dynamicScore }, ref) => {
    let effectiveScore = result.totalScore;
    if (isResolved) {
        effectiveScore = 100;
    } else if (dynamicScore !== undefined) {
        effectiveScore = dynamicScore;
    }

    let effectiveRiskLevel: RiskLevel = result.riskLevel;
    if (effectiveScore > 90) effectiveRiskLevel = 'safe';
    else if (effectiveScore > 80) effectiveRiskLevel = 'low';
    else if (effectiveScore > 50) effectiveRiskLevel = 'medium';
    
    if (isResolved) effectiveRiskLevel = 'safe';

    const riskConfig = RISK_CONFIG[effectiveRiskLevel];
    const scoreColorClass = riskConfig.text;
    const strokeColorHex = riskConfig.hex;

    const radarData = result.categoryScores.map(c => ({
        subject: CATEGORY_LABELS[c.category].split(' ')[0], // Short label
        fullSubject: CATEGORY_LABELS[c.category],
        A: isResolved ? 100 : c.score,
        fullMark: 100
    }));

    let statusLabel = effectiveScore > 80 ? 'Halal Thayyib' : effectiveScore > 50 ? 'Syubhat' : 'Kritis (Haram)';
    if (isResolved) statusLabel = "Ikhtiar Tuntas (Insya Allah Aman)";
    else if (effectiveScore > result.totalScore) statusLabel = "Progres Membaik";
    
    const statusIcon = isResolved ? <FaMedal /> : getIconForRiskLevel(effectiveRiskLevel);

    return (
        <>
            {/* --- VISIBLE COMPONENT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* A. Overall Score (Gauge) */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                    <div className={`absolute top-0 w-full h-1.5 ${riskConfig.bg.replace('bg-', 'bg-linear-to-r from-transparent via-')}`}></div>
                    
                    <div className="relative mb-6">
                        <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
                            <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                            <circle 
                                cx="100" cy="100" r="85" stroke={strokeColorHex} strokeWidth="12" fill="transparent" 
                                strokeDasharray={534} 
                                strokeDashoffset={534 - (534 * effectiveScore) / 100} 
                                strokeLinecap="round"
                                className="transition-all duration-1500 ease-out drop-shadow-md" 
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                                {isResolved ? 'Proyeksi Skor' : dynamicScore !== undefined && dynamicScore > result.totalScore ? 'Skor Saat Ini' : 'Skor Awal'}
                            </span>
                            <span className={`text-5xl font-black tracking-tighter ${scoreColorClass} transition-all duration-700`}>{effectiveScore}</span>
                        </div>
                    </div>
                    
                    <div className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide border-2 flex items-center gap-2 ${riskConfig.bg} ${riskConfig.text} ${riskConfig.border}`}>
                        {statusIcon && <span className="icon-wrapper w-3 h-3">{statusIcon}</span>}
                        <span>{statusLabel}</span>
                    </div>
                    
                    <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed max-w-[200px]">
                        {isResolved 
                            ? "Alhamdulillah, Anda telah menyelesaikan semua langkah perbaikan." 
                            : dynamicScore !== undefined && dynamicScore > result.totalScore
                                ? "Skor meningkat seiring progres roadmap Anda. Terus tingkatkan!"
                                : "Skor ini mencerminkan tingkat kepatuhan transaksi awal Anda."}
                    </p>
                </div>

                {/* B. Radar Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                            Peta Diagnosa {isResolved ? '(Proyeksi)' : ''}
                        </h3>
                    </div>
                    
                    <div className="w-full h-[280px] md:h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" strokeOpacity={0.6} className="dark:stroke-slate-600" />
                                <PolarAngleAxis 
                                    dataKey="subject" 
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} 
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Skor"
                                    dataKey="A"
                                    stroke={strokeColorHex}
                                    strokeWidth={3}
                                    fill={strokeColorHex}
                                    fillOpacity={0.2}
                                />
                                <Tooltip content={<CustomRadarTooltip />} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="absolute bottom-6 right-8 text-right hidden md:block">
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Interpretasi</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic">Area grafik yang luas menandakan<br/>kesehatan ekonomi yang baik.</p>
                    </div>
                </div>
            </div>

            {/* --- HIDDEN SHARE CARD TEMPLATE --- */}
            <div ref={ref} className="absolute top-0 -left-[9999px] w-[450px] p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col items-center">
                {/* Simplified template for sharing, keeping structure but cleaning redundant code */}
                <div className="flex items-center gap-2 mb-4">
                    <div>
                        <h3 className="font-black text-2xl text-slate-800 dark:text-white leading-none">HEDE Report</h3>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">NIZAMY App</p>
                    </div>
                </div>
                <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-4"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{isResolved ? 'Proyeksi Skor' : 'Skor Kepatuhan'}</span>
                <span className={`text-7xl font-black tracking-tighter ${scoreColorClass}`}>{effectiveScore}</span>
                <div className={`mt-2 px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wide border-2 flex items-center gap-2 ${riskConfig.bg} ${riskConfig.text} ${riskConfig.border}`}>
                    <span>{statusLabel}</span>
                </div>
            </div>
        </>
    );
});