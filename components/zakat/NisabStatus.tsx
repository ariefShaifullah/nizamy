import React from 'react';
import { formatCurrency } from '../../utils.ts';

interface NisabStatusProps {
    value: number;
    nisab: number;
    label: string;
    unit?: string;
    customMessage?: string;
}

export const NisabStatus: React.FC<NisabStatusProps> = ({ value, nisab, label, unit = 'Rp', customMessage }) => {
    const isReached = value >= nisab;
    const percentage = nisab > 0 ? Math.min(100, (value / nisab) * 100) : (value > 0 ? 100 : 0);
    
    const displayValue = unit === 'Rp' ? formatCurrency(value) : `${value} ${unit}`;
    const displayNisab = unit === 'Rp' ? formatCurrency(nisab) : `${nisab} ${unit}`;

    return (
        <div className={`mt-4 p-5 rounded-2xl border transition-all duration-500 ${
            isReached 
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 shadow-sm' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
            {/* Header Info */}
            <div className="flex justify-between items-center mb-3">
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Status Kewajiban</p>
                    <h4 className={`text-lg font-bold ${isReached ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {isReached ? '✅ Wajib Zakat' : 'Belum Wajib'}
                    </h4>
                </div>
                <div className="text-right">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Progres Nisab</p>
                    <p className={`text-lg font-mono font-bold ${isReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {percentage.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isReached ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {/* Details */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm gap-2 bg-white/60 dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
                <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-slate-400 mr-2"></span>
                    <span className="text-slate-500 dark:text-slate-400 mr-1">Total Harta:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{displayValue}</span>
                </div>
                <div className="hidden sm:block text-slate-300 dark:text-slate-600">|</div>
                <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                    <span className="text-slate-500 dark:text-slate-400 mr-1">Batas Nisab:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{displayNisab}</span>
                </div>
            </div>

            {/* Custom Message for Not Reached */}
            {!isReached && (
                <div className="mt-3 flex items-start gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                        {customMessage || <span>Harta belum mencapai nisab ({displayNisab}), sehingga <strong>belum ada kewajiban</strong> membayar zakat.</span>}
                    </span>
                </div>
            )}
        </div>
    );
};
