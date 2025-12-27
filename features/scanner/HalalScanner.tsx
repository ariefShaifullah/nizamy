
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import Webcam from 'react-webcam';
import { analyzeBatch } from "./logic/scanner.service.ts";
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
  FaTrash,
  FaCheck,
  FaSpinner,
  FaSearch,
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
  const [isProcessingFile, setIsProcessingFile] = useState(false);
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

  // Batch Mode State
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const MAX_BATCH_SIZE = 4;

  // Hardware Features State
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [canTorch, setCanTorch] = useState(false);
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
        await (track as any).applyConstraints({
          advanced: [{ torch: !isTorchOn }],
        });
        setIsTorchOn(!isTorchOn);
        if (navigator.vibrate) navigator.vibrate(20);
      } catch (err) {
        showToast("Senter tidak tersedia", "error");
      }
    }
  };

  const handleTapToFocus = async (e: React.MouseEvent | React.TouchEvent) => {
    if (!webcamRef.current || !cameraReady || isScanning || result) return;
    const clientX =
      "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY =
      "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setFocusPoint({ x: clientX, y: clientY });
    setTimeout(() => setFocusPoint(null), 800);
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const handleCapture = useCallback(() => {
    if (!webcamRef.current || capturedImages.length >= MAX_BATCH_SIZE) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      if (navigator.vibrate) navigator.vibrate(50);
      setCapturedImages((prev) => [...prev, imageSrc]);
      showToast(`Foto ${capturedImages.length + 1} ditambahkan`, "success");
    }
  }, [webcamRef, capturedImages.length]);

  const handleStartAnalysis = async () => {
    if (capturedImages.length === 0) return;
    setIsScanning(true);
    if (isTorchOn) toggleTorch();

    try {
      const data = await analyzeBatch(capturedImages);
      setResult(data);
      setHistory((prev) => [data, ...prev].slice(0, 20));
      setCapturedImages([]);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsScanning(false);
    }
  };

  const removeCapturedImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setCameraReady(false);
    setIsTorchOn(false);
  };

  const handleClearHistory = async () => {
    const isConfirmed = await confirm({
      title: "Hapus Riwayat?",
      message: "Semua riwayat pindaian akan dihapus permanen.",
      confirmText: "Hapus Semua",
      variant: "danger",
    });

    if (isConfirmed) {
      setHistory([]);
      showToast("Riwayat dihapus", "info");
    }
  };

  // --- DYNAMIC HEADER STYLES ---
  // If result is shown, use solid theme-aware colors (Slate/White).
  // If camera mode, use translucent white overlay.
  const headerBtnClass = result
    ? "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
    : "bg-white/10 text-white border-white/10 hover:bg-white/20 shadow-xl";

  const headerTitleClass = result
    ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
    : "bg-white/10 border-white/10 text-emerald-400 shadow-xl";

  return (
    <div className="fixed inset-0 z-overlay bg-black text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 z-header flex justify-between items-center pt-[calc(env(safe-area-inset-top)+1rem)]">
        <button
          onClick={() => (result ? setResult(null) : navigate("/"))}
          className={`w-12 h-12 backdrop-blur-2xl rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${headerBtnClass}`}
        >
          <span className="icon-wrapper w-5 h-5 flex items-center justify-center text-xl">
            <FaArrowLeft />
          </span>
        </button>

        <div
          className={`flex backdrop-blur-2xl px-4 py-2.5 rounded-2xl border items-center gap-2 ${headerTitleClass}`}
        >
          <span className="icon-wrapper w-4 h-4 flex items-center justify-center">
            <FaShieldAlt />
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            HALAL SCANNER
          </span>
        </div>

        <button
          onClick={() => setShowHistory(true)}
          className={`w-12 h-12 backdrop-blur-2xl rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${headerBtnClass}`}
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
              onUserMediaError={() =>
                showToast("Gagal mengakses kamera", "error")
              }
              screenshotQuality={1.0}
              mirrored={facingMode === "user"}
              disablePictureInPicture={true}
              forceScreenshotSourceSize={false}
              imageSmoothing={true}
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 scanner-viewfinder-gradient pointer-events-none"></div>

            {focusPoint && (
              <div
                className="absolute w-16 h-16 border-2 border-emerald-400 rounded-full pointer-events-none scanner-focus-ring z-raised"
                style={{ top: focusPoint.y - 32, left: focusPoint.x - 32 }}
              />
            )}

            {cameraReady && !isScanning && !isProcessingFile && (
              <>
                {/* Guide Overlay - Hidden when images are captured to prevent overlap */}
                {capturedImages.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
                    <div className="w-72 h-72 border-2 border-white/10 rounded-[3rem] relative shadow-[0_0_0_2000px_rgba(0,0,0,0.6)]">
                      <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-4xl -mt-1 -ml-1"></div>
                      <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-4xl -mt-1 -mr-1"></div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-4xl -mb-1 -ml-1"></div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-4xl -mb-1 -mr-1"></div>
                    </div>
                    <div className="mt-12 text-center px-6">
                      <p className="text-xs font-bold text-white/80 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md inline-block">
                        Ambil Foto Kemasan & Komposisi
                      </p>
                    </div>
                  </div>
                )}

                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-6 z-raised">
                  {canTorch && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTorch();
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all ${isTorchOn ? "bg-yellow-400 text-slate-900 border-yellow-400 shadow-lg" : "bg-black/20 text-white border-white/20 backdrop-blur-md"}`}
                    >
                      <FaBolt />
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Processing State (Analysis or File Loading) */}
            {(isScanning || isProcessingFile) && (
              <div className="absolute inset-0 z-notification bg-slate-950/80 backdrop-blur-lg flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="relative w-28 h-28 mb-8">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-6 flex items-center justify-center text-4xl animate-bounce">
                    {/* FIX: Move className from Icon to parent wrapper */}
                    {isProcessingFile ? (
                      <span className="text-slate-300">
                        <FaImage />
                      </span>
                    ) : (
                      "🤖"
                    )}
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                  {isProcessingFile
                    ? "Memproses Gambar..."
                    : "Audit Kontekstual"}
                </h3>
                <p className="text-slate-400 text-sm max-w-xs leading-relaxed font-medium">
                  {isProcessingFile
                    ? "Sedang membaca file dari galeri Anda."
                    : `AI sedang menghubungkan informasi dari ${capturedImages.length} foto...`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Batch Thumbnails Tray - Increased Top Padding to prevent clipping of close button */}
      {!result &&
        !isScanning &&
        !isProcessingFile &&
        capturedImages.length > 0 && (
          <div className="absolute bottom-40 left-0 right-0 px-6 flex gap-3 overflow-x-auto pb-4 pt-8 hide-scrollbar z-raised items-end">
            {capturedImages.map((img, idx) => (
              <div
                key={idx}
                className="relative shrink-0 scanner-thumbnail-enter group"
              >
                <img
                  src={img}
                  className="w-20 h-28 object-cover rounded-xl border-2 border-white/20 shadow-lg"
                  alt={`Capture ${idx}`}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCapturedImage(idx);
                  }}
                  className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white z-50 active:scale-90 transition-transform"
                >
                  <span className="icon-wrapper w-3 h-3 flex items-center justify-center">
                    <FaTimes />
                  </span>
                </button>
                <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[8px] px-1.5 rounded-md backdrop-blur-sm font-bold">
                  #{idx + 1}
                </div>
              </div>
            ))}
            {capturedImages.length < MAX_BATCH_SIZE && (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-white/30 gap-1 scanner-glass-tray shrink-0">
                <FaCamera size={14} />
                <span className="text-[8px] font-black uppercase text-center leading-tight px-1">
                  Tambah Foto
                </span>
              </div>
            )}
          </div>
        )}

      {/* Bottom Controls */}
      {!result && !isScanning && !isProcessingFile && (
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] flex items-center justify-around bg-linear-to-t from-black via-black/80 to-transparent z-navigation">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-90 transition-all hover:bg-white/20"
          >
            <FaImage size={24} />
          </button>

          {/* Dynamic Main Action Button */}
          {capturedImages.length > 0 ? (
            <button
              onClick={handleStartAnalysis}
              className="h-20 px-8 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse text-white active:scale-95 transition-all border border-emerald-400 gap-3"
            >
              <span className="icon-wrapper w-6 h-6">
                <FaSearch size={24} />
              </span>
              <div className="text-left">
                <span className="block text-lg font-black leading-none">
                  ANALISA
                </span>
                <span className="text-xs font-medium opacity-90">
                  {capturedImages.length} Foto Siap
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleCapture}
              disabled={!cameraReady}
              className={`w-24 h-24 rounded-full border-4 border-white/30 flex items-center justify-center transition-all p-1.5 ${!cameraReady ? "opacity-30 scale-90" : "hover:scale-105 active:scale-90"}`}
            >
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] text-slate-900">
                <FaCamera size={32} />
              </div>
            </button>
          )}

          {capturedImages.length > 0 ? (
            <button
              onClick={handleCapture}
              disabled={capturedImages.length >= MAX_BATCH_SIZE}
              className={`w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-90 transition-all ${capturedImages.length >= MAX_BATCH_SIZE ? "opacity-30 cursor-not-allowed" : "hover:bg-white/20"}`}
            >
              <FaCamera size={24} />
            </button>
          ) : (
            <button
              onClick={toggleFacingMode}
              className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 text-white shadow-lg active:scale-90 transition-all hover:bg-white/20"
            >
              <FaSyncAlt size={24} />
            </button>
          )}
        </div>
      )}

      {/* History Sheet */}
      {showHistory && (
        <div className="absolute inset-0 z-modal bg-black/80 backdrop-blur-sm animate-fade-in flex items-end">
          <div
            className="absolute inset-0"
            onClick={() => setShowHistory(false)}
          ></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-h-[85vh] rounded-t-[3rem] p-8 flex flex-col shadow-2xl animate-fade-in-up">
            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-8 shrink-0"></div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                Riwayat Audit
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={handleClearHistory}
                  className="w-10 h-10 bg-red-50 text-red-500 rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <FaTrash />
                </button>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar pb-10">
              {history.length === 0 ? (
                <p className="text-center py-20 text-slate-400 italic">
                  Belum ada riwayat pindaian.
                </p>
              ) : (
                history.map((item, idx) => (
                  <button
                    key={item.timestamp || idx}
                    onClick={() => {
                      setResult(item);
                      setShowHistory(false);
                    }}
                    className="w-full p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-left hover:border-emerald-500 transition-all"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {new Date(item.timestamp).toLocaleString("id-ID", {
                          dateStyle: "medium",
                        })}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase ${
                        item.status === "halal"
                          ? "bg-emerald-50 text-emerald-600"
                          : item.status === "haram"
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.status}
                    </div>
                  </button>
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
        multiple
        className="hidden"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []) as File[];
          if (files.length > 0) {
            // FIX: Add processing state feedback
            setIsProcessingFile(true);

            const processFiles = async () => {
              const results: string[] = [];
              try {
                for (const file of files) {
                  const reader = new FileReader();
                  const base64 = await new Promise<string>((resolve) => {
                    reader.onload = (re) =>
                      resolve(re.target?.result as string);
                    reader.readAsDataURL(file as Blob);
                  });
                  results.push(base64);
                }
                setCapturedImages((prev) =>
                  [...prev, ...results].slice(0, MAX_BATCH_SIZE),
                );
              } catch (err) {
                showToast("Gagal memuat gambar galeri", "error");
              } finally {
                setIsProcessingFile(false);
                // Clear input value so same file can be selected again if needed
                e.target.value = "";
              }
            };

            // Small delay to allow UI to update to processing state
            setTimeout(processFiles, 100);
          }
        }}
      />
    </div>
  );
};;;
