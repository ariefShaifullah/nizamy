
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
    <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
        isActive 
        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-100 dark:hover:border-blue-800 hover:shadow-md'
    }`}>
      <span className={`text-sm md:text-base font-medium leading-snug ${isActive ? 'text-blue-900 dark:text-blue-100' : 'text-slate-700 dark:text-slate-300'}`}>
          {label}
      </span>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={onDecrement}
          className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all active:scale-95 ${
              count === 0 
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 shadow-sm'
          }`}
          disabled={count === 0}
          aria-label={`Kurangi jumlah ${label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        <div className="w-8 text-center">
            <span className={`font-bold text-lg tabular-nums ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}`}>
                {count}
            </span>
        </div>
        
        <button
          onClick={onIncrement}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white active:scale-95 transition-all shadow-sm"
          aria-label={`Tambah jumlah ${label}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
});
