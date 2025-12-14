import type { QuranAyah, SurahInfo, QuranWord, SearchResponse, SearchResultItem } from '../../../types.ts';
import { SURAH_DATA } from '../../../constants.ts';

const BASE_URL = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://audio.qurancdn.com'; 

// --- HELPER FUNCTIONS ---

const getCleanAudioUrl = (urlPart: string | null | undefined): string | null => {
    if (!urlPart || typeof urlPart !== 'string') return null;
    const trimmed = urlPart.trim();
    if (!trimmed) return null;
    
    if (trimmed.startsWith('http')) return trimmed;
    if (trimmed.startsWith('//')) return `https:${trimmed}`;
    
    const cleanPath = trimmed.replace(/^\/+/, '');
    return `${AUDIO_CDN}/${cleanPath}`;
};

const constructWbwUrl = (location: string): string | null => {
    if (!location) return null;
    
    const parts = location.split(':');
    if (parts.length !== 3) return null;

    const surah = parts[0].padStart(3, '0');
    const ayah = parts[1].padStart(3, '0');
    const word = parts[2].padStart(3, '0');

    return `${AUDIO_CDN}/wbw/${surah}_${ayah}_${word}.mp3`;
};

// Helper to clean HTML tags and specifically remove footnotes contents (numbers)
const cleanTranslationText = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // Remove <sup> tags AND their content (the numbers)
        .replace(/<[^>]*>?/gm, '') // Remove any other remaining HTML tags
        .trim();
};

// Robust fetch with retry logic
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 2, backoff = 1000): Promise<Response> {
    try {
        if (options.signal?.aborted) {
            const err = new Error('Aborted');
            err.name = 'AbortError';
            throw err;
        }

        const res = await fetch(url, options);
        
        if (!res.ok) {
             if (res.status === 404 || res.status === 400) {
                 throw new Error(`API Error ${res.status}: ${res.statusText}`);
             }
             if ((res.status === 429 || res.status >= 500) && retries > 0) {
                 await new Promise(r => setTimeout(r, backoff));
                 return fetchWithRetry(url, options, retries - 1, backoff * 2);
             }
             throw new Error(`HTTP Error ${res.status}`);
        }
        return res;
    } catch (err: any) {
        if (err.name === 'AbortError') throw err;
        if (retries > 0 && !err.message.includes('API Error')) {
            await new Promise(r => setTimeout(r, backoff));
            return fetchWithRetry(url, options, retries - 1, backoff * 2);
        }
        throw err;
    }
}

// --- API RESPONSE INTERFACES ---
interface ApiWord {
    id: number;
    position: number;
    audio_url: string | null;
    char_type_name: string; // "word", "end", "pause"
    text_uthmani: string;
    text_indopak?: string;
    page_number?: number;
    line_number?: number;
    translation?: { text: string };
    transliteration?: { text: string };
    code_v1?: string;
    location?: string;
}

interface ApiAyah {
    id: number;
    verse_key: string;
    verse_number: number;
    text_uthmani: string;
    words: ApiWord[];
    translations?: { resource_id: number; text: string }[];
}

interface ApiResponse {
    verses: ApiAyah[];
    pagination: {
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_count: number;
    };
}

interface FetchResponse {
    verses: QuranAyah[];
    meta: {
        current_page: number;
        next_page: number | null;
        total_pages: number;
        total_count: number;
    };
}

/**
 * Fetch verses with pagination to prevent browser freeze.
 * Default perPage is 10 to keep the DOM light.
 */
