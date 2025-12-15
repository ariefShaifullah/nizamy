
export interface TajwidRule {
    name: string;
    description: string;
    color: string; // Tailwind class for badge
    indexes: number[]; // Indices of characters in the text to highlight
}

export interface MakhrajDetail {
    letter: string;
    name: string; // e.g., "Alif", "Ba"
    area: string; // e.g., "Al-Halq (Tenggorokan)"
    place: string; // Specific pronunciation method
    sifat: string[]; // Characteristics: Jahr, Hams, etc.
    note?: string; // Additional tips
}

export interface QuranWord {
  id: number;
  position: number;
  audio_url: string | null;
  char_type_name: "word" | "end" | "pause";
  text_uthmani: string;
  text_indopak?: string;
  page_number?: number;
  line_number?: number;
  translation?: { text: string };
  transliteration?: { text: string };
  code_v1?: string;
  location?: string; // Format "surah:ayah:word" e.g. "1:1:1"
  tajwidRules?: TajwidRule[]; // Pre-calculated rules for performance
}

export interface QuranAyah {
  id: number;
  verse_key: string; // "1:1"
  verse_number: number;
  text_uthmani: string;
  words: QuranWord[];
  translations?: { resource_id: number; text: string }[];
}

export interface SurahInfo {
  id: number;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  revelation_place: string;
}

export interface KamusData {
  type: 'ayah' | 'word';
  data: QuranAyah | QuranWord;
  surahInfo?: SurahInfo;
  reference?: string; // "QS 1:1"
  nextWordText?: string; // Context for Tajwid rules between two words
  isEndAyah?: boolean; // Context for Waqaf rules (Mad Arid, Qalqalah Kubra)
  bookmark: Bookmark | null; // Pass the full bookmark object or null
}

export interface LastReadState {
  surahId: number;
  ayahNumber: number;
  timestamp: number;
}

export type BookmarkCategory = 'general' | 'favorite' | 'memorize' | 'study';

export interface Bookmark {
  id: string; // e.g., "2:255"
  surahId: number;
  ayahNumber: number;
  timestamp: number;
  category: BookmarkCategory;
}

// Search Interfaces
export interface SearchResultItem {
  verse_key: string; // "2:255"
  verse_id: number;
  text: string; // text with highlight marks
  translations?: { text: string; resource_id: number }[];
}

export interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    current_page: number;
    total_pages: number;
    results: SearchResultItem[];
  };
}
