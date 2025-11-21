import React, { useState, useEffect, useReducer, useCallback } from "react";
import { HeirsForm } from "./HeirsForm.tsx";
import { ResultsDisplay } from "./ResultsDisplay.tsx";
import { HistoryPanel } from "./HistoryPanel.tsx";
import { FAQ } from "../FAQ.tsx";
import { calculateFaraidh } from "../../services/faraidh.service.ts";
import type { CalculationResult, HistoryEntry } from "../../types.ts";
import { initialHeirsState, FARAIDH_FAQ } from "../../constants.ts";
import { heirsReducer } from "../../reducers/heirsReducer.ts";

export const FaraidhCalculator: React.FC = () => {
  const [heirs, dispatch] = useReducer(heirsReducer, initialHeirsState);
  const [estate, setEstate] = useState<string>("100000000");
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("faraidhHistory");
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error("Failed to parse history from localStorage", error);
      localStorage.removeItem("faraidhHistory");
    }
  }, []);

  const handleCalculate = useCallback(() => {
    const estateValue = parseFloat(estate);
    if (isNaN(estateValue) || estateValue <= 0) {
      alert("Mohon masukkan nilai harta yang valid.");
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

        const updatedHistory = [newHistoryEntry, ...history].slice(0, 10);
        setHistory(updatedHistory);
        localStorage.setItem("faraidhHistory", JSON.stringify(updatedHistory));
      } catch (error) {
        console.error("Calculation failed:", error);
        alert("Terjadi kesalahan dalam perhitungan. Mohon periksa input Anda.");
      } finally {
        setLoading(false);
      }
    }, 50);
  }, [estate, heirs, history]);

  const loadFromHistory = useCallback((entry: HistoryEntry) => {
    setEstate(String(entry.estate));
    dispatch({ type: "LOAD_STATE", payload: entry.heirs });
    setResult(entry.result);
  }, []);

  const clearHistory = useCallback(() => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin menghapus semua riwayat perhitungan?"
      )
    ) {
      setHistory([]);
      localStorage.removeItem("faraidhHistory");
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Kalkulator Waris Islam
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
          Hitung pembagian harta waris (faraidh) secara akurat dan transparan
          sesuai Al-Qur'an dan Sunnah.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <div className="lg:sticky top-24 space-y-6">
            <HeirsForm
              heirs={heirs}
              dispatch={dispatch}
              estate={estate}
              setEstate={setEstate}
              onCalculate={handleCalculate}
              loading={loading}
            />
            <HistoryPanel
              history={history}
              onLoad={loadFromHistory}
              onClear={clearHistory}
            />
          </div>
        </div>
        <div className="lg:col-span-2">
          <ResultsDisplay result={result} />
        </div>
      </div>
      <FAQ
        title="Pertanyaan Umum (FAQ) Waris"
        subtitle="Temukan jawaban atas pertanyaan umum seputar hukum Faraidh dan cara pembagiannya."
        data={FARAIDH_FAQ}
      />
    </div>
  );
};
