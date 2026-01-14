export interface PrayerTimes {
  Fajr: string;
  Sunrise: string; // Syuruq
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  [key: string]: string;
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
}

export interface GregorianDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
}

export interface PrayerData {
  timings: PrayerTimes;
  date: {
      readable: string;
      timestamp: string;
      hijri: HijriDate;
      gregorian: GregorianDate;
  };
  meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
          name: string;
          id: number;
      };
  }
}

export type FastingType = 'senin-kamis' | 'ayyamul-bidh' | 'none';