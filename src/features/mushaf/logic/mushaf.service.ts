
import type { QuranAyah, SurahInfo, QuranWord, SearchResponse, SearchResultItem } from '../../../types.ts';
import { SURAH_DATA } from '../../../constants.ts';
import { analyzeTajwid } from './tajwid.helper.ts';

const BASE_URL = 'https://api.quran.com/api/v4';
const AUDIO_CDN = 'https://audio.qurancdn.com';
const EQURAN_BASE = 'https://equran.id/api/v2'; // Official EQuran.id V2 API

// --- CACHING VARIABLES ---
// Cache Tafsir per Surah (EQuran returns full surah tafsir)
let tafsirCache: Record<number, { ayat: number, teks: string }[]> = {};

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

// Helper to clean HTML tags but preserve readability (paragraphs)
const cleanTranslationText = (text: string): string => {
    if (!text) return '';
    return text
        .replace(/<br\s*\/?>/gi, '\n') // Replace <br> with newline
        .replace(/<\/p>/gi, '\n\n') // End of paragraph -> double newline
        .replace(/<sup[^>]*>.*?<\/sup>/gi, '') // Remove <sup> tags AND their content (footnotes)
        .replace(/<[^>]*>?/gm, '') // Remove any other remaining HTML tags
        .trim();
};

/**
 * Securely sanitizes HTML content using DOMParser.
 * Prevents XSS by stripping dangerous tags and attributes.
 */
const sanitizeTafsirHtml = (html: string): string => {
    if (!html) return '';
    if (typeof window === 'undefined') return html; // SSR fallback (though this is client-side)

    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        if (!doc.body) return '';

        // Allowed tags whitelist
        const allowedTags = ['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'SPAN', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'];

        const sanitizeNode = (node: Node) => {
            const children = Array.from(node.childNodes);
            for (const child of children) {
                sanitizeNode(child);
            }

            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as Element;
                // Strip inline styles and classes
                el.removeAttribute('style');
                el.removeAttribute('class');

                // Remove dangerous attributes
                const attributes = Array.from(el.attributes);
                for (const attr of attributes) {
                    if (attr.name.startsWith('on') || attr.name.startsWith('javascript:')) {
                        el.removeAttribute(attr.name);
                    }
                }

                // If tag is not allowed, unwrap it (keep content, remove tag)
                // Exception: remove A tags completely or replace with span to prevent navigation
                if (el.tagName === 'BODY') {
                    // Do nothing for BODY, just keep it (children are already processed above)
                } else if (el.tagName === 'A') {
                    const span = document.createElement('span');
                    span.innerHTML = el.innerHTML;
                    el.replaceWith(span);
                } else if (!allowedTags.includes(el.tagName)) {
                    // For other unknown tags, if script/iframe/object/embed, remove entirely
                    if (['SCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'STYLE'].includes(el.tagName)) {
                        el.remove();
                    } else {
                        // Otherwise just unwrap
                        const parent = el.parentNode;
                        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
                        parent?.removeChild(el);
                    }
                }
            }
        };

        sanitizeNode(doc.body);
        return doc.body?.innerHTML || '';
    } catch (e) {
        console.error('Sanitization failed:', e);
        return '';
    }
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
                return res;
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

