import React, { useState, useMemo } from 'react';
import { SURAH_DATA } from '../../../constants.ts';
import { FaSearch, FaArrowRight, FaQuran, FaBookmark, FaStar, FaTrash, FaHeart, FaBrain, FaBookOpen } from 'react-icons/fa';
import { useDebounce } from '../../../hooks/useDebounce.ts';
import type { LastReadState, Bookmark, BookmarkCategory } from '../../../types.ts';
import { Modal } from '../../../components/ui/Modal.tsx';

const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40', text: 'text-rose-800 dark:text-rose-200' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', gradient: 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40', text: 'text-indigo-800 dark:text-indigo-200' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', gradient: 'from-sky-100 to-cyan-100 dark:from-sky-900/40 dark:to-cyan-900/40', text: 'text-sky-800 dark:text-sky-200' },
    { number: 78, label: 'Juz 30', icon: '🎓', gradient: 'from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40', text: 'text-violet-800 dark:text-violet-200' }
];

interface SurahSelectionProps {
    lastRead: LastReadState | null;
    bookmarks: Bookmark[];
    onSelectSurah: (id: number) => void;
    onJumpToLastRead: () => void;
    onJumpToBookmark: (surahId: number, ayahNumber: number) => void;
    onRemoveBookmark: (bookmarkId: string) => void;
}

const CATEGORY_CONFIG: Record<BookmarkCategory, { icon: React.ReactNode; label: string; color: string; }> = {
    general: { icon: <FaStar />, label: 'Umum', color: 'amber' },
    favorite: { icon: <FaHeart />, label: 'Favorit', color: 'rose' },
    memorize: { icon: <FaBrain />, label: 'Hafalan', color: 'indigo' },
    study: { icon: <FaBookOpen />, label: 'Tadabbur', color: 'sky' },
};

const BookmarkListModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    bookmarks: Bookmark[];
    onJump: (surahId: number, ayahNumber: number) => void;
    onRemove: (bookmarkId: string) => void;
}> = ({ isOpen, onClose, bookmarks, onJump, onRemove }) => {
    const [activeTab, setActiveTab] = useState<BookmarkCategory | 'all'>('all');

    const filteredBookmarks = useMemo(() => {
        if (activeTab === 'all') return bookmarks;
        return bookmarks.filter(b => b.category === activeTab);
    }, [bookmarks, activeTab]);

    const TABS: { id: BookmarkCategory | 'all'; label: string; }[] = [
        { id: 'all', label: 'Semua' },
        { id: 'favorite', label: 'Favorit' },
        { id: 'memorize', label: 'Hafalan' },
        { id: 'study', label: 'Tadabbur' },
    ];
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Penanda Tersimpan" maxWidth="max-w-md">
            <div className="p-2 flex flex-col h-[70vh] max-h-[500px]">
                <div className="shrink-0 p-2 space-x-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {filteredBookmarks.length > 0 ? (
                    <div className="overflow-y-auto custom-scrollbar space-y-2 p-2">
                        {filteredBookmarks.map(bookmark => {
                            const surah = SURAH_DATA.find(s => s.number === bookmark.surahId);
                            if (!surah) return null;
                            const category = CATEGORY_CONFIG[bookmark.category || 'general'];
                            const colorClasses = `bg-${category.color}-100 text-${category.color}-600 dark:bg-${category.color}-900/30 dark:text-${category.color}-400`;

                            return (
                                <div key={bookmark.id} className="group bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                    <button onClick={() => { onJump(bookmark.surahId, bookmark.ayahNumber); onClose(); }} className="flex-1 text-left flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                                            {category.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600">{surah.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Ayat {bookmark.ayahNumber}</p>
                                        </div>
                                    </button>
                                    <button onClick={() => onRemove(bookmark.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                                        <FaTrash />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400 flex-1 flex flex-col justify-center">
                        <p className="text-4xl mb-4">⭐</p>
                        <p className="font-medium">Belum ada penanda.</p>
                        <p className="text-xs mt-1">Tekan lama/titik tiga pada ayat untuk menyimpan.</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export const SurahSelection: React.FC<SurahSelectionProps> = ({ lastRead, bookmarks, onSelectSurah, onJumpToLastRead, onJumpToBookmark, onRemoveBookmark }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
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
        <div className="animate-fade-in pb-20 max-w-5xl mx-auto px-4 md:px-6 pt-0 md:pt-2">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mt-0 md:mt-6 mb-6 md:mb-8">
                <div className="hidden md:block">
                    <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="text-teal-600 dark:text-teal-400"><FaQuran /></span>
                        Mushaf Digital
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 font-medium">
                        Bacaan Al-Quran interaktif dengan audio per kata & tajwid.
                    </p>
                </div>
                
                <div className="relative w-full md:w-72 group z-10">
                    <div className="absolute inset-0 bg-teal-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative">
                        <span className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-teal-500 transition-colors">
                            <FaSearch />
                        </span>
                        <input 
                            type="text"
                            placeholder="Cari surat..."
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800 dark:text-white font-medium placeholder-slate-400 shadow-sm md:shadow-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {!searchTerm && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    {lastRead && lastReadSurah && (
                        <button 
                            onClick={onJumpToLastRead}
                            className="w-full relative overflow-hidden bg-linear-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl shadow-slate-200/50 dark:shadow-none group text-left border border-slate-700"
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/20 rounded-full blur-[50px] translate-x-10 -translate-y-10 group-hover:bg-teal-500/30 transition-all duration-700"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-widest mb-2">
                                        <FaBookmark />
                                        Terakhir Dibaca
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold mb-1">{lastReadSurah.name}</h3>
                                    <p className="text-slate-400 text-sm font-medium">Ayat {lastRead.ayahNumber}</p>
                                </div>
                                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform border border-white/10 text-white">
                                    <FaArrowRight />
                                </div>
                            </div>
                        </button>
                    )}
                     <button 
                        onClick={() => setIsBookmarkModalOpen(true)}
                        className="w-full relative overflow-hidden bg-linear-to-r from-amber-500 to-yellow-600 rounded-3xl p-6 text-white shadow-xl shadow-amber-200/50 dark:shadow-none group text-left border border-amber-400"
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-[50px] translate-x-10 -translate-y-10 group-hover:bg-white/20 transition-all duration-700"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 text-yellow-200 text-xs font-bold uppercase tracking-widest mb-2">
                                    <FaStar />
                                    Penanda Tersimpan
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold">Lihat Daftar</h3>
                                <p className="text-yellow-100/80 text-sm font-medium">{bookmarks.length} Penanda</p>
                            </div>
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform border border-white/10 text-white">
                                <FaArrowRight />
                            </div>
                        </div>
                    </button>
                </div>
            )}

            {!searchTerm && (
                <div className="mb-8">
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Jalan Pintas</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {QUICK_LINKS.map((link) => (
                            <button
                                key={link.number}
                                onClick={() => onSelectSurah(link.number)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl font-bold text-sm bg-linear-to-br ${link.gradient} ${link.text} hover:-translate-y-1 transition-transform shadow-sm border border-white/20 dark:border-white/5`}
                            >
                                <span className="text-2xl mb-2">{link.icon}</span>
                                {link.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                {!searchTerm && <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Daftar Surat</h4>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredSurahs.map(surah => (
                        <button
                            key={surah.number}
                            onClick={() => onSelectSurah(surah.number)}
                            className="group relative bg-white dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-800 text-left flex items-center gap-4"
                        >
                            <div className="w-12 h-12 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-serif font-bold flex items-center justify-center group-hover:bg-teal-500 group-hover:text-white transition-colors text-lg">
                                {surah.number}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                                        {surah.name}
                                    </h4>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800">
                                        {surah.type}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                                    {surah.arti} • {surah.verses} Ayat
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
                
                {filteredSurahs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-slate-400 font-medium">Surat tidak ditemukan.</p>
                    </div>
                )}
            </div>
            <BookmarkListModal
                isOpen={isBookmarkModalOpen}
                onClose={() => setIsBookmarkModalOpen(false)}
                bookmarks={bookmarks}
                onJump={onJumpToBookmark}
                onRemove={onRemoveBookmark}
            />
        </div>
    );
};