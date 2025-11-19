
import type { HeirInputState } from './types.ts';
import { Heir } from './types.ts';

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
  [Heir.Husband]: 'Suami',
  [Heir.Wife]: 'Istri',
  [Heir.Son]: 'Anak Laki-laki',
  [Heir.Daughter]: 'Anak Perempuan',
  [Heir.Father]: 'Ayah',
  [Heir.Mother]: 'Ibu',
  [Heir.Grandfather]: 'Kakek (dari Ayah)',
  [Heir.PaternalGrandmother]: 'Nenek (dari Ayah)',
  [Heir.MaternalGrandmother]: 'Nenek (dari Ibu)',
  [Heir.Grandson]: 'Cucu Laki-laki (dari Anak Laki-laki)',
  [Heir.Granddaughter]: 'Cucu Perempuan (dari Anak Laki-laki)',
  [Heir.FullBrother]: 'Saudara Laki-laki Kandung',
  [Heir.FullSister]: 'Saudara Perempuan Kandung',
  [Heir.PaternalBrother]: 'Saudara Laki-laki Seayah',
  [Heir.PaternalSister]: 'Saudara Perempuan Seayah',
  [Heir.MaternalBrother]: 'Saudara Laki-laki Seibu',
  [Heir.MaternalSister]: 'Saudara Perempuan Seibu',
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
        heirs: [Heir.Husband, Heir.Wife, Heir.Son, Heir.Daughter]
    },
    {
        title: "Orang Tua & Kakek-Nenek",
        heirs: [Heir.Father, Heir.Mother, Heir.Grandfather, Heir.PaternalGrandmother, Heir.MaternalGrandmother]
    },
    {
        title: "Cucu",
        heirs: [Heir.Grandson, Heir.Granddaughter]
    },
    {
        title: "Saudara Kandung",
        heirs: [Heir.FullBrother, Heir.FullSister]
    },
    {
        title: "Saudara Seayah & Seibu",
        heirs: [Heir.PaternalBrother, Heir.PaternalSister, Heir.MaternalBrother, Heir.MaternalSister]
    }
];

export const FIQH_DEFINITIONS: { [key: string]: { title: string; definition: string } } = {
  AUL: {
    title: "Kasus 'Aul",
    definition: "'Aul terjadi ketika total bagian (furudh) para ahli waris melebihi 1 (satu) kesatuan harta. Untuk mengatasinya, penyebut (asal masalah) dinaikkan menjadi sama dengan total pembilang, sehingga bagian setiap ahli waris berkurang secara proporsional. Metode ini pertama kali ditetapkan oleh Umar bin Khattab r.a.",
  },
  RADD: {
    title: "Kasus Radd",
    definition: "Radd terjadi ketika total bagian (furudh) para ahli waris kurang dari 1 (satu) kesatuan harta dan tidak ada 'Ashabah. Sisa harta dikembalikan kepada ahli waris furudh (selain suami/istri). Ini adalah pendapat Ali bin Abi Thalib r.a. dan mayoritas ulama muta'akhhirin.",
  },
  UMARIYYATAIN: {
    title: "Kasus 'Umariyyatain",
    definition: "Dua kasus khusus yang diputuskan oleh Umar bin Khattab r.a. Jika ahli waris adalah suami/istri, ayah, dan ibu, maka ibu mendapat 1/3 dari sisa harta setelah bagian suami/istri (bukan 1/3 total), agar prinsip bagian laki-laki 2x perempuan (Ayah vs Ibu) tetap terjaga.",
  },
  MUSYTARAKAH: {
    title: "Kasus Al-Musytarakah",
    definition: "Kasus di mana saudara kandung laki-laki berisiko tidak mendapat warisan karena harta habis oleh ahli waris furudh lainnya. Umar bin Khattab r.a. memutuskan saudara kandung berserikat (musytarakah) dengan saudara seibu dalam pembagian 1/3.",
  },
  AKDARIYYAH: {
    title: "Kasus Al-Akdariyyah",
    definition: "Kasus spesifik (suami, ibu, kakek, saudari kandung). Zaid bin Thabit r.a. menerapkan metode khusus: menjumlahkan bagian kakek dan saudari, lalu membaginya dengan perbandingan 2:1 (laki-laki:perempuan), karena aturan dasar akan merugikan kakek.",
  },
};

// --- FAQ DATA ---