export const fetchVersesWithWords = async (
    type: 'surah' | 'juz',
    id: number,
    page: number = 1,
    perPage: number = 10,
    signal?: AbortSignal
): Promise<FetchResponse> => {
    try {
        const endpoint = type === 'surah' ? `verses/by_chapter/${id}` : `verses/by_juz/${id}`;
        const url = `${BASE_URL}/${endpoint}?language=id&words=true&word_fields=text_uthmani,audio_url,char_type_name,location&translations=39&fields=text_uthmani&per_page=${perPage}&page=${page}`;

        const response = await fetchWithRetry(url, { signal });
        const text = await response.text();
        if (!text) throw new Error('Empty response from API');

        let json: ApiResponse;
        try { json = JSON.parse(text); } catch (e) { throw new Error('Invalid JSON format from API'); }

        if (!json || !Array.isArray(json.verses)) throw new Error('Invalid JSON structure from API');

        const processedVerses: QuranAyah[] = json.verses
            .filter((ayah) => ayah && typeof ayah === 'object' && ayah.id && ayah.verse_number)
            .map((ayah) => {
                let cleanedWords = Array.isArray(ayah.words) ? ayah.words : [];
                const [surahIdStr] = ayah.verse_key.split(':');
                const surahId = parseInt(surahIdStr);

                // Remove Bismillah if it's the first verse (API sometimes includes it as words)
                // EXCEPT if it's Surah Al-Fatihah (1) or At-Taubah (9 which has none)
                // In JUZ mode, we must check the surahId derived from verse_key
                if (ayah.verse_number === 1 && surahId !== 1 && surahId !== 9) {
                    const bismillahTokens = ['بِسْمِ', 'ٱللَّهِ', 'ٱلرَّحْمَٰنِ', 'ٱلرَّحِيمِ'];
                    let isBismillahHeader = true;
                    if (cleanedWords.length >= 4) {
                        for (let i = 0; i < 4; i++) {
                            if (!cleanedWords[i].text_uthmani.includes(bismillahTokens[i])) {
                                isBismillahHeader = false;
                                break;
                            }
                        }
                    } else { isBismillahHeader = false; }
                    if (isBismillahHeader) cleanedWords = cleanedWords.slice(4);
                }

                const processedWords: QuranWord[] = cleanedWords.map((w, index) => {
                    let finalAudioUrl: string | null = null;
                    if (w.char_type_name === 'word') {
                        finalAudioUrl = w.location ? constructWbwUrl(w.location) : getCleanAudioUrl(w.audio_url);
                    }

                    let tajwidRules = [];
                    if (w.char_type_name === 'word') {
                        const nextWord = index < cleanedWords.length - 1 ? cleanedWords[index + 1] : null;
                        const isEndAyah = index === cleanedWords.length - 1;

                        tajwidRules = analyzeTajwid(
                            w.text_uthmani,
                            nextWord?.text_uthmani,
                            w.location,
                            isEndAyah
                        );
                    }

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
                        location: w.location,
                        tajwidRules
                    };
                });

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
 * Fetch Tafsir with support for multiple providers.
 * 
 * @param verseKey - format "1:1"
 * @param variant - 'kemenag' | 'ibnkathir-ar' | 'ibnkathir-en'
 */
export const fetchTafsir = async (
    verseKey: string,
    variant: 'kemenag' | 'ibnkathir-ar' | 'ibnkathir-en' = 'kemenag'
): Promise<{ text: string, source: string } | null> => {
    try {
        const [surahId, ayahId] = verseKey.split(':').map(Number);

        // 1. KEMENAG (INDONESIA) - Uses EQuran.id
        if (variant === 'kemenag') {
            // Check Memory Cache first
            if (tafsirCache[surahId]) {
                const cachedItem = tafsirCache[surahId].find(t => t.ayat === ayahId);
                if (cachedItem) {
                    return { text: cachedItem.teks, source: "Tafsir Kemenag RI" };
                }
            }

            // Fetch from EQuran.id
            const url = `${EQURAN_BASE}/tafsir/${surahId}`;
            const res = await fetchWithRetry(url);
            if (!res.ok) throw new Error(`EQuran API Error: ${res.status}`);

            const json = await res.json();
            if (json.code === 200 && json.data && Array.isArray(json.data.tafsir)) {
                tafsirCache[surahId] = json.data.tafsir;
                const targetItem = json.data.tafsir.find((t: any) => t.ayat === ayahId);
                if (targetItem) {
                    return { text: targetItem.teks, source: "Tafsir Kemenag RI" };
                }
            }
        }

        // 2. TAFSIR INTERNATIONAL (QURAN.COM)
        else {
            let resourceParam: string | number = variant === 'ibnkathir-ar' ? 'ar-tafsir-ibn-kathir' : 169;
            let sourceName = variant === 'ibnkathir-ar' ? "Tafsir Ibn Kathir (Arab)" : "Tafsir Ibn Kathir (English)";

            const fetchFromApi = async (param: string | number) => {
                const url = `${BASE_URL}/tafsirs/${param}/by_ayah/${verseKey}`;
                const r = await fetchWithRetry(url);
                if (r.ok) return r.json();
                return null;
            };

            let json = await fetchFromApi(resourceParam);

            // FALLBACK LOGIC
            if (variant === 'ibnkathir-ar') {
                const text = json?.tafsir?.text || '';
                const isEnglish = text.length > 5 && /^[\x00-\x7F]*$/.test(text.replace(/<[^>]*>/g, '').trim().slice(0, 50));
                const isEmpty = !text;

                if (isEmpty || isEnglish) {
                    json = await fetchFromApi(16); // Al-Muyassar
                    if (json && json.tafsir && json.tafsir.text) {
                        sourceName = "Tafsir Al-Muyassar (Arab)";
                    } else {
                        json = await fetchFromApi(91); // Al-Jalalayn
                        if (json && json.tafsir && json.tafsir.text) {
                            sourceName = "Tafsir Al-Jalalayn (Arab)";
                        }
                    }
                }
            }

            if (json && json.tafsir && json.tafsir.text) {
                // USE SECURE SANITIZER HERE
                const sanitizedText = sanitizeTafsirHtml(json.tafsir.text);

                // If text is empty after sanitization, treat as missing
                if (!sanitizedText || sanitizedText.trim().length === 0) {
                    console.warn(`Tafsir text empty after sanitization for ${verseKey}`);
                    return null;
                }

                return {
                    text: sanitizedText,
                    source: sourceName
                };
            } else {
                console.warn(`Tafsir content missing for ${verseKey} (${variant}):`, json);
            }
        }

        return null;

    } catch (e) {
        console.error("Tafsir fetch failed:", e);
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';
        return {
            text: `Gagal memuat data tafsir. Sila periksa koneksi internet Anda.\n\nDetail Error: ${errorMessage}`,
            source: "Error Koneksi"
        };
    }
};

export const preloadAudio = (url: string) => {
    const audio = new Audio();
    audio.src = url;
    audio.preload = 'auto';
};

const executeSearch = async (query: string, page: number, language: string) => {
    let normalizedQuery = query.trim();

    // Arabic-specific normalization
    if (/[\u0600-\u06FF]/.test(normalizedQuery)) {
        normalizedQuery = normalizedQuery
            .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "") // Harakat & Waqaf
            .replace(/[أإآ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/\u0640/g, '');
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

        const mainPromise = executeSearch(query, page, langParam);

        let variationPromises: Promise<any>[] = [];

        if (isArabic && !hasSpace && page === 1) {
            const prefixes = ['ال', 'و', 'ف', 'ب', 'ل', 'وال', 'فال', 'فل', 'ول'];
            variationPromises = prefixes.map(prefix => {
                if (query.startsWith(prefix)) return Promise.resolve(null);
                return executeSearch(`${prefix}${query}`, 1, langParam);
            });
        }

        const [mainResult, ...variations] = await Promise.all([mainPromise, ...variationPromises]);

        let allResults: SearchResultItem[] = mainResult?.search?.results || [];
        let mainPagination = mainResult?.search || { current_page: 1, total_pages: 1, total_results: 0 };

        variations.forEach(v => {
            if (v && v.search && v.search.results.length > 0) {
                allResults = [...allResults, ...v.search.results];
            }
        });

        const uniqueResults = Array.from(new Map(allResults.map(item => [item.verse_key, item])).values());

        return {
            results: uniqueResults,
            pagination: {
                current_page: mainPagination.current_page,
                total_pages: mainPagination.total_pages,
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
