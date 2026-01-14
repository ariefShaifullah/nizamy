import React, { useState } from 'react';
import type { RiskFactor, ViolationType, HedeTab } from '../../../../types.ts';
import { CATEGORY_LABELS, VIOLATION_LABELS } from '../../constants.ts';
import { FaExclamationTriangle, FaChevronDown, FaBook, FaBroom } from 'react-icons/fa';

interface HedeRisksProps {
    risks: RiskFactor[];
    onOpenTerm: (term: string) => void;
    onSwitchAppTab?: (tab: HedeTab) => void;
}

const ViolationBadge: React.FC<{ type: ViolationType, onClick?: () => void }> = ({ type, onClick }) => {
    if (type === 'none') return null;

    const badgeStyles: Record<ViolationType, string> = {
        riba: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        gharar: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
        maysir: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
        zulm: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        none: 'hidden'
    };

    return (
        <button 
            onClick={onClick}
            disabled={!onClick}
            className={`text-[10px] uppercase font-bold px-3 py-1 rounded-lg border ${badgeStyles[type]} transition-all active:scale-95 disabled:cursor-default`}
            title={`Klik untuk definisi ${VIOLATION_LABELS[type]}`}
        >
            {VIOLATION_LABELS[type]}
        </button>
    );
};

const RiskCard: React.FC<{ risk: RiskFactor; onTermClick: (term: string) => void; onSwitchAppTab?: (tab: HedeTab) => void; }> = ({ risk, onTermClick, onSwitchAppTab }) => {
    const getTermForViolation = (type: ViolationType) => {
        const map: Record<string, string> = { 'riba': 'Riba', 'gharar': 'Gharar', 'maysir': 'Maysir', 'zulm': 'Akad Fasid' };
        return map[type] || 'Akad Fasid';
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
            
            {/* Header */}
            <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500 pt-1">
                    {CATEGORY_LABELS[risk.category]}
                </span>
                <ViolationBadge 
                    type={risk.violationType} 
                    onClick={() => onTermClick(getTermForViolation(risk.violationType))}
                />
            </div>
            
            {/* Title */}
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {risk.title}
            </h4>
            
            {/* Description */}
            <div className="relative pl-4 mb-4 border-l-2 border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic leading-relaxed">
                    "{risk.description}"
                </p>
            </div>
            
            {/* Footer Dalil */}
            <div className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="icon-wrapper w-3 h-3 text-indigo-400 mt-0.5 shrink-0"><FaBook /></span>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-700 dark:text-slate-300 mr-1">Rujukan:</span> 
                    {risk.fiqhRule}
                </div>
            </div>
            
            {/* Contextual CTA for Riba */}
            {risk.violationType === 'riba' && onSwitchAppTab && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button 
                        onClick={() => onSwitchAppTab('tathhir')}
                        className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-95 group"
                    >
                        <span className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaBroom /></span>
                        Hitung Dana Tathhir
                    </button>
                </div>
            )}
        </div>
    );
};

export const HedeRisks: React.FC<HedeRisksProps> = ({ risks, onOpenTerm, onSwitchAppTab }) => {
    const [showDetail, setShowDetail] = useState(true);

    const highRisks = risks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high');
    const mediumRisks = risks.filter(r => r.riskLevel === 'medium');

    return (
        <div className="space-y-4">
            <button 
                className="w-full flex items-center justify-between group py-3 px-1" 
                onClick={() => setShowDetail(!showDetail)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-colors">
                        <span className="icon-wrapper w-5 h-5 flex items-center justify-center"><FaExclamationTriangle /></span>
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white leading-none">Analisis Risiko</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Detail pelanggaran yang terdeteksi</p>
                    </div>
                </div>
                
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${showDetail ? 'bg-slate-200 dark:bg-slate-700 rotate-180' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <span className="icon-wrapper w-3 h-3 text-slate-500 flex items-center justify-center"><FaChevronDown /></span>
                </div>
            </button>

            <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showDetail ? 'max-h-[4000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                    
                    {/* Critical Risks Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                Pelanggaran Berat
                            </h4>
                        </div>
                        
                        <div className="bg-red-50/50 dark:bg-red-950/10 rounded-3xl p-4 border border-red-100 dark:border-red-900/20 space-y-4">
                            {highRisks.length > 0 ? (
                                highRisks.map(risk => (
                                    <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} onSwitchAppTab={onSwitchAppTab} />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2 grayscale opacity-50">🛡️</div>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Bersih dari pelanggaran berat</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Moderate Risks Column */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2 px-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                Perlu Perhatian (Syubhat)
                            </h4>
                        </div>

                        <div className="bg-amber-50/50 dark:bg-amber-950/10 rounded-3xl p-4 border border-amber-100 dark:border-amber-900/20 space-y-4">
                            {mediumRisks.length > 0 ? (
                                mediumRisks.map(risk => (
                                    <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} onSwitchAppTab={onSwitchAppTab} />
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-3xl mb-2 grayscale opacity-50">✨</div>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Tidak ada syubhat signifikan</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};