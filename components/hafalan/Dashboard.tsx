import React, { useState, useEffect } from "react";
import type { HafalanState, HafalanSkillLevel } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";
import {
  getMotivationalQuote,
  getDailyLoad,
  getMaxAyatByLevel,
  getLocalYYYYMMDD,
} from "../../services/hafalan.service.ts";
import { exportHafalanToPdf } from "../../services/pdf.service.ts";
import { BADGES, HAFALAN_FAQ } from "../../constants.ts";
import { FAQ } from "../FAQ.tsx";
import { formatDate } from "../../utils.ts";
import {
  HafalanTutorialModal,
  HafalanDetailModal,
  HafalanSettingsModal,
  CelebrationModal,
} from "./HafalanModals.tsx";

interface DashboardProps {
  state: HafalanState;
  onAddClick: () => void;
  onStartReview: (item: any) => void;
  onStartPractice: (item: any) => void;
  onUpdateProfile: (updates: {
    name: string;
    skillLevel: HafalanSkillLevel;
    targetJuz: number;
  }) => void;
  onLogout: () => void;
  onShowToast: (msg: string, type: "success" | "info") => void;
  earnedBadgesQueue: string[];
  onClearBadges: () => void;
}

type TabView = "schedule" | "list" | "profile" | "guide";

