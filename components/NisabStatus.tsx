import React from "react";
import { formatCurrency } from "../utils.ts";

interface NisabStatusProps {
  value: number;
  nisab: number;
  label: string;
  unit?: string;
  customMessage?: string;
}

export const NisabStatus: React.FC<NisabStatusProps> = ({
  value,
  nisab,
  label,
  unit = "Rp",
  customMessage,
}) => {
  const isReached = value >= nisab;
  const displayValue =
    unit === "Rp" ? formatCurrency(value) : `${value} ${unit}`;
  const displayNisab =
    unit === "Rp" ? formatCurrency(nisab) : `${nisab} ${unit}`;

  return (
    <div
      className={`mt-4 p-4 rounded-lg border ${
        isReached
          ? "bg-emerald-50 border-emerald-200"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <div className="text-sm text-slate-500">
            Total/Proyeksi:{" "}
            <span className="font-semibold text-slate-700">{displayValue}</span>
          </div>
          <div className="text-sm text-slate-500">
            Ambang Batas (Nisab):{" "}
            <span className="font-semibold text-slate-700">{displayNisab}</span>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            isReached
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {isReached ? "WAJIB ZAKAT" : "BELUM WAJIB"}
        </div>
      </div>
      {!isReached && (
        <div className="mt-2 flex items-start text-sm text-slate-600 bg-white p-2 rounded border border-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>
            {customMessage || (
              <span>
                Harta belum mencapai nisab, maka{" "}
                <strong>muzakki belum wajib zakat</strong> (tidak ada kewajiban
                membayar).
              </span>
            )}
          </span>
        </div>
      )}
    </div>
  );
};
