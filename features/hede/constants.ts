import type { RiskLevel, Question, HedeCategory, ViolationType, FiqhTerm } from '../../types.ts';

// --- CENTRALIZED STYLING CONFIG ---
// Updated Hex colors to vibrant shades (500 series) for better visibility on both Light (White) and Dark (Slate-900) backgrounds.
export const RISK_CONFIG: Record<RiskLevel, { 
    label: string; 
    bg: string; 
    text: string; 
    border: string; 
    hex: string; // For Charts & PDF
}> = {
    safe: { 
        label: 'Aman (Halal)', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30', 
        text: 'text-emerald-800 dark:text-emerald-400', 
        border: 'border-emerald-200 dark:border-emerald-800', 
        hex: '#10b981' // Emerald 500
    },
    low: { 
        label: 'Rendah', 
        bg: 'bg-blue-100 dark:bg-blue-900/30', 
        text: 'text-blue-800 dark:text-blue-400', 
        border: 'border-blue-200 dark:border-blue-800', 
        hex: '#3b82f6' // Blue 500
    },
    medium: { 
        label: 'Menengah (Syubhat)', 
        bg: 'bg-amber-100 dark:bg-amber-900/30', 
        text: 'text-amber-800 dark:text-amber-400', 
        border: 'border-amber-200 dark:border-amber-800', 
        hex: '#f59e0b' // Amber 500
    },
    high: { 
        label: 'Tinggi', 
        bg: 'bg-orange-100 dark:bg-orange-900/30', 
        text: 'text-orange-800 dark:text-orange-400', 
        border: 'border-orange-200 dark:border-orange-800', 
        hex: '#f97316' // Orange 500
    },
    critical: { 
        label: 'Kritis (Haram)', 
        bg: 'bg-red-100 dark:bg-red-900/30', 
        text: 'text-red-800 dark:text-red-400', 
        border: 'border-red-200 dark:border-red-800', 
        hex: '#ef4444' // Red 500
    }
};

// WCAG Compliant Text Colors for Badges
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
    job: 'Pekerjaan & Profesi',
    business: 'Model Bisnis',
    finance: 'Keuangan & Investasi',
    digital: 'Transaksi Digital',
    payment: 'Sistem Pembayaran',
    emergency: 'Kondisi Kedaruratan'
};

