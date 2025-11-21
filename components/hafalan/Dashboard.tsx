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
  const [tab, setTab] = useState<"schedule" | "list">("schedule");
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
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-12">
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
                Ahlan, {profile.name}!
              </h1>
              <p className="text-indigo-200 text-sm mt-1 opacity-90">
                "{getMotivationalQuote()}"
              </p>
            </div>
            <button
              onClick={() => {
                audioService.playClick();
                setShowSettings(true);
              }}
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
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full shadow-[0_0_10px_rgba(251,191,36,0.6)] transition-all duration-1000"
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
            <span className="text-indigo-200 text-[10px] uppercase tracking-wider">
              Hari Streak
            </span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex-1 md:flex-none text-center min-w-[100px]">
            <span className="block text-2xl font-bold">
              {state.items.length}
            </span>
            <span className="text-indigo-200 text-[10px] uppercase tracking-wider">
              Total Hafalan
            </span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
          <div className="flex border-b border-slate-100 p-2 bg-slate-50/50">
            <button
              onClick={() => {
                audioService.playClick();
                setTab("schedule");
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === "schedule"
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
              onClick={() => {
                audioService.playClick();
                setTab("list");
              }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                tab === "list"
                  ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              📋 Progres
            </button>
          </div>
          <div className="p-6 flex-1 bg-white">
            {tab === "schedule" ? (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800">
                    Murajaah Hari Ini
                  </h3>
                  <button
                    onClick={() => {
                      audioService.playClick();
                      onAddClick();
                    }}
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
                      onClick={() => {
                        audioService.playClick();
                        onAddClick();
                      }}
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 transform hover:-translate-y-1"
                    >
                      + Tambah Hafalan Baru
                    </button>
                  </div>
                ) : dueItems.length === 0 ? (
                  <div
                    className={`flex-1 flex flex-col items-center justify-center text-center space-y-4 p-4 rounded-2xl border border-dashed ${
                      isQuotaFull
                        ? "bg-green-50/50 border-green-200"
                        : "bg-indigo-50/50 border-indigo-200"
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-inner ${
                        isQuotaFull
                          ? "bg-green-100 animate-bounce"
                          : "bg-indigo-100"
                      }`}
                    >
                      {isQuotaFull ? "🎉" : "⚡"}
                    </div>
                    <div>
                      <h4
                        className={`font-bold text-lg ${
                          isQuotaFull ? "text-green-900" : "text-indigo-900"
                        }`}
                      >
                        {isQuotaFull
                          ? "Target Harian Tuntas!"
                          : "Murajaah Beres, Energi Masih Ada!"}
                      </h4>
                      <p
                        className={`text-sm mt-1 max-w-xs mx-auto leading-relaxed ${
                          isQuotaFull
                            ? "text-green-800/80"
                            : "text-indigo-800/80"
                        }`}
                      >
                        {isQuotaFull
                          ? `Masya Allah, hari ini kamu produktif banget (Total ${dailyUsed} poin). Istirahat dulu ya, biar hafalan nempel sempurna.`
                          : `Jadwal murajaah udah bersih, tapi kuota harian kamu masih sisa ${dailyRemaining} poin. Sayang kalau nggak dipake, tambah hafalan baru yuk?`}
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
                          onClick={() => {
                            audioService.playClick();
                            setShowSettings(true);
                          }}
                          className="w-full bg-white border-2 border-green-200 text-green-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 hover:border-green-300 transition-all"
                        >
                          Atur Target Harian
                        </button>

                        {!isMaxLevel && (
                          <p className="text-xs text-slate-400">atau</p>
                        )}

                        <button
                          onClick={() => {
                            audioService.playClick();
                            onAddClick();
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium underline"
                        >
                          Lanjut Menambah (Override)
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          audioService.playClick();
                          onAddClick();
                        }}
                        className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
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
                          onClick={() => onStartReview(item)}
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
                      onClick={() => {
                        audioService.playClick();
                        exportHafalanToPdf(state);
                      }}
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
                        onClick={() => {
                          audioService.playClick();
                          setSelectedDetailItem(item);
                        }}
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
                  {state.gamification.weeklyChallengeProgress} /{" "}
                  {state.gamification.weeklyChallengeTarget} XP
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${challengePercent}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">
                Kumpulkan {state.gamification.weeklyChallengeTarget} XP minggu
                ini buat jaga Istiqomah!
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
            onClick={() => {
              audioService.playClick();
              onLogout();
            }}
            className="w-full py-3 rounded-2xl border border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            Ganti Akun / Keluar
          </button>
        </div>
      </div>
      <FAQ title="Panduan" subtitle="Metode SRS NIZAMY" data={HAFALAN_FAQ} />
    </div>
  );
};
