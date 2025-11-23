import React from "react";
import type {
  ZakatState,
  ZakatSettings,
  ZakatResult,
  ZakatHistoryEntry,
} from "../../types.ts";
import { ZakatInputField } from "./ZakatInputField.tsx";
import { NisabStatus } from "./NisabStatus.tsx";
import { formatCurrency } from "../../utils.ts";
import { exportZakatToPdf } from "../../services/pdf.service.ts";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// --- SHARED COMPONENTS ---

export const ViewSummaryButton = ({ onClick }: { onClick: () => void }) => (
  <div className="mt-8 pb-4 md:pb-0 animate-fade-in hidden md:block">
    {/* Desktop View: Static Button (Visible only on MD+) */}
    <div className="flex pt-4 border-t border-slate-100 dark:border-slate-700 justify-between items-center gap-4">
      <p className="text-sm text-slate-500 dark:text-slate-400 italic flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1 text-emerald-500"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        Data tersimpan otomatis.
      </p>
      <button
        onClick={onClick}
        className="group flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50 font-bold text-sm"
      >
        Lihat Hasil
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M14 5l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </button>
    </div>
  </div>
);

// --- TAB VIEWS ---

interface TabProps {
  state: ZakatState;
  settings: ZakatSettings;
  onChange: (key: keyof ZakatState, value: any) => void;
  onNext: () => void;
}

export const FitrahView: React.FC<TabProps> = ({ state, onChange, onNext }) => (
  <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
    <div className="md:hidden mb-2">
      <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
        Zakat Fitrah
      </h2>
      <p className="text-slate-500 dark:text-slate-400 text-xs">
        Wajib di bulan Ramadhan.
      </p>
    </div>
    <div className="hidden md:block">
      <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
        Zakat Fitrah
      </h2>
      <p className="text-slate-600 dark:text-slate-300">
        Wajib bagi setiap Muslim yang mampu pada bulan Ramadhan.
      </p>
    </div>

    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 md:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 w-full">
      <ZakatInputField
        label="Jumlah Orang"
        value={state.fitrahPeople}
        onChange={(v) => onChange("fitrahPeople", v)}
        type="number"
      />
      <div className="mt-4 w-full">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Metode Pembayaran
        </label>
        {/* Force full width on mobile with w-full and flex-col */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <label className="relative flex items-center w-full cursor-pointer bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors shadow-sm">
            <input
              type="radio"
              name="fitrahMethod"
              checked={state.fitrahMethod === "money"}
              onChange={() => onChange("fitrahMethod", "money")}
              className="text-emerald-600 focus:ring-emerald-500 w-5 h-5"
            />
            <span className="ml-3 font-bold text-slate-700 dark:text-slate-200 flex-1">
              Uang (Rp)
            </span>
          </label>
          <label className="relative flex items-center w-full cursor-pointer bg-white dark:bg-slate-900 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors shadow-sm">
            <input
              type="radio"
              name="fitrahMethod"
              checked={state.fitrahMethod === "rice"}
              onChange={() => onChange("fitrahMethod", "rice")}
              className="text-emerald-600 focus:ring-emerald-500 w-5 h-5"
            />
            <span className="ml-3 font-bold text-slate-700 dark:text-slate-200 flex-1">
              Beras (Kg)
            </span>
          </label>
        </div>
      </div>
    </div>
    <ViewSummaryButton onClick={onNext} />
  </div>
);

export const MaalView: React.FC<TabProps> = ({
  state,
  settings,
  onChange,
  onNext,
}) => {
  const netMaalAssets = Math.max(
    0,
    state.cash +
      state.savings +
      state.investments +
      state.otherAssets -
      state.debts
  );
  const nisabGoldValue = 85 * settings.goldPrice;

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      <div className="md:hidden mb-2">
        <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
          Zakat Maal
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs">
          Harta simpanan 1 tahun (Haul).
        </p>
      </div>
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
          Zakat Maal (Harta Simpanan)
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Dikenakan pada harta yang tersimpan selama 1 tahun (haul) dan mencapai
          nisab (setara 85g emas).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <ZakatInputField
          label="Uang Tunai / Tabungan"
          value={state.cash}
          onChange={(v) => onChange("cash", v)}
        />
        <ZakatInputField
          label="Tabungan Berjangka / Deposito"
          value={state.savings}
          onChange={(v) => onChange("savings", v)}
        />
        <ZakatInputField
          label="Investasi (Saham, Reksadana, Emas Digital)"
          value={state.investments}
          onChange={(v) => onChange("investments", v)}
        />
        <ZakatInputField
          label="Aset Lain (Properti Sewa, dll)"
          value={state.otherAssets}
          onChange={(v) => onChange("otherAssets", v)}
        />

        <div className="md:col-span-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
          <ZakatInputField
            label="Hutang Jatuh Tempo (Pengurang)"
            sublabel="Hutang yang harus segera dibayar mengurangi kewajiban zakat."
            value={state.debts}
            onChange={(v) => onChange("debts", v)}
          />
        </div>

        <div className="md:col-span-2 pt-6 mt-2 border-t border-slate-100 dark:border-slate-700">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
              Zakat Rikaz (Temuan/Hadiah)
            </h3>
            <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
              Tarif 20%
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">
            Dikenakan untuk harta karun temuan atau hadiah undian tak terduga
            (tanpa haul).
          </p>
          <ZakatInputField
            label="Nilai Barang Temuan / Hadiah"
            value={state.rikazValue}
            onChange={(v) => onChange("rikazValue", v)}
          />
        </div>
      </div>

      <NisabStatus
        value={netMaalAssets}
        nisab={nisabGoldValue}
        label="Zakat Maal"
      />
      <ViewSummaryButton onClick={onNext} />
    </div>
  );
};

