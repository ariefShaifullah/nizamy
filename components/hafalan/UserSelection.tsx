import React from "react";
import type { UserSummary } from "../../types.ts";
import { audioService } from "../../services/audio.service.ts";

interface UserSelectionProps {
  users: UserSummary[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onCreateClick: () => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({
  users,
  onSelect,
  onDelete,
  onCreateClick,
}) => {
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
        {users.map((user) => (
          <div key={user.id} className="relative group">
            <button
              onClick={() => {
                audioService.playClick();
                onSelect(user.id);
              }}
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
                audioService.playClick();
                if (window.confirm(`Hapus ${user.name}?`)) {
                  onDelete(user.id);
                }
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
          onClick={() => {
            audioService.playClick();
            onCreateClick();
          }}
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
};
