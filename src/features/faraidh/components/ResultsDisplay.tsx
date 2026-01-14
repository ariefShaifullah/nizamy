
import React from 'react';
import type { CalculationResult, HeirResult } from '../../../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Label } from 'recharts';
import { FIQH_DEFINITIONS } from '../constants.ts';
import { formatCurrency } from '../../../utils.ts';
import { exportFaraidhPdf } from '../logic/pdf-export.ts';
import { InfoTooltip, CustomChartTooltip } from './FaraidhUI.tsx';
import { FaFilePdf, FaExclamationCircle, FaCalculator, FaBookOpen, FaLock, FaUser } from 'react-icons/fa';

// WCAG Compliant Palette (High Contrast)
const COLORS = [
  '#059669', // Emerald 600
  '#2563eb', // Blue 600
  '#d97706', // Amber 600
  '#7c3aed', // Violet 600
  '#db2777', // Pink 600
  '#0891b2', // Cyan 600
  '#e11d48', // Rose 600
  '#65a30d', // Lime 600
  '#4f46e5', // Indigo 600
  '#c026d3', // Fuchsia 600
  '#ca8a04', // Yellow 600
  '#0d9488', // Teal 600
];

interface ResultsDisplayProps {
  result: CalculationResult | null;
  deceasedGender: 'male' | 'female';
}

