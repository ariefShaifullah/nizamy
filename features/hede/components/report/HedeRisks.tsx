
import React, { useState } from 'react';
import type { RiskFactor, ViolationType } from '../../../../types.ts';
import { CATEGORY_LABELS, VIOLATION_LABELS } from '../../constants.ts';
import { FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface HedeRisksProps {
    risks: RiskFactor[];
    onOpenTerm: (term: string) => void;
}

const ViolationBadge: React.FC<{ type: ViolationType, onClick?: () => void }> = ({ type, onClick }) => {
    if (type === 'none') return null;

    // Adjusted styles for better contrast (WCAG AA compliant) - Darker Text
    const badgeStyles: Record<ViolationType, string> = {
        riba: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800',
        gharar: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-800',
        maysir: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800',
        zulm: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
        none: 'hidden'
    };

    return (
        <button 
            onClick={onClick}
            disabled={!onClick}
            className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md border ${badgeStyles[type]} ${onClick ? 'hover:brightness-95 cursor-help transition-all active:scale-95' : ''} whitespace-normal text-center leading-tight`}
        >
            {VIOLATION_LABELS[type]}
        </button>
    );
};

const RiskCard: React.FC<{ risk: RiskFactor; onTermClick: (term: string) => void }> = ({ risk, onTermClick }) => {
    const getTermForViolation = (type: ViolationType) => {
        const map: Record<string, string> = { 'riba': 'Riba', 'gharar': 'Gharar', 'maysir': 'Maysir' };
        return map[type] || 'Akad Fasid';
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-500 transition-colors group">
            {/* Header: Use flex-wrap to handle long text gracefully */}
            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                <span className={`text-[10px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300`}>
                    {CATEGORY_LABELS[risk.category]}
                </span>
                <ViolationBadge 
                    type={risk.violationType} 
                    onClick={() => onTermClick(getTermForViolation(risk.violationType))}
                />
            </div>
            
            <h4 className="text-sm md:text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                {risk.title}
            </h4>
            
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 italic mb-4 leading-relaxed pl-3 border-l-4 border-slate-200 dark:border-slate-600">
                "{risk.description}"
            </p>
            
            <div className="text-[11px] bg-slate-50 dark:bg-slate-900/50 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-1.5">
                <span className="font-bold text-slate-800 dark:text-slate-300 bg-white dark:bg-slate-700 px-1.5 rounded border border-slate-200 dark:border-slate-600 w-fit">Dalil:</span> 
                <span>{risk.fiqhRule}</span>
            </div>
        </div>
    );
};

export const HedeRisks: React.FC<HedeRisksProps> = ({ risks, onOpenTerm }) => {
    const [showDetail, setShowDetail] = useState(true);

    const highRisks = risks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high');
    const mediumRisks = risks.filter(r => r.riskLevel === 'medium');

    return (
        <div className="space-y-4">
            <button 
                className="w-full flex items-center justify-between group py-2" 
                onClick={() => setShowDetail(!showDetail)}
            >
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                    <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl mr-3 text-slate-600 dark:text-slate-300 icon-wrapper w-8 h-8 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <FaExclamationTriangle size={16}/>
                    </span>
                    Analisis Risiko Detail
                </h3>
                <div className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 transition-colors ${showDetail ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                    {showDetail ? 'Tutup' : 'Buka'} 
                    <span className="icon-wrapper w-3 h-3">{showDetail ? <FaChevronUp/> : <FaChevronDown/>}</span>
                </div>
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showDetail ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                    {/* Critical Risks */}
                    <div className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl p-4 md:p-6 border border-red-100 dark:border-red-900/30">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-red-200 dark:border-red-900/30">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                            <h4 className="text-sm font-extrabold text-red-900 dark:text-red-200 uppercase tracking-wide">
                                Pelanggaran Berat
                            </h4>
                        </div>
                        
                        {highRisks.length > 0 ? (
                            <div className="space-y-4">
                                {highRisks.map(risk => (
                                    <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center">
                                <div className="text-4xl mb-3">✅</div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">Alhamdulillah bersih.</p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs">Tidak ada pelanggaran berat.</p>
                            </div>
                        )}
                    </div>

                    {/* Moderate Risks */}
                    <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-4 md:p-6 border border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-amber-200 dark:border-amber-900/30">
                            <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                            <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                                Perlu Perhatian (Syubhat)
                            </h4>
                        </div>

                        {mediumRisks.length > 0 ? (
                            <div className="space-y-4">
                                {mediumRisks.map(risk => (
                                    <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 flex flex-col items-center">
                                <div className="text-4xl mb-3">✨</div>
                                <p className="text-slate-600 dark:text-slate-300 text-sm font-bold">Aman dari syubhat.</p>
                                <p className="text-slate-400 dark:text-slate-500 text-xs">Transaksi Anda relatif jelas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
