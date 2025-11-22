import type { HeirInputState } from "./types.ts";
import { Heir } from "./types.ts";

// --- HAFALAN CONSTANTS ---
export const SRS_INTERVALS = [0, 1, 3, 7, 14, 30];

export const initialHeirsState: HeirInputState = {
  [Heir.Husband]: 0,
  [Heir.Wife]: 0,
  [Heir.Son]: 0,
  [Heir.Daughter]: 0,
  [Heir.Father]: 0,
  [Heir.Mother]: 0,
  [Heir.Grandfather]: 0,
  [Heir.PaternalGrandmother]: 0,
  [Heir.MaternalGrandmother]: 0,
  [Heir.Grandson]: 0,
  [Heir.Granddaughter]: 0,
  [Heir.FullBrother]: 0,
  [Heir.FullSister]: 0,
  [Heir.PaternalBrother]: 0,
  [Heir.PaternalSister]: 0,
  [Heir.MaternalBrother]: 0,
  [Heir.MaternalSister]: 0,
};

export const HEIR_LABELS: { [key in Heir]: string } = {
  [Heir.Husband]: "Suami",
  [Heir.Wife]: "Istri",
  [Heir.Son]: "Anak Laki-laki",
  [Heir.Daughter]: "Anak Perempuan",
  [Heir.Father]: "Ayah",
  [Heir.Mother]: "Ibu",
  [Heir.Grandfather]: "Kakek (dari Ayah)",
  [Heir.PaternalGrandmother]: "Nenek (dari Ayah)",
  [Heir.MaternalGrandmother]: "Nenek (dari Ibu)",
  [Heir.Grandson]: "Cucu Laki-laki (dari Anak Laki-laki)",
  [Heir.Granddaughter]: "Cucu Perempuan (dari Anak Laki-laki)",
  [Heir.FullBrother]: "Saudara Laki-laki Kandung",
  [Heir.FullSister]: "Saudara Perempuan Kandung",
  [Heir.PaternalBrother]: "Saudara Laki-laki Seayah",
  [Heir.PaternalSister]: "Saudara Perempuan Seayah",
  [Heir.MaternalBrother]: "Saudara Laki-laki Seibu",
  [Heir.MaternalSister]: "Saudara Perempuan Seibu",
};

export const QURAN_REFS = {
  AN_NISA_11: "QS. An-Nisa': 11",
  AN_NISA_12: "QS. An-Nisa': 12",
  AN_NISA_176: "QS. An-Nisa': 176",
};

export const LEGAL_BASIS = {
  HADITH_NEAREST_MALE: "HR. Bukhari & Muslim (Haqqul Faraidh)",
  IJMA: "Ijma' (Kesepakatan) Ulama",
  HADITH_GRANDMOTHER: "Sunan At-Tirmidzi No.2026 & No.2027 (Bab Warisan Nenek)",
  // Special Cases References
  IJTIHAD_UMAR_AUL: "Ijtihad Umar bin Khattab r.a. ('Aul)",
  IJTIHAD_UMAR_UMARIYYATAIN: "Putusan Umar bin Khattab r.a. (Ijma' Sahabat)",
  MAZHAB_ZAID_AKDARIYYAH: "Mazhab Zaid bin Thabit r.a. (Al-Akdariyyah)",
  QAUL_ALI_RADD: "Qaul Ali bin Abi Thalib r.a. & Jumhur (Radd)",
};

export const HEIR_GROUPS = [
  {
    title: "Pasangan & Keturunan Langsung",
    heirs: [Heir.Husband, Heir.Wife, Heir.Son, Heir.Daughter],
  },
  {
    title: "Orang Tua & Kakek-Nenek",
    heirs: [
      Heir.Father,
      Heir.Mother,
      Heir.Grandfather,
      Heir.PaternalGrandmother,
      Heir.MaternalGrandmother,
    ],
  },
  {
    title: "Cucu",
    heirs: [Heir.Grandson, Heir.Granddaughter],
  },
  {
    title: "Saudara Kandung",
    heirs: [Heir.FullBrother, Heir.FullSister],
  },
  {
    title: "Saudara Seayah & Seibu",
    heirs: [
      Heir.PaternalBrother,
      Heir.PaternalSister,
      Heir.MaternalBrother,
      Heir.MaternalSister,
    ],
  },
];

