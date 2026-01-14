
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

// Re-export from useSurahData for backward compatibility
// Data is now loaded from /public/data/surahs.json
// Use useSurahData() hook in components for reactive updates
export { getSurahData as SURAH_DATA_GETTER, getArabicNames as ARABIC_NAMES_GETTER } from './hooks/useSurahData.ts';

// For files that need synchronous access (these are loaded on app init)
import { getSurahData, getArabicNames } from './hooks/useSurahData.ts';

// Lazy getters that return current cached value
// These work after SurahDataProvider has initialized
export const SURAH_DATA = new Proxy([] as any[], {
  get: (_, prop) => {
    const data = getSurahData();
    return (data as any)[prop];
  }
});

export const ARABIC_SURAH_NAMES = new Proxy({} as Record<string, string>, {
  get: (_, prop) => {
    const data = getArabicNames();
    return (data as any)[prop];
  }
});
