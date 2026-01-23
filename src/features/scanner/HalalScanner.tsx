import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import Webcam from 'react-webcam';
import { analyzeBatch } from './logic/scanner.service.ts';
import { ScanResultCard } from './components/ScanResultCard.tsx';
import type { ScanResult } from '../../types.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useIndexedDB } from '../../hooks/useIndexedDB.ts';
import { useConfirm } from '../../components/ui/ConfirmContext.tsx';
import {
    FaCamera, FaImage, FaArrowLeft,
    FaHistory, FaSyncAlt, FaTimes, FaShieldAlt,
    FaBolt, FaTrash, FaCheck, FaSpinner, FaSearch
} from 'react-icons/fa';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

export const HalalScanner: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State Management
    const [isScanning, setIsScanning] = useState(false);
    const [isProcessingFile, setIsProcessingFile] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [history, setHistory] = useIndexedDB<ScanResult[]>('nizamy_scan_history', []);
    const [cameraReady, setCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
    const [showHistory, setShowHistory] = useState(false);

    // Batch Mode State
    const [capturedImages, setCapturedImages] = useState<string[]>([]);
    const MAX_BATCH_SIZE = 4;

    // Hardware Features State
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [canTorch, setCanTorch] = useState(false);
    const [focusPoint, setFocusPoint] = useState<{ x: number, y: number } | null>(null);

    const videoConstraints = useMemo(() => ({
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 9 / 16, // Portrait mobile standard
    }), [facingMode]);

    useEffect(() => {
        if (cameraReady && webcamRef.current) {
            const video = webcamRef.current.video;
            if (video && video.srcObject) {
                const stream = video.srcObject as MediaStream;
                const track = stream.getVideoTracks()[0];
                const capabilities = (track as any).getCapabilities?.() || {};
                setCanTorch(!!capabilities.torch);
            }
        }
    }, [cameraReady, facingMode]);

    const toggleTorch = async () => {
        if (!webcamRef.current) return;
        const video = webcamRef.current.video;
        if (video && video.srcObject) {
            const track = (video.srcObject as MediaStream).getVideoTracks()[0];
            try {
                await (track as any).applyConstraints({ advanced: [{ torch: !isTorchOn }] });
                setIsTorchOn(!isTorchOn);
                if (navigator.vibrate) navigator.vibrate(20);
            } catch (err) {
                showToast("Senter tidak tersedia", "error");
            }
        }
    };

    const handleTapToFocus = async (e: React.MouseEvent | React.TouchEvent) => {
        if (!webcamRef.current || !cameraReady || isScanning || result) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        setFocusPoint({ x: clientX, y: clientY });
        setTimeout(() => setFocusPoint(null), 800);
        if (navigator.vibrate) navigator.vibrate(20);
    };

    const handleCapture = useCallback(() => {
        if (!webcamRef.current || capturedImages.length >= MAX_BATCH_SIZE) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            if (navigator.vibrate) navigator.vibrate(50);
            setCapturedImages(prev => [...prev, imageSrc]);
            // showToast(`Foto ${capturedImages.length + 1} ditambahkan`, "success"); // Removed to reduce clutter
        }
    }, [webcamRef, capturedImages.length]);

    const handleStartAnalysis = async () => {
        if (capturedImages.length === 0) return;
        setIsScanning(true);
        if (isTorchOn) toggleTorch();

        try {
            const data = await analyzeBatch(capturedImages);
            setResult(data);
            setHistory(prev => [data, ...prev].slice(0, 20));
            setCapturedImages([]);
        } catch (error: any) {
            showToast(error.message, "error");
        } finally {
            setIsScanning(false);
        }
    };

    const removeCapturedImage = (index: number) => {
        setCapturedImages(prev => prev.filter((_, i) => i !== index));
        if (navigator.vibrate) navigator.vibrate(10);
    };

    const toggleFacingMode = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
        setCameraReady(false);
        setIsTorchOn(false);
    };

    const handleClearHistory = async () => {
        const isConfirmed = await confirm({
            title: 'Hapus Riwayat?',
            message: 'Semua riwayat pindaian akan dihapus permanen.',
            confirmText: 'Hapus Semua',
            variant: 'danger'
        });

        if (isConfirmed) {
            setHistory([]);
            showToast("Riwayat dihapus", "info");
        }
    };

    return (
        <div className="fixed inset-0 z-overlay bg-black text-white flex flex-col overflow-hidden font-sans select-none touch-manipulation">
            {/* --- TOP BAR (Float) --- */}
            <div className="absolute top-0 left-0 right-0 z-header flex justify-between items-center px-4 pt-[calc(env(safe-area-inset-top)+12px)] pb-4 bg-linear-to-b from-black/60 to-transparent pointer-events-none">
                <button
                    onClick={() => result ? setResult(null) : navigate('/')}
                    className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all pointer-events-auto"
                >
                    <span className="text-lg"><FaArrowLeft /></span>
                </button>

                <div className="flex bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 items-center gap-2 pointer-events-auto">
                    <span className="text-emerald-400 text-sm"><FaShieldAlt /></span>
                    <span className="text-[10px] font-black uppercase tracking-widest">HALAL SCANNER</span>
                </div>

                <button
                    onClick={() => setShowHistory(true)}
                    className="w-11 h-11 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/10 active:scale-95 transition-all pointer-events-auto"
                >
                    <span className="text-lg"><FaHistory /></span>
                </button>
            </div>

            {/* --- VIEWFINDER --- */}
            <div
                className="flex-1 relative flex flex-col bg-slate-900 overflow-hidden"
                onClick={handleTapToFocus}
                onTouchStart={handleTapToFocus}
            >
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={() => showToast("Gagal mengakses kamera", "error")}
                    screenshotQuality={0.9}
                    mirrored={facingMode === "user"}
                    disablePictureInPicture={true}
                    forceScreenshotSourceSize={false}
                    className="absolute inset-0 w-full h-full object-cover"
                    imageSmoothing={true}
                />

                {/* Focus Ring Animation */}
                {focusPoint && (
                    <div
                        className="absolute w-16 h-16 border-2 border-yellow-400/80 rounded-full pointer-events-none scanner-focus-ring z-raised -ml-8 -mt-8"
                        style={{ top: focusPoint.y, left: focusPoint.x }}
                    />
                )}

                {/* Initial Guide */}
                {cameraReady && !isScanning && !isProcessingFile && capturedImages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-64 h-64 border-2 border-white/20 rounded-4xl relative">
                            {/* Corner Markers */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white/60 rounded-tl-2xl -mt-1 -ml-1"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white/60 rounded-tr-2xl -mt-1 -mr-1"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white/60 rounded-bl-2xl -mb-1 -ml-1"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white/60 rounded-br-2xl -mb-1 -mr-1"></div>

                            <div className="absolute -bottom-16 left-0 right-0 text-center">
                                <p className="text-xs font-medium text-white/90 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md inline-block">
                                    Foto komposisi & logo
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Torch Button (Floating Right) */}
                {cameraReady && canTorch && !result && !isScanning && (
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleTorch(); }}
                        className={`absolute right-4 top-1/3 w-12 h-12 rounded-full flex items-center justify-center transition-all z-dropdown backdrop-blur-md border ${isTorchOn
                                ? 'bg-yellow-400 text-black border-yellow-400 shadow-lg shadow-yellow-400/20'
                                : 'bg-black/30 text-white border-white/20'
                            }`}
                    >
                        <FaBolt />
                    </button>
                )}

                {/* Processing Overlay */}
                {(isScanning || isProcessingFile) && (
                    <div className="absolute inset-0 z-notification bg-slate-900/80 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-fade-in text-center">
                        <div className="relative w-20 h-20 mb-6">
                            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                {isProcessingFile ? <span className="text-slate-400"><FaImage /></span> : "🤖"}
                            </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {isProcessingFile ? "Memproses Gambar" : "Analisis AI Berjalan"}
                        </h3>
                        <p className="text-slate-400 text-xs font-medium max-w-xs leading-relaxed">
                            {isProcessingFile ? "Sedang membaca file..." : "AI sedang membaca komposisi produk..."}
                        </p>
                    </div>
                )}
            </div>

            {/* --- RESULT SHEET (Overlay) --- */}
            {result && (
                <div className="absolute inset-0 z-modal bg-slate-50 dark:bg-slate-950 flex flex-col animate-fade-in-up">
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-[calc(env(safe-area-inset-top)+60px)] pb-10 px-4">
                        <ScanResultCard result={result} onReset={() => setResult(null)} />
                    </div>
                </div>
            )}

            {/* --- BOTTOM CONTROLS --- */}
            {!result && !isScanning && !isProcessingFile && (
                <div className="relative z-navigation bg-linear-to-t from-black via-black/90 to-transparent pt-12 pb-[calc(2rem+env(safe-area-inset-bottom))] px-6">

                    {/* Thumbnail Tray */}
                    {capturedImages.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-6 hide-scrollbar items-end h-24 mb-2">
                            {capturedImages.map((img, idx) => (
                                <div key={idx} className="relative shrink-0 w-16 h-20 rounded-lg overflow-hidden border border-white/30 shadow-lg scanner-thumbnail-enter group">
                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeCapturedImage(idx); }}
                                        className="absolute top-0.5 right-0.5 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm z-10 active:scale-90"
                                    >
                                        <FaTimes />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] font-bold text-center py-0.5">
                                        #{idx + 1}
                                    </div>
                                </div>
                            ))}
                            {capturedImages.length < MAX_BATCH_SIZE && (
                                <div className="w-16 h-20 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 gap-1 shrink-0 bg-white/5">
                                    <span className="text-xs"><FaCamera /></span>
                                    <span className="text-[8px] font-bold uppercase">+ Foto</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Main Action Bar */}
                    <div className="flex items-center justify-around">
                        {/* Gallery Button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all hover:bg-white/20"
                        >
                            <FaImage />
                        </button>

                        {/* Shutter / Analyze Button */}
                        <div className="relative">
                            {capturedImages.length > 0 ? (
                                <button
                                    onClick={handleStartAnalysis}
                                    className="h-20 px-8 bg-emerald-500 rounded-4xl flex items-center gap-3 text-white shadow-lg shadow-emerald-500/30 active:scale-95 transition-all animate-pulse"
                                >
                                    <span className="text-2xl"><FaSearch /></span>
                                    <div className="text-left">
                                        <span className="block text-lg font-black leading-none">ANALISA</span>
                                        <span className="text-[10px] font-medium opacity-90">{capturedImages.length} Foto</span>
                                    </div>
                                </button>
                            ) : (
                                <button
                                    onClick={handleCapture}
                                    disabled={!cameraReady}
                                    className={`w-20 h-20 rounded-full border-4 border-white/80 flex items-center justify-center p-1 transition-all ${!cameraReady ? 'opacity-50' : 'active:scale-90'}`}
                                >
                                    <div className="w-full h-full bg-white rounded-full"></div>
                                </button>
                            )}
                        </div>

                        {/* Flip / Capture More Button */}
                        {capturedImages.length > 0 ? (
                            <button
                                onClick={handleCapture}
                                disabled={capturedImages.length >= MAX_BATCH_SIZE}
                                className={`w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all ${capturedImages.length >= MAX_BATCH_SIZE ? 'opacity-30' : 'hover:bg-white/20'}`}
                            >
                                <FaCamera />
                            </button>
                        ) : (
                            <button
                                onClick={toggleFacingMode}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 active:scale-90 transition-all hover:bg-white/20"
                            >
                                <FaSyncAlt />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* --- HISTORY MODAL --- */}
            {showHistory && (
                <div className="absolute inset-0 z-modal bg-black/80 backdrop-blur-sm animate-fade-in flex items-end">
                    <div className="absolute inset-0" onClick={() => setShowHistory(false)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full h-[85vh] rounded-t-[2.5rem] flex flex-col shadow-2xl animate-slide-up overflow-hidden">

                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Riwayat Audit</h3>
                            <div className="flex gap-2">
                                {history.length > 0 && (
                                    <button onClick={handleClearHistory} className="w-9 h-9 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors">
                                        <FaTrash size={12} />
                                    </button>
                                )}
                                <button onClick={() => setShowHistory(false)} className="w-9 h-9 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors">
                                    <FaTimes size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3 pb-safe">
                            {history.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                    <span className="text-4xl mb-3 opacity-20 block"><FaHistory /></span>
                                    <p className="text-sm">Belum ada riwayat.</p>
                                </div>
                            ) : (
                                history.map((item, idx) => (
                                    <button
                                        key={item.timestamp || idx}
                                        onClick={() => { setResult(item); setShowHistory(false); }}
                                        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between text-left active:scale-[0.98] transition-transform"
                                    >
                                        <div className="min-w-0 flex-1 pr-3">
                                            <p className="font-bold text-slate-800 dark:text-slate-100 text-sm truncate">{item.productName || 'Produk Tanpa Nama'}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                {new Date(item.timestamp).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-wider ${item.status === 'halal' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                item.status === 'haram' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {item.status}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Input */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []) as File[];
                    if (files.length > 0) {
                        setIsProcessingFile(true);
                        // Process async
                        setTimeout(async () => {
                            const results: string[] = [];
                            try {
                                for (const file of files) {
                                    const reader = new FileReader();
                                    const base64 = await new Promise<string>((resolve) => {
                                        reader.onload = (re) => resolve(re.target?.result as string);
                                        reader.readAsDataURL(file as Blob);
                                    });
                                    results.push(base64);
                                }
                                setCapturedImages(prev => [...prev, ...results].slice(0, MAX_BATCH_SIZE));
                            } catch (err) {
                                showToast("Gagal memuat gambar", "error");
                            } finally {
                                setIsProcessingFile(false);
                                e.target.value = '';
                            }
                        }, 100);
                    }
                }}
            />
        </div>
    );
};