// --- HAFALAN CONSTANTS ---
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

// --- WEIGHTED SCORE SYSTEM ---
// Defines verses that are significantly longer than average.
export const HEAVY_VERSES: Record<string, number> = {
  // --- QS. Al-Baqarah (2) ---
  "2:102": 10,
  "2:177": 5,
  "2:196": 10,
  "2:217": 7,
  "2:233": 7,
  "2:246": 9,
  "2:255": 5,
  "2:258": 6,
  "2:259": 9,
  "2:282": 15,
  "2:283": 5,
  "2:284": 3,
  "2:285": 4,
  "2:286": 7,

  // --- QS. Ali 'Imran (3) ---
  "3:154": 9,
  "3:164": 4,

  // --- QS. An-Nisa' (4) ---
  "4:11": 9,
  "4:12": 9,
  "4:23": 6,
  "4:176": 6,

  // --- QS. Al-Ma'idah (5) ---
  "5:3": 7,

  // --- QS. Al-An'am (6) ---
  "6:145": 5,

  // --- QS. At-Taubah (9) ---
  "9:60": 4,

  // --- QS. An-Nur (24) ---
  "24:31": 9,
  "24:35": 6,
  "24:61": 8,

  // --- QS. Al-Ahzab (33) ---
  "33:35": 5,
  "33:50": 8,
  "33:53": 9,

  // --- QS. Al-Fath (48) ---
  "48:29": 10,

  // --- QS. Al-Muzzammil (73) ---
  "73:20": 12,
};

export const BADGES = [
  // --- STARTER ---
  {
    id: "first_step",
    name: "Langkah Pertama",
    description: "Memulai hafalan pertama",
    icon: "🌱",
  },
  {
    id: "streak_7",
    name: "Istiqomah Seminggu",
    description: "Streak 7 hari berturut-turut",
    icon: "🔥",
  },
  {
    id: "streak_30",
    name: "Penjaga Al-Quran",
    description: "Streak 30 hari berturut-turut",
    icon: "🛡️",
  },

  // --- MASTERY (MUTQIN) ---
  {
    id: "mutqin_10",
    name: "Bibit Mutqin",
    description: "Punya 10 item dengan level Mutqin (Lancar)",
    icon: "💎",
  },
  {
    id: "mutqin_50",
    name: "Hafiz Tangguh",
    description: "Punya 50 item dengan level Mutqin",
    icon: "👑",
  },

  // --- JUZ MILESTONES ---
  {
    id: "juz_30_master",
    name: "Master Juz Amma",
    description: "Menghafal seluruh surat di Juz 30",
    icon: "🍇",
  },
  {
    id: "juz_1_pioneer",
    name: "Pembuka Al-Baqarah",
    description: "Menghafal Al-Fatihah & Al-Baqarah",
    icon: "🐄",
  },
  {
    id: "half_quran",
    name: "Separuh Perjalanan",
    description: "Menghafal setara 15 Juz",
    icon: "🌓",
  },
  {
    id: "khatam_hafiz",
    name: "Khatam 30 Juz",
    description: "Menyelesaikan hafalan 30 Juz",
    icon: "🕌",
  },

  // --- POPULAR SURAHS (NEW) ---
  {
    id: "kahf_friday",
    name: "Cahaya Jumat",
    description: "Murajaah Surat Al-Kahf di hari Jumat",
    icon: "🔦",
  },
  {
    id: "mulk_master",
    name: "Pelindung Tidur",
    description: "Mulai menghafal Surat Al-Mulk",
    icon: "🛌",
  },
  {
    id: "waqiah_provider",
    name: "Ahli Waqiah",
    description: "Mulai menghafal Surat Al-Waqi'ah",
    icon: "💰",
  },
  {
    id: "rahman_lover",
    name: "Kekasih Ar-Rahman",
    description: "Mulai menghafal Surat Ar-Rahman",
    icon: "❤️",
  },

  // --- HABITS ---
  {
    id: "fajr_warrior",
    name: "Pejuang Subuh",
    description: "Murajaah di waktu Subuh (04:00 - 06:00)",
    icon: "🌅",
  },
  {
    id: "night_owl",
    name: "Ahli Tahajjud",
    description: "Murajaah di sepertiga malam (00:00 - 03:00)",
    icon: "🌙",
  },
  {
    id: "level_10",
    name: "Pelajar Senior",
    description: "Mencapai Level 10",
    icon: "🎓",
  },
];

