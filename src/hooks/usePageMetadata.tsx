import { useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext.tsx';
import { generateFAQSchema, generateSoftwareSchema, generateBreadcrumbSchema } from '../lib/seo.ts';
import { FARAIDH_FAQ } from '../features/faraidh/constants.ts';
import { ZAKAT_FAQ } from '../features/zakat/constants.ts';

const SITE_URL = 'https://nizamy.com';

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  brandColorLight: string;
}

const PAGE_META: Record<string, PageMeta> = {
  '/faraidh': {
    title: 'Kalkulator Waris Islam (Faraidh) - Akurat & Sesuai Syariat | NIZAMY',
    description: 'Kalkulator Waris Islam terlengkap. Hitung pembagian harta waris sesuai faraidh — akurat, transparan, dalil Syar\'i. Gratis & privasi terjaga.',
    keywords: 'kalkulator waris islam, kalkulator faraidh, hitung waris, pembagian waris, faraidh calculator, waris calculator, harta waris, ilmu waris',
    brandColorLight: '#0284c7',
  },
  '/zakat': {
    title: 'Kalkulator Zakat Online (Fitrah & Maal) | NIZAMY',
    description: 'Kalkulator Zakat terlengkap — zakat fitrah, maal, penghasilan, emas, pertanian. Hitung sesuai syariat Islam secara akurat.',
    keywords: 'kalkulator zakat, hitung zakat, zakat fitrah, zakat maal, zakat penghasilan, zakat emas, kalkulator zakat online',
    brandColorLight: '#059669',
  },
  '/hafalan': {
    title: 'Hafalan Quran Tracker (SRS) - Jadwal Otomatis | NIZAMY',
    description: 'Tracker hafalan Al-Quran dengan metode Spaced Repetition (SRS). Jadwal review otomatis agar hafalan tetap kuat.',
    keywords: 'hafalan quran, tracker hafalan, SRS quran, spaced repetition quran, menghafal alquran, hafalan tracker',
    brandColorLight: '#4338ca',
  },
  '/mushaf': {
    title: 'Mushaf Digital & Kamus Tajwid - Baca Al-Quran | NIZAMY',
    description: 'Mushaf digital Al-Quran dengan audio, terjemahan, dan kamus tajwid. Baca, dengar, dan pelajari tajwid dalam satu aplikasi.',
    keywords: 'mushaf digital, alquran online, tajwid, baca quran, dengar quran, quran digital, mushaf online',
    brandColorLight: '#0d9488',
  },
  '/hede': {
    title: 'HEDE: Audit Halal & Cek Riba Keuangan Syariah | NIZAMY',
    description: 'HEDE: audit halal dan cek riba pada produk keuangan. Analisis kesesuaian syariah pada investasi, asuransi, dan pinjaman Anda.',
    keywords: 'audit halal, cek riba, halal check, riba checker, ekonomi syariah, keuangan syariah, klinik finansial islam',
    brandColorLight: '#7e22ce',
  },
  '/amal': {
    title: 'Amal Yaumi Tracker - Catatan Amal Harian Islam | NIZAMY',
    description: 'Tracker amal yaumi (harian Islam). Catat sholat, dzikir, puasa Sunnah, dan amal kebaikan lainnya setiap hari.',
    keywords: 'amal yaumi, tracker amal, amal harian islam, catatan amal, dzikir tracker, checklist ibadah',
    brandColorLight: '#10b981',
  },
  '/sholat': {
    title: 'Jadwal Sholat Akurat & Arah Kiblat | NIZAMY',
    description: 'Jadwal sholat akurat berdasarkan lokasi Anda + penunjuk arah kiblat. Notifikasi adzan & waktu sholat tepat waktu.',
    keywords: 'jadwal sholat, arah kiblat, waktu sholat, adzan, jadwal shalat, prayer times, qibla finder',
    brandColorLight: '#4338ca',
  },
  '/scanner': {
    title: 'Halal Scanner (Cek Barcode) - Sertifikasi MUI | NIZAMY',
    description: 'Scan barcode produk untuk mengecek status halal. Verifikasi sertifikasi halal MUI secara instan.',
    keywords: 'halal scanner, scan barcode halal, cek halal, sertifikasi halal MUI, barcode halal',
    brandColorLight: '#4f46e5',
  },
  '/blog': {
    title: 'Artikel Islam (Waris, Zakat, Ekonomi Syariah) | NIZAMY',
    description: 'Artikel Islam tentang waris (faraidh), zakat, hafalan Quran, ekonomi syariah, dan klinik finansial. Panduan lengkap sesuai dalil Syar\'i.',
    keywords: 'artikel islam, waris islam, zakat, ekonomi syariah, hafalan quran, fiqh waris, klinik finansial',
    brandColorLight: '#4f46e5',
  },
};

