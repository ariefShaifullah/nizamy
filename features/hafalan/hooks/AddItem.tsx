
import React, { useState, useEffect, useMemo, useRef } from "react";
import type { HafalanState, HafalanItem } from "../../../types.ts";
import { SURAH_DATA } from "../../../constants.ts";
import { audioService } from "../../../services/audio.service.ts";
import {
  getAvailableSurahs,
  validateNewItem,
  getItemWeight,
  getMaxAyatByLevel,
  getDailyLoad,
  createNewItem,
  getLastMemorizedAyah,
} from "../logic/hafalan.service.ts";
import { useToast } from "../../../components/ui/Toast.tsx";
import { useDebounce } from "../../../hooks/useDebounce.ts";
import { FaArrowLeft, FaChevronRight, FaSearch, FaCheck } from "react-icons/fa";

interface AddItemProps {
  state: HafalanState;
  onBack: () => void;
  onAddItem: (item: HafalanItem) => string[]; // Returns badges
  onBadgeEarned: (badges: string[]) => void;
}

export const AddItem: React.FC<AddItemProps> = ({
  state,
  onBack,
  onAddItem,
  onBadgeEarned,
}) => {
  const { showToast } = useToast();
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [newAyahStart, setNewAyahStart] = useState(1);
  const [newAyahEnd, setNewAyahEnd] = useState(5);
  
  const [inputError, setInputError] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);
  const [bypassQuota, setBypassQuota] = useState(false);
  const [isSuggestionMode, setIsSuggestionMode] = useState(false);

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const availableSurahs = useMemo(() => getAvailableSurahs(profile.targetJuz), [profile.targetJuz]);
  const selectedSurahData = SURAH_DATA.find(s => s.number === selectedSurahNumber);

  const filteredSurahs = useMemo(() => {
      if (!debouncedSearchTerm) return availableSurahs;
      const lower = debouncedSearchTerm.toLowerCase();
      return availableSurahs.filter(s => 
          s.name.toLowerCase().includes(lower) || 
          s.number.toString().includes(lower)
      );
  }, [debouncedSearchTerm, availableSurahs]);

  useEffect(() => {
    setBypassQuota(false);

    const lastAddedItem = [...state.items].sort((a, b) => Number(b.id) - Number(a.id))[0];

    let suggestedSurahNo = 1;
    let suggestedStart = 1;
    let enableSuggestion = false;

    if (lastAddedItem) {
        const surahRef = SURAH_DATA.find(s => s.number === lastAddedItem.surahNo);
        
        if (surahRef) {
            if (lastAddedItem.endAyah < surahRef.verses) {
                suggestedSurahNo = lastAddedItem.surahNo;
                suggestedStart = lastAddedItem.endAyah + 1;
                enableSuggestion = true;
            } else {
                if (profile.targetJuz === 114) {
                    suggestedSurahNo = 1; 
                    suggestedStart = 1;
                    enableSuggestion = false;
                } else {
                    const nextSurahNum = lastAddedItem.surahNo === 114 ? 1 : lastAddedItem.surahNo + 1;
                    const available = getAvailableSurahs(profile.targetJuz);
                    const isNextAvailable = available.find(s => s.number === nextSurahNum);
                    
                    if (isNextAvailable) {
                        suggestedSurahNo = nextSurahNum;
                        suggestedStart = 1;
                        enableSuggestion = true;
                    } else {
                        suggestedSurahNo = available[0].number;
                        suggestedStart = 1;
                        enableSuggestion = false;
                    }
                }
            }
        }
    } else {
        const available = getAvailableSurahs(profile.targetJuz);
        suggestedSurahNo = available[0].number;
        suggestedStart = 1;
        enableSuggestion = false; 
    }

    setSelectedSurahNumber(suggestedSurahNo);
    setNewAyahStart(suggestedStart);
    setIsSuggestionMode(enableSuggestion);

    const surahData = SURAH_DATA.find(s => s.number === suggestedSurahNo);
    if (surahData) {
        const limit = getMaxAyatByLevel(profile.skillLevel);
        const used = getDailyLoad(state.items);
        const remaining = Math.max(0, limit - used);
        const suggestedCount = remaining > 0 ? remaining : 3; 
        const suggestedEnd = Math.min(suggestedStart + suggestedCount - 1, surahData.verses);
        setNewAyahEnd(suggestedEnd);
    }

  }, []);

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
      showToast(validation.message, 'error');
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

    showToast("Hafalan Baru Disimpan!", "success");
  };

  const handleSelectSurah = (surahNum: number) => {
      setSelectedSurahNumber(surahNum);
      setIsSuggestionMode(false);
      setIsSelectorOpen(false);
      setSearchTerm(""); 
      
      const lastAyah = getLastMemorizedAyah(state.items, surahNum);
      const nextStart = lastAyah + 1;
      const surahRef = SURAH_DATA.find(s => s.number === surahNum);
      
      if (surahRef) {
          if (nextStart <= surahRef.verses) {
              setNewAyahStart(nextStart);
              const limit = getMaxAyatByLevel(profile.skillLevel);
              const remaining = Math.max(0, limit - dailyUsed);
              const count = remaining > 0 ? remaining : 3;
              setNewAyahEnd(Math.min(nextStart + count - 1, surahRef.verses));
          } else {
             setNewAyahStart(1);
             setNewAyahEnd(3);
          }
      }
  };

  return (
    <>
    <div className="max-w-lg mx-auto bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 animate-fade-in-up mt-4 relative z-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Tambah Hafalan</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mode:{" "}
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
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
          className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 icon-wrapper w-9 h-9 flex items-center justify-center"
        >
          <FaArrowLeft />
        </button>
      </div>

      {hasPending ? (
        <div className="text-center py-8 px-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
          <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🚧
          </div>
          <h4 className="text-lg font-bold text-orange-900 dark:text-orange-200 mb-2">
            Tugas Numpuk Nih!
          </h4>
          <p className="text-orange-800/80 dark:text-orange-200/70 text-sm mb-6 leading-relaxed">
            Masih ada {pendingNewItems.length} hafalan baru yang belum
            dimurajaah. Kelarin dulu yuk biar hafalan makin kuat.
          </p>
          <button
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200 dark:shadow-none"
          >
            Ke Jadwal Murajaah
          </button>
        </div>
      ) : isQuotaFull && !quotaWarning && !bypassQuota ? (
        <div className="text-center py-8 px-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
          <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
            🛑
          </div>
          <h4 className="text-lg font-bold text-indigo-900 dark:text-indigo-200 mb-2">
            Kuota Harian Penuh
          </h4>
          <p className="text-indigo-800/80 dark:text-indigo-200/70 text-sm mb-6 leading-relaxed">
            {isMaxLevel
              ? `Kamu udah nyampe batas rekomendasi (${dailyLimit} poin sehari). Istirahatin pikiran dulu ya biar hafalan hari ini nempel sempurna.`
              : `Kamu udah nyampe batas ${dailyLimit} poin hari ini. Yakin mau nambah lagi?`}
          </p>

          <button
            onClick={() => {
              audioService.playClick();
              setBypassQuota(true);
            }}
            className="mt-4 text-sm font-bold text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 hover:underline block w-full"
          >
            Tetap Lanjut (Override)
          </button>

          <button
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
            className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 block w-full"
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
                    ? "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                    : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-300"
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
                    ? "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-300"
                    : "bg-slate-50 dark:bg-slate-700/50 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
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
          
          {isSuggestionMode && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white shadow-md flex items-start animate-fade-in">
                  <span className="text-2xl mr-3">🚀</span>
                  <div>
                      <h4 className="font-bold text-sm">
                        {profile.targetJuz === 1 ? "Lanjut Rutin (Urut)" : "Lanjut Hafalan Terakhir"}
                      </h4>
                      <p className="text-xs opacity-90 mt-1 leading-relaxed">
                          Otomatis lanjut dari ayat terakhir. Jaga momentum biar hafalan tetap nyambung!
                      </p>
                  </div>
              </div>
          )}

          <div>
            <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
              Pilih Surat
            </label>
            <button
                onClick={() => {
                    audioService.playClick();
                    setIsSelectorOpen(true);
                }}
                className="w-full flex justify-between items-center border border-slate-200 dark:border-slate-600 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 font-medium text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 transition-all text-left group"
            >
                <span className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold mr-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        {selectedSurahData?.number}
                    </span>
                    <span className="text-lg">{selectedSurahData?.name}</span>
                </span>
                <span className="icon-wrapper w-5 h-5 text-slate-400"><FaChevronRight /></span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                Dari Ayat
              </label>
              <input
                type="number"
                className={`w-full border rounded-xl p-4 font-bold text-center outline-none focus:ring-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                  inputError && inputError.includes("Ayat awal")
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900"
                }`}
                value={newAyahStart}
                onChange={(e) => {
                    setNewAyahStart(Number(e.target.value));
                    setIsSuggestionMode(false);
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700 dark:text-slate-300">
                Sampai Ayat
              </label>
              <input
                type="number"
                className={`w-full border rounded-xl p-4 font-bold text-center outline-none focus:ring-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ${
                  inputError && !inputError.includes("Ayat awal")
                    ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 focus:ring-red-200"
                    : "border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900"
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
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-xs font-bold p-3 rounded-lg text-center animate-pulse">
              {inputError}
            </div>
          )}

          {quotaWarning && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm p-4 rounded-xl text-center space-y-3">
              <p className="font-medium leading-relaxed">{quotaWarning}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setQuotaWarning(null)}
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-bold hover:bg-amber-50 dark:hover:bg-slate-700"
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
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-indigo-200 dark:shadow-none transform active:scale-95 mt-4"
            >
              {isSuggestionMode ? 'Simpan Lanjutan Hafalan' : 'Simpan Hafalan'}
            </button>
          )}
        </div>
      )}
    </div>

    {isSelectorOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 w-full md:max-w-md h-[85vh] md:h-[600px] rounded-t-3xl md:rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-fade-in-up border border-slate-200 dark:border-slate-700">
                
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 z-10 flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white ml-2">Pilih Surat</h3>
                    <button 
                        onClick={() => setIsSelectorOpen(false)}
                        className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 icon-wrapper w-9 h-9 flex items-center justify-center"
                    >
                        <FaArrowLeft />
                    </button>
                </div>

                <div className="p-4 pb-2 bg-white dark:bg-slate-800">
                    <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-400 icon-wrapper w-5 h-5">
                            <FaSearch />
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari nama surat..."
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar bg-white dark:bg-slate-800">
                    {filteredSurahs.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            Surat tidak ditemukan.
                        </div>
                    ) : (
                        filteredSurahs.map((s) => (
                            <button
                                key={s.number}
                                onClick={() => handleSelectSurah(s.number)}
                                className={`w-full flex items-center p-3 rounded-xl mb-1 transition-all ${
                                    selectedSurahNumber === s.number 
                                    ? "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800" 
                                    : "hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-transparent"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mr-4 ${
                                    selectedSurahNumber === s.number
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300"
                                }`}>
                                    {s.number}
                                </div>
                                <div className="flex-1 text-left">
                                    <h4 className={`font-bold text-base ${selectedSurahNumber === s.number ? "text-indigo-700 dark:text-indigo-300" : "text-slate-800 dark:text-white"}`}>
                                        {s.name}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        {s.verses} Ayat
                                    </p>
                                </div>
                                {selectedSurahNumber === s.number && (
                                    <span className="icon-wrapper w-5 h-5 text-indigo-600 dark:text-indigo-400"><FaCheck /></span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    )}
    </>
  );
};