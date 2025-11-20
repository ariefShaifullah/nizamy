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
  const totalSteps = 4;

  const content = [
    {
      title: "Selamat Datang di NIZAMY Hafalan",
      desc: "Kami menggunakan metode ilmiah Spaced Repetition System (SRS). Jadwal review Anda akan otomatis diatur pada interval hari ke-1, 3, 7, 14, dan 30 agar hafalan masuk ke ingatan jangka panjang.",
      icon: "🧠",
    },
    {
      title: "Cara Menambah Hafalan",
      desc: "Mulai sedikit demi sedikit. Pilih surat, tentukan rentang ayat (misal 3-5 ayat), lalu hafalkan. Sistem membatasi jumlah ayat harian sesuai level agar tidak kelelahan.",
      icon: "📝",
    },
    {
      title: "Sistem Review (Murajaah)",
      desc: "Saat jadwal review tiba, baca ayat tanpa melihat. Jika lancar, tekan 'Lancar'. Jika ada salah/lupa, tekan 'Lupa'. Kejujuran adalah kunci keberhasilan metode ini.",
      icon: "🔄",
    },
    {
      title: "Gamification & Istiqomah",
      desc: "Kumpulkan XP untuk naik level. Jaga 'Streak' dengan membuka aplikasi setiap hari. Konsistensi lebih penting daripada kecepatan.",
      icon: "🔥",
    },
  ];

  const current = content[step - 1];

  return (
    <Modal isOpen={true} maxWidth="max-w-md">
      <div className="bg-indigo-600 p-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 backdrop-blur-md border border-white/30">
          {current.icon}
        </div>
        <h3 className="text-xl font-bold text-white">{current.title}</h3>
      </div>
      <div className="p-6">
        <p className="text-slate-600 text-center leading-relaxed mb-8 min-h-[80px]">
          {current.desc}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            {content.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i + 1 === step ? "bg-indigo-600" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => (step < totalSteps ? setStep(step + 1) : onClose())}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            {step < totalSteps ? "Lanjut" : "Mulai Menghafal"}
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
            Jadwal Review Berikutnya:
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
            Kapasitas Harian (Level)
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
                    ? "Pemula"
                    : lvl === "intermediate"
                    ? "Menengah"
                    : "Mahir"}
                </span>
                <span className="text-[10px] opacity-80">
                  {lvl === "beginner"
                    ? "Max 5 Ayat"
                    : lvl === "intermediate"
                    ? "Max 10 Ayat"
                    : "Max 20 Ayat"}
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
            <option value={1}>1 Juz (Bebas)</option>
            <option value={5}>5 Juz</option>
            <option value={30}>30 Juz (Khatam)</option>
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
