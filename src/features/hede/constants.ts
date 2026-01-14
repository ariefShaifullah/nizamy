
import type { RiskLevel, Question, HedeCategory, ViolationType, FiqhTerm } from '../../types.ts';
import type { ContractType } from './logic/contract-templates.ts';
import { 
    FaHandshake, 
    FaBalanceScale, 
    FaUsers, 
    FaUserTie, 
    FaFileContract, 
    FaFileInvoiceDollar, 
    FaInfoCircle, 
    FaPray 
} from 'react-icons/fa';
import React from 'react';

// --- CENTRALIZED STYLING CONFIG ---
export const RISK_CONFIG: Record<RiskLevel, { 
    label: string; 
    bg: string; 
    text: string; 
    border: string; 
    hex: string; 
}> = {
    safe: { 
        label: 'Aman (Halal)', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
        text: 'text-emerald-800 dark:text-emerald-400', 
        border: 'border-emerald-200 dark:border-emerald-800', 
        hex: '#10b981' 
    },
    low: { 
        label: 'Rendah', 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-400', 
        border: 'border-blue-200 dark:border-blue-800', 
        hex: '#3b82f6' 
    },
    medium: { 
        label: 'Syubhat (Hati-hati)', 
        bg: 'bg-amber-100 dark:bg-amber-900/30', 
        text: 'text-amber-800 dark:text-amber-400', 
        border: 'border-amber-200 dark:border-amber-800', 
        hex: '#f59e0b' 
    },
    high: { 
        label: 'Tinggi', 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-400', 
        border: 'border-orange-200 dark:border-orange-800', 
        hex: '#f97316' 
    },
    critical: { 
        label: 'Kritis (Haram)', 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-400', 
        border: 'border-red-200 dark:border-red-800', 
        hex: '#ef4444' 
    }
};

export const VIOLATION_STYLES: Record<ViolationType, string> = {
    riba: 'bg-red-50 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-100 dark:border-red-800',
    gharar: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-900/30 dark:text-orange-100 dark:border-orange-800',
    maysir: 'bg-purple-50 text-purple-900 border-purple-200 dark:bg-purple-900/30 dark:text-purple-100 dark:border-purple-800',
    zulm: 'bg-slate-50 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
    none: 'hidden'
};

export const VIOLATION_LABELS: Record<ViolationType, string> = {
    riba: 'Riba (Bunga)',
    gharar: 'Gharar (Ketidakjelasan)',
    maysir: 'Maysir (Judi)',
    zulm: 'Zulm/Batil',
    none: 'Aman'
};

export const CATEGORY_LABELS: Record<HedeCategory, string> = {
    job: 'Sumber Penghasilan',
    business: 'Model Bisnis',
    finance: 'Kondisi Keuangan',
    digital: 'Gaya Hidup Digital',
    payment: 'Metode Bayar',
    emergency: 'Kedaruratan'
};

export const TOOLKIT_ITEMS: { type: ContractType; icon: React.ReactNode; title: string; subtitle: string; color: string; }[] = [
    { type: 'qardh', icon: React.createElement(FaHandshake), title: 'Akad Qardh', subtitle: 'Utang (No Riba)', color: 'blue' },
    { type: 'mudharabah', icon: React.createElement(FaBalanceScale), title: 'Akad Mudharabah', subtitle: 'Investasi Bagi Hasil', color: 'emerald' },
    { type: 'musyarakah', icon: React.createElement(FaUsers), title: 'Akad Musyarakah', subtitle: 'Kerja Sama Modal', color: 'teal' },
    { type: 'wakalah', icon: React.createElement(FaUserTie), title: 'Akad Wakalah', subtitle: 'Agen/Dropship', color: 'sky' },
    { type: 'ijarah', icon: React.createElement(FaFileContract), title: 'Akad Ijarah', subtitle: 'Kontrak Jasa/Sewa', color: 'indigo' },
    { type: 'loan_payoff', icon: React.createElement(FaFileInvoiceDollar), title: 'Surat Pelunasan', subtitle: 'Niat Lunas KPR', color: 'rose' },
    { type: 'tathhir_guide', icon: React.createElement(FaInfoCircle), title: 'Panduan Tathhir', subtitle: 'Penyaluran Dana', color: 'amber' },
    { type: 'taubat', icon: React.createElement(FaPray), title: 'Ikrar Bara\'ah', subtitle: 'Niat Taubat', color: 'purple' },
];