export const FIQH_DEFINITIONS: {
  [key: string]: { title: string; definition: string };
} = {
  AUL: {
    title: "Kasus 'Aul",
    definition:
      "'Aul terjadi ketika total bagian (furudh) para ahli waris melebihi 1 (satu) kesatuan harta. Untuk mengatasinya, penyebut (asal masalah) dinaikkan menjadi sama dengan total pembilang, sehingga bagian setiap ahli waris berkurang secara proporsional. Metode ini pertama kali ditetapkan oleh Umar bin Khattab r.a.",
  },
  RADD: {
    title: "Kasus Radd",
    definition:
      "Radd terjadi ketika total bagian (furudh) para ahli waris kurang dari 1 (satu) kesatuan harta dan tidak ada 'Ashabah. Sisa harta dikembalikan kepada ahli waris furudh (selain suami/istri). Ini adalah pendapat Ali bin Abi Thalib r.a. dan mayoritas ulama muta'akhhirin.",
  },
  UMARIYYATAIN: {
    title: "Kasus 'Umariyyatain",
    definition:
      "Dua kasus khusus yang diputuskan oleh Umar bin Khattab r.a. Jika ahli waris adalah suami/istri, ayah, dan ibu, maka ibu mendapat 1/3 dari sisa harta setelah bagian suami/istri (bukan 1/3 total), agar prinsip bagian laki-laki 2x perempuan (Ayah vs Ibu) tetap terjaga.",
  },
  MUSYTARAKAH: {
    title: "Kasus Al-Musytarakah",
    definition:
      "Kasus di mana saudara kandung laki-laki berisiko tidak mendapat warisan karena harta habis oleh ahli waris furudh lainnya. Umar bin Khattab r.a. memutuskan saudara kandung berserikat (musytarakah) dengan saudara seibu dalam pembagian 1/3.",
  },
  AKDARIYYAH: {
    title: "Kasus Al-Akdariyyah",
    definition:
      "Kasus spesifik (suami, ibu, kakek, saudari kandung). Zaid bin Thabit r.a. menerapkan metode khusus: menjumlahkan bagian kakek dan saudari, lalu membaginya dengan perbandingan 2:1 (laki-laki:perempuan), karena aturan dasar akan merugikan kakek.",
  },
};

// --- AUDIO CONSTANTS ---
export const QORI_LIST = [
  {
    id: "Husary_64kbps",
    name: "Syaikh Al-Husary (Tajwid Guru)",
    speed: "Lambat",
  },
  { id: "Alafasy_64kbps", name: "Syaikh Mishary Rashid", speed: "Sedang" },
  {
    id: "Minshawy_Murattal_128kbps",
    name: "Syaikh Al-Minshawi",
    speed: "Sedang",
  },
  { id: "Ghamadi_40kbps", name: "Saad Al-Ghamdi", speed: "Sedang" },
  {
    id: "Abdul_Basit_Murattal_64kbps",
    name: "Abdul Basit (Murattal)",
    speed: "Sedang",
  },
];

// --- FAQ DATA ---

