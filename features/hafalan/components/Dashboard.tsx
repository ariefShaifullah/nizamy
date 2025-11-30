
import React, { useState, useEffect, useMemo } from "react";
import type { HafalanState, HafalanItem, HafalanSkillLevel } from "../../../types.ts";
import { audioService } from "../../../services/audio.service.ts";
import { notificationService } from "../../../services/notification.service.ts";
import {
  getMotivationalQuote,
  getDailyLoad,
  getMaxAyatByLevel,
  getLocalYYYYMMDD,
} from "../logic/hafalan.service.ts";
import { exportHafalanToPdf } from "../logic/pdf-export.ts";
import { BADGES, HAFALAN_FAQ } from "../constants.ts";
import { FAQ } from "../../../components/ui/FAQ.tsx";
import { formatDate } from "../../../utils.ts";
import { useToast } from "../../../components/ui/Toast.tsx";
import {
  HafalanTutorialModal,
  HafalanDetailModal,
  HafalanSettingsModal,
  CelebrationModal,
} from "./HafalanModals.tsx";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { FaCog, FaCalendarAlt, FaList, FaBookOpen, FaUser, FaPlus, FaBell, FaCheck, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";

// --- SUB-COMPONENTS EXTRACTED ---

const ProgressChart: React.FC<{ items: HafalanItem[] }> = React.memo(({ items }) => {
    const data = useMemo(() => {
        const counts = { new: 0, learning: 0, mastered: 0 };
        items.forEach(i => {
            if (i.stage === 0) counts.new++;
            else if (i.stage >= 5) counts.mastered++;
            else counts.learning++;
        });
        return [
            { name: 'Baru', value: counts.new, color: '#818cf8' },
            { name: 'Proses', value: counts.learning, color: '#fbbf24' },
            { name: 'Mutqin', value: counts.mastered, color: '#34d399' }
        ].filter(d => d.value > 0);
    }, [items]);

    if (items.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">📊</span> 
                Peta Hafalan
            </h4>
            <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} itemStyle={{ color: '#1e293b' }} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="block text-2xl font-black text-slate-800 dark:text-white">{items.length}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {data.map(d => (
                    <div key={d.name} className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: d.color }}></span>
                        {d.name} ({d.value})
                    </div>
                ))}
            </div>
        </div>
    );
});

const StatsHeader: React.FC<{ profile: any; gamification: any; itemCount: number; onSettings: () => void; }> = React.memo(({ profile, gamification, itemCount, onSettings }) => (
    <div className="bg-linear-to-br from-indigo-900 to-indigo-800 dark:from-indigo-950 dark:to-slate-900 text-white md:rounded-3xl shadow-xl shadow-indigo-200/50 dark:shadow-none relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between items-end border border-indigo-700/50 dark:border-slate-800">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none hidden md:block">
          <svg className="w-64 h-64 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
        </div>
        <div className="relative z-10 w-full md:w-2/3">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 tracking-tight">Ahlan, {profile.name}!</h1>
              <p className="text-indigo-200 text-xs md:text-sm mt-1 font-medium italic opacity-90 line-clamp-1">"{getMotivationalQuote()}"</p>
            </div>
            <button onClick={onSettings} className="bg-white/10 p-2.5 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-md border border-white/10" aria-label="Pengaturan">
              <FaCog />
            </button>
          </div>
          <div className="mt-6">
            <div className="flex justify-between text-xs font-bold text-indigo-200 mb-2 uppercase tracking-wider">
              <span>Level {gamification.level}</span>
              <span>{gamification.xp} XP</span>
            </div>
            <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden backdrop-blur-sm border border-white/5">
              <div className="bg-linear-to-r from-amber-400 to-orange-500 h-full rounded-full shadow-[0_0_15px_rgba(251,191,36,0.5)] transition-all duration-1000 ease-out" style={{ width: `${gamification.xp % 100}%` }}></div>
            </div>
          </div>
        </div>
        <div className="relative z-10 flex gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex-1 md:flex-none text-center min-w-[90px]">
            <span className="block text-2xl font-bold">{gamification.currentStreak}</span>
            <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Streak</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex-1 md:flex-none text-center min-w-[90px]">
            <span className="block text-2xl font-bold">{itemCount}</span>
            <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-wider">Total</span>
          </div>
        </div>
    </div>
));

