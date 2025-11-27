
import type { RiskLevel, Question, HedeCategory, ViolationType, FiqhTerm } from '../../types.ts';

// --- CENTRALIZED STYLING CONFIG ---
export const RISK_CONFIG: Record<RiskLevel, { 
    label: string; 
    bg: string; 
    text: string; 
    border: string; 
    hex: string; // For Charts & PDF
}> = {
    safe: { 
        label: 'Aman (Halal)', 
        bg: 'bg-emerald-100', 
        text: 'text-emerald-700', 
        border: 'border-emerald-200', 
        hex: '#10b981' 
    },
    low: { 
        label: 'Rendah', 
        bg: 'bg-blue-100', 
        text: 'text-blue-700', 
        border: 'border-blue-200', 
        hex: '#3b82f6' 
    },
    medium: { 
        label: 'Menengah (Syubhat)', 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-700', 
        border: 'border-yellow-200', 
        hex: '#eab308' 
    },
    high: { 
        label: 'Tinggi', 
        bg: 'bg-orange-100', 
        text: 'text-orange-700', 
        border: 'border-orange-200', 
        hex: '#f97316' 
    },
    critical: { 
        label: 'Kritis (Haram)', 
        bg: 'bg-red-100', 
        text: 'text-red-700', 
        border: 'border-red-200', 
        hex: '#ef4444' 
    }
};

export const VIOLATION_STYLES: Record<ViolationType, string> = {
    riba: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    gharar: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
    maysir: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800',
    zulm: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    none: 'hidden'
};

export const VIOLATION_LABELS: Record<ViolationType, string> = {
    riba: 'Riba (Bunga/Pertambahan)',
    gharar: 'Gharar (Ketidakjelasan)',
    maysir: 'Maysir (Spekulasi/Judi)',
    zulm: 'Zulm/Batil (Haram Zat/Cara)',
    none: 'Aman'
};

export const CATEGORY_LABELS: Record<HedeCategory, string> = {
    job: 'Pekerjaan & Profesi',
    business: 'Model Bisnis',
    finance: 'Keuangan & Investasi',
    digital: 'Transaksi Digital',
    payment: 'Sistem Pembayaran',
    emergency: 'Kondisi Kedaruratan'
};