export const fetchVersesWithWords = async (
    surahId: number, 
    page: number = 1, 
    perPage: number = 10, // Small chunk size for performance
    signal?: AbortSignal
): Promise<FetchResponse> => {
    try {
        // URL Construction
        const url = `${BASE_URL}/verses/by_chapter/${surahId}?language=id&words=true&word_fields=text_uthmani,audio_url,char_type_name,location&translations=33&fields=text_uthmani&per_page=${perPage}&page=${page}`;
        
        const response = await fetchWithRetry(url, { signal });
        
        // FIX: Safe JSON parsing
        const text = await response.text();
        if (!text) throw new Error('Empty response from API');
        
        let json: ApiResponse;
        try {
            json = JSON.parse(text);
        } catch (e) {
            throw new Error('Invalid JSON format from API');
        }

        if (!json || !Array.isArray(json.verses)) throw new Error('Invalid JSON structure from API');

        // Process Data
        const processedVerses: QuranAyah[] = json.verses
            // Robust filtering: Ensure item is object and has critical ID fields
            .filter((ayah) => ayah && typeof ayah === 'object' && ayah.id && ayah.verse_number) 
            .map((ayah) => {
                let cleanedWords = Array.isArray(ayah.words) ? ayah.words : [];

                // Handle Bismillah Logic (Only affects Verse 1)
                if (ayah.verse_number === 1 && surahId !== 1 && surahId !== 9) {
                    const bismillahTokens = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
                    
                    // Check if the first 4 words match the Bismillah pattern
                    let isBismillahHeader = true;
                    if (cleanedWords.length >= 4) {
                        for(let i=0; i<4; i++) {
                            // Simple inclusion check for safety
                            if (!cleanedWords[i].text_uthmani.includes(bismillahTokens[i])) {
                                isBismillahHeader = false;
                                break;
                            }
                        }
                    } else {
                        isBismillahHeader = false;
                    }

                    // Strip Bismillah only if detected safely
                    if (isBismillahHeader) { 
                        cleanedWords = cleanedWords.slice(4);
                    }
                }

                // Fix Audio URLs and Map to Internal Type
                const processedWords: QuranWord[] = cleanedWords.map((w) => {
                    let finalAudioUrl: string | null = null;
                    if (w.char_type_name === 'word') {
                        if (w.location) {
                            finalAudioUrl = constructWbwUrl(w.location);
                        } else {
                            finalAudioUrl = getCleanAudioUrl(w.audio_url);
                        }
                    }
                    // Normalize to QuranWord type
                    return {
                        id: w.id,
                        position: w.position,
                        audio_url: finalAudioUrl,
                        char_type_name: w.char_type_name as "word" | "end" | "pause",
                        text_uthmani: w.text_uthmani,
                        text_indopak: w.text_indopak,
                        page_number: w.page_number,
                        line_number: w.line_number,
                        translation: w.translation,
                        transliteration: w.transliteration,
                        code_v1: w.code_v1,
                        location: w.location
                    };
                });

                // Clean translations here
                const cleanedTranslations = ayah.translations?.map(t => ({
                    ...t,
                    text: cleanTranslationText(t.text)
                }));

                return { 
                    id: ayah.id,
                    verse_key: ayah.verse_key,
                    verse_number: ayah.verse_number,
                    text_uthmani: ayah.text_uthmani,
                    words: processedWords,
                    translations: cleanedTranslations
                };
            });

        return {
            verses: processedVerses,
            meta: json.pagination || { current_page: page, next_page: null, total_pages: 1, total_count: processedVerses.length }
        };

    } catch (error) {
        if ((error as Error).name === 'AbortError') throw error;
        console.error('Error fetching verses:', error);
        throw error;
    }
};

/**
 * Internal helper to execute the raw API fetch
 */
const executeSearch = async (query: string, page: number, language: string) => {
    // 1. Basic cleaning: remove harakat, normalize alifs, remove tatweel
    let normalizedQuery = query.trim();
    
    // Arabic-specific normalization
    if (/[\u0600-\u06FF]/.test(normalizedQuery)) {
        normalizedQuery = normalizedQuery
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Harakat & Waqaf
            .replace(/[أإآ]/g, 'ا') // Normalize Alifs
            .replace(/ى/g, 'ي') // Normalize Ya
            .replace(/ة/g, 'ه') // Normalize Ta Marbuta -> Ha (helps matching)
            .replace(/\u0640/g, ''); // Remove Tatweel
    }

    const url = `${BASE_URL}/search?q=${encodeURIComponent(normalizedQuery)}&size=20&page=${page}&language=${language}`;
    
    try {
        const response = await fetchWithRetry(url);
        const text = await response.text();
        
        if (!text) return null;
        const json: SearchResponse = JSON.parse(text);
        if (json.search && Array.isArray(json.search.results)) {
            return {
                ...json,
                search: {
                    ...json.search,
                    results: json.search.results.filter(r => r.text && r.text.trim().length > 0)
                }
            };
        }
        return null;
    } catch (e) {
        return null;
    }
};

