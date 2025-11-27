
import { useEffect } from 'react';
// @ts-ignore
import { useLocation } from 'react-router-dom';

export const usePageMetadata = () => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = "NIZAMY";
    let themeColor = "#4f46e5"; // Default Indigo
    const path = location.pathname;
    let title = "";

    if (path.includes('/faraidh')) {
        title = `${baseTitle} | Kalkulator Waris Islam (Faraidh)`;
        themeColor = "#0284c7"; // Sky/Blue
    } else if (path.includes('/zakat')) {
        title = `${baseTitle} | Kalkulator Zakat Online (Fitrah & Maal)`;
        themeColor = "#059669"; // Emerald
    } else if (path.includes('/hafalan')) {
        title = `${baseTitle} | Hafalan Quran Tracker (SRS)`;
        themeColor = "#4338ca"; // Indigo
    } else if (path.includes('/mushaf')) {
        title = `${baseTitle} | Mushaf Digital & Kamus Tajwid`;
        themeColor = "#0d9488"; // Teal
    } else if (path.includes('/hede')) {
        title = `${baseTitle} | H.E.D.E (Audit Halal)`;
        themeColor = "#7e22ce"; // Purple
    } else {
        title = `${baseTitle}: Aplikasi Ibadah Islam (Waris, Zakat, Hafalan)`;
        themeColor = "#4f46e5";
    }

    document.title = title;

    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    }
  }, [location]);
};
