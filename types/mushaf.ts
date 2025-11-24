
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
}