export const FIQH_GLOSSARY: FiqhTerm[] = [
    // --- RIBA ---
    { term: 'Riba', category: 'riba', definition: 'Setiap penambahan (ziyadah) yang diambil tanpa adanya transaksi pengganti (iwadh) yang sah atau penambahan dalam utang piutang.' },
    { term: 'Riba Nasi\'ah', category: 'riba', definition: 'Riba yang muncul karena penangguhan waktu pembayaran utang dengan syarat tambahan (bunga). Contoh: Bunga KPR, Kartu Kredit.' },
    { term: 'Riba Fadhl', category: 'riba', definition: 'Riba dalam tukar menukar barang ribawi sejenis dengan takaran/timbangan yang berbeda. Contoh: Tukar emas lama dengan emas baru ada tambahan biaya.' },
    { term: 'Riba Qardh', category: 'riba', definition: 'Manfaat tambahan yang disyaratkan oleh pemberi utang kepada penerima utang. "Setiap piutang yang menarik manfaat adalah Riba".' },
    
    // --- GHARAR ---
    { term: 'Gharar', category: 'gharar', definition: 'Ketidakjelasan (ambiguitas) yang signifikan dalam transaksi, baik pada objek, harga, atau waktu serah terima, yang dapat memicu perselisihan.' },
    { term: 'Jual Beli Ijon', category: 'gharar', definition: 'Menjual buah-buahan yang belum matang/layak panen. Dilarang karena mengandung spekulasi tinggi.' },
    { term: 'Talaqqi Rukban', category: 'gharar', definition: 'Mencegat pedagang desa sebelum masuk pasar untuk membeli barang dengan harga murah karena ketidaktahuan mereka akan harga pasar.' },
    
    // --- MAYSIR ---
    { term: 'Maysir', category: 'maysir', definition: 'Setiap transaksi yang bersifat untung-untungan (spekulatif) di mana satu pihak untung dan pihak lain rugi secara mutlak (Zero Sum Game).' },
    { term: 'Qimar', category: 'maysir', definition: 'Perjudian atau taruhan.' },
    
    // --- ZULM / BATIL ---
    { term: 'Ghasab', category: 'zulm', definition: 'Menguasai hak/harta orang lain secara zalim (tanpa izin), seperti memakai tanah tetangga, listrik umum, atau software bajakan.' },
    { term: 'Ghulul', category: 'zulm', definition: 'Pengkhianatan dalam amanah, khususnya mengambil harta rampasan perang, harta publik, atau dana yayasan/masjid untuk kepentingan pribadi.' },
    { term: 'Risywah', category: 'zulm', definition: 'Suap menyuap. Memberi sesuatu kepada pihak berwenang untuk membatalkan hak atau membenarkan yang batil.' },
    { term: 'Ihtikar', category: 'zulm', definition: 'Menimbun barang kebutuhan pokok saat langka agar harga naik, lalu menjualnya dengan harga tinggi.' },
    { term: 'Najasy', category: 'zulm', definition: 'Pura-pura menawar barang dengan harga tinggi untuk memancing pembeli lain (goreng harga).' },
    { term: 'Tadlis', category: 'zulm', definition: 'Menyembunyikan cacat barang (aib) saat jual beli agar pembeli mengira barang tersebut sempurna (termasuk Fake Review).' },
    { term: 'Tatfif', category: 'zulm', definition: 'Kecurangan dalam menakar atau menimbang. "Celakalah bagi orangorang yang curang (Al-Mutaffifin)".' },
    { term: 'Akad Fasid', category: 'zulm', definition: 'Akad yang rusak karena tidak terpenuhinya syarat, namun rukunnya ada. Konsekuensinya harus diperbaiki atau dibatalkan.' },
    { term: 'Akad Bathil', category: 'zulm', definition: 'Akad yang tidak sah sejak awal karena melanggar rukun/syariat (misal: jual beli babi). Dianggap tidak pernah terjadi.' },
    
    // --- GENERAL ---
    { term: 'Tathhirul Mal', category: 'general', definition: 'Membersihkan harta dari unsur haram dengan menyalurkannya untuk fasilitas umum atau fakir miskin tanpa niat sedekah.' },
    { term: 'Tadarruj', category: 'general', definition: 'Prinsip bertahap dalam meninggalkan keharaman saat kondisi sulit/darurat, namun tetap berprogres menuju yang halal.' },
    { term: 'Bara\'ah', category: 'general', definition: 'Berlepas diri sepenuhnya dari transaksi haram seketika itu juga.' },
    { term: 'Wara\'', category: 'general', definition: 'Sikap kehati-hatian tingkat tinggi, meninggalkan hal yang halal karena takut terjerumus pada yang haram (Syubhat).' },
    { term: 'Akad', category: 'general', definition: 'Ikatan antara ijab (serah) dan qabul (terima) yang membenarkan adanya pemindahan kepemilikan atau manfaat.' },
    { term: 'Ju\'alah', category: 'general', definition: 'Akad sayembara atau komisi berbasis hasil. Contoh: Afiliator yang mendapat komisi jika barang terjual.' },
];

