import React, { useState, useLayoutEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

type ReportTab = 'summary' | 'details' | 'roadmap';

interface HedeOnboardingProps {
    onClose: () => void;
    setActiveTab: (tab: ReportTab) => void;
}

const DESKTOP_STEPS: { title: string; description: string; targetElementId: string; tab: ReportTab }[] = [
    {
        title: "1. Skor Kepatuhan Anda",
        description: "Ini adalah skor keseluruhan kesehatan ekonomi syariah Anda. Semakin tinggi, semakin baik.",
        targetElementId: 'hede-score-section',
        tab: 'summary'
    },
    {
        title: "2. Detail Risiko",
        description: "Klik tab ini untuk melihat rincian temuan spesifik dan pelanggaran yang terdeteksi.",
        targetElementId: 'hede-tab-details',
        tab: 'details'
    },
    {
        title: "3. Roadmap Hijrah",
        description: "Tab 'Roadmap' berisi langkah-langkah praktis yang disarankan untuk memperbaiki kondisi Anda.",
        targetElementId: 'hede-tab-roadmap',
        tab: 'roadmap'
    },
];

const MOBILE_STEPS: { title: string; description: string; targetElementId: string; tab: ReportTab }[] = [
    {
        title: "1. Ringkasan Skor",
        description: "Tab ini menampilkan skor keseluruhan kesehatan ekonomi syariah Anda. Semakin tinggi, semakin baik.",
        targetElementId: 'hede-tab-summary',
        tab: 'summary'
    },
    {
        title: "2. Detail Risiko",
        description: "Pindah ke tab ini untuk melihat rincian temuan spesifik dan pelanggaran yang terdeteksi.",
        targetElementId: 'hede-tab-details',
        tab: 'details'
    },
    {
        title: "3. Roadmap Hijrah",
        description: "Tab 'Roadmap' berisi langkah-langkah praktis yang disarankan untuk memperbaiki kondisi Anda.",
        targetElementId: 'hede-tab-roadmap',
        tab: 'roadmap'
    },
];

type ElementRect = { top: number; left: number; width: number; height: number; right: number; bottom: number };

const getOverlayStyle = (side: 'top' | 'bottom' | 'left' | 'right', rect: ElementRect): React.CSSProperties => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    switch (side) {
        case 'top':
            return { top: 0, left: 0, width: '100%', height: `${rect.top}px` };
        case 'bottom':
            return { top: `${rect.bottom}px`, left: 0, width: '100%', height: `${vh - rect.bottom}px`, bottom: 0 };
        case 'left':
            return { top: `${rect.top}px`, left: 0, width: `${rect.left}px`, height: `${rect.height}px` };
        case 'right':
            return { top: `${rect.top}px`, left: `${rect.right}px`, width: `${vw - rect.right}px`, height: `${rect.height}px`, right: 0 };
        default:
            return {};
    }
};