export const FIQH_GLOSSARY: FiqhTerm[] = [
    // --- PELANGGARAN ---
    { term: 'Riba', category: 'riba', definition: 'Setiap penambahan (ziyadah) yang diambil tanpa adanya transaksi pengganti (iwadh) yang sah atau penambahan dalam utang piutang.' },
    { term: 'Riba Fadhl', category: 'riba', definition: 'Riba dalam tukar menukar barang ribawi sejenis (emas, perak, kurma, gandum, garam) dengan takaran/kadar berbeda.' },
    { term: 'Riba Nasi\'ah', category: 'riba', definition: 'Riba karena penundaan penyerahan atau pembayaran (bunga kredit/utang).' },
    { term: 'Gharar', category: 'gharar', definition: 'Ketidakjelasan dalam transaksi (objek, harga, waktu, atau kemampuan serah terima) yang dapat memicu perselisihan.' },
    { term: 'Maysir', category: 'maysir', definition: 'Transaksi spekulatif yang menggantungkan keuntungan pada keberuntungan semata (judi/zero-sum game).' },
    { term: 'Risywah', category: 'zulm', definition: 'Pemberian (suap) untuk membatalkan yang hak atau membenarkan yang batil. Pemberi dan penerima sama-sama dilaknat.' },
    { term: 'Ghasab', category: 'zulm', definition: 'Menguasai hak/harta orang lain secara zalim (tanpa izin). Contoh: Menggunakan harta warisan yang belum dibagi, memakai tanah tetangga, atau software bajakan.' },
    { term: 'Israf', category: 'zulm', definition: 'Perilaku berlebih-lebihan dalam membelanjakan harta (boros) untuk hal mubah, yang melampaui batas kepatutan.' },
    { term: 'Akad Fasid', category: 'zulm', definition: 'Akad yang rusak karena tidak terpenuhinya syarat atau rukun syariah, meskipun mungkin sah secara administratif negara.' },
    { term: 'Bai\' Kali bi Kali', category: 'gharar', definition: 'Jual beli utang dengan utang (menunda penyerahan barang dan harga sekaligus), dilarang karena gharar tinggi.' },

    // --- AKAD & SOLUSI (MUAMALAH) ---
    { term: 'Ijarah', category: 'general', definition: 'Akad pemindahan hak guna (manfaat) atas barang atau jasa dalam waktu tertentu dengan pembayaran upah/sewa (Ujrah), tanpa diikuti pemindahan kepemilikan barang. Dasar hukum gaji karyawan.' },
    { term: 'Ju\'alah', category: 'general', definition: 'Akad sayembara atau komisi berbasis hasil. Upah hanya diberikan jika pekerjaan selesai atau target tercapai (Success Fee). Umum digunakan untuk marketing freelance atau agen.' },
    { term: 'Wakalah', category: 'general', definition: 'Akad pelimpahan kekuasaan dari satu pihak (Muwakkil) kepada pihak lain (Wakil) untuk melakukan sesuatu yang boleh diwakilkan. Dasar hukum Dropship Syariah (menjadi agen penjual).' },
    { term: 'Syirkah', category: 'general', definition: 'Akad kerja sama usaha antara dua pihak atau lebih untuk suatu usaha tertentu di mana masing-masing pihak memberikan kontribusi dana/amal dengan kesepakatan keuntungan dan risiko ditanggung bersama.' },
    { term: 'Mudharabah', category: 'general', definition: 'Kerja sama usaha antara pemilik modal (Shahibul Maal) dan pengelola (Mudharib). Keuntungan dibagi bagi hasil, kerugian finansial ditanggung pemilik modal (selama bukan kelalaian pengelola).' },
    { term: 'Musyarakah', category: 'general', definition: 'Kerja sama di mana semua pihak menyetor modal. Keuntungan dibagi sesuai nisbah sepakat, kerugian dibagi proporsional sesuai porsi modal.' },
    { term: 'Murabahah', category: 'general', definition: 'Akad jual beli barang dengan menegaskan harga perolehan dan keuntungan (margin) yang disepakati. Umum digunakan di Bank Syariah untuk KPR/Kendaraan.' },
    { term: 'Kafalah', category: 'general', definition: 'Akad jaminan/penanggungan yang diberikan oleh penanggung (Kafil) kepada pihak ketiga untuk memenuhi kewajiban pihak kedua. Dasar hukum Kartu Kredit Syariah (Syariah Card).' },
    { term: 'Qardh', category: 'general', definition: 'Akad pinjam meminjam uang murni tanpa bunga. Dalam Islam, Qardh adalah akad sosial (Tabarru\'), dilarang mengambil keuntungan materi.' },
    { term: 'Taqabudh', category: 'general', definition: 'Serah terima barang secara tunai/langsung (haqiqi) atau secara hukum/administrasi (hukmi) dalam satu majelis. Syarat mutlak sahnya jual beli Emas dan Valas.' },
    
    // --- KONSEP ---
    { term: 'Tathhirul Mal', category: 'general', definition: 'Proses membersihkan harta dari unsur haram/syubhat dengan mengeluarkannya untuk fasilitas umum tanpa mengharap pahala sedekah.' },
    { term: 'Tadarruj', category: 'general', definition: 'Prinsip bertahap dalam menerapkan hukum Islam, digunakan saat kondisi sulit/darurat untuk mencapai ideal (misal: melunasi utang riba satu per satu).' },
    { term: 'Bara\'ah', category: 'general', definition: 'Sikap berlepas diri sepenuhnya dan seketika dari segala bentuk transaksi haram. Wajib dilakukan jika memiliki kemampuan (qudrah) untuk meninggalkan haram tanpa membahayakan nyawa.' },
    { term: 'Wara\'', category: 'general', definition: 'Sikap kehati-hatian tingkat tinggi dengan meninggalkan hal yang mubah (boleh) karena khawatir terjerumus pada yang haram, apalagi meninggalkan yang syubhat.' },
    { term: 'Tabarru\'', category: 'general', definition: 'Akad hibah/sumbangan/tolong-menolong yang tidak mencari keuntungan komersial. Dasar dari asuransi syariah (sesama peserta saling menanggung risiko).' },
];

