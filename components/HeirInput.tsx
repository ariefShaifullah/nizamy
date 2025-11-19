import React, { useCallback } from 'react';
import type { Heir } from '../types.ts';

interface HeirInputProps {
  label: string;
  count: number;
  dispatch: React.Dispatch<any>;
  heirKey: Heir;
}

export const HeirInput: React.FC<HeirInputProps> = React.memo(({ label, count, dispatch, heirKey }) => {
  const onIncrement = useCallback(() => {
    dispatch({ type: 'INCREMENT', payload: heirKey });
  }, [dispatch, heirKey]);

  const onDecrement = useCallback(() => {
    dispatch({ type: 'DECREMENT', payload: heirKey });
  }, [dispatch, heirKey]);
  
  return (
    <div className="flex items-center justify-between p-3 bg-slate-100/50 rounded-lg">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="flex items-center space-x-2">
        <button
          onClick={onDecrement}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
          aria-label={`Kurangi jumlah ${label}`}
        >
          -
        </button>
        <span className="w-8 text-center font-semibold text-primary-600">{count}</span>
        <button
          onClick={onIncrement}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
          aria-label={`Tambah jumlah ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
});