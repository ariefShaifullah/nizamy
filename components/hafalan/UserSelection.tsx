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
    <div className="max-w-4xl mx-auto px-4 animate-fade-in py-8 md:py-10">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 md:mb-3">
          Siapa nih yang mau ngafal?
        </h2>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
          Pilih profil kamu buat lanjut murajaah.
        </p>
      </div>

      {/* Container: Grid 1 col on Mobile (List), Flex Wrap on Desktop (Cards) */}
      <div className="grid grid-cols-1 md:flex md:flex-wrap justify-center gap-3 md:gap-6">
        {users.map((user) => (
          <div key={user.id} className="relative group w-full md:w-auto">
            <button
              onClick={() => {
                audioService.playClick();
                onSelect(user.id);
              }}
              className="flex flex-row md:flex-col items-center w-full md:w-48 p-4 md:p-8 pr-14 md:pr-8 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-sm md:shadow-lg border border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-800 hover:shadow-md md:hover:shadow-2xl md:hover:-translate-y-2 transition-all duration-300 text-left md:text-center relative overflow-hidden"
            >
              {/* Avatar: Small on Mobile, Big on Desktop */}
              <div
                className={`w-12 h-12 md:w-24 md:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-lg md:text-4xl text-white font-bold shadow-md ring-2 md:ring-4 ring-white dark:ring-slate-700 mr-4 md:mr-0 md:mb-4 ${user.avatarColor}`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>

              {/* Text Info */}
              <div className="flex-1 md:w-full px-1 min-w-0">
                <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg truncate">
                  {user.name}
                </h3>
                <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">
                  Level {user.level}
                </p>
              </div>
            </button>

            {/* Delete Button Desktop: Absolute top-right, hover only */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                audioService.playClick();
                if (window.confirm(`Hapus ${user.name}?`)) {
                  onDelete(user.id);
                }
              }}
              className="md:absolute md:top-3 md:right-3 md:opacity-0 md:group-hover:opacity-100 md:transition-all
                           hidden md:block
                           bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-300 shadow-sm"
              title="Hapus User"
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

            {/* Delete Button Mobile: Fixed right position, distinct click area */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                audioService.playClick();
                if (window.confirm(`Hapus ${user.name}?`)) {
                  onDelete(user.id);
                }
              }}
              className="md:hidden absolute top-1/2 -translate-y-1/2 right-2 p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 active:text-red-600 z-10 active:scale-95 transition-transform"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        ))}

        {/* Add User Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onCreateClick();
          }}
          className="flex flex-row md:flex-col items-center justify-center md:justify-start w-full md:w-48 p-4 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group md:space-y-4 space-x-4 md:space-x-0"
        >
          <div className="w-12 h-12 md:w-24 md:h-24 rounded-full flex-shrink-0 flex items-center justify-center text-2xl md:text-4xl text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:text-indigo-400 dark:group-hover:text-indigo-300 transition-colors">
            +
          </div>
          <div className="text-left md:text-center flex-1 md:flex-none">
            <h3 className="font-bold text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
              Tambah User
            </h3>
          </div>
        </button>
      </div>
    </div>
  );
};
