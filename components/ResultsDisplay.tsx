import React, { useRef, useState } from 'react';
import type { CalculationResult, HeirResult } from '../types.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FIQH_DEFINITIONS } from '../constants.ts';
import { formatCurrency } from '../utils.ts';
import { exportToPdf } from '../services/pdf.service.ts';

const COLORS = [
  '#0ea5e9', '#0284c7', '#38bdf8', '#7dd3fc', 
  '#0369a1', '#075985', '#0c4a6e', '#082f49', 
  '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0'
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border border-slate-300 rounded-md shadow-lg">
        <p className="font-bold">{`${payload[0].name}`}</p>
        <p className="text-sm">{`Bagian: ${payload[0].value.toFixed(2)}%`}</p>
        <p className="text-sm">{`${formatCurrency(payload[0].payload.finalValue)}`}</p>
      </div>
    );
  }
  return null;
};

const InfoTooltip: React.FC<{ term: keyof typeof FIQH_DEFINITIONS }> = ({ term }) => {
  const [isOpen, setIsOpen] = useState(false);
  const data = FIQH_DEFINITIONS[term];

  if (!data) return null;

  return (
    <div className="relative inline-flex items-center ml-2">
      <button 
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className="cursor-pointer text-slate-500"
        aria-label={`Info tentang ${data.title}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-slate-800 text-white text-sm rounded-lg shadow-xl z-10 border border-slate-700 ring-1 ring-black ring-opacity-5">
          <h5 className="font-bold mb-1 text-primary-400">{data.title}</h5>
          <p className="text-xs text-slate-300">{data.definition}</p>
          <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800"></div>
        </div>
      )}
    </div>
  );
};

const PerPersonTooltip: React.FC<{ value: number }> = ({ value }) => {
  return (
    <div className="relative flex items-center group ml-2">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 cursor-help" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 bg-slate-800 text-white text-xs font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
        Setiap orang mendapat {formatCurrency(value)}
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
      </div>
    </div>
  );
};

const ResultCard: React.FC<{ heir: HeirResult }> = React.memo(({ heir }) => {
  return (
    <div className={`p-4 rounded-lg transition-all ${heir.isBlocked ? 'bg-slate-100 opacity-60' : 'bg-white shadow-md'}`}>
        <div className="flex justify-between items-start">
            <div>
                <h4 className="font-bold text-lg text-slate-800">{heir.name} ({heir.count})</h4>
                <p className={`font-semibold text-2xl ${heir.isBlocked ? 'text-slate-500' : 'text-primary-600'}`}>
                    {heir.isBlocked ? 'Terhalang' : `${heir.percentage.toFixed(2)}%`}
                </p>
            </div>
            {!heir.isBlocked && heir.value > 0 && (
                <div className="text-right">
                    <div className="flex items-center justify-end">
                        <p className="font-semibold text-slate-800">{formatCurrency(heir.value)}</p>
                        {heir.count > 1 && <PerPersonTooltip value={heir.value / heir.count} />}
                    </div>
                    <p className="text-sm text-slate-500">
                        {heir.finalShare.numerator}/{heir.finalShare.denominator}
                    </p>
                </div>
            )}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200">
            <p className="text-sm text-slate-600">{heir.reason}</p>
            <p className="text-xs text-slate-500 mt-1 font-mono">{heir.evidence}</p>
        </div>
    </div>
  );
});

interface ResultsDisplayProps {
  result: CalculationResult | null;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-24 h-24 text-slate-300 mb-4">
          <path d="M12.378 1.602a.75.75 0 0 0-.756 0L3 6.632l9 5.25 9-5.25-8.622-5.03ZM21.75 7.93l-9 5.25v9l8.628-5.032a.75.75 0 0 0 .372-.648V7.93ZM11.25 22.18v-9l-9-5.25v8.57a.75.75 0 0 0 .372.648L11.25 22.18Z" />
        </svg>
        <h3 className="text-2xl font-bold text-slate-700">Hasil Perhitungan Anda</h3>
        <p className="text-slate-500 mt-2 max-w-sm">Isi data ahli waris dan total harta, lalu klik "Hitung Pembagian" untuk melihat rincian waris di sini.</p>
      </div>
    );
  }

  const chartData = result.heirResults
    .filter(h => h.percentage > 0 && !h.isBlocked)
    .map(h => ({ name: `${h.name} (${h.count})`, value: h.percentage, finalValue: h.value, fill:'' }));
    
  const hasReceivingHeirs = chartData.length > 0;

  return (
    <div ref={resultsRef} className="bg-white rounded-2xl shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-slate-800">Ringkasan Hasil</h3>
            <button 
                data-html2canvas-ignore="true"
                onClick={() => exportToPdf(resultsRef, result)} 
                className="px-4 py-2 bg-slate-100 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors"
            >
                Export PDF
            </button>
        </div>
      
        <div className="grid grid-cols-1 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm text-slate-600">Total Harta Waris</p>
                <p className="text-3xl font-bold text-primary-600">{formatCurrency(result.estate)}</p>
            </div>
        </div>
      
        {result.notes.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg space-y-2">
                {result.notes.map((note, index) => {
                    let term: keyof typeof FIQH_DEFINITIONS | null = null;
                    if (note.includes("'Aul")) term = 'AUL';
                    else if (note.includes("Radd")) term = 'RADD';
                    else if (note.includes("Umariyyatain")) term = 'UMARIYYATAIN';
                    else if (note.includes("Al-Musytarakah")) term = 'MUSYTARAKAH';
                    else if (note.includes("Al-Akdariyyah")) term = 'AKDARIYYAH';

                    return (
                        <div key={index} className="flex items-center">
                            <p className="text-sm font-semibold text-yellow-800">{note}</p>
                            {term && <InfoTooltip term={term} />}
                        </div>
                    );
                })}
            </div>
        )}

        {!hasReceivingHeirs && (
            <div className="my-8 flex flex-col items-center justify-center text-center p-6 bg-blue-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h4 className="text-lg font-bold text-blue-800">Tidak Ada Ahli Waris yang Berhak</h4>
                <p className="text-sm text-blue-700 mt-1">Berdasarkan data yang dimasukkan, semua ahli waris terhalang (hajb) atau tidak ada ahli waris yang memenuhi syarat. Harta dapat dialihkan ke Baitul Mal jika tidak ada ahli waris lain.</p>
            </div>
        )}

        {hasReceivingHeirs && (
            <div className="mb-8">
                <h4 className="text-xl font-semibold mb-4 text-slate-700">Diagram Pembagian</h4>
                <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                        return (
                            <text x={x} y={y} fill="currentColor" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs text-slate-600">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                        );
                    }}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
                </div>
            </div>
        )}
      </div>

      <div className="results-list-container px-6 pb-6">
        <h4 className="text-xl font-semibold mb-4 text-slate-700">Rincian Per Ahli Waris</h4>
        <div className="space-y-4">
          {result.heirResults.map((heir, index) => (
            <div key={index} className="result-card-wrapper">
                <ResultCard heir={heir} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
