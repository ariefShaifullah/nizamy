import React, { useState } from "react";
import type { HafalanSkillLevel } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";

interface CreateUserProps {
  hasUsers: boolean;
  onBack: () => void;
  onCreate: (name: string, level: HafalanSkillLevel, target: number) => void;
}

export const CreateUser: React.FC<CreateUserProps> = ({
  hasUsers,
  onBack,
  onCreate,
}) => {
  const [name, setName] = useState("");
  const [level, setLevel] = useState<HafalanSkillLevel>("beginner");
  const [target, setTarget] = useState(30);

  const handleCreate = () => {
    if (!name.trim()) return alert("Nama wajib diisi");
    audioService.playSuccess();
    onCreate(name, level, target);
    setName("");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-fade-in-up mt-8">
      <div className="flex items-center mb-8">
        {hasUsers && (
          <button
            onClick={() => {
              audioService.playClick();
              onBack();
            }}
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Abdullah"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
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
                className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                  level === lvl
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
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Target Hafalan
          </label>
          <select
            className="w-full border border-slate-300 rounded-xl p-4 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
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
          onClick={handleCreate}
          className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4"
        >
          Mulai Menghafal
        </button>
      </div>
    </div>
  );
};
