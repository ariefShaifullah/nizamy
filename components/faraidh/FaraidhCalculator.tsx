import React, { useState, useReducer, useCallback } from "react";
import { HeirsForm } from "./HeirsForm.tsx";
import { ResultsDisplay } from "./ResultsDisplay.tsx";
import { HistoryPanel } from "./HistoryPanel.tsx";
import { FAQ } from "../FAQ.tsx";
import { calculateFaraidh } from "../../services/faraidh.service.ts";
import type { CalculationResult, HistoryEntry } from "../../types.ts";
import { initialHeirsState, FARAIDH_FAQ } from "../../constants.ts";
import { heirsReducer } from "../../reducers/heirsReducer.ts";
import { useLocalStorage } from "../../hooks/useLocalStorage.ts";
import { useToast } from "../ui/Toast.tsx";
import { useConfirm } from "../ui/ConfirmContext.tsx";

type FaraidhTab = "input" | "result" | "history";

const FaraidhCalculator: React.FC = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [heirs, dispatch] = useReducer(heirsReducer, initialHeirsState);
  const [estate, setEstate] = useState<string>("100000000");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom Hook for persistence (DRY)
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>(
    "faraidhHistory",
    []
  );

  // Mobile Tab State
  const [activeTab, setActiveTab] = useState<FaraidhTab>("input");

  const handleCalculate = useCallback(() => {
    const estateValue = parseFloat(estate);
    if (isNaN(estateValue) || estateValue <= 0) {
      showToast("Mohon masukkan nilai harta yang valid.", "error");
      return;
    }
    setLoading(true);

    setTimeout(() => {
      try {
        const calculationResult = calculateFaraidh(heirs, estateValue);
        setResult(calculationResult);

        const newHistoryEntry: HistoryEntry = {
          id: new Date().toISOString(),
          timestamp: new Date().toLocaleString("id-ID"),
          estate: estateValue,
          heirs,
          result: calculationResult,
        };

        // Functional update for history to ensure we have latest state
        setHistory((prevHistory) =>
          [newHistoryEntry, ...prevHistory].slice(0, 10)
        );

        showToast("Perhitungan selesai!", "success");

        // Auto-switch to results on mobile
        if (window.innerWidth < 1024) {
          setActiveTab("result");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (error) {
        console.error("Calculation failed:", error);
        showToast("Terjadi kesalahan dalam perhitungan.", "error");
      } finally {
        setLoading(false);
      }
    }, 300); // Slight delay for UX feeling
  }, [estate, heirs, setHistory, showToast]);

  const loadFromHistory = useCallback(
    (entry: HistoryEntry) => {
      setEstate(String(entry.estate));
      dispatch({ type: "LOAD_STATE", payload: entry.heirs });
      setResult(entry.result);

      if (window.innerWidth < 1024) {
        setActiveTab("result");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      showToast("Data riwayat dimuat", "info");
    },
    [showToast]
  );

  const clearHistory = useCallback(async () => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat",
      message: "Apakah Anda yakin ingin menghapus semua riwayat perhitungan?",
      confirmText: "Ya, Hapus",
      variant: "danger",
    });

    if (isConfirmed) {
      setHistory([]);
      showToast("Riwayat dihapus", "info");
    }
  }, [setHistory, confirm, showToast]);

  const switchTab = (tab: FaraidhTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 lg:pb-0 animate-fade-in">
      {/* Header - Hidden on Mobile */}
      <div className="hidden lg:block text-center mb-8 lg:mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Kalkulator Waris Islam
        </h1>
        <p className="mt-3 md:mt-4 max-w-2xl mx-auto text-base md:text-lg text-slate-600 dark:text-slate-400 px-4">
          Hitung pembagian harta waris (faraidh) secara akurat dan transparan
          sesuai Al-Qur'an dan Sunnah.
        </p>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-4 lg:mt-0">
        {/* Column 1: Input Form & History (Desktop) */}
        <div
          className={`lg:col-span-1 ${
            activeTab === "input" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="lg:sticky top-24 space-y-6">
            <HeirsForm
              heirs={heirs}
              dispatch={dispatch}
              estate={estate}
              setEstate={setEstate}
              onCalculate={handleCalculate}
              loading={loading}
            />
            {/* Desktop History shown below form */}
            <div className="hidden lg:block">
              <HistoryPanel
                history={history}
                onLoad={loadFromHistory}
                onClear={clearHistory}
              />
            </div>
          </div>
        </div>

        {/* Column 2: Results (Desktop & Mobile Tab) */}
        <div
          className={`lg:col-span-2 ${
            activeTab === "result" ? "block" : "hidden lg:block"
          }`}
        >
          <ResultsDisplay result={result} />
        </div>

        {/* Mobile Only: History Tab */}
        <div
          className={`lg:hidden ${
            activeTab === "history" ? "block" : "hidden"
          }`}
        >
          <HistoryPanel
            history={history}
            onLoad={loadFromHistory}
            onClear={clearHistory}
          />
          {history.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 italic">
              Belum ada riwayat perhitungan.
            </div>
          )}
        </div>
      </div>

      {/* FAQ Section (Visible ONLY on Desktop) */}
      <div className="hidden lg:block">
        <FAQ
          title="Pertanyaan Umum (FAQ) Waris"
          subtitle="Temukan jawaban atas pertanyaan umum seputar hukum Faraidh dan cara pembagiannya."
          data={FARAIDH_FAQ}
        />
      </div>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe px-6 py-2 z-50 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => switchTab("input")}
          className={`flex flex-col items-center p-2 rounded-xl transition-all flex-1 ${
            activeTab === "input"
              ? "text-primary-600 dark:text-primary-400 bg-blue-50 dark:bg-primary-900/20"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase">Data</span>
        </button>

        <button
          onClick={() => switchTab("result")}
          className={`flex flex-col items-center p-2 rounded-xl transition-all flex-1 ${
            activeTab === "result"
              ? "text-primary-600 dark:text-primary-400 bg-blue-50 dark:bg-primary-900/20"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mb-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
            {result && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            )}
          </div>
          <span className="text-[10px] font-bold uppercase">Hasil</span>
        </button>

        <button
          onClick={() => switchTab("history")}
          className={`flex flex-col items-center p-2 rounded-xl transition-all flex-1 ${
            activeTab === "history"
              ? "text-primary-600 dark:text-primary-400 bg-blue-50 dark:bg-primary-900/20"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 mb-1"
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
          <span className="text-[10px] font-bold uppercase">Riwayat</span>
        </button>
      </div>
    </div>
  );
};

export default FaraidhCalculator;
