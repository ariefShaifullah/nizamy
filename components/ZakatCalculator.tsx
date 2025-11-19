import React, { useState, useEffect, useRef } from "react";
import type {
  ZakatState,
  ZakatSettings,
  ZakatResult,
  ZakatHistoryEntry,
} from "../types.ts";
import { calculateTotalZakat } from "../services/zakat.service.ts";
import { formatCurrency, formatNumber } from "../utils.ts";
import { FAQ } from "./FAQ.tsx";
import { ZAKAT_FAQ } from "../constants.ts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const INITIAL_SETTINGS: ZakatSettings = {
  goldPrice: 2200000, // IDR per gram (Example default)
  silverPrice: 25000, // IDR per gram
  ricePrice: 15000, // IDR per kg
  riceKgPerPerson: 2.5,
  currency: "IDR",
};

const INITIAL_STATE: ZakatState = {
  fitrahPeople: 0,
  fitrahMethod: "money",
  cash: 0,
  savings: 0,
  investments: 0,
  otherAssets: 0,
  debts: 0,
  rikazValue: 0,
  goldWeight: 0,
  silverWeight: 0,
  bizAssets: 0,
  bizInventory: 0,
  bizLiabilities: 0,
  agriHarvest: 0,
  agriMethod: "natural",
  livestockValue: 0,
};

const TABS = [
  { id: "summary", label: "Ringkasan" },
  { id: "fitrah", label: "Fitrah" },
  { id: "maal", label: "Maal & Harta" },
  { id: "gold", label: "Emas/Perak" },
  { id: "business", label: "Perniagaan" },
  { id: "agri", label: "Pertanian" },
  { id: "livestock", label: "Ternak" },
];

// --- KOMPONEN INPUT FIELD ---
interface InputFieldProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
  type?: "currency" | "number";
}

const InputField: React.FC<InputFieldProps> = React.memo(
  ({ label, sublabel, value, onChange, type = "currency" }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;

      if (type === "currency") {
        const digits = rawValue.replace(/\D/g, "");
        const numValue = digits === "" ? 0 : parseInt(digits, 10);
        onChange(numValue);
      } else {
        const normalized = rawValue.replace(",", ".");
        const num = parseFloat(normalized);
        onChange(isNaN(num) ? 0 : num);
      }
    };

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
        {sublabel && <p className="text-xs text-slate-500 mb-2">{sublabel}</p>}
        <div className="relative">
          {type === "currency" ? (
            <>
              <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={value === 0 ? "" : formatNumber(value)}
                onChange={handleChange}
                className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 font-medium placeholder-slate-400"
                placeholder="0"
              />
            </>
          ) : (
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={value === 0 ? "" : value}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm py-2 pl-3 pr-3 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder-slate-400"
              placeholder="0"
            />
          )}
        </div>
      </div>
    );
  }
);

// --- KOMPONEN STATUS NISAB ---
interface NisabStatusProps {
  value: number;
  nisab: number;
  label: string;
  unit?: string;
  customMessage?: string;
}

