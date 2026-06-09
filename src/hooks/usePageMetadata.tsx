import { useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext.tsx';

const SITE_URL = 'https://nizamy.com';

interface PageMeta {
  title: string;
  description: string;
  keywords: string;
  brandColorLight: string;
}

const PAGE_META: Record<string, PageMeta> = {
  '/faraidh': {
    title: 'NIZAMY | Kalkulator Waris Islam (Faraidh)',
    description: 'Kalkulator Waris Islam terlengkap. Hitung pembagian harta waris sesuai faraidh — akurat, transparan, dalil Syar\'i. Gratis & privasi terjaga.',
    keywords: 'kalkulator waris islam, kalkulator faraidh, hitung waris, pembagian waris, faraidh calculator, waris calculator, harta waris, ilmu waris',
    brandColorLight: '#0284c7',
  },
  '/zakat': {
    title: 'NIZAMY | Kalkulator Zakat Online (Fitrah & Maal)',
    description: 'Kalkulator Zakat terlengkap — zakat fitrah, maal, penghasilan, emas, pertanian. Hitung sesuai syariat Islam secara akurat.',
    keywords: 'kalkulator zakat, hitung zakat, zakat fitrah, zakat maal, zakat penghasilan, zakat emas, kalkulator zakat online',
    brandColorLight: '#059669',
  },
  '/hafalan': {
    title: 'NIZAMY | Hafalan Quran Tracker (SRS)',
    description: 'Tracker hafalan Al-Quran dengan metode Spaced Repetition (SRS). Jadwal review otomatis agar hafalan tetap kuat.',
    keywords: 'hafalan quran, tracker hafalan, SRS quran, spaced repetition quran, menghafal alquran, hafalan tracker',
    brandColorLight: '#4338ca',
  },
  '/mushaf': {
    title: 'NIZAMY | Mushaf Digital & Kamus Tajwid',
    description: 'Mushaf digital Al-Quran dengan audio, terjemahan, dan kamus tajwid. Baca, dengar, dan pelajari tajwid dalam satu aplikasi.',
    keywords: 'mushaf digital, alquran online, tajwid, baca quran, dengar quran, quran digital, mushaf online',
    brandColorLight: '#0d9488',
  },
  '/hede': {
    title: 'NIZAMY | HEDE — Audit Halal & Cek Riba',
    description: 'HEDE: audit halal dan cek riba pada produk keuangan. Analisis kesesuaian syariah pada investasi, asuransi, dan pinjaman Anda.',
    keywords: 'audit halal, cek riba, halal check, riba checker, ekonomi syariah, keuangan syariah, klinik finansial islam',
    brandColorLight: '#7e22ce',
  },
  '/amal': {
    title: 'NIZAMY | Amal Yaumi — Tracker Amal Harian',
    description: 'Tracker amal yaumi (harian Islam). Catat sholat, dzikir, puasa Sunnah, dan amal kebaikan lainnya setiap hari.',
    keywords: 'amal yaumi, tracker amal, amal harian islam, catatan amal, dzikir tracker, checklist ibadah',
    brandColorLight: '#10b981',
  },
  '/sholat': {
    title: 'NIZAMY | Jadwal Sholat & Kiblat',
    description: 'Jadwal sholat akurat berdasarkan lokasi Anda + penunjuk arah kiblat. Notifikasi adzan & waktu sholat tepat waktu.',
    keywords: 'jadwal sholat, arah kiblat, waktu sholat, adzan, jadwal shalat, prayer times, qibla finder',
    brandColorLight: '#4338ca',
  },
  '/scanner': {
    title: 'NIZAMY | Halal Scanner',
    description: 'Scan barcode produk untuk mengecek status halal. Verifikasi sertifikasi halal MUI secara instan.',
    keywords: 'halal scanner, scan barcode halal, cek halal, sertifikasi halal MUI, barcode halal',
    brandColorLight: '#4f46e5',
  },
};

const DEFAULT_META: PageMeta = {
  title: 'NIZAMY: Aplikasi Ibadah Islam (Waris, Zakat, Hafalan, Klinik Finansial)',
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
    </Helmet>
  );
};