export const HEDE_FAQ = [
    {
        question: "Apa tujuan diagnosa ini?",
        answer: "Diagnosa Klinik Finansial bertujuan membantu Anda mendeteksi 'titik bocor' keberkahan dalam harta. Apakah dari pekerjaan, utang piutang, atau kebiasaan digital yang mungkin mengandung Riba, Gharar, atau Maysir tanpa disadari."
    },
    {
        question: "Apakah data saya aman?",
        answer: "100% Aman. NIZAMY menggunakan arsitektur 'Local-First'. Semua jawaban dan hasil diagnosa disimpan secara terenkripsi di dalam HP Anda sendiri. Tidak ada data yang dikirim ke server kami."
    },
    {
        question: "Apakah hasil skor ini adalah vonis hukum/fatwa?",
        answer: "Bukan. Skor ini adalah indikator teknis berdasarkan algoritma diagnosa mandiri (self-assessment). Hasil 'Kritis' atau 'Syubhat' adalah peringatan dini (early warning) agar Anda berkonsultasi lebih lanjut dengan Ustadz atau Ahli Fiqh Muamalah untuk mendapatkan fatwa spesifik atas kasus Anda."
    },
    {
        question: "Apa rujukan Fiqh yang digunakan?",
        answer: "Aplikasi ini merujuk pada kaidah Fiqh Muamalah Maliyah yang disepakati (Jumhur Ulama) dan Fatwa DSN-MUI yang relevan dengan konteks Indonesia, dengan pendekatan Mazhab Syafi'i pada umumnya namun tetap mengakomodir pendapat kuat lainnya (seperti dalam zakat fitrah dengan uang)."
    },
    {
        question: "Skor saya 'Kritis', apa yang harus saya lakukan?",
        answer: "Jangan panik dan jangan putus asa. Allah Maha Pengampun. \n1. Niatkan Taubat Nasuha.\n2. Cek tab 'Roadmap' untuk melihat langkah prioritas.\n3. Jika terkait utang Riba, fokus pelunasan pokok secepatnya.\n4. Gunakan fitur 'Tathhir' untuk menghitung dana yang perlu dibersihkan."
    },
    {
        question: "Apa itu Dana Tathhir dan kemana menyalurkannya?",
        answer: "Dana Tathhir adalah harta non-halal (seperti bunga bank) yang wajib dikeluarkan agar sisa harta kita menjadi suci. Dana ini BUKAN sedekah dan tidak mendapat pahala sedekah. Salurkan untuk fasilitas umum (jalan, jembatan, WC umum) atau fakir miskin yang sangat membutuhkan."
    },
    {
        question: "Apakah menjadi Afiliator itu halal?",
        answer: "Hukum asalnya Halal (Mubah) dengan akad Ju'alah/Simsarah. Namun bisa menjadi Haram jika Anda mempromosikan barang haram, melakukan 'Fake Review' (Tadlis), atau berbohong tentang kualitas produk."
    }
];

