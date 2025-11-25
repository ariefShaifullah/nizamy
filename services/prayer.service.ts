
import type { PrayerData, PrayerTimes } from "../types.ts";

const PRAYER_CACHE_KEY = 'nizamy_prayer_cache';
const LOCATION_CACHE_KEY = 'nizamy_user_location';

interface CachedPrayerData {
    data: PrayerData;
    date: string; // YYYY-MM-DD
    city: string;
}

// Default location: Istiqlal Mosque, Jakarta
const DEFAULT_COORDS = {
    latitude: -6.1702,
    longitude: 106.8314,
    city: "Jakarta Pusat"
};

export const getCoordinates = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            { timeout: 10000, maximumAge: 60000 } // Wait max 10s, allow cached pos
        );
    });
};

// Reverse Geocoding using BigDataCloud (Free, Client-side)
export const fetchCityName = async (lat: number, lng: number): Promise<string> => {
    try {
        const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
        );
        
        if (!response.ok) return "Lokasi Anda";

        const data = await response.json();
        
        // Prioritize Locality (Kecamatan/Kota) -> City -> PrincipalSubdivision (Provinsi)
        // Data structure typically has: locality, city, principalSubdivision
        return data.locality || data.city || data.principalSubdivision || "Lokasi Terdeteksi";
    } catch (error) {
        console.error("Reverse geocoding failed:", error);
        return "Lokasi Anda";
    }
};

export const fetchPrayerTimes = async (lat: number, lng: number): Promise<PrayerData | null> => {
    try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        
        // METHOD 20: Kemenag Indonesia
        // https://api.aladhan.com/v1/timings/DD-MM-YYYY?latitude=...&longitude=...&method=20
        const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=20`;
        
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.code === 200 && json.data) {
            return json.data as PrayerData;
        }
        return null;
    } catch (error) {
        console.error("Error fetching prayer times:", error);
        return null;
    }
};

export const getCachedPrayerData = (): CachedPrayerData | null => {
    const cached = localStorage.getItem(PRAYER_CACHE_KEY);
    if (!cached) return null;
    
    try {
        const parsed = JSON.parse(cached) as CachedPrayerData;
        const today = new Date().toISOString().split('T')[0];
        
        // Return only if date matches today
        if (parsed.date === today) {
            return parsed;
        }
    } catch (e) {
        return null;
    }
    return null;
};

export const savePrayerCache = (data: PrayerData, city: string) => {
    const today = new Date().toISOString().split('T')[0];
    const cache: CachedPrayerData = {
        data,
        date: today,
        city
    };
    localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(cache));
};

// --- UTILS FOR COUNTDOWN ---

export const getNextPrayer = (timings: PrayerTimes): { name: string; time: string; diffMs: number, isTomorrow: boolean } => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayerNames = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    // Map readable names
    const displayNames: Record<string, string> = {
        'Fajr': 'Subuh',
        'Dhuhr': 'Dzuhur',
        'Asr': 'Ashar',
        'Maghrib': 'Maghrib',
        'Isha': 'Isya'
    };

    let nextPrayerName = '';
    let nextPrayerTimeStr = '';
    let minDiff = Infinity;
    let foundToday = false;

    // Check today's prayers
    for (const p of prayerNames) {
        const timeStr = timings[p];
        if (!timeStr) continue;
        
        const [h, m] = timeStr.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        
        if (prayerMinutes > currentMinutes) {
            nextPrayerName = p;
            nextPrayerTimeStr = timeStr;
            minDiff = prayerMinutes - currentMinutes;
            foundToday = true;
            break; // Found the earliest next prayer
        }
    }

    // If not found today, it must be Fajr tomorrow
    if (!foundToday) {
        nextPrayerName = 'Fajr';
        nextPrayerTimeStr = timings['Fajr'];
        const [h, m] = nextPrayerTimeStr.split(':').map(Number);
        const prayerMinutes = h * 60 + m;
        // Minutes until midnight + minutes from midnight to Fajr
        const minutesUntilMidnight = (24 * 60) - currentMinutes;
        minDiff = minutesUntilMidnight + prayerMinutes;
    }

    return {
        name: displayNames[nextPrayerName] || nextPrayerName,
        time: nextPrayerTimeStr,
        diffMs: minDiff * 60 * 1000 - (now.getSeconds() * 1000), // Rough estimate including seconds
        isTomorrow: !foundToday
    };
};

export const formatTimeLeft = (ms: number): string => {
    if (ms <= 0) return "00:00:00";
    
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
};
