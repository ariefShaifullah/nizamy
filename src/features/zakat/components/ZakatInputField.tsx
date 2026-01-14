
import React from 'react';
import { formatNumber } from '../../../utils.ts';

interface ZakatInputFieldProps {
    label: string;
    sublabel?: string;
    value: number;
    onChange: (val: number) => void;
    type?: 'currency' | 'number';
}

export const ZakatInputField: React.FC<ZakatInputFieldProps> = React.memo(({ label, sublabel, value, onChange, type = 'currency' }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        
        if (type === 'currency') {
            const digits = rawValue.replace(/\D/g, '');
            const numValue = digits === '' ? 0 : parseInt(digits, 10);
            onChange(numValue);
        } else {
            const normalized = rawValue.replace(',', '.');
            const num = parseFloat(normalized);
            onChange(isNaN(num) ? 0 : num);
        }
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            {sublabel && <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{sublabel}</p>}
            <div className="relative">
                {type === 'currency' ? (
                    <>
                        <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 text-sm">Rp</span>
                        <input 
                            type="text"
                            inputMode="numeric"
                            value={value === 0 ? '' : formatNumber(value)}
                            onChange={handleChange}
                            className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 font-medium placeholder-slate-400 dark:placeholder-slate-500"
                            placeholder="0"
                        />
                    </>
                ) : (
                    <input 
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="any"
                        value={value === 0 ? '' : value}
                        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 rounded-md shadow-sm py-2 pl-3 pr-3 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-400 dark:placeholder-slate-500"
                        placeholder="0"
                    />
                )}
            </div>
        </div>
    );
});