export const HAFALAN_FAQ = [
  {
    question: "Apa itu metode SRS (Spaced Repetition System)?",
    answer:
      "Coba bayangin SRS itu kayak 'Asisten Pribadi' yang tahu banget kapan kamu mulai lupa.\n\nDaripada kamu capek mengulang semua hafalan tiap hari, metode ini cuma bakal nyodorin ayat-ayat yang udah mau kamu lupain aja.\n\n• Kalau lancar, jadwal murajaah berikutnya bakal makin lama (3 hari, 7 hari, dst).\n• Kalau lupa, besoknya bakal disuruh ulang lagi.\n\nHasilnya: Hafalan nempel kuat (mutqin) tapi waktu belajar kamu jadi jauh lebih hemat.",
  },
  {
    question: "Maksud 'Level' di aplikasi ini apa ya?",
    answer:
      "Level ini cuma penanda seberapa rajin (istiqomah) kamu memakai aplikasi ini, mirip seperti 'Jam Terbang'.\n\nSemakin sering kamu murajaah dan menambah hafalan, level kamu akan naik. Ini dibuat biar kamu makin semangat menjaga Al-Quran, bukan untuk pamer atau menilai kualitas ibadah kok. Jadi jangan bingung ya!",
  },
  {
    question: "Kenapa audio Qori tidak bunyi di Mode Hafalan?",
    answer:
      "Sengaja banget! Biar hafalan kamu kuat, kita harus 'memaksa' otak mengingat (Active Recall) dulu tanpa bantuan.\n\nKalau langsung bunyi, nanti kamu jadi 'menebak' bukan 'mengingat'. Kalau mentok banget, baru deh tekan tombol 'Bantu Saya' atau ikon speaker.",
  },
  {
    question: "Gimana cara ganti Qori atau kecepatan audio?",
    answer:
      "Saat audio player muncul (di Mode Latihan atau setelah klik 'Bantu Saya'), kamu bisa pilih nama Qori di menu dropdown (ada Syaikh Husary, Mishary, dll). Kamu juga bisa klik tombol '1x' buat ubah kecepatannya jadi lebih lambat atau cepat.",
  },
  {
    question: "Kapan aja jadwal murajaah bakal muncul?",
    answer:
      "Di aplikasi ini, jadwalnya gini:\n• Hari ke-0: Hafalan Baru\n• Hari ke-1: Murajaah Pertama\n• Hari ke-3: Murajaah Kedua\n• Hari ke-7: Murajaah Ketiga\n• Hari ke-14: Murajaah Keempat\n• Hari ke-30: Murajaah Kelima (Mutqin/Lancar)\n\nKalau kamu jawab 'Lancar', ayatnya naik level. Kalau 'Lupa', balik lagi ke level awal (Besok).",
  },
  {
    question: "Apa bedanya tombol 'Lancar' sama 'Lupa'?",
    answer:
      "Jujur itu kuncinya, ya!\n• Pilih 'Lancar' kalau kamu bisa baca ayat itu tanpa ngintip teks dan tanpa terbata-bata.\n• Pilih 'Lupa / Salah' kalau ada salah tajwid, lupa sambungan ayat, atau harus ngintip teks.\n\nKalau pilih 'Lupa', sistem bakal minta kamu ulang lagi besok biar makin kuat ingatannya.",
  },
  {
    question: "Kenapa kuota harian saya tiba-tiba penuh?",
    answer:
      "Sekarang kami pakai sistem 'Poin Beban'. Ayat pendek hitungannya 1 Poin, tapi ayat panjang (kayak Ayat Kursi atau Al-Baqarah 282) poinnya bisa sampai 15.\n\nJadi kalau kamu pilih ayat yang panjang banget, kuota harian kamu bakal cepet habis biar kamu nggak 'burnout' (kecapekan mental).",
  },
  {
    question: "Gimana cara naikin Level saya?",
    answer:
      "Kamu dapat Poin (XP) setiap kali berinteraksi:\n\n• Hafalan Baru: Poin Paling Besar (10 XP x Bobot)\n• Murajaah Lancar: Poin Sedang (5 XP x Bobot)\n• Murajaah Lupa: Tetap Dapat Poin Kecil (1 XP x Bobot)\n\nAyat yang panjang poinnya lebih besar daripada ayat pendek.",
  },
];
