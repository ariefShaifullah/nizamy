import React, { useState, useEffect } from "react";
import { Modal } from "./Modal.tsx";
import type {
  HafalanItem,
  HafalanProfile,
  HafalanSkillLevel,
} from "../types.ts";
import { BADGES } from "../constants.ts";
import { audioService } from "../services/audio.service.ts";

// --- HELPER ---
const formatSafeDate = (dateStr: string) => {
  if (!dateStr) return "-";
  // Explicitly split YYYY-MM-DD and construct date at 12:00 Noon to prevent
  // midnight timezone shifting issues (e.g., becoming previous day).
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// --- TUTORIAL MODAL ---
export const HafalanTutorialModal: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const [step, setStep] = useState(1);

  const content = [
    {
      title: "Ahlan wa Sahlan!",
      desc: "Anggap aja aplikasi ini kayak 'Asisten Pribadi' hafalan kamu. Gak perlu pusing nyatet manual kapan harus ngulang ayat. Biar sistem pintar kita yang atur jadwalnya.",
      icon: "👋",
    },
    {
      title: "Mulai Pelan-pelan",
      desc: "Kunci hafalan kuat itu 'Sedikit tapi Rutin'. Jangan langsung banyak. Tambah 3-5 ayat dulu per hari. Otak kita butuh waktu buat mindahin hafalan ke ingatan jangka panjang.",
      icon: "🌱",
    },
    {
      title: "Kuncinya Jujur",
      desc: "Pas jadwal Murajaah (Mengulang) dateng, baca ayat tanpa ngintip teks.\n\n• Tekan 'Lancar' kalau bacaan kamu ngalir.\n• Tekan 'Lupa' kalau sempet berhenti, ragu, atau salah tajwid.",
      icon: "🔑",
    },
    {
      title: "Kenapa Harus Jujur?",
      desc: "Kalau kamu tekan 'Lupa', asisten ini bakal minta kamu ulang lagi besok sampai lancar.\n\nKalau 'Lancar', jadwal Murajaah berikutnya bakal makin lama (3 hari, seminggu, sebulan). Ini rahasianya biar hafalan awet!",
      icon: "🧠",
    },
    {
      title: "Siap Jadi Hafiz?",
      desc: "Kumpulin Poin (XP) dan jaga 'Streak' (Hadir Tiap Hari). Jadiin Al-Quran sahabat kamu tiap hari. Yuk kita mulai!",
      icon: "🚀",
    },
  ];

  const totalSteps = content.length;
  const current = content[step - 1];

  return (
    <Modal isOpen={true} maxWidth="max-w-md">
      <div className="bg-indigo-600 p-6 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
          aria-label="Tutup Tutorial"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 backdrop-blur-md border border-white/30 animate-bounce-slow">
          {current.icon}
        </div>
        <h3 className="text-xl font-bold text-white">{current.title}</h3>
      </div>
      <div className="p-6">
        <p className="text-slate-600 text-center leading-relaxed mb-8 min-h-[100px] whitespace-pre-line text-sm md:text-base">
          {current.desc}
        </p>

        <div className="flex flex-col gap-6">
          <div className="flex justify-center space-x-1.5">
            {content.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step ? "w-6 bg-indigo-600" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-slate-600 font-semibold text-sm transition-colors"
            >
              Lewati
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                step < totalSteps ? setStep(step + 1) : onClose();
              }}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl transform hover:-translate-y-0.5 text-center"
            >
              {step < totalSteps ? "Lanjut →" : "Bismillah, Mulai!"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// --- DETAIL MODAL ---
interface DetailModalProps {
  item: HafalanItem;
  onClose: () => void;
  onPractice: () => void;
}

export const HafalanDetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  onPractice,
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${item.surahName}: Ayat ${item.startAyah} - ${item.endAyah}`}
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-3 rounded-lg text-center border border-indigo-100">
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">
              Level SRS
            </p>
            <p className="text-2xl font-bold text-indigo-900">{item.stage}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center border border-orange-100">
            <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">
              Total Lupa
            </p>
            <p className="text-2xl font-bold text-orange-900">
              {item.errorCount}x
            </p>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-sm text-slate-600 mb-1">
            Jadwal Murajaah Berikutnya:
          </p>
          <p className="font-bold text-slate-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-indigo-500"
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
            {formatSafeDate(item.nextReviewDate)}
          </p>
        </div>

        <p className="text-xs text-slate-500 italic text-center">
          Pengen baca ulang atau tes mandiri tanpa ngubah jadwal? Pake mode
          latihan aja.
        </p>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onPractice}
            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md flex justify-center items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Latihan Bebas
          </button>
        </div>
      </div>
    </Modal>
  );
};

// --- SETTINGS MODAL ---
interface SettingsModalProps {
  currentProfile: HafalanProfile;
  onClose: () => void;
  onSave: (updates: {
    name: string;
    skillLevel: HafalanSkillLevel;
    targetJuz: number;
  }) => void;
}

export const HafalanSettingsModal: React.FC<SettingsModalProps> = ({
  currentProfile,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(currentProfile.name);
  const [level, setLevel] = useState<HafalanSkillLevel>(
    currentProfile.skillLevel
  );
  const [target, setTarget] = useState(currentProfile.targetJuz);

  const handleSave = () => {
    if (!name.trim()) return alert("Nama tidak boleh kosong");
    onSave({ name, skillLevel: level, targetJuz: target });
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Pengaturan Profil"
      maxWidth="max-w-lg"
    >
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Nama Panggilan
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 rounded-lg p-3 bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Beban Harian (Kecepatan)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["beginner", "intermediate", "advanced"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => {
                  audioService.playClick();
                  setLevel(lvl);
                }}
                className={`p-3 rounded-lg border text-sm transition-colors ${
                  level === lvl
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="capitalize block font-bold">
                  {lvl === "beginner"
                    ? "Santai"
                    : lvl === "intermediate"
                    ? "Sedang"
                    : "Fokus"}
                </span>
                <span className="text-[10px] opacity-80">
                  {lvl === "beginner"
                    ? "Ringan (5 Ayat)"
                    : lvl === "intermediate"
                    ? "Normal (10 Ayat)"
                    : "Intensif (20 Ayat)"}
                </span>
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2 italic">
            Ubah level bakal nyesuain batas maksimal ayat harian kamu. Tenang
            aja, data lama gak akan ilang kok.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Target Hafalan
          </label>
          <select
            className="w-full border border-slate-300 rounded-lg p-3 bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          >
            <option value={30}>Juz 30 (Juz Amma)</option>
            <option value={29}>Juz 29 (Tabarak)</option>
            <option value={1}>Juz 1 (Al-Baqarah)</option>
            <option value={114}>30 Juz (Khatam)</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Simpan Perubahan
        </button>
      </div>
    </Modal>
  );
};

// --- CELEBRATION MODAL (NEW) ---
interface CelebrationModalProps {
  badges: string[];
  onClose: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  badges,
  onClose,
}) => {
  // Play Sound on Mount
  useEffect(() => {
    audioService.playBadgeUnlock();
  }, []);

  // Find badge details
  const earnedBadges = badges
    .map((id) => BADGES.find((b) => b.id === id))
    .filter(Boolean);

  if (earnedBadges.length === 0) return null;

  return (
    <Modal isOpen={true} maxWidth="max-w-sm">
      <div className="text-center p-6 relative overflow-hidden">
        {/* Simple CSS Confetti Background effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
          <div
            className="absolute top-[-10px] left-[20%] w-2 h-2 bg-red-400 rounded-full animate-bounce"
            style={{ animationDuration: "2s" }}
          ></div>
          <div
            className="absolute top-[-10px] left-[50%] w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
            style={{ animationDuration: "1.5s", animationDelay: "0.2s" }}
          ></div>
          <div
            className="absolute top-[-10px] left-[80%] w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDuration: "2.2s", animationDelay: "0.5s" }}
          ></div>
        </div>

        <div className="w-24 h-24 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-5xl mb-4 shadow-lg border-4 border-yellow-200 animate-pulse">
          🏆
        </div>

        <h2 className="text-2xl font-extrabold text-slate-800 mb-1">
          Masya Allah!
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          Kamu baru saja membuka pencapaian baru.
        </p>

        <div className="space-y-3 mb-8">
          {earnedBadges.map((badge, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-indigo-50 to-white p-4 rounded-xl border border-indigo-100 flex items-center gap-4 text-left shadow-sm transform hover:scale-105 transition-transform"
            >
              <div className="text-3xl filter drop-shadow-sm">
                {badge?.icon}
              </div>
              <div>
                <h4 className="font-bold text-indigo-900">{badge?.name}</h4>
                <p className="text-xs text-slate-500">{badge?.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 active:scale-95"
        >
          Alhamdulillah, Lanjut!
        </button>
      </div>
    </Modal>
  );
};
