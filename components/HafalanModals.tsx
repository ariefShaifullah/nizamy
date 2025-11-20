import React, { useState } from "react";
import { Modal } from "./Modal.tsx";
import type {
  HafalanItem,
  HafalanProfile,
  HafalanSkillLevel,
} from "../types.ts";

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
      desc: "Bayangkan aplikasi ini sebagai 'Asisten Pribadi' hafalanmu. Kamu tidak perlu pusing mencatat manual kapan harus mengulang ayat. Biarkan sistem pintar kami yang mengatur jadwalnya untukmu.",
      icon: "👋",
    },
    {
      title: "Mulai dari yang Kecil",
      desc: "Kunci hafalan kuat adalah 'Sedikit tapi Rutin' (Istiqomah). Jangan langsung banyak. Tambahkan 3-5 ayat dulu per hari. Otak kita butuh waktu untuk memindahkan hafalan ke ingatan jangka panjang.",
      icon: "🌱",
    },
    {
      title: "Jujur adalah Kunci",
      desc: "Saat jadwal Murajaah (Mengulang) tiba, bacalah ayat tanpa melihat teks.\n\n• Tekan 'Lancar' jika bacaanmu mengalir tanpa terbata-bata.\n• Tekan 'Lupa' jika kamu sempat berhenti, ragu, atau salah tajwid.",
      icon: "🔑",
    },
    {
      title: "Kenapa Harus Jujur?",
      desc: "Jika kamu tekan 'Lupa', asisten ini akan memintamu mengulang lagi besok sampai lancar.\n\nJika 'Lancar', jadwal Murajaah berikutnya akan makin lama (3 hari, 1 minggu, 1 bulan). Inilah rahasia agar hafalan awet selamanya!",
      icon: "🧠",
    },
    {
      title: "Siap Menjadi Hafiz?",
      desc: "Kumpulkan Poin (XP) dan jaga 'Streak' (Hadir Tiap Hari). Jadikan Al-Quran sahabat setiamu setiap hari. Mari kita mulai!",
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
          className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-1"
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

        <div className="flex justify-between items-center">
          <div className="flex space-x-1.5">
            {content.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 === step ? "w-6 bg-indigo-600" : "w-2 bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (step < totalSteps ? setStep(step + 1) : onClose())}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {step < totalSteps ? "Lanjut →" : "Bismillah, Mulai!"}
          </button>
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
          Ingin membaca ulang atau tes mandiri tanpa mengubah jadwal? Gunakan
          mode latihan.
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
                onClick={() => setLevel(lvl)}
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
            Mengubah level akan menyesuaikan batas maksimal penambahan ayat
            harian Anda. Data hafalan lama tidak akan hilang.
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
