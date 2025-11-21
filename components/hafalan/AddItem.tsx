import React, { useState, useEffect } from "react";
import type { HafalanState, HafalanItem } from "../../types.ts";
import { SURAH_DATA } from "../../constants.ts";
import { audioService } from "../../services/audio.service.ts";
import {
  getAvailableSurahs,
  validateNewItem,
  getItemWeight,
  getMaxAyatByLevel,
  getDailyLoad,
  createNewItem,
  getLastMemorizedAyah,
} from "../../services/hafalan.service.ts";

interface AddItemProps {
  state: HafalanState;
  onBack: () => void;
  onAddItem: (item: HafalanItem) => string[]; // Returns badges
  onSuccess: (msg: string) => void;
  onBadgeEarned: (badges: string[]) => void;
}

export const AddItem: React.FC<AddItemProps> = ({
  state,
  onBack,
  onAddItem,
  onSuccess,
  onBadgeEarned,
}) => {
  // State for form
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [newAyahStart, setNewAyahStart] = useState(1);
  const [newAyahEnd, setNewAyahEnd] = useState(5);

  // State for UI Logic
  const [inputError, setInputError] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);
  const [bypassQuota, setBypassQuota] = useState(false);
  const [isSuggestionMode, setIsSuggestionMode] = useState(false); // Tracks if we are showing a smart suggestion

  const profile = state.profile!;
  const dailyLimit = getMaxAyatByLevel(profile.skillLevel);
  const dailyUsed = getDailyLoad(state.items);
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
  const pendingNewItems = state.items.filter((i) => i.stage === 0);
  const hasPending = pendingNewItems.length > 0;
  const isQuotaFull = dailyRemaining === 0;
  const isMaxLevel = profile.skillLevel === "advanced";

  const currentSelectionLoad = getItemWeight(
    selectedSurahNumber,
    newAyahStart,
    newAyahEnd
  );
  const isSelectionOverQuota = currentSelectionLoad > dailyRemaining;

  // --- SMART SUGGESTION LOGIC (ON MOUNT) ---
  useEffect(() => {
    setBypassQuota(false);

    // 1. Find the most recently ADDED item (by ID/Timestamp)
    // Assuming items are appended, the last one in array is usually latest,
    // but to be safe we sort by ID (timestamp) descending.
    const lastAddedItem = [...state.items].sort(
      (a, b) => Number(b.id) - Number(a.id)
    )[0];

    let suggestedSurahNo = 1;
    let suggestedStart = 1;

    if (lastAddedItem) {
      const surahRef = SURAH_DATA.find(
        (s) => s.number === lastAddedItem.surahNo
      );

      if (surahRef) {
        if (lastAddedItem.endAyah < surahRef.verses) {
          // Case A: Continue current Surah
          suggestedSurahNo = lastAddedItem.surahNo;
          suggestedStart = lastAddedItem.endAyah + 1;
          setIsSuggestionMode(true);
        } else {
          // Case B: Current Surah Finished, Suggest Next Surah
          // Logic: If finished Surah 78, suggest 79. If 114, suggest 1.
          const nextSurahNum =
            lastAddedItem.surahNo === 114 ? 1 : lastAddedItem.surahNo + 1;

          // Check if next surah is within user's target Juz scope
          const available = getAvailableSurahs(profile.targetJuz);
          const isNextAvailable = available.find(
            (s) => s.number === nextSurahNum
          );

          if (isNextAvailable) {
            suggestedSurahNo = nextSurahNum;
            suggestedStart = 1;
            setIsSuggestionMode(true);
          } else {
            // Fallback to default available logic if next surah is out of scope
            suggestedSurahNo = available[0].number;
            suggestedStart = 1;
          }
        }
      }
    } else {
      // New user, default to first available in target
      const available = getAvailableSurahs(profile.targetJuz);
      suggestedSurahNo = available[0].number;
      suggestedStart = 1;
    }

    // Apply Suggestion
    setSelectedSurahNumber(suggestedSurahNo);
    setNewAyahStart(suggestedStart);

    // Calculate Suggested End based on Quota
    const surahData = SURAH_DATA.find((s) => s.number === suggestedSurahNo);
    if (surahData) {
      const limit = getMaxAyatByLevel(profile.skillLevel);
      const used = getDailyLoad(state.items);
      const remaining = Math.max(0, limit - used);
      // Default to at least 3 verses if quota is full/tight to encourage progress
      const suggestedCount = remaining > 0 ? remaining : 3;
      const suggestedEnd = Math.min(
        suggestedStart + suggestedCount - 1,
        surahData.verses
      );
      setNewAyahEnd(suggestedEnd);
    }
  }, []); // Run ONCE on mount

  // --- VALIDATION EFFECT ---
  useEffect(() => {
    setQuotaWarning(null);
    const surah = SURAH_DATA.find((s) => s.number === selectedSurahNumber);
    if (!surah) return;

    const validation = validateNewItem(
      state.items,
      selectedSurahNumber,
      newAyahStart,
      newAyahEnd,
      surah.verses,
      profile.skillLevel
    );

    if (validation.status === "error") {
      setInputError(validation.message);
    } else {
      setInputError(null);
    }
  }, [newAyahStart, newAyahEnd, selectedSurahNumber, state.items, profile]);

  const handleAddItem = (force: boolean = false) => {
    if (inputError) return;
    const surah = SURAH_DATA.find((s) => s.number === selectedSurahNumber);
    if (!surah) return;

    const validation = validateNewItem(
      state.items,
      selectedSurahNumber,
      newAyahStart,
      newAyahEnd,
      surah.verses,
      profile.skillLevel
    );

    if (validation.status === "error") {
      audioService.playFail();
      alert(validation.message);
      return;
    }

    if (validation.status === "warning" && !force) {
      audioService.playFail();
      setQuotaWarning(validation.message);
      return;
    }

    const badges = onAddItem(
      createNewItem(surah.name, surah.number, newAyahStart, newAyahEnd)
    );

    if (badges && badges.length > 0) {
      onBadgeEarned(badges);
    } else {
      audioService.playSuccess();
    }

    onSuccess("Hafalan Baru Disimpan!");
  };

  // Reset suggestion banner if user changes Surah manually
  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSurahNumber(Number(e.target.value));
    setIsSuggestionMode(false); // Remove the "suggestion" badge if they deviate

    // Auto-set start ayah to 1 or last memorized + 1 for the NEWLY selected surah
    const newSurahNum = Number(e.target.value);
    const lastAyah = getLastMemorizedAyah(state.items, newSurahNum);
    const nextStart = lastAyah + 1;
    const surahRef = SURAH_DATA.find((s) => s.number === newSurahNum);

    if (surahRef) {
      if (nextStart <= surahRef.verses) {
        setNewAyahStart(nextStart);
        const limit = getMaxAyatByLevel(profile.skillLevel);
        const remaining = Math.max(0, limit - dailyUsed);
        const count = remaining > 0 ? remaining : 3;
        setNewAyahEnd(Math.min(nextStart + count - 1, surahRef.verses));
      } else {
        setNewAyahStart(1); // Reset if surah full (though overlap check will catch it)
        setNewAyahEnd(3);
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fade-in-up mt-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800">Tambah Hafalan</h3>
          <p className="text-sm text-slate-500 mt-1">
            Mode:{" "}
            <span className="font-bold text-indigo-600">
              {profile.skillLevel === "beginner"
                ? "Santai"
                : profile.skillLevel === "intermediate"
                ? "Sedang"
                : "Fokus"}
            </span>
            <span className="mx-1">•</span>
            Target: {dailyLimit} Poin/Hari
          </p>
        </div>
        <button
          onClick={() => {
            audioService.playClick();
            onBack();
          }}
          className="bg-slate-100 p-2 rounded-full text-slate-500 hover:bg-slate-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {hasPending ? (
        <div className="text-center py-8 px-4 bg-orange-50 rounded-2xl border border-orange-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🚧
          </div>
          <h4 className="text-lg font-bold text-orange-900 mb-2">
            Tugas Numpuk Nih!
          </h4>
          <p className="text-orange-800/80 text-sm mb-6 leading-relaxed">
            Masih ada {pendingNewItems.length} hafalan baru yang belum
            dimurajaah. Kelarin dulu yuk biar hafalan makin kuat.
          </p>
          <button
            onClick={() => {
              audioService.playClick();
              onBack(); // Goes back to dashboard
            }}
            className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
          >
            Ke Jadwal Murajaah
          </button>
        </div>
      ) : isQuotaFull && !quotaWarning && !bypassQuota ? (
        <div className="text-center py-8 px-4 bg-indigo-50 rounded-2xl border border-indigo-100">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🛑
          </div>
          <h4 className="text-lg font-bold text-indigo-900 mb-2">
            Kuota Harian Penuh
          </h4>
          <p className="text-indigo-800/80 text-sm mb-6 leading-relaxed">
            {isMaxLevel
              ? `Kamu udah nyampe batas rekomendasi (${dailyLimit} poin sehari). Istirahatin pikiran dulu ya biar hafalan hari ini nempel sempurna.`
              : `Kamu udah nyampe batas ${dailyLimit} poin hari ini. Yakin mau nambah lagi?`}
          </p>

          <button
            onClick={() => {
              audioService.playClick();
              setBypassQuota(true);
            }}
            className="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-700 underline block w-full"
          >
            Tetap Lanjut (Override)
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="mt-3 text-sm font-bold text-slate-500 hover:text-slate-700 block w-full"
          >
            Balik ke Dashboard
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {!hasPending && (
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`text-center p-3 rounded-xl border ${
                  dailyRemaining > 0
                    ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                    : "bg-red-50 border-red-100 text-red-700"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide">
                  Sisa Kuota
                </p>
                <p className="text-xl font-extrabold">
                  {dailyRemaining}{" "}
                  <span className="text-sm font-medium opacity-70">Poin</span>
                </p>
              </div>
              <div
                className={`text-center p-3 rounded-xl border ${
                  isSelectionOverQuota
                    ? "bg-amber-50 border-amber-100 text-amber-700"
                    : "bg-slate-50 border-slate-100 text-slate-600"
                }`}
              >
                <p className="text-xs font-bold uppercase tracking-wide">
                  Beban Pilihan
                </p>
                <p className="text-xl font-extrabold">
                  {currentSelectionLoad}{" "}
                  <span className="text-sm font-medium opacity-70">Poin</span>
                </p>
              </div>
            </div>
          )}

          {/* SMART SUGGESTION BANNER */}
          {isSuggestionMode && (
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-md flex items-start animate-fade-in">
              <span className="text-2xl mr-3">🚀</span>
              <div>
                <h4 className="font-bold text-sm">Lanjut Hafalan Terakhir</h4>
                <p className="text-xs opacity-90 mt-1 leading-relaxed">
                  Sistem otomatis menyarankan kelanjutan dari hafalan
                  sebelumnya. Gas terus!
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start text-xs text-blue-800">
            <span className="mr-2 text-lg">💡</span>
            <p className="mt-0.5">
              <strong>Sistem Poin:</strong> 1 Ayat Pendek = 1 Poin. Ayat yang
              panjang banget (misal Al-Baqarah 282) punya poin lebih gede karena
              emang lebih berat ngafalnya.
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700">
              Pilih Surat
            </label>
            <select
              className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none appearance-none"
              value={selectedSurahNumber}
              onChange={handleSurahChange}
            >
              {getAvailableSurahs(profile.targetJuz).map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">
                Dari Ayat
              </label>
              <input
                type="number"
                className={`w-full border rounded-xl p-4 font-bold text-center outline-none focus:ring-2 ${
                  inputError && inputError.includes("Ayat awal")
                    ? "border-red-300 bg-red-50 text-red-900 focus:ring-red-200"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
                value={newAyahStart}
                onChange={(e) => {
                  setNewAyahStart(Number(e.target.value));
                  setIsSuggestionMode(false);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">
                Sampai Ayat
              </label>
              <input
                type="number"
                className={`w-full border rounded-xl p-4 font-bold text-center outline-none focus:ring-2 ${
                  inputError && !inputError.includes("Ayat awal")
                    ? "border-red-300 bg-red-50 text-red-900 focus:ring-red-200"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
                }`}
                value={newAyahEnd}
                onChange={(e) => {
                  setNewAyahEnd(Number(e.target.value));
                  setIsSuggestionMode(false);
                }}
              />
            </div>
          </div>

          {inputError && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg text-center animate-pulse">
              {inputError}
            </div>
          )}

          {quotaWarning && (
            <div className="bg-amber-50 border border-amber-100 text-amber-800 text-sm p-4 rounded-xl text-center space-y-3">
              <p className="font-medium leading-relaxed">{quotaWarning}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setQuotaWarning(null)}
                  className="px-4 py-2 bg-white border border-amber-200 text-amber-700 rounded-lg text-xs font-bold hover:bg-amber-50"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleAddItem(true)}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600 shadow-sm"
                >
                  Tetap Simpan
                </button>
              </div>
            </div>
          )}

          {!quotaWarning && (
            <button
              onClick={() => handleAddItem(false)}
              disabled={
                !!inputError ||
                (isQuotaFull && dailyRemaining === 0 && !bypassQuota)
              }
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 transform active:scale-95 mt-4"
            >
              {isSuggestionMode ? "Simpan Lanjutan Hafalan" : "Simpan Hafalan"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
