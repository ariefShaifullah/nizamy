
import React from 'react';
import { 
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip 
} from 'recharts';
import type { HedeResult } from '../../../../types.ts';
import { CATEGORY_LABELS, RISK_CONFIG } from '../../constants.ts';

interface HedeChartsProps {
    result: HedeResult;
}

// Custom Tooltip for Radar
const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs md:text-sm z-50">
                <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{payload[0].payload.fullSubject}</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-slate-500 dark:text-slate-400">Skor:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{payload[0].value}/100</span>
                </div>
            </div>
        );
    }
    return null;
};

export const HedeCharts: React.FC<HedeChartsProps> = ({ result }) => {
    const riskConfig = RISK_CONFIG[result.riskLevel];
    
    // Determine Score Color directly from risk config
    const scoreColorClass = riskConfig.text;
    const strokeColorHex = riskConfig.hex;

    const radarData = result.categoryScores.map(c => ({
        subject: CATEGORY_LABELS[c.category].split(' ')[0], // Short label for chart
        fullSubject: CATEGORY_LABELS[c.category],
        A: c.score,
        fullMark: 100
    }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. Overall Score (Gauge) */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-6 md:p-8 text-center relative overflow-hidden flex flex-col justify-center items-center">
                <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500"></div>
                
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Skor Kepatuhan</h3>
                
                <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center mb-4">
                    <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90 filter drop-shadow-lg">
                        <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <circle 
                            cx="80" cy="80" r="70" stroke={strokeColorHex} strokeWidth="10" fill="transparent" 
                            strokeDasharray={440} 
                            strokeDashoffset={440 - (440 * result.totalScore) / 100} 
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-out" 
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`text-3xl md:text-4xl font-black tracking-tighter ${scoreColorClass}`}>{result.totalScore}</span>
                    </div>
                </div>
                
                <div className={`inline-flex px-3 py-1 md:px-4 md:py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide border ${riskConfig.bg} ${riskConfig.text} ${riskConfig.border}`}>
                    {result.totalScore > 80 ? 'Halal Thayyib' : result.totalScore > 50 ? 'Syubhat' : 'Haram / Kritis'}
                </div>
            </div>

            {/* B. Radar Chart (Detail Balance) */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 p-4 md:p-8 relative">
                <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 absolute top-6 left-6 md:top-8 md:left-8">Peta Diagnosa</h3>
                
                <div className="w-full h-[250px] md:h-[320px] mt-4 md:mt-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" strokeOpacity={0.5} />
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar
                                name="Skor"
                                dataKey="A"
                                stroke={strokeColorHex}
                                strokeWidth={3}
                                fill={strokeColorHex}
                                fillOpacity={0.3}
                            />
                            <Tooltip content={<CustomRadarTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="absolute bottom-4 right-6 md:bottom-6 md:right-8 text-right">
                    <p className="text-[10px] md:text-xs text-slate-400 italic">Semakin luas area warna,<br/>semakin aman harta Anda.</p>
                </div>
            </div>
        </div>
    );
};