export const GoldSilverView: React.FC<TabProps> = ({
  state,
  onChange,
  onNext,
}) => (
  <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
    <h2 className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400 hidden md:block">
      Zakat Emas & Perak
    </h2>
    <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 md:hidden">
      Emas & Perak
    </h2>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-yellow-50/50 dark:bg-yellow-900/20 p-4 md:p-6 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
        <ZakatInputField
          label="Berat Emas (Gram)"
          sublabel="Nisab: 85 gram"
          value={state.goldWeight}
          onChange={(v) => onChange("goldWeight", v)}
          type="number"
        />
        <NisabStatus
          value={state.goldWeight}
          nisab={85}
          label="Emas"
          unit="gram"
        />
      </div>
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <ZakatInputField
          label="Berat Perak (Gram)"
          sublabel="Nisab: 595 gram"
          value={state.silverWeight}
          onChange={(v) => onChange("silverWeight", v)}
          type="number"
        />
        <NisabStatus
          value={state.silverWeight}
          nisab={595}
          label="Perak"
          unit="gram"
        />
      </div>
    </div>
    <ViewSummaryButton onClick={onNext} />
  </div>
);

export const BusinessView: React.FC<TabProps> = ({
  state,
  settings,
  onChange,
  onNext,
}) => {
  const netBusinessAssets = Math.max(
    0,
    state.bizAssets + state.bizInventory - state.bizLiabilities
  );
  const nisabGoldValue = 85 * settings.goldPrice;

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">
          Zakat Perniagaan
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          Dihitung dari aset lancar usaha dikurangi hutang jangka pendek.
        </p>
      </div>
      <div className="md:hidden">
        <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">
          Zakat Perniagaan
        </h2>
      </div>

      <div className="grid md:grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
        <ZakatInputField
          label="Nilai Aset Lancar (Kas, Bank)"
          value={state.bizAssets}
          onChange={(v) => onChange("bizAssets", v)}
        />
        <ZakatInputField
          label="Nilai Stok Barang / Persediaan"
          value={state.bizInventory}
          onChange={(v) => onChange("bizInventory", v)}
        />
        <ZakatInputField
          label="Hutang Usaha Jatuh Tempo"
          value={state.bizLiabilities}
          onChange={(v) => onChange("bizLiabilities", v)}
        />
      </div>
      <NisabStatus
        value={netBusinessAssets}
        nisab={nisabGoldValue}
        label="Zakat Perniagaan"
      />
      <ViewSummaryButton onClick={onNext} />
    </div>
  );
};

