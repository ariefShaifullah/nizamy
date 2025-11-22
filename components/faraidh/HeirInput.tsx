
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
            group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden select-none
            ${
              isActive
                ? "bg-white dark:bg-slate-800 border-blue-500 dark:border-blue-500 shadow-md shadow-blue-100/50 dark:shadow-blue-900/20 ring-1 ring-blue-500/20"
                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-sm"
            }
        `}
    >
      {/* Active Indicator Bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300 ${
          isActive ? "bg-blue-500" : "bg-transparent"
        }`}
      ></div>

      <div className="flex flex-1 mr-4 pl-3 items-center">
        <span
          className={`text-sm md:text-base leading-snug transition-all duration-300 ${
            isActive
              ? "font-extrabold text-blue-800 dark:text-blue-100"
              : "font-semibold text-slate-600 dark:text-slate-400"
          }`}
        >
          {label}
        </span>
      </div>

      <div className="flex items-center gap-3 z-10">
        <button
          onClick={onDecrement}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90
            ${
              count === 0
                ? "text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600"
            }
          `}
          disabled={count === 0}
          aria-label={`Kurangi jumlah ${label}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        <div
          className={`w-8 text-center font-mono text-lg font-bold tabular-nums transition-colors ${
            isActive
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-300 dark:text-slate-600"
          }`}
        >
          {count}
        </div>

        <button
          onClick={onIncrement}
          className={`
            w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 active:scale-90 shadow-sm
            bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300
            hover:border-blue-500 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600
            ${
              isActive
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300"
                : ""
            }
          `}
          aria-label={`Tambah jumlah ${label}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});
