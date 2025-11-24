/**
 * Advanced Tajwid Analysis Helper
 * Handles Intra-word rules, Inter-word rules (Nun Mati/Tanwin, Mad), and Special Cases.
 */

interface TajwidRule {
  name: string;
  description: string;
  color: string; // Tailwind class for badge
}

// --- REGEX PATTERNS (ARABIC UNICODE) ---
// Harakat & Diacritics
const FATHA = "\u064E";
const DAMMA = "\u064F";
const KASRA = "\u0650";
const SUKUN = "\u0652";
const SHADDA = "\u0651";
const MADDA_SIGN = "\u0653"; // Tanda layar/alis
const SMALL_ALIF = "\u0670"; // Alif Khanjareeya

// Tanwin
const FATHATAIN = "\u064B";
const DAMMATAIN = "\u064C";
const KASRATAIN = "\u064D";

// Letters Groups
const HURUF_HALQI = "[ءأإهعحغخ]";
const HURUF_IDGHAM_BIGUNNAH = "[يمنو]";
const HURUF_IDGHAM_BILAGUNNAH = "[لر]";
const HURUF_IQLAB = "ب";
const HURUF_IKHFA = "[تثجدذزسشصضطظفقك]";
const HURUF_QALQALAH = "[قطبجد]";
const HURUF_MIM = "م";
const HURUF_BA = "ب";
const HURUF_MAD = "[اويى]";
const HAMZAH_FORMS = "[ءأإ]";

// Special Cases Lookup (Location based: "surah:ayah:wordPosition")
const SPECIAL_RULES: Record<string, TajwidRule> = {
  "11:41:6": {
    name: "Imalah (Gharib)",
    description:
      "Bacaan 'Majreeha' dibaca miring (seperti bunyi 'Re' pada sate).",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700",
  },
  "12:11:6": {
    name: "Isymam (Gharib)",
    description: "Isyarat bibir mencucu di tengah dengung tanpa suara.",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700",
  },
  "41:44:10": {
    name: "Tashil (Gharib)",
    description: "Hamzah kedua dibaca samar/ringan.",
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-700",
  },
  "75:27:3": {
    name: "Saktah (Gharib)",
    description: "Berhenti sejenak tanpa mengambil napas.",
    color:
      "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700",
  },
  "18:1:9": {
    name: "Saktah (Gharib)",
    description:
      "Berhenti sejenak tanpa mengambil napas sebelum ayat berikutnya.",
    color:
      "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700",
  },
  "36:52:6": {
    name: "Saktah (Gharib)",
    description: "Berhenti sejenak tanpa mengambil napas.",
    color:
      "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700",
  },
  "83:14:2": {
    name: "Saktah (Gharib)",
    description: "Berhenti sejenak tanpa mengambil napas.",
    color:
      "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-700",
  },
};

