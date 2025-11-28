import React, { useState, useEffect } from 'react';
import { FaHourglassHalf } from 'react-icons/fa';

const MESSAGES = [
    "Menganalisis jawaban Anda...",
    "Memeriksa potensi Riba & Gharar...",
    "Menyusun peta jalan hijrah...",
    "Insya Allah, hasil diagnosa siap!"
];

export const HedeAnalyzing: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % MESSAGES.length);
        }, 1200); // Change message slightly slower than one full animation cycle

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center animate-fade-in">
            <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-800 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-4 flex items-center justify-center text-purple-400">
                    <span className="icon-wrapper w-8 h-8 flex items-center justify-center text-3xl"><FaHourglassHalf /></span>
                </div>
            </div>
            
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2 transition-opacity duration-500">
                {MESSAGES[messageIndex]}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Mohon tunggu sebentar...
            </p>
        </div>
    );
};