import React, { useState, useEffect, useRef } from "react";
import type {
  ZakatState,
  ZakatSettings,
  ZakatResult,
  ZakatHistoryEntry,
} from "../../types.ts";
import { calculateTotalZakat } from "../../services/zakat.service.ts";
import { formatNumber, formatCurrency } from "../../utils.ts";
import { FAQ } from "../FAQ.tsx";
import { ZAKAT_FAQ } from "../../constants.ts";
import { exportZakatToPdf } from "../../services/pdf.service.ts";
import {
  FitrahView,
  MaalView,
  GoldSilverView,
  BusinessView,
  AgricultureView,
  LivestockView,
  SummaryView,
} from "./ZakatTabs.tsx";

const INITIAL_SETTINGS: ZakatSettings = {
  goldPrice: 2200000,
  silverPrice: 25000,
  ricePrice: 15000,
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
  { id: "fitrah", label: "Fitrah", icon: "🍚" },
  { id: "maal", label: "Maal", icon: "💰" },
  { id: "gold", label: "Emas", icon: "🥇" },
  { id: "business", label: "Niaga", icon: "🏪" },
  { id: "agri", label: "Tani", icon: "🌾" },
  { id: "livestock", label: "Ternak", icon: "🐄" },
  { id: "summary", label: "Hasil", icon: "🧾" },
];

export const ZakatCalculator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("fitrah");
  const [settings, setSettings] = useState<ZakatSettings>(INITIAL_SETTINGS);
  const [state, setState] = useState<ZakatState>(INITIAL_STATE);
  const [result, setResult] = useState<ZakatResult | null>(null);
  const [history, setHistory] = useState<ZakatHistoryEntry[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem("zakatSettings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedState = localStorage.getItem("zakatState");
      if (savedState) setState(JSON.parse(savedState));

      const savedHistory = localStorage.getItem("zakatHistory");
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    } catch (e) {
      console.error("Failed to load data from local storage", e);
    }
  }, []);

  // Save & Recalculate
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
        "Apakah Anda yakin ingin menghapus semua nilai input zakat? Data yang sudah diisi akan hilang."
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
    const updatedHistory = [newEntry, ...history].slice(0, 10);
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

  const handleDownloadPDF = () => {
    if (receiptRef.current) {
      exportZakatToPdf(
        receiptRef,
        `Kwitansi_Zakat_NIZAMY_${new Date().toISOString().split("T")[0]}.pdf`
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-emerald-900 sm:text-5xl">
          Kalkulator Zakat
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base md:text-lg text-slate-600">
          Hitung <strong>Zakat Fitrah</strong> dan <strong>Maal</strong> akurat
          sesuai Nisab & Haul.
        </p>
      </div>

      {/* Settings Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-6 text-sm w-full md:w-auto">
          <div className="flex items-center bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100">
            <span className="text-slate-500 mr-2 text-xs md:text-sm">
              Emas/g:
            </span>
            <span className="font-bold text-emerald-700 text-xs md:text-sm">
              {formatCurrency(settings.goldPrice)}
            </span>
          </div>
          <div className="flex items-center bg-emerald-50/50 px-3 py-2 rounded-lg border border-emerald-100">
            <span className="text-slate-500 mr-2 text-xs md:text-sm">
              Beras/kg:
            </span>
            <span className="font-bold text-emerald-700 text-xs md:text-sm">
              {formatCurrency(settings.ricePrice)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-end">
          <button
            onClick={handleReset}
            className="text-xs md:text-sm font-medium px-3 py-2 rounded-lg bg-slate-50 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
          >
            Reset
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`text-xs md:text-sm font-medium px-4 py-2 rounded-lg border transition-colors flex items-center shadow-sm ${
              showSettings
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                clipRule="evenodd"
              />
            </svg>
            Ubah Harga
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-slate-50 rounded-xl border border-emerald-100 p-6 mb-8 animate-fade-in-down shadow-inner">
          <h3 className="font-bold text-emerald-800 mb-4 flex items-center">
            <span className="bg-emerald-200 text-emerald-700 w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
              ⚙️
            </span>
            Asumsi Harga Pasar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: "Harga Emas / Gram",
                key: "goldPrice" as keyof ZakatSettings,
                hint: "Acuan: Antam",
              },
              {
                label: "Harga Perak / Gram",
                key: "silverPrice" as keyof ZakatSettings,
                hint: "",
              },
              {
                label: "Harga Beras / Kg",
                key: "ricePrice" as keyof ZakatSettings,
                hint: "Beras kualitas sedang/baik",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-sm text-slate-600 mb-1 font-medium">
                  {field.label}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">
                    Rp
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      settings[field.key] === 0
                        ? ""
                        : formatNumber(settings[field.key] as number)
                    }
                    onChange={(e) =>
                      handleSettingChange(
                        field.key,
                        parseInt(e.target.value.replace(/\D/g, "") || "0", 10)
                      )
                    }
                    className="w-full bg-white text-slate-900 border border-slate-300 rounded-lg shadow-sm py-2.5 pl-10 pr-3 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
                  />
                </div>
                {field.hint && (
                  <p className="text-xs text-slate-400 mt-1">{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Layout: Flexbox for Better Responsive Control */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        {/* Navigation: Horizontal on Mobile, Vertical Fixed on Desktop */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <nav
            className="flex lg:flex-col overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 lg:sticky lg:top-24 space-x-2 lg:space-x-0 lg:space-y-2 no-scrollbar"
            aria-label="Tabs"
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap px-4 py-3 text-sm font-medium rounded-xl transition-all flex items-center flex-shrink-0 ${
                  activeTab === tab.id
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 lg:translate-x-2"
                    : "bg-white text-slate-600 border border-slate-100 hover:bg-emerald-50 hover:text-emerald-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content Area: Flex-1 with min-w-0 to prevent overflow */}
        <div className="flex-1 min-w-0 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-[500px] p-6 md:p-8 relative">
          {activeTab === "fitrah" && (
            <FitrahView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "maal" && (
            <MaalView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "gold" && (
            <GoldSilverView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "business" && (
            <BusinessView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "agri" && (
            <AgricultureView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "livestock" && (
            <LivestockView
              state={state}
              settings={settings}
              onChange={handleInputChange}
              onNext={goToSummary}
            />
          )}
          {activeTab === "summary" && (
            <SummaryView
              result={result}
              history={history}
              onSaveHistory={handleSaveHistory}
              onDownloadPDF={handleDownloadPDF}
              onClearHistory={handleClearHistory}
              onLoadHistory={handleLoadHistory}
              receiptRef={receiptRef}
            />
          )}
        </div>
      </div>

      <FAQ
        title="FAQ Zakat"
        subtitle="Pelajari lebih lanjut tentang Nisab & Haul."
        data={ZAKAT_FAQ}
      />
    </div>
  );
};
