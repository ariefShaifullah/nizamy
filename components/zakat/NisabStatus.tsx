
import React from 'react';
import { formatCurrency } from '../../utils.ts';
import { FaCheck, FaTimes } from "react-icons/fa";

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
        <div className={`mt-6 p-6 rounded-3xl border-2 transition-all duration-500 relative overflow-hidden ${
            isReached 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 dark:border-emerald-500/50' 
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
        }`}>
            {/* Background Status Icon (Watermark) */}
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none">
                {isReached ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                )}
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Status Nisab</p>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full ${isReached ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-600 text-white'}`}>
                                {isReached ? (
                                    <span className="icon-wrapper w-4 h-4"><FaCheck /></span>
                                ) : (
                                    <span className="icon-wrapper w-4 h-4"><FaTimes /></span>
                                )}
                            </div>
                            <h3 className={`text-xl font-extrabold tracking-tight ${isReached ? 'text-emerald-800 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {isReached ? 'Wajib Zakat' : 'Belum Wajib'}
                            </h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-black tabular-nums ${isReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-500'}`}>
                            {percentage.toFixed(0)}<span className="text-sm align-top">%</span>
                        </span>
                    </div>
                </div>

                {/* Enhanced Progress Bar */}
                <div className="relative w-full h-4 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-4 border border-slate-300 dark:border-slate-600">
                    {/* Threshold Marker Line */}
                    <div className="absolute top-0 bottom-0 w-0.5 bg-slate-400/50 z-20" style={{ left: '100%' }}></div>
                    
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                            isReached ? 'bg-emerald-500' : 'bg-slate-400 dark:bg-slate-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                    >
                        {/* Striped animation pattern */}
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-[pulse_2s_linear_infinite]"></div>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 bg-white/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/50 backdrop-blur-sm">
                    <div>
                        <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Total Harta</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base truncate" title={displayValue}>
                            {displayValue}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 font-bold mb-1">Batas Nisab</p>
                        <p className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base truncate" title={displayNisab}>
                            {displayNisab}
                        </p>
                    </div>
                </div>

                {!isReached && (
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed text-center bg-slate-100 dark:bg-slate-800/50 p-2 rounded-lg">
                        {customMessage || "Harta belum mencapai batas minimum (Nisab)."}
                    </p>
                )}
            </div>
        </div>
    );
};
