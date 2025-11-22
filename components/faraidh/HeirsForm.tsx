import React from "react";
import type { HeirInputState, Heir } from "../../types.ts";
import type { FaraidhAction } from "../../reducers/heirsReducer.ts";
import { HEIR_LABELS, HEIR_GROUPS } from "../../constants.ts";
import { HeirInput } from "./HeirInput.tsx";
import { formatNumber } from "../../utils.ts";

interface HeirsFormProps {
  heirs: HeirInputState;
  dispatch: React.Dispatch<FaraidhAction>;
  estate: string;
  setEstate: (value: string) => void;
  onCalculate: () => void;
  loading: boolean;
}

export const HeirsForm: React.FC<HeirsFormProps> = React.memo(
  ({ heirs, dispatch, estate, setEstate, onCalculate, loading }) => {
    const formatInputValue = (value: string): string => {
      if (!value) return "";
      const numberValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
      if (isNaN(numberValue)) return "";
      return formatNumber(numberValue);
    };

    const handleEstateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const unformattedValue = rawValue.replace(/\./g, "");
      if (/^\d*$/.test(unformattedValue)) {
        setEstate(unformattedValue);
      }
    };

    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg space-y-6 border border-slate-200 dark:border-slate-700 transition-colors">
        <div>
          <label
            htmlFor="estate"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
          >
            Total Harta Waris (Rp)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-500 dark:text-slate-400 sm:text-sm">
                Rp
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              id="estate"
              value={formatInputValue(estate)}
              onChange={handleEstateChange}
              className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg font-semibold text-slate-900 dark:text-white"
              placeholder="0"
              disabled={loading}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
              Ahli Waris
            </h3>
            <button
              onClick={() => dispatch({ type: "RESET" })}
              className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              Reset
            </button>
          </div>

          {/* Updated: Remove max-height on mobile to allow native page scrolling */}
          <div className="space-y-6 max-h-none lg:max-h-[50vh] overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar pb-32 lg:pb-0">
            {HEIR_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="font-medium text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  {group.title}
                </h4>
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

        {/* Desktop Static Button */}
        <button
          onClick={onCalculate}
          disabled={loading}
          className="hidden lg:flex w-full items-center justify-center bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all transform hover:scale-[1.02] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:scale-100 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Menghitung...
            </>
          ) : (
            "Hitung Pembagian"
          )}
        </button>

        {/* Mobile Floating Button (Above Bottom Nav) */}
        <div className="lg:hidden fixed bottom-[90px] left-4 right-4 z-30 pointer-events-none">
          {/* Gradient fade */}
          <div className="absolute -inset-x-4 -bottom-4 h-24 bg-gradient-to-t from-white/90 dark:from-slate-900/90 via-white/50 dark:via-slate-900/50 to-transparent -z-10" />

          <button
            onClick={onCalculate}
            disabled={loading}
            className="w-full pointer-events-auto flex items-center justify-center bg-primary-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-xl shadow-blue-900/20 border border-primary-500/20 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                Hitung
              </>
            )}
          </button>
        </div>
      </div>
    );
  }
);
