/**
 * Advanced Tajwid Analysis Helper
 * Handles Intra-word rules, Inter-word rules (Nun Mati/Tanwin), and Special Cases (Isymam, etc.)
 */

interface TajwidRule {
    name: string;
    description: string;
    color: string; // Tailwind class for badge
}

// --- REGEX PATTERNS (ARABIC UNICODE) ---
// Harakat
const FATHA = '\u064E';
const KASRA = '\u0650';
const DAMMA = '\u064F';
const SUKUN = '\u0652';
const SHADDA = '\u0651';

// Tanwin
const FATHATAIN = '\u064B';
const DAMMATAIN = '\u064C';
const KASRATAIN = '\u064D';

// Letters Groups
const HURUF_HALQI = '[ءأإهعحغخ]'; // Izhar Halqi
const HURUF_IDGHAM_BIGUNNAH = '[يمنو]';
const HURUF_IDGHAM_BILAGUNNAH = '[لر]';
const HURUF_IQLAB = 'ب';
const HURUF_IKHFA = '[تثجدذزسشصضطظفقك]';
const HURUF_QALQALAH = '[قطبجد]';
const HURUF_MIM = 'م';
const HURUF_BA = 'ب';

// Special Cases Lookup (Location based: "surah:ayah:wordPosition")
// Updated indices based on standard Uthmani word segmentation
const SPECIAL_RULES: Record<string, TajwidRule> = {
    // IMALAH: QS Hud (11:41) - Majreeha (Word 6 approx)
    "11:41:6": {
        name: "Imalah (Gharib)",
        description: "Bacaan 'Majreeha' dibaca miring antara Fatah dan Kasrah (seperti bunyi 'Re' pada sate).",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
    },
    // ISYMAM: QS Yusuf (12:11) - Ta'manna (Word 6)
    "12:11:6": { // Corrected from 5
        name: "Isymam (Gharib)",
        description: "Mencucu (isyarat bibir) di tengah dengung tanpa suara pada kata 'Laa Ta'manna'.",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
    },
    // TASHIL: QS Fussilat (41:44) - A'jamiyyun (Word 10)
    "41:44:10": { // Corrected from 2
        name: "Tashil (Gharib)",
        description: "Hamzah kedua dibaca samar/ringan (antara Hamzah dan Alif).",
        color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
    },
    // SAKTAH: QS Al-Qiyamah (75:27) - Man (Word 3)
    "75:27:3": { // Corrected from 2
        name: "Saktah (Gharib)",
        description: "Berhenti sejenak tanpa mengambil napas.",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700"
    },
    // SAKTAH: QS Al-Kahf (18:1) - 'Iwaja (Word 9 approx)
    "18:1:9": { 
        name: "Saktah (Gharib)",
        description: "Berhenti sejenak tanpa mengambil napas sebelum lanjut ke ayat berikutnya.",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700"
    },
    // SAKTAH: QS Yasin (36:52) - Marqadina (Word 6)
    "36:52:6": { 
        name: "Saktah (Gharib)",
        description: "Berhenti sejenak tanpa mengambil napas.",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700"
    },
    // SAKTAH: QS Al-Mutaffifin (83:14) - Bal (Word 2)
    "83:14:2": { 
        name: "Saktah (Gharib)",
        description: "Berhenti sejenak tanpa mengambil napas.",
        color: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700"
    }
};

