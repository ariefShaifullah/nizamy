import React from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';

interface InstallBannerProps {
    onInstall: () => void;
    onClose: () => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onClose }) => (
    <div className="fixed bottom-6 left-4 right-4 z-sticky animate-fade-in-up">
        <div className="bg-slate-900/95 dark:bg-white/95 backdrop-blur-xl text-white dark:text-slate-900 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 ring-1 ring-black/5 max-w-lg mx-auto">
            <div className="flex items-center gap-4 pl-1">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                    <span className="icon-wrapper w-5 h-5"><FaDownload /></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-bold">Pasang Aplikasi</span>
                    <span className="text-[10px] opacity-70">Akses offline lebih cepat</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onInstall} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors shadow-sm">Install</button>
                <button onClick={onClose} className="p-2 opacity-60 hover:opacity-100 transition-opacity"><span className="icon-wrapper w-4 h-4"><FaTimes /></span></button>
            </div>
        </div>
    </div>
);
