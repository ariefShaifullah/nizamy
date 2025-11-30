
import React from 'react';
import type { ZakatState, ZakatSettings, ZakatResult, ZakatHistoryEntry } from '../../../types.ts';
import { ZakatInputField } from './ZakatInputField.tsx';
import { NisabStatus } from './NisabStatus.tsx';
import { formatCurrency } from '../../../utils.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FaCheck, FaSave, FaFilePdf, FaHistory, FaArrowRight, FaReceipt, FaCopy } from 'react-icons/fa';
import { useToast } from '../../../components/ui/Toast.tsx';

interface ZakatTabLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onNext?: () => void;
}

const ViewSummaryButton = ({ onClick }: { onClick: () => void }) => (
    <div className="hidden md:flex mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic flex items-center order-2 md:order-1">
            <span className="icon-wrapper w-4 h-4 mr-1 text-emerald-500"><FaCheck /></span>
            Otomatis tersimpan.
        </p>
        <button
            onClick={onClick}
            className="order-1 md:order-2 w-full md:w-auto group flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50 font-bold text-sm active:scale-95"
        >
            Lihat Hasil
            <span className="icon-wrapper w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"><FaArrowRight /></span>
        </button>
    </div>
);

const ZakatTabLayout: React.FC<ZakatTabLayoutProps> = ({ title, subtitle, children, onNext }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
            <div className="hidden md:block border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">{title}</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>
            </div>
            <div className="md:hidden mb-2">
                <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">{title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>

            {children}

            {onNext && <ViewSummaryButton onClick={onNext} />}
        </div>
    );
};

interface TabProps {
    state: ZakatState;
    settings: ZakatSettings;
    onChange: (key: keyof ZakatState, value: any) => void;
    onNext: () => void;
}

