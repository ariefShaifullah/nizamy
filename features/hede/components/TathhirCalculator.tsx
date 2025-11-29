
import React, { useState } from 'react';
import { formatCurrency } from '../../../utils.ts';
import { FaBroom, FaHandHoldingHeart, FaInfoCircle } from 'react-icons/fa';
import { Modal } from '../../../components/ui/Modal.tsx';

export const TathhirCalculator: React.FC = () => {
    const [mode, setMode] = useState<'savings' | 'income'>('savings');
    
    // Savings Mode State
    const [totalSavings, setTotalSavings] = useState(0);
    const [interestAmount, setInterestAmount] = useState(0);
    const [interestPercent, setInterestPercent] = useState(0); // Optional estimation

    // Income Mode State
    const [totalIncome, setTotalIncome] = useState(0);
    const [haramPercentage, setHaramPercentage] = useState(0);

    const [showInfo, setShowInfo] = useState(false);

    // Calculation Logic
    const purgeAmount = mode === 'savings' 
        ? (interestAmount > 0 ? interestAmount : (totalSavings * (interestPercent / 100)))
        : (totalIncome * (haramPercentage / 100));

    const cleanAmount = mode === 'savings'
        ? totalSavings - purgeAmount
        : totalIncome - purgeAmount;

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-12 px-4 md:px-0">
            <div className="bg-linear-to-br from-slate-900 to-slate-800 text-white p-6 md:p-8 rounded-4xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <FaBroom size={100} />
                </div>
                <div className="relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                        <span className="bg-white/20 p-2 rounded-lg"><FaBroom size={20} /></span>
                        Kalkulator Tathhir
                    </h2>
                    <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-lg">
                        Hitung nominal harta non-halal (bunga bank, pendapatan terlarang) yang harus dikeluarkan (dibuang) agar sisa harta Anda menjadi suci dan berkah.
                    </p>
                    <button 
                        onClick={() => setShowInfo(true)}
                        className="mt-4 text-xs font-bold bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors w-fit"
                    >
                        <FaInfoCircle /> Apa itu Tathhirul Mal?
                    </button>
                </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button 
                    onClick={() => setMode('savings')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'savings' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    Bunga Tabungan
                </button>
                <button 
                    onClick={() => setMode('income')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${mode === 'income' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                >
                    Pendapatan
                </button>
            </div>

            {/* Input Section */}
            <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                {mode === 'savings' ? (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Saldo di Bank Konvensional</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Rp 0"
                                value={totalSavings > 0 ? formatCurrency(totalSavings).replace('Rp', '').trim() : ''}
                                onChange={(e) => setTotalSavings(Number(e.target.value.replace(/\D/g, '')))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nominal Bunga (Jika Tahu)</label>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="Rp 0"
                                    value={interestAmount > 0 ? formatCurrency(interestAmount).replace('Rp', '').trim() : ''}
                                    onChange={(e) => {
                                        setInterestAmount(Number(e.target.value.replace(/\D/g, '')));
                                        setInterestPercent(0); // Reset percent if manual amount used
                                    }}
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Atau Estimasi % Bunga</label>
                                <input 
                                    type="number"
                                    inputMode="decimal"
                                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="0"
                                    value={interestPercent > 0 ? interestPercent : ''}
                                    onChange={(e) => {
                                        setInterestPercent(Number(e.target.value));
                                        setInterestAmount(0); // Reset amount if percent used
                                    }}
                                />
                                <span className="absolute right-4 top-[42px] text-slate-400 font-bold">%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                            *Jika Anda tidak tahu nominal pasti bunga yang mengendap, gunakan estimasi persentase rata-rata bunga tabungan (biasanya 0.5% - 1% per tahun).
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Total Pendapatan Bulanan</label>
                            <input 
                                type="text"
                                inputMode="numeric"
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                placeholder="Rp 0"
                                value={totalIncome > 0 ? formatCurrency(totalIncome).replace('Rp', '').trim() : ''}
                                onChange={(e) => setTotalIncome(Number(e.target.value.replace(/\D/g, '')))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Persentase Porsi Kerja Non-Halal</label>
                            <input 
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600 mb-4"
                                value={haramPercentage}
                                onChange={(e) => setHaramPercentage(Number(e.target.value))}
                            />
                            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="text-xs text-slate-500">Geser sesuai porsi tugas yang syubhat</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-lg">{haramPercentage}%</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 italic leading-relaxed">
                            *Contoh: Jika Anda bekerja di Hotel yang menjual alkohol, dan estimasi pendapatan hotel dari alkohol adalah 30%, maka 30% gaji Anda dianggap syubhat/haram.
                        </p>
                    </div>
                )}
            </div>

            {/* Result Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-700">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <h3 className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-widest">Dana Tathhir</h3>
                        <span className="text-[10px] md:text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Wajib Dikeluarkan</span>
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mt-2 truncate">
                        {formatCurrency(purgeAmount)}
                    </div>
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                        Salurkan dana ini untuk fasilitas umum (jalan, jembatan, toilet umum) atau fakir miskin <strong className="text-slate-700 dark:text-slate-300">tanpa mengharap pahala sedekah</strong>, hanya niat membersihkan diri.
                    </p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] md:text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">Sisa Harta Halal</p>
                        <p className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-200 truncate">{formatCurrency(cleanAmount)}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-white/10 p-2.5 rounded-full text-emerald-600 dark:text-emerald-400">
                        <FaHandHoldingHeart size={24} />
                    </div>
                </div>
            </div>

            {/* Modal Info */}
            <Modal isOpen={showInfo} onClose={() => setShowInfo(false)} title="Tentang Tathhirul Mal">
                <div className="p-6 text-slate-700 dark:text-slate-300 text-sm space-y-4">
                    <p>
                        <strong>Tathhirul Mal</strong> adalah proses membersihkan harta dari unsur haram (seperti Riba, hasil judi, atau gaji dari pekerjaan terlarang) yang tercampur dengan harta halal.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border-l-4 border-amber-500">
                        <p className="italic">"Sesungguhnya Allah itu Maha Baik dan tidak menerima kecuali yang baik." (HR. Muslim)</p>
                    </div>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Harta haram <strong>bukan milik kita</strong>, melainkan hak publik/sosial.</li>
                        <li>Tidak boleh digunakan untuk makan, pakaian, atau ibadah (Haji/Umrah).</li>
                        <li>Tidak dihitung dalam nishab Zakat (Zakat hanya dari harta halal).</li>
                        <li>Niatkan saat mengeluarkannya sebagai bentuk taubat dan pelepasan beban dosa, bukan sedekah.</li>
                    </ul>
                    <button 
                        onClick={() => setShowInfo(false)}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold mt-4 hover:bg-indigo-700 shadow-md"
                    >
                        Saya Paham
                    </button>
                </div>
            </Modal>
        </div>
    );
};
