import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.resolve(__dirname, '../dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

// Read the generic built index.html
if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('index.html not found in dist. Run build first.');
    process.exit(1);
}
const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');

// Define the routes and their SEO metadata to inject
const routes = [
    {
        path: '/faraidh',
        title: 'Kalkulator Waris Islam (Faraidh) - Akurat & Sesuai Syariat | NIZAMY',
        description: 'Kalkulator Waris Islam terlengkap. Hitung pembagian harta waris sesuai faraidh — akurat, transparan, dalil Syar\'i.',
        keywords: 'kalkulator waris, kalkulator waris islam, kalkulator faraidh, hitung waris, pembagian waris, faraidh calculator, waris calculator, harta waris, ilmu waris, hukum waris islam',
        body: {
            h1: 'Kalkulator Waris Islam — Hitung Pembagian Harta Waris Faraidh Akurat',
            p1: 'NIZAMY menyediakan kalkulator waris Islam (faraidh) terlengkap berdasarkan Al-Quran, As-Sunnah, dan Kompilasi Hukum Islam (KHI). Hitung pembagian harta waris secara akurat dan transparan sesuai dalil syar\'i — sehingga setiap ahli waris mendapatkan haknya dengan benar.',
            p2: 'Kalkulator waris kami mendukung perhitungan kompleks meliputi hajb (penghalang), \'aul (pengurangan), radd (kembali ke furudh), musytarakah, dan kasus khusus seperti umariyyatain. Cocok untuk keluarga muslim yang ingin memastikan pembagian harta warisan sesuai syariat.',
        }
    },
    {
        path: '/zakat',
        title: 'Kalkulator Zakat Online (Fitrah & Maal) | NIZAMY',
        description: 'Kalkulator Zakat terlengkap — zakat fitrah, maal, penghasilan, emas, pertanian. Hitung sesuai syariat Islam secara akurat.',
        keywords: 'kalkulator zakat, hitung zakat, zakat fitrah, zakat maal, zakat penghasilan, zakat emas, kalkulator zakat online, cara hitung zakat',
        body: {
            h1: 'Kalkulator Zakat Online — Hitung Zakat Fitrah, Maal, Emas & Penghasilan',
            p1: 'Hitung zakat Anda secara akurat dengan kalkulator zakat NIZAMY. Dukungan lengkap untuk zakat fitrah, zakat maal, zakat penghasilan, zakat emas dan perak, zakat pertanian, serta zakat terhadap reksa dana dan investasi syariah.',
            p2: 'Kalkulator zakat kami menampilkan visualisasi pencapaian nisab secara real-time dan menghasilkan kwitansi digital dalam format PDF yang dapat dicetak. Semua perhitungan dilakukan di perangkat Anda — privasi terjamin, tanpa menyimpan data di server.',
        }
    },
    {
        path: '/hafalan',
        title: 'Hafalan Quran Tracker (SRS) - Jadwal Otomatis | NIZAMY',
        description: 'Tracker hafalan Al-Quran dengan metode Spaced Repetition (SRS). Jadwal review otomatis agar hafalan tetap kuat.',
        keywords: 'hafalan quran, tracker hafalan, SRS quran, spaced repetition quran, menghafal alquran, hafalan tracker, jadwal hafalan',
        body: {
            h1: 'Hafalan Quran Tracker — SRS untuk Menghafal Al-Quran Lebih Efektif',
            p1: 'NIZAMY hadir dengan sistem hafalan Al-Quran yang menggunakan metode Spaced Repetition System (SRS). Jadwalkan review otomatis agar hafalan Anda kuat dan tidak lupa, sesuai prinsip "menguhari tiap ayat dan mengauthadinya".',
            p2: 'Fitur lengkap meliputi pelacatan level, streak harian, sistem XP dan badge, serta dukungan multi-profile untuk seluruh keluarga. Cocok untuk para profesional yang ingin menghafal Al-Quran secara konsisten meskipun sibuk.',
        }
    },
    {
        path: '/mushaf',
        title: 'Mushaf Digital & Kamus Tajwid - Baca Al-Quran | NIZAMY',
        description: 'Mushaf digital Al-Quran dengan audio, terjemahan, dan kamus tajwid. Baca, dengar, dan pelajari tajwid dalam satu aplikasi.',
        keywords: 'mushaf digital, alquran online, tajwid, baca quran, dengar quran, quran digital, mushaf online, kamus tajwid',
        body: {
            h1: 'Mushaf Digital Al-Quran — Baca, Dengar Audio, dan Kamus Tajwid',
            p1: 'Baca Al-Quran secara digital lengkap dengan mushaf kami. Nikmati audio murottal per ayat atau per kata (word-by-word), terjemahan tafsir, serta analisis tajwid otomatis yang menampilkan hukum tiap huruf.',
            p2: 'Dengan rendering virtualisasi tinggi (react-virtuoso), gulirkan ribuan ayat tanpa lag. Fitur bedah kata memungkinkan Anda menjelajahi makna, transliterasi, dan makhraj huruf hanya dengan mengklik.',
        }
    },
    {
        path: '/hede',
        title: 'HEDE: Audit Halal & Cek Riba Keuangan Syariah | NIZAMY',
        description: 'HEDE: audit halal dan cek riba pada produk keuangan. Analisis kesesuaian syariah pada investasi, asuransi, dan pinjaman Anda.',
        keywords: 'audit halal, cek riba, halal check, riba checker, ekonomi syariah, keuangan syariah, klinik finansial islam',
        body: {
            h1: 'HEDE — Audit Halal & Cek Riba pada Keuangan Syariah',
            p1: 'HEDE (Halal Economic Diagnostic Engine) adalah mesin diagnostik keuangan syariah yang membantu Anda mengaudit kesehatan ekonomi pribadi. Deteksi potensi riba, gharar, maysir, dan zulm di investasi, asuransi, pinjaman, dan transaksi sehari-hari.',
            p2: 'Dapatkan skor kepatuhan 0-100, tingkat risiko (Aman/Syubhat/Kritis), dan roadmap hijacking yang dipersonalisasi. Unduh template akad syariah dan panduan tathhir langsung dari aplikasi.',
        }
    },
    {
        path: '/amal',
        title: 'Amal Yaumi Tracker - Catatan Amal Harian Islam | NIZAMY',
        description: 'Tracker amal yaumi (harian Islam). Catat sholat, dzikir, puasa Sunnah, dan amal kebaikan lainnya setiap hari.',
        keywords: 'amal yaumi, tracker amal, amal harian islam, catatan amal, dzikir tracker, checklist ibadah, kebaikan harian',
        body: {
            h1: 'Amal Yaumi — Tracker Amal Harian Islam',
            p1: 'Catat amal kebaikan harian Anda dalam satu aplikasi. Dari sholat sunnah, dzikir pagi dan petang, puasa sunnah, hingga sedekah — semua tercatat rapi untuk menguatkan kebiasaan ibadah.',
            p2: 'Dapatkan pengingat notifikasi, pencapaian streak, dan laporan mingguan agar konsisten menunaikan kebaikan. Data disimpan sepenuhnya di perangkat Anda dengan privasi terjaga.',
        }
    },
    {
        path: '/sholat',
        title: 'Jadwal Sholat Akurat & Arah Kiblat | NIZAMY',
        description: 'Jadwal sholat akurat berdasarkan lokasi Anda + penunjuk arah kiblat. Notifikasi adzan & waktu sholat tepat waktu.',
        keywords: 'jadwal sholat, arah kiblat, waktu sholat, adzan, jadwal shalat, prayer times, qibla finder, waktu sholat lokasi',
        body: {
            h1: 'Jadwal Sholat & Kiblat — Waktu Shalat Akurat Berdasarkan Lokasi',
            p1: 'Dapatkan jadwal sholat (shalat) waktu tepat berdasarkan lokasi Anda di seluruh Indonesia. Nikmati penunjuk arah kiblat yang akurat serta notifikasi adzan dan pengingat waktu sholat agar tidak terlewat.',
            p2: 'Menggunakan data dari AlAdhan dan BigDataCloud untuk akurasi tinggi. Dukungan dark mode dan tampilan yang tenang untuk fokus beribadah.',
        }
    },
    {
        path: '/scanner',
        title: 'Halal Scanner (Cek Barcode) - Sertifikasi MUI | NIZAMY',
        description: 'Scan barcode produk untuk mengecek status halal. Verifikasi sertifikasi halal MUI secara instan.',
        keywords: 'halal scanner, scan barcode halal, cek halal, sertifikasi halal MUI, barcode halal, cek produk halal',
        body: {
            h1: 'Halal Scanner — Scan Barcode untuk Cek Status Halal Produk',
            p1: 'Memindai barcode produk secara instan untuk memverifikasi status halal. Cocok untuk berbelan di supermarket atau toko online agar Anda hanya membeli produk halal sesuai sertifikasi MUI.',
            p2: 'Dengan kamera smartphone, scan dan cek keabsahan produk. Catat hasil pemindaian ke riwayat pribadi untuk referensi belanja berikutnya. Semua data diproses di perangkat Anda — tidak ada data yang dikirim ke server.',
        }
    },
    {
        path: '/blog',
        title: 'Artikel Islam (Waris, Zakat, Ekonomi Syariah) | NIZAMY',
        description: 'Artikel Islam tentang waris (faraidh), zakat, hafalan Quran, ekonomi syariah, dan klinik finansial. Panduan lengkap sesuai dalil Syar\'i.',
        keywords: 'artikel islam, waris islam, zakat, ekonomi syariah, hafalan quran, fiqh waris, klinik finansial, panduan islam',
        body: {
            h1: 'Artikel Islam — Panduan Waris, Zakat, Ekonomi Syariah & Hafalan Quran',
            p1: 'Kumpulan artikel Islami terpercaya mengenai faraidh (waris), zakat, hafalan Al-Quran, ekonomi syariah, dan klinik finansial. Setiap panduan disusun berdasarkan dalil Al-Quran dan As-Sunnah beserta penjelasan KHI.',
            p2: 'Dari cara menghitung pembagian harta waris hingga panduan mengelola keuangan syariah, semua tersedia lengkap di sini. Ikuti kami untuk pembaruan artikel tiap minggu.',
        }
    },
];

