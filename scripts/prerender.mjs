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
        title: 'NIZAMY | Kalkulator Waris Islam (Faraidh)',
        description: 'Kalkulator Waris Islam terlengkap. Hitung pembagian harta waris sesuai faraidh — akurat, transparan, dalil Syar\'i.',
        keywords: 'kalkulator waris islam, kalkulator faraidh, hitung waris'
    },
    {
        path: '/zakat',
        title: 'NIZAMY | Kalkulator Zakat Online (Fitrah & Maal)',
        description: 'Kalkulator Zakat terlengkap — zakat fitrah, maal, penghasilan, emas, pertanian. Hitung sesuai syariat Islam secara akurat.',
        keywords: 'kalkulator zakat, hitung zakat, zakat fitrah, zakat maal'
    },
    {
        path: '/hafalan',
        title: 'NIZAMY | Hafalan Quran Tracker (SRS)',
        description: 'Tracker hafalan Al-Quran dengan metode Spaced Repetition (SRS).',
        keywords: 'hafalan quran, tracker hafalan, SRS quran'
    },
    {
        path: '/mushaf',
        title: 'NIZAMY | Mushaf Digital & Kamus Tajwid',
        description: 'Mushaf digital Al-Quran dengan audio, terjemahan, dan kamus tajwid.',
        keywords: 'mushaf digital, alquran online, tajwid'
    },
    {
        path: '/hede',
        title: 'NIZAMY | HEDE — Audit Halal & Cek Riba',
        description: 'HEDE: audit halal dan cek riba pada produk keuangan.',
        keywords: 'audit halal, cek riba, halal check, riba checker'
    },
    {
        path: '/amal',
        title: 'NIZAMY | Amal Yaumi — Tracker Amal Harian',
        description: 'Tracker amal yaumi (harian Islam).',
        keywords: 'amal yaumi, tracker amal, amal harian islam'
    },
    {
        path: '/sholat',
        title: 'NIZAMY | Jadwal Sholat & Kiblat',
        description: 'Jadwal sholat akurat berdasarkan lokasi Anda + penunjuk arah kiblat.',
        keywords: 'jadwal sholat, arah kiblat, waktu sholat'
    },
    {
        path: '/scanner',
        title: 'NIZAMY | Halal Scanner',
        description: 'Scan barcode produk untuk mengecek status halal.',
        keywords: 'halal scanner, scan barcode halal, cek halal'
    },
    {
        path: '/blog',
        title: 'NIZAMY | Artikel Islam — Waris, Zakat, Ekonomi Syariah',
        description: 'Artikel Islam tentang waris (faraidh), zakat, hafalan Quran, ekonomi syariah.',
        keywords: 'artikel islam, waris islam, zakat, ekonomi syariah'
    }
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

    // Replace canonical URL
    html = html.replace(
        /<link rel="canonical" href=".*?">/,
        `<link rel="canonical" href="https://nizamy.com${route.path}" />`
    );
    
    // Replace OG URL
    html = html.replace(
        /<meta property="og:url" content=".*?">/,
        `<meta property="og:url" content="https://nizamy.com${route.path}">`
    );

    // Replace Twitter URL
    html = html.replace(
        /<meta property="twitter:url" content=".*?">/,
        `<meta property="twitter:url" content="https://nizamy.com${route.path}">`
    );

    fs.writeFileSync(routeHtmlPath, html);
    console.log(`Prerendered ${route.path}/index.html`);
});

console.log('✅ SEO Prerendering complete.');
