
import React, { useState } from 'react';
import { Modal } from '../Modal.tsx';
import { audioService } from '../../services/audio.service.ts';

interface MushafHelpModalProps {
  onClose: () => void;
}

export const MushafHelpModal: React.FC<MushafHelpModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const content = [
    {
      title: "Audio & Murattal",
      desc: "Ketuk ayat satu kali untuk memutar audio ayat penuh.\n\nIngin dengar per kata? Aktifkan 'Mode Kata' di menu Pengaturan (ikon gerigi).",
      icon: "🎧"
    },
    {
      title: "Fitur Tahan (Long Press)",
      desc: "Tekan & tahan lama pada ayat untuk membuka menu rahasia:\n\n• Analisis Hukum Tajwid\n• Salin Teks Arab/Arti\n• Info Surat",
      icon: "👆"
    },
    {
      title: "Navigasi Cepat",
      desc: "Gunakan tombol 'Loncat ke Ayat' di atas untuk berpindah ayat dengan cepat tanpa harus scroll jauh.",
      icon: "🚀"
    }
  ];

  const totalSteps = content.length;
  const current = content[step - 1];

  const handleNext = () => {
      audioService.playClick();
      if (step < totalSteps) {
          setStep(step + 1);
      } else {
          onClose();
      }
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="max-w-sm">
        <div className="text-center pt-6 px-6 pb-2">
            <div className="w-20 h-20 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-sm border-4 border-teal-50 dark:border-teal-800">
                {current.icon}
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {current.title}
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line min-h-[80px]">
                {current.desc}
            </p>
        </div>

        <div className="p-6 pt-2">
            <div className="flex justify-center gap-1 mb-6">
                {content.map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${i + 1 === step ? 'w-6 bg-teal-500' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                    />
                ))}
            </div>

            <button 
                onClick={handleNext}
                className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-200 dark:shadow-none active:scale-95"
            >
                {step < totalSteps ? 'Lanjut' : 'Paham, Ayo Baca!'}
            </button>
        </div>
    </Modal>
  );
};
