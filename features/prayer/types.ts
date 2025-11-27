export interface PrayerTimes {
  Fajr: string;
  Sunrise: string; // Syuruq
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
    readable: string;
    hijri: {
      day: string;
      month: { en: string; ar: string };
      year: string;
    };
  };
  meta: {
    timezone: string;
  };
}