const HeirResultCard: React.FC<{ heir: HeirResult }> = React.memo(({ heir }) => {
    const isBlocked = heir.isBlocked;

    return (
      <div className={`rounded-2xl transition-all border relative overflow-hidden group ${
          isBlocked 
          ? 'bg-slate-50 dark:bg-slate-900/30 opacity-75 border-slate-100 dark:border-slate-800' 
          : 'bg-white dark:bg-slate-800 shadow-sm border-slate-100 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}>
          
          {/* Header Section */}
          <div className="p-5 pb-3 flex justify-between items-start">
              <div className="flex items-start gap-3">
                  <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      isBlocked 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-400' 
                      : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}>
                      {isBlocked ? <FaLock size={14} /> : <FaUser size={16} />}
                  </div>
                  <div>
                      <h4 className={`font-bold text-base md:text-lg leading-tight ${isBlocked ? 'text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                          {heir.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                          {heir.count > 1 && (
                              <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-600">
                                  {heir.count} Orang
                              </span>
                          )}
                          {isBlocked && (
                              <span className="text-[10px] font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-900/30">
                                  MAHJUB
                              </span>
                          )}
                      </div>
                  </div>
              </div>

              {!isBlocked && heir.value > 0 && (
                  <div className="text-right">
                      <div className="flex flex-col items-end">
                          <span className="text-xs font-mono font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md mb-1">
                              {heir.finalShare.numerator}/{heir.finalShare.denominator}
                          </span>
                          <p className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">
                              {formatCurrency(heir.value)}
                          </p>
                          
                          {/* Per Person Breakdown */}
                          {heir.count > 1 && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-600">
                                  <span>@{formatCurrency(heir.value / heir.count)}</span>
                                  <span className="opacity-70">/org</span>
                              </div>
                          )}
                      </div>
                  </div>
              )}
          </div>

          {/* Details & Dalil */}
          <div className="px-5 pb-5">
              <div className={`mt-2 p-3 rounded-xl text-sm leading-relaxed ${
                  isBlocked 
                  ? 'bg-slate-100/50 dark:bg-slate-800/50 text-slate-500' 
                  : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300'
              }`}>
                  {heir.reason}
              </div>

              {/* Dalil Section - Highlighted */}
              {heir.evidence && (
                  <div className="mt-3 flex items-start gap-2.5">
                      <span className={`mt-0.5 ${isBlocked ? 'text-slate-400' : 'text-blue-500 dark:text-blue-400'}`}>
                          <FaBookOpen size={12} />
                      </span>
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic font-medium">
                          Rujukan: {heir.evidence}
                      </p>
                  </div>
              )}
          </div>
      </div>
    );
});

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] lg:h-[600px] bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center transition-colors sticky top-24">
        <div className="w-24 h-24 bg-blue-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 text-blue-200 dark:text-slate-700 animate-pulse">
            <FaCalculator size="3em"/>
        </div>
        <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Hasil Perhitungan</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 leading-relaxed text-sm max-w-xs mx-auto">
            Masukkan data harta dan ahli waris di panel kiri untuk melihat pembagian sesuai Syariat Islam.
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
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-blue-100/20 dark:shadow-none border border-slate-100 dark:border-slate-700 relative transition-colors overflow-hidden">
      {/* Header Result */}
      <div className="p-6 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2.5 animate-pulse"></span>
                    Ringkasan
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-4 font-mono">
                    Asal Masalah: <strong className="text-slate-700 dark:text-slate-300">{result.aslAlMasalah}</strong> &rarr; <strong className="text-blue-600 dark:text-blue-400">{result.finalDenominator}</strong>
                </p>
            </div>
            <button 
                onClick={() => exportFaraidhPdf(result)} 
                className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
                <span className="text-red-500 mr-2"><FaFilePdf /></span>
                Unduh PDF
            </button>
      </div>
      
      <div className="p-6">
        {/* Total Estate Card */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-900 p-6 rounded-2xl text-white shadow-lg shadow-blue-500/20 dark:shadow-none mb-8 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 bg-white/10 w-32 h-32 rounded-full blur-3xl"></div>
            <p className="text-blue-100 text-xs font-bold mb-1 uppercase tracking-widest opacity-80">Total Harta Dibagi</p>
            <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">{formatCurrency(result.estate)}</p>
        </div>
      
        {/* Alerts / Notes */}
        {result.notes.length > 0 && (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 dark:border-amber-500 rounded-r-xl space-y-3">
                {result.notes.map((note, index) => {
                    let term: keyof typeof FIQH_DEFINITIONS | null = null;
                    if (note.includes("'Aul")) term = 'AUL';
                    else if (note.includes("Radd")) term = 'RADD';
                    else if (note.includes("Umariyyatain")) term = 'UMARIYYATAIN';
                    else if (note.includes("Al-Musytarakah")) term = 'MUSYTARAKAH';
                    else if (note.includes("Al-Akdariyyah")) term = 'AKDARIYYAH';

                    return (
                        <div key={index} className="flex items-start">
                            <span className="icon-wrapper w-5 h-5 text-amber-500 mr-2.5 mt-0.5 shrink-0"><FaExclamationCircle /></span>
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

        {!hasReceivingHeirs ? (
            <div className="py-12 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-slate-100 dark:border-slate-700 border-dashed">
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4 shadow-sm">
                    <FaExclamationCircle size="1.5em" />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-bold max-w-xs">
                    Berdasarkan input, tidak ada ahli waris yang memenuhi syarat menerima bagian.
                </p>
            </div>
        ) : (
            <div className="space-y-8">
                
                {/* Visual Chart Area */}
                <div className="bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-6 border border-slate-100 dark:border-slate-700/50 flex flex-col items-center animate-fade-in">
                    <div className="w-full h-64 relative">
                            <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell 
                                            key={`cell-${index}`} 
                                            fill={entry.name.includes('Baitul Mal') ? '#64748b' : COLORS[index % COLORS.length]} 
                                        />
                                    ))}
                                    <Label 
                                        position="center"
                                        content={({ viewBox }) => {
                                            const { cx, cy } = viewBox as any;
                                            return (
                                                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central">
                                                    <tspan x={cx} y={cy} fontSize="28" fontWeight="900" className="fill-slate-800 dark:fill-white">100%</tspan>
                                                    <tspan x={cx} y={cy + 24} fontSize="12" fontWeight="500" className="fill-slate-400 dark:fill-slate-500 uppercase tracking-widest">Alokasi</tspan>
                                                </text>
                                            );
                                        }}
                                    />
                                </Pie>
                                <Tooltip content={<CustomChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    
                    <div className="w-full flex flex-wrap justify-center gap-3 mt-4">
                        {chartData.map((entry, index) => (
                            <div key={index} className="flex items-center text-xs font-medium bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm border border-slate-100 dark:border-slate-700">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: entry.name.includes('Baitul Mal') ? '#64748b' : COLORS[index % COLORS.length] }}></span>
                                <span className="text-slate-600 dark:text-slate-300 max-w-[120px] truncate">{entry.name}</span>
                                <span className="ml-1.5 font-bold text-slate-800 dark:text-white">{entry.value.toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cards List */}
                <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center uppercase tracking-widest border-b border-slate-100 dark:border-slate-700 pb-2">
                        <div className="mr-2 text-slate-400" ><FaBookOpen /></div>                        Rincian & Dalil
                    </h4>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                         {result.heirResults.map((heir, idx) => (
                            <HeirResultCard key={idx} heir={heir} />
                        ))}
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
