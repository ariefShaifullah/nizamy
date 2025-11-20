import React, { useState, useEffect } from "react";
import { BADGES, SURAH_DATA, HAFALAN_FAQ } from "../constants.ts";
import { FAQ } from "./FAQ.tsx";
import {
  HafalanTutorialModal,
  HafalanDetailModal,
  HafalanSettingsModal,
} from "./HafalanModals.tsx";
import { useHafalan } from "../hooks/useHafalan.ts";
import { exportHafalanToPdf } from "../services/pdf.service.ts";
import {
  getMotivationalQuote,
  createNewItem,
  getAvailableSurahs,
  getMaxAyatByLevel,
  validateNewItem,
  fetchQuranVerses,
  getLastMemorizedAyah,
  getDailyLoad,
  getItemWeight,
  SRS_INTERVALS,
  getLocalYYYYMMDD,
} from "../services/hafalan.service.ts";
import { formatDate } from "../utils.ts";

export const HafalanTracker: React.FC = () => {
  const {
    state,
    usersList,
    view,
    loading,
    activeSessionItem,
    isPracticeMode,
    actions,
  } = useHafalan();

  // Local UI State
  const [dashboardTab, setDashboardTab] = useState<"schedule" | "list">(
    "schedule"
  );
  const [quranText, setQuranText] = useState<
    { text: string; number: number }[]
  >([]);
  const [isLoadingText, setIsLoadingText] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(
    null
  );
  const [bypassQuota, setBypassQuota] = useState(false);

  // Form State
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [newAyahStart, setNewAyahStart] = useState(1);
  const [newAyahEnd, setNewAyahEnd] = useState(5);
  const [inputError, setInputError] = useState<string | null>(null);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  // Onboard Form
  const [onboardName, setOnboardName] = useState("");
  const [onboardLevel, setOnboardLevel] = useState<
    "beginner" | "intermediate" | "advanced"
  >("beginner");
  const [onboardTarget, setOnboardTarget] = useState(30);

  // --- EFFECTS ---

  // Tutorial Trigger Logic
  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(
      "nizamy_hafalan_tutorial_seen"
    );

    // Show ONLY if: On Dashboard, fresh user (no items), and hasn't seen tutorial flag
    if (
      view === "dashboard" &&
      state.items.length === 0 &&
      !showTutorial &&
      !hasSeenTutorial
    ) {
      setShowTutorial(true);
    }
  }, [view, state.items.length]);

  // Auto-set Form Data (Continuity Logic)
  useEffect(() => {
    if (view === "add_new" && state.profile) {
      // Reset bypass state when entering form
      setBypassQuota(false);

      // Ensure selectedSurahNumber is valid for the current target
      const availableSurahs = getAvailableSurahs(state.profile.targetJuz);
      let currentSurahNum = selectedSurahNumber;

      if (!availableSurahs.find((s) => s.number === currentSurahNum)) {
        currentSurahNum = availableSurahs[0].number;
        setSelectedSurahNumber(currentSurahNum);
      }

      const lastAyah = getLastMemorizedAyah(state.items, currentSurahNum);
      const nextStart = lastAyah + 1;
      const surah = SURAH_DATA.find((s) => s.number === currentSurahNum);

      if (surah && nextStart > surah.verses) {
        setNewAyahStart(surah.verses);
      } else {
        setNewAyahStart(nextStart);
      }

      if (surah) {
        const limit = getMaxAyatByLevel(state.profile.skillLevel);
        const dailyUsed = getDailyLoad(state.items);
        const dailyRemaining = Math.max(0, limit - dailyUsed);

        const suggestedCount = dailyRemaining > 0 ? dailyRemaining : 1;
        const suggestedEnd = Math.min(
          nextStart + suggestedCount - 1,
          surah.verses
        );

        setNewAyahEnd(suggestedEnd);
      }
    }
  }, [selectedSurahNumber, view, state.items, state.profile]);

  // Validation Effect (REAL TIME FEEDBACK)
  useEffect(() => {
    if (view === "add_new" && state.profile) {
      setQuotaWarning(null); // Reset warning on change
      const surah = SURAH_DATA.find((s) => s.number === selectedSurahNumber);
      if (!surah) return;

      const validation = validateNewItem(
        state.items,
        selectedSurahNumber,
        newAyahStart,
        newAyahEnd,
        surah.verses,
        state.profile.skillLevel
      );

      if (validation.status === "error") {
        setInputError(validation.message);
      } else {
        setInputError(null);
      }
    }
  }, [
    newAyahStart,
    newAyahEnd,
    selectedSurahNumber,
    state.profile,
    view,
    state.items,
  ]);

  // Fetch Quran Text
  useEffect(() => {
    if (view === "review_session" && activeSessionItem) {
      setIsLoadingText(true);
      fetchQuranVerses(
        activeSessionItem.surahNo,
        activeSessionItem.startAyah,
        activeSessionItem.endAyah
      )
        .then((data) => {
          setQuranText(data);
          setIsLoadingText(false);
        })
        .catch(() => setIsLoadingText(false));
    } else {
      setQuranText([]);
    }
  }, [view, activeSessionItem]);

  // --- HANDLERS ---

  const handleCloseTutorial = () => {
    localStorage.setItem("nizamy_hafalan_tutorial_seen", "true");
    setShowTutorial(false);
  };

  const handleCreateUser = () => {
    if (!onboardName.trim()) return alert("Nama wajib diisi");
    actions.createUser(onboardName, onboardLevel, onboardTarget);
    if (onboardTarget === 30) setSelectedSurahNumber(78);

    const hasSeenTutorial = localStorage.getItem(
      "nizamy_hafalan_tutorial_seen"
    );
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }

    setOnboardName("");
  };

  const handleAddItem = (force: boolean = false) => {
    if (!state.profile || inputError) return;
    const surah = SURAH_DATA.find((s) => s.number === selectedSurahNumber);
    if (!surah) return;

    const validation = validateNewItem(
      state.items,
      selectedSurahNumber,
      newAyahStart,
      newAyahEnd,
      surah.verses,
      state.profile.skillLevel
    );

    if (validation.status === "error") {
      alert(validation.message);
      return;
    }

    // If it's a warning and not forced, show UI warning
    if (validation.status === "warning" && !force) {
      setQuotaWarning(validation.message);
      return;
    }

    actions.addItem(
      createNewItem(surah.name, surah.number, newAyahStart, newAyahEnd)
    );
    setDashboardTab("list");
    setQuotaWarning(null);
    setBypassQuota(false);
  };

  const handleSubmitReview = (result: "success" | "fail") => {
    const res = actions.submitReview(result);
    if (res?.badgesEarned.length) {
      const badgeNames = res.badgesEarned
        .map((id) => BADGES.find((b) => b.id === id)?.name)
        .join(", ");
      alert(`Selamat! Kamu dapet badge baru: ${badgeNames}`);
    }
  };

  if (loading)
    return (
      <div className="text-center py-12 text-indigo-600">Memuat data...</div>
    );

  // --- VIEW RENDERERS ---

  if (view === "user_selection") {
    return (
      <div className="max-w-4xl mx-auto px-4 animate-fade-in py-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Siapa nih yang mau ngafal?
          </h2>
          <p className="text-slate-500">
            Pilih profil kamu buat lanjut murajaah.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          {usersList.map((user) => (
            <div key={user.id} className="relative group">
              <button
                onClick={() => actions.selectUser(user.id)}
                className="flex flex-col items-center space-y-4 p-8 bg-white rounded-3xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-48 border border-slate-100"
              >
                <div
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-md ring-4 ring-white ${user.avatarColor}`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800 text-lg truncate w-full px-2">
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-400">Level {user.level}</p>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Hapus ${user.name}?`))
                    actions.deleteUser(user.id);
                }}
                className="absolute top-3 right-3 bg-red-50 text-red-400 p-2 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            onClick={() => actions.setView("create_user")}
            className="flex flex-col items-center space-y-4 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 transition-all w-48 justify-center group"
          >
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl text-slate-400 border-2 border-dashed border-slate-300 bg-white group-hover:text-indigo-400 transition-colors">
              +
            </div>
            <div className="text-center">
              <h3 className="font-bold text-slate-500 group-hover:text-indigo-500">
                Tambah User
              </h3>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === "create_user") {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-fade-in-up mt-8">
        <div className="flex items-center mb-8">
          {usersList.length > 0 && (
            <button
              onClick={() => actions.setView("user_selection")}
              className="mr-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-900">
            Buat Profil Baru
          </h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Nama Panggilan
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              value={onboardName}
              onChange={(e) => setOnboardName(e.target.value)}
              placeholder="Contoh: Abdullah"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Beban Harian (Kecepatan)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["beginner", "intermediate", "advanced"] as const).map(
                (lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setOnboardLevel(lvl)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      onboardLevel === lvl
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200"
                        : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    <span className="capitalize font-bold text-sm md:text-base">
                      {lvl === "beginner"
                        ? "Santai"
                        : lvl === "intermediate"
                        ? "Sedang"
                        : "Fokus"}
                    </span>
                    <span className="text-[10px] md:text-xs mt-1 opacity-90">
                      {lvl === "beginner"
                        ? "Ringan (5 Poin)"
                        : lvl === "intermediate"
                        ? "Normal (10 Poin)"
                        : "Intensif (20 Poin)"}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Target Hafalan
            </label>
            <select
              className="w-full border border-slate-300 rounded-xl p-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              value={onboardTarget}
              onChange={(e) => setOnboardTarget(Number(e.target.value))}
            >
              <option value={30}>Juz 30 (Juz Amma)</option>
              <option value={29}>Juz 29 (Tabarak)</option>
              <option value={1}>Juz 1 (Al-Baqarah)</option>
              <option value={114}>30 Juz (Khatam)</option>
            </select>
            <p className="text-xs text-slate-400 mt-1 ml-1 italic">
              Pilihan surat nanti bakal disesuain sama target ini.
            </p>
          </div>
          <button
            onClick={handleCreateUser}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4"
          >
            Mulai Menghafal
          </button>
        </div>
      </div>
    );
  }

  if (view === "dashboard" && state.profile) {
    const today = getLocalYYYYMMDD();
    const dueItems = state.items
      .filter((i) => i.nextReviewDate <= today)
      .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
    const allItems = [...state.items].sort(
      (a, b) => a.surahNo - b.surahNo || a.startAyah - b.startAyah
    );

    // Quota Calculation (Using Load instead of simple Count)
    const dailyLimit = getMaxAyatByLevel(state.profile.skillLevel);
    const dailyUsed = getDailyLoad(state.items);
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const isQuotaFull = dailyRemaining === 0;
    const isMaxLevel = state.profile.skillLevel === "advanced";

    return (
      <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in">
        {showTutorial && <HafalanTutorialModal onClose={handleCloseTutorial} />}
        {showSettings && (
          <HafalanSettingsModal
            currentProfile={state.profile}
            onClose={() => setShowSettings(false)}
            onSave={(u) => {
              actions.updateProfile(u);
              setShowSettings(false);
            }}
          />
        )}
        {selectedDetailItem && (
          <HafalanDetailModal
            item={selectedDetailItem}
            onClose={() => setSelectedDetailItem(null)}
            onPractice={() => {
              actions.startPractice(selectedDetailItem);
              setSelectedDetailItem(null);
            }}
          />
        )}

        {/* Modern Dashboard Header */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white rounded-3xl shadow-xl shadow-indigo-200 relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-start md:items-end">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <svg
              className="w-64 h-64 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <div className="relative z-10 w-full md:w-2/3">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  Ahlan, {state.profile.name}!
                </h1>
                <p className="text-indigo-200 text-sm mt-1 opacity-90">
                  "{getMotivationalQuote()}"
                </p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-6">
              <div className="flex justify-between text-xs text-indigo-200 mb-2 font-bold uppercase tracking-wider">
                <span>Level {state.gamification.level}</span>
                <span>{state.gamification.xp} XP</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  style={{ width: `${state.gamification.xp % 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex gap-3 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex-1 md:flex-none text-center min-w-[100px]">
              <span className="block text-2xl font-bold">
                {state.gamification.currentStreak}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-200">
                Hari Streak
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex-1 md:flex-none text-center min-w-[100px]">
              <span className="block text-2xl font-bold">
                {state.items.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-indigo-200">
                Total Hafalan
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
            <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
              <button
                onClick={() => setDashboardTab("schedule")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  dashboardTab === "schedule"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📅 Murajaah{" "}
                {dueItems.length > 0 && (
                  <span className="ml-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-[10px]">
                    {dueItems.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setDashboardTab("list")}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  dashboardTab === "list"
                    ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                📋 Progres
              </button>
            </div>
            <div className="p-6 flex-1 bg-white">
              {dashboardTab === "schedule" ? (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">
                      Murajaah Hari Ini
                    </h3>
                    <button
                      onClick={() => actions.setView("add_new")}
                      className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors border border-indigo-100"
                    >
                      + Tambah
                    </button>
                  </div>

                  {/* Empty/Celebration States */}
                  {state.items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-sm">
                        🌱
                      </div>
                      <div>
                        <h4 className="font-bold text-indigo-900 text-lg">
                          Awal Perjalanan
                        </h4>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                          Setiap hafiz mulai dari satu ayat. Yuk, mulai hafalan
                          pertamamu.
                        </p>
                      </div>
                      <button
                        onClick={() => actions.setView("add_new")}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-1"
                      >
                        + Tambah Hafalan Baru
                      </button>
                    </div>
                  ) : dueItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-4xl animate-bounce shadow-inner">
                        🎉
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">
                          {isQuotaFull
                            ? "Target Harian Tercapai!"
                            : "Masya Allah!"}
                        </h4>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                          {isQuotaFull
                            ? `Beban hafalan kamu (${dailyUsed} poin) udah pas banget. Istirahat dulu ya biar hafalan nempel kuat. `
                            : "Semua jadwal murajaah hari ini beres. Mau istirahat atau tambah hafalan lagi?"}
                        </p>
                      </div>
                      {isQuotaFull ? (
                        <div className="flex flex-col gap-3 w-full max-w-xs">
                          {isMaxLevel && (
                            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-xs font-medium border border-green-200 mb-1">
                              Performa Luar Biasa (Level Fokus)!
                            </div>
                          )}

                          <button
                            onClick={() => setShowSettings(true)}
                            className="w-full bg-white border-2 border-green-200 text-green-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 hover:border-green-300 transition-all"
                          >
                            Atur Target Harian
                          </button>

                          {!isMaxLevel && (
                            <p className="text-xs text-slate-400">atau</p>
                          )}

                          <button
                            onClick={() => actions.setView("add_new")}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                          >
                            Lanjut Menambah (Override)
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => actions.setView("add_new")}
                          className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all"
                        >
                          Tambah Hafalan Baru
                        </button>
                      )}
                    </div>
                  ) : (
                    // Tasks List
                    <div className="space-y-3 pb-20 md:pb-0">
                      {dueItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold text-slate-800 text-lg">
                                {item.surahName}
                              </h4>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                                  item.stage === 0
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {item.stage === 0 ? "Baru" : "Murajaah"}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium">
                              Ayat {item.startAyah} - {item.endAyah}
                            </p>
                          </div>
                          <button
                            onClick={() => actions.startReview(item)}
                            className="w-full sm:w-auto bg-indigo-50 text-indigo-600 px-6 py-3 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95"
                          >
                            Mulai &rarr;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-800">Daftar Hafalan</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => exportHafalanToPdf(state)}
                        className="text-xs bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 border border-slate-200 flex items-center"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                    {allItems.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 italic text-sm">
                        Belum ada data.
                      </div>
                    ) : (
                      allItems.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setSelectedDetailItem(item)}
                          className="p-4 rounded-2xl border flex justify-between items-center cursor-pointer hover:shadow-md transition-all bg-white border-slate-100 hover:border-indigo-200 group"
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm group-hover:text-indigo-700">
                              {item.surahName}{" "}
                              <span className="text-slate-400 font-normal ml-1">
                                ({item.startAyah}-{item.endAyah})
                              </span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1 flex items-center">
                              <span
                                className={`w-2 h-2 rounded-full mr-1.5 ${
                                  item.stage >= 5
                                    ? "bg-green-400"
                                    : "bg-amber-400"
                                }`}
                              ></span>
                              Next: {formatDate(item.nextReviewDate)}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] px-2 py-1 rounded-lg font-bold border ${
                              item.stage >= 5
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {item.stage >= 5 ? "Mutqin" : `Lvl ${item.stage}`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-orange-50/50">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                <span className="text-xl mr-2 p-1 bg-orange-100 rounded-lg">
                  ⚔️
                </span>{" "}
                Weekly Challenge
              </h4>
              <div className="mt-2">
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-orange-600">
                    {state.gamification.weeklyChallengeProgress}%
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${state.gamification.weeklyChallengeProgress}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">
                  Raih 50 XP minggu ini buat dapet rewards!
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-lg shadow-indigo-50/50">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center">
                <span className="text-xl mr-2 p-1 bg-indigo-100 rounded-lg">
                  🏅
                </span>{" "}
                Badges
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {BADGES.map((badge) => (
                  <div
                    key={badge.id}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 ${
                      state.gamification.badges.includes(badge.id)
                        ? "bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 shadow-sm scale-100"
                        : "bg-slate-50 opacity-30 grayscale scale-90"
                    }`}
                    title={badge.name}
                  >
                    {badge.icon}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={actions.logout}
              className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Ganti Akun / Keluar
            </button>
          </div>
        </div>
        <FAQ title="Panduan" subtitle="Metode SRS NIZAMY" data={HAFALAN_FAQ} />
      </div>
    );
  }

  if (view === "add_new") {
    const dailyLimit = state.profile
      ? getMaxAyatByLevel(state.profile.skillLevel)
      : 5;
    const dailyUsed = getDailyLoad(state.items);
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
    const pendingNewItems = state.items.filter((i) => i.stage === 0);
    const hasPending = pendingNewItems.length > 0;
    const isQuotaFull = dailyRemaining === 0;
    const isMaxLevel = state.profile?.skillLevel === "advanced";

    // Calculate current selection load in real-time
    const currentSelectionLoad = getItemWeight(
      selectedSurahNumber,
      newAyahStart,
      newAyahEnd
    );
    const isSelectionOverQuota = currentSelectionLoad > dailyRemaining;

    return (
      <div className="max-w-lg mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 animate-fade-in-up mt-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-slate-800">
              Tambah Hafalan
            </h3>
            {state.profile && (
              <p className="text-sm text-slate-500 mt-1">
                Mode:{" "}
                <span className="font-bold text-indigo-600">
                  {state.profile.skillLevel === "beginner"
                    ? "Santai"
                    : state.profile.skillLevel === "intermediate"
                    ? "Sedang"
                    : "Fokus"}
                </span>
                <span className="mx-1">•</span>
                Target: {dailyLimit} Poin/Hari
              </p>
            )}
          </div>
          <button
            onClick={() => actions.setView("dashboard")}
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
                actions.setView("dashboard");
                setDashboardTab("schedule");
              }}
              className="w-full bg-orange-600 text-white font-bold py-3.5 rounded-xl hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
            >
              Ke Jadwal Murajaah
            </button>
          </div>
        ) : isQuotaFull && !quotaWarning && !bypassQuota ? (
          // Soft Blocking UI - Allows Override
          <div className="text-center py-8 px-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              ⚠️
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
                setShowSettings(true);
                actions.setView("dashboard");
              }}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
            >
              Atur Target Harian
            </button>

            <button
              onClick={() => setBypassQuota(true)}
              className="mt-4 text-sm font-bold text-indigo-500 hover:text-indigo-700 underline block w-full"
            >
              Tetap Lanjut (Override)
            </button>

            <button
              onClick={() => actions.setView("dashboard")}
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

            {/* Info Panel about Point System */}
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-start text-xs text-blue-800">
              <span className="mr-2 text-lg">💡</span>
              <p className="mt-0.5">
                <strong>Sistem Poin:</strong> 1 Ayat Pendek = 1 Poin. Ayat yang
                panjang banget (misal Al-Baqarah 282) punya poin lebih gede
                karena emang lebih berat ngafalnya.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-slate-700">
                Pilih Surat
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none appearance-none"
                value={selectedSurahNumber}
                onChange={(e) => setSelectedSurahNumber(Number(e.target.value))}
              >
                {getAvailableSurahs(state.profile!.targetJuz).map((s) => (
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
                  onChange={(e) => setNewAyahStart(Number(e.target.value))}
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
                  onChange={(e) => setNewAyahEnd(Number(e.target.value))}
                />
              </div>
            </div>

            {/* UI Feedback Area */}
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
                Simpan Hafalan
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  if (view === "review_session" && activeSessionItem) {
    return (
      <div className="animate-fade-in min-h-screen flex flex-col md:justify-center md:items-center md:py-8">
        {/* Desktop Centered Card Container */}
        <div className="w-full max-w-5xl md:bg-white md:rounded-[2.5rem] md:shadow-2xl md:shadow-slate-200/70 md:border md:border-slate-100 flex flex-col overflow-hidden relative md:aspect-[1.4/1] md:max-h-[85vh]">
          {/* Header - Sticky on Mobile, Top of Card on Desktop */}
          <div className="flex justify-between items-center py-4 px-4 md:px-8 md:py-6 bg-white md:bg-transparent z-20 relative">
            <div
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPracticeMode
                  ? "bg-teal-100 text-teal-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {isPracticeMode ? "Mode Latihan" : "Mode Hafalan"}
            </div>
            <button
              onClick={() => actions.setView("dashboard")}
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-full transition-colors flex items-center text-sm font-medium"
            >
              Keluar
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-1"
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

          {/* Surah Info Title */}
          <div className="text-center px-6 pb-2 z-10">
            <h2 className="text-xl md:text-3xl font-bold text-slate-800">
              {activeSessionItem.surahName}
            </h2>
            <p className="text-slate-500 text-sm md:text-base mt-1 font-medium">
              Ayat {activeSessionItem.startAyah} - {activeSessionItem.endAyah}
            </p>
          </div>

          {/* Quran Text Area - Scrollable */}
          <div
            className="flex-1 overflow-y-auto px-6 md:px-12 py-4 md:py-8 flex flex-col relative custom-scrollbar"
            dir="rtl"
          >
            {isLoadingText ? (
              <div className="flex flex-col items-center my-auto">
                <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-indigo-600 mb-4"></div>
                <p className="text-slate-400 text-sm font-medium">
                  Memuat Ayat...
                </p>
              </div>
            ) : (
              <div className="space-y-8 md:space-y-12 w-full max-w-3xl mx-auto my-auto py-8">
                {/* Decorative Bismillah */}
                {activeSessionItem.startAyah === 1 &&
                  activeSessionItem.surahNo !== 1 &&
                  activeSessionItem.surahNo !== 9 && (
                    <div className="text-center mb-10">
                      <span className="font-arabic text-2xl md:text-4xl text-slate-500 block mb-4">
                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                      </span>
                      <div className="w-16 h-0.5 bg-slate-200 mx-auto"></div>
                    </div>
                  )}

                {quranText.map((a) => (
                  <div key={a.number} className="relative group">
                    <p className="text-3xl md:text-5xl leading-[2.2] md:leading-[2.4] font-arabic text-slate-800 text-center selection:bg-indigo-100 selection:text-indigo-900">
                      {a.text}
                    </p>
                    <div className="flex justify-center mt-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 md:w-12 md:h-12 text-sm md:text-lg border-2 border-slate-200 rounded-full text-slate-400 font-sans bg-white">
                        {a.number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Area - Fixed at Bottom Mobile, Inside Card Desktop */}
          <div className="p-4 md:p-8 bg-white md:bg-transparent border-t border-slate-100 md:border-0 z-20 mt-auto">
            {isPracticeMode ? (
              <button
                onClick={actions.finishPractice}
                className="w-full py-4 bg-teal-600 text-white font-bold rounded-2xl hover:bg-teal-700 shadow-lg shadow-teal-200 active:scale-95 transition-all text-lg"
              >
                Selesai Membaca
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-2xl mx-auto">
                <button
                  onClick={() => handleSubmitReview("fail")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-600 hover:bg-orange-50 hover:border-orange-200 hover:text-orange-700 active:scale-95 transition-all duration-200 group h-28 md:h-32 shadow-sm"
                >
                  <span className="text-3xl md:text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">
                    🤔
                  </span>
                  <span className="font-bold text-lg md:text-xl">Lupa</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-60 mt-1">
                    Ulangi Besok
                  </span>
                </button>

                <button
                  onClick={() => handleSubmitReview("success")}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl active:scale-95 transition-all duration-200 h-28 md:h-32"
                >
                  <span className="text-3xl md:text-4xl mb-2">✨</span>
                  <span className="font-bold text-lg md:text-xl">Lancar</span>
                  <span className="text-[10px] md:text-xs uppercase tracking-wide opacity-80 mt-1">
                    + XP Bonus
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};