export const AgricultureView: React.FC<TabProps> = ({
  state,
  settings,
  onChange,
  onNext,
}) => (
  <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
    <h2 className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400 hidden md:block">
      Zakat Pertanian
    </h2>
    <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 md:hidden">
      Zakat Pertanian
    </h2>

    <div className="bg-green-50 dark:bg-green-900/20 p-4 md:p-6 rounded-2xl border border-green-100 dark:border-green-800">
      <ZakatInputField
        label="Nilai Hasil Panen (Rupiah)"
        sublabel="Konversikan total hasil panen ke Rupiah"
        value={state.agriHarvest}
        onChange={(v) => onChange("agriHarvest", v)}
      />
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Sistem Pengairan
        </label>
        <select
          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm py-3 px-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 h-12"
          value={state.agriMethod}
          onChange={(e) => onChange("agriMethod", e.target.value)}
        >
          <option value="natural">Alami / Tadah Hujan (Tarif 10%)</option>
          <option value="artificial">Irigasi / Berbiaya (Tarif 5%)</option>
        </select>
      </div>
    </div>
    <NisabStatus
      value={state.agriHarvest}
      nisab={524 * settings.ricePrice}
      label="Pertanian"
    />
    <ViewSummaryButton onClick={onNext} />
  </div>
);

export const LivestockView: React.FC<TabProps> = ({
  state,
  settings,
  onChange,
  onNext,
}) => {
  const nisabGoldValue = 85 * settings.goldPrice;
  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
      <h2 className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-400 hidden md:block">
        Zakat Peternakan
      </h2>
      <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400 md:hidden">
        Zakat Peternakan
      </h2>

      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-sm text-amber-900 dark:text-amber-200 mb-4 flex items-start">
        <span className="text-xl mr-2">💡</span>
        <p>
          <strong>Mode Sederhana:</strong> Perhitungan menggunakan pendekatan
          nilai komersial (2.5%).
        </p>
      </div>
      <ZakatInputField
        label="Total Nilai Hewan Ternak (Rp)"
        value={state.livestockValue}
        onChange={(v) => onChange("livestockValue", v)}
      />
      <NisabStatus
        value={state.livestockValue}
        nisab={nisabGoldValue}
        label="Peternakan"
      />
      <ViewSummaryButton onClick={onNext} />
    </div>
  );
};

// --- SUMMARY VIEW ---

interface SummaryProps {
  result: ZakatResult | null;
  state: ZakatState; // Added state prop for chart
  history: ZakatHistoryEntry[];
  onSaveHistory: () => void;
  onDownloadPDF: () => void;
  onClearHistory: () => void;
  onLoadHistory: (entry: ZakatHistoryEntry) => void;
  receiptRef: React.RefObject<HTMLDivElement>;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#6366f1",
];

