import React, { useCallback } from 'react';
import type { Heir } from '../../../types.ts';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';
import { useFaraidh } from '../context/FaraidhContext.tsx';

interface HeirInputProps {
  label: string;
  heirKey: Heir;
}

export const HeirInput: React.FC<HeirInputProps> = React.memo(({ label, heirKey }) => {
  const { heirs, dispatch } = useFaraidh();
  const count = heirs[heirKey];

  const onIncrement = useCallback(() => {
    audioService.playClick();
    dispatch({ type: 'INCREMENT', payload: heirKey });
  }, [dispatch, heirKey]);

  const onDecrement = useCallback(() => {
    if (count > 0) audioService.playClick();
    dispatch({ type: 'DECREMENT', payload: heirKey });
  }, [dispatch, heirKey, count]);

  const onManualChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const numVal = val === '' ? 0 : parseInt(val, 10);
    if (!isNaN(numVal)) {
        dispatch({ type: 'SET_COUNT', payload: { heir: heirKey, count: numVal } });
    }
  }, [dispatch, heirKey]);
  
  const isActive = count > 0;

  return (
    <div 
        className={`
            group flex items-center justify-between py-3 px-3 rounded-xl transition-all duration-300
            ${isActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800' 
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent'
            }
        `}
    >
      <div className="flex-1 pr-4 select-none">
          <span className={`text-sm font-medium transition-colors duration-200 ${
              isActive 
              ? 'text-blue-700 dark:text-blue-300 font-semibold' 
              : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
          }`}>
              {label}
          </span>
      </div>
      
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
        <button
          onClick={onDecrement}
          className={`
            w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 active:scale-90 focus:outline-none
            ${count === 0 
              ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed' 
              : 'bg-white dark:bg-slate-800 text-red-500 shadow-sm hover:text-red-600'
            }
          `}
          disabled={count === 0}
          aria-label={`Kurangi jumlah ${label}`}
        >
          <span className="text-[10px]"><FaMinus /></span>
        </button>
        
        <input
            type="number"
            min="0"
            value={count === 0 ? '' : count}
            onChange={onManualChange}
            placeholder="0"
            className={`
                w-10 text-center font-mono text-base font-bold bg-transparent outline-none
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                placeholder-slate-300 dark:placeholder-slate-600
                ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}
            `}
        />
        
        <button
          onClick={onIncrement}
          className="w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm hover:text-blue-700 active:scale-90 transition-all duration-200"
          aria-label={`Tambah jumlah ${label}`}
        >
          <span className="text-[10px]"><FaPlus /></span>
        </button>
      </div>
    </div>
  );
});