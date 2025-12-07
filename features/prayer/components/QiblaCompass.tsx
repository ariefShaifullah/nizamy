
import React, { useState, useEffect } from 'react';
import { calculateQiblaDirection } from '../logic/prayer.service.ts';
import { FaMobileAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useToast } from '../../../components/ui/Toast.tsx';

interface QiblaCompassProps {
    latitude: number;
    longitude: number;
    hasPermission: boolean;
    onPermissionGranted: () => void;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({ 
    latitude, 
    longitude, 
    hasPermission, 
    onPermissionGranted 
}) => {
    const { showToast } = useToast();
    
    // Bearing statis ke Ka'bah (misal: 295 derajat dari Utara)
    const [qiblaBearing, setQiblaBearing] = useState(0);
    
    // Heading HP saat ini (Bisa minus atau > 360 demi animasi smooth)
    const [compassHeading, setCompassHeading] = useState(0);
    
    const [isSupported, setIsSupported] = useState(true);
    const [needsCalibration, setNeedsCalibration] = useState(false);

    useEffect(() => {
        const bearing = calculateQiblaDirection(latitude, longitude);
        setQiblaBearing(bearing);
    }, [latitude, longitude]);

    useEffect(() => {
        const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (isDesktop) setIsSupported(false);
    }, []);

    // --- MAIN SENSOR LOGIC ---
    const handleOrientation = (event: any) => {
        let heading = 0;
        if (event.absolute && event.alpha !== null) {
            heading = 360 - event.alpha;
        } else if (event.webkitCompassHeading) {
            heading = event.webkitCompassHeading;
        } else if (event.alpha !== null) {
            heading = 360 - event.alpha;
        }

        // Smooth rotation logic (Preserves >360 or <0 for animation continuity)
        setCompassHeading(prev => {
            const diff = heading - prev;
            if (diff > 180) return prev + diff - 360;
            if (diff < -180) return prev + diff + 360;
            return prev + (diff * 0.2); // Smoothing factor
        });

        if (event.webkitCompassAccuracy && event.webkitCompassAccuracy < 0) {
            setNeedsCalibration(true);
        } else {
            setNeedsCalibration(false);
        }
    };

    // Attach listener automatically if permission is already granted
    useEffect(() => {
        if (hasPermission && isSupported) {
            window.addEventListener('deviceorientation', handleOrientation);
            // Try absolute orientation for Android
            window.addEventListener('deviceorientationabsolute', handleOrientation, true);
            
            return () => {
                window.removeEventListener('deviceorientation', handleOrientation);
                window.removeEventListener('deviceorientationabsolute', handleOrientation);
            };
        }
    }, [hasPermission, isSupported]);

    const requestAccess = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const permissionState = await (DeviceOrientationEvent as any).requestPermission();
                if (permissionState === 'granted') {
                    onPermissionGranted();
                } else {
                    showToast('Izin akses sensor ditolak.', 'error');
                }
            } catch (error) {
                console.error(error);
                // Fallback for dev/simulator
                onPermissionGranted(); 
            }
        } else {
            // Android / Non-iOS
            onPermissionGranted();
        }
    };

    // --- LOGIC CORRECTION: NORMALIZE ANGLES ---
    // 1. Normalize Heading to 0-360 for Display & Logic
    const normalizedHeading = (compassHeading % 360 + 360) % 360;

    // 2. Calculate Shortest Angular Difference (0-180)
    // Avoids issue where 359 and 1 have a difference of 358 instead of 2
    let angleDiff = Math.abs(normalizedHeading - qiblaBearing);
    if (angleDiff > 180) angleDiff = 360 - angleDiff;

    const isAligned = angleDiff < 5; // Threshold 5 degrees

    // --- RENDER HELPERS ---
    
    // Fallback UI for Desktop
    if (!isSupported) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 min-h-[300px]">
                <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-4xl text-slate-400 mb-4">
                    <FaMobileAlt />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sensor Tidak Terdeteksi</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                    Fitur ini memerlukan sensor magnetometer (kompas) yang ada di Smartphone.
                </p>
                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    Arah Kiblat: {qiblaBearing.toFixed(1)}°
                </div>
            </div>
        );
    }

    return (
        // BREAKOUT CONTAINER:
        // w-[calc(100%+2rem)] & -ml-4 compensates for parent px-4 padding
        // overflow-hidden cuts off the shadow exactly at screen edge (no scroll)
        // py-24 ensures vertical shadow isn't cut off
        <div className="relative w-[calc(100%+2rem)] -ml-4 md:w-full md:ml-0 md:static overflow-hidden py-24 md:py-12 flex flex-col items-center justify-center">
            
            {/* Background Glow */}
            <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] aspect-square rounded-full blur-[60px] transition-colors duration-1000 pointer-events-none -z-10 ${isAligned ? 'bg-emerald-500/20' : 'bg-indigo-500/10'}`}></div>

            {/* Permission Gate */}
            {!hasPermission ? (
                <div className="text-center z-card p-8 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-700 w-full max-w-sm mx-4">
                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-sm mx-auto mb-4">🧭</div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-2">Aktifkan Kompas</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                        Izinkan aplikasi mengakses sensor gerak HP untuk menentukan arah Kiblat secara akurat.
                    </p>
                    <button 
                        onClick={requestAccess}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
                    >
                        Izinkan Akses
                    </button>
                </div>
            ) : (
                <div className="relative z-card flex flex-col items-center w-full">
                    
                    {/* Status Bar */}
                    <div className={`mb-24 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all duration-500 ${isAligned ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {isAligned ? <span>Tepat Arah Kiblat</span> : <span>Putar HP Anda</span>}
                    </div>

                    {/* COMPASS COMPONENT */}
                    {/* Width 85vw ensures it fills screen but leaves tiny breathing room, Aspect Square keeps it round */}
                    <div className="relative w-[85vw] max-w-[360px] aspect-square mx-auto">
                        
                        {/* 1. STATIC TARGET LINE (HP Heading) */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-16 z-popover flex flex-col items-center">
                            <div className="w-1.5 h-4 bg-red-500 rounded-full shadow-sm"></div>
                            <div className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wider bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">Depan HP</div>
                        </div>

                        {/* 2. ROTATING DIAL (The Compass Plate) */}
                        <div 
                            className="absolute inset-0 rounded-full border-[6px] border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl transition-transform ease-linear will-change-transform"
                            style={{ 
                                transform: `rotate(${-compassHeading}deg)`,
                                transitionDuration: '100ms'
                            }}
                        >
                            {/* Cardinal Directions (Fixed on the plate) */}
                            {['N', 'E', 'S', 'W'].map((dir, i) => (
                                <div 
                                    key={dir}
                                    className="absolute text-base font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center"
                                    style={{
                                        top: i === 0 ? '12px' : i === 2 ? 'auto' : '50%',
                                        bottom: i === 2 ? '15px' : 'auto',
                                        left: i === 3 ? '15px' : i === 1 ? 'auto' : '50%',
                                        right: i === 1 ? '15px' : 'auto',
                                        transform: i === 0 || i === 2 ? 'translateX(-50%)' : 'translateY(-50%)'
                                    }}
                                >
                                    {dir === 'N' ? (
                                        <div className="relative">
                                            {/* Glow Effect behind logo - Only in Dark Mode */}
                                            <div className="absolute inset-0 hidden dark:block bg-indigo-500/40 blur-md rounded-full scale-125"></div>
                                            <img 
                                                src="/images/logo_nizamy.png?v=6" 
                                                alt="North" 
                                                className="w-8 h-8 object-contain dark:drop-shadow-[0_0_8px_rgba(99,102,241,0.8)] relative z-10"
                                            />
                                        </div>
                                    ) : (
                                        <span>{dir}</span>
                                    )}
                                </div>
                            ))}

                            {/* Ticks (Garis-garis derajat) */}
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div 
                                    key={i}
                                    className="absolute w-full h-full left-0 top-0 pointer-events-none"
                                    style={{ transform: `rotate(${i * 30}deg)` }}
                                >
                                    <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-600 mx-auto mt-1"></div>
                                </div>
                            ))}
                            
                            {/* 3. QIBLA NEEDLE (Attached to the plate) */}
                            <div 
                                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                style={{ transform: `rotate(${qiblaBearing}deg)` }}
                            >
                                <div className="w-2 h-1/2 bg-linear-to-t from-emerald-500 to-emerald-400 mx-auto rounded-t-full opacity-90 relative shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                    {/* Counter-Rotated Icon */}
                                    <div 
                                        className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full border-[3px] border-emerald-500 flex items-center justify-center shadow-lg z-dropdown"
                                        style={{ 
                                            transform: `rotate(${compassHeading - qiblaBearing}deg)`,
                                            transition: 'transform 100ms linear'
                                        }}
                                    >
                                        <span className="text-2xl">🕋</span>
                                    </div>
                                    {/* Pivot base - Centered vertically over the rotation axis */}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Center Pivot */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-slate-800 dark:bg-white rounded-full z-sticky border-2 border-white dark:border-slate-900 shadow-sm"></div>
                    </div>

                    {/* Numeric Info */}
                    <div className="mt-12 text-center">
                        <div className="inline-flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <div>
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Arah Anda</p>
                                <p className="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">{Math.round(normalizedHeading)}°</p>
                            </div>
                            <div className="w-px h-8 bg-slate-200 dark:bg-slate-600"></div>
                            <div>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Kiblat</p>
                                <p className="text-xl font-mono font-bold text-emerald-600 dark:text-emerald-400">{Math.round(qiblaBearing)}°</p>
                            </div>
                        </div>
                    </div>

                    {needsCalibration && (
                        <div className="mt-4 flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold animate-pulse">
                            <span className="icon-wrapper w-3 h-3"><FaExclamationTriangle /></span> Akurasi rendah. Buat gerakan angka 8.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
