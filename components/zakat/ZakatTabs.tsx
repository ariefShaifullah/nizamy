
import React from 'react';
import type { ZakatState, ZakatSettings, ZakatResult, ZakatHistoryEntry } from '../../types.ts';
import { ZakatInputField } from './ZakatInputField.tsx';
import { NisabStatus } from './NisabStatus.tsx';
import { formatCurrency } from '../../utils.ts';
import { exportZakatToPdf } from '../../services/pdf.service.ts';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// --- REUSABLE LAYOUT COMPONENT (DRY Implementation) ---

interface ZakatTabLayoutProps {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    onNext?: () => void;
}

const ViewSummaryButton = ({ onClick }: { onClick: () => void }) => (
    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 italic flex items-center order-2 md:order-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Otomatis tersimpan.
        </p>
        <button
            onClick={onClick}
            className="order-1 md:order-2 w-full md:w-auto group flex items-center justify-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/50 font-bold text-sm active:scale-95"
        >
            Lihat Hasil
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
        </button>
    </div>
);

const ZakatTabLayout: React.FC<ZakatTabLayoutProps> = ({ title, subtitle, children, onNext }) => {
    return (
        <div className="space-y-6 animate-fade-in pb-24 md:pb-0">
            {/* Desktop Header */}
            <div className="hidden md:block border-b border-slate-100 dark:border-slate-700 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-400">{title}</h2>
                <p className="text-slate-600 dark:text-slate-300 mt-1">{subtitle}</p>
            </div>
            {/* Mobile Header */}
            <div className="md:hidden mb-2">
                <h2 className="text-lg font-bold text-emerald-800 dark:text-emerald-400">{title}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
            </div>

            {children}

            {onNext && <ViewSummaryButton onClick={onNext} />}
        </div>
    );
};

// --- TAB VIEWS ---

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
            {/* Type Switcher */}
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

// --- SUMMARY VIEW ---

interface SummaryProps {
    result: ZakatResult | null;
    state: ZakatState; 
    history: ZakatHistoryEntry[];
    onSaveHistory: () => void;
    onDownloadPDF: () => void;
    onClearHistory: () => void;
    onLoadHistory: (entry: ZakatHistoryEntry) => void;
    receiptRef: React.RefObject<HTMLDivElement>;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

export const SummaryView: React.FC<SummaryProps> = ({ result, state, history, onSaveHistory, onDownloadPDF, onClearHistory, onLoadHistory, receiptRef }) => {
    if (!result) return null;

    // Prepare Chart Data
    const chartData = [
        { name: 'Fitrah', value: result.items.find(i => i.id === 'fitrah')?.zakatAmount || 0 },
        { name: 'Maal', value: result.items.find(i => i.id === 'maal')?.zakatAmount || 0 },
        { name: 'Emas/Perak', value: (result.items.find(i => i.id === 'gold')?.zakatAmount || 0) + (result.items.find(i => i.id === 'silver')?.zakatAmount || 0) },
        { name: 'Niaga', value: result.items.find(i => i.id === 'business')?.zakatAmount || 0 },
        { name: 'Lainnya', value: (result.items.find(i => i.id === 'agriculture')?.zakatAmount || 0) + (result.items.find(i => i.id === 'livestock')?.zakatAmount || 0) + (result.items.find(i => i.id === 'rikaz')?.zakatAmount || 0) }
    ].filter(item => item.value > 0);

    const hasChartData = chartData.length > 0;

    return (
        <div className="space-y-6 animate-fade-in pb-20 md:pb-12">
            {/* Action Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Ringkasan & Kwitansi</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Dibuat pada: {new Date(result.timestamp).toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={onSaveHistory} className="flex-1 sm:flex-none justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Simpan
                    </button>
                    <button onClick={onDownloadPDF} className="flex-1 sm:flex-none justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold flex items-center shadow-sm transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Unduh PDF
                    </button>
                </div>
            </div>
            
            {/* Receipt Card */}
            <div ref={receiptRef} className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm print:shadow-none print:border-black">
                <div className="border-b-2 border-emerald-500 pb-4 mb-6 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-800 dark:text-emerald-400 tracking-tight">NIZAMY</h3>
                        <p className="text-emerald-600 dark:text-emerald-500 font-medium text-xs md:text-sm tracking-wide uppercase">Kalkulator Zakat Mandiri</p>
                    </div>
                    <div className="text-right hidden sm:block">
                         <p className="text-xs text-slate-400">No. Ref</p>
                         <p className="text-sm font-mono text-slate-600 dark:text-slate-300">{Date.now().toString().slice(-8)}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-4">
                        {result.items.length === 0 && (
                            <div className="text-center text-slate-500 dark:text-slate-400 py-8 italic bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                                Belum ada data zakat yang dimasukkan.
                            </div>
                        )}

                        {result.items.map(item => (
                            <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b border-slate-100 dark:border-slate-700 last:border-0 gap-2">
                                <div className="flex-1 pr-4">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{item.label}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{item.note}</p>
                                    {!item.isNisabReached && item.id !== 'fitrah' && (
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-[10px] uppercase rounded font-bold tracking-wide">
                                            Tidak Wajib (Belum Nisab)
                                        </span>
                                    )}
                                </div>
                                <div className="text-left sm:text-right w-full sm:w-auto bg-slate-50 dark:bg-slate-700/30 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                                    <p className={`font-mono font-bold text-lg ${item.zakatAmount > 0 || item.formattedValue ? 'text-slate-800 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                                        {item.formattedValue ? item.formattedValue : formatCurrency(item.zakatAmount)}
                                    </p>
                                    {item.rate > 0 && (
                                        <p className="text-xs text-slate-400 dark:text-slate-500">Rate: {(item.rate * 100).toFixed(1)}%</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Simple Asset Composition Chart */}
                    {hasChartData && (
                        <div data-html2canvas-ignore="true" className="w-full lg:w-72 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Komposisi Zakat</h5>
                            <div className="w-full h-48 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={60}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value: number) => formatCurrency(value)}
                                            contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full text-xs space-y-1 mt-2">
                                {chartData.map((entry, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[100px]">{entry.name}</span>
                                        </div>
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{((entry.value / chartData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t-2 border-slate-800 dark:border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-lg font-bold text-slate-800 dark:text-white">TOTAL ZAKAT</span>
                        <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 text-right">{result.formattedTotal}</span>
                    </div>
                    <p className="text-left sm:text-right text-xs text-slate-500 dark:text-slate-400 mt-2 italic leading-relaxed">
                        "Ambillah zakat dari sebagian harta mereka, dengan zakat itu kamu membersihkan dan mensucikan mereka..." (At-Taubah: 103)
                    </p>
                </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
                <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Riwayat Tersimpan
                        </h3>
                        <button onClick={onClearHistory} className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium hover:underline">Hapus Semua</button>
                    </div>
                    <div className="grid gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {history.map(entry => (
                            <div key={entry.id} className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center hover:bg-white dark:hover:bg-slate-700/50 hover:shadow-md transition-all group">
                                <div>
                                    <p className="font-bold text-emerald-700 dark:text-emerald-400">{entry.result.formattedTotal}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entry.timestamp}</p>
                                </div>
                                <button 
                                    onClick={() => onLoadHistory(entry)} 
                                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-300 font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg group-hover:border-emerald-200 dark:group-hover:border-emerald-500 transition-colors shadow-sm"
                                >
                                    Muat
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
