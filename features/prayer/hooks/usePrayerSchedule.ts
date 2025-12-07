import { useState, useEffect, useCallback } from 'react';
import { 
    getCoordinates, 
    fetchCityName, 
    fetchPrayerTimes, 
    fetchPrayerCalendar, 
    getCachedPrayerData, 
    getCalendarCache,
    savePrayerCache 
} from '../logic/prayer.service.ts';
import type { PrayerData } from '../../../types.ts';
import { useToast } from '../../../components/ui/Toast.tsx';

type ScheduleMode = 'daily' | 'monthly';

interface UsePrayerScheduleResult<T> {
    data: T | null;
    locationName: string;
    coords: { lat: number; lng: number } | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
}

export const usePrayerSchedule = <T extends PrayerData | PrayerData[]>(
    mode: ScheduleMode
): UsePrayerScheduleResult<T> => {
    const { showToast } = useToast();
    const [data, setData] = useState<T | null>(null);
    const [locationName, setLocationName] = useState("Memuat lokasi...");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            // 1. OPTIMISTIC LOADING (CACHE FIRST STRATEGY)
            // Ini memastikan UI tampil instan tanpa menunggu GPS
            
            const today = new Date();
            let hasCache = false;
            
            if (mode === 'daily') {
                const cached = getCachedPrayerData();
                if (cached) {
                    if (isMounted) {
                        setData(cached.data as T);
                        setLocationName(cached.city);
                        setLoading(false);
                        hasCache = true;
                    }
                }
            } else if (mode === 'monthly') {
                // Check Monthly Cache
                const cachedCalendar = getCalendarCache(today.getMonth() + 1, today.getFullYear());
                if (cachedCalendar && cachedCalendar.length > 0) {
                    if (isMounted) {
                        setData(cachedCalendar as T);
                        setLoading(false);
                        hasCache = true;
                        
                        // Try to get cached city name from daily cache to avoid "Memuat lokasi..."
                        const dailyCache = getCachedPrayerData();
                        if (dailyCache) setLocationName(dailyCache.city);
                    }
                }
            }

            // Jika cache tidak ditemukan, set loading true (karena kita butuh GPS)
            if (!hasCache && isMounted) {
                setLoading(true);
            }
            
            setError(null);

            // 2. NETWORK REFRESH (Background or Foreground)
            try {
                // Get Coordinates (Might take time)
                let lat, lng;
                try {
                    const pos = await getCoordinates();
                    lat = pos.latitude;
                    lng = pos.longitude;
                } catch (gpsError) {
                    // Fallback to Jakarta if GPS fails
                    console.warn("GPS failed, using fallback (Jakarta)", gpsError);
                    if (!hasCache) showToast("GPS tidak aktif. Menggunakan lokasi Jakarta.", "info");
                    lat = -6.1702;
                    lng = 106.8314;
                }

                if (!isMounted) return;
                setCoords({ lat, lng });

                // 3. Parallel Fetch (City Name & Data)
                const cityPromise = fetchCityName(lat, lng);
                
                let dataPromise;
                
                if (mode === 'daily') {
                    dataPromise = fetchPrayerTimes(lat, lng);
                } else {
                    dataPromise = fetchPrayerCalendar(lat, lng, today.getMonth() + 1, today.getFullYear());
                }

                const [city, apiData] = await Promise.all([cityPromise, dataPromise]);

                if (!isMounted) return;

                if (apiData) {
                    // Update state with fresh data
                    setData(apiData as T);
                    setLocationName(city);

                    // 4. SMART CACHE SYNC
                    if (mode === 'daily') {
                        savePrayerCache(apiData as PrayerData, city);
                    } else if (mode === 'monthly' && Array.isArray(apiData)) {
                        // If fetching monthly, extract TODAY's data and update daily cache
                        // This ensures Widget is updated when App is opened
                        const todayStr = today.toISOString().split('T')[0];
                        const todayData = (apiData as PrayerData[]).find(d => {
                            const dDate = `${d.date.gregorian.year}-${d.date.gregorian.month.number.toString().padStart(2,'0')}-${d.date.gregorian.day}`;
                            return dDate === todayStr;
                        });

                        if (todayData) {
                            savePrayerCache(todayData, city);
                            window.dispatchEvent(new CustomEvent('nizamy-refresh-prayer'));
                        }
                    }
                } else {
                    if (!hasCache) setError("Gagal mengambil data jadwal.");
                }

            } catch (err) {
                if (isMounted) {
                    console.error(err);
                    if (!hasCache) {
                        setError("Terjadi kesalahan koneksi.");
                        setLocationName("Gagal memuat");
                    }
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();

        return () => { isMounted = false; };
    }, [mode, refreshTrigger, showToast]);

    return { data, locationName, coords, loading, error, refresh };
};