export const FARAIDH_FAQ = [
  {
    question: "Apa itu Faraidh atau Ilmu Waris Islam?",
    answer:
      "Faraidh (atau Ilmu Mawaris) adalah ilmu yang mempelajari tentang pembagian harta peninggalan seseorang setelah ia meninggal dunia, berdasarkan ketentuan yang telah ditetapkan dalam Al-Qur'an dan As-Sunnah. Ilmu ini memastikan bahwa harta warisan didistribusikan secara adil kepada ahli waris yang berhak.",
  },
  {
    question: "Mengapa pembagian waris menurut Islam itu penting?",
    answer:
      "Melaksanakan pembagian waris sesuai syariat Islam adalah bentuk ketaatan kepada Allah SWT. Aturan ini dirancang untuk mencegah perselisihan antar anggota keluarga, melindungi hak-hak setiap individu (terutama perempuan dan anak-anak), dan menciptakan keadilan serta keharmonisan sosial.",
  },
  {
    question: "Siapa saja yang termasuk ahli waris?",
    answer:
      "Ahli waris utama (Ashabul Furudh) adalah mereka yang bagiannya telah ditentukan secara spesifik dalam Al-Qur'an, seperti suami, istri, anak perempuan, anak laki-laki, ayah, dan ibu. Selain itu, ada ahli waris sisa ('Ashabah) yang mendapat sisa harta, seperti anak laki-laki atau saudara laki-laki. Kalkulator ini akan menentukan siapa yang berhak dan siapa yang terhalang (hajb) secara otomatis.",
  },
  {
    question: "Apakah data yang saya masukkan di kalkulator ini aman?",
    answer:
      "Ya, sangat aman. Semua perhitungan dilakukan langsung di browser Anda (client-side). Tidak ada data pribadi atau data perhitungan yang dikirim atau disimpan di server kami. Privasi Anda 100% terjamin.",
  },
  {
    question: "Apakah hasil kalkulator ini akurat dan bisa dijadikan rujukan?",
    answer:
      "Kalkulator NIZAMY dirancang dengan cermat untuk mengikuti kaidah-kaidah fiqh waris mayoritas ulama (Jumhur Ulama). Hasilnya Insya Allah akurat untuk kasus-kasus umum. Namun, untuk situasi waris yang sangat kompleks atau melibatkan wasiat, utang, atau sengketa, sangat disarankan untuk berkonsultasi lebih lanjut dengan ulama, ahli fiqh, atau lembaga keagamaan yang terpercaya.",
  },
];

