import type { HeirInputState } from "./types.ts";
import { Heir } from "./types.ts";

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
  // Dzawil Arham
  [Heir.DaughterSon]: 0,
  [Heir.DaughterDaughter]: 0,
  [Heir.FullBrotherSon]: 0,
  [Heir.FullBrotherDaughter]: 0,
  [Heir.FullSisterSon]: 0,
  [Heir.PaternalBrotherSon]: 0,
  [Heir.PaternalBrotherDaughter]: 0,
  [Heir.PaternalUncleFull]: 0,
  [Heir.PaternalUnclePaternal]: 0,
  [Heir.PaternalAunt]: 0,
  [Heir.PaternalAuntPaternal]: 0,
  [Heir.MaternalAunt]: 0,
  [Heir.MaternalUncle]: 0,
  [Heir.PaternalUnclesSonFull]: 0,
  [Heir.PaternalUnclesDaughterFull]: 0,
  [Heir.PaternalUnclesSonPaternal]: 0,
  [Heir.PaternalUnclesDaughterPaternal]: 0,
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
  // Ashabah lanjutan (KHI Pasal 175)
  [Heir.FullBrotherSon]: "Keponakan Laki-laki (Saudara Kandung)",
  [Heir.PaternalBrotherSon]: "Keponakan Laki-laki (Saudara Seayah)",
  [Heir.PaternalUncleFull]: "Paman Kandung",
  [Heir.PaternalUnclePaternal]: "Paman Seayah",
  [Heir.PaternalUnclesSonFull]: "Sepupu Laki-laki Kandung",
  [Heir.PaternalUnclesSonPaternal]: "Sepupu Laki-laki Seayah",
  // Dzawil Arham (KHI Pasal 176)
  [Heir.DaughterSon]: "Cucu Laki-laki (dari Anak Perempuan)",
  [Heir.DaughterDaughter]: "Cucu Perempuan (dari Anak Perempuan)",
  [Heir.FullBrotherDaughter]: "Keponakan Perempuan (Saudara Kandung)",
  [Heir.FullSisterSon]: "Anak dari Saudari Kandung",
  [Heir.PaternalBrotherDaughter]: "Keponakan Perempuan (Saudara Seayah)",
  [Heir.PaternalAunt]: "Bibi Kandung",
  [Heir.PaternalAuntPaternal]: "Bibi Seayah",
  [Heir.MaternalAunt]: "Bibi Seibu",
  [Heir.MaternalUncle]: "Paman Seibu",
  [Heir.PaternalUnclesDaughterFull]: "Sepupu Perempuan Kandung",
  [Heir.PaternalUnclesDaughterPaternal]: "Sepupu Perempuan Seayah",
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
  IJTIHAD_UMAR_MUSYTARAKAH: "Putusan Umar bin Khattab r.a. (Al-Musytarakah)",
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
  {
    title: "Ashabah Lanjutan",
    heirs: [
      // Pasal 175 point 6-7: Anak laki-laki saudara
      Heir.FullBrotherSon,
      Heir.PaternalBrotherSon,
      // Pasal 175 point 8-9: Paman
      Heir.PaternalUncleFull,
      Heir.PaternalUnclePaternal,
      // Pasal 175 point 10-11: Anak paman (sepupu laki-laki)
      Heir.PaternalUnclesSonFull,
      Heir.PaternalUnclesSonPaternal,
    ],
  },
  {
    title: "Dzawil Arham",
    heirs: [
      // Tier 1: Cucu dari anak perempuan (male via female line + female)
      Heir.DaughterSon,
      Heir.DaughterDaughter,
      // Tier 2: Anak perempuan saudara & anak saudari
      Heir.FullBrotherDaughter,
      Heir.FullSisterSon,
      Heir.PaternalBrotherDaughter,
      // Tier 3: Bibi & paman seibu
      Heir.PaternalAunt,
      Heir.PaternalAuntPaternal,
      Heir.MaternalAunt,
      Heir.MaternalUncle,
      // Tier 4: Sepupu perempuan
      Heir.PaternalUnclesDaughterFull,
      Heir.PaternalUnclesDaughterPaternal,
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
  DZAWIL_ARHAM: {
    title: "Dzawil Arham (Kerabat Jauh)",
    definition:
      "Dzawil Arham adalah kerabat yang tidak termasuk ashhab al-furudh maupun ashabah, seperti cucu dari anak perempuan, anak saudara perempuan, bibi, dan paman seibu. Menurut KHI (Pasal 174-193), mereka berhak menerima warisan jika tidak ada ahli waris lain yang lebih dekat. KHI menganut pendapat Tsauri dan Abu Hanifah yang memberikan hak waris kepada dzawil arham.",
  },
};

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
