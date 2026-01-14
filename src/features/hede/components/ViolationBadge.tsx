import React from 'react';
import type { ViolationType } from '../../../types.ts';

interface ViolationBadgeProps {
    type: ViolationType | 'general';
}

const badgeStyles: Record<string, string> = {
    riba: 'bg-red-100 text-red-900 border-red-200 dark:bg-red-900/40 dark:text-red-100 dark:border-red-800',
    gharar: 'bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/40 dark:text-orange-100 dark:border-orange-800',
    maysir: 'bg-purple-100 text-purple-900 border-purple-200 dark:bg-purple-900/40 dark:text-purple-100 dark:border-purple-800',
    zulm: 'bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
};

export const ViolationBadge: React.FC<ViolationBadgeProps> = ({ type }) => {
    if (type === 'general' || type === 'none') {
        return (
            <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-600 font-bold">
                Umum
            </span>
        );
    }

    return (
        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${badgeStyles[type]}`}>
            {type}
        </span>
    );
};