export const HEDE_FAQ = [
    {
        question: "Apa itu HEDE?",
        answer: "HEDE (Halal Economic Diagnostic Engine) adalah alat bantu diagnosa mandiri (self-assessment) untuk mendeteksi potensi pelanggaran syariah dalam aktivitas ekonomi Anda, mulai dari pekerjaan, investasi, hingga kebiasaan transaksi digital."
    },
    {
        question: "Apa itu fitur 'Tathhir'?",
        answer: "Tathhir adalah kalkulator untuk menghitung berapa nominal harta non-halal (seperti bunga bank) yang harus dikeluarkan (dibuang) dari total kekayaan Anda agar sisa harta menjadi suci. Harta ini disalurkan ke fasilitas umum tanpa niat sedekah."
    },
    {
        question: "Apakah hasil diagnosa ini adalah Fatwa?",
        answer: "Bukan. Hasil HEDE adalah indikator awal berdasarkan kaidah umum Fiqh Muamalah (Jumhur Ulama). Untuk kasus spesifik dan keputusan hukum final, Anda tetap disarankan berkonsultasi langsung (Talaqqi) dengan Ustadz atau Ahli Fiqh Muamalah."
    },
    {
        question: "Apakah data keuangan saya aman?",
        answer: "Sangat aman. NIZAMY menggunakan prinsip 'Local-First'. Semua jawaban dan data diagnosa Anda HANYA tersimpan di browser HP Anda. Kami tidak mengirim data tersebut ke server manapun. Aib atau kondisi keuangan Anda adalah privasi mutlak Anda."
    },
    {
        question: "Bagaimana jika hasilnya 'Kritis' atau banyak Riba?",
        answer: "Jangan panik dan jangan putus asa dari rahmat Allah. HEDE dilengkapi dengan roadmap 'Hijrah Bertahap' (Tadarruj). Jika kondisi ekonomi belum memungkinkan untuk berhenti total seketika, Islam memberikan kelonggaran (Rukhshah) untuk menyelesaikannya secara bertahap sambil bertaubat."
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
      { value: 'not_working', label: "Tidak Bekerja / Pelajar / Mahasiswa", riskWeight: 0, violationType: 'none' },
      { value: 'manual_labor', label: "Pekerja Fisik / Tukang / Petani / Sektor Informal", riskWeight: 0, violationType: 'none' },
      { value: 'white_collar', label: "Karyawan Kantor Sektor Riil / PNS / Profesional", riskWeight: 0, violationType: 'none' },
      { value: 'freelancer', label: "Freelancer / Digital Nomad / Bisnis Sendiri", riskWeight: 0, violationType: 'none' },
      { value: 'fin_industry', label: "Karyawan Bank / Leasing / Asuransi Konvensional", riskWeight: 90, violationType: 'riba' },
      { value: 'haram_industry', label: "Industri Non-Halal (Bar/Alkohol/Judi)", riskWeight: 100, violationType: 'zulm' },
    ]
  },
  {
    id: 'job_contract',
    category: 'job',
    text: "Bagaimana skema pendapatan atau akad kerja Anda?",
    dependency: {
        id: 'job_role',
        type: 'exclude',
        values: ['not_working', 'manual_labor']
    },
    options: [
      { value: 'clear', label: "Gaji/Fee/Upah nominalnya jelas & terukur (Akad Ijarah/Ju'alah)", riskWeight: 0, violationType: 'none' },
      { value: 'target_based', label: "Pendapatan tidak pasti, dominan target/komisi/bagi hasil", riskWeight: 30, violationType: 'gharar' },
      { value: 'grey_area', label: "Lingkup kerja sering berubah drastis tanpa kesepakatan ulang", riskWeight: 40, violationType: 'zulm' },
    ]
  },
  {
    id: 'job_risywah',
    category: 'job',
    text: "Dalam profesi Anda, apakah wajar menerima 'uang pelicin' atau fee di luar kontrak untuk melancarkan urusan?",
    dependency: {
        id: 'job_role',
        type: 'exclude',
        values: ['not_working', 'manual_labor', 'haram_industry']
    },
    options: [
        { value: 'clean', label: "Tidak, sangat ketat & bersih (Zero Tolerance)", riskWeight: 0, violationType: 'none' },
        { value: 'gifts', label: "Hanya menerima hadiah makanan kecil dari klien (Gratifikasi)", riskWeight: 40, violationType: 'gharar' },
        { value: 'kickback', label: "Ya, ada fee/komisi 'bawah meja' (Suap/Risywah)", riskWeight: 100, violationType: 'zulm' }
    ]
  },
  {
    id: 'job_software',
    category: 'job',
    text: "Apakah perangkat lunak (Software/OS) yang Anda gunakan untuk bekerja 100% orisinal?",
    dependency: {
        id: 'job_role',
        type: 'exclude',
        values: ['not_working', 'manual_labor']
    },
    options: [
        { value: 'original', label: "Ya, semua Original / Berbayar / Open Source", riskWeight: 0, violationType: 'none' },
        { value: 'office_provided', label: "Disediakan kantor (Asumsi Original)", riskWeight: 0, violationType: 'none' },
        { value: 'mixed', label: "Campur, ada yang bajakan (Crack) karena mahal", riskWeight: 50, violationType: 'zulm' },
        { value: 'pirated', label: "Dominan bajakan/Crack untuk mencari nafkah", riskWeight: 80, violationType: 'zulm' }
    ]
  },

  // --- 2. BUSINESS (BISNIS) ---
  {
    id: 'biz_source',
    category: 'business',
    text: "Apakah Anda menjalankan bisnis? Jika ya, dari mana modal utamanya?",
    options: [
      { value: 'no_business', label: "Tidak memiliki bisnis", riskWeight: 0, violationType: 'none' },
      { value: 'bootstrapping', label: "Modal Sendiri / Investor (Syirkah/Mudharabah)", riskWeight: 0, violationType: 'none' },
      { value: 'bank_syariah', label: "Pembiayaan Bank Syariah (Murabahah/Musyarakah)", riskWeight: 10, violationType: 'none' },
      { value: 'bank_conv', label: "Kredit Usaha Bank Konvensional (Bunga/Riba)", riskWeight: 90, violationType: 'riba' },
    ]
  },
  {
    id: 'biz_mlm',
    category: 'business',
    text: "Jika Anda mengikuti bisnis kemitraan/MLM, dari mana bonus terbesar berasal?",
    dependency: {
        id: 'biz_source',
        type: 'exclude',
        values: ['no_business']
    },
    options: [
        { value: 'not_applicable', label: "Tidak ikut MLM", riskWeight: 0, violationType: 'none' },
        { value: 'product_sales', label: "Murni dari penjualan produk ritel kepada konsumen", riskWeight: 0, violationType: 'none' },
        { value: 'recruitment', label: "Dominan dari merekrut member baru (Money Game)", riskWeight: 95, violationType: 'maysir' }
    ]
  },
  {
    id: 'biz_dropship',
    category: 'business',
    text: "Jika Anda berjualan online (Dropship/Reseller), bagaimana metodenya?",
    dependency: {
        id: 'biz_source',
        type: 'exclude',
        values: ['no_business']
    },
    options: [
      { value: 'not_applicable', label: "Tidak berjualan online / Punya stok sendiri", riskWeight: 0, violationType: 'none' },
      { value: 'wakalah', label: "Dropship resmi (Ada izin/akad wakalah dari supplier)", riskWeight: 0, violationType: 'none' },
      { value: 'wild_dropship', label: "Jual barang orang tanpa izin & tanpa stok (Jual sebelum memiliki)", riskWeight: 80, violationType: 'gharar' }, 
    ]
  },

  // --- 3. FINANCE (KEUANGAN) ---
  {
    id: 'fin_lifestyle',
    category: 'finance',
    text: "Bagaimana pola pengeluaran bulanan dibandingkan pendapatan Anda?",
    options: [
        { value: 'saving', label: "Hemat & Rutin Investasi (Surplus)", riskWeight: 0, violationType: 'none' },
        { value: 'enough', label: "Pas-pasan / Cukup untuk kebutuhan (Zero Budgeting)", riskWeight: 0, violationType: 'none' },
        { value: 'deficit_needs', label: "Defisit/Kurang karena menanggung beban keluarga/darurat (Bukan boros)", riskWeight: 0, violationType: 'none' },
        { value: 'lifestyle_waste', label: "Defisit demi gaya hidup/gengsi (Israf/Tabdzir)", riskWeight: 40, violationType: 'zulm' },
        { value: 'debt_consumptive', label: "Berutang untuk hal konsumtif/keinginan sekunder", riskWeight: 70, violationType: 'zulm' }
    ]
  },
  {
    id: 'fin_loan',
    category: 'finance',
    text: "Apakah Anda memiliki cicilan/utang berjalan?",
    options: [
      { value: 'none', label: "Tidak Ada / Sudah Lunas", riskWeight: 0, violationType: 'none' },
      { value: 'soft_loan', label: "Utang Lunak ke Kerabat (Qardh/Tanpa Bunga)", riskWeight: 0, violationType: 'none' },
      { value: 'kpr_syariah', label: "KPR/Cicilan Syariah Resmi (Murabahah)", riskWeight: 5, violationType: 'none' },
      { value: 'kpr_conv', label: "KPR/Leasing Konvensional (Bunga)", riskWeight: 95, violationType: 'riba' },
      { value: 'pinjol', label: "Pinjaman Online / Rentenir (Bunga Tinggi)", riskWeight: 100, violationType: 'riba' },
    ]
  },
  {
    id: 'fin_invest',
    category: 'finance',
    text: "Di mana instrumen investasi utama Anda?",
    options: [
      { value: 'none', label: "Tidak berinvestasi / Tunai saja", riskWeight: 0, violationType: 'none' },
      { value: 'gold', label: "Emas Fisik / Properti / Tanah", riskWeight: 0, violationType: 'none' },
      { value: 'stocks_syariah', label: "Saham Syariah / Sukuk / Reksadana Syariah", riskWeight: 0, violationType: 'none' },
      { value: 'deposito', label: "Deposito Bank Konvensional (Bunga)", riskWeight: 80, violationType: 'riba' },
      { value: 'crypto_future', label: "Crypto Futures/Leverage (Judi)", riskWeight: 95, violationType: 'maysir' },
    ]
  },
  {
    id: 'fin_trading_gold',
    category: 'finance',
    text: "Jika Anda trading Emas/Valas secara online, apakah ada serah terima fisik (taqabudh)?",
    dependency: {
        id: 'fin_invest',
        type: 'exclude',
        values: ['none', 'deposito']
    },
    options: [
        { value: 'not_applicable', label: "Tidak trading emas/valas", riskWeight: 0, violationType: 'none' },
        { value: 'physical', label: "Ya, emas bisa dicetak/diambil fisik sewaktu-waktu", riskWeight: 0, violationType: 'none' },
        { value: 'speculative', label: "Tidak, hanya angka di aplikasi untuk cari selisih harga (Paper Gold)", riskWeight: 85, violationType: 'riba' }
    ]
  },
  {
    id: 'fin_insurance',
    category: 'finance',
    text: "Apa jenis asuransi (jiwa/kesehatan/kendaraan) yang Anda gunakan?",
    options: [
        { value: 'none_bpjs', label: "Tidak Punya / BPJS Kesehatan (Gotong Royong)", riskWeight: 0, violationType: 'none' },
        { value: 'takaful', label: "Asuransi Syariah (Takaful/Tabarru')", riskWeight: 0, violationType: 'none' },
        { value: 'conv_insurance', label: "Asuransi Konvensional Swasta", riskWeight: 85, violationType: 'maysir' },
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
      { value: 'undivided_mixed', label: "Belum dibagi, harta masih campur & dipakai bersama (Ghasab)", riskWeight: 70, violationType: 'zulm' } 
    ]
  },

  // --- 4. DIGITAL TRANSACTIONS ---
  {
    id: 'dig_wallet',
    category: 'digital',
    text: "Bagaimana Anda menyikapi Promo/Diskon di E-Wallet (Gopay/OVO/ShopeePay)?",
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
      { value: 'paylater_active', label: "Paylater (Beli sekarang bayar nanti dengan bunga/biaya)", riskWeight: 95, violationType: 'riba' },
      { value: 'credit_card', label: "Kartu Kredit Konvensional (Cicilan Berbunga)", riskWeight: 90, violationType: 'riba' },
    ]
  },
  {
    id: 'dig_gacha',
    category: 'digital',
    text: "Apakah Anda sering membeli item virtual acak (Gacha/Lootbox) atau Mystery Box?",
    options: [
        { value: 'no', label: "Tidak pernah", riskWeight: 0, violationType: 'none' },
        { value: 'direct', label: "Hanya beli item pasti (Direct Purchase)", riskWeight: 0, violationType: 'none' },
        { value: 'yes', label: "Ya, sering beli gacha demi keberuntungan (Untung-untungan)", riskWeight: 90, violationType: 'maysir' }
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
      { value: 'conv_full_pay', label: "Kartu Kredit Konvensional (Selalu bayar penuh/Full Payment)", riskWeight: 40, violationType: 'zulm' }, 
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