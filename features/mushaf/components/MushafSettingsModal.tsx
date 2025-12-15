
import React from 'react';
import { Modal } from '../../../components/ui/Modal.tsx';
import { useMushafSettings } from '../context/MushafContext.tsx';

interface MushafSettingsProps {
    onClose: () => void;
}

export const MushafSettingsModal: React.FC<MushafSettingsProps> = ({ onClose }) => {
    // Consume Context directly
    const { 
        fontSize, setFontSize, 
        showTranslation, setShowTranslation, 
        wordMode, setWordMode 
    } = useMushafSettings();

    return (
        <Modal isOpen={true} onClose={onClose} title="Tampilan Mushaf" maxWidth="max-w-sm">
            <div className="p-6 space-y-6">
                {/* Interaction Mode */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Mode Interaksi</label>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setWordMode(false)}
                            className={`p-3 rounded-xl border text-center transition-all ${!wordMode ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                        >
                            Per Ayat
                        </button>
                        <button 
                            onClick={() => setWordMode(true)}
                            className={`p-3 rounded-xl border text-center transition-all ${wordMode ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                        >
                            Per Kata
                        </button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                        {wordMode ? "Ketuk kata untuk dengar tajwid & makhraj." : "Ketuk ayat untuk dengar murattal full."}
                    </p>
                </div>

                {/* Font Size */}
                <div>
                    <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Ukuran Tulisan</label>
                        <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{fontSize}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="24" 
                        max="60" 
                        step="2"
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-teal-600"
                    />
                    <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded-xl text-center border border-slate-100 dark:border-slate-800 shadow-inner" dir="rtl">
                        <p className="font-arabic leading-[2.2]" style={{ fontSize: `${fontSize}px`, fontFamily: '"Amiri", serif' }}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                    </div>
                </div>

                {/* Translation Toggle */}
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Terjemahan</h4>
                        <p className="text-xs text-slate-500">Bahasa Indonesia</p>
                    </div>
                    <button 
                        onClick={() => setShowTranslation(!showTranslation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showTranslation ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${showTranslation ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors">
                    Tutup
                </button>
            </div>
        </Modal>
    );
};
