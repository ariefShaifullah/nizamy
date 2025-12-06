
/**
 * Advanced Tajwid & Makhraj Analysis Helper
 * Handles Intra-word rules, Inter-word rules, Special Cases, and Letter Articulation Points.
 * 
 * OPTIMIZATION: Implements Global In-Memory Caching to reduce CPU load on recurring words.
 */

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

// --- GLOBAL CACHE ---
// Cache key format: "text|nextText|location|isEnd"
const TAJWID_CACHE = new Map<string, TajwidRule[]>();
const MAX_CACHE_SIZE = 5000; // Limit cache to prevent memory bloat over long sessions

// --- REGEX PATTERNS (ARABIC UNICODE) ---
// Harakat
const FATHA = '\u064E';
const KASRA = '\u0650';
const DAMMA = '\u064F';
const SUKUN = '\u0652';
const SHADDA = '\u0651';
const MADDA = '\u0653';
const ALIF_KHANJARIAH = '\u0670'; 
const ALIF_MAQSURAH = '\u0649';
const WAQAF_MARKS = '\u06D6-\u06ED'; // Range of common Quranic marks

// Tanwin
const FATHATAIN = '\u064B';
const DAMMATAIN = '\u064C';
const KASRATAIN = '\u064D';

// Letters Groups
const HURUF_HALQI = '[ءأإآؤئهعحغخ]'; 
const HURUF_IDGHAM_BIGUNNAH = '[يمنو]';
const HURUF_IDGHAM_BILAGUNNAH = '[لر]';
const HURUF_IQLAB = 'ب';
const HURUF_IKHFA = '[تثجدذزسشصضطظفقك]'; 
const HURUF_QALQALAH = '[قطبجد]';
const HURUF_MIM = 'م';
const HURUF_BA = 'ب';
const HURUF_QAMARIYAH = '[ءأإآؤئبجحخعغفقكموهي]'; 

// Pre-compiled Regex for Performance
const HARAKAT_PATTERN = '[\u064B-\u065F]*';
const MAD_THABII_REGEX = new RegExp('(?:\u064E\u0627|\u064E?\u0670|\u0650\u064A\u0652?|\u064F\u0648\u0652?)', 'g');
const MAD_LAYYIN_REGEX = new RegExp('(?:\u064E[\u0648\u064A]\u0652)', 'g'); // Fatha + Waw/Ya Sukun
const MAD_WAJIB_REGEX = new RegExp('.[\u0653\u06E4]', 'g');
const GHUNNAH_REGEX = new RegExp('[نم]\u0651', 'g');
const QALQALAH_REGEX = new RegExp(`[قطبجد]${SUKUN}`, 'g');
const ALIF_LAM_SYAMSIAH_REGEX = new RegExp(/^(ٱ?ل)[^ل\u0600-\u06FF]*[ّ]/, 'g');
const ALIF_LAM_QAMARIYAH_CHECK = new RegExp(`^.{2,3}${HURUF_QAMARIYAH}`);
const ALIF_LAM_BASE_REGEX = new RegExp(/^(ٱ?ل)/, 'g');
const LAM_JALALAH_REGEX = new RegExp(/ٱللَّه|لِلَّهِ/, 'g');
const IKHFA_INTRA_REGEX = new RegExp(/ن(?![َُِّْ])\s*[تثجدذزسشصضطظفقك]/, 'g');
const IQLAB_INTRA_REGEX = new RegExp(/ن(?![َُِّْ])\s*([ب]|ۢ)/, 'g');
const IZHAR_INTRA_REGEX = new RegExp(/نْ[ءأإآؤئهعحغخ]/, 'g');

// Ending Patterns
const ENDING_MARKS = `[${ALIF_KHANJARIAH}${ALIF_MAQSURAH}${WAQAF_MARKS}]*`;
const ENDING_TANWIN = new RegExp(`[${FATHATAIN}${DAMMATAIN}${KASRATAIN}]${ENDING_MARKS}$`);
const ENDING_NUN_MATI = new RegExp(`ن[${SUKUN}]?${ENDING_MARKS}$`);
const ENDING_MIM_MATI = new RegExp(`م[${SUKUN}]?${ENDING_MARKS}$`);

