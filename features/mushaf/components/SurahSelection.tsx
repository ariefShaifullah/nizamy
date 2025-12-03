
import React, { useState, useMemo } from 'react';
import { SURAH_DATA } from '../../../constants.ts';
import { FaSearch, FaArrowRight, FaQuran, FaBookmark, FaStar, FaTrash, FaCertificate, FaMosque } from 'react-icons/fa';
import { useDebounce } from '../../../hooks/useDebounce.ts';
import type { LastReadState, Bookmark } from '../../../types.ts';
import { audioService } from '../../../services/audio.service.ts';

const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40', text: 'text-rose-800 dark:text-rose-200' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', gradient: 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40', text: 'text-indigo-800 dark:text-indigo-200' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', gradient: 'from-sky-100 to-cyan-100 dark:from-sky-900/40 dark:to-cyan-900/40', text: 'text-sky-800 dark:text-sky-200' },
];

// Database Nama Arab Lengkap (114 Surat)
const getArabicName = (name: string) => {
    const map: Record<string, string> = {
        "Al-Fatihah": "الفاتحة",
        "Al-Baqarah": "البقرة",
        "Ali 'Imran": "آل عمران",
        "An-Nisa'": "النساء",
        "Al-Ma'idah": "المائدة",
        "Al-An'am": "الأنعام",
        "Al-A'raf": "الأعراف",
        "Al-Anfal": "الأنفال",
        "At-Taubah": "التوبة",
        "Yunus": "يونس",
        "Hud": "هود",
        "Yusuf": "يوسف",
        "Ar-Ra'd": "الرعد",
        "Ibrahim": "إبراهيم",
        "Al-Hijr": "الحجر",
        "An-Nahl": "النحل",
        "Al-Isra'": "الإسراء",
        "Al-Kahf": "الكهف",
        "Maryam": "مريم",
        "Ta-Ha": "طه",
        "Al-Anbiya'": "الأنبياء",
        "Al-Hajj": "الحج",
        "Al-Mu'minun": "المؤمنون",
        "An-Nur": "النور",
        "Al-Furqan": "الفرقان",
        "Asy-Syu'ara'": "الشعراء",
        "An-Naml": "النمل",
        "Al-Qasas": "القصص",
        "Al-Ankabut": "العنكبوت",
        "Ar-Rum": "الروم",
        "Luqman": "لقمان",
        "As-Sajdah": "السجدة",
        "Al-Ahzab": "الأحزاب",
        "Saba'": "سبأ",
        "Fatir": "فاطر",
        "Ya-Sin": "يس",
        "As-Saffat": "الصافات",
        "Sad": "ص",
        "Az-Zumar": "الزمر",
        "Ghafir": "غافر",
        "Fussilat": "فصلت",
        "Asy-Syura": "الشورى",
        "Az-Zukhruf": "الزخرف",
        "Ad-Dukhan": "الدخان",
        "Al-Jatsiyah": "الجاثية",
        "Al-Ahqaf": "الأحقاف",
        "Muhammad": "محمد",
        "Al-Fath": "الفتح",
        "Al-Hujurat": "الحجرات",
        "Qaf": "ق",
        "Adz-Dzariyat": "الذاريات",
        "At-Tur": "الطور",
        "An-Najm": "النجم",
        "Al-Qamar": "القمر",
        "Ar-Rahman": "الرحمن",
        "Al-Waqi'ah": "الواقعة",
        "Al-Hadid": "الحديد",
        "Al-Mujadilah": "المجادلة",
        "Al-Hasyr": "الحشر",
        "Al-Mumtahanah": "الممتحنة",
        "As-Saff": "الصف",
        "Al-Jumu'ah": "الجمعة",
        "Al-Munafiqun": "المنافقون",
        "At-Taghabun": "التغابن",
        "At-Talaq": "الطلاق",
        "At-Tahrim": "التحريم",
        "Al-Mulk": "الملك",
        "Al-Qalam": "القلم",
        "Al-Haqqah": "الحاقة",
        "Al-Ma'arij": "المعارج",
        "Nuh": "نوح",
        "Al-Jin": "الجن",
        "Al-Muzzammil": "المزمل",
        "Al-Muddatsir": "المدثر",
        "Al-Qiyamah": "القيامة",
        "Al-Insan": "الإنسان",
        "Al-Mursalat": "المرسلات",
        "An-Naba'": "النبأ",
        "An-Nazi'at": "النازعات",
        "'Abasa": "عبس",
        "At-Takwir": "التكوير",
        "Al-Infitar": "الإنفطار",
        "Al-Mutaffifin": "المطففين",
        "Al-Inshiqaq": "الإنشقاق",
        "Al-Buruj": "البروج",
        "At-Tariq": "الطارق",
        "Al-A'la": "الأعلى",
        "Al-Ghashiyah": "الغاشية",
        "Al-Fajr": "الفجر",
        "Al-Balad": "البلد",
        "Asy-Syams": "الشمس",
        "Al-Lail": "الليل",
        "Ad-Duha": "الضحى",
        "Al-Insyirah": "الشرح",
        "At-Tin": "التين",
        "Al-'Alaq": "العلق",
        "Al-Qadr": "القدر",
        "Al-Bayyinah": "البينة",
        "Az-Zalzalah": "الزلزلة",
        "Al-'Adiyat": "العاديات",
        "Al-Qari'ah": "القارعة",
        "At-Takatsur": "التكاثر",
        "Al-'Asr": "العصر",
        "Al-Humazah": "الهمزة",
        "Al-Fil": "الفيل",
        "Quraisy": "قريش",
        "Al-Ma'un": "الماعون",
        "Al-Kautsar": "الكوثر",
        "Al-Kafirun": "الكافرون",
        "An-Nasr": "النصر",
        "Al-Lahab": "المسد",
        "Al-Ikhlas": "الإخلاص",
        "Al-Falaq": "الفلق",
        "An-Nas": "الناس"
    };
    return map[name] || name;
};

