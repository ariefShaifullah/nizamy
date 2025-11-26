
import React, { useState } from "react";
import { Modal } from "../Modal.tsx";
import type {
  HafalanProfile,
  HafalanSkillLevel,
} from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";
import { notificationService } from "../../services/notification.service.ts";

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
  
  // Notification State
  const [notifEnabled, setNotifEnabled] = useState(notificationService.isEnabled());

  const handleSave = () => {
    if (!name.trim()) return alert("Nama tidak boleh kosong");
    onSave({ name, skillLevel: level, targetJuz: target });
  };

  const handleToggleNotif = async () => {
    audioService.playClick();
    
    if (!notifEnabled) {
      // Try enabling
      const permissionState = notificationService.getPermissionState();
      
      if (permissionState === 'denied') {
          alert('Izin notifikasi telah diblokir di browser ini. Silakan buka pengaturan situs (ikon gembok di URL bar) dan izinkan notifikasi secara manual.');
          return;
      }

      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotifEnabled(true);
        notificationService.sendTestNotification(); // Send explicit feedback
      } else {
        // Handle dismissal or new denial
        setNotifEnabled(false);
      }
    } else {
      // Disabling is just a logic switch in our app, we can't revoke browser permission via JS
      notificationService.setEnabled(false);
      setNotifEnabled(false);
    }
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
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nama Panggilan
          </label>
          <input
            type="text"
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
                    : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
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
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fokus Hafalan
          </label>
          <select
            className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          >
            <option value={30}>Juz 30 (Juz Amma)</option>
            <option value={29}>Juz 29 (Juz Tabarak)</option>
            <option value={1}>Urut dari Awal (Khatam)</option>
            <option value={114}>Bebas Pilih (Fleksibel)</option>
          </select>
        </div>

        {/* NOTIFICATION TOGGLE */}
        {notificationService.isSupported() && (
            <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Notifikasi & Badge</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Tampilkan tanda titik merah di ikon aplikasi & pengingat harian.
                    </p>
                </div>
                <button 
                    onClick={handleToggleNotif}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${notifEnabled ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-600'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        )}

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