const EmptyState: React.FC<{ onAdd: () => void }> = ({ onAdd }) => (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-4xl shadow-sm border border-slate-100 dark:border-slate-700">🌱</div>
        <div>
            <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xl">Mulai Perjalananmu</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto mt-2 leading-relaxed">Setiap hafiz besar dimulai dari satu ayat. Yuk, tambah hafalan pertamamu sekarang.</p>
        </div>
        <button onClick={onAdd} className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none hover:-translate-y-1">
            + Tambah Hafalan
        </button>
    </div>
);

const MurajaahList: React.FC<{ items: HafalanItem[], onStartReview: (item: HafalanItem) => void }> = ({ items, onStartReview }) => (
    <div className="space-y-3 pb-20 md:pb-0">
        {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-700/30 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all group flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base truncate">{item.surahName}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wide border ${item.stage === 0 ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800" : "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800"}`}>
                            {item.stage === 0 ? "Baru" : "Murajaah"}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Ayat {item.startAyah} - {item.endAyah}</p>
                </div>
                <button onClick={() => onStartReview(item)} className="bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 p-3 md:px-5 md:py-2.5 rounded-xl text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all active:scale-95 flex items-center gap-2">
                    <span className="hidden md:inline">Mulai</span> <FaArrowRight />
                </button>
            </div>
        ))}
    </div>
);

const NotificationPermissionBanner: React.FC<{ onEnable: () => void; onClose: () => void }> = ({ onEnable, onClose }) => (
    <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 animate-fade-in-down">
        <div className="flex items-start gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-800 rounded-full text-indigo-600 dark:text-indigo-300 shrink-0"><FaBell /></div>
            <div>
                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">Aktifkan Pengingat Murajaah?</h4>
                <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed max-w-md">Biar istiqomah, izinkan kami mengingatkan jadwal hafalan kamu setiap hari.</p>
            </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onClose} className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">Nanti Saja</button>
            <button onClick={onEnable} className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md">Aktifkan</button>
        </div>
    </div>
);

// --- MAIN DASHBOARD COMPONENT ---

interface DashboardProps {
  state: HafalanState;
  onAddClick: () => void;
  onStartReview: (item: any) => void;
  onStartPractice: (item: any) => void;
  onUpdateProfile: (updates: { name: string; skillLevel: HafalanSkillLevel; targetJuz: number; }) => void;
  onLogout: () => void;
  earnedBadgesQueue: string[];
  onClearBadges: () => void;
}

type TabView = "schedule" | "list" | "profile" | "guide";

export const Dashboard: React.FC<DashboardProps> = ({
  state, onAddClick, onStartReview, onStartPractice, onUpdateProfile, onLogout, earnedBadgesQueue, onClearBadges
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabView>("schedule");
  const [showTutorial, setShowTutorial] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);
  const [showNotifBanner, setShowNotifBanner] = useState(false);

  const profile = state.profile!;
  
  const dueItems = useMemo(() => {
    const today = getLocalYYYYMMDD();
    return state.items.filter((i) => i.nextReviewDate <= today).sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate));
  }, [state.items]);

  const allItems = useMemo(() => [...state.items].sort((a, b) => a.surahNo - b.surahNo || a.startAyah - b.startAyah), [state.items]);

  const { dailyLimit, dailyUsed, dailyRemaining, isQuotaFull } = useMemo(() => {
      const limit = getMaxAyatByLevel(profile.skillLevel);
      const used = getDailyLoad(state.items);
      const remaining = Math.max(0, limit - used);
      return { dailyLimit: limit, dailyUsed: used, dailyRemaining: remaining, isQuotaFull: remaining === 0 };
  }, [profile.skillLevel, state.items]);

  const challengePercent = useMemo(() => {
    if (state.gamification.weeklyChallengeTarget === 0) return 0;
    return Math.min(100, (state.gamification.weeklyChallengeProgress / state.gamification.weeklyChallengeTarget) * 100);
  }, [state.gamification.weeklyChallengeProgress, state.gamification.weeklyChallengeTarget]);

  useEffect(() => {
    // Update app badge
    notificationService.updateAppBadge(dueItems.length);
    
    // Show banner if permission not yet requested
    if (notificationService.isSupported()) {
        const permission = notificationService.getPermissionState();
        if (permission === 'default' && dueItems.length > 0) {
            setShowNotifBanner(true);
        } else {
            setShowNotifBanner(false);
        }
    }
    
    // NOTE: Notifikasi reminder sekarang ditangani di App level (App.tsx)
    // via useHafalanReminder() agar aktif bahkan saat user tidak buka fitur hafalan
  }, [dueItems.length, dailyRemaining]);

  const handleEnableNotification = async () => {
      const granted = await notificationService.requestPermission();
      if (granted) {
          setShowNotifBanner(false);
          showToast('Notifikasi diaktifkan! Pengingat akan dikirim.', 'success');
          // Send test notification as confirmation
          notificationService.sendTestNotification();
      } else {
          setShowNotifBanner(false);
      }
  };

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem("nizamy_hafalan_tutorial_seen");
    if (state.items.length === 0 && !showTutorial && !hasSeenTutorial) setShowTutorial(true);
  }, [state.items.length, showTutorial]);

  const handleSettingsClick = () => {
      audioService.playClick();
      setShowSettings(true);
  };

  const desktopContentTab = activeTab === "profile" || activeTab === "guide" ? "schedule" : activeTab;

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-fade-in pb-24 md:pb-12">
      {showTutorial && <HafalanTutorialModal onClose={() => { localStorage.setItem("nizamy_hafalan_tutorial_seen", "true"); setShowTutorial(false); audioService.playClick(); }} />}
      {showSettings && <HafalanSettingsModal currentProfile={profile} onClose={() => setShowSettings(false)} onSave={(u) => { onUpdateProfile(u); setShowSettings(false); showToast("Profil berhasil diupdate!", "success"); }} />}
      {selectedDetailItem && <HafalanDetailModal item={selectedDetailItem} onClose={() => setSelectedDetailItem(null)} onPractice={() => { onStartPractice(selectedDetailItem); setSelectedDetailItem(null); }} />}
      {earnedBadgesQueue.length > 0 && <CelebrationModal badges={earnedBadgesQueue} onClose={onClearBadges} />}

      <StatsHeader profile={profile} gamification={state.gamification} itemCount={state.items.length} onSettings={handleSettingsClick} />

      {showNotifBanner && <NotificationPermissionBanner onEnable={handleEnableNotification} onClose={() => setShowNotifBanner(false)} />}

      <div className="md:grid md:grid-cols-3 gap-6">
        {/* LEFT COLUMN (Schedule & List) */}
        <div className={`md:col-span-2 bg-white dark:bg-slate-800 md:rounded-3xl shadow-sm md:shadow-lg border-y md:border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col min-h-[500px] ${activeTab === "profile" || activeTab === "guide" ? "hidden md:flex" : "flex"}`}>
          <div className="hidden md:flex border-b border-slate-100 dark:border-slate-700 p-2 bg-slate-50/50 dark:bg-slate-800/50 sticky top-0 z-20 backdrop-blur-md">
            <button onClick={() => { audioService.playClick(); setActiveTab("schedule"); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${desktopContentTab === "schedule" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              📅 Jadwal Murajaah {dueItems.length > 0 && <span className="ml-1 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200 px-1.5 py-0.5 rounded-full text-[10px]">{dueItems.length}</span>}
            </button>
            <button onClick={() => { audioService.playClick(); setActiveTab("list"); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${desktopContentTab === "list" ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              📋 Daftar Hafalan
            </button>
          </div>

          <div className="p-4 md:p-6 flex-1 bg-white dark:bg-slate-800">
            {desktopContentTab === "schedule" ? (
              <div className="space-y-6 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl">Hari Ini</h3>
                  <button onClick={() => { audioService.playClick(); onAddClick(); }} className="hidden md:flex items-center gap-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800"><FaPlus /> Tambah</button>
                </div>

                {state.items.length === 0 ? (
                  <EmptyState onAdd={() => { audioService.playClick(); onAddClick(); }} />
                ) : dueItems.length === 0 ? (
                  <div className={`flex-1 flex flex-col items-center justify-center text-center space-y-4 p-6 rounded-3xl border border-dashed ${isQuotaFull ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" : "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800"}`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-4xl shadow-inner ${isQuotaFull ? "bg-green-100 dark:bg-green-900/50" : "bg-indigo-100 dark:bg-indigo-900/50"}`}>{isQuotaFull ? "🎉" : "⚡"}</div>
                    <div>
                      <h4 className={`font-bold text-lg ${isQuotaFull ? "text-green-900 dark:text-green-300" : "text-indigo-900 dark:text-indigo-300"}`}>{isQuotaFull ? "Target Harian Tuntas!" : "Murajaah Beres!"}</h4>
                      <p className={`text-sm mt-1 max-w-xs mx-auto leading-relaxed ${isQuotaFull ? "text-green-800/80 dark:text-green-200/70" : "text-indigo-800/80 dark:text-indigo-200/70"}`}>
                        {isQuotaFull ? `Masya Allah, hari ini kamu produktif banget (Total ${dailyUsed} poin).` : `Jadwal murajaah bersih, sisa kuota ${dailyRemaining} poin.`}
                      </p>
                    </div>
                    <button onClick={() => { audioService.playClick(); onAddClick(); }} className="bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all transform hover:-translate-y-1">
                      + Tambah Hafalan
                    </button>
                  </div>
                ) : (
                  <MurajaahList items={dueItems} onStartReview={onStartReview} />
                )}
              </div>
            ) : (
              <div className="space-y-4 h-full flex flex-col">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg md:text-xl">Daftar Hafalan</h3>
                  <button onClick={() => { audioService.playClick(); exportHafalanToPdf(state); }} className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">PDF</button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2 pb-20 md:pb-0">
                  {allItems.length === 0 ? <div className="text-center py-12 text-slate-400 italic text-sm">Belum ada data.</div> : allItems.map((item) => (
                    <div key={item.id} onClick={() => { audioService.playClick(); setSelectedDetailItem(item); }} className="p-4 rounded-2xl border flex justify-between items-center cursor-pointer hover:shadow-md transition-all bg-white dark:bg-slate-700/30 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-700 group">
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-indigo-700 dark:group-hover:text-indigo-400">{item.surahName} <span className="text-slate-400 dark:text-slate-500 font-normal ml-1 text-xs">({item.startAyah}-{item.endAyah})</span></p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center font-medium"><span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${item.stage >= 5 ? "bg-green-500" : "bg-amber-500"}`}></span>Next: {formatDate(item.nextReviewDate)}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wide border ${item.stage >= 5 ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600"}`}>{item.stage >= 5 ? "Mutqin" : `Lvl ${item.stage}`}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (Stats & Gamification) */}
        <div className={`md:col-span-1 space-y-6 ${activeTab === "profile" ? "block" : "hidden md:block"}`}>
          <ProgressChart items={state.items} />

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><span className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">⚔️</span> Weekly Challenge</h4>
            <div className="mt-2">
              <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-slate-500 dark:text-slate-400">Progress</span><span className="text-orange-600 dark:text-orange-400">{state.gamification.weeklyChallengeProgress} / {state.gamification.weeklyChallengeTarget} XP</span></div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden"><div className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(249,115,22,0.4)]" style={{ width: `${challengePercent}%` }}></div></div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h4 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><span className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600">🏅</span> Koleksi Badge</h4>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((badge) => (
                <div key={badge.id} className={`aspect-square rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${state.gamification.badges.includes(badge.id) ? "bg-linear-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800 shadow-sm scale-100" : "bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-40 grayscale scale-95"}`} title={badge.name}>
                    {badge.icon}
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { audioService.playClick(); onLogout(); }} className="w-full py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Ganti Akun / Keluar</button>
        </div>

        {/* GUIDE TAB (Mobile Only usually) */}
        <div className={`md:col-span-3 transition-opacity duration-500 ${activeTab === "guide" ? "block" : "hidden md:block"}`}>
            <div className="md:mt-8 md:border-t md:border-slate-200 md:dark:border-slate-700 md:pt-0">
                <FAQ title="Panduan" subtitle="Metode SRS NIZAMY" data={HAFALAN_FAQ} />
            </div>
        </div>
      </div>

      <button onClick={() => { audioService.playClick(); onAddClick(); }} className={`md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-500/40 z-60 transition-transform active:scale-90 hover:scale-105 ${activeTab === "profile" || activeTab === "guide" ? "hidden" : "flex items-center justify-center"}`} aria-label="Tambah Hafalan">
            <FaPlus />
      </button>

      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white/55 dark:bg-slate-900/55 border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom))] pt-2 px-2 z-50 flex justify-between items-center"
        style={{
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)'
        }}
      >
        {[
            { id: "schedule", icon: <FaCalendarAlt />, label: "Jadwal" },
            { id: "list", icon: <FaList />, label: "List" },
            { id: "guide", icon: <FaBookOpen />, label: "Panduan" },
            { id: "profile", icon: <FaUser />, label: "Profil" }
        ].map(tab => (
            <button key={tab.id} onClick={() => { audioService.playClick(); setActiveTab(tab.id as TabView); }} className={`flex-1 flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? "text-indigo-600 dark:text-indigo-400 font-bold transform -translate-y-1" : "text-slate-400 dark:text-slate-500 font-medium"}`}>
                <span className="text-lg mb-1">{tab.icon}</span>
                <span className="text-[10px] uppercase tracking-wide">{tab.label}</span>
            </button>
        ))}
      </div>
    </div>
  );
};
