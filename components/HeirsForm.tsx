import React from 'react';
import type { HeirInputState, Heir } from '../types.ts';
import { HEIR_LABELS, HEIR_GROUPS } from '../constants.ts';
import { HeirInput } from './HeirInput.tsx';
import { formatNumber } from '../utils.ts';

interface HeirsFormProps {
  heirs: HeirInputState;
  dispatch: React.Dispatch<any>;
  estate: string;
  setEstate: (value: string) => void;
  onCalculate: () => void;
  loading: boolean;
}

export const HeirsForm: React.FC<HeirsFormProps> = React.memo(({ heirs, dispatch, estate, setEstate, onCalculate, loading }) => {
  const formatInputValue = (value: string): string => {
    if (!value) return '';
    const numberValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(numberValue)) return '';
    return formatNumber(numberValue);
  };

  const handleEstateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const unformattedValue = rawValue.replace(/\./g, '');
    if (/^\d*$/.test(unformattedValue)) {
      setEstate(unformattedValue);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg space-y-6 border border-slate-200">
      <div>
        <label htmlFor="estate" className="block text-sm font-medium text-slate-700 mb-1">
          Total Harta Waris (Rp)
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="estate"
              value={formatInputValue(estate)}
              onChange={handleEstateChange}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold text-slate-900"
              placeholder="0"
              disabled={loading}
            />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
             <h3 className="text-lg font-semibold text-slate-800">Ahli Waris</h3>
            <button 
              onClick={() => dispatch({type: 'RESET'})} 
              className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
                Reset
            </button>
        </div>
        
        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300">
            {HEIR_GROUPS.map(group => (
                <div key={group.title}>
                    <h4 className="font-medium text-xs uppercase tracking-wider text-slate-500 mb-3">{group.title}</h4>
                    <div className="space-y-2">
                    {group.heirs.map((heirKey) => (
                        <HeirInput
                            key={heirKey}
                            label={HEIR_LABELS[heirKey as Heir]}
                            count={heirs[heirKey as Heir]}
                            dispatch={dispatch}
                            heirKey={heirKey as Heir}
                        />
                    ))}
                    </div>
                </div>
            ))}
        </div>
      </div>

      <button
        onClick={onCalculate}
        disabled={loading}
        className="w-full flex items-center justify-center bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.02] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md hover:shadow-lg"
      >
        {loading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghitung...
            </>
        ) : (
            'Hitung Pembagian'
        )}
      </button>
    </div>
  );
});
