import React, { useRef } from "react";
import type { CalculationResult } from "../../types.ts";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Label,
} from "recharts";
import { FIQH_DEFINITIONS } from "../../constants.ts";
import { formatCurrency } from "../../utils.ts";
import { exportToPdf } from "../../services/pdf.service.ts";
import { InfoTooltip, ResultCard, CustomChartTooltip } from "./FaraidhUI.tsx";

const COLORS = [
  "#0ea5e9",
  "#0284c7",
  "#38bdf8",
  "#7dd3fc",
  "#0369a1",
  "#075985",
  "#0c4a6e",
  "#082f49",
  "#64748b",
  "#94a3b8",
  "#cbd5e1",
  "#e2e8f0",
];

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] lg:h-[70vh] bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-12 h-12"
          >
            <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648L11.25 22.18Z" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">
          Hasil Perhitungan
        </h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-sm leading-relaxed">
          Isi data ahli waris di panel kiri, lalu klik tombol{" "}
          <span className="font-semibold text-primary-600 dark:text-primary-400">
            Hitung Pembagian
          </span>{" "}
          untuk melihat detailnya di sini.
        </p>
      </div>
    );
  }

  const chartData = result.heirResults
    .filter((h) => h.percentage > 0 && !h.isBlocked)
    .map((h) => ({
      name: `${h.name} (${h.count})`,
      value: h.percentage,
      finalValue: h.value,
      fill: "",
    }));

  const hasReceivingHeirs = chartData.length > 0;

  return (
    <div
      ref={resultsRef}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 relative transition-colors"
    >
      {/* Header & Actions */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center rounded-t-2xl">
        <div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Ringkasan Hasil
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Asal Masalah: {result.aslAlMasalah} &rarr; {result.finalDenominator}
          </p>
        </div>
        <button
          data-html2canvas-ignore="true"
          onClick={() => exportToPdf(resultsRef, result)}
          className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 mr-2 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          PDF
        </button>
      </div>

      <div className="p-6">
        {/* Total Estate Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-900 p-6 rounded-xl text-white shadow-md mb-6">
          <p className="text-primary-100 text-sm font-medium mb-1">
            Total Harta Waris Dibagi
          </p>
          <p className="text-3xl md:text-4xl font-bold tracking-tight">
            {formatCurrency(result.estate)}
          </p>
        </div>

        {/* Notes (Aul/Radd/Etc) */}
        {result.notes.length > 0 && (
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-lg space-y-3">
            {result.notes.map((note, index) => {
              let term: keyof typeof FIQH_DEFINITIONS | null = null;
              if (note.includes("'Aul")) term = "AUL";
              else if (note.includes("Radd")) term = "RADD";
              else if (note.includes("Umariyyatain")) term = "UMARIYYATAIN";
              else if (note.includes("Al-Musytarakah")) term = "MUSYTARAKAH";
              else if (note.includes("Al-Akdariyyah")) term = "AKDARIYYAH";

              return (
                <div key={index} className="flex items-start">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      {note}
                    </span>
                    {term && <InfoTooltip term={term} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!hasReceivingHeirs && (
          <div className="my-8 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 border-dashed">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Tidak ada ahli waris yang menerima bagian (Mahjub/Terhalang semua
              atau Data Kosong).
            </p>
          </div>
        )}

        {/* Chart & Details */}
        {hasReceivingHeirs && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/30 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50 min-h-[400px]">
              <div className="w-full h-full relative flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                      {/* Using Recharts Label Component to ensure text stays in the center of the Donut regardless of Legend shift */}
                      <Label
                        position="center"
                        content={({ viewBox }) => {
                          const { cx, cy } = viewBox as any;
                          return (
                            <text
                              x={cx}
                              y={cy}
                              textAnchor="middle"
                              dominantBaseline="central"
                            >
                              <tspan
                                x={cx}
                                y={cy - 10}
                                dy="0"
                                fontSize="10"
                                className="fill-slate-400 font-bold uppercase"
                              >
                                Total
                              </tspan>
                              <tspan
                                x={cx}
                                y={cy + 10}
                                dy="5"
                                fontSize="16"
                                className="fill-slate-800 dark:fill-slate-200 font-bold"
                              >
                                100%
                              </tspan>
                            </text>
                          );
                        }}
                      />
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend
                      iconType="circle"
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                      wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4">
              <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">
                Rincian Bagian
              </h4>
              <div className="result-card-wrapper space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {result.heirResults.map((heir, idx) => (
                  <ResultCard key={idx} heir={heir} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
