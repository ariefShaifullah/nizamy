import React, { useEffect, useState } from "react";
import type { PrayerData } from "../types.ts";
import {
  getCoordinates,
  fetchPrayerTimes,
  getNextPrayer,
  formatTimeLeft,
  savePrayerCache,
  getCachedPrayerData,
} from "../services/prayer.service.ts";
import { useToast } from "./ui/Toast.tsx";

export const PrayerWidget: React.FC = () => {
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{
    name: string;
    timeLeft: string;
  } | null>(null);
  const [locationName, setLocationName] = useState("Jakarta (Default)");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Initial Load
  useEffect(() => {
    const initData = async () => {
      // 1. Try Cache first
      const cached = getCachedPrayerData();
      if (cached) {
        setPrayerData(cached.data);
        setLocationName(cached.city);
        setLoading(false);
      }

      // 2. Refresh from API if cache invalid or to update location
      try {
        // Check cached location vs real location? For now, just fetch fresh if possible or user requests
        // Simple logic: Always try to get fresh coords if cache is empty or old
        if (!cached) {
          const coords = await getCoordinates();
          const data = await fetchPrayerTimes(
            coords.latitude,
            coords.longitude
          );
          if (data) {
            setPrayerData(data);
            // Simple city name approximation or just generic
            const city = "Lokasi Anda";
            setLocationName(city);
            savePrayerCache(data, city);
          }
        }
      } catch (error) {
        console.warn("Location access denied or error", error);
        if (!cached) {
          // Fallback to Jakarta
          const data = await fetchPrayerTimes(-6.1702, 106.8314);
          if (data) {
            setPrayerData(data);
            setLocationName("Jakarta Pusat");
            savePrayerCache(data, "Jakarta Pusat");
          }
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Countdown Ticker
  useEffect(() => {
    if (!prayerData) return;

    const timer = setInterval(() => {
      const next = getNextPrayer(prayerData.timings);
      // Calculate specific time difference dynamically
      // We need precise parsing logic here inside the tick for seconds accuracy

      // Re-calculate target date object
      const now = new Date();
      const [h, m] = next.time.split(":").map(Number);
      const target = new Date();
      target.setHours(h, m, 0, 0);

      if (next.isTomorrow) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();

      if (diff <= 0) {
        // Should trigger re-evaluation of next prayer
        setNextPrayer({ name: "Adzan...", timeLeft: "00:00:00" });
      } else {
        setNextPrayer({
          name: next.name,
          timeLeft: formatTimeLeft(diff),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayerData]);

  const PRAYER_LIST = [
    { key: "Fajr", label: "Subuh", icon: "fajr" },
    { key: "Dhuhr", label: "Dzuhur", icon: "sun" },
    { key: "Asr", label: "Ashar", icon: "cloud-sun" },
    { key: "Maghrib", label: "Maghrib", icon: "sunset" },
    { key: "Isha", label: "Isya", icon: "moon" },
  ];

  const getGradient = () => {
    if (!nextPrayer) return "from-slate-700 via-slate-800 to-slate-900";

    // Logic: Gradient represents the CURRENT SKY condition leading up to the NEXT prayer.
    switch (nextPrayer.name) {
      // Menuju Subuh (Saat ini Malam/Isya): Deep Midnight Blue (Misterius & Tenang)
      case "Subuh":
        return "from-slate-900 via-indigo-950 to-slate-900";

      // Menuju Dzuhur (Saat ini Pagi/Subuh): Fresh Morning Sky (Energi & Produktivitas)
      case "Dzuhur":
        return "from-sky-400 via-blue-400 to-indigo-400";

      // Menuju Ashar (Saat ini Siang/Dzuhur): Bright Azure (Cerah)
      case "Ashar":
        return "from-blue-500 via-cyan-500 to-sky-500";

      // Menuju Maghrib (Saat ini Sore/Ashar): Golden Hour (Gradasi Emas ke Oranye)
      case "Maghrib":
        return "from-amber-400 via-orange-500 to-red-500";

      // Menuju Isya (Saat ini Senja/Maghrib): Twilight (Pink, Ungu, Biru Tua)
      case "Isya":
        return "from-pink-600 via-purple-800 to-indigo-900";

      default:
        return "from-emerald-600 via-teal-500 to-cyan-600";
    }
  };

  if (loading)
    return (
      <div className="w-full h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl animate-pulse mb-8"></div>
    );

  if (!prayerData) return null;

  return (
    <div
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl bg-gradient-to-br ${getGradient()} text-white mb-8 transition-all duration-1000 animate-fade-in ring-1 ring-white/10`}
    >
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
          <circle cx="80" cy="20" r="30" fill="url(#grad1)" opacity="0.3" />
          <defs>
            <radialGradient
              id="grad1"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop
                offset="0%"
                style={{ stopColor: "white", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "white", stopOpacity: 0 }}
              />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        {/* Top Row: Location & Date */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-white/90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs font-bold truncate max-w-[150px] text-white drop-shadow-md">
              {locationName}
            </span>
          </div>
          <div className="text-right text-white/90">
            <p className="text-sm font-bold font-arabic drop-shadow-md">
              {prayerData.date.hijri.day} {prayerData.date.hijri.month.en}{" "}
              {prayerData.date.hijri.year}
            </p>
            <p className="text-[10px] uppercase tracking-wider font-medium opacity-80">
              {prayerData.date.readable}
            </p>
          </div>
        </div>

        {/* Main Countdown */}
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/80 mb-2 drop-shadow-sm">
            Menuju {nextPrayer?.name}
          </p>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight font-mono tabular-nums drop-shadow-lg text-white">
            {nextPrayer?.timeLeft || "--:--:--"}
          </h2>
        </div>

        {/* Prayer Times List */}
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {PRAYER_LIST.map((p) => {
            const time =
              prayerData.timings[p.key as keyof typeof prayerData.timings];
            const isActive = nextPrayer?.name === p.label;

            return (
              <div
                key={p.key}
                className={`flex flex-col items-center p-2 md:p-3 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-white/20 backdrop-blur-lg shadow-lg scale-110 border border-white/30"
                    : "hover:bg-white/10 border border-transparent"
                }`}
              >
                <span
                  className={`text-[10px] font-bold uppercase mb-1 ${
                    isActive ? "text-white" : "text-white/60"
                  }`}
                >
                  {p.label}
                </span>
                <span
                  className={`text-xs md:text-sm font-bold ${
                    isActive ? "text-white" : "text-white/90"
                  }`}
                >
                  {time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
