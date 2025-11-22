
import React from 'react';
import { Modal } from './Modal.tsx';

interface IOSInstallModalProps {
  onClose: () => void;
}

export const IOSInstallModal: React.FC<IOSInstallModalProps> = ({ onClose }) => {
  return (
    <Modal isOpen={true} onClose={onClose} title="Install di iPhone/iPad" maxWidth="max-w-sm">
        <div className="p-6 space-y-4 text-center">
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                Browser Safari di iOS tidak mendukung tombol install otomatis. Silakan ikuti langkah mudah berikut untuk memasang aplikasi:
            </p>
            <div className="space-y-4 mt-4 text-left bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5">1</span>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                        Ketuk ikon <strong>Share</strong> (Bagikan) <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mx-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg> di bar menu bawah Safari.
                    </p>
                </div>
                <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5">2</span>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                        Geser menu ke atas dan pilih <strong>"Add to Home Screen"</strong> (Tambah ke Layar Utama).
                    </p>
                </div>
                 <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-xs mt-0.5">3</span>
                    <p className="text-sm text-slate-700 dark:text-slate-200">
                        Ketuk <strong>Add</strong> (Tambah) di pojok kanan atas layar.
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl mt-2 hover:bg-blue-700 transition-colors shadow-md">
                Saya Mengerti
            </button>
        </div>
    </Modal>
  );
};
