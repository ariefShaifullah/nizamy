import React, { useRef } from "react";
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

// --- SHARED COMPONENTS ---

export const ViewSummaryButton = ({ onClick }: { onClick: () => void }) => (
  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in">
    <p className="text-sm text-slate-500 italic flex items-center">
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
      className="group flex items-center px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-sm hover:shadow-md font-medium w-full sm:w-auto justify-center"
    >
      Lihat Hasil di Ringkasan
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform"
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
);

// --- TAB VIEWS ---

interface TabProps {
  state: ZakatState;
  settings: ZakatSettings;
  onChange: (key: keyof ZakatState, value: any) => void;
  onNext: () => void;
}

export const FitrahView: React.FC<TabProps> = ({ state, onChange, onNext }) => (
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold text-emerald-800">Zakat Fitrah</h2>
    <p className="text-slate-600">
      Wajib bagi setiap Muslim yang mampu pada bulan Ramadhan. Besaran umum 2.5
      kg beras atau setara uang.
    </p>
    <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
      <ZakatInputField
        label="Jumlah Orang"
        value={state.fitrahPeople}
        onChange={(v) => onChange("fitrahPeople", v)}
        type="number"
      />
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Metode Pembayaran
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
            <input
              type="radio"
              name="fitrahMethod"
              checked={state.fitrahMethod === "money"}
              onChange={() => onChange("fitrahMethod", "money")}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 font-medium text-slate-700">Uang (Rp)</span>
          </label>
          <label className="flex items-center cursor-pointer bg-white px-4 py-2 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
            <input
              type="radio"
              name="fitrahMethod"
              checked={state.fitrahMethod === "rice"}
              onChange={() => onChange("fitrahMethod", "rice")}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="ml-2 font-medium text-slate-700">Beras (Kg)</span>
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
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-emerald-800">
        Zakat Maal (Harta Simpanan)
      </h2>
      <p className="text-slate-600">
        Dikenakan pada harta yang tersimpan selama 1 tahun (haul) dan mencapai
        nisab (setara 85g emas).
      </p>

      <div className="grid md:grid-cols-2 gap-6">
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

        <div className="md:col-span-2">
          <ZakatInputField
            label="Hutang Jatuh Tempo (Pengurang)"
            sublabel="Hutang yang harus segera dibayar mengurangi kewajiban zakat."
            value={state.debts}
            onChange={(v) => onChange("debts", v)}
          />
        </div>

        <div className="md:col-span-2 pt-6 mt-2 border-t border-slate-100">
          <div className="flex items-center mb-2">
            <h3 className="font-bold text-emerald-700 text-lg">
              Zakat Rikaz (Temuan/Hadiah)
            </h3>
            <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
              Tarif 20%
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-4">
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
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold text-emerald-800">Zakat Emas & Perak</h2>
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
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
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
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
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-emerald-800">Zakat Perniagaan</h2>
      <p className="text-slate-600">
        Dihitung dari aset lancar usaha dikurangi hutang jangka pendek. Nisab
        setara 85g emas.
      </p>
      <div className="grid md:grid-cols-1 gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
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
  <div className="space-y-6 animate-fade-in">
    <h2 className="text-2xl font-bold text-emerald-800">Zakat Pertanian</h2>
    <p className="text-slate-600">
      Dibayarkan saat panen. Nisab setara 5 wasaq (±653 kg gabah atau ±524 kg
      beras).
    </p>
    <div className="bg-green-50 p-6 rounded-xl border border-green-100">
      <ZakatInputField
        label="Nilai Hasil Panen (Rupiah)"
        sublabel="Konversikan total hasil panen ke Rupiah"
        value={state.agriHarvest}
        onChange={(v) => onChange("agriHarvest", v)}
      />
      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Sistem Pengairan
        </label>
        <select
          className="w-full border border-slate-300 rounded-lg shadow-sm py-3 px-3 bg-white focus:ring-emerald-500 focus:border-emerald-500"
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
      nisab={653 * settings.ricePrice}
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
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-emerald-800">Zakat Peternakan</h2>
      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 text-sm text-amber-900 mb-4 flex items-start">
        <span className="text-xl mr-2">💡</span>
        <p>
          <strong>Mode Sederhana:</strong> Perhitungan di bawah ini menggunakan
          pendekatan nilai komersial (Qiyas Zakat Perniagaan) sebesar 2.5%.
          Untuk perhitungan konvensional berdasarkan jumlah ekor (sainah),
          disarankan berkonsultasi langsung dengan amil zakat.
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
  history: ZakatHistoryEntry[];
  onSaveHistory: () => void;
  onDownloadPDF: () => void;
  onClearHistory: () => void;
  onLoadHistory: (entry: ZakatHistoryEntry) => void;
  receiptRef: React.RefObject<HTMLDivElement>;
}

export const SummaryView: React.FC<SummaryProps> = ({
  result,
  history,
  onSaveHistory,
  onDownloadPDF,
  onClearHistory,
  onLoadHistory,
  receiptRef,
}) => {
  if (!result) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            Ringkasan & Kwitansi
          </h2>
          <p className="text-slate-500 text-sm mt-1">
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
            className="flex-1 sm:flex-none justify-center bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
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
            className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
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
        className="bg-white border-2 border-slate-100 rounded-xl p-8 shadow-sm print:shadow-none print:border-black"
      >
        <div className="border-b-2 border-emerald-500 pb-4 mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-3xl font-extrabold text-emerald-800 tracking-tight">
              NIZAMY
            </h3>
            <p className="text-emerald-600 font-medium text-sm tracking-wide uppercase">
              Kalkulator Zakat Mandiri
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400">No. Ref</p>
            <p className="text-sm font-mono text-slate-600">
              {Date.now().toString().slice(-8)}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {result.items.length === 0 && (
            <div className="text-center text-slate-500 py-8 italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
              Belum ada data zakat yang dimasukkan.
            </div>
          )}

          {result.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0"
            >
              <div className="flex-1 pr-4">
                <h4 className="font-bold text-slate-700">{item.label}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.note}
                </p>
                {!item.isNisabReached && item.id !== "fitrah" && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] uppercase rounded font-bold tracking-wide">
                    Tidak Wajib (Belum Nisab)
                  </span>
                )}
              </div>
              <div className="text-right">
                <p
                  className={`font-mono font-bold text-lg ${
                    item.zakatAmount > 0 ? "text-slate-800" : "text-slate-300"
                  }`}
                >
                  {item.formattedValue
                    ? item.formattedValue
                    : formatCurrency(item.zakatAmount)}
                </p>
                {item.rate > 0 && (
                  <p className="text-xs text-slate-400">
                    Rate: {(item.rate * 100).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t-2 border-slate-800">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-slate-800">
              TOTAL ZAKAT
            </span>
            <span className="text-xl sm:text-3xl font-extrabold text-emerald-600 text-right pl-2">
              {result.formattedTotal}
            </span>
          </div>
          <p className="text-right text-xs text-slate-500 mt-2 italic">
            "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu
            membersihkan dan mensucikan mereka..." (At-Taubah: 103)
          </p>
        </div>
      </div>

      {/* History Section */}
      {history.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-slate-700 flex items-center">
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
              className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
            >
              Hapus Semua
            </button>
          </div>
          <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:bg-white hover:shadow-md transition-all group"
              >
                <div>
                  <p className="font-bold text-emerald-700">
                    {entry.result.formattedTotal}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {entry.timestamp}
                  </p>
                </div>
                <button
                  onClick={() => onLoadHistory(entry)}
                  className="text-sm text-slate-500 hover:text-emerald-600 font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg group-hover:border-emerald-200 transition-colors"
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