export const HedeOnboarding: React.FC<HedeOnboardingProps> = ({ onClose, setActiveTab }) => {
    const [step, setStep] = useState(0);
    const modalRef = useRef<HTMLDivElement>(null);
    
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isVisible, setIsVisible] = useState(false);
    
    const [targetRect, setTargetRect] = useState<ElementRect>({ top: 0, left: 0, width: 0, height: 0, right: 0, bottom: 0 });
    const [modalStyle, setModalStyle] = useState<React.CSSProperties & { [key: string]: any }>({});
    
    const steps = isMobile ? MOBILE_STEPS : DESKTOP_STEPS;
    const currentStepConfig = steps[step];

    // --- EFFECT 1: Scroll Lock & Resize Listener ---
    useLayoutEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', checkIsMobile);

        return () => {
            document.body.style.overflow = 'unset';
            document.documentElement.style.overflow = 'unset';
            window.removeEventListener('resize', checkIsMobile);
        };
    }, []);

    // --- EFFECT 2: Positioning Logic (Main Engine) ---
    useLayoutEffect(() => {
        if (!currentStepConfig) return;

        setActiveTab(currentStepConfig.tab);

        const timer = setTimeout(() => {
            const targetEl = document.getElementById(currentStepConfig.targetElementId);
            if (!targetEl) {
                console.warn("Onboarding target not found:", currentStepConfig.targetElementId);
                onClose();
                return;
            }

            const rect = targetEl.getBoundingClientRect();
            const modalEl = modalRef.current;
            if (!modalEl) return;

            const modalRect = modalEl.getBoundingClientRect();
            
            setTargetRect(rect);
            
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const margin = 16;
            let top, left, arrowSide, arrowLeft;

            if (rect.bottom + modalRect.height < vh - margin) {
                top = rect.bottom + margin;
                arrowSide = 'top';
            } else {
                top = rect.top - modalRect.height - margin;
                arrowSide = 'bottom';
            }

            left = rect.left + (rect.width / 2) - (modalRect.width / 2);
            if (left < margin) left = margin;
            if (left + modalRect.width > vw - margin) left = vw - modalRect.width - margin;

            arrowLeft = rect.left + (rect.width / 2) - left;

            setModalStyle({
                opacity: 1,
                transform: 'translateY(0) scale(1)',
                top: `${top}px`,
                left: `${left}px`,
                '--arrow-left': `${arrowLeft}px`,
                '--arrow-top': arrowSide === 'top' ? '-8px' : 'auto',
                '--arrow-bottom': arrowSide === 'bottom' ? '-8px' : 'auto',
            });

            setIsVisible(true);
        }, 150);

        return () => clearTimeout(timer);
    }, [step, setActiveTab, isMobile, onClose, currentStepConfig]);
    
    const handleNext = () => {
        setIsVisible(false); // Start fade-out
        setTimeout(() => {
            if (step < steps.length - 1) {
                setStep(step + 1); // Change step after fade-out
            } else {
                onClose();
            }
        }, 300); // Match CSS transition duration
    };

    return (
        <div className="fixed inset-0 z-1000" onContextMenu={e => e.preventDefault()}>
            {/* Four-part overlay for spotlight effect with blur */}
            {['top', 'bottom', 'left', 'right'].map(side => (
                <div
                    key={side}
                    className="absolute bg-slate-900/80 backdrop-blur-sm transition-all duration-300 ease-in-out pointer-events-auto"
                    style={{
                        opacity: isVisible ? 1 : 0,
                        ...(getOverlayStyle(side as any, targetRect))
                    }}
                    onClick={onClose}
                ></div>
            ))}
            
            {/* Highlight Box (border) */}
            <div
                className="absolute border-2 border-white/80 rounded-lg shadow-[0_0_20px_5px_rgba(255,255,255,0.3)] transition-all duration-300 ease-in-out pointer-events-none"
                style={{
                    opacity: isVisible ? 1 : 0,
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
            ></div>
            
            <div 
                ref={modalRef}
                style={modalStyle}
                className="absolute p-5 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-72 transition-all duration-300 z-1002 opacity-0 scale-95"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute w-4 h-4 bg-white dark:bg-slate-800 transform rotate-45" style={{ left: 'var(--arrow-left)', top: 'var(--arrow-top)', bottom: 'var(--arrow-bottom)' }}></div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{currentStepConfig?.title}</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600"><FaTimes /></button>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{currentStepConfig?.description}</p>
                <div className="flex justify-between items-center">
                    <div className="flex gap-1.5">
                        {steps.map((_, i) => (
                            <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-4 bg-purple-500' : 'w-1.5 bg-slate-200 dark:bg-slate-600'}`}></div>
                        ))}
                    </div>
                    <button onClick={handleNext} className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700">
                        {step === steps.length - 1 ? 'Selesai' : 'Lanjut'}
                    </button>
                </div>
            </div>
        </div>
    );
};