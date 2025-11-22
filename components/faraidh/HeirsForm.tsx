
import React from 'react';
import type { HeirInputState, Heir } from '../../types.ts';
import type { FaraidhAction } from '../../reducers/heirsReducer.ts';
import { HEIR_LABELS, HEIR_GROUPS } from '../../constants.ts';
import { HeirInput } from './HeirInput.tsx';
import { formatNumber } from '../../utils.ts';

interface HeirsFormProps {
  heirs: HeirInputState;
  dispatch: React.Dispatch<FaraidhAction>;
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
  
  // Fix: Explicitly cast to number[] to avoid TS "unknown" type error
  const totalHeirs = (Object.values(heirs) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="bg-white dark:bg-slate-800 p-5 md:p-8 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all">
      {/* Estate Input Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-800 mb-8">
        <label htmlFor="estate" className="block text-xs font-bold uppercase tracking-wider text-blue-800 dark:text-blue-300 mb-2">
          Total Harta Waris
        </label>
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-blue-500 dark:text-blue-400 font-bold text-lg">Rp</span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="estate"
              value={formatInputValue(estate)}
              onChange={handleEstateChange}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-800 rounded-xl shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-400 text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white placeholder-blue-200 transition-all"
              placeholder="0"
              disabled={loading}
            />
        </div>
        <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-2">
            Masukkan nilai bersih setelah hutang & wasiat.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-700 pb-4">
            <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Ahli Waris</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Siapa saja yang ditinggalkan?</p>
            </div>
            {totalHeirs > 0 && (
                <button 
                  onClick={() => dispatch({type: 'RESET'})} 
                  className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-1.5 rounded-lg font-bold transition-colors"
                  disabled={loading}
                >
                    Reset Pilihan
                </button>
            )}
        </div>
        
        <div className="space-y-8 max-h-none lg:max-h-[50vh] overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-32 lg:pb-0">
            {HEIR_GROUPS.map((group, idx) => (
                <div key={group.title} className="animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-center mb-3">
                        <span className="w-1 h-4 bg-blue-400 rounded-full mr-2"></span>
                        <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">{group.title}</h4>
                    </div>
                    <div className="space-y-3">
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

      {/* Desktop Static Button */}
      <div className="hidden lg:block mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all transform hover:-translate-y-1 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
          >
            {loading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sedang Menghitung...
                </>
            ) : (
                <span className="flex items-center text-lg">
                    Hitung Pembagian
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </span>
            )}
          </button>
      </div>
      
      {/* Mobile Floating Button (Above Bottom Nav) */}
      <div className="lg:hidden fixed bottom-[72px] left-0 right-0 z-40 p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-900 dark:via-slate-900/90 pb-6">
          <button
            onClick={onCalculate}
            disabled={loading}
            className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-4 px-4 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/30 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : (
                <>
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Hitung Pembagian
                </>
            )}
          </button>
      </div>

    </div>
  );
});
