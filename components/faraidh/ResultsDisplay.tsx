
import React, { useRef } from 'react';
import type { CalculationResult } from '../../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { FIQH_DEFINITIONS } from '../../constants.ts';
import { formatCurrency } from '../../utils.ts';
import { exportToPdf } from '../../services/pdf.service.ts';
import { InfoTooltip, ResultCard, CustomChartTooltip } from './FaraidhUI.tsx';
import { FaFilePdf, FaExclamationCircle, FaCalculator } from 'react-icons/fa';

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4',
  '#f43f5e', '#84cc16', '#6366f1', '#d946ef', '#eab308', '#14b8a6',
];

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] lg:h-[600px] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors sticky top-24">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600 animate-pulse">
            <div className="w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <div className="icon-wrapper w-12 h-12 flex items-center justify-center"><FaCalculator size="2.5em"/></div>
            </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Menunggu Input</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed text-sm max-w-xs mx-auto">
            Isi data ahli waris di sebelah kiri, lalu klik tombol <span className="font-semibold text-blue-600 dark:text-blue-400">Hitung Pembagian</span>.
        </p>
      </div>
    );
  }

  let chartData = result.heirResults
    .filter(h => h.percentage > 0 && !h.isBlocked)
    .map(h => ({ name: `${h.name} (${h.count})`, value: h.percentage, finalValue: h.value }));

  const totalDistributed = chartData.reduce((sum, item) => sum + item.value, 0);
  const hasRemainder = totalDistributed < 99.9;

  if (hasRemainder) {
      const remainderVal = 100 - totalDistributed;
      const remainderMoney = result.estate - result.heirResults.reduce((sum, h) => sum + h.value, 0);
      chartData.push({
          name: 'Baitul Mal / Sisa',
          value: remainderVal,
          finalValue: Math.max(0, remainderMoney)
      });
  }
    
  const hasReceivingHeirs = chartData.length > 0;

  return (
    <div ref={resultsRef} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/20 dark:shadow-none border border-slate-100 dark:border-slate-700 relative transition-colors">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 flex justify-between items-center rounded-t-3xl">
            <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                    Hasil Perhitungan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 ml-4">Asal Masalah: {result.aslAlMasalah} &rarr; {result.finalDenominator}</p>
            </div>
            <button 
                data-html2canvas-ignore="true"
                onClick={() => exportToPdf(resultsRef, result)} 
                className="flex items-center px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
                <span className="icon-wrapper w-4 h-4 mr-1.5 text-red-500"><FaFilePdf /></span>
                Unduh PDF
            </button>
      </div>
      
      <div className="p-5">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20 dark:shadow-none mb-6 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 bg-white/10 w-24 h-24 rounded-full blur-2xl"></div>
            <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest opacity-80">Total Dibagi</p>
            <p className="text-3xl font-extrabold tracking-tight">{formatCurrency(result.estate)}</p>
        </div>
      
        {result.notes.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-xl space-y-3">
                {result.notes.map((note, index) => {
                    let term: keyof typeof FIQH_DEFINITIONS | null = null;
                    if (note.includes("'Aul")) term = 'AUL';
                    else if (note.includes("Radd")) term = 'RADD';
                    else if (note.includes("Umariyyatain")) term = 'UMARIYYATAIN';
                    else if (note.includes("Al-Musytarakah")) term = 'MUSYTARAKAH';
                    else if (note.includes("Al-Akdariyyah")) term = 'AKDARIYYAH';

                    return (
                        <div key={index} className="flex items-start">
                            <span className="icon-wrapper w-5 h-5 text-amber-500 mr-2.5 mt-0.5 flex-shrink-0"><FaExclamationCircle /></span>
                            <div className="flex-1">
                                <span className="text-sm font-bold text-amber-900 dark:text-amber-200 leading-snug">
                                    {note}
                                    {term && <InfoTooltip term={term} />}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {!hasReceivingHeirs && (
            <div className="my-8 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-slate-100 dark:border-slate-700 border-dashed">
                <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3 shadow-sm">
                    <span className="icon-wrapper w-8 h-8"><FaExclamationCircle /></span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold">Tidak ada ahli waris yang menerima bagian.</p>
            </div>
        )}

        {hasReceivingHeirs && (
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/50">
                    <div className="w-full h-56 relative mb-6">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.name.includes('Baitul Mal') ? '#94a3b8' : COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                    <Label 
                                        position="center"
                                        content={({ viewBox }) => {
                                            const { cx, cy } = viewBox as any;
                                            return (
                                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                    <tspan x={cx} y={cy} fontSize="24" fontWeight="bold" className="fill-slate-800 dark:fill-white">100%</tspan>
                                                    <tspan x={cx} y={cy + 20} fontSize="12" className="fill-slate-400 dark:fill-slate-500">Harta</tspan>
                                                </text>
                                            );
                                        }}
                                    />
                                </Pie>
                                <Tooltip content={<CustomChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full space-y-3">
                        {chartData.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center group text-sm">
                                <div className="flex items-center overflow-hidden">
                                    <span className="w-3 h-3 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: entry.name.includes('Baitul Mal') ? '#94a3b8' : COLORS[index % COLORS.length] }}></span>
                                    <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[140px]">{entry.name}</span>
                                </div>
                                <div className="text-right pl-2 flex-shrink-0">
                                    <span className="font-bold text-slate-900 dark:text-white">{entry.value.toFixed(1)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                        <div className="icon-wrapper w-4 h-4 mr-2 text-slate-400"><FaCalculator/></div>
                        Rincian Pembagian
                    </h4>
                    <div className="result-card-wrapper space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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