export const analyzeTajwid = (text: string, nextText?: string, location?: string): TajwidRule[] => {
    const rules: TajwidRule[] = [];
    
    // 0. Check Special Rules (Gharib) - High Priority
    // Checks if the specific location exists in our map
    if (location) {
        // Direct match
        if (SPECIAL_RULES[location]) {
            rules.push(SPECIAL_RULES[location]);
        } 
        // Fallback: sometimes API splitting is inconsistent, we can add fuzzy logic here later if needed.
    }

    // Normalize Text (Remove some marks for easier regex but keep Harakat for precision)
    const cleanText = text; 
    const lastChar = cleanText.slice(-1); 
    const nextFirstChar = nextText ? nextText.trim().charAt(0) : ''; 

    // Helpers
    const endsWithNunSakinah = new RegExp(`ن${SUKUN}$`).test(cleanText);
    const endsWithTanwin = new RegExp(`[${FATHATAIN}${DAMMATAIN}${KASRATAIN}]$`).test(cleanText);
    const endsWithMimSakinah = new RegExp(`م${SUKUN}$`).test(cleanText);

    // --- 1. HUKUM NUN MATI & TANWIN (Inter-word & Intra-word) ---
    
    // A. Intra-word (Dalam satu kata)
    if (/نْ[تثجدذزسشصضطظفقك]/.test(cleanText)) {
        rules.push({ name: "Ikhfa Haqiqi", description: "Samarkan bunyi Nun Mati, tahan dengung 2-3 harakat.", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" });
    }
    if (/نْ[ب]/.test(cleanText) || /ۢ/.test(cleanText)) { // Small Meem (Iqlab marker)
        rules.push({ name: "Iqlab", description: "Ganti bunyi Nun menjadi Mim, tahan dengung.", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" });
    }
    if (/نْ[ءأإهعحغخ]/.test(cleanText)) {
        rules.push({ name: "Izhar Halqi", description: "Baca Nun Mati dengan jelas tanpa dengung.", color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" });
    }

    // B. Inter-word (Antara dua kata)
    if ((endsWithNunSakinah || endsWithTanwin) && nextFirstChar) {
        if (new RegExp(HURUF_IDGHAM_BIGUNNAH).test(nextFirstChar)) {
            rules.push({ name: "Idgham Bigunnah", description: "Lelehkan bunyi ke huruf depannya dengan dengung (Ghunnah).", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" });
        } else if (new RegExp(HURUF_IDGHAM_BILAGUNNAH).test(nextFirstChar)) {
            rules.push({ name: "Idgham Bilagunnah", description: "Lelehkan bunyi ke huruf depannya TANPA dengung.", color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200" });
        } else if (new RegExp(HURUF_IQLAB).test(nextFirstChar)) {
            rules.push({ name: "Iqlab", description: "Bunyi Nun/Tanwin berubah menjadi Mim samar dengan dengung.", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" });
        } else if (new RegExp(HURUF_IKHFA).test(nextFirstChar)) {
            rules.push({ name: "Ikhfa Haqiqi", description: "Samarkan bunyi Nun/Tanwin, tahan dengung.", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" });
        } else if (new RegExp(HURUF_HALQI).test(nextFirstChar)) {
            rules.push({ name: "Izhar Halqi", description: "Jelaskan bunyi Nun/Tanwin tanpa dengung.", color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" });
        }
    }

    // --- 2. HUKUM MIM MATI ---
    if (endsWithMimSakinah && nextFirstChar) {
        if (new RegExp(HURUF_MIM).test(nextFirstChar)) {
            rules.push({ name: "Idgham Mimi (Mutamatsilain)", description: "Mim bertemu Mim. Masukkan dengan dengung sempurna.", color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200" });
        } else if (new RegExp(HURUF_BA).test(nextFirstChar)) {
            rules.push({ name: "Ikhfa Syafawi", description: "Mim bertemu Ba. Samarkan bunyi Mim di bibir dengan dengung.", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200" });
        } else {
            rules.push({ name: "Izhar Syafawi", description: "Mim bertemu huruf lain. Baca jelas di bibir tanpa dengung.", color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200" });
        }
    }

    // --- 3. QALQALAH ---
    if (new RegExp(`${HURUF_QALQALAH}${SUKUN}`).test(cleanText)) {
        rules.push({
            name: "Qalqalah Sugra",
            description: "Pantulkan suara huruf mati di tengah kata dengan ringan.",
            color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        });
    }
    // Check end of word for potential Qalqalah Kubra (if stopped)
    if (new RegExp(`[${HURUF_QALQALAH.replace('[','').replace(']','')}]$`).test(cleanText) || new RegExp(`${HURUF_QALQALAH}[${FATHA}${KASRA}${DAMMA}]`).test(cleanText)) {
         // Only suggest if it's the last letter
         const lastLetter = cleanText.trim().slice(-1);
         if ('قطبجد'.includes(lastLetter)) {
             rules.push({
                name: "Qalqalah Kubra (Jika Waqaf)",
                description: "Jika berhenti di sini, pantulkan suara huruf akhir dengan kuat.",
                color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            });
         }
    }

    // --- 4. GHUNNAH MUSYADADAH ---
    // Nun atau Mim bertasydid
    if (/نّ|مّ/.test(cleanText) || new RegExp(`[نم]${SHADDA}`).test(cleanText)) {
        rules.push({
            name: "Ghunnah Musyadadah",
            description: "Nun/Mim bertasydid. Tahan dengung yang kuat (2-3 harakat).",
            color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
        });
    }

    // --- 5. MAD (Basic Detection) ---
    if (/\u0653/.test(cleanText) || /ۤ/.test(cleanText)) { // Madda sign
        rules.push({
            name: "Mad Wajib/Jaiz",
            description: "Terdapat tanda layar/alis. Panjangkan 4-5 harakat.",
            color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
        });
    }
    else if (/(َ[\u0627\u0649]|ِيْ|ُو)/.test(cleanText) && rules.length === 0) { 
         rules.push({
            name: "Mad Thabi'i",
            description: "Panjangkan bacaan 2 harakat (ayunan normal).",
            color: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
        });
    }

    // --- 6. LAM JALALAH ---
    if (cleanText.includes('ٱللَّه') || cleanText.includes('لِلَّهِ')) {
        rules.push({
            name: "Lam Jalalah",
            description: "Lafaz Allah. Tafkhim (tebal) jika didahului Fathah/Dammah, Tarqiq (tipis) jika Kasrah.",
            color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200"
        });
    }

    // Remove duplicates based on name
    return rules.filter((v,i,a)=>a.findIndex(v2=>(v2.name===v.name))===i);
};