routes.forEach(route => {
    const routeDir = path.join(DIST_DIR, route.path);
    if (!fs.existsSync(routeDir)) {
        fs.mkdirSync(routeDir, { recursive: true });
    }

    const routeHtmlPath = path.join(routeDir, 'index.html');

    // Replace title
    let html = baseHtml.replace(
        /<title>.*?<\/title>/,
        `<title>${route.title}</title>`
    );

    // Replace description
    html = html.replace(
        /<meta name="description".*?>/s,
        `<meta name="description" content="${route.description}" />`
    );

    // Replace keywords
    html = html.replace(
        /<meta name="keywords".*?>/s,
        `<meta name="keywords" content="${route.keywords}" />`
    );

    // Replace OG Title
    html = html.replace(
        /<meta property="og:title".*?>/s,
        `<meta property="og:title" content="${route.title}">`
    );

    // Replace OG Description
    html = html.replace(
        /<meta property="og:description".*?>/s,
        `<meta property="og:description" content="${route.description}">`
    );

    // Replace Twitter Title
    html = html.replace(
        /<meta property="twitter:title".*?>/s,
        `<meta property="twitter:title" content="${route.title}">`
    );

    // Replace Twitter Description
    html = html.replace(
        /<meta property="twitter:description".*?>/s,
        `<meta property="twitter:description" content="${route.description}">`
    );

    // Replace canonical URL (using 's' flag for dotAll — the source HTML has newlines)
    html = html.replace(
        /<link rel="canonical" href=".*?">/s,
        `<link rel="canonical" href="https://nizamy.com${route.path}" />`
    );

    // Replace OG URL
    html = html.replace(
        /<meta property="og:url" content=".*?">/s,
        `<meta property="og:url" content="https://nizamy.com${route.path}">`
    );

    // Replace OG image and Twitter image (point to real logo)
    html = html.replace(
        /<meta property="og:image" content=".*?">/s,
        `<meta property="og:image" content="https://nizamy.com/images/logo_nizamy.png">`
    );
    html = html.replace(
        /<meta property="twitter:image" content=".*?">/s,
        `<meta property="twitter:image" content="https://nizamy.com/images/logo_nizamy.png">`
    );

    // Replace Twitter URL
    html = html.replace(
        /<meta property="twitter:url" content=".*?">/s,
        `<meta property="twitter:url" content="https://nizamy.com${route.path}">`
    );

    // Inject unique, keyword-rich body content for SEO
    // Replaces the generic "Memuat aplikasi..." placeholder with page-specific text
    if (route.body) {
        const bodyContent = `
    <div class="seo-static-content max-w-4xl mx-auto px-4 py-8 md:py-12 text-slate-700 dark:text-slate-300">
      <h1 class="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">${route.body.h1}</h1>
      <p class="text-lg md:text-xl mb-4 leading-relaxed">${route.body.p1}</p>
      <p class="text-lg md:text-xl mb-6 leading-relaxed">${route.body.p2}</p>
    </div>`;
        html = html.replace(
            /<!-- Static content for SEO and non-JS users -->[\s\S]*?<\/div>\s*<\/div>/,
            `<!-- Static content for SEO and non-JS users --><!-- Replaced by prerender -->\n   ${bodyContent}\n   <div id="root-app">`
        );
    }

    fs.writeFileSync(routeHtmlPath, html);
    console.log(`Prerendered ${route.path}/index.html`);
});

console.log('✅ SEO Prerendering complete.');