interface SurahSelectionProps {
    lastRead: LastReadState | null;
    bookmarks: Bookmark[];
    onSelectSurah: (id: number) => void;
    onJumpToLastRead: () => void;
    onJumpToBookmark: (surahId: number, ayahNumber: number) => void;
    onRemoveBookmark: (bookmarkId: string) => void;
}

export const SurahSelection: React.FC<SurahSelectionProps> = ({ 
    lastRead, bookmarks, onSelectSurah, onJumpToLastRead, onJumpToBookmark, onRemoveBookmark 
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<'surah' | 'bookmark'>('surah');
    const debouncedSearch = useDebounce(searchTerm, 300);

    const lastReadSurah = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surahId) : null;

    const filteredSurahs = useMemo(() => {
        if (!debouncedSearch) return SURAH_DATA;
        const lower = debouncedSearch.toLowerCase();
        return SURAH_DATA.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.number.toString().includes(lower) ||
            s.arti.toLowerCase().includes(lower)
        );
    }, [debouncedSearch]);

    return (
        <div className="animate-fade-in pb-24 max-w-5xl mx-auto px-4 md:px-6 pt-2">
            
            {/* 1. Header & Search */}
            <div className="flex flex-col gap-4 md:gap-6 mb-8">
                {/* Title Section: Hidden on Mobile, Visible on Desktop */}
                <div className="hidden md:flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                            <span className="text-teal-600 dark:text-teal-400 text-3xl"><FaQuran /></span>
                            Mushaf Digital
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium ml-1">
                            Bacaan Al-Quran, Terjemahan & Audio
                        </p>
                    </div>
                </div>

                {/* Hero Card: Last Read */}
                {lastRead && lastReadSurah && !searchTerm && (
                    <div 
                        onClick={() => { audioService.playClick(); onJumpToLastRead(); }}
                        className="relative w-full overflow-hidden bg-linear-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-teal-500/20 cursor-pointer group transform transition-all hover:scale-[1.01] mt-2 md:mt-0"
                    >
                        {/* Decorative Icons Background */}
                        <div className="absolute -right-6 -bottom-10 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                            <FaMosque size={180} />
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-raised">
                            <div className="flex items-center gap-2 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                                <FaBookmark /> Terakhir Dibaca
                            </div>
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-3xl md:text-4xl font-bold mb-1 leading-tight">{lastReadSurah.name}</h3>
                                    <p className="text-teal-100 text-lg font-medium">Ayat {lastRead.ayahNumber}</p>
                                </div>
                                <div className="w-12 h-12 bg-white text-teal-600 rounded-full flex items-center justify-center shadow-lg group-hover:bg-teal-50 transition-colors">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="relative group z-dropdown">
                    <div className="absolute inset-0 bg-teal-500/5 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <FaSearch />
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari surat..."
                            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800 dark:text-white font-medium placeholder-slate-400 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Quick Links (Chips) */}
            {!searchTerm && (
                <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
                    <div className="flex gap-3">
                        {QUICK_LINKS.map((link) => (
                            <button
                                key={link.number}
                                onClick={() => { audioService.playClick(); onSelectSurah(link.number); }}
                                className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-linear-to-br ${link.gradient} ${link.text} border border-white/20 dark:border-white/5 hover:scale-105 transition-transform shadow-sm`}
                            >
                                <span>{link.icon}</span>
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Tab Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
                <button 
                    onClick={() => { audioService.playClick(); setActiveTab('surah'); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'surah' 
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <FaQuran /> Daftar Surat
                </button>
                <button 
                    onClick={() => { audioService.playClick(); setActiveTab('bookmark'); }}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                        activeTab === 'bookmark' 
                        ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    <FaStar /> Penanda <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md ml-1">{bookmarks.length}</span>
                </button>
            </div>

            {/* 4. Content Area */}
            <div className="min-h-[400px]">
                {activeTab === 'surah' ? (
                    <div className="space-y-3">
                        {filteredSurahs.map(surah => (
                            <button
                                key={surah.number}
                                onClick={() => { audioService.playClick(); onSelectSurah(surah.number); }}
                                className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-all group flex items-center gap-4 text-left"
                            >
                                {/* Rub el Hizb Number - Using size prop for wrapper div compatibility */}
                                <div className="relative w-10 h-10 shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    <div className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity drop-shadow-sm">
                                        <FaCertificate size="100%" />
                                    </div>
                                    <span className="absolute text-xs font-bold font-sans text-teal-700 dark:text-teal-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors z-raised">{surah.number}</span>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                                            {surah.name}
                                        </h4>
                                        {/* Arabic Name Placeholder */}
                                        <span className="font-arabic text-xl text-slate-400 dark:text-slate-600 group-hover:text-teal-600/50 dark:group-hover:text-teal-400/50 font-normal">
                                            {getArabicName(surah.name)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{surah.arti}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        <span className="text-xs text-slate-400 dark:text-slate-500">{surah.verses} Ayat</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 rounded">{surah.type}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                        
                        {filteredSurahs.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-slate-400 font-medium">Surat tidak ditemukan.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    // Bookmark View
                    <div className="space-y-3">
                        {bookmarks.length > 0 ? (
                            bookmarks.map(bookmark => {
                                const surah = SURAH_DATA.find(s => s.number === bookmark.surahId);
                                if (!surah) return null;
                                return (
                                    <div key={bookmark.id} className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
                                        <button 
                                            onClick={() => { audioService.playClick(); onJumpToBookmark(bookmark.surahId, bookmark.ayahNumber); }} 
                                            className="flex-1 text-left flex items-center gap-4"
                                        >
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                                <FaStar />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">{surah.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Ayat {bookmark.ayahNumber} • <span className="capitalize">{bookmark.category}</span></p>
                                            </div>
                                        </button>
                                        <button 
                                            onClick={() => { audioService.playClick(); onRemoveBookmark(bookmark.id); }} 
                                            className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                            title="Hapus Penanda"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center px-5 py-20 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl mb-4 text-slate-300 dark:text-slate-600 shadow-sm">
                                    <FaStar />
                                </div>
                                <p className="font-bold text-slate-600 dark:text-slate-300">Belum ada penanda.</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-xs">Tekan lama pada ayat (atau klik titik tiga) saat membaca untuk menyimpan ke sini.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