export const FIQH_GLOSSARY: FiqhTerm[] = [
    { term: 'Riba', category: 'riba', definition: 'Setiap penambahan (ziyadah) yang diambil tanpa adanya transaksi pengganti (iwadh) atau penambahan dalam utang piutang.' },
    { term: 'Tathhirul Mal', category: 'general', definition: 'Proses membersihkan harta dari unsur haram/syubhat dengan mengeluarkannya untuk kemaslahatan umum tanpa mengharap pahala sedekah.' },
    { term: 'Riba Fadhl', category: 'riba', definition: 'Riba dalam tukar menukar barang ribawi sejenis dengan takaran/kadar berbeda.' },
    { term: 'Riba Nasi\'ah', category: 'riba', definition: 'Riba karena penundaan penyerahan atau pembayaran (bunga kredit/utang).' },
    { term: 'Gharar', category: 'gharar', definition: 'Ketidakjelasan dalam transaksi, baik kualitas, kuantitas, atau waktu penyerahan yang dapat memicu perselisihan.' },
    { term: 'Maysir', category: 'maysir', definition: 'Transaksi yang menggantungkan keuntungan pada keberuntungan semata (judi/spekulasi zero-sum game).' },
    { term: 'Qardh', category: 'general', definition: 'Akad pinjam meminjam uang. Dalam Islam, Qardh adalah akad sosial (Tabarru\'), tidak boleh mengambil keuntungan.' },
    { term: 'Akad Fasid', category: 'zulm', definition: 'Akad yang rusak karena tidak terpenuhinya syarat atau rukun, meskipun sah secara administratif negara.' },
    { term: 'Tadarruj', category: 'general', definition: 'Prinsip bertahap dalam menerapkan hukum Islam, digunakan saat kondisi sulit/darurat untuk mencapai ideal (misal: melunasi utang riba satu per satu).' },
    { term: 'Bara\'ah', category: 'general', definition: 'Sikap berlepas diri sepenuhnya dan seketika dari segala bentuk transaksi haram/batil. Wajib dilakukan jika seseorang memiliki kemampuan (qudrah) untuk meninggalkan yang haram tanpa membahayakan nyawa/agama.' },
    { term: 'Istiqamah', category: 'general', definition: 'Konsistensi dalam menjaga kondisi yang sudah baik (halal). Menuntut keteguhan hati untuk tidak tergiur kembali ke transaksi ribawi/syubhat meskipun menguntungkan secara materi.' },
    { term: 'Dharuriyyat', category: 'general', definition: 'Kebutuhan primer (Agama, Jiwa, Akal, Keturunan, Harta) yang jika tidak dipenuhi akan mengancam eksistensi.' },
    { term: 'Tabarru\'', category: 'general', definition: 'Akad hibah/sumbangan/tolong-menolong. Dasar dari asuransi syariah, di mana peserta saling menanggung risiko, bukan mentransfer risiko ke perusahaan.' },
    { term: 'Ghasab', category: 'zulm', definition: 'Menguasai hak/harta orang lain secara zalim (tanpa izin). Contoh: Menggunakan harta warisan yang belum dibagi.' },
    { term: 'Bai\' Kali bi Kali', category: 'gharar', definition: 'Jual beli utang dengan utang (menunda penyerahan barang dan harga sekaligus), dilarang karena gharar tinggi.' },
];

export const HEDE_FAQ = [
    {
        question: "Apa itu H.E.D.E?",
        answer: "H.E.D.E (Halal Economic Diagnostic Engine) adalah alat bantu diagnosa mandiri (self-assessment) untuk mendeteksi potensi pelanggaran syariah dalam aktivitas ekonomi Anda, mulai dari pekerjaan, investasi, hingga kebiasaan transaksi digital."
    },
    {
        question: "Apa itu fitur 'Tathhir'?",
        answer: "Tathhir adalah kalkulator untuk menghitung berapa nominal harta non-halal (seperti bunga bank) yang harus dikeluarkan (dibuang) dari total kekayaan Anda agar sisa harta menjadi suci. Harta ini disalurkan ke fasilitas umum tanpa niat sedekah."
    },
    {
        question: "Apakah hasil diagnosa ini adalah Fatwa?",
        answer: "Bukan. Hasil H.E.D.E adalah indikator awal berdasarkan kaidah umum Fiqh Muamalah (Jumhur Ulama). Untuk kasus spesifik dan keputusan hukum final, Anda tetap disarankan berkonsultasi langsung (Talaqqi) dengan Ustadz atau Ahli Fiqh Muamalah."
    },
    {
        question: "Apakah data keuangan saya aman?",
        answer: "Sangat aman. NIZAMY menggunakan prinsip 'Local-First'. Semua jawaban dan data diagnosa Anda HANYA tersimpan di browser HP Anda. Kami tidak mengirim data tersebut ke server manapun. Aib atau kondisi keuangan Anda adalah privasi mutlak Anda."
    },
    {
        question: "Bagaimana jika hasilnya 'Kritis' atau banyak Riba?",
        answer: "Jangan panik dan jangan putus asa dari rahmat Allah. H.E.D.E dilengkapi dengan roadmap 'Hijrah Bertahap' (Tadarruj). Jika kondisi ekonomi belum memungkinkan untuk berhenti total seketika, Islam memberikan kelonggaran (Rukhshah) untuk menyelesaikannya secara bertahap sambil bertaubat."
    },
    {
        question: "Apa rujukan Fiqh yang digunakan?",
        answer: "Logika diagnosa disusun berdasarkan kaidah-kaidah yang disepakati (Ijma') dan Fatwa DSN-MUI terkait Riba, Gharar, dan Maysir, serta pandangan kontemporer tentang uang elektronik dan cashback."
    }
];

