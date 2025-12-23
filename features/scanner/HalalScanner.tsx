
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Webcam from 'react-webcam';
import { analyzeImage } from './logic/scanner.service.ts';
import { ScanResultCard } from './components/ScanResultCard.tsx';
import type { ScanResult } from '../../types.ts';
import { useToast } from '../../components/ui/Toast.tsx';
import { useIndexedDB } from "../../hooks/useIndexedDB.ts";
import { useConfirm } from "../../components/ui/ConfirmContext.tsx";
import {
  FaCamera,
  FaImage,
  FaArrowLeft,
  FaHistory,
  FaSyncAlt,
  FaTimes,
  FaShieldAlt,
  FaBolt,
  FaSearchPlus,
  FaTrash,
} from "react-icons/fa";
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
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useIndexedDB<ScanResult[]>(
    "nizamy_scan_history",
    [],
  );
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [showHistory, setShowHistory] = useState(false);

  // Hardware Features State
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [canZoom, setCanZoom] = useState(false);
  const [canTorch, setCanTorch] = useState(false);

  // Tap to Focus Visual State
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(
    null,
  );

  const videoConstraints = useMemo(
    () => ({
      facingMode,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      aspectRatio: 9 / 16,
    }),
    [facingMode],
  );

  // Handle Hardware Capabilities (Torch/Zoom)
  useEffect(() => {
    if (cameraReady && webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        setCanTorch(!!capabilities.torch);
        setCanZoom(!!capabilities.zoom);
      }
    }
  }, [cameraReady, facingMode]);

  const toggleTorch = async () => {
    if (!webcamRef.current) return;
    const video = webcamRef.current.video;
    if (video && video.srcObject) {
      const track = (video.srcObject as MediaStream).getVideoTracks()[0];
      try {
        await track.applyConstraints({
          advanced: [{ torch: !isTorchOn }],
        } as any);
        setIsTorchOn(!isTorchOn);
        if (navigator.vibrate) navigator.vibrate(20);
      } catch (err) {
        showToast("Senter tidak tersedia", "error");
      }
    }
  };

  const handleZoomChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setZoom(value);
    if (webcamRef.current) {
      const video = webcamRef.current.video;
      if (video && video.srcObject) {
        const track = (video.srcObject as MediaStream).getVideoTracks()[0];
        try {
          await track.applyConstraints({
            advanced: [{ zoom: value }],
          } as any);
        } catch (e) {}
      }
    }
  };

  const handleTapToFocus = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!webcamRef.current || !cameraReady || isScanning || result) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setFocusPoint({ x: clientX, y: clientY });
    setTimeout(() => setFocusPoint(null), 800);

    if (navigator.vibrate) navigator.vibrate(20);

    try {
      const video = webcamRef.current.video;
      if (video && video.srcObject) {
        const track = (video.srcObject as MediaStream).getVideoTracks()[0];
        const capabilities = track.getCapabilities() as any;

        if (capabilities.focusMode) {
          await track.applyConstraints({
            advanced: [{ focusMode: "continuous" }],
          } as any);
        }
      }
    } catch (err) {
      console.debug("Manual focus not supported");
    }
  };

  const handleCapture = useCallback(async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      if (navigator.vibrate) navigator.vibrate(50);
      processImage(imageSrc);
    }
  }, [webcamRef]);

  const processImage = async (base64: string) => {
    setIsScanning(true);
    if (isTorchOn) toggleTorch();

    try {
      const data = await analyzeImage(base64);
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCameraReady(false);
    setIsTorchOn(false);
  };

  const handleClearHistory = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat?",
      message: "Semua data pindaian akan dihapus dari perangkat ini.",
      confirmText: "Hapus Semua",
      variant: "danger",
    });
    if (isConfirmed) {
      setHistory([]);
      showToast("Riwayat dikosongkan", "info");
    }
  };

  const removeHistoryItem = (timestamp: string) => {
    setHistory((prev) => prev.filter((h) => h.timestamp !== timestamp));
  };

  return (
    <div className="fixed inset-0 z-overlay bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Header (Enhanced Glassmorphism for High Contrast) */}
      <div className="absolute top-0 left-0 right-0 p-4 z-header flex justify-between items-center pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button
          onClick={() => (result ? setResult(null) : navigate("/"))}
          className="w-12 h-12 bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white active:scale-90 transition-all shadow-xl"
        >
          <span className="icon-wrapper w-5 h-5 flex items-center justify-center text-xl">
            <FaArrowLeft />
          </span>
        </button>

        <div className="flex bg-white/80 dark:bg-white/10 backdrop-blur-2xl px-4 py-2.5 rounded-2xl border border-white/20 dark:border-white/10 items-center gap-2 shadow-xl">
          <span className="icon-wrapper w-4 h-4 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <FaShieldAlt />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">
            HALAL AI SCANNER
          </span>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className="w-12 h-12 bg-white/80 dark:bg-white/10 backdrop-blur-2xl rounded-2xl flex items-center justify-center border border-white/20 dark:border-white/10 text-slate-900 dark:text-white hover:bg-white active:scale-90 transition-all shadow-xl"
        >
          <span className="icon-wrapper w-5 h-5 flex items-center justify-center text-xl">
            <FaHistory />
          </span>
        </button>
      </div>

      {/* Viewfinder Layer */}
      <div
        className="flex-1 relative flex flex-col justify-center bg-slate-900 touch-none"
        onClick={handleTapToFocus}
        onTouchStart={handleTapToFocus}
      >
        {result ? (
          <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto pt-28 pb-10 px-4 animate-fade-in-up">
            <ScanResultCard result={result} onReset={() => setResult(null)} />
          </div>
        ) : (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              onUserMedia={() => setCameraReady(true)}
              onUserMediaError={(err) => {
                console.error("Webcam Error:", err);
                showToast(
                  "Gagal mengakses kamera. Izinkan akses kamera.",
                  "error",
                );
              }}
              screenshotQuality={1.0}
              mirrored={facingMode === "user"}
              imageSmoothing={true}
              forceScreenshotSourceSize={true}
              disablePictureInPicture={true}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Focus Ring */}
            {focusPoint && (
              <div
                className="absolute w-16 h-16 border-2 border-emerald-400 rounded-full pointer-events-none animate-[focus-ping_0.8s_ease-out_forwards] z-raised"
                style={{ top: focusPoint.y - 32, left: focusPoint.x - 32 }}
              >
                <div className="absolute inset-0 border border-white/30 rounded-full animate-ping"></div>
              </div>
            )}

            {/* Overlay Elements */}
            {cameraReady && !isScanning && (
              <>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-72 h-72 border-2 border-white/10 rounded-[3rem] relative shadow-[0_0_0_2000px_rgba(0,0,0,0.6)]">
                    <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-4xl -mt-1 -ml-1"></div>
                    <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-4xl -mt-1 -mr-1"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-4xl -mb-1 -ml-1"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-4xl -mb-1 -mr-1"></div>
                    <div className="absolute inset-x-6 h-1 bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-[scan_3s_ease-in-out_infinite]"></div>
                  </div>
                  <div className="mt-12 text-center px-6">
                    <p className="text-xs font-bold text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md inline-block">
                      Arahkan pada Komposisi Bahan
                    </p>
                  </div>
                </div>

                {/* Sidebar Camera Controls */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-raised">
                  {canTorch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTorch();
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isTorchOn ? "bg-yellow-400 text-slate-900 border-yellow-400 shadow-lg shadow-yellow-500/50" : "bg-black/20 text-white border-white/20 backdrop-blur-md"}`}
                    >
                      <span className="icon-wrapper w-5 h-5 flex items-center justify-center">
                        <FaBolt />
                      </span>
                    </button>
                  )}
                  {canZoom && (
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-32 w-12 bg-black/20 backdrop-blur-md border border-white/20 rounded-full flex flex-col items-center py-4 relative">
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          value={zoom}
                          onChange={handleZoomChange}
                          className="absolute w-24 -rotate-90 origin-center top-1/2 -translate-y-1/2 appearance-none bg-transparent cursor-pointer [&::-webkit-slider-runnable-track]:bg-white/20 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:rounded-full"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                        {zoom.toFixed(1)}x
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Analysis Loading State */}
            {isScanning && (
              <div className="absolute inset-0 z-notification bg-slate-950/80 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-6 flex items-center justify-center text-4xl animate-bounce">
                    🧪
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                  Audit Halal Digital
                </h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
                  AI sedang menganalisis bahan kritis dan mencari logo halal
                  resmi pada kemasan...
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!result && !isScanning && (
        <div className="absolute bottom-0 left-0 right-0 p-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] flex items-center justify-around bg-linear-to-t from-black via-black/60 to-transparent z-navigation">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-90 transition-all shadow-lg"
          >
            <span className="icon-wrapper w-6 h-6 flex items-center justify-center text-white">
              <FaImage />
            </span>
          </button>

          <button
            onClick={handleCapture}
            disabled={!cameraReady}
            className={`w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center transition-all p-1.5 ${!cameraReady ? "opacity-30" : "hover:scale-105 active:scale-90"}`}
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)]">
              <div className="w-20 h-20 border-4 border-black/5 rounded-full flex items-center justify-center">
                <span className="icon-wrapper w-8 h-8 flex items-center justify-center text-slate-900">
                  <FaCamera />
                </span>
              </div>
            </div>
          </button>

          <button
            onClick={toggleFacingMode}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/20 active:scale-90 transition-all shadow-lg"
          >
            <span className="icon-wrapper w-6 h-6 flex items-center justify-center text-white">
              <FaSyncAlt />
            </span>
          </button>
        </div>
      )}

      {/* History Sheet */}
      {showHistory && (
        <div className="absolute inset-0 z-modal bg-black/80 backdrop-blur-sm animate-fade-in flex items-end">
          <div
            className="absolute inset-0"
            onClick={() => setShowHistory(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-h-[85vh] rounded-t-[3rem] p-8 overflow-hidden flex flex-col shadow-2xl animate-fade-in-up border-t border-white/10">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 shrink-0"></div>

            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Riwayat Audit
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                  {history.length} Hasil Tersimpan
                </p>
              </div>
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={handleClearHistory}
                    className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
                    title="Hapus Semua"
                  >
                    <span className="icon-wrapper w-4 h-4 flex items-center justify-center">
                      <FaTrash />
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span className="icon-wrapper w-4 h-4 flex items-center justify-center">
                    <FaTimes />
                  </span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-10">
              {history.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4 opacity-20">📜</div>
                  <p className="text-slate-400 font-medium italic">
                    Belum ada riwayat pindaian.
                  </p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div
                    key={item.timestamp}
                    className="w-full flex items-center gap-3 animate-fade-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <button
                      onClick={() => {
                        setResult(item);
                        setShowHistory(false);
                      }}
                      className="flex-1 p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-left hover:border-emerald-500/50 hover:shadow-lg transition-all"
                    >
                      <div className="min-w-0 flex-1 pr-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-base">
                          {item.productName}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(item.timestamp).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                      <div
                        className={`shrink-0 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${
                          item.status === "halal"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : item.status === "haram"
                              ? "bg-red-50 text-red-600 border-red-100"
                              : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {item.status}
                      </div>
                    </button>
                    <button
                      onClick={() => removeHistoryItem(item.timestamp)}
                      className="p-4 text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <span className="icon-wrapper w-3.5 h-3.5 flex items-center justify-center">
                        <FaTrash />
                      </span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (re) => processImage(re.target?.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />

      <style>{`
                @keyframes scan {
                    0% { top: 0; opacity: 0; }
                    20% { opacity: 1; }
                    80% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes focus-ping {
                    0% { transform: scale(1.5); opacity: 0.8; }
                    50% { transform: scale(0.9); opacity: 1; }
                    100% { transform: scale(1); opacity: 0; }
                }
            `}</style>
    </div>
  );
};;
