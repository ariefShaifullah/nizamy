
import React, { useState, useMemo, useEffect } from 'react';
import { SURAH_DATA, ARABIC_SURAH_NAMES } from '../../../constants.ts';
import { FaSearch, FaArrowRight, FaQuran, FaBookmark, FaStar, FaTrash, FaCertificate, FaMosque, FaSpinner, FaTimes, FaList, FaBookOpen } from 'react-icons/fa';
import { useDebounce } from '../../../hooks/useDebounce.ts';
import type { LastReadState, Bookmark, SearchResultItem } from '../../../types.ts';
import { audioService } from '../../../services/audio.service.ts';
import { searchQuranText } from '../logic/mushaf.service.ts';

// Data Quick Links (Modern UI Chips)
const QUICK_LINKS = [
    { number: 18, label: 'Al-Kahfi', icon: '⛰️', gradient: 'from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40', text: 'text-amber-800 dark:text-amber-200' },
    { number: 36, label: 'Ya-Sin', icon: '❤️', gradient: 'from-rose-100 to-pink-100 dark:from-rose-900/40 dark:to-pink-900/40', text: 'text-rose-800 dark:text-rose-200' },
    { number: 55, label: 'Ar-Rahman', icon: '🎁', gradient: 'from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40', text: 'text-emerald-800 dark:text-emerald-200' },
    { number: 56, label: 'Al-Waqi\'ah', icon: '💰', gradient: 'from-indigo-100 to-blue-100 dark:from-indigo-900/40 dark:to-blue-900/40', text: 'text-indigo-800 dark:text-indigo-200' },
    { number: 67, label: 'Al-Mulk', icon: '🛡️', gradient: 'from-sky-100 to-cyan-100 dark:from-sky-900/40 dark:to-cyan-900/40', text: 'text-sky-800 dark:text-sky-200' },
];

interface SurahSelectionProps {
    lastRead: LastReadState | null;
    bookmarks: Bookmark[];
    onSelectSurah: (id: number) => void;
    onJumpToLastRead: () => void;
    onJumpToBookmark: (surahId: number, ayahNumber: number) => void;
    onRemoveBookmark: (bookmarkId: string) => void;
    initialSearchQuery?: string; // New prop for Voice Command
}

