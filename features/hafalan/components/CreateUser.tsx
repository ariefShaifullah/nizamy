
import React, { useState } from 'react';
import type { HafalanSkillLevel } from '../../../types.ts';
import { audioService } from '../../../services/audio.service.ts';
import { FaArrowLeft, FaChevronDown } from 'react-icons/fa';

interface CreateUserProps {
    hasUsers: boolean;
    onBack: () => void;
    onCreate: (name: string, level: HafalanSkillLevel, target: number) => void;
}

export const CreateUser: React.FC<CreateUserProps> = ({ hasUsers, onBack, onCreate }) => {
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
      <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-indigo-100 dark:border-slate-700 animate-fade-in-up mt-8">
        <div className="flex items-center mb-8">
          {hasUsers && (
            <button
              onClick={() => {
                audioService.playClick();
                onBack();
              }}
              className="mr-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 bg-slate-50 dark:bg-slate-700 p-2 rounded-full icon-wrapper w-9 h-9 flex items-center justify-center"
            >
              <FaArrowLeft />
            </button>
          )}
          <h2 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-indigo-300">
            Buat Profil Baru
          </h2>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nama Panggilan
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Abdullah"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
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
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none"
                        : "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-100 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600"
                    }`}
                  >
                    <span className="capitalize font-bold text-sm md:text-base">
                      {lvl === "beginner" ? "Santai" : lvl === "intermediate" ? "Sedang" : "Fokus"}
                    </span>
                    <span className="text-[10px] md:text-xs mt-1 opacity-90">
                      {lvl === "beginner" ? "Ringan (5 Poin)" : lvl === "intermediate" ? "Normal (10 Poin)" : "Intensif (20 Poin)"}
                    </span>
                  </button>
                )
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Fokus Hafalan
            </label>
            <div className="relative">
              <select
                className="w-full border border-slate-300 dark:border-slate-600 rounded-xl p-4 pr-10 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white appearance-none font-medium"
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              >
                <option value={30}>Juz 30 (Juz Amma)</option>
                <option value={29}>Juz 29 (Juz Tabarak)</option>
                <option value={1}>Urut dari Awal (Khatam)</option>
                <option value={114}>Bebas Pilih (Fleksibel)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <span className="icon-wrapper w-5 h-5"><FaChevronDown /></span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {target === 30 && "Surat-surat pendek (An-Naba s.d. An-Nas). Cocok untuk pemula."}
              {target === 29 && "Lanjutan setelah Juz Amma (Al-Mulk s.d. Al-Mursalat)."}
              {target === 1 && "Menghafal urut dari Al-Fatihah, Al-Baqarah, dan seterusnya."}
              {target === 114 && "Pilih surat apapun (Al-Kahfi, Yasin, dll) tanpa batasan urutan."}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none mt-4"
          >
            Mulai Menghafal
          </button>
        </div>
      </div>
    );
};