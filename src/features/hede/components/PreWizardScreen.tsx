import React from 'react';
import { FaShieldAlt, FaCheckCircle, FaHeart } from 'react-icons/fa';

interface PreWizardScreenProps {
    onStart: () => void;
    onCancel: () => void;
}

export const PreWizardScreen: React.FC<PreWizardScreenProps> = ({ onStart, onCancel }) => {
    return (
        <div className="fixed inset-0 z-overlay bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 animate-fade-in">
            <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-center border border-slate-100 dark:border-slate-700">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">Bismillah, Mari Periksa Kesehatan Ekonomi Kita.</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 text-sm sm:text-base">Ini adalah alat introspeksi, bukan penghakiman.</p>

                <div className="space-y-3 text-left mb-8 sm:mb-10">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="icon-wrapper w-5 h-5 text-emerald-500 shrink-0 mt-1"><FaCheckCircle /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Jujur & Amanah</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Jawaban Anda akan menentukan akurasi hasil.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="icon-wrapper w-5 h-5 text-blue-500 shrink-0 mt-1"><FaShieldAlt /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">100% Privasi</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Semua data hanya tersimpan di perangkat Anda.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className="icon-wrapper w-5 h-5 text-rose-500 shrink-0 mt-1"><FaHeart /></div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Bukan Menghakimi</h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300">Setiap perjalanan hijrah itu unik.</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={onCancel} className="w-full sm:w-auto px-6 py-3 text-slate-500 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Batal</button>
                    <button onClick={onStart} className="w-full sm:flex-1 py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors shadow-lg">Lanjut, Saya Siap</button>
                </div>
            </div>
        </div>
    );
};