export const SurahSelection: React.FC<SurahSelectionProps> = ({ 
    lastRead, bookmarks, onSelectSurah, onJumpToLastRead, onJumpToBookmark, onRemoveBookmark, initialSearchQuery 
}) => {
    const [searchTerm, setSearchTerm] = useState(initialSearchQuery || "");
    const [activeTab, setActiveTab] = useState<'surah' | 'bookmark'>('surah');
    const debouncedSearch = useDebounce(searchTerm, 600); 

    // Sync with prop if it changes (e.g. voice command updates while on page)
    useEffect(() => {
        if (initialSearchQuery) {
            setSearchTerm(initialSearchQuery);
        }
    }, [initialSearchQuery]);

    // --- Search State & Pagination ---
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    
    // Updated State to include total_results
    const [searchMeta, setSearchMeta] = useState<{current_page: number, total_pages: number, total_results: number}>({ 
        current_page: 1, 
        total_pages: 1,
        total_results: 0 
    });
    
    // Check if input contains Arabic characters
    const isArabicInput = useMemo(() => /[\u0600-\u06FF]/.test(debouncedSearch), [debouncedSearch]);
    const lastReadSurah = lastRead ? SURAH_DATA.find(s => s.number === lastRead.surahId) : null;

    // --- 1. LOCAL SEARCH (Surah Names/Numbers) ---
    const matchedSurahs = useMemo(() => {
        if (!debouncedSearch) return [];
        const lower = debouncedSearch.toLowerCase();
        return SURAH_DATA.filter(s => 
            s.name.toLowerCase().includes(lower) || 
            s.number.toString() === lower || // Exact match for number usually better
            s.arti.toLowerCase().includes(lower)
        );
    }, [debouncedSearch]);

    // --- 2. API SEARCH (Verses Text) ---
    useEffect(() => {
        const doSearch = async () => {
            // Trigger API search if query is long enough OR contains Arabic
            const shouldSearchApi = isArabicInput || (debouncedSearch.length >= 3);

            if (!shouldSearchApi) {
                setSearchResults([]);
                return;
            }
            
            setIsSearching(true);
            try {
                // Always start page 1 on new search term
                const data = await searchQuranText(debouncedSearch, 1);
                setSearchResults(data.results);
                setSearchMeta({ 
                    current_page: data.pagination.current_page, 
                    total_pages: data.pagination.total_pages,
                    total_results: data.pagination.total_results 
                });
            } catch (e) {
                console.error(e);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        };

        doSearch();
    }, [debouncedSearch, isArabicInput]);

    // --- HANDLER: Load More ---
    const handleLoadMore = async () => {
        if (isLoadingMore || searchMeta.current_page >= searchMeta.total_pages) return;
        
        setIsLoadingMore(true);
        audioService.playClick();
        
        try {
            const nextPage = searchMeta.current_page + 1;
            const data = await searchQuranText(debouncedSearch, nextPage);
            
            // Append new results
            setSearchResults(prev => [...prev, ...data.results]);
            
            // Update Meta
            setSearchMeta({ 
                current_page: data.pagination.current_page, 
                total_pages: data.pagination.total_pages,
                total_results: data.pagination.total_results
            });
        } catch (e) {
            console.error("Load more failed", e);
        } finally {
            setIsLoadingMore(false);
        }
    };

    const handleJumpToResult = (verseKey: string) => {
        const [surahStr, ayahStr] = verseKey.split(':');
        audioService.playClick();
        onJumpToBookmark(parseInt(surahStr), parseInt(ayahStr));
    };

    // Calculate remaining items for button label
    const remainingItems = searchMeta.total_results - searchResults.length;

    return (
      <div className="animate-fade-in pb-24 max-w-5xl mx-auto px-4 md:px-6 pt-2">
        {/* 1. Header & Search Bar */}
        <div className="flex flex-col gap-4 md:gap-6 mb-8">
          {/* Title (Desktop Only) */}
          <div className="hidden md:flex justify-between items-end">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
                <span className="text-teal-600 dark:text-teal-400 text-3xl">
                  <FaQuran />
                </span>
                Mushaf Digital
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium ml-1">
                Bacaan Al-Quran, Terjemahan & Audio
              </p>
            </div>
          </div>

          {/* Hero Card: Last Read (Hidden when searching) */}
          {lastRead && lastReadSurah && !debouncedSearch && (
            <div
              onClick={() => {
                audioService.playClick();
                onJumpToLastRead();
              }}
              className="relative w-full overflow-hidden bg-linear-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-teal-500/20 cursor-pointer group transform transition-all hover:scale-[1.01] mt-2 md:mt-0 animate-fade-in-down"
            >
              {/* Decorative Background */}
              <div className="absolute -right-6 -bottom-10 opacity-20 transform rotate-12 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700">
                <FaMosque size={180} />
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

              <div className="relative z-raised">
                <div className="flex items-center gap-2 text-teal-100 text-xs font-bold uppercase tracking-widest mb-3 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">
                  <span className="mr-1">
                    <FaBookmark />
                  </span>{" "}
                  Terakhir Dibaca
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-1 leading-tight">
                      {lastReadSurah.name}
                    </h3>
                    <p className="text-teal-100 text-lg font-medium">
                      Ayat {lastRead.ayahNumber}
                    </p>
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
                {isSearching ? (
                  <span className="animate-spin inline-block text-teal-500">
                    <FaSpinner />
                  </span>
                ) : (
                  <FaSearch />
                )}
              </span>
              <input
                type="text"
                placeholder="Cari apapun, teks Arab (misal: الله)..."
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all text-slate-800 dark:text-white font-medium placeholder-slate-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                dir={isArabicInput ? "rtl" : "ltr"}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 2. MAIN CONTENT SWITCHER */}

        {/* CONDITION A: SEARCHING (Show Combined Results) */}
        {debouncedSearch ? (
          <div className="min-h-[400px] animate-fade-in space-y-8">
            {/* A.1. Matching Surahs (Local Filter) */}
            {matchedSurahs.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-teal-500">
                    <FaBookOpen />
                  </span>
                  Surat Ditemukan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchedSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        audioService.playClick();
                        onSelectSurah(surah.number);
                      }}
                      className="bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-all group flex items-center gap-4 text-left shadow-sm hover:shadow-md"
                    >
                      <div className="w-10 h-10 shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-full font-bold text-sm">
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-800 dark:text-white text-base truncate">
                          {surah.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {surah.arti} • {surah.verses} Ayat
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* A.2. Matching Verses (API Results) */}
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span className="text-teal-500">
                      <FaSearch />
                    </span>
                    Ayat Ditemukan
                  </h3>
                  <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800/50">
                    {searchMeta.total_results.toLocaleString("id-ID")} Ayat
                  </span>
                </div>

                {searchResults.map((res, idx) => {
                  const [surahId, ayahNum] = res.verse_key
                    .split(":")
                    .map(Number);
                  const surahName =
                    SURAH_DATA.find((s) => s.number === surahId)?.name ||
                    "Surat";

                  return (
                    <button
                      key={`${res.verse_key}-${idx}`}
                      onClick={() => handleJumpToResult(res.verse_key)}
                      className="w-full text-right bg-white dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700/50 hover:bg-teal-50/30 dark:hover:bg-slate-800 transition-all group"
                    >
                      <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-slate-700/50 pb-2">
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded">
                          {surahName} : {ayahNum}
                        </span>
                        <span className="text-slate-300 group-hover:text-teal-500 transform rotate-180">
                          <FaArrowRight />
                        </span>
                      </div>

                      <p
                        className="font-arabic text-xl md:text-2xl text-slate-800 dark:text-slate-200 leading-loose"
                        style={{ fontFamily: '"Amiri", serif' }}
                        dangerouslySetInnerHTML={{ __html: res.text }}
                        dir="rtl"
                      />

                      {res.translations && res.translations[0] && (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-left line-clamp-2 italic">
                          {res.translations[0].text.replace(/<[^>]*>?/gm, "")}
                        </p>
                      )}
                    </button>
                  );
                })}

                {/* LOAD MORE BUTTON */}
                {remainingItems > 0 && (
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full py-4 mt-6 bg-teal-50 dark:bg-slate-800 text-teal-700 dark:text-teal-400 font-bold rounded-2xl border-2 border-teal-100 dark:border-slate-700 hover:bg-teal-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm group"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="animate-spin">
                          <FaSpinner />
                        </span>{" "}
                        Memuat hasil lainnya...
                      </>
                    ) : (
                      <>
                        <span>
                          Masih {remainingItems.toLocaleString("id-ID")} Ayat
                          Lagi
                        </span>
                        <span className="transform rotate-90 group-hover:translate-y-1 transition-transform inline-block">
                          <FaArrowRight />
                        </span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ) : null}

            {/* A.3. NO RESULTS STATE */}
            {!isSearching &&
              matchedSurahs.length === 0 &&
              searchResults.length === 0 && (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <span className="text-4xl block mb-2 opacity-50">🔍</span>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    Tidak ditemukan surat atau ayat untuk "{searchTerm}".
                  </p>
                </div>
              )}

            {isSearching && (
              <div className="py-12 text-center text-slate-400">
                <span className="inline-block animate-spin mb-2 text-2xl text-teal-500">
                  <FaSpinner />
                </span>
                <p className="text-sm font-medium">
                  Sedang mencari di seluruh Al-Quran...
                </p>
              </div>
            )}
          </div>
        ) : (
          // CONDITION B: DASHBOARD VIEW (Quick Links, Tabs, Surah List)
          <>
            {/* B.1. Quick Links (Chips) */}
            <div className="mb-8 overflow-x-auto pb-4 hide-scrollbar">
              <div className="flex gap-3">
                {QUICK_LINKS.map((link) => (
                  <button
                    key={link.number}
                    onClick={() => {
                      audioService.playClick();
                      onSelectSurah(link.number);
                    }}
                    className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-linear-to-br ${link.gradient} ${link.text} border border-white/20 dark:border-white/5 hover:scale-105 transition-transform shadow-sm`}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            {/* B.2. Tab Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6">
              <button
                onClick={() => {
                  audioService.playClick();
                  setActiveTab("surah");
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "surah"
                    ? "bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <span className="inline-block">
                  <FaList />
                </span>{" "}
                Daftar Surat
              </button>
              <button
                onClick={() => {
                  audioService.playClick();
                  setActiveTab("bookmark");
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  activeTab === "bookmark"
                    ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                <span className="inline-block">
                  <FaStar />
                </span>{" "}
                Penanda
                {bookmarks.length > 0 && (
                  <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded-md ml-1">
                    {bookmarks.length}
                  </span>
                )}
              </button>
            </div>

            {/* B.3. Surah List / Bookmark List */}
            <div className="min-h-[400px]">
              {activeTab === "surah" ? (
                <div className="space-y-3">
                  {SURAH_DATA.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        audioService.playClick();
                        onSelectSurah(surah.number);
                      }}
                      className="w-full bg-white dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 transition-all group flex items-center gap-4 text-left"
                    >
                      <div className="relative w-10 h-10 shrink-0 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <div className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity drop-shadow-sm">
                          <FaCertificate size="100%" />
                        </div>
                        <span className="absolute text-xs font-bold font-sans text-teal-700 dark:text-teal-300 group-hover:text-white dark:group-hover:text-slate-900 transition-colors z-raised">
                          {surah.number}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-slate-800 dark:text-white text-base group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors truncate">
                            {surah.name}
                          </h4>
                          <span className="font-arabic text-xl text-slate-400 dark:text-slate-600 group-hover:text-teal-600/50 dark:group-hover:text-teal-400/50 font-normal">
                            {ARABIC_SURAH_NAMES[surah.name] || surah.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {surah.arti}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {surah.verses} Ayat
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 rounded">
                            {surah.type}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                // Bookmark List
                <div className="space-y-3">
                  {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => {
                      const surah = SURAH_DATA.find(
                        (s) => s.number === bookmark.surahId,
                      );
                      if (!surah) return null;
                      return (
                        <div
                          key={bookmark.id}
                          className="group bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm"
                        >
                          <button
                            onClick={() => {
                              audioService.playClick();
                              onJumpToBookmark(
                                bookmark.surahId,
                                bookmark.ayahNumber,
                              );
                            }}
                            className="flex-1 text-left flex items-center gap-4"
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                              <FaStar />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white group-hover:text-amber-600 transition-colors">
                                {surah.name}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Ayat {bookmark.ayahNumber} •{" "}
                                <span className="capitalize">
                                  {bookmark.category}
                                </span>
                              </p>
                            </div>
                          </button>
                          <button
                            onClick={() => {
                              audioService.playClick();
                              onRemoveBookmark(bookmark.id);
                            }}
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
                      <p className="font-bold text-slate-600 dark:text-slate-300">
                        Belum ada penanda.
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs">
                        Tekan lama pada ayat saat membaca untuk menyimpan ke
                        sini.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
};