const DEFAULT_META: PageMeta = {
  title: 'Aplikasi Ibadah Islam (Waris, Zakat, Hafalan) | NIZAMY',
  description: 'Kalkulator Waris Islam (Faraidh) & Zakat terlengkap. Hitung pembagian harta waris & zakat secara akurat, transparan, sesuai dalil Syar\'i. Gratis & Privasi Terjaga.',

  keywords: 'kalkulator waris islam, kalkulator faraidh, hitung waris, zakat, hafalan quran, audit halal, cek riba, ekonomi syariah, klinik finansial, nizamy, aplikasi islam',
  brandColorLight: '#4f46e5',
};

/** Resolve meta for current path (supports sub-routes like /mushaf?surah=2) */
const resolveMeta = (pathname: string): PageMeta => {
  // Exact match first
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  // Sub-route match (e.g. /mushaf?query or /faraidh/results)
  for (const route of Object.keys(PAGE_META)) {
    if (pathname.startsWith(route)) return PAGE_META[route];
  }
  return DEFAULT_META;
};

export const usePageMetadata = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  const meta = resolveMeta(location.pathname);
  const canonicalUrl = `${SITE_URL}${location.pathname}`;
  const brandColorDark = '#0f172a';
  const themeColor = isDark ? brandColorDark : meta.brandColorLight;

  // Theme color update (imperative, outside Helmet)
  useEffect(() => {
    const el = document.querySelector('meta[name=theme-color]');
    if (el) el.setAttribute('content', isDark ? brandColorDark : meta.brandColorLight);
  }, [location, isDark, meta.brandColorLight]);

  return { meta, canonicalUrl, themeColor };
};

/** Render this inside AppContent to inject per-page SEO tags via Helmet */
export const PageHead = () => {
  const { meta, canonicalUrl } = usePageMetadata();
  const location = useLocation();

  const isHome = location.pathname === '/';
  
  // Generate breadcrumb for subpages
  const breadcrumbItems = [];
  if (!isHome && !location.pathname.startsWith('/blog/')) {
    breadcrumbItems.push({ name: 'Home', url: SITE_URL });
    const pathParts = location.pathname.split('/').filter(Boolean);
    let currentUrl = SITE_URL;
    pathParts.forEach((part, index) => {
      currentUrl += `/${part}`;
      // Capitalize first letter for breadcrumb name
      const name = part.charAt(0).toUpperCase() + part.slice(1);
      breadcrumbItems.push({ name, url: currentUrl });
    });
  }

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta name="keywords" content={meta.keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={canonicalUrl} />

      {/* Twitter */}
      <meta property="twitter:title" content={meta.title} />
      <meta property="twitter:description" content={meta.description} />
      <meta property="twitter:url" content={canonicalUrl} />

      {/* Structured Data */}
      {isHome && (
        <script type="application/ld+json">
          {JSON.stringify(generateSoftwareSchema(meta.title, meta.description, canonicalUrl))}
        </script>
      )}
      {!isHome && breadcrumbItems.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify(generateBreadcrumbSchema(breadcrumbItems))}
        </script>
      )}
      {canonicalUrl.includes('/faraidh') && (
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(FARAIDH_FAQ))}
        </script>
      )}
      {canonicalUrl.includes('/zakat') && (
        <script type="application/ld+json">
          {JSON.stringify(generateFAQSchema(ZAKAT_FAQ))}
        </script>
      )}
    </Helmet>
  );
};
