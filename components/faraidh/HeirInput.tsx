import React, { useCallback } from "react";
import type { Heir } from "../../types.ts";

interface HeirInputProps {
  label: string;
  count: number;
  dispatch: React.Dispatch<any>;
  heirKey: Heir;
}

export const HeirInput: React.FC<HeirInputProps> = React.memo(
  ({ label, count, dispatch, heirKey }) => {
    const onIncrement = useCallback(() => {
      dispatch({ type: "INCREMENT", payload: heirKey });
    }, [dispatch, heirKey]);

    const onDecrement = useCallback(() => {
      dispatch({ type: "DECREMENT", payload: heirKey });
    }, [dispatch, heirKey]);

    return (
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm active:border-primary-200 transition-colors">
        <span className="text-sm md:text-base font-medium text-slate-700 pr-2 leading-snug">
          {label}
        </span>
        <div className="flex items-center space-x-3 bg-slate-50 rounded-xl p-1.5 border border-slate-200">
          <button
            onClick={onDecrement}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
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
          <span className="w-8 text-center font-bold text-primary-700 text-lg tabular-nums">
            {count}
          </span>
          <button
            onClick={onIncrement}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 active:scale-95 transition-all shadow-sm border border-slate-200 touch-manipulation"
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
  }
);
