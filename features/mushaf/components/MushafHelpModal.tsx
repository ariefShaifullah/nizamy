
import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { audioService } from '../../../services/audio.service.ts';
import { FaTimes, FaHeadphones, FaSearchPlus, FaCog } from 'react-icons/fa';

interface MushafHelpModalProps {
  onClose: () => void;
}

export const MushafHelpModal: React.FC<MushafHelpModalProps> = ({ onClose }) => {
  const [step, setStep] = useState(1);

  const content = [
    {
      title: "Audio & Mode Per Kata",
      desc: "Ketuk ayat untuk memutar Murattal full.\n\nIngin belajar pelafalan? Aktifkan **Mode Per Kata** di menu Pengaturan, lalu ketuk kata Arab untuk mendengar ejaannya.",
      icon: <FaHeadphones />
    },
    {
      title: "Tajwid & Bedah Kata",
      desc: "Tekan & tahan (Long Press) pada ayat atau kata untuk membuka fitur canggih:\n\n✨ Analisis Hukum Tajwid\n🗣️ Bedah Makhraj Huruf\n📖 Detail Arti Kata",
      icon: <FaSearchPlus />
    },
    {
      title: "Personalisasi",
      desc: "Buka menu Pengaturan (ikon gerigi) di pojok kanan atas untuk mengubah ukuran huruf Arab atau menyembunyikan terjemahan agar lebih fokus.",
      icon: <FaCog />
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

  const handleSkip = () => {
      audioService.playClick();
      onClose();
  };

  return (
    <Modal isOpen={true} maxWidth="max-w-md">
        <div className="bg-teal-600 p-6 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            </div>

            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white/60 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 icon-wrapper w-8 h-8 flex items-center justify-center z-10"
                aria-label="Tutup Tutorial"
            >
                <FaTimes />
            </button>
            
            <div className="w-16 h-16 bg-white/20 rounded-2xl rotate-3 flex items-center justify-center text-3xl mx-auto mb-4 backdrop-blur-md border border-white/30 shadow-lg text-white">
                <div className="-rotate-3 icon-wrapper w-8 h-8 flex items-center justify-center">
                    {current.icon}
                </div>
            </div>
            <h3 className="text-xl font-bold text-white drop-shadow-sm relative z-10">{current.title}</h3>
        </div>

        <div className="p-6">
            <div className="min-h-[100px] flex items-center justify-center">
                <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {current.desc.split('**').map((part, i) => 
                        i % 2 === 1 ? <strong key={i} className="text-teal-600 dark:text-teal-400">{part}</strong> : part
                    )}
                </p>
            </div>

            <div className="flex flex-col gap-6 mt-4">
                {/* Indicators */}
                <div className="flex justify-center space-x-2">
                    {content.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 rounded-full transition-all duration-500 ease-out ${i + 1 === step ? 'w-8 bg-teal-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`}
                        />
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={handleSkip}
                        className="px-4 py-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                        Lewati
                    </button>

                    <button 
                        onClick={handleNext}
                        className="flex-1 sm:flex-none px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-teal-200/50 dark:shadow-none transform hover:-translate-y-0.5 text-sm active:scale-95"
                    >
                        {step < totalSteps ? 'Lanjut' : 'Mulai Baca'}
                    </button>
                </div>
            </div>
        </div>
    </Modal>
  );
};
