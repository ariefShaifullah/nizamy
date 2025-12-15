
import React, { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { analyzeImage } from './logic/scanner.service.ts';
import { ScanResultCard } from './components/ScanResultCard.tsx';
import type { ScanResult } from '../../types.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { FaCamera, FaImage, FaSpinner, FaArrowLeft, FaBolt, FaExclamationTriangle, FaVideo } from 'react-icons/fa';
// @ts-ignore
import { useNavigate } from 'react-router-dom';

export const HalalScanner: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const webcamRef = useRef<Webcam>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(false);
    const [torchOn, setTorchOn] = useState(false);
    const [mountKey, setMountKey] = useState(0); // Force remount if needed

    // Fallback timer if camera takes too long
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!cameraReady && !cameraError) {
                console.warn("Camera taking long to load...");
            }
        }, 5000);
        return () => clearTimeout(timer);
    }, [cameraReady, cameraError]);

    const handleUserMediaError = useCallback((error: any) => {
        console.error("Camera Error:", error);
        setCameraError(true);
        let msg = "Gagal mengakses kamera.";
        if (error.name === "NotAllowedError") msg = "Izin kamera ditolak. Silakan izinkan di pengaturan browser.";
        if (error.name === "NotFoundError") msg = "Kamera tidak ditemukan.";
        if (error.name === "NotReadableError") msg = "Kamera sedang digunakan aplikasi lain.";
        showToast(msg, "error");
    }, [showToast]);

    const handleUserMedia = useCallback(() => {
        console.log("Camera loaded successfully");
        setCameraReady(true);
        setCameraError(false);
    }, []);

    const toggleTorch = () => {
        setTorchOn(prev => !prev);
        // Note: Torch support in browser is limited/experimental via track.applyConstraints
        const stream = webcamRef.current?.video?.srcObject as MediaStream;
        const track = stream?.getTracks()[0];
        if (track && (track.getCapabilities() as any).torch) {
            track.applyConstraints({
                advanced: [{ torch: !torchOn }]
            } as any).catch(e => console.log(e));
        } else {
            showToast("Flashlight tidak didukung browser ini", "info");
        }
    }

    // Ultra-basic constraints for maximum compatibility
    const videoConstraints = {
        facingMode: "environment"
    };

    const handleCapture = useCallback(async () => {
        if (!webcamRef.current) return;
        
        // Haptic Feedback
        if (navigator.vibrate) navigator.vibrate(50);

        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            processImage(imageSrc);
        } else {
            showToast("Gagal mengambil gambar. Coba lagi.", "error");
        }
    }, [webcamRef, showToast]);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            processImage(base64);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (base64: string) => {
        setIsScanning(true);
        try {
            const data = await analyzeImage(base64);
            setResult(data);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Success pattern
        } catch (error: any) {
            console.error(error);
            showToast(error.message || "Gagal memproses gambar", "error");
            if (navigator.vibrate) navigator.vibrate(200); // Error vibration
        } finally {
            setIsScanning(false);
        }
    };

    const retryCamera = () => {
        setCameraError(false);
        setCameraReady(false);
        setMountKey(prev => prev + 1); // Force component remount
    };

    return (
        <div className="fixed inset-0 z-overlay bg-black text-white flex flex-col overflow-hidden">
            {/* Header Overlay */}
            {!result && (
                <div className="absolute top-0 left-0 right-0 p-4 z-50 flex justify-between items-start pt-[env(safe-area-inset-top)]">
                    <button 
                        onClick={() => navigate('/')}
                        className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10"
                    >
                        <FaArrowLeft />
                    </button>
                    <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${cameraReady ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className="text-xs font-bold uppercase tracking-widest">
                            AI Scanner
                        </span>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 relative bg-black flex flex-col justify-center w-full h-full">
                {result ? (
                    <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto pt-24 px-4 pb-10">
                        <ScanResultCard result={result} onReset={() => setResult(null)} />
                    </div>
                ) : (
                    <>
                        {/* Camera Layer */}
                        <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black">
                            {!cameraError && (
                                <Webcam
                                    key={mountKey}
                                    ref={webcamRef}
                                    audio={false}
                                    disablePictureInPicture={true}
                                    imageSmoothing={true}
                                    screenshotFormat="image/jpeg"
                                    screenshotQuality={0.85}
                                    forceScreenshotSourceSize
                                    mirrored={false}
                                    videoConstraints={{
                                        facingMode: { ideal: "environment" }
                                    }}
                                    onUserMedia={handleUserMedia}
                                    onUserMediaError={handleUserMediaError}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                                        cameraReady ? "opacity-100" : "opacity-0"
                                    }`}
                                />

                            )}

                            {/* Loading State */}
                            {!cameraReady && !cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-6 text-center">
                                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                                    <p className="text-sm font-medium text-white/80">Menyiapkan kamera...</p>
                                    <p className="text-xs text-white/50 mt-2">Pastikan browser diizinkan mengakses kamera.</p>
                                </div>
                            )}

                            {/* Error State */}
                            {cameraError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/90 p-8 text-center">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 text-red-500">
                                        <FaExclamationTriangle size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Kamera Bermasalah</h3>
                                    <p className="text-sm text-white/60 mb-6 max-w-xs">
                                        Tidak dapat mengakses kamera. Coba refresh halaman atau gunakan tombol upload.
                                    </p>
                                    <button 
                                        onClick={retryCamera}
                                        className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition-colors mb-3"
                                    >
                                        Coba Lagi
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Scanner Overlay UI */}
                        {cameraReady && !isScanning && (
                            <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                                {/* Frame Target */}
                                <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-500 rounded-tl-xl -mt-1 -ml-1"></div>
                                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-500 rounded-tr-xl -mt-1 -mr-1"></div>
                                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-500 rounded-bl-xl -mb-1 -ml-1"></div>
                                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-500 rounded-br-xl -mb-1 -mr-1"></div>
                                    
                                    {/* Scanning Line Animation */}
                                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.8)] top-0 animate-[scan_2s_linear_infinite]"></div>
                                </div>
                                <div className="mt-4 bg-black/50 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                                    <p className="text-xs font-bold text-white/90">Arahkan ke komposisi produk</p>
                                </div>
                            </div>
                        )}

                        {/* Processing Overlay */}
                        {isScanning && (
                            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="font-bold text-lg animate-pulse text-emerald-400">Menganalisis Halal...</p>
                                <p className="text-xs text-white/50 mt-2">Sedang membaca komposisi dengan AI</p>
                            </div>
                        )}

                        {/* Controls Bar */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] bg-linear-to-t from-black via-black/80 to-transparent flex items-center justify-between gap-6 z-30">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-all active:scale-95"
                                title="Upload Foto"
                            >
                                <FaImage size={18} />
                            </button>
                            
                            <button 
                                onClick={handleCapture}
                                disabled={!cameraReady}
                                className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group active:scale-90 transition-all ${!cameraReady ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-emerald-400'}`}
                            >
                                <div className={`w-16 h-16 bg-white rounded-full transition-all ${!cameraReady ? 'scale-90 bg-gray-400' : 'group-hover:scale-90 group-active:scale-75'}`}></div>
                            </button>

                            <button 
                                onClick={toggleTorch}
                                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full backdrop-blur-md transition-all active:scale-95 ${torchOn ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                                title="Flashlight"
                            >
                                <FaBolt size={18} />
                            </button>
                        </div>
                        
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileUpload} 
                        />
                    </>
                )}
            </div>
        </div>
    );
};