export const FitrahView: React.FC<TabProps> = ({ state, onChange, onNext }) => (
    <ZakatTabLayout 
        title="Zakat Fitrah" 
        subtitle="Wajib bagi setiap Muslim yang mampu pada bulan Ramadhan untuk mensucikan diri."
        onNext={onNext}
    >
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 md:p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 w-full">
            <ZakatInputField label="Jumlah Orang" value={state.fitrahPeople} onChange={(v) => onChange("fitrahPeople", v)} type="number" />
            <div className="mt-4 w-full">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Metode Pembayaran</label>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <label className={`relative flex items-center w-full cursor-pointer px-4 py-3 rounded-xl border transition-all ${state.fitrahMethod === 'money' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}>
                        <input type="radio" name="fitrahMethod" checked={state.fitrahMethod === 'money'} onChange={() => onChange("fitrahMethod", 'money')} className="hidden"/>
                        <div className="flex items-center justify-center w-full">
                            <span className="font-bold">Uang (Rp)</span>
                        </div>
                    </label>
                    <label className={`relative flex items-center w-full cursor-pointer px-4 py-3 rounded-xl border transition-all ${state.fitrahMethod === 'rice' ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`}>
                        <input type="radio" name="fitrahMethod" checked={state.fitrahMethod === 'rice'} onChange={() => onChange("fitrahMethod", 'rice')} className="hidden"/>
                        <div className="flex items-center justify-center w-full">
                            <span className="font-bold">Beras (Kg)</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    </ZakatTabLayout>
);

export const MaalView: React.FC<TabProps> = ({ state, settings, onChange, onNext }) => {
    const netMaalAssets = Math.max(0, (state.cash + state.savings + state.investments + state.otherAssets) - state.debts);
    const nisabGoldValue = 85 * settings.goldPrice;

    return (
        <ZakatTabLayout
            title="Zakat Maal (Harta)"
            subtitle="Harta yang tersimpan selama 1 tahun (Haul) dan mencapai Nisab (setara 85g Emas)."
            onNext={onNext}
        >
             <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <ZakatInputField label="Uang Tunai / Tabungan" value={state.cash} onChange={(v) => onChange("cash", v)} />
                <ZakatInputField label="Tabungan Berjangka / Deposito" value={state.savings} onChange={(v) => onChange("savings", v)} />
                <ZakatInputField label="Investasi (Saham, Reksadana, Emas Digital)" value={state.investments} onChange={(v) => onChange("investments", v)} />
                <ZakatInputField label="Aset Lain (Properti Sewa, dll)" value={state.otherAssets} onChange={(v) => onChange("otherAssets", v)} />
                
                <div className="md:col-span-2 bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                    <ZakatInputField label="Hutang Jatuh Tempo (Pengurang)" sublabel="Hutang yang harus segera dibayar mengurangi kewajiban zakat." value={state.debts} onChange={(v) => onChange("debts", v)} />
                </div>
                
                <div className="md:col-span-2 pt-6 mt-2 border-t border-slate-100 dark:border-slate-700">
                     <div className="flex items-center mb-2">
                        <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">Zakat Rikaz (Temuan/Hadiah)</h3>
                        <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">Tarif 20%</span>
                     </div>
                     <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-4">Dikenakan untuk harta karun temuan atau hadiah undian tak terduga (tanpa haul).</p>
                     <ZakatInputField label="Nilai Barang Temuan / Hadiah" value={state.rikazValue} onChange={(v) => onChange("rikazValue", v)} />
                </div>
             </div>
             
             <NisabStatus value={netMaalAssets} nisab={nisabGoldValue} label="Zakat Maal" />
        </ZakatTabLayout>
    );
};

export const GoldSilverView: React.FC<TabProps> = ({ state, onChange, onNext }) => (
    <ZakatTabLayout
        title="Zakat Emas & Perak"
        subtitle="Logam mulia yang disimpan sebagai aset/investasi (bukan perhiasan yang dipakai sehari-hari)."
        onNext={onNext}
    >
         <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-yellow-50/50 dark:bg-yellow-900/20 p-4 md:p-6 rounded-2xl border border-yellow-100 dark:border-yellow-800/50">
                <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">🥇</span>
                    <h3 className="font-bold text-yellow-800 dark:text-yellow-200">Emas</h3>
                </div>
                <ZakatInputField label="Berat Emas (Gram)" sublabel="Nisab: 85 gram" value={state.goldWeight} onChange={(v) => onChange("goldWeight", v)} type="number" />
                <NisabStatus value={state.goldWeight} nisab={85} label="Emas" unit="gram" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center mb-4">
                    <span className="text-2xl mr-2">🥈</span>
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Perak</h3>
                </div>
                <ZakatInputField label="Berat Perak (Gram)" sublabel="Nisab: 595 gram" value={state.silverWeight} onChange={(v) => onChange("silverWeight", v)} type="number" />
                <NisabStatus value={state.silverWeight} nisab={595} label="Perak" unit="gram" />
            </div>
         </div>
    </ZakatTabLayout>
);

export const BusinessView: React.FC<TabProps> = ({ state, settings, onChange, onNext }) => {
    const netBusinessAssets = Math.max(0, (state.bizAssets + state.bizInventory) - state.bizLiabilities);
    const nisabGoldValue = 85 * settings.goldPrice;

    return (
        <ZakatTabLayout
            title="Zakat Perniagaan"
            subtitle="Zakat perdagangan yang dihitung dari aset lancar usaha dikurangi hutang jangka pendek."
            onNext={onNext}
        >
             <div className="grid md:grid-cols-1 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <ZakatInputField label="Nilai Aset Lancar (Kas, Bank)" value={state.bizAssets} onChange={(v) => onChange("bizAssets", v)} />
                <ZakatInputField label="Nilai Stok Barang / Persediaan" value={state.bizInventory} onChange={(v) => onChange("bizInventory", v)} />
                <ZakatInputField label="Hutang Usaha Jatuh Tempo" value={state.bizLiabilities} onChange={(v) => onChange("bizLiabilities", v)} />
             </div>
             <NisabStatus value={netBusinessAssets} nisab={nisabGoldValue} label="Zakat Perniagaan" />
        </ZakatTabLayout>
    );
};

export const AgricultureView: React.FC<TabProps> = ({ state, settings, onChange, onNext }) => (
     <ZakatTabLayout
        title="Zakat Pertanian"
        subtitle="Zakat hasil panen (biji-bijian/makanan pokok). Nisab 5 Wasaq (setara 524 Kg Beras)."
        onNext={onNext}
     >
        <div className="bg-green-50 dark:bg-green-900/20 p-4 md:p-6 rounded-2xl border border-green-100 dark:border-green-800">
            <ZakatInputField label="Nilai Hasil Panen (Rupiah)" sublabel="Konversikan total hasil panen ke Rupiah" value={state.agriHarvest} onChange={(v) => onChange("agriHarvest", v)} />
            <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sistem Pengairan</label>
                <select 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm py-3 px-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-emerald-500 focus:border-emerald-500 h-12"
                    value={state.agriMethod}
                    onChange={(e) => onChange("agriMethod", e.target.value)}
                >
                    <option value="natural">Alami / Tadah Hujan (Tarif 10%)</option>
                    <option value="artificial">Irigasi / Berbiaya (Tarif 5%)</option>
                </select>
            </div>
        </div>
        <NisabStatus value={state.agriHarvest} nisab={524 * settings.ricePrice} label="Pertanian" />
     </ZakatTabLayout>
);

export const LivestockView: React.FC<TabProps> = ({ state, settings, onChange, onNext }) => {
    const nisabGoldValue = 85 * settings.goldPrice;
    const isClassic = state.livestockType === 'classic';

    return (
        <ZakatTabLayout
            title="Zakat Peternakan"
            subtitle={isClassic ? "Perhitungan Fiqh Klasik berdasarkan jumlah ekor (Saimah/Digembalakan)." : "Perhitungan komersial berdasarkan nilai jual ternak (Tijarah)."}
            onNext={onNext}
        >
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
                <button 
                    onClick={() => onChange("livestockType", "commercial")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isClassic ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    💰 Komersial (Nilai)
                </button>
                <button 
                    onClick={() => onChange("livestockType", "classic")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isClassic ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    🐏 Klasik (Ekor)
                </button>
            </div>

            {isClassic ? (
                <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 md:p-6 rounded-2xl border border-amber-100 dark:border-amber-800">
                        <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-3">Kambing / Domba</h4>
                        <ZakatInputField label="Jumlah Ekor" sublabel="Nisab: 40 Ekor" value={state.sheepCount} onChange={(v) => onChange("sheepCount", v)} type="number" />
                        
                        {state.sheepCount >= 40 && (
                            <div className="mt-2 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg text-xs text-amber-900 dark:text-amber-100">
                                <strong>Info Nisab:</strong> 40-120 (1 ekor), 121-200 (2 ekor), dst.
                            </div>
                        )}
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 md:p-6 rounded-2xl border border-blue-100 dark:border-blue-800">
                        <h4 className="font-bold text-blue-800 dark:text-blue-200 mb-3">Sapi / Kerbau</h4>
                        <ZakatInputField label="Jumlah Ekor" sublabel="Nisab: 30 Ekor" value={state.cowCount} onChange={(v) => onChange("cowCount", v)} type="number" />
                        
                        {state.cowCount >= 30 && (
                            <div className="mt-2 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg text-xs text-blue-900 dark:text-blue-100">
                                <strong>Info Nisab:</strong> 30-39 (1 Tabi'), 40-59 (1 Musinnah), dst.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 mb-4 flex items-start">
                        <span className="text-xl mr-2">💡</span>
                        <p>Gunakan mode ini jika ternak Anda adalah <strong>aset dagang</strong> atau <strong>dikandangkan (diberi pakan beli)</strong>, di mana zakatnya dihitung setara zakat perniagaan (2.5%).</p>
                    </div>
                    <ZakatInputField label="Total Nilai Hewan Ternak (Rp)" value={state.livestockValue} onChange={(v) => onChange("livestockValue", v)} />
                    <NisabStatus value={state.livestockValue} nisab={nisabGoldValue} label="Peternakan" />
                </div>
            )}
        </ZakatTabLayout>
    );
};

interface SummaryProps {
    result: ZakatResult | null;
    state: ZakatState; 
    history: ZakatHistoryEntry[];
    onSaveHistory: () => void;
    onDownloadPDF: () => void;
    onClearHistory: () => void;
    onLoadHistory: (entry: ZakatHistoryEntry) => void;
}

const SUMMARY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const SummaryView: React.FC<SummaryProps> = ({ result, state, history, onSaveHistory, onDownloadPDF, onClearHistory, onLoadHistory }) => {
    const { showToast } = useToast();
    if (!result) return null;

    const chartData = [
        { name: 'Fitrah', value: result.items.find(i => i.id === 'fitrah')?.zakatAmount || 0 },
        { name: 'Maal', value: result.items.find(i => i.id === 'maal')?.zakatAmount || 0 },
        { name: 'Emas/Perak', value: (result.items.find(i => i.id === 'gold')?.zakatAmount || 0) + (result.items.find(i => i.id === 'silver')?.zakatAmount || 0) },
        { name: 'Niaga', value: result.items.find(i => i.id === 'business')?.zakatAmount || 0 },
        { name: 'Lainnya', value: (result.items.find(i => i.id === 'agriculture')?.zakatAmount || 0) + (result.items.find(i => i.id === 'livestock')?.zakatAmount || 0) + (result.items.find(i => i.id === 'rikaz')?.zakatAmount || 0) }
    ].filter(item => item.value > 0);

    const hasChartData = chartData.length > 0;

    const copyTotalToClipboard = () => {
        // Extract raw number for ease of payment
        if (result.totalZakat > 0) {
            navigator.clipboard.writeText(result.totalZakat.toString()).then(() => {
                showToast("Nominal disalin! Siap ditempel di m-Banking.", "success");
            });
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-20 md:pb-12">
            
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Ringkasan & Kwitansi</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Dibuat pada: {new Date(result.timestamp).toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
                    </p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={onSaveHistory} className="flex-1 sm:flex-none justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors">
                        <span className="icon-wrapper w-4 h-4 mr-2"><FaSave /></span>
                        Simpan
                    </button>
                    <button onClick={onDownloadPDF} className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors">
                        <span className="icon-wrapper w-4 h-4 mr-2"><FaFilePdf /></span>
                        Unduh PDF
                    </button>
                </div>
            </div>
            
            {/* Digital Receipt Card */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-0 overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none transition-all duration-300">
                 
                 {/* Receipt Header */}
                 <div className="bg-emerald-600 p-6 md:p-8 text-white flex justify-between items-start relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 p-4 opacity-10 transform rotate-12 scale-150 pointer-events-none">
                        <span className="text-9xl"><FaReceipt /></span>
                    </div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="relative z-10">
                        <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mb-1">Hasil Perhitungan</p>
                        <h3 className="text-3xl font-black tracking-tight drop-shadow-md">Kwitansi Zakat</h3>
                    </div>
                    <div className="text-right relative z-10 hidden sm:block">
                        <div className="bg-emerald-700/50 p-2 px-3 rounded-lg backdrop-blur-sm border border-emerald-500/30">
                            <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-wider mb-0.5">Total Kewajiban</p>
                            <p className="text-xl font-bold font-mono">{result.formattedTotal}</p>
                        </div>
                    </div>
                 </div>

                 {/* Receipt Body */}
                 <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        {/* Left: Detail List */}
                        <div className="flex-1 space-y-5">
                            {result.items.length === 0 && (
                                <div className="text-center text-slate-500 dark:text-slate-400 py-12 italic bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    Belum ada data zakat yang dimasukkan.
                                </div>
                            )}

                            {result.items.map(item => (
                                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 gap-2 group">
                                    <div className="flex-1 pr-4">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{item.label}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.note}</p>
                                    </div>
                                    <div className="text-left sm:text-right w-full sm:w-auto">
                                        <p className={`font-mono font-bold text-lg ${item.zakatAmount > 0 || item.formattedValue ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                                            {item.formattedValue ? item.formattedValue : formatCurrency(item.zakatAmount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            
                            <div className="sm:hidden mt-6 pt-6 border-t-2 border-slate-800 dark:border-slate-200 flex justify-between items-center">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Total Zakat</p>
                                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{result.formattedTotal}</p>
                                </div>
                                {result.totalZakat > 0 && (
                                    <button 
                                        onClick={copyTotalToClipboard} 
                                        className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl active:scale-90 transition-transform"
                                        title="Salin Nominal"
                                    >
                                        <FaCopy />
                                    </button>
                                )}
                            </div>
                            
                            {/* Desktop Copy Button Area */}
                            <div className="hidden sm:flex justify-end mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                {result.totalZakat > 0 && (
                                    <button 
                                        onClick={copyTotalToClipboard} 
                                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                                    >
                                        <FaCopy /> Salin Nominal
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Right: Chart */}
                        {hasChartData && (
                            <div className="w-full lg:w-72 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shrink-0">
                                <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-6">Komposisi Zakat</h5>
                                <div className="w-full h-48 relative">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={50}
                                                outerRadius={70}
                                                paddingAngle={5}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={SUMMARY_COLORS[index % SUMMARY_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value: number) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: '#1e293b', fontWeight: 'bold' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    {/* Center Text in Donut */}
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                                        <span className="text-xs font-bold text-slate-400">Total</span>
                                        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{chartData.length} Jenis</span>
                                    </div>
                                </div>
                                <div className="w-full text-xs space-y-2 mt-4">
                                    {chartData.map((entry, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: SUMMARY_COLORS[index % SUMMARY_COLORS.length] }}></span>
                                                <span className="text-slate-600 dark:text-slate-300 font-medium truncate max-w-[100px]">{entry.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-800 dark:text-slate-200">{((entry.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                 </div>
                 
                 {/* Footer Quote */}
                 <div className="bg-slate-50 dark:bg-slate-900/80 px-6 py-4 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                        "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..." (QS. At-Taubah: 103)
                    </p>
                 </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            <span className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mr-3 text-slate-500"><FaHistory /></span>
                            Riwayat Tersimpan
                        </h3>
                        <button onClick={onClearHistory} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-lg transition-colors">
                            Hapus Semua
                        </button>
                    </div>
                    <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {history.map(entry => (
                            <div key={entry.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:border-emerald-200 dark:hover:border-emerald-800 hover:shadow-md transition-all group">
                                <div>
                                    <p className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">{entry.result.formattedTotal}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{entry.timestamp}</p>
                                </div>
                                <button 
                                    onClick={() => onLoadHistory(entry)} 
                                    className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >
                                    Muat Kembali
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