export const Dashboard: React.FC<DashboardProps> = ({
  state,
  onAddClick,
  onStartReview,
  onStartPractice,
  onUpdateProfile,
  onLogout,
  onShowToast,
  earnedBadgesQueue,
  onClearBadges,
}) => {
  // Unified tab state.
  const [activeTab, setActiveTab] = useState<TabView>("schedule");

  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(
    null
  );

  const profile = state.profile!;
  const today = getLocalYYYYMMDD();
  const dueItems = state.items
    .filter((i) => i.nextReviewDate <= today)
    .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  const allItems = [...state.items].sort(
    (a, b) => a.surahNo - b.surahNo || a.startAyah - b.startAyah
  );

  const dailyLimit = getMaxAyatByLevel(profile.skillLevel);
  const dailyUsed = getDailyLoad(state.items);
  const dailyRemaining = Math.max(0, dailyLimit - dailyUsed);
  const isQuotaFull = dailyRemaining === 0;
  const isMaxLevel = profile.skillLevel === "advanced";

  // Desktop Compatibility: If tab is 'profile' or 'guide', desktop shows 'schedule' for content
  const desktopContentTab =
    activeTab === "profile" || activeTab === "guide" ? "schedule" : activeTab;

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem(
      "nizamy_hafalan_tutorial_seen"
    );
    if (state.items.length === 0 && !showTutorial && !hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [state.items.length, showTutorial]);

  const handleCloseTutorial = () => {
    localStorage.setItem("nizamy_hafalan_tutorial_seen", "true");
    setShowTutorial(false);
    audioService.playClick();
  };

  const challengePercent = Math.min(
    100,
    (state.gamification.weeklyChallengeProgress /
      state.gamification.weeklyChallengeTarget) *
      100
  );

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-8 animate-fade-in pb-20 md:pb-12">
      {showTutorial && <HafalanTutorialModal onClose={handleCloseTutorial} />}

      {showSettings && (
        <HafalanSettingsModal
          currentProfile={profile}
          onClose={() => setShowSettings(false)}
          onSave={(u) => {
            onUpdateProfile(u);
            setShowSettings(false);
            onShowToast("Profil Diupdate", "success");
          }}
        />
      )}

      {selectedDetailItem && (
        <HafalanDetailModal
          item={selectedDetailItem}
          onClose={() => setSelectedDetailItem(null)}
          onPractice={() => {
            onStartPractice(selectedDetailItem);
            setSelectedDetailItem(null);
          }}
        />
      )}

      {earnedBadgesQueue.length > 0 && (
        <CelebrationModal badges={earnedBadgesQueue} onClose={onClearBadges} />
      )}

      {/* --- HEADER SECTION --- */}
      {/* Mobile: Compact Flat Header. Desktop: Rounded Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 dark:from-indigo-950 dark:to-slate-900 text-white md:rounded-3xl shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden p-5 md:p-8 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-end -mx-4 md:mx-0 -mt-8 md:mt-0 pt-8 md:pt-8 border border-indigo-800 dark:border-slate-800">
        {/* Hide SVG on mobile for compactness */}
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none hidden md:block">
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
              <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2">
                Ahlan, {profile.name}!
              </h1>
              {/* Quote hidden on very small screens to save space */}
              <p className="text-indigo-200 text-xs md:text-sm mt-1 opacity-90 line-clamp-1">
                "{getMotivationalQuote()}"
              </p>
            </div>
            <button
              onClick={() => {
                audioService.playClick();
                setShowSettings(true);
              }}
              className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm flex-shrink-0 ml-2"
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

          <div className="mt-4 md:mt-6">
            <div className="flex justify-between text-xs text-indigo-200 mb-1.5 md:mb-2 font-bold uppercase tracking-wider">
              <span>Level {state.gamification.level}</span>
              <span>{state.gamification.xp} XP</span>
            </div>
            <div className="w-full bg-black/20 rounded-full h-2 md:h-2.5 overflow-hidden backdrop-blur-sm">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-1000"
                style={{ width: `${state.gamification.xp % 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats Grid: Compact on Mobile */}
        <div className="relative z-10 flex gap-3 w-full md:w-auto mt-2 md:mt-0">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-3 flex-1 md:flex-none text-center min-w-[80px] md:min-w-[100px]">
            <span className="block text-lg md:text-2xl font-bold">
              {state.gamification.currentStreak}
            </span>
            <span className="text-indigo-200 text-[10px] uppercase tracking-wider">
              Streak
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl p-2 md:p-3 flex-1 md:flex-none text-center min-w-[80px] md:min-w-[100px]">
            <span className="block text-lg md:text-2xl font-bold">
              {state.items.length}
            </span>
            <span className="text-indigo-200 text-[10px] uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="md:grid md:grid-cols-3 gap-6">
        {/* LEFT COL: MAIN CONTENT (Tasks & List) */}
        {/* On Mobile: Show only if tab is NOT profile and NOT guide */}
        <div
          className={`md:col-span-2 bg-white dark:bg-slate-800 md:rounded-3xl shadow-sm md:shadow-lg md:shadow-slate-200/50 dark:md:shadow-none border-y md:border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px] ${
            activeTab === "profile" || activeTab === "guide"
              ? "hidden md:flex"
              : "flex"
          }`}
        >
          {/* Desktop Tabs (Hidden on Mobile) */}
          <div className="hidden md:flex border-b border-slate-100 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-20 backdrop-blur-md">
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab("schedule");
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                desktopContentTab === "schedule"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              📅 Jadwal Murajaah
              {dueItems.length > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 px-1.5 py-0.5 rounded-full text-[10px]">
                  {dueItems.length}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab("list");
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                desktopContentTab === "list"
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              📋 Daftar Hafalan
            </button>
          </div>

          <div className="p-4 md:p-6 flex-1 bg-white dark:bg-slate-800">
            {/* SCHEDULE VIEW */}
            {desktopContentTab === "schedule" ? (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl">
                    Murajaah Hari Ini
                  </h3>
                  {/* Desktop Add Button (Hidden on Mobile in favor of FAB) */}
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onAddClick();
                    }}
                    className="hidden md:block text-sm bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"
                  >
                    + Tambah
                  </button>
                </div>

                {/* Empty/Celebration States */}
                {state.items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-sm">
                      🌱
                    </div>
                    <div>
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-lg">
                        Awal Perjalanan
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-1">
                        Setiap hafiz mulai dari satu ayat. Yuk, mulai hafalan
                        pertamamu.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        audioService.playClick();
                        onAddClick();
                      }}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none transform hover:-translate-y-1"
                    >
                      + Tambah Hafalan Baru
                    </button>
                  </div>
                ) : dueItems.length === 0 ? (
                  <div
                    className={`flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 rounded-2xl border border-dashed ${
                      isQuotaFull
                        ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
                        : "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"
                    }`}
                  >
                    <div
                      className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-3xl md:text-4xl shadow-inner ${
                        isQuotaFull
                          ? "bg-green-100 dark:bg-green-900/50 animate-bounce"
                          : "bg-indigo-100 dark:bg-indigo-900/50"
                      }`}
                    >
                      {isQuotaFull ? "🎉" : "⚡"}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-lg ${
                          isQuotaFull
                            ? "text-green-900 dark:text-green-300"
                            : "text-indigo-900 dark:text-indigo-300"
                        }`}
                      >
                        {isQuotaFull
                          ? "Target Harian Tuntas!"
                          : "Murajaah Beres, Energi Masih Ada!"}
                      </h4>
                      <p
                        className={`text-sm mt-1 max-w-xs mx-auto leading-relaxed ${
                          isQuotaFull
                            ? "text-green-800/80 dark:text-green-200/70"
                            : "text-indigo-800/80 dark:text-indigo-200/70"
                        }`}
                      >
                        {isQuotaFull
                          ? `Masya Allah, hari ini kamu produktif banget (Total ${dailyUsed} poin). Istirahat dulu ya, biar hafalan nempel sempurna.`
                          : `Jadwal murajaah udah bersih, tapi kuota harian kamu masih sisa ${dailyRemaining} poin. Sayang kalau nggak dipake, tambah hafalan baru yuk?`}
                      </p>
                    </div>
                    {isQuotaFull ? (
                      <div className="flex flex-col gap-3 w-full max-w-xs">
                        <button
                          onClick={() => {
                            audioService.playClick();
                            setShowSettings(true);
                          }}
                          className="w-full bg-white dark:bg-slate-700 border-2 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 dark:hover:bg-slate-600 hover:border-green-300 transition-all"
                        >
                          Atur Target Harian
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          audioService.playClick();
                          onAddClick();
                        }}
                        className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
                      >
                        + Tambah Hafalan Baru
                      </button>
                    )}
                  </div>
                ) : (
                  // Tasks List
                  <div className="space-y-3 pb-20 md:pb-0">
                    {dueItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-slate-700/50 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-row justify-between items-center gap-3 md:gap-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-slate-800 dark:text-white text-base md:text-lg truncate">
                              {item.surahName}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide flex-shrink-0 ${
                                item.stage === 0
                                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
                                  : "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300"
                              }`}
                            >
                              {item.stage === 0 ? "Baru" : "Murajaah"}
                            </span>
                          </div>
                          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
                            Ayat {item.startAyah} - {item.endAyah}
                          </p>
                        </div>
                        <button
                          onClick={() => onStartReview(item)}
                          className="shrink-0 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 p-3 md:px-6 md:py-3 rounded-xl md:rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95 flex items-center justify-center"
                          aria-label="Mulai Murajaah"
                        >
                          {/* Icon on Mobile */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 md:hidden"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {/* Text on Desktop */}
                          <span className="hidden md:inline">Mulai &rarr;</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // LIST VIEW
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl">
                    Daftar Hafalan
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        audioService.playClick();
                        exportHafalanToPdf(state);
                      }}
                      className="text-xs bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 flex items-center"
                    >
                      PDF
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 pb-20 md:pb-0">
                  {allItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 italic text-sm">
                      Belum ada data.
                    </div>
                  ) : (
                    allItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          audioService.playClick();
                          setSelectedDetailItem(item);
                        }}
                        className="p-4 rounded-2xl border flex justify-between items-center cursor-pointer hover:shadow-md transition-all bg-white dark:bg-slate-700/30 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 group"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400">
                            {item.surahName}{" "}
                            <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">
                              ({item.startAyah}-{item.endAyah})
                            </span>
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center">
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
                              ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
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

        {/* RIGHT COL: PROFILE & GAMIFICATION (Sidebar) */}
        {/* On Mobile: Show only if tab IS profile */}
        <div
          className={`space-y-6 ${
            activeTab === "profile" ? "block" : "hidden md:block"
          }`}
        >
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg shadow-orange-50/50 dark:shadow-none">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <span className="text-xl mr-2 p-1 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                ⚔️
              </span>{" "}
              Weekly Challenge
            </h4>
            <div className="mt-2">
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Progress
                </span>
                <span className="text-orange-600 dark:text-orange-400">
                  {state.gamification.weeklyChallengeProgress} /{" "}
                  {state.gamification.weeklyChallengeTarget} XP
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${challengePercent}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
                Kumpulkan {state.gamification.weeklyChallengeTarget} XP minggu
                ini buat jaga Istiqomah!
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-lg shadow-indigo-50/50 dark:shadow-none">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center">
              <span className="text-xl mr-2 p-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
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
                      ? "bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/30 dark:to-slate-800 border border-indigo-100 dark:border-indigo-800 shadow-sm scale-100"
                      : "bg-slate-50 dark:bg-slate-700 opacity-30 grayscale scale-90"
                  }`}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onLogout();
            }}
            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Ganti Akun / Keluar
          </button>
        </div>

        {/* MOBILE GUIDE TAB */}
        <div
          className={`${activeTab === "guide" ? "block" : "hidden md:hidden"}`}
        >
          <FAQ
            title="Panduan"
            subtitle="Metode SRS NIZAMY"
            data={HAFALAN_FAQ}
          />
        </div>
      </div>

      {/* FAQ VISIBLE ON DESKTOP BOTTOM ONLY */}
      <div className="hidden md:block mt-8">
        <FAQ title="Panduan" subtitle="Metode SRS NIZAMY" data={HAFALAN_FAQ} />
      </div>

      {/* --- FAB (FLOATING ACTION BUTTON) --- */}
      {/* Only visible on Mobile when NOT in Profile or Guide tab */}
      <button
        onClick={() => {
          audioService.playClick();
          onAddClick();
        }}
        className={`md:hidden fixed bottom-24 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/40 dark:shadow-black/40 flex items-center justify-center z-40 transition-transform active:scale-90 hover:scale-105 ${
          activeTab === "profile" || activeTab === "guide" ? "hidden" : "flex"
        }`}
        aria-label="Tambah Hafalan"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe px-2 py-2 z-50 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab("schedule");
          }}
          className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
            activeTab === "schedule"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase">Jadwal</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab("list");
          }}
          className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
            activeTab === "list"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase">List</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab("guide");
          }}
          className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
            activeTab === "guide"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase">Panduan</span>
        </button>

        <button
          onClick={() => {
            audioService.playClick();
            setActiveTab("profile");
          }}
          className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all ${
            activeTab === "profile"
              ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20"
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="text-[10px] font-bold uppercase">Profil</span>
        </button>
      </div>
    </div>
  );
};
