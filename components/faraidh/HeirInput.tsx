
import React, { useCallback } from 'react';
import type { Heir } from '../../types.ts';
import type { FaraidhAction } from '../../reducers/heirsReducer.ts';

interface HeirInputProps {
  label: string;
  count: number;
  dispatch: React.Dispatch<FaraidhAction>;
  heirKey: Heir;
}

export const HeirInput: React.FC<HeirInputProps> = React.memo(({ label, count, dispatch, heirKey }) => {
  const onIncrement = useCallback(() => {
    dispatch({ type: 'INCREMENT', payload: heirKey });
  }, [dispatch, heirKey]);

  const onDecrement = useCallback(() => {
    dispatch({ type: 'DECREMENT', payload: heirKey });
  }, [dispatch, heirKey]);
  
  const isActive = count > 0;

  return (
    <div 
        className={`
            group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden select-none touch-manipulation
            ${isActive 
                ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500 dark:border-blue-400 shadow-md shadow-blue-100/50 dark:shadow-none' 
                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }
        `}
    >
      {/* Active Indicator Bar (Left border accent) */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${isActive ? 'bg-blue-500 dark:bg-blue-400' : 'bg-transparent'}`}></div>

      <div className="flex flex-1 mr-4 pl-3 items-center">
          <span className={`text-sm md:text-base leading-snug transition-colors duration-300 ${
              isActive 
              ? 'font-bold text-blue-900 dark:text-blue-100' 
              : 'font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
          }`}>
              {label}
          </span>
      </div>
      
      <div className="flex items-center gap-3 z-10 bg-slate-50 dark:bg-slate-900/50 p-1 rounded-xl border border-slate-100 dark:border-slate-700/50">
        <button
          onClick={onDecrement}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-200 dark:focus:ring-red-900
            ${count === 0 
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 shadow-sm border border-slate-200 dark:border-slate-700'
            }
          `}
          disabled={count === 0}
          aria-label={`Kurangi jumlah ${label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className={`w-8 text-center font-mono text-lg font-bold tabular-nums transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}>
            {count}
        </div>
        
        <button
          onClick={onIncrement}
          className={`
            w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 active:scale-90 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-200 dark:focus:ring-blue-900
            border border-slate-200 dark:border-slate-700
            ${isActive 
                ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' 
                : 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
            }
          `}
          aria-label={`Tambah jumlah ${label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
});
