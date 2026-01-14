import { useState, useEffect, useCallback, useRef } from 'react';
import { 
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
    // Navigation controls
    currentDate: Date;
    nextMonth: () => void;
    prevMonth: () => void;
    resetToToday: () => void;
}

// Helper to prevent re-fetching if location changed minimally (approx < 1-2km)
const areCoordsSignificant = (oldCoords: { lat: number; lng: number } | null, newCoords: { lat: number; lng: number }) => {
    if (!oldCoords) return true;
    const diffLat = Math.abs(oldCoords.lat - newCoords.lat);
    const diffLng = Math.abs(oldCoords.lng - newCoords.lng);
    // 0.01 degrees is roughly 1.1km
    return diffLat > 0.01 || diffLng > 0.01;
};

export const usePrayerSchedule = <T extends PrayerData | PrayerData[]>(
    mode: ScheduleMode
): UsePrayerScheduleResult<T> => {
    const { showToast } = useToast();
    const [data, setData] = useState<T | null>(null);
    const [locationName, setLocationName] = useState("Menunggu Lokasi...");
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // GPS Throttle Ref
    const lastGpsUpdateRef = useRef<number>(0);
    
    // Navigation State
    const [currentDate, setCurrentDate] = useState(new Date());

    const refresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const nextMonth = useCallback(() => {
        setCurrentDate(prev => {
            const next = new Date(prev);
            next.setMonth(prev.getMonth() + 1);
            return next;
        });
    }, []);

    const prevMonth = useCallback(() => {
        setCurrentDate(prev => {
            const next = new Date(prev);
            next.setMonth(prev.getMonth() - 1);
            return next;
        });
    }, []);

    const resetToToday = useCallback(() => {
        setCurrentDate(new Date());
    }, []);

    // 1. LOCATION WATCHER EFFECT with THROTTLE
    // Automatically updates coords when GPS becomes available or changes significantly
    useEffect(() => {
        if (!navigator.geolocation) {
            // Fallback if not supported
            setCoords({ lat: -6.1702, lng: 106.8314 }); 
            showToast("GPS tidak didukung browser ini.", "error");
            return;
        }

        const geoId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                // Throttle updates to max once every 5 seconds to prevent jitter
                if (now - lastGpsUpdateRef.current < 5000) {
                    return; 
                }

                const newCoords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                setCoords(prevCoords => {
                    // Only update state if change is significant to trigger data refetch
                    if (areCoordsSignificant(prevCoords, newCoords)) {
                        lastGpsUpdateRef.current = now;
                        return newCoords;
                    }
                    return prevCoords;
                });
            },
            (err) => {
                console.warn("GPS Watch Error:", err);
                setCoords(prev => {
                    // Only set fallback if we strictly have NO coords yet.
                    if (!prev) {
                        return { lat: -6.1702, lng: 106.8314 };
                    }
                    return prev;
                });
            },
            { 
                enableHighAccuracy: false, 
                timeout: 10000, 
                maximumAge: 60000 
            }
        );

        return () => navigator.geolocation.clearWatch(geoId);
    }, []); 

    // 2. DATA FETCHER EFFECT
    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            const today = new Date(); 
            const isViewingCurrentPeriod = 
                currentDate.getMonth() === today.getMonth() && 
                currentDate.getFullYear() === today.getFullYear();

            // Try Cache first (Instant Load)
            let hasCache = false;
            if (mode === 'daily' && isViewingCurrentPeriod) {
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
                const cachedCalendar = getCalendarCache(currentDate.getMonth() + 1, currentDate.getFullYear());
                if (cachedCalendar && cachedCalendar.length > 0) {
                    if (isMounted) {
                        setData(cachedCalendar as T);
                        setLoading(false);
                        hasCache = true;
                        
                        if (locationName === "Menunggu Lokasi..." || locationName === "Gagal memuat") {
                             const dailyCache = getCachedPrayerData();
                             if (dailyCache) setLocationName(dailyCache.city);
                        }
                    }
                }
            }

            if (!hasCache && coords && isMounted) {
                setLoading(true);
            }
            
            if (!coords) return; 

            setError(null);

            try {
                const { lat, lng } = coords;
                const shouldFetchCity = locationName === "Menunggu Lokasi..." || locationName === "Gagal memuat" || locationName === "Lokasi Anda";
                
                const cityPromise = shouldFetchCity ? fetchCityName(lat, lng) : Promise.resolve(locationName);
                
                let dataPromise;
                if (mode === 'daily') {
                    dataPromise = fetchPrayerTimes(lat, lng);
                } else {
                    dataPromise = fetchPrayerCalendar(lat, lng, currentDate.getMonth() + 1, currentDate.getFullYear());
                }

                const [city, apiData] = await Promise.all([cityPromise, dataPromise]);

                if (!isMounted) return;

                if (apiData) {
                    setData(apiData as T);
                    setLocationName(city);

                    if (mode === 'daily') {
                        savePrayerCache(apiData as PrayerData, city);
                    } else if (mode === 'monthly' && Array.isArray(apiData)) {
                        if (isViewingCurrentPeriod) {
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
    }, [coords, mode, refreshTrigger, currentDate]);

    return { 
        data, 
        locationName, 
        coords, 
        loading, 
        error, 
        refresh,
        currentDate,
        nextMonth,
        prevMonth,
        resetToToday
    };
};