import React, { useState } from "react";
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

  return (
    <div className="relative inline-flex items-center ml-2">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none"
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
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 dark:bg-slate-700 text-white text-sm rounded-lg shadow-xl z-50 border border-slate-700 dark:border-slate-600">
          <h5 className="font-bold mb-1 text-primary-400">{data.title}</h5>
          <p className="text-xs text-slate-300 leading-relaxed">
            {data.definition}
          </p>
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800 dark:border-t-slate-700"></div>
        </div>
      )}
    </div>
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
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-mono flex items-center">
            <span className="inline-block w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full mr-2"></span>
            Dalil: {heir.evidence}
          </p>
        </div>
      </div>
    );
  }
);