export const SummaryView: React.FC<SummaryProps> = ({
  result,
  state,
  history,
  onSaveHistory,
  onDownloadPDF,
  onClearHistory,
  onLoadHistory,
  receiptRef,
}) => {
  if (!result) return null;

  // Prepare Chart Data
  // Only show if there's value
  const chartData = [
    {
      name: "Fitrah",
      value: result.items.find((i) => i.id === "fitrah")?.zakatAmount || 0,
    },
    {
      name: "Maal",
      value: result.items.find((i) => i.id === "maal")?.zakatAmount || 0,
    },
    {
      name: "Emas/Perak",
      value:
        (result.items.find((i) => i.id === "gold")?.zakatAmount || 0) +
        (result.items.find((i) => i.id === "silver")?.zakatAmount || 0),
    },
    {
      name: "Niaga",
      value: result.items.find((i) => i.id === "business")?.zakatAmount || 0,
    },
    {
      name: "Lainnya",
      value:
        (result.items.find((i) => i.id === "agriculture")?.zakatAmount || 0) +
        (result.items.find((i) => i.id === "livestock")?.zakatAmount || 0) +
        (result.items.find((i) => i.id === "rikaz")?.zakatAmount || 0),
    },
  ].filter((item) => item.value > 0);

  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6 animate-fade-in pb-20 md:pb-12">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            Ringkasan & Kwitansi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Dibuat pada:{" "}
            {new Date(result.timestamp).toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            onClick={onSaveHistory}
            className="flex-1 sm:flex-none justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            Simpan
          </button>
          <button
            onClick={onDownloadPDF}
            className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Unduh PDF
          </button>
        </div>
      </div>

      {/* Receipt Card */}
      <div
        ref={receiptRef}
        className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm print:shadow-none print:border-black"
      >
        <div className="border-b-2 border-emerald-500 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">
              NIZAMY
            </h3>
            <p className="text-emerald-600 dark:text-emerald-500 font-medium text-xs md:text-sm tracking-wide uppercase">
              Kalkulator Zakat Mandiri
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">No. Ref</p>
            <p className="text-sm font-mono text-slate-600 dark:text-slate-300">
              {Date.now().toString().slice(-8)}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-4">
            {result.items.length === 0 && (
              <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                Belum ada data zakat yang dimasukkan.
              </div>
            )}

            {result.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 gap-2"
              >
                <div className="flex-1 pr-4">
                  <h4 className="font-bold text-slate-700 dark:text-slate-200">
                    {item.label}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {item.note}
                  </p>
                  {!item.isNisabReached && item.id !== "fitrah" && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] uppercase rounded font-bold tracking-wide">
                      Tidak Wajib (Belum Nisab)
                    </span>
                  )}
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 dark:bg-slate-700/30 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                  <p
                    className={`font-mono font-bold text-lg ${
                      item.zakatAmount > 0
                        ? "text-slate-800 dark:text-white"
                        : "text-slate-300 dark:text-slate-600"
                    }`}
                  >
                    {item.formattedValue
                      ? item.formattedValue
                      : formatCurrency(item.zakatAmount)}
                  </p>
                  {item.rate > 0 && (
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      Rate: {(item.rate * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Simple Asset Composition Chart */}
          {hasChartData && (
            <div
              data-html2canvas-ignore="true"
              className="w-full lg:w-72 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800"
            >
              <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
                Komposisi Zakat
              </h5>
              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
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
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "rgba(255,255,255,0.9)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full text-xs space-y-1 mt-2">
                {chartData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span
                        className="w-2 h-2 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></span>
                      <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px]">
                        {entry.name}
                      </span>
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {(
                        (entry.value /
                          chartData.reduce((a, b) => a + b.value, 0)) *
                        100
                      ).toFixed(0)}
                      %
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-slate-800 dark:border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="text-lg font-bold text-slate-800 dark:text-white">
              TOTAL ZAKAT
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 text-right">
              {result.formattedTotal}
            </span>
          </div>
          <p className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
            "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu
            membersihkan dan mensucikan mereka..." (At-Taubah: 103)
          </p>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Riwayat Tersimpan
            </h3>
            <button
              onClick={onClearHistory}
              className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline"
            >
              Hapus Semua
            </button>
          </div>
          <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-white dark:hover:bg-slate-700/50 hover:shadow-md transition-all group"
              >
                <div>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">
                    {entry.result.formattedTotal}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {entry.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => onLoadHistory(entry)}
                  className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg group-hover:border-emerald-200 dark:group-hover:border-emerald-500 transition-colors shadow-sm"
                >
                  Muat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