export const analyzeTajwid = (
  text: string,
  nextText?: string,
  location?: string
): TajwidRule[] => {
  const rules: TajwidRule[] = [];

  // 0. Check Special Rules (Gharib)
  if (location && SPECIAL_RULES[location]) {
    rules.push(SPECIAL_RULES[location]);
  }

  const cleanText = text.trim();
  // Uthmani Script nuances: Nun Sukun is often written as just 'Nun' without harakat when followed by Idgham/Ikhfa
  // So we check for Nun ending with Sukun OR Nun ending with no vowels.
  const lastChar = cleanText.slice(-1);

  // Get first char of next word (strip Alif Lam Syamsiyah markers if needed, but raw is usually fine)
  const nextClean = nextText ? nextText.trim() : "";
  const nextFirstChar = nextClean.charAt(0);

  // Detect Nun Mati / Tanwin at End of Word
  const hasNunSakinahSuffix = /ن$|نْ$/.test(cleanText); // Nun at end or Nun Sukun
  const hasTanwinSuffix = new RegExp(
    `[${FATHATAIN}${DAMMATAIN}${KASRATAIN}]$`
  ).test(cleanText);
  const isNunOrTanwin = hasNunSakinahSuffix || hasTanwinSuffix;

  // --- 1. HUKUM NUN MATI & TANWIN (ANTAR KATA) ---
  if (isNunOrTanwin && nextFirstChar) {
    if (new RegExp(HURUF_IDGHAM_BIGUNNAH).test(nextFirstChar)) {
      rules.push({
        name: "Idgham Bigunnah",
        description: "Leburkan bunyi N ke huruf depannya dengan dengung.",
        color:
          "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border border-pink-200 dark:border-pink-800",
      });
    } else if (new RegExp(HURUF_IDGHAM_BILAGUNNAH).test(nextFirstChar)) {
      rules.push({
        name: "Idgham Bilagunnah",
        description: "Leburkan bunyi N ke huruf depannya TANPA dengung.",
        color:
          "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600",
      });
    } else if (new RegExp(HURUF_IQLAB).test(nextFirstChar)) {
      rules.push({
        name: "Iqlab",
        description: "Bunyi N berubah menjadi Mim samar dengan dengung.",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800",
      });
    } else if (new RegExp(HURUF_IKHFA).test(nextFirstChar)) {
      rules.push({
        name: "Ikhfa Haqiqi",
        description: "Samarkan bunyi N, tahan dengung 2-3 harakat.",
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800",
      });
    } else if (new RegExp(HURUF_HALQI).test(nextFirstChar)) {
      rules.push({
        name: "Izhar Halqi",
        description: "Baca N dengan jelas, tegas, tanpa dengung.",
        color:
          "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600",
      });
    }
  }

  // --- 2. HUKUM NUN MATI (DALAM KATA / INTRA-WORD) ---
  if (/نْ[تثجدذزسشصضطظفقك]/.test(cleanText)) {
    rules.push({
      name: "Ikhfa Haqiqi (Satu Kata)",
      description: "Samarkan bunyi Nun di tengah kata.",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    });
  }
  if (/نْ[ب]/.test(cleanText) || /ۢ/.test(cleanText)) {
    rules.push({
      name: "Iqlab",
      description: "Nun Mati bertemu Ba di satu kata.",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    });
  }
  // Izhar Mutlaq (Worldly Izhar) - Specific Words
  if (/(دنْيَا|بنْيَان|قنْوَان|صنْوَان)/.test(cleanText)) {
    rules.push({
      name: "Izhar Mutlaq",
      description:
        "Pengecualian: Nun mati bertemu Ya/Waw dalam satu kata. Baca JELAS.",
      color:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800",
    });
  }

  // --- 3. HUKUM MIM MATI ---
  // Check ending Mim Sakinah
  const endsWithMimSakinah = /م$|مْ$/.test(cleanText);
  if (endsWithMimSakinah && nextFirstChar) {
    if (new RegExp(HURUF_MIM).test(nextFirstChar)) {
      rules.push({
        name: "Idgham Mimi",
        description: "Mim bertemu Mim. Masukkan dengan dengung sempurna.",
        color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      });
    } else if (new RegExp(HURUF_BA).test(nextFirstChar)) {
      rules.push({
        name: "Ikhfa Syafawi",
        description: "Mim bertemu Ba. Samarkan bibir dengan dengung.",
        color:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
      });
    } else {
      rules.push({
        name: "Izhar Syafawi",
        description:
          "Mim bertemu huruf lain. Baca jelas di bibir tanpa dengung.",
        color:
          "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200",
      });
    }
  }

  // --- 4. HUKUM MAD (PANJANG) ---

  // Mad Jaiz Munfasil (Antar Kata)
  // Pattern: Ends with Mad Letter (Alif/Waw/Ya) + Next word starts with Hamzah/Alif
  // Uthmani often puts a madd sign (~) on top if it meets Hamzah
  const hasMaddSign = cleanText.includes(MADDA_SIGN);

  if (
    hasMaddSign &&
    nextFirstChar &&
    new RegExp(HAMZAH_FORMS).test(nextFirstChar)
  ) {
    rules.push({
      name: "Mad Jaiz Munfasil",
      description: "Mad bertemu Hamzah di lain kata. Panjangkan 4-5 harakat.",
      color:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800",
    });
  }
  // Mad Wajib Muttasil (Dalam Kata)
  // Pattern: Mad + Hamzah in same word. Usually marked with Madd Sign inside word followed by Hamzah
  else if (hasMaddSign && new RegExp(`${HAMZAH_FORMS}`).test(cleanText)) {
    rules.push({
      name: "Mad Wajib Muttasil",
      description:
        "Mad bertemu Hamzah dalam satu kata. Wajib panjang 4-5 harakat.",
      color:
        "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 border border-violet-200 dark:border-violet-800",
    });
  }
  // Mad Lazim (Simplistic detection via Madd Sign + Shadda/Sukun)
  else if (
    hasMaddSign &&
    (cleanText.includes(SHADDA) || cleanText.includes(SUKUN))
  ) {
    rules.push({
      name: "Mad Lazim",
      description: "Mad bertemu Tasydid/Sukun. Panjangkan 6 harakat (berat).",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800",
    });
  }

  // Mad Thabi'i (Generic)
  // Check for Fatha+Alif, Kasra+Ya, Damma+Waw NOT followed by Hamzah/Sukun immediately
  // This is a fallback rule if no specific Mad rules apply
  const hasMadPattern = /(َ[اى]|ِ[يۦ]|ُ[و])/.test(cleanText);
  if (hasMadPattern && rules.length === 0) {
    rules.push({
      name: "Mad Thabi'i",
      description: "Panjangkan 2 harakat (ayunan normal).",
      color:
        "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700",
    });
  }

  // --- 5. ALIF LAM (SYAMSIYAH & QAMARIYAH) ---
  if (cleanText.startsWith("ٱل")) {
    // Check 3rd character (after Alif + Lam)
    const thirdChar = cleanText[2] || cleanText[3]; // Sometimes indexes shift due to tashkeel
    if (thirdChar && cleanText.includes(SHADDA)) {
      // Check if Shadda exists early in word
      rules.push({
        name: "Alif Lam Syamsiyah",
        description:
          "Lam dianggap tidak ada. Masuk langsung ke huruf bertasydid.",
        color:
          "bg-orange-50 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200",
      });
    } else {
      rules.push({
        name: "Alif Lam Qamariyah",
        description: "Lam sukun dibaca jelas.",
        color: "bg-sky-50 text-sky-800 dark:bg-sky-900/50 dark:text-sky-200",
      });
    }
  }

  // --- 6. QALQALAH ---
  // Sugra (Tengah)
  if (new RegExp(`${HURUF_QALQALAH}${SUKUN}`).test(cleanText)) {
    rules.push({
      name: "Qalqalah Sugra",
      description: "Pantulan ringan di tengah kata.",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800",
    });
  }
  // Kubra (Akhir - Jika Waqaf)
  const lastLetter = cleanText.replace(/[ًٌٍَُِّْ]/g, "").slice(-1); // Strip harakat to get raw letter
  if ("قطبجد".includes(lastLetter)) {
    rules.push({
      name: "Qalqalah Kubra (Jika Waqaf)",
      description: "Jika berhenti, pantulkan suara huruf akhir dengan kuat.",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800",
    });
  }

  // --- 7. GHUNNAH MUSYADADAH ---
  if (/نّ|مّ/.test(cleanText) || new RegExp(`[نم]${SHADDA}`).test(cleanText)) {
    rules.push({
      name: "Ghunnah Musyadadah",
      description: "Nun/Mim bertasydid. Tahan dengung yang kuat (2-3 harakat).",
      color:
        "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border border-pink-200 dark:border-pink-800",
    });
  }

  // --- 8. HUKUM RO (TAFKHIM/TARQIQ) ---
  // Ro Fatha/Damma -> Tafkhim
  if (
    new RegExp(`ر${FATHA}|ر${DAMMA}|ر${FATHATAIN}|ر${DAMMATAIN}`).test(
      cleanText
    )
  ) {
    rules.push({
      name: "Ro Tafkhim",
      description: "Huruf Ro dibaca tebal (mulut membulat).",
      color:
        "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
    });
  }
  // Ro Kasra -> Tarqiq
  else if (new RegExp(`ر${KASRA}|ر${KASRATAIN}`).test(cleanText)) {
    rules.push({
      name: "Ro Tarqiq",
      description: "Huruf Ro dibaca tipis (meringis).",
      color:
        "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700",
    });
  }

  // --- 9. LAM JALALAH (ALLAH) ---
  if (cleanText.includes("ٱللَّه")) {
    rules.push({
      name: "Lam Jalalah",
      description:
        "Lafaz Allah. Tebal jika didahului Fathah/Dammah, Tipis jika Kasrah.",
      color:
        "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200 border border-teal-200 dark:border-teal-800",
    });
  }

  // Remove duplicates based on name
  return rules.filter(
    (v, i, a) => a.findIndex((v2) => v2.name === v.name) === i
  );
};
