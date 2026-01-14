import { useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext.tsx';

export const usePageMetadata = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  useEffect(() => {
    const baseTitle = "NIZAMY";
    const path = location.pathname;
    let title = "";
    
    // Define brand colors based on feature
    let brandColorLight = "#4f46e5"; // Default Indigo
    const brandColorDark = "#0f172a"; // Slate 900 (Global Dark Background)

    if (path.includes('/faraidh')) {
        title = `${baseTitle} | Kalkulator Waris Islam (Faraidh)`;
        brandColorLight = "#0284c7"; // Sky/Blue
    } else if (path.includes('/zakat')) {
        title = `${baseTitle} | Kalkulator Zakat Online (Fitrah & Maal)`;
        brandColorLight = "#059669"; // Emerald
    } else if (path.includes('/hafalan')) {
        title = `${baseTitle} | Hafalan Quran Tracker (SRS)`;
        brandColorLight = "#4338ca"; // Indigo
    } else if (path.includes('/mushaf')) {
        title = `${baseTitle} | Mushaf Digital & Kamus Tajwid`;
        brandColorLight = "#0d9488"; // Teal
    } else if (path.includes('/hede')) {
        title = `${baseTitle} | HEDE (Audit Halal)`;
        brandColorLight = "#7e22ce"; // Purple
    } else if (path.includes('/amal')) {
        title = `${baseTitle} | Amal Yaumi (Daily Deeds)`;
        brandColorLight = "#10b981"; // Emerald/Green
    } else if (path.includes('/sholat')) {
        title = `${baseTitle} | Jadwal Sholat & Kiblat`;
        brandColorLight = "#4338ca"; // Indigo
    } else {
        title = `${baseTitle}: Aplikasi Ibadah Islam (Waris, Zakat, Hafalan)`;
    }

    document.title = title;

    // Apply Theme Color to Meta Tag
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      // If Dark Mode, use the global dark background color to blend in
      // If Light Mode, use the specific feature brand color
      metaThemeColor.setAttribute("content", isDark ? brandColorDark : brandColorLight);
    }
  }, [location, isDark]);
};