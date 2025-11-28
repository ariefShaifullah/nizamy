import React from 'react';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import type { HedeResult, RiskLevel } from '../../../../types.ts';
import { CATEGORY_LABELS, RISK_CONFIG } from '../../constants.ts';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

interface HedeChartsProps {
    result: HedeResult;
}

// Custom Tooltip for Radar
const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl text-sm z-50">
                <p className="font-bold text-slate-800 dark:text-white mb-2 text-center border-b border-slate-100 dark:border-slate-700 pb-2">{payload[0].payload.fullSubject}</p>
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

export const HedeCharts: React.FC<HedeChartsProps> = ({ result }) => {
    const riskConfig = RISK_CONFIG[result.riskLevel];
    const scoreColorClass = riskConfig.text;
    const strokeColorHex = riskConfig.hex;

    const radarData = result.categoryScores.map(c => ({
        subject: CATEGORY_LABELS[c.category].split(' ')[0], // Short label
        fullSubject: CATEGORY_LABELS[c.category],
        A: c.score,
        fullMark: 100
    }));

    const statusLabel = result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat' : 'Kritis (Haram)';
    const statusIcon = getIconForRiskLevel(result.riskLevel);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. Overall Score (Gauge) */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                <div className={`absolute top-0 w-full h-1.5 ${riskConfig.bg.replace('bg-', 'bg-gradient-to-r from-transparent via-')}`}></div>
                
                <div className="relative mb-6">
                    <svg viewBox="0 0 200 200" className="w-48 h-48 transform -rotate-90">
                        {/* Background Circle */}
                        <circle cx="100" cy="100" r="85" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        {/* Progress Circle */}
                        <circle 
                            cx="100" cy="100" r="85" stroke={strokeColorHex} strokeWidth="12" fill="transparent" 
                            strokeDasharray={534} 
                            strokeDashoffset={534 - (534 * result.totalScore) / 100} 
                            strokeLinecap="round"
                            className="transition-all duration-1500 ease-out drop-shadow-md" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Skor Total</span>
                        <span className={`text-5xl font-black tracking-tighter ${scoreColorClass}`}>{result.totalScore}</span>
                    </div>
                </div>
                
                <div className={`px-5 py-2 rounded-full text-xs font-extrabold uppercase tracking-wide border-2 flex items-center gap-2 ${riskConfig.bg} ${riskConfig.text} ${riskConfig.border}`}>
                    {statusIcon && <span className="icon-wrapper w-3 h-3">{statusIcon}</span>}
                    <span>{statusLabel}</span>
                </div>
                
                <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed max-w-[200px]">
                    Skor ini mencerminkan tingkat kepatuhan transaksi Anda terhadap kaidah Fiqh Muamalah.
                </p>
            </div>

            {/* B. Radar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-indigo-100/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                        Peta Diagnosa
                    </h3>
                </div>
                
                <div className="w-full h-[280px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" strokeOpacity={0.6} />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
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
    );
};