export const ZAKAT_FAQ = [
  {
    question: "Apa perbedaan Zakat Fitrah dan Zakat Maal?",
    answer:
      "Zakat Fitrah adalah zakat badan yang wajib dikeluarkan setiap Muslim di bulan Ramadhan (sebelum shalat Idul Fitri) untuk mensucikan diri, biasanya berupa makanan pokok (beras). \n\nZakat Maal adalah zakat harta yang wajib dikeluarkan apabila harta tersebut telah mencapai nisab (batas minimal) dan haul (kepemilikan 1 tahun). Ini mencakup tabungan, emas, perniagaan, dan investasi.",
  },
  {
    question: "Apa itu Nisab dan Haul dalam Zakat?",
    answer:
      "Nisab adalah batas minimal jumlah harta yang menyebabkan harta tersebut wajib dizakati. Contoh: Nisab emas adalah 85 gram. \n\nHaul adalah batas waktu kepemilikan harta yang harus sudah berlalu selama satu tahun hijriyah (kecuali zakat pertanian yang dibayar saat panen).",
  },
  {
    question: "Apa itu Zakat Rikaz dan mengapa tarifnya 20%?",
    answer:
      "Rikaz adalah harta temuan (harta karun terpendam) atau hadiah tak terduga (undian/windfall). \n\nKarena didapatkan tanpa susah payah (biaya/keringat) dan tanpa menunggu satu tahun (haul), syariat menetapkan tarifnya lebih besar yaitu 20% (seperlima) berdasarkan sabda Nabi SAW: 'Dan pada rikaz, (zakatnya) adalah seperlima.' (HR. Bukhari & Muslim).",
  },
  {
    question: "Bagaimana perhitungan Zakat Ternak di aplikasi ini?",
    answer:
      "Aplikasi ini menggunakan pendekatan 'Qiyas Zakat Perniagaan' (berdasarkan nilai jual total dikali 2.5%) untuk memudahkan masyarakat awam. \n\nJika Anda ingin menghitung menggunakan metode konvensional (per ekor/umur hewan seperti 1 kambing untuk 40-120 ekor), disarankan untuk berkonsultasi langsung dengan ustadz atau lembaga amil zakat, karena aturan fiqh-nya sangat mendetail.",
  },
  {
    question: "Apakah hutang mengurangi kewajiban Zakat?",
    answer:
      "Ya, menurut mayoritas ulama, hutang yang jatuh tempo (harus segera dibayar) mengurangi total harta wajib zakat. Kalkulator ini menyediakan kolom 'Hutang' yang akan otomatis mengurangi total aset Anda sebelum dibandingkan dengan nisab.",
  },
  {
    question: "Apakah boleh membayar Zakat Fitrah dengan Uang?",
    answer:
      "Mazhab Syafi'i (yang umum di Indonesia) mewajibkan makanan pokok (beras). Namun, Mazhab Hanafi membolehkan membayar dengan nilai uang (qimah) yang setara. \n\nKalkulator ini menyediakan kedua opsi agar Anda bisa menghitung estimasi biaya jika ingin membayar melalui lembaga zakat yang menerima uang.",
  },
  {
    question: "Mengapa Nisab Emas 85 gram dan Perak 595 gram?",
    answer:
      'Hal ini bersumber dari hadits riwayat Abu Daud No. 1573 dari Ali bin Abi Thalib r.a., di mana Rasulullah SAW bersabda: "...Jika engkau memiliki 200 dirham dan telah berlalu satu tahun, maka zakatnya 5 dirham. Dan tidak ada kewajiban zakat pada emas hingga mencapai 20 dinar..." \n\nUlama kontemporer mengonversi 20 Dinar setara ±85 gram emas dan 200 Dirham setara ±595 gram perak.\n\nJika harta Anda (tunai, tabungan, saham) nilainya setara atau lebih dari harga 85 gram emas saat ini, maka wajib zakat 2.5%.',
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

// --- HAFALAN CONSTANTS ---

export const SURAH_DATA = [
  { number: 1, name: "Al-Fatihah", verses: 7 },
  { number: 2, name: "Al-Baqarah", verses: 286 },
  { number: 3, name: "Ali 'Imran", verses: 200 },
  { number: 4, name: "An-Nisa'", verses: 176 },
  { number: 5, name: "Al-Ma'idah", verses: 120 },
  { number: 6, name: "Al-An'am", verses: 165 },
  { number: 7, name: "Al-A'raf", verses: 206 },
  { number: 8, name: "Al-Anfal", verses: 75 },
  { number: 9, name: "At-Taubah", verses: 129 },
  { number: 10, name: "Yunus", verses: 109 },
  { number: 11, name: "Hud", verses: 123 },
  { number: 12, name: "Yusuf", verses: 111 },
  { number: 13, name: "Ar-Ra'd", verses: 43 },
  { number: 14, name: "Ibrahim", verses: 52 },
  { number: 15, name: "Al-Hijr", verses: 99 },
  { number: 16, name: "An-Nahl", verses: 128 },
  { number: 17, name: "Al-Isra'", verses: 111 },
  { number: 18, name: "Al-Kahf", verses: 110 },
  { number: 19, name: "Maryam", verses: 98 },
  { number: 20, name: "Ta-Ha", verses: 135 },
  { number: 21, name: "Al-Anbiya'", verses: 112 },
  { number: 22, name: "Al-Hajj", verses: 78 },
  { number: 23, name: "Al-Mu'minun", verses: 118 },
  { number: 24, name: "An-Nur", verses: 64 },
  { number: 25, name: "Al-Furqan", verses: 77 },
  { number: 26, name: "Asy-Syu'ara'", verses: 227 },
  { number: 27, name: "An-Naml", verses: 93 },
  { number: 28, name: "Al-Qasas", verses: 88 },
  { number: 29, name: "Al-Ankabut", verses: 69 },
  { number: 30, name: "Ar-Rum", verses: 60 },
  { number: 31, name: "Luqman", verses: 34 },
  { number: 32, name: "As-Sajdah", verses: 30 },
  { number: 33, name: "Al-Ahzab", verses: 73 },
  { number: 34, name: "Saba'", verses: 54 },
  { number: 35, name: "Fatir", verses: 45 },
  { number: 36, name: "Ya-Sin", verses: 83 },
  { number: 37, name: "As-Saffat", verses: 182 },
  { number: 38, name: "Sad", verses: 88 },
  { number: 39, name: "Az-Zumar", verses: 75 },
  { number: 40, name: "Ghafir", verses: 85 },
  { number: 41, name: "Fussilat", verses: 54 },
  { number: 42, name: "Asy-Syura", verses: 53 },
  { number: 43, name: "Az-Zukhruf", verses: 89 },
  { number: 44, name: "Ad-Dukhan", verses: 59 },
  { number: 45, name: "Al-Jatsiyah", verses: 37 },
  { number: 46, name: "Al-Ahqaf", verses: 35 },
  { number: 47, name: "Muhammad", verses: 38 },
  { number: 48, name: "Al-Fath", verses: 29 },
  { number: 49, name: "Al-Hujurat", verses: 18 },
  { number: 50, name: "Qaf", verses: 45 },
  { number: 51, name: "Adz-Dzariyat", verses: 60 },
  { number: 52, name: "At-Tur", verses: 49 },
  { number: 53, name: "An-Najm", verses: 62 },
  { number: 54, name: "Al-Qamar", verses: 55 },
  { number: 55, name: "Ar-Rahman", verses: 78 },
  { number: 56, name: "Al-Waqi'ah", verses: 96 },
  { number: 57, name: "Al-Hadid", verses: 29 },
  { number: 58, name: "Al-Mujadilah", verses: 22 },
  { number: 59, name: "Al-Hasyr", verses: 24 },
  { number: 60, name: "Al-Mumtahanah", verses: 13 },
  { number: 61, name: "As-Saff", verses: 14 },
  { number: 62, name: "Al-Jumu'ah", verses: 11 },
  { number: 63, name: "Al-Munafiqun", verses: 11 },
  { number: 64, name: "At-Taghabun", verses: 18 },
  { number: 65, name: "At-Talaq", verses: 12 },
  { number: 66, name: "At-Tahrim", verses: 12 },
  { number: 67, name: "Al-Mulk", verses: 30 },
  { number: 68, name: "Al-Qalam", verses: 52 },
  { number: 69, name: "Al-Haqqah", verses: 52 },
  { number: 70, name: "Al-Ma'arij", verses: 44 },
  { number: 71, name: "Nuh", verses: 28 },
  { number: 72, name: "Al-Jin", verses: 28 },
  { number: 73, name: "Al-Muzzammil", verses: 20 },
  { number: 74, name: "Al-Muddatsir", verses: 56 },
  { number: 75, name: "Al-Qiyamah", verses: 40 },
  { number: 76, name: "Al-Insan", verses: 31 },
  { number: 77, name: "Al-Mursalat", verses: 50 },
  { number: 78, name: "An-Naba'", verses: 40 },
  { number: 79, name: "An-Nazi'at", verses: 46 },
  { number: 80, name: "'Abasa", verses: 42 },
  { number: 81, name: "At-Takwir", verses: 29 },
  { number: 82, name: "Al-Infitar", verses: 19 },
  { number: 83, name: "Al-Mutaffifin", verses: 36 },
  { number: 84, name: "Al-Inshiqaq", verses: 25 },
  { number: 85, name: "Al-Buruj", verses: 22 },
  { number: 86, name: "At-Tariq", verses: 17 },
  { number: 87, name: "Al-A'la", verses: 19 },
  { number: 88, name: "Al-Ghashiyah", verses: 26 },
  { number: 89, name: "Al-Fajr", verses: 30 },
  { number: 90, name: "Al-Balad", verses: 20 },
  { number: 91, name: "Asy-Syams", verses: 15 },
  { number: 92, name: "Al-Lail", verses: 21 },
  { number: 93, name: "Ad-Duha", verses: 11 },
  { number: 94, name: "Al-Insyirah", verses: 8 },
  { number: 95, name: "At-Tin", verses: 8 },
  { number: 96, name: "Al-'Alaq", verses: 19 },
  { number: 97, name: "Al-Qadr", verses: 5 },
  { number: 98, name: "Al-Bayyinah", verses: 8 },
  { number: 99, name: "Az-Zalzalah", verses: 8 },
  { number: 100, name: "Al-'Adiyat", verses: 11 },
  { number: 101, name: "Al-Qari'ah", verses: 11 },
  { number: 102, name: "At-Takatsur", verses: 8 },
  { number: 103, name: "Al-'Asr", verses: 3 },
  { number: 104, name: "Al-Humazah", verses: 9 },
  { number: 105, name: "Al-Fil", verses: 5 },
  { number: 106, name: "Quraisy", verses: 4 },
  { number: 107, name: "Al-Ma'un", verses: 7 },
  { number: 108, name: "Al-Kautsar", verses: 3 },
  { number: 109, name: "Al-Kafirun", verses: 6 },
  { number: 110, name: "An-Nasr", verses: 3 },
  { number: 111, name: "Al-Lahab", verses: 5 },
  { number: 112, name: "Al-Ikhlas", verses: 4 },
  { number: 113, name: "Al-Falaq", verses: 5 },
  { number: 114, name: "An-Nas", verses: 6 },
];

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
