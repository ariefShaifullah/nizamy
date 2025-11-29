
import React from 'react';
import type { UserSummary } from '../../../types.ts';
import { audioService } from '../../../services/audio.service.ts';
import { useConfirm } from '../../../components/ui/ConfirmContext.tsx';
import { FaTrash } from 'react-icons/fa';

interface UserSelectionProps {
    users: UserSummary[];
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
    onCreateClick: () => void;
}

export const UserSelection: React.FC<UserSelectionProps> = ({ users, onSelect, onDelete, onCreateClick }) => {
    const { confirm } = useConfirm();

    const handleDelete = async (e: React.MouseEvent, user: UserSummary) => {
      e.stopPropagation();
      audioService.playClick();
      
      const isConfirmed = await confirm({
        title: 'Hapus Profil?',
        message: `Yakin ingin menghapus profil ${user.name}? Data hafalan akan hilang permanen.`,
        confirmText: 'Hapus',
        cancelText: 'Batal',
        variant: 'danger'
      });

      if (isConfirmed) {
        onDelete(user.id);
      }
    };

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
                <div
                  className={`w-12 h-12 md:w-24 md:h-24 rounded-full shrink-0 flex items-center justify-center text-lg md:text-4xl text-white font-bold shadow-md ring-2 md:ring-4 ring-white dark:ring-slate-700 mr-4 md:mr-0 md:mb-4 ${user.avatarColor}`}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 md:w-full px-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white text-base md:text-lg truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-400 dark:text-slate-500">Level {user.level}</p>
                </div>
              </button>

              <button
                onClick={(e) => handleDelete(e, user)}
                className="md:absolute md:top-3 md:right-3 md:opacity-0 md:group-hover:opacity-100 md:transition-all
                           hidden md:block
                           bg-red-50 dark:bg-red-900/30 text-red-400 dark:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-300 shadow-sm"
                title="Hapus User"
              >
                <span className="icon-wrapper w-4 h-4"><FaTrash /></span>
              </button>
              
               <button
                onClick={(e) => handleDelete(e, user)}
                className="md:hidden absolute top-1/2 -translate-y-1/2 right-2 p-3 text-slate-300 dark:text-slate-600 hover:text-red-500 active:text-red-600 z-10 active:scale-95 transition-transform"
              >
                 <span className="icon-wrapper w-5 h-5"><FaTrash /></span>
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              audioService.playClick();
              onCreateClick();
            }}
            className="flex flex-row md:flex-col items-center justify-center md:justify-start w-full md:w-48 p-4 md:p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all group md:space-y-4 space-x-4 md:space-x-0"
          >
            <div className="w-12 h-12 md:w-24 md:h-24 rounded-full shrink-0 flex items-center justify-center text-2xl md:text-4xl text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:text-indigo-400 dark:group-hover:text-indigo-300 transition-colors">
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