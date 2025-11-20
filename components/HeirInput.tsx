import React, { useCallback } from "react";
import type { Heir } from "../types.ts";

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
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
        <span className="text-sm font-medium text-slate-700 pr-2 leading-snug">
          {label}
        </span>
        <div className="flex items-center space-x-3 bg-slate-50 rounded-lg p-1 border border-slate-200">
          <button
            onClick={onDecrement}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95 transition-all shadow-sm border border-slate-200 disabled:opacity-50"
            disabled={count === 0}
            aria-label={`Kurangi jumlah ${label}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
          <span className="w-6 text-center font-bold text-primary-700 text-lg">
            {count}
          </span>
          <button
            onClick={onIncrement}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-white text-primary-600 hover:bg-primary-50 hover:text-primary-700 active:scale-95 transition-all shadow-sm border border-slate-200"
            aria-label={`Tambah jumlah ${label}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
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