export const searchQuranText = async (query: string, page = 1): Promise<{ results: SearchResultItem[], pagination: { current_page: number, total_pages: number, total_results: number } }> => {
    try {
        const isArabic = /[\u0600-\u06FF]/.test(query);
        const hasSpace = query.trim().includes(' ');
        const langParam = 'id'; 

        // 1. Main Search (Original Query)
        const mainPromise = executeSearch(query, page, langParam);
        
        // 2. Aggressive Prefix Expansion (Only for Arabic Single Words on Page 1)
        // This solves "Yanzur" not finding "Falyanzur" because API string matching is strict
        let variationPromises: Promise<any>[] = [];
        
        if (isArabic && !hasSpace && page === 1) {
            // Common Arabic prefixes that attach to words
            // Wal- (Wa-Al), Fal- (Fa-Al/Fa-Lam), Wa-, Fa-, Al-, Li-, Bi-
            const prefixes = ['ال', 'و', 'ف', 'ب', 'ل', 'وال', 'فال', 'فل', 'ول'];
            
            variationPromises = prefixes.map(prefix => {
                // Avoid redundant checks if query already starts with prefix
                if (query.startsWith(prefix)) return Promise.resolve(null);
                return executeSearch(`${prefix}${query}`, 1, langParam);
            });
        }

        const [mainResult, ...variations] = await Promise.all([mainPromise, ...variationPromises]);

        // 3. Merge Results
        let allResults: SearchResultItem[] = mainResult?.search?.results || [];
        let mainPagination = mainResult?.search || { current_page: 1, total_pages: 1, total_results: 0 };

        // Append variation results to the list
        variations.forEach(v => {
            if (v && v.search && v.search.results.length > 0) {
                allResults = [...allResults, ...v.search.results];
            }
        });

        // 4. Deduplicate (by verse_key)
        const uniqueResults = Array.from(new Map(allResults.map(item => [item.verse_key, item])).values());

        // 5. Sort? 
        // Ideally we keep original relevance, but appended ones might be important too.
        // For now, we trust the order: Main Matches first, then prefixed variations.
        
        return {
            results: uniqueResults,
            pagination: {
                current_page: mainPagination.current_page,
                total_pages: mainPagination.total_pages,
                // Total results might be inaccurate if we merged, but it's okay for infinite scroll hints
                total_results: mainPagination.total_results + (uniqueResults.length - (mainResult?.search?.results.length || 0))
            }
        };

    } catch (error) {
        console.error('Search error:', error);
        return {
            results: [],
            pagination: { current_page: page, total_pages: 0, total_results: 0 }
        };
    }
};

export const getSurahInfo = (surahId: number): SurahInfo | undefined => {
    const surah = SURAH_DATA.find(s => s.number === surahId);
    if (!surah) return undefined;
    return {
        id: surah.number,
        name_complex: surah.name,
        name_arabic: '', 
        verses_count: surah.verses,
        revelation_place: surah.type 
    };
};

export const getAyahAudioUrl = (surah: number, ayah: number, qoriId: string = 'Husary_64kbps'): string => {
    const surahPad = String(surah).padStart(3, '0');
    const ayahPad = String(ayah).padStart(3, '0');
    return `https://everyayah.com/data/${qoriId}/${surahPad}${ayahPad}.mp3`;
};

export const getWordAudioUrl = getCleanAudioUrl;

export const getNextAyahId = (currentId: number, list: QuranAyah[]) => {
    const idx = list.findIndex(v => v.id === currentId);
    if (idx !== -1 && idx < list.length - 1) return list[idx + 1].id;
    return null;
};

export const getPrevAyahId = (currentId: number, list: QuranAyah[]) => {
    const idx = list.findIndex(v => v.id === currentId);
    if (idx > 0) return list[idx - 1].id;
    return null;
};