// Special Cases Lookup (Location based: "surah:ayah:wordPosition")
const SPECIAL_RULES: Record<string, Omit<TajwidRule, 'indexes'>> = {
    "11:41:6": {
        name: "Imalah (Gharib)",
        description: "Bacaan 'Majreeha' dibaca miring antara Fatah dan Kasrah (seperti bunyi 'Re' pada sate).",
        color: "text-purple-600 dark:text-purple-400"
    },
    "12:11:6": { 
        name: "Isymam (Gharib)",
        description: "Mencucu (isyarat bibir) di tengah dengung tanpa suara pada kata 'Laa Ta'manna'.",
        color: "text-purple-600 dark:text-purple-400"
    },
    "41:44:10": { 
        name: "Tashil (Gharib)",
        description: "Hamzah kedua dibaca samar/ringan (antara Hamzah dan Alif).",
        color: "text-purple-600 dark:text-purple-400"
    },
};

// --- MAKHRAJ DATABASE ---
const MAKHRAJ_DB: Record<string, Omit<MakhrajDetail, 'letter'>> = {
    'ء': {
        name: 'Hamzah',
        area: 'Al-Halq (Tenggorokan Bawah)',
        place: 'Pangkal tenggorokan (Aqsal Halqi), dekat dada.',
        sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah'],
        note: 'Keluarkan suara dari dalam pangkal leher dengan tegas, jangan sampai menjadi "Hah". Berlaku untuk ء, أ, إ, ؤ, ئ.'
    },
    'ا': { name: 'Alif', area: 'Al-Jauf (Rongga Mulut)', place: 'Rongga mulut dan tenggorokan (untuk Mad).', sifat: ['Jahr', 'Rakhawah'], note: 'Udara mengalir bebas tanpa hambatan (Huruf Mad).' },
    'ب': {
        name: 'Ba',
        area: 'Asy-Syafatain (Dua Bibir)',
        place: 'Merapatkan kedua bibir (bagian basah).',
        sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Qalqalah'],
        note: 'Tutup bibir rapat lalu lepaskan. Jika sukun, pantulkan (Qalqalah).'
    },
    'ت': {
        name: 'Ta',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah menempel pada pangkal gigi seri atas.',
        sifat: ['Hams', 'Syiddah', 'Istifal', 'Infitah'],
        note: 'Ada sedikit desis nafas (Hams) saat diucapkan, terutama saat sukun.'
    },
    'ث': {
        name: 'Tsa',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah dikeluarkan sedikit, menyentuh ujung gigi seri atas.',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Jangan ditekan kuat, biarkan nafas dan suara mengalir lembut (seperti "th" dalam "think").'
    },
    'ج': {
        name: 'Jim',
        area: 'Al-Lisan (Lidah Tengah)',
        place: 'Tengah lidah naik menempel ke langit-langit.',
        sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Qalqalah'],
        note: 'Tekan kuat ke langit-langit. Jangan ada nafas yang keluar. Pantulkan jika sukun.'
    },
    'ح': {
        name: 'Ha (Kecil)',
        area: 'Al-Halq (Tenggorokan Tengah)',
        place: 'Tengah tenggorokan (Wasthul Halqi).',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Suara bersih dan halus, seperti mendesah "Hah" pedas. Bukan di dada.'
    },
    'خ': {
        name: 'Kha',
        area: 'Al-Halq (Tenggorokan Atas)',
        place: 'Ujung tenggorokan dekat anak lidah (Adnal Halqi).',
        sifat: ['Hams', 'Rakhawah', 'Isti\'la', 'Infitah'],
        note: 'Seperti suara mengorok halus atau membuang dahak. Huruf tebal (Tafkhim).'
    },
    'd': { name: 'Dal', area: 'Al-Lisan (Lidah)', place: 'Ujung lidah menempel pada pangkal gigi seri atas (sama dengan Ta).', sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Qalqalah'], note: 'Suara tertahan dan jelas. Pantulkan jika sukun.' }, 
    'د': {
        name: 'Dal',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah menempel pada pangkal gigi seri atas.',
        sifat: ['Jahr', 'Syiddah', 'Istifal', 'Infitah', 'Qalqalah'],
        note: 'Pantulkan dengan jelas jika mati (Qalqalah).'
    },
    'ذ': {
        name: 'Dzal',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah keluar sedikit menyentuh ujung gigi seri atas (sama dengan Tsa).',
        sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Suara mengalir lembut, tidak ada desis tajam seperti Zai.'
    },
    'ر': {
        name: 'Ra',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah (sedikit lebih ke dalam dari Nun) menyentuh gusi atas.',
        sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah', 'Inhiraf', 'Takrir'],
        note: 'Ada getaran halus (Takrir) tapi jangan berlebihan (cadel).'
    },
    'z': { name: 'Zai', area: 'Al-Lisan', place: '', sifat: [], note: '' },
    'ز': {
        name: 'Zai',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah di belakang gigi seri bawah (Safir).',
        sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah', 'Safir'],
        note: 'Memiliki bunyi desis tajam seperti lebah ("Zzz"). Gigi atas dan bawah hampir rapat.'
    },
    'س': {
        name: 'Sin',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah di belakang gigi seri bawah (Safir).',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Safir'],
        note: 'Bunyi desis tipis dan tajam ("Sss"). Pangkal lidah merendah.'
    },
    'ش': {
        name: 'Syin',
        area: 'Al-Lisan (Lidah Tengah)',
        place: 'Tengah lidah naik ke langit-langit (sama dengan Jim), tapi tidak menempel rapat.',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah', 'Tafasyi'],
        note: 'Menyebarkan angin di dalam mulut (Tafasyi). Seperti mengusir ayam "Syuh".'
    },
    'ص': {
        name: 'Shad',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah di belakang gigi seri bawah (sama dengan Sin), tapi pangkal lidah naik.',
        sifat: ['Hams', 'Rakhawah', 'Isti\'la', 'Itbaq', 'Safir'],
        note: 'Bunyi desis tebal/kuat. Mulut sedikit mencucu karena tebal, pangkal lidah naik.'
    },
    'ض': {
        name: 'Dhad',
        area: 'Al-Lisan (Sisi Lidah)',
        place: 'Sisi lidah (kiri/kan/keduanya) menempel ke gigi geraham atas.',
        sifat: ['Jahr', 'Rakhawah', 'Isti\'la', 'Itbaq', 'Istithalah'],
        note: 'Huruf tersulit/terberat. Suara memanjang dari sisi lidah ke depan (Istithalah).'
    },
    'ط': {
        name: 'Tha',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah menempel pada pangkal gigi seri atas (sama dengan Ta).',
        sifat: ['Jahr', 'Syiddah', 'Isti\'la', 'Itbaq', 'Qalqalah'],
        note: 'Versi tebal dari Ta. Pangkal lidah naik. Pantulkan dengan tebal jika sukun.'
    },
    'ظ': {
        name: 'Zha',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah keluar sedikit menyentuh ujung gigi seri atas (sama dengan Dzal).',
        sifat: ['Jahr', 'Rakhawah', 'Isti\'la', 'Itbaq'],
        note: 'Versi tebal dari Dzal. Suara tertahan di dalam mulut (Itbaq).'
    },
    'ع': {
        name: '\'Ain',
        area: 'Al-Halq (Tenggorokan Tengah)',
        place: 'Tengah tenggorokan (Wasthul Halqi).',
        sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah'],
        note: 'Tarik otot tenggorokan ke belakang. Suara bersih, bukan sengau.'
    },
    'غ': {
        name: 'Ghain',
        area: 'Al-Halq (Tenggorokan Atas)',
        place: 'Ujung tenggorokan (Adnal Halqi).',
        sifat: ['Jahr', 'Rakhawah', 'Isti\'la', 'Infitah'],
        note: 'Seperti berkumur-kumur. Huruf tebal, jangan sampai jadi "R" atau "G" biasa.'
    },
    'ف': {
        name: 'Fa',
        area: 'Asy-Syafatain (Bibir)',
        place: 'Gigi seri atas menyentuh bibir bawah bagian dalam.',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Hembuskan nafas ("Fff").'
    },
    'q': { name: 'Qaf', area: '', place:'', sifat: [], note: '' },
    'ق': {
        name: 'Qaf',
        area: 'Al-Lisan (Pangkal Lidah)',
        place: 'Pangkal lidah menempel ke langit-langit lunak (dekat anak tekak).',
        sifat: ['Jahr', 'Syiddah', 'Isti\'la', 'Infitah', 'Qalqalah'],
        note: 'Bunyi tebal dan bulat di pangkal. Pantulkan dengan tebal.'
    },
    'k': { name: 'Kaf', area: '', place:'', sifat: [], note: '' },
    'ك': {
        name: 'Kaf',
        area: 'Al-Lisan (Pangkal Lidah)',
        place: 'Pangkal lidah menempel ke langit-langit keras (di bawah Qaf sedikit).',
        sifat: ['Hams', 'Syiddah', 'Istifal', 'Infitah'],
        note: 'Ada sedikit hembusan nafas (Hams) saat sukun ("Ak-h").'
    },
    'ل': {
        name: 'Lam',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung sisi lidah hingga ujung lidah menempel pada gusi atas.',
        sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah', 'Inhiraf'],
        note: 'Lidah menyentuh gusi (bukan gigi). Suara menyimpang ke sisi lidah.'
    },
    'م': {
        name: 'Mim',
        area: 'Asy-Syafatain (Dua Bibir)',
        place: 'Merapatkan kedua bibir (bagian luar/kering).',
        sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah', 'Ghunnah'],
        note: 'Disertai dengung dari hidung (Ghunnah).'
    },
    'ن': {
        name: 'Nun',
        area: 'Al-Lisan (Lidah)',
        place: 'Ujung lidah menempel pada gusi atas (di bawah Lam).',
        sifat: ['Jahr', 'Tawassut', 'Istifal', 'Infitah', 'Ghunnah'],
        note: 'Disertai dengung dari hidung (Ghunnah).'
    },
    'و': {
        name: 'Waw',
        area: 'Asy-Syafatain (Dua Bibir)',
        place: 'Membulatkan kedua bibir (mencucu) dengan menyisakan lubang kecil.',
        sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Suara harus bulat sempurna ("Wuu"), jangan cempreng.'
    },
    'ه': {
        name: 'Ha (Besar)',
        area: 'Al-Halq (Tenggorokan Bawah)',
        place: 'Pangkal tenggorokan (Aqsal Halqi).',
        sifat: ['Hams', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Suara nafas besar dari dada (seperti orang lari terengah-engah).'
    },
    'ي': {
        name: 'Ya',
        area: 'Al-Lisan (Lidah Tengah)',
        place: 'Tengah lidah naik ke langit-langit (tapi tidak menempel).',
        sifat: ['Jahr', 'Rakhawah', 'Istifal', 'Infitah'],
        note: 'Seperti mengucapkan "Y" pada "Saya".'
    },
};

export const getMakhrajDetails = (text: string): MakhrajDetail[] => {
    // Basic caching for Makhraj not needed as this is user-initiated click, not render-loop
    const cleanText = text.replace(/[^\u0621-\u064A]/g, ''); // Remove harakat, keep letters only
    const uniqueChars = Array.from(new Set(cleanText.split('')));
    
    const details: MakhrajDetail[] = [];
    
    uniqueChars.forEach(char => {
        let key = char;
        
        if ('أإآؤئ'.includes(char)) key = 'ء';
        else if ('ى'.includes(char)) key = 'ي';
        else if ('ة'.includes(char)) key = 'ه';

        if (MAKHRAJ_DB[key]) {
            const exists = details.some(d => d.name === MAKHRAJ_DB[key].name);
            if (!exists) {
                details.push({
                    letter: char,
                    ...MAKHRAJ_DB[key]
                });
            }
        }
    });

    return details;
};

/**
 * Main Tajwid Analysis Function
 * Order of addition matters! Specific rules first, General rules last.
 */
export const analyzeTajwid = (text: string, nextText?: string, location?: string, isEndAyah: boolean = false): TajwidRule[] => {
    const cleanText = text.trim();
    const nextFirstChar = nextText ? nextText.trim().charAt(0) : ''; 
    
    // --- CACHE CHECK ---
    const cacheKey = `${cleanText}|${nextFirstChar}|${location || ''}|${isEndAyah ? '1' : '0'}`;
    if (TAJWID_CACHE.has(cacheKey)) {
        return TAJWID_CACHE.get(cacheKey)!;
    }

    const rules: TajwidRule[] = [];

    // Helper to add indices
    const addRule = (name: string, description: string, color: string, regex: RegExp) => {
        const indexes: number[] = [];
        // Global match to find all occurrences in the word
        // Clone regex to avoid state issues with global flag
        const globalRegex = new RegExp(regex); 
        let match;
        while ((match = globalRegex.exec(cleanText)) !== null) {
            // Add all indices of the match
            for (let i = 0; i < match[0].length; i++) {
                indexes.push(match.index + i);
            }
        }
        
        if (indexes.length > 0) {
            // Check for duplicates
            if (!rules.some(r => r.name === name)) {
                rules.push({ name, description, color, indexes });
            }
        }
    };

    // 0. Check Special Rules (Gharib)
    if (location && SPECIAL_RULES[location]) {
        rules.push({
            ...SPECIAL_RULES[location],
            indexes: Array.from({ length: cleanText.length }, (_, i) => i) // Highlight whole word
        });
    }

    // --- 1. PRIORITY 1: MAD (SPECIFIC) ---
    
    // Mad 'Arid Lissukun (End of Ayah)
    if (isEndAyah) {
        // Construct regex dynamically only for this specific check which is rare (once per ayah)
        const MAD_THABII_PATTERN = '(?:\u064E\u0627|\u064E?\u0670|\u0650\u064A\u0652?|\u064F\u0648\u0652?)';
        const MAD_LAYYIN_PATTERN = '(?:\u064E[\u0648\u064A]\u0652)';
        const regex = new RegExp(`(${MAD_THABII_PATTERN}|${MAD_LAYYIN_PATTERN})[\u0600-\u06FF]${HARAKAT_PATTERN}$`);
        if (regex.test(cleanText)) {
             addRule(
                "Mad 'Arid Lissukun",
                "Mad Thabi'i/Layyin bertemu huruf hidup di akhir ayat yang dimatikan.",
                "text-indigo-600 dark:text-indigo-400",
                regex
            );
        }
    }

    // Mad Wajib/Jaiz (Madda sign)
    addRule(
        "Mad Wajib/Jaiz",
        "Terdapat tanda layar/alis. Panjangkan 4-5 harakat.",
        "text-purple-600 dark:text-purple-400",
        MAD_WAJIB_REGEX
    );

    // --- 2. PRIORITY 2: GHUNNAH & QALQALAH ---
    // Ghunnah Musyadadah (High Visual Priority)
    addRule(
        "Ghunnah Musyadadah", 
        "Nun/Mim bertasydid. Tahan dengung.", 
        "text-pink-600 dark:text-pink-400", 
        GHUNNAH_REGEX
    );

    // Qalqalah Sugra (Middle) & Kubra (Detection)
    addRule("Qalqalah", "Pantulan (Baju Di Toko).", "text-yellow-600 dark:text-yellow-400", QALQALAH_REGEX);

    // --- 3. PRIORITY 3: INTER-WORD RULES (IDGHAM, IKHFA, ETC) ---
    // Only applies if nextText is available
    
    if (nextFirstChar) {
        // Helper to highlight END OF WORD if rule applies
        const addEndRule = (name: string, desc: string, color: string) => {
            const lastIndex = cleanText.length - 1;
            const indexes = [lastIndex];
            if (cleanText.length > 1) indexes.push(lastIndex - 1);
            
            if (!rules.some(r => r.name === name)) {
                rules.push({ name, description: desc, color, indexes });
            }
        };

        if (ENDING_NUN_MATI.test(cleanText) || ENDING_TANWIN.test(cleanText)) {
            if (new RegExp(HURUF_IDGHAM_BIGUNNAH).test(nextFirstChar)) {
                addEndRule("Idgham Bigunnah", "Lelehkan bunyi ke huruf depan dengan dengung.", "text-pink-600 dark:text-pink-400");
            } else if (new RegExp(HURUF_IDGHAM_BILAGUNNAH).test(nextFirstChar)) {
                addEndRule("Idgham Bilagunnah", "Lelehkan bunyi ke huruf depan TANPA dengung.", "text-slate-500 dark:text-slate-400");
            } else if (new RegExp(HURUF_IQLAB).test(nextFirstChar)) {
                addEndRule("Iqlab", "Bunyi Nun/Tanwin berubah menjadi Mim samar.", "text-blue-600 dark:text-blue-400");
            } else if (new RegExp(HURUF_IKHFA).test(nextFirstChar)) {
                addEndRule("Ikhfa Haqiqi", "Samarkan bunyi Nun/Tanwin, tahan dengung.", "text-emerald-600 dark:text-emerald-400");
            } else if (new RegExp(HURUF_HALQI).test(nextFirstChar)) {
                addEndRule("Izhar Halqi", "Jelaskan bunyi Nun/Tanwin tanpa dengung.", "text-slate-600 dark:text-slate-400");
            }
        }

        if (ENDING_MIM_MATI.test(cleanText)) {
            if (new RegExp(HURUF_MIM).test(nextFirstChar)) {
                addEndRule("Idgham Mimi", "Mim bertemu Mim. Masukkan dengan dengung.", "text-pink-600 dark:text-pink-400");
            } else if (new RegExp(HURUF_BA).test(nextFirstChar)) {
                addEndRule("Ikhfa Syafawi", "Mim bertemu Ba. Samarkan di bibir dengan dengung.", "text-emerald-600 dark:text-emerald-400");
            }
        }
    }

    // --- 4. INTRA-WORD NUN MATI ---
    addRule("Ikhfa Haqiqi", "Samarkan bunyi Nun Mati, tahan dengung.", "text-emerald-600 dark:text-emerald-400", IKHFA_INTRA_REGEX);
    addRule("Iqlab", "Ganti bunyi Nun menjadi Mim.", "text-blue-600 dark:text-blue-400", IQLAB_INTRA_REGEX);
    addRule("Izhar Halqi", "Baca Nun Mati dengan jelas.", "text-slate-600 dark:text-slate-400", IZHAR_INTRA_REGEX);

    // --- 5. ALIF LAM ---
    addRule("Alif Lam Syamsiah", "Alif Lam lebur ke huruf berikutnya.", "text-orange-600 dark:text-orange-400", ALIF_LAM_SYAMSIAH_REGEX);
    
    // Check Alif Lam Qamariyah logic (needs contextual check)
    if (/^(ٱ?لْ)/.test(cleanText) || (/^(ٱ?ل)/.test(cleanText) && ALIF_LAM_QAMARIYAH_CHECK.test(cleanText))) {
        addRule("Alif Lam Qamariyah", "Lam mati dibaca jelas.", "text-blue-600 dark:text-blue-400", ALIF_LAM_BASE_REGEX);
    }

    // --- 6. LAM JALALAH ---
    addRule("Lam Jalalah", "Lafaz Allah.", "text-teal-600 dark:text-teal-400", LAM_JALALAH_REGEX);

    // --- 7. MAD LAYYIN ---
    addRule(
        "Mad Layyin", 
        "Huruf Waw/Ya sukun didahului Fathah. Lembutkan.", 
        "text-yellow-600 dark:text-yellow-400", 
        MAD_LAYYIN_REGEX
    );

    // --- 8. MAD THABI'I (GENERAL - LOWEST PRIORITY) ---
    addRule(
        "Mad Thabi'i",
        "Panjangkan bacaan 2 harakat.",
        "text-slate-500 dark:text-slate-400", 
        MAD_THABII_REGEX
    );

    // --- SAVE TO CACHE ---
    if (TAJWID_CACHE.size > MAX_CACHE_SIZE) {
        TAJWID_CACHE.clear(); // Simple eviction strategy
    }
    TAJWID_CACHE.set(cacheKey, rules);

    return rules;
};