const NisabStatus: React.FC<NisabStatusProps> = ({
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

// --- Helper Button Component ---
const ViewSummaryButton = ({ onClick }: { onClick: () => void }) => (
  <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
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

export const ZakatCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fitrah");
  const [settings, setSettings] = useState<ZakatSettings>(INITIAL_SETTINGS);
  const [state, setState] = useState<ZakatState>(INITIAL_STATE);
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [history, setHistory] = useState<ZakatHistoryEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("zakatSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedState = localStorage.getItem("zakatState");
    if (savedState) setState(JSON.parse(savedState));

    const savedHistory = localStorage.getItem("zakatHistory");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("zakatSettings", JSON.stringify(settings));
    localStorage.setItem("zakatState", JSON.stringify(state));
    setResult(calculateTotalZakat(state, settings));
  }, [state, settings]);

  const handleInputChange = (key: keyof ZakatState, value: any) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSettingChange = (key: keyof ZakatSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus semua nilai input zakat? Data yang sudah diisi akan hilang. Pengaturan harga tidak akan berubah."
      )
    ) {
      setState(INITIAL_STATE);
      setActiveTab("fitrah");
    }
  };

  const handleSaveHistory = () => {
    if (!result) return;
    const newEntry: ZakatHistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString("id-ID"),
      state: state,
      result: result,
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem("zakatHistory", JSON.stringify(updatedHistory));
    alert("Perhitungan berhasil disimpan ke riwayat.");
  };

  const handleLoadHistory = (entry: ZakatHistoryEntry) => {
    if (
      window.confirm(
        "Muat data ini? Input saat ini akan digantikan dengan data dari riwayat."
      )
    ) {
      setState(entry.state);
      setActiveTab("summary");
      // Scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Hapus semua riwayat perhitungan?")) {
      setHistory([]);
      localStorage.removeItem("zakatHistory");
    }
  };

  const goToSummary = () => setActiveTab("summary");

  const downloadPDF = async () => {
    if (!receiptRef.current || !result) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeight);
      pdf.save(
        `Kwitansi_Zakat_NIZAMY_${new Date().toISOString().split("T")[0]}.pdf`
      );
    } catch (err) {
      console.error("PDF Export failed", err);
      alert("Gagal mengunduh PDF");
    }
  };

  // Helpers for Nisab Calculations in UI
  const nisabGoldValue = 85 * settings.goldPrice;

  const netMaalAssets = Math.max(
    0,
    state.cash +
      state.savings +
      state.investments +
      state.otherAssets -
      state.debts
  );
  const netBusinessAssets = Math.max(
    0,
    state.bizAssets + state.bizInventory - state.bizLiabilities
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-emerald-800 sm:text-5xl">
          Kalkulator Zakat Online
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600">
          Hitung kewajiban <strong>Zakat Fitrah</strong> dan{" "}
          <strong>Zakat Maal</strong> (Harta) secara akurat sesuai Nisab & Haul.
          Data dijamin privasi (tersimpan lokal).
        </p>
      </div>

      {/* Toolbar: Settings & Reset */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left: Tickers */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-4 md:gap-6 text-sm w-full sm:w-auto">
          <div className="flex items-center">
            <span className="text-slate-500 mr-2">Harga Emas (g):</span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(settings.goldPrice)}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-slate-500 mr-2">Harga Beras (kg):</span>
            <span className="font-semibold text-emerald-700">
              {formatCurrency(settings.ricePrice)}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          <button
            onClick={handleReset}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-colors flex items-center"
            title="Hapus semua input data"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Reset Data
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors flex items-center ${
              showSettings
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-800"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Pengaturan Harga
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-50 rounded-xl border border-emerald-100 p-6 mb-8 animate-fade-in-down">
          <h3 className="font-bold text-emerald-800 mb-4">
            Asumsi Harga & Parameter
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Harga Emas per Gram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    settings.goldPrice === 0
                      ? ""
                      : formatNumber(settings.goldPrice)
                  }
                  onChange={(e) =>
                    handleSettingChange(
                      "goldPrice",
                      parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                    )
                  }
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Acuan: Antam atau harga pasar.
              </p>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Harga Perak per Gram
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    settings.silverPrice === 0
                      ? ""
                      : formatNumber(settings.silverPrice)
                  }
                  onChange={(e) =>
                    handleSettingChange(
                      "silverPrice",
                      parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                    )
                  }
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                Harga Beras per Kg
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={
                    settings.ricePrice === 0
                      ? ""
                      : formatNumber(settings.ricePrice)
                  }
                  onChange={(e) =>
                    handleSettingChange(
                      "ricePrice",
                      parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                    )
                  }
                  className="w-full bg-white text-slate-900 border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1">
          <nav className="flex flex-col space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md"
                    : "bg-white text-slate-600 hover:bg-emerald-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-lg border border-slate-200 min-h-[500px] p-6">
          {activeTab === "fitrah" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Fitrah
              </h2>
              <p className="text-slate-600">
                Wajib bagi setiap Muslim yang mampu pada bulan Ramadhan. Besaran
                umum 2.5 kg beras atau setara uang.
              </p>
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <InputField
                  label="Jumlah Orang"
                  value={state.fitrahPeople}
                  onChange={(v) => handleInputChange("fitrahPeople", v)}
                  type="number"
                />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Metode Pembayaran
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="fitrahMethod"
                        checked={state.fitrahMethod === "money"}
                        onChange={() =>
                          setState({ ...state, fitrahMethod: "money" })
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2">Uang (Rp)</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="fitrahMethod"
                        checked={state.fitrahMethod === "rice"}
                        onChange={() =>
                          setState({ ...state, fitrahMethod: "rice" })
                        }
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="ml-2">Beras (Kg)</span>
                    </label>
                  </div>
                </div>
              </div>
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "maal" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Maal (Harta Simpanan)
              </h2>
              <p className="text-slate-600">
                Dikenakan pada harta yang tersimpan selama 1 tahun (haul) dan
                mencapai nisab (setara 85g emas).
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <InputField
                  label="Uang Tunai / Tabungan"
                  value={state.cash}
                  onChange={(v) => handleInputChange("cash", v)}
                />
                <InputField
                  label="Tabungan Berjangka / Deposito"
                  value={state.savings}
                  onChange={(v) => handleInputChange("savings", v)}
                />
                <InputField
                  label="Investasi (Saham, Reksadana, Emas Digital)"
                  value={state.investments}
                  onChange={(v) => handleInputChange("investments", v)}
                />
                <InputField
                  label="Aset Lain (Properti Sewa, dll)"
                  value={state.otherAssets}
                  onChange={(v) => handleInputChange("otherAssets", v)}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Hutang Jatuh Tempo (Pengurang)"
                    sublabel="Hutang yang harus segera dibayar mengurangi kewajiban zakat."
                    value={state.debts}
                    onChange={(v) => handleInputChange("debts", v)}
                  />
                </div>

                {/* Rikaz Section - Added here as part of Wealth but separated visually */}
                <div className="md:col-span-2 pt-4 mt-2 border-t border-slate-100">
                  <h3 className="font-bold text-emerald-700 mb-2">
                    Zakat Rikaz (Barang Temuan/Hadiah)
                  </h3>
                  <p className="text-xs text-slate-500 mb-2">
                    Tarif 20% (1/5). Dikenakan untuk harta karun temuan atau
                    hadiah undian tak terduga.
                  </p>
                  <InputField
                    label="Nilai Barang Temuan / Hadiah"
                    value={state.rikazValue}
                    onChange={(v) => handleInputChange("rikazValue", v)}
                  />
                </div>
              </div>
              <NisabStatus
                value={netMaalAssets}
                nisab={nisabGoldValue}
                label="Zakat Maal"
              />
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "gold" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Emas & Perak
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <InputField
                    label="Berat Emas (Gram)"
                    sublabel="Nisab: 85 gram"
                    value={state.goldWeight}
                    onChange={(v) => handleInputChange("goldWeight", v)}
                    type="number"
                  />
                  <NisabStatus
                    value={state.goldWeight}
                    nisab={85}
                    label="Emas"
                    unit="gram"
                  />
                </div>
                <div>
                  <InputField
                    label="Berat Perak (Gram)"
                    sublabel="Nisab: 595 gram"
                    value={state.silverWeight}
                    onChange={(v) => handleInputChange("silverWeight", v)}
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
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Perniagaan
              </h2>
              <p className="text-slate-600">
                Dihitung dari aset lancar usaha dikurangi hutang jangka pendek.
                Nisab setara 85g emas.
              </p>
              <div className="grid md:grid-cols-1 gap-4">
                <InputField
                  label="Nilai Aset Lancar (Kas, Bank)"
                  value={state.bizAssets}
                  onChange={(v) => handleInputChange("bizAssets", v)}
                />
                <InputField
                  label="Nilai Stok Barang / Persediaan"
                  value={state.bizInventory}
                  onChange={(v) => handleInputChange("bizInventory", v)}
                />
                <InputField
                  label="Hutang Usaha Jatuh Tempo"
                  value={state.bizLiabilities}
                  onChange={(v) => handleInputChange("bizLiabilities", v)}
                />
              </div>
              <NisabStatus
                value={netBusinessAssets}
                nisab={nisabGoldValue}
                label="Zakat Perniagaan"
              />
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "agri" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Pertanian
              </h2>
              <p className="text-slate-600">
                Dibayarkan saat panen. Nisab setara 5 wasaq (±653 kg gabah atau
                ±524 kg beras).
              </p>
              <InputField
                label="Nilai Hasil Panen (Rupiah)"
                sublabel="Konversikan total hasil panen ke Rupiah"
                value={state.agriHarvest}
                onChange={(v) => handleInputChange("agriHarvest", v)}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Sistem Pengairan
                </label>
                <select
                  className="w-full border border-slate-300 rounded-md shadow-sm py-2 px-3"
                  value={state.agriMethod}
                  onChange={(e) =>
                    setState({ ...state, agriMethod: e.target.value as any })
                  }
                >
                  <option value="natural">
                    Alami / Tadah Hujan (Tarif 10%)
                  </option>
                  <option value="artificial">
                    Irigasi / Berbiaya (Tarif 5%)
                  </option>
                </select>
              </div>
              <NisabStatus
                value={state.agriHarvest}
                nisab={653 * settings.ricePrice}
                label="Pertanian"
              />
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "livestock" && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Peternakan
              </h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-sm text-yellow-800 mb-4">
                <strong>Mode Sederhana:</strong> Perhitungan di bawah ini
                menggunakan pendekatan nilai komersial (Qiyas Zakat Perniagaan)
                sebesar 2.5%. Untuk perhitungan konvensional berdasarkan jumlah
                ekor (misal: 1 kambing untuk 40 ekor), disarankan berkonsultasi
                langsung dengan amil zakat.
              </div>
              <InputField
                label="Total Nilai Hewan Ternak (Rp)"
                value={state.livestockValue}
                onChange={(v) => handleInputChange("livestockValue", v)}
              />
              <NisabStatus
                value={state.livestockValue}
                nisab={nisabGoldValue}
                label="Peternakan"
              />
              <ViewSummaryButton onClick={goToSummary} />
            </div>
          )}

          {activeTab === "summary" && result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Ringkasan & Kwitansi
                  </h2>
                  <p className="text-slate-500 text-sm">
                    Dibuat pada:{" "}
                    {new Date(result.timestamp).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveHistory}
                    className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
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
                    Simpan Riwayat
                  </button>
                  <button
                    onClick={downloadPDF}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm transition-colors"
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

              {/* Receipt Visual */}
              <div
                ref={receiptRef}
                className="bg-white border-2 border-slate-100 rounded-xl p-8 shadow-sm print:shadow-none print:border-black"
              >
                <div className="border-b-2 border-emerald-500 pb-4 mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-extrabold text-emerald-800 tracking-tight">
                      NIZAMY
                    </h3>
                    <p className="text-emerald-600 font-medium">
                      Kalkulator Zakat Mandiri
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {result.items.length === 0 && (
                    <p className="text-center text-slate-500 py-4 italic">
                      Belum ada data zakat yang dimasukkan. Silakan isi form
                      pada tab terkait.
                    </p>
                  )}

                  {result.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start py-3 border-b border-slate-100 last:border-0"
                    >
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-slate-700">
                          {item.label}
                        </h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {item.note}
                        </p>
                        {!item.isNisabReached && item.id !== "fitrah" && (
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded font-medium">
                            Belum mencapai nisab (Tidak wajib)
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-mono font-bold ${
                            item.zakatAmount > 0
                              ? "text-slate-800"
                              : "text-slate-300"
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
                    <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 text-right pl-2">
                      {result.formattedTotal}
                    </span>
                  </div>
                  <p className="text-right text-xs text-slate-500 mt-1 italic">
                    "Ambillah zakat dari sebagian harta mereka, dengan zakat itu
                    kamu membersihkan dan mensucikan mereka..." (At-Taubah: 103)
                  </p>
                </div>
              </div>

              {/* HISTORY SECTION */}
              {history.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-700">
                      Riwayat Tersimpan
                    </h3>
                    <button
                      onClick={handleClearHistory}
                      className="text-xs text-red-600 hover:text-red-800 font-medium"
                    >
                      Hapus Semua
                    </button>
                  </div>
                  <div className="grid gap-3 max-h-60 overflow-y-auto">
                    {history.map((entry) => (
                      <div
                        key={entry.id}
                        className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex justify-between items-center hover:bg-slate-100 transition-colors"
                      >
                        <div>
                          <p className="font-bold text-emerald-700">
                            {entry.result.formattedTotal}
                          </p>
                          <p className="text-xs text-slate-500">
                            {entry.timestamp}
                          </p>
                        </div>
                        <button
                          onClick={() => handleLoadHistory(entry)}
                          className="text-sm text-emerald-600 hover:underline px-2"
                        >
                          Muat Ulang
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <FAQ
        title="Pertanyaan Umum (FAQ) Zakat"
        subtitle="Pelajari lebih lanjut tentang Nisab, Haul, dan jenis-jenis Zakat."
        data={ZAKAT_FAQ}
      />
    </div>
  );
};