export const QUESTIONS_DB: Question[] = [
  // --- 1. SUMBER PENGHASILAN (JOB) ---
  {
    id: 'job_role',
    category: 'job',
    text: "Bismillah. Mari kita mulai dengan mengenali pintu rezeki Anda. Profesi mana yang paling menggambarkan keseharian Anda?",
    helperText: "Setiap profesi memiliki risiko syariah yang unik. Kami membedakan kategori agar pertanyaan lebih relevan dengan fiqh profesi Anda.",
    options: [
      { value: 'office', label: "Karyawan Kantor / PNS / Guru / Nakes (Gaji Tetap)", riskWeight: 0, violationType: 'none' },
      { value: 'religious', label: "Ustadz / Da'i / Guru Ngaji / Pengelola Yayasan", riskWeight: 0, violationType: 'none' },
      { value: 'digital', label: "Freelancer / Content Creator / Afiliator / Bisnis Online", riskWeight: 0, violationType: 'none' },
      { value: 'field', label: "Tukang / Driver / Pedagang / Petani / Teknisi (Fisik/Lapangan)", riskWeight: 0, violationType: 'none' },
      { value: 'dependent', label: "Pelajar / Mahasiswa / Ibu Rumah Tangga (Belum Bekerja)", riskWeight: 0, violationType: 'none' },
      { value: 'finance_bank', label: "Pegawai Bank Konvensional / Leasing / Asuransi", riskWeight: 95, violationType: 'riba' },
      { value: 'haram_job', label: "Industri Hiburan Malam / Bar / Judi", riskWeight: 100, violationType: 'zulm' },
    ]
  },
  
  // BRANCH 1: KARYAWAN (Employee - Ijarah)
  {
    id: 'job_contract',
    category: 'job',
    text: "Terkait akad kerja, bagaimana kejelasan sistem gaji dan tugas Anda?",
    helperText: "Dalam akad Ijarah (Sewa Jasa), upah dan tugas harus jelas (Ma'lum). Ketidakjelasan yang ekstrem adalah Gharar yang menzalimi pekerja.",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['office', 'finance_bank', 'haram_job']
    },
    options: [
      { value: 'clear', label: "Jelas & Transparan. Gaji pokok & tugas disepakati di awal.", riskWeight: 0, violationType: 'none' },
      { value: 'target_based', label: "Samar. Gaji sangat bergantung target yang tidak pasti (Gharar).", riskWeight: 30, violationType: 'gharar' },
      { value: 'exploitation', label: "Zalim. Sering kerja lembur tanpa bayaran/hak yang jelas.", riskWeight: 50, violationType: 'zulm' },
    ]
  },

  // BRANCH 2: FREELANCER DIGITAL & PEKERJA LAPANGAN (Self-Employed - Ju'alah/Jual Beli)
  {
    id: 'biz_agreement',
    category: 'job',
    text: "Saat menerima proyek atau pesanan, bagaimana kesepakatan harga dengan klien/pelanggan?",
    helperText: "Akad Jasa (Ju'alah) wajib menyepakati spesifikasi & harga di awal. 'Harga teman' yang speknya tidak jelas sering memicu sengketa.",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['digital', 'field']
    },
    options: [
      { value: 'clear_invoice', label: "Jelas. Ada kesepakatan harga & spek pekerjaan di awal.", riskWeight: 0, violationType: 'none' },
      { value: 'palugada', label: "Serabutan / 'Gampang bisa diatur' belakangan (Rawan sengketa).", riskWeight: 40, violationType: 'gharar' },
      { value: 'unpaid', label: "Sering tidak dibayar lunas atau klien lari.", riskWeight: 20, violationType: 'zulm' }, 
    ]
  },

  // BRANCH 3: KHUSUS USTADZ / DA'I / PENGELOLA YAYASAN (Amanah & Ghulul)
  {
    id: 'job_dakwah_ethics',
    category: 'job',
    text: "Terkait Adab & Muamalah dalam aktivitas Dakwah/Sosial, bagaimana pengelolaan dana atau upah (Bisyarah)?",
    helperText: "Upah mengajar itu boleh (Jumhur). Namun hati-hati dengan 'Ghulul' (menggunakan dana donasi umat/yayasan untuk kepentingan pribadi tanpa hak).",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['religious']
    },
    options: [
        { value: 'professional', label: "Profesional. Gaji/Honor jelas dari Yayasan/Sekolah.", riskWeight: 0, violationType: 'none' },
        { value: 'ikhlas', label: "Infaq / Seikhlasnya. Menerima apa adanya tanpa meminta.", riskWeight: 0, violationType: 'none' },
        { value: 'high_tariff', label: "Pasang Tarif Ketat. Dakwah menjadi sulit bagi yang miskin.", riskWeight: 20, violationType: 'none' }, // Low Risk but ethical warning
        { value: 'ghulul', label: "Dana Campur. Kadang terpakai dana donasi umat untuk pribadi.", riskWeight: 95, violationType: 'zulm' }
    ]
  },

  // BRANCH 4: KHUSUS PEKERJA LAPANGAN (INTEGRITAS)
  {
    id: 'field_integrity',
    category: 'job',
    text: "Dalam bekerja (misal: membangun rumah, servis, atau berdagang), bagaimana kejujuran Anda terhadap bahan/takaran?",
    helperText: "Mengurangi takaran (Tatfif) atau mengganti bahan bangunan dengan kualitas rendah tanpa izin klien adalah dosa besar dan bentuk kecurangan (Ghulul/Tadlis).",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['field']
    },
    options: [
        { value: 'honest', label: "Amanah. Sesuai takaran/spek yang dijanjikan.", riskWeight: 0, violationType: 'none' },
        { value: 'mark_up', label: "Mark-up harga bahan diam-diam (mengambil kembalian belanja).", riskWeight: 50, violationType: 'zulm' },
        { value: 'downgrade', label: "Kadang mengurangi kualitas/takaran demi untung lebih.", riskWeight: 80, violationType: 'zulm' }
    ]
  },

  // BRANCH 5: KHUSUS PEKERJA DIGITAL, KANTOR, PELAJAR & USTADZ (SOFTWARE)
  {
    id: 'job_tools',
    category: 'job',
    text: "Terkait software di laptop/komputer untuk kerja, kuliah, atau menyusun materi dakwah, bagaimana status lisensinya?",
    helperText: "Memakai software bajakan (Crack) termasuk Ghasab (Memakai hak orang tanpa izin). Penuntut ilmu & pengemban dakwah seyogyanya paling wara' dalam hal ini.",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['office', 'digital', 'dependent', 'religious']
    },
    options: [
        { value: 'original', label: "Insya Allah Original / Gratisan Resmi / Disediakan Kampus.", riskWeight: 0, violationType: 'none' },
        { value: 'mixed', label: "Campur. Ada aplikasi mahal yang terpaksa pakai Crack/Mod.", riskWeight: 40, violationType: 'zulm' },
        { value: 'pirated', label: "Dominan Bajakan. Belum mampu beli lisensi resmi.", riskWeight: 70, violationType: 'zulm' }
    ]
  },

  // BRANCH 6: KHUSUS AFILIATOR / CONTENT CREATOR
  {
    id: 'job_affiliate',
    category: 'job',
    text: "Jika Anda mencari rezeki sebagai Afiliator (TikTok/Shopee) atau Reviewer, bagaimana cara Anda promosi?",
    helperText: "Akad Afiliasi (Ju'alah/Simsarah) itu Halal. Tapi menjadi Haram jika melakukan Tadlis (Penipuan) seperti Fake Review atau mempromosikan barang haram.",
    dependency: {
        id: 'job_role',
        type: 'include',
        values: ['digital', 'dependent']
    },
    options: [
        { value: 'not_affiliate', label: "Saya bukan Afiliator / Tidak promosi produk.", riskWeight: 0, violationType: 'none' },
        { value: 'honest_review', label: "Jujur. Saya hanya review barang yang sudah dicoba & halal.", riskWeight: 0, violationType: 'none' },
        { value: 'blind_share', label: "Asal Share Link. Saya tidak tahu kualitas barang, yang penting komisi.", riskWeight: 30, violationType: 'gharar' },
        { value: 'fake_review', label: "Fake Review (Bohong) atau Promosi barang KW/Haram.", riskWeight: 90, violationType: 'zulm' }
    ]
  },

  // COMMON JOB QUESTION (RISYWAH) - Exclude Religious to maintain 'Muruah' and simplicity
  {
    id: 'job_risywah',
    category: 'job',
    text: "Bagaimana budaya 'hadiah' atau 'tips pelicin' di lingkungan kerja Anda?",
    helperText: "Hati-hati dengan Risywah (Suap). Hadiah yang diberikan karena jabatan/kuasa untuk melancarkan urusan yang tidak semestinya adalah haram.",
    dependency: {
        id: 'job_role',
        type: 'exclude',
        values: ['dependent', 'religious']
    },
    options: [
        { value: 'clean', label: "Bersih. Kami menolak gratifikasi/suap.", riskWeight: 0, violationType: 'none' },
        { value: 'grey_gifts', label: "Kadang menerima parsel/tips pelicin dari klien.", riskWeight: 30, violationType: 'gharar' },
        { value: 'kickback', label: "Ada 'Fee Bawah Meja' wajib untuk meloloskan proyek.", riskWeight: 100, violationType: 'zulm' }
    ]
  },

  // --- 2. MODEL BISNIS (BUSINESS) ---
  {
    id: 'biz_capital',
    category: 'business',
    text: "Jika Anda memiliki usaha sampingan, dari mana sumber modal utamanya?",
    helperText: "Modal yang bercampur Riba akan mempengaruhi kehalalan hasil usaha. Islam menganjurkan Syirkah (Kerja sama) atau Mudharabah.",
    options: [
      { value: 'no_biz', label: "Saya tidak memiliki bisnis sampingan.", riskWeight: 0, violationType: 'none' },
      { value: 'halal_cap', label: "Modal Sendiri / Keluarga / Investor (Bagi Hasil).", riskWeight: 0, violationType: 'none' },
      { value: 'bank_syariah', label: "Pembiayaan Bank Syariah (Murabahah/Musyarakah).", riskWeight: 10, violationType: 'none' },
      { value: 'bank_conv', label: "Pinjaman Bank Konvensional / Rentenir (Bunga).", riskWeight: 90, violationType: 'riba' },
    ]
  },
  {
    id: 'biz_dropship',
    category: 'business',
    text: "Bagi pegiat Online Shop / Dropship, apakah Anda memiliki izin/akad dengan supplier?",
    helperText: "Nabi SAW melarang 'Menjual barang yang belum dimiliki', KECUALI Anda sudah jadi agen/wakil resmi (Wakalah) dari pemilik barang.",
    dependency: {
        id: 'biz_capital',
        type: 'exclude',
        values: ['no_biz']
    },
    options: [
      { value: 'stock_own', label: "Saya punya stok barang sendiri (Jual Beli Biasa).", riskWeight: 0, violationType: 'none' },
      { value: 'wakalah', label: "Saya dropshipper/agen resmi (Ada akad izin jual).", riskWeight: 0, violationType: 'none' },
      { value: 'wild', label: "Hanya comot foto & jual barang orang tanpa izin (Spekulasi).", riskWeight: 80, violationType: 'gharar' }, 
    ]
  },

  // --- 3. KEUANGAN (FINANCE) ---
  {
    id: 'fin_debt',
    category: 'finance',
    text: "Mari cek kewajiban kita. Apakah saat ini ada cicilan utang berbunga?",
    helperText: "Riba (Bunga) adalah dosa besar yang diperangi Allah. Niatkan untuk segera lunas agar hidup tenang.",
    options: [
      { value: 'debt_free', label: "Alhamdulillah Bebas Utang Riba.", riskWeight: 0, violationType: 'none' },
      { value: 'soft_loan', label: "Ada utang ke kerabat/kantor tanpa bunga (Qardh).", riskWeight: 0, violationType: 'none' },
      { value: 'kpr_syariah', label: "Cicilan ke Bank Syariah (Akad Jual Beli/Sewa).", riskWeight: 5, violationType: 'none' },
      { value: 'kpr_conv', label: "KPR / Leasing / Kartu Kredit Konvensional (Bunga).", riskWeight: 95, violationType: 'riba' },
      { value: 'pinjol', label: "Terjerat Pinjol / Rentenir.", riskWeight: 100, violationType: 'riba' },
    ]
  },
  {
    id: 'fin_invest',
    category: 'finance',
    text: "Di mana Anda biasa 'menumbuhkan' uang (Investasi)?",
    helperText: "Pastikan instrumen investasi bebas dari Riba (Bunga), Gharar (Ketidakjelasan), dan Maysir (Judi).",
    options: [
      { value: 'none', label: "Hanya menabung biasa / Tunai.", riskWeight: 0, violationType: 'none' },
      { value: 'real_asset', label: "Emas Fisik, Properti, Tanah, Hewan Ternak.", riskWeight: 0, violationType: 'none' },
      { value: 'sharia_paper', label: "Saham Syariah, Sukuk, Reksadana Syariah.", riskWeight: 0, violationType: 'none' },
      { value: 'deposito', label: "Deposito Bank Konvensional (Bunga Pasti).", riskWeight: 80, violationType: 'riba' },
      { value: 'crypto_spot', label: "Crypto Spot (Jual Beli Aset Digital Murni).", riskWeight: 20, violationType: 'gharar' },
      { value: 'futures', label: "Trading Futures / Crypto Leverage / Binary Option (Judi).", riskWeight: 95, violationType: 'maysir' },
    ]
  },
  {
    id: 'fin_insurance',
    category: 'finance',
    text: "Bagaimana proteksi asuransi yang Anda gunakan saat ini?",
    helperText: "Asuransi konvensional mengandung unsur Gharar (Ketidakjelasan dana) dan Maysir (Judi/Untung-untungan). Asuransi Syariah menggunakan akad Tabarru' (Tolong menolong). BPJS Kesehatan dinilai maslahat oleh ulama.",
    options: [
        { value: 'none_bpjs', label: "BPJS Kesehatan / Tidak Ada (Tawakkal).", riskWeight: 0, violationType: 'none' },
        { value: 'sharia_ins', label: "Asuransi Syariah (Takaful).", riskWeight: 0, violationType: 'none' },
        { value: 'conv_ins', label: "Asuransi Swasta Konvensional (Kesehatan/Jiwa).", riskWeight: 70, violationType: 'gharar' },
        { value: 'unit_link', label: "Asuransi Unit Link (Campuran Investasi & Proteksi).", riskWeight: 80, violationType: 'gharar' }
    ]
  },
  {
    id: 'fin_zakat',
    category: 'finance',
    text: "Bagaimana status penunaian Zakat Maal (Harta Simpanan/Investasi) Anda saat ini?",
    helperText: "Zakat Maal wajib jika harta mencapai Nisab (setara 85g Emas) dan Haul (1 tahun). Harta yang tidak dizakati padahal wajib, akan menjadi 'kotor'.",
    options: [
        { value: 'routine', label: "Tertib. Selalu bayar saat mencapai Nisab & Haul.", riskWeight: 0, violationType: 'none' },
        { value: 'not_reached', label: "Belum Wajib. Harta saya belum mencapai Nisab.", riskWeight: 0, violationType: 'none' },
        { value: 'fitrah_only', label: "Wajib tapi lalai. Cuma bayar Zakat Fitrah.", riskWeight: 40, violationType: 'zulm' },
        { value: 'rare', label: "Tidak Tahu / Tidak pernah menghitung.", riskWeight: 60, violationType: 'zulm' }
    ]
  },
  {
    id: 'fin_inheritance',
    category: 'finance',
    text: "Terkait harta peninggalan orang tua (Warisan), bagaimana statusnya saat ini?",
    helperText: "Menahan pembagian waris secara sengaja padahal ada ahli waris yang membutuhkan adalah bentuk kezaliman (Ghasab). Harta harus segera dibagi sesuai Faraidh.",
    options: [
        { value: 'no_inheritance', label: "Aman. Sudah dibagi tuntas / Orang tua masih ada.", riskWeight: 0, violationType: 'none' },
        { value: 'delayed', label: "Tertunda. Harta utuh tapi belum dibagi (Saling ridho).", riskWeight: 40, violationType: 'zulm' },
        { value: 'ghasab', label: "Dikuasai sepihak / Dipakai tanpa izin ahli waris lain.", riskWeight: 95, violationType: 'zulm' }
    ]
  },
  
  // --- 4. PAYMENT & LIFESTYLE (Reorganized) ---
  {
    id: 'dig_ewallet',
    category: 'payment',
    text: "Bagaimana kebiasaan Anda menggunakan E-Wallet (Gopay/OVO/ShopeePay)?",
    helperText: "Saldo di E-Wallet adalah titipan/utang kita ke aplikasi (Wadi'ah/Qardh). Mengambil manfaat (diskon/cashback) atas utang adalah Riba. Solusi: Jangan endapkan saldo.",
    options: [
      { value: 'pass_through', label: "Top-up hanya pas mau bayar (Pass-through).", riskWeight: 0, violationType: 'none' },
      { value: 'keep_balance', label: "Simpan saldo, tapi tidak ambil promo diskon.", riskWeight: 5, violationType: 'none' },
      { value: 'promo_hunter', label: "Sengaja isi saldo/upgrade akun demi diskon & cashback.", riskWeight: 60, violationType: 'riba' }, 
    ]
  },
  {
    id: 'dig_paylater',
    category: 'payment',
    text: "Jujur, apakah Anda sering menggunakan Paylater saat belanja?",
    helperText: "Fitur 'Beli Sekarang Bayar Nanti' dengan denda keterlambatan adalah bentuk Riba Jahiliyah modern. Hindari jika mampu.",
    options: [
      { value: 'no', label: "Tidak, saya bayar tunai/transfer.", riskWeight: 0, violationType: 'none' },
      { value: 'yes', label: "Ya, sering pakai Paylater / Cicilan berbunga.", riskWeight: 90, violationType: 'riba' },
    ]
  },
  {
    id: 'dig_gacha',
    category: 'digital',
    text: "Suka main game? Apakah Anda membeli item 'Gacha' / 'Lootbox'?",
    helperText: "Membayar uang asli untuk item acak (bisa untung/buntung) adalah unsur Maysir (Perjudian) dalam game.",
    options: [
        { value: 'clean_gamer', label: "Tidak main game / Beli item pasti saja.", riskWeight: 0, violationType: 'none' },
        { value: 'gacha_addict', label: "Ya, sering Gacha buat cari karakter/item langka.", riskWeight: 85, violationType: 'maysir' }
    ]
  },

  // --- 5. EMERGENCY CHECK ---
  {
    id: 'em_fund',
    category: 'emergency',
    text: "Terakhir, seberapa kuat pertahanan 'Dana Darurat' Anda saat ini?",
    helperText: "Ini untuk mengukur tingkat 'Dharurat'. Dalam kondisi yang mengancam nyawa/kebutuhan pokok, hukum Islam memberi kelonggaran (Rukhshah) untuk bertahap.",
    options: [
      { value: 'safe', label: "Aman (> 3 bulan pengeluaran).", riskWeight: 0, hardshipWeight: 0, violationType: 'none' },
      { value: 'warning', label: "Tipis (Cukup untuk 1 bulan).", riskWeight: 0, hardshipWeight: 50, violationType: 'none' },
      { value: 'danger', label: "Kritis / Tidak ada tabungan sama sekali.", riskWeight: 0, hardshipWeight: 100, violationType: 'none' },
    ]
  }
];
