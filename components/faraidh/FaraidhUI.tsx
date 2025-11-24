import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { HeirResult } from "../../types.ts";
import { FIQH_DEFINITIONS } from "../../constants.ts";
import { formatCurrency } from "../../utils.ts";

// --- TOOLTIPS ---

export const CustomChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg text-sm z-50">
        <p className="font-bold text-slate-800 dark:text-slate-200">{`${payload[0].name}`}</p>
        <p className="text-slate-600 dark:text-slate-300">{`Bagian: ${payload[0].value.toFixed(
          2
        )}%`}</p>
        <p className="text-primary-600 dark:text-primary-400 font-semibold">{`${formatCurrency(
          payload[0].payload.finalValue
        )}`}</p>
      </div>
    );
  }
  return null;
};

export const InfoTooltip: React.FC<{ term: keyof typeof FIQH_DEFINITIONS }> = ({
  term,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = FIQH_DEFINITIONS[term];

  if (!data) return null;

  // Toggle handler
  const toggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Trigger Icon - Inline Block to sit next to text */}
      <span className="inline-flex items-center align-middle ml-1.5 -mt-0.5">
        <button
          onClick={toggle}
          className="cursor-pointer text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors focus:outline-none p-0.5 rounded-full hover:bg-amber-100 dark:hover:bg-amber-900/30"
          aria-label={`Info tentang ${data.title}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </span>

      {/* Portal Content - Renders outside of parent overflow/z-index context */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <div
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up border border-slate-100 dark:border-slate-700 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <h5 className="font-bold text-slate-800 dark:text-white text-lg flex items-center">
                  <span className="text-xl mr-2">💡</span>
                  {data.title}
                </h5>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              <div className="p-5">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm text-justify">
                  {data.definition}
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                  >
                    Tutup Penjelasan
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

// --- RESULT CARD ---

export const ResultCard: React.FC<{ heir: HeirResult }> = React.memo(
  ({ heir }) => {
    return (
      <div
        className={`p-4 rounded-lg transition-all border ${
          heir.isBlocked
            ? "bg-slate-50 dark:bg-slate-900/50 opacity-70 border-slate-100 dark:border-slate-800"
            : "bg-white dark:bg-slate-800 shadow-sm border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-slate-200 dark:hover:border-slate-600"
        }`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center">
              {heir.name}
              {heir.count > 1 && (
                <span className="ml-2 text-xs font-normal bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                  x{heir.count}
                </span>
              )}
            </h4>
            <p
              className={`font-semibold text-2xl mt-1 ${
                heir.isBlocked
                  ? "text-slate-400 dark:text-slate-500"
                  : "text-primary-600 dark:text-primary-400"
              }`}
            >
              {heir.isBlocked ? "Terhalang" : `${heir.percentage.toFixed(2)}%`}
            </p>
          </div>
          {!heir.isBlocked && heir.value > 0 && (
            <div className="text-right">
              <div className="flex flex-col items-end">
                <p className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-none">
                  {formatCurrency(heir.value)}
                </p>
                {heir.count > 1 && (
                  <div className="mt-1.5 px-2 py-0.5 bg-slate-50 dark:bg-slate-700 rounded border border-slate-100 dark:border-slate-600 inline-flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-slate-400 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      @{formatCurrency(heir.value / heir.count)}
                    </p>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
                {heir.finalShare.numerator}/{heir.finalShare.denominator}
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {heir.reason}
          </p>
          {heir.evidence && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-mono flex items-center">
              <span className="inline-block w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-2"></span>
              Dalil: {heir.evidence}
            </p>
          )}
        </div>
      </div>
    );
  }
);
