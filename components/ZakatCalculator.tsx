import React, { useState, useEffect, useRef } from "react";
import type { ZakatState, ZakatSettings, ZakatResult } from "../types.ts";
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
                className="w-full border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
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
              className="w-full border border-slate-300 rounded-md shadow-sm py-2 pl-3 pr-3 focus:ring-emerald-500 focus:border-emerald-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
}

const NisabStatus: React.FC<NisabStatusProps> = ({
  value,
  nisab,
  label,
  unit = "Rp",
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
            Total Harta/Nilai Bersih:{" "}
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
            Harta belum mencapai nisab, maka{" "}
            <strong>muzakki belum wajib zakat</strong> (tidak ada kewajiban
            membayar).
          </span>
        </div>
      )}
    </div>
  );
};

export const ZakatCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fitrah");
  const [settings, setSettings] = useState<ZakatSettings>(INITIAL_SETTINGS);
  const [state, setState] = useState<ZakatState>(INITIAL_STATE);
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("zakatSettings");
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    const savedState = localStorage.getItem("zakatState");
    if (savedState) setState(JSON.parse(savedState));
  }, []);

  useEffect(() => {
    localStorage.setItem("zakatSettings", JSON.stringify(settings));
    localStorage.setItem("zakatState", JSON.stringify(state));
    setResult(calculateTotalZakat(state, settings));
  }, [state, settings]);

  const handleInputChange = (key: keyof ZakatState, value: number) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSettingChange = (key: keyof ZakatSettings, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
          Hitung kewajiban <strong>Zakat Fitrah</strong>,{" "}
          <strong>Zakat Maal</strong> (Harta), dan{" "}
          <strong>Zakat Profesi</strong> secara akurat sesuai Nisab & Haul. Data
          dijamin privasi (tersimpan lokal).
        </p>
      </div>

      {/* Settings Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-6 text-sm">
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
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
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
                  className="w-full border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="w-full border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500"
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
                  className="w-full border border-slate-300 rounded-md shadow-sm py-2 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500"
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
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "maal" && (
            <div className="space-y-6">
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
              </div>
              <NisabStatus
                value={netMaalAssets}
                nisab={nisabGoldValue}
                label="Zakat Maal"
              />
            </div>
          )}

          {activeTab === "gold" && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "business" && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "agri" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-emerald-800">
                Zakat Pertanian
              </h2>
              <p className="text-slate-600">
                Dibayarkan saat panen. Nisab setara 5 wasaq (±653 kg
                gabah/beras).
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
            </div>
          )}

          {activeTab === "livestock" && (
            <div className="space-y-6">
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
            </div>
          )}

          {activeTab === "summary" && result && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-start">
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
                <button
                  onClick={downloadPDF}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-sm"
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
                          {formatCurrency(item.zakatAmount)}
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
                    <span className="text-2xl font-extrabold text-emerald-600">
                      {formatCurrency(result.totalZakat)}
                    </span>
                  </div>
                  <p className="text-right text-xs text-slate-500 mt-1 italic">
                    "Ambillah zakat dari sebagian harta mereka, dengan zakat itu
                    kamu membersihkan dan mensucikan mereka..." (At-Taubah: 103)
                  </p>
                </div>
              </div>
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
