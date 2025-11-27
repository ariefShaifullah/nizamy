
import React from 'react';
import type { HeirInputState, Heir } from '../../../types.ts';
import type { FaraidhAction } from '../logic/heirsReducer.ts';
import { HEIR_LABELS, HEIR_GROUPS } from '../constants.ts';
import { HeirInput } from './HeirInput.tsx';
import { formatNumber } from '../../../utils.ts';
import { FaCoins, FaCalculator, FaSpinner, FaRedo } from 'react-icons/fa';

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
  
  const totalHeirs = (Object.values(heirs) as number[]).reduce((a, b) => a + b, 0);

  const leftColumnGroups = [HEIR_GROUPS[0], HEIR_GROUPS[1]];
  const rightColumnGroups = [HEIR_GROUPS[2], HEIR_GROUPS[3], HEIR_GROUPS[4]];

  return (
    <>
      <div className="flex flex-col gap-8 pb-40 lg:pb-0">
        
        {/* 1. Premium Hero Estate Input */}
        <div className="relative group rounded-[2rem] p-1 bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-blue-900 dark:via-slate-800 dark:to-slate-900 shadow-xl shadow-blue-100/50 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-none">
            <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[1.9rem] m-[1px]"></div>
            
            <div className="relative p-6 md:p-8 flex flex-col justify-center h-full overflow-hidden rounded-[1.9rem]">
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.03] dark:opacity-[0.05] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 pointer-events-none icon-wrapper h-56 w-56 text-blue-600 dark:text-blue-400">
                    <FaCoins />
                </div>

                <label htmlFor="estate" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-1">
                    Total Harta Waris (Netto)
                </label>
                
                <div className="relative flex items-center">
                    <span className="absolute left-0 text-blue-600 dark:text-blue-400 font-bold text-2xl md:text-3xl pointer-events-none">Rp</span>
                    <input
                        type="text"
                        inputMode="numeric"
                        id="estate"
                        value={formatInputValue(estate)}
                        onChange={handleEstateChange}
                        className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 pl-12 pr-4 py-2 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none transition-colors tracking-tight"
                        placeholder="0"
                        disabled={loading}
                    />
                </div>
            </div>
        </div>

        {/* 2. Desktop Split Layout */}
        <div className="flex flex-col xl:flex-row gap-8 items-start">
            <div className="flex-1 space-y-8 w-full">
                {leftColumnGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                        <div className="flex items-center px-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                            <h4 className="mx-4 font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">{group.title}</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
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

            <div className="flex-1 space-y-8 w-full">
                {rightColumnGroups.map((group) => (
                    <div key={group.title} className="space-y-4">
                       <div className="flex items-center px-2">
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                            <h4 className="mx-4 font-bold text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">{group.title}</h4>
                            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
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

        {/* 3. Desktop Action Buttons */}
        <div className="hidden lg:flex items-center justify-end mt-8 gap-4">
             {totalHeirs > 0 && (
                <button 
                    onClick={() => dispatch({type: 'RESET'})} 
                    className="px-6 py-3.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex items-center gap-2"
                    disabled={loading}
                >
                    <span className="icon-wrapper w-4 h-4"><FaRedo /></span> Reset Data
                </button>
            )}
            
            <button
              onClick={onCalculate}
              disabled={loading}
              className={`group relative flex items-center justify-center bg-blue-600 text-white font-bold py-3.5 px-10 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-500/30 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none`}
            >
              {loading ? (
                  <>
                      <div className="animate-spin -ml-1 mr-3 icon-wrapper w-5 h-5 text-white"><FaSpinner /></div>
                      Memproses...
                  </>
              ) : (
                  <span className="flex items-center text-lg tracking-wide">
                      Hitung Pembagian
                      <div className="icon-wrapper w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"><FaCalculator /></div>
                  </span>
              )}
            </button>
        </div>
      </div>
      
      {/* 4. Mobile Fixed Action */}
      <div className="lg:hidden fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 px-6 pointer-events-none flex justify-center">
          <button
            onClick={onCalculate}
            disabled={loading}
            className="pointer-events-auto w-full max-w-sm flex items-center justify-center bg-blue-600/90 backdrop-blur-xl text-white font-bold py-4 px-6 rounded-full hover:bg-blue-700 active:scale-95 transition-all shadow-2xl shadow-blue-900/20 disabled:bg-slate-500 disabled:cursor-not-allowed border border-white/10"
          >
            {loading ? (
                <div className="animate-spin icon-wrapper w-5 h-5 text-white"><FaSpinner /></div>
            ) : (
                <>
                     <div className="icon-wrapper w-5 h-5 mr-2.5"><FaCalculator /></div>
                    <span className="text-base tracking-wide">Hitung Pembagian</span>
                </>
            )}
          </button>
      </div>
    </>
  );
});