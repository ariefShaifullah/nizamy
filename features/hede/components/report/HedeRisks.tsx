
import React, { useState } from 'react';
import type { RiskFactor, ViolationType } from '../../../../types.ts';
import { CATEGORY_LABELS, VIOLATION_LABELS, RISK_CONFIG, VIOLATION_STYLES } from '../../constants.ts';
import { FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface HedeRisksProps {
    risks: RiskFactor[];
    onOpenTerm: (term: string) => void;
}

const ViolationBadge: React.FC<{ type: ViolationType, onClick?: () => void }> = ({ type, onClick }) => {
    if (type === 'none') return null;

    return (
        <button 
            onClick={onClick}
            disabled={!onClick}
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${VIOLATION_STYLES[type]} ${onClick ? 'hover:brightness-95 cursor-help' : ''}`}
        >
            {VIOLATION_LABELS[type]}
        </button>
    );
};

// Extracted Component for DRY Principle
const RiskCard: React.FC<{ risk: RiskFactor; onTermClick: (term: string) => void }> = ({ risk, onTermClick }) => {
    // Determine mapping for glossary
    const getTermForViolation = (type: ViolationType) => {
        const map: Record<string, string> = { 'riba': 'Riba', 'gharar': 'Gharar', 'maysir': 'Maysir' };
        return map[type] || 'Akad Fasid';
    };

    // Use centralized config for styling cues (e.g. text color)
    const config = RISK_CONFIG[risk.riskLevel];

    return (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <ViolationBadge 
                    type={risk.violationType} 
                    onClick={() => onTermClick(getTermForViolation(risk.violationType))}
                />
                <span className={`text-[10px] uppercase tracking-wide font-bold ${config.text}`}>
                    {CATEGORY_LABELS[risk.category].split(' ')[0]}
                </span>
            </div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1 break-words leading-snug">
                {risk.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-3 leading-relaxed">
                {risk.description}
            </p>
            <div className="text-[10px] bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-100 dark:border-slate-800 flex items-start gap-1">
                <span className="font-bold">Dalil:</span> {risk.fiqhRule}
            </div>
        </div>
    );
};

export const HedeRisks: React.FC<HedeRisksProps> = ({ risks, onOpenTerm }) => {
    const [showDetail, setShowDetail] = useState(false);

    // Group risks by severity for display logic
    const highRisks = risks.filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high');
    const mediumRisks = risks.filter(r => r.riskLevel === 'medium');

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center">
                    <span className="icon-wrapper bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg mr-2 text-slate-500"><FaExclamationTriangle size={14}/></span>
                    Rincian Diagnosa
                </h3>
                <button 
                    onClick={() => setShowDetail(!showDetail)}
                    className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center hover:underline"
                >
                    {showDetail ? 'Sembunyikan' : 'Lihat Detail'} {showDetail ? <span className="ml-1 icon-wrapper w-3 h-3"><FaChevronUp/></span> : <span className="ml-1 icon-wrapper w-3 h-3"><FaChevronDown/></span>}
                </button>
            </div>

            <div className={`grid md:grid-cols-2 gap-6 transition-all duration-500 ${showDetail ? 'opacity-100 max-h-[2000px]' : 'opacity-100 max-h-full'}`}>
                {/* Critical Risks Column */}
                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl p-5 border border-red-100 dark:border-red-900/50">
                    <h4 className="text-sm font-bold text-red-700 dark:text-red-300 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span> Pelanggaran Berat
                    </h4>
                    {highRisks.length > 0 ? (
                        <div className="space-y-3">
                            {highRisks.map(risk => (
                                <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">Tidak ada pelanggaran berat. Alhamdulillah!</div>
                    )}
                </div>

                {/* Moderate Risks Column */}
                <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-2xl p-5 border border-yellow-100 dark:border-yellow-900/50">
                    <h4 className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span> Perlu Perhatian (Syubhat)
                    </h4>
                    {mediumRisks.length > 0 ? (
                        <div className="space-y-3">
                            {mediumRisks.map(risk => (
                                <RiskCard key={risk.id} risk={risk} onTermClick={onOpenTerm} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-400 text-sm">Bersih dari syubhat yang terdeteksi.</div>
                    )}
                </div>
            </div>
        </div>
    );
};