export const QUESTIONS_DB: Question[] = [
  // --- 1. JOB (PEKERJAAN) ---
  {
    id: 'job_role',
    category: 'job',
    text: "Apa status/peran utama pekerjaan Anda saat ini?",
    options: [
      { value: 'not_working', label: "Tidak Bekerja / Ibu Rumah Tangga / Mahasiswa", riskWeight: 0, violationType: 'none' },
      { value: 'halal_direct', label: "Karyawan Sektor Riil / PNS (Non-Lembaga Keuangan)", riskWeight: 0, violationType: 'none' },
      { value: 'freelancer', label: "Freelancer / Professional Self-Employed", riskWeight: 0, violationType: 'none' },
      { value: 'admin_support', label: "Admin/Support di Perusahaan Umum (Campur)", riskWeight: 10, violationType: 'none' },
      { value: 'conv_bank_cs', label: "Frontliner/Marketing Lembaga Keuangan Konvensional (Bank/Leasing/Asuransi)", riskWeight: 90, violationType: 'riba' },
      { value: 'conv_bank_it', label: "Backoffice/IT/HRD Lembaga Keuangan Konvensional", riskWeight: 70, violationType: 'riba' },
      { value: 'haram_direct', label: "Industri Non-Halal (Alkohol, Judi, Hiburan Malam)", riskWeight: 100, violationType: 'zulm' },
    ]
  },
  {
    id: 'job_contract',
    category: 'job',
    text: "Bagaimana sifat akad/kontrak kerja Anda?",
    options: [
      { value: 'not_applicable', label: "Tidak Relevan (Tidak bekerja formal)", riskWeight: 0, violationType: 'none' },
      { value: 'clear', label: "Jelas tugas & gajinya (Akad Ijarah/Ju'alah)", riskWeight: 0, violationType: 'none' },
      { value: 'target_based', label: "Gaji pokok sangat kecil, dominan bonus target yang tidak pasti", riskWeight: 30, violationType: 'gharar' },
      { value: 'grey_area', label: "Tugas sering berubah drastis di luar kontrak tanpa akad baru (Zulm)", riskWeight: 40, violationType: 'zulm' },
    ]
  },

  // --- 2. BUSINESS (BISNIS) ---
  {
    id: 'biz_source',
    category: 'business',
    text: "Apakah Anda menjalankan bisnis? Jika ya, dari mana modal utamanya?",
    options: [
      { value: 'no_business', label: "Tidak memiliki bisnis", riskWeight: 0, violationType: 'none' },
      { value: 'bootstrapping', label: "Tabungan Pribadi / Laba Ditahan / Investor (Syirkah)", riskWeight: 0, violationType: 'none' },
      { value: 'bank_syariah', label: "Pembiayaan Bank Syariah (Murabahah/Musyarakah)", riskWeight: 5, violationType: 'none' },
      { value: 'bank_conv', label: "Kredit Usaha Bank Konvensional (Bunga/Riba)", riskWeight: 90, violationType: 'riba' },
    ]
  },
  {
    id: 'biz_dropship',
    category: 'business',
    text: "Jika Anda berjualan online (Dropship/Reseller), bagaimana metodenya?",
    options: [
      { value: 'not_applicable', label: "Tidak berjualan online / Punya stok sendiri", riskWeight: 0, violationType: 'none' },
      { value: 'wakalah', label: "Dropship resmi (Ada izin/akad wakalah dari supplier)", riskWeight: 0, violationType: 'none' },
      { value: 'wild_dropship', label: "Jual barang orang tanpa izin & tanpa stok (Jual sebelum memiliki)", riskWeight: 80, violationType: 'gharar' }, // Hadits Hakim bin Hizam
    ]
  },

  // --- 3. FINANCE (KEUANGAN) ---
  {
    id: 'fin_loan',
    category: 'finance',
    text: "Apakah Anda memiliki cicilan/utang berjalan?",
    options: [
      { value: 'none', label: "Tidak Ada / Sudah Lunas", riskWeight: 0, violationType: 'none' },
      { value: 'soft_loan', label: "Utang Lunak ke Kerabat/Kantor (Tanpa Bunga)", riskWeight: 0, violationType: 'none' },
      { value: 'kpr_syariah', label: "KPR/Cicilan Syariah Resmi (Akad Jual Beli)", riskWeight: 5, violationType: 'none' },
      { value: 'kpr_conv', label: "KPR/Leasing Konvensional (Bunga Tetap/Floating)", riskWeight: 95, violationType: 'riba' },
      { value: 'pinjol', label: "Pinjaman Online / Rentenir (Bunga Tinggi & Denda)", riskWeight: 100, violationType: 'riba' },
    ]
  },
  {
    id: 'fin_invest',
    category: 'finance',
    text: "Di mana instrumen investasi utama Anda?",
    options: [
      { value: 'none', label: "Tidak berinvestasi / Tunai saja", riskWeight: 0, violationType: 'none' },
      { value: 'gold', label: "Emas Fisik / Properti / Tanah", riskWeight: 0, violationType: 'none' },
      { value: 'stocks_syariah', label: "Saham Syariah (JII/ISSI) / Sukuk / Reksadana Syariah", riskWeight: 0, violationType: 'none' },
      { value: 'deposito', label: "Deposito Bank Konvensional (Bunga)", riskWeight: 80, violationType: 'riba' },
      { value: 'crypto_future', label: "Crypto Futures/Leverage/Option (Tebak harga/Judi)", riskWeight: 95, violationType: 'maysir' },
    ]
  },
  {
    id: 'fin_insurance',
    category: 'finance',
    text: "Apa jenis asuransi (jiwa/kesehatan/kendaraan) yang Anda gunakan?",
    options: [
        { value: 'none_bpjs', label: "Tidak ada / Hanya BPJS Kesehatan (Gotong Royong Negara)", riskWeight: 0, violationType: 'none' },
        { value: 'takaful', label: "Asuransi Syariah (Akad Tabarru'/Hibah)", riskWeight: 0, violationType: 'none' },
        { value: 'conv_insurance', label: "Asuransi Konvensional (Transfer Risiko & Gharar Klaim)", riskWeight: 85, violationType: 'maysir' },
    ]
  },
  {
    id: 'fin_zakat',
    category: 'finance',
    text: "Bagaimana status penunaian Zakat Maal (Harta) Anda?",
    options: [
        { value: 'routine', label: "Rutin menunaikan saat mencapai Haul & Nisab", riskWeight: 0, violationType: 'none' },
        { value: 'not_reached', label: "Harta belum mencapai Nisab (Belum wajib)", riskWeight: 0, violationType: 'none' },
        { value: 'charity_only', label: "Hanya sedekah seikhlasnya, tidak hitung Zakat padahal mampu", riskWeight: 40, violationType: 'zulm' }, 
        { value: 'never', label: "Tidak pernah menunaikan Zakat Maal", riskWeight: 70, violationType: 'zulm' },
    ]
  },
  {
    id: 'fin_inheritance',
    category: 'finance',
    text: "Apakah ada harta warisan keluarga yang belum dibagi?",
    options: [
      { value: 'no_inheritance', label: "Tidak ada / Sudah dibagi tuntas", riskWeight: 0, violationType: 'none' },
      { value: 'divided_syariah', label: "Sudah dibagi sesuai Faraidh (Syariat)", riskWeight: 0, violationType: 'none' },
      { value: 'divided_adat', label: "Dibagi rata/adat (Bukan Faraidh)", riskWeight: 60, violationType: 'zulm' }, 
      { value: 'undivided_mixed', label: "Belum dibagi, harta masih campur & dipakai bersama", riskWeight: 70, violationType: 'zulm' } 
    ]
  },

  // --- 4. DIGITAL TRANSACTIONS ---
  {
    id: 'dig_wallet',
    category: 'digital',
    text: "Bagaimana Anda menyikapi Promo/Diskon di E-Wallet (Gopay/OVO)?",
    options: [
      { value: 'no_wallet', label: "Tidak menggunakan E-Wallet", riskWeight: 0, violationType: 'none' },
      { value: 'pay_pass', label: "Hanya top-up pas mau bayar (Pass-through/Tidak mengendap)", riskWeight: 0, violationType: 'none' },
      { value: 'keep_balance_no_promo', label: "Menyimpan saldo tapi tidak mengambil promo diskon", riskWeight: 5, violationType: 'none' },
      { value: 'promo_hunter', label: "Sengaja pakai E-Wallet karena mengejar diskon/cashback", riskWeight: 60, violationType: 'riba' }, 
    ]
  },
  {
    id: 'dig_marketplace',
    category: 'digital',
    text: "Saat belanja online, metode bayar apa yang sering dipakai?",
    options: [
      { value: 'cod_transfer', label: "COD, Transfer Bank, atau Debit Langsung", riskWeight: 0, violationType: 'none' },
      { value: 'paylater_active', label: "Paylater (Beli sekarang bayar nanti dengan bunga/biaya admin)", riskWeight: 95, violationType: 'riba' },
      { value: 'credit_card', label: "Kartu Kredit Konvensional (Cicilan Berbunga)", riskWeight: 90, violationType: 'riba' },
    ]
  },

  // --- 5. PAYMENT SYSTEM ---
  {
    id: 'pay_cc',
    category: 'payment',
    text: "Apakah Anda menggunakan Kartu Kredit?",
    options: [
      { value: 'none', label: "Tidak punya", riskWeight: 0, violationType: 'none' },
      { value: 'syariah_card', label: "Syariah Card (Akad Ijarah/Kafalah)", riskWeight: 0, violationType: 'none' },
      { value: 'conv_full_pay', label: "Kartu Kredit Konvensional (Selalu bayar penuh/Full Payment agar bebas bunga)", riskWeight: 40, violationType: 'zulm' }, 
      { value: 'conv_revolve', label: "Kartu Kredit Konvensional (Bayar minimum/Revolving dengan Bunga)", riskWeight: 100, violationType: 'riba' },
    ]
  },

  // --- 6. EMERGENCY (KEDARURATAN) - Modifier Section ---
  {
    id: 'em_savings',
    category: 'emergency',
    text: "Berapa lama Anda bisa bertahan hidup jika penghasilan berhenti hari ini?",
    options: [
      { value: 'secure', label: "> 6 Bulan (Aman)", riskWeight: 0, hardshipWeight: 0, violationType: 'none' },
      { value: 'medium', label: "1 - 3 Bulan", riskWeight: 0, hardshipWeight: 50, violationType: 'none' },
      { value: 'critical', label: "Kurang dari 1 bulan / Tidak ada tabungan", riskWeight: 0, hardshipWeight: 100, violationType: 'none' },
    ]
  },
  {
    id: 'em_dependents',
    category: 'emergency',
    text: "Siapa yang bergantung pada nafkah Anda?",
    options: [
      { value: 'single', label: "Hanya diri sendiri", riskWeight: 0, hardshipWeight: 0, violationType: 'none' },
      { value: 'family', label: "Istri & Anak", riskWeight: 0, hardshipWeight: 60, violationType: 'none' },
      { value: 'extended', label: "Orang Tua sakit / Keluarga besar", riskWeight: 0, hardshipWeight: 90, violationType: 'none' },
    ]
  }
];