export const FARAIDH_FAQ = [
    {
        question: "Apa itu Faraidh atau Ilmu Waris Islam?",
        answer: "Faraidh (atau Ilmu Mawaris) adalah ilmu yang mempelajari tentang pembagian harta peninggalan seseorang setelah ia meninggal dunia, berdasarkan ketentuan yang telah ditetapkan dalam Al-Qur'an dan As-Sunnah. Ilmu ini memastikan bahwa harta warisan didistribusikan secara adil kepada ahli waris yang berhak."
    },
    {
        question: "Mengapa pembagian waris menurut Islam itu penting?",
        answer: "Melaksanakan pembagian waris sesuai syariat Islam adalah bentuk ketaatan kepada Allah SWT. Aturan ini dirancang untuk mencegah perselisihan antar anggota keluarga, melindungi hak-hak setiap individu (terutama perempuan dan anak-anak), dan menciptakan keadilan serta keharmonisan sosial."
    },
    {
        question: "Siapa saja yang termasuk ahli waris?",
        answer: "Ahli waris utama (Ashabul Furudh) adalah mereka yang bagiannya telah ditentukan secara spesifik dalam Al-Qur'an, seperti suami, istri, anak perempuan, anak laki-laki, ayah, dan ibu. Selain itu, ada ahli waris sisa ('Ashabah) yang mendapat sisa harta, seperti anak laki-laki atau saudara laki-laki. Kalkulator ini akan menentukan siapa yang berhak dan siapa yang terhalang (hajb) secara otomatis."
    },
    {
        question: "Apakah data yang saya masukkan di kalkulator ini aman?",
        answer: "Ya, sangat aman. Semua perhitungan dilakukan langsung di browser Anda (client-side). Tidak ada data pribadi atau data perhitungan yang dikirim atau disimpan di server kami. Privasi Anda 100% terjamin."
    },
    {
        question: "Apakah hasil kalkulator ini akurat dan bisa dijadikan rujukan?",
        answer: "Kalkulator NIZAMY dirancang dengan cermat untuk mengikuti kaidah-kaidah fiqh waris mayoritas ulama (Jumhur Ulama). Hasilnya Insya Allah akurat untuk kasus-kasus umum. Namun, untuk situasi waris yang sangat kompleks atau melibatkan wasiat, utang, atau sengketa, sangat disarankan untuk berkonsultasi lebih lanjut dengan ulama, ahli fiqh, atau lembaga keagamaan yang terpercaya."
    }
];

export const ZAKAT_FAQ = [
    {
        question: "Apa perbedaan Zakat Fitrah dan Zakat Maal?",
        answer: "Zakat Fitrah adalah zakat badan yang wajib dikeluarkan setiap Muslim di bulan Ramadhan (sebelum shalat Idul Fitri) untuk mensucikan diri, biasanya berupa makanan pokok (beras). \n\nZakat Maal adalah zakat harta yang wajib dikeluarkan apabila harta tersebut telah mencapai nisab (batas minimal) dan haul (kepemilikan 1 tahun). Ini mencakup tabungan, emas, perniagaan, dan investasi."
    },
    {
        question: "Apa itu Nisab dan Haul dalam Zakat?",
        answer: "**Nisab** adalah batas minimal jumlah harta yang menyebabkan harta tersebut wajib dizakati. Contoh: Nisab emas adalah 85 gram. \n\n**Haul** adalah batas waktu kepemilikan harta yang harus sudah berlalu selama satu tahun hijriyah (kecuali zakat pertanian yang dibayar saat panen)."
    },
    {
        question: "Bagaimana cara menghitung Zakat Penghasilan (Profesi)?",
        answer: "Banyak ulama kontemporer mengqiyaskan zakat profesi dengan zakat pertanian (dibayar saat menerima) atau zakat emas (dibayar setahun sekali). Tarifnya 2.5%. \n\nDi kalkulator ini, Anda bisa memasukkan total sisa penghasilan/tabungan ke dalam kolom 'Zakat Maal' atau 'Uang Tunai' jika metode yang Anda yakini adalah menghitung saldo akhir tahun (haul)."
    },
    {
        question: "Apakah hutang mengurangi kewajiban Zakat?",
        answer: "Ya, menurut mayoritas ulama, hutang yang jatuh tempo (harus segera dibayar) mengurangi total harta wajib zakat. Kalkulator ini menyediakan kolom 'Hutang' yang akan otomatis mengurangi total aset Anda sebelum dibandingkan dengan nisab."
    },
    {
        question: "Apakah boleh membayar Zakat Fitrah dengan Uang?",
        answer: "Mazhab Syafi'i (yang umum di Indonesia) mewajibkan makanan pokok (beras). Namun, Mazhab Hanafi membolehkan membayar dengan nilai uang (qimah) yang setara. \n\nKalkulator ini menyediakan kedua opsi agar Anda bisa menghitung estimasi biaya jika ingin membayar melalui lembaga zakat yang menerima uang."
    },
    {
        question: "Mengapa Nisab Emas 85 gram dan Perak 595 gram?",
        answer: "Angka ini didasarkan pada hadits Nabi SAW. 20 Dinar (Emas) setara ±85 gram, dan 200 Dirham (Perak) setara ±595 gram. Jika harta Anda (tunai, tabungan, saham) nilainya setara atau lebih dari harga 85 gram emas saat ini, maka wajib zakat 2.5%."
    }
];
