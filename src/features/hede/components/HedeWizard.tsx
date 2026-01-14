
import React, { useState, useEffect, useRef } from 'react';
import { QUESTIONS_DB, CATEGORY_LABELS } from '../constants.ts';
import { Question } from '../../../types.ts';
import { FaChevronLeft, FaCheck, FaLightbulb, FaTimes, FaArrowRight, FaKeyboard } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';

interface HedeWizardProps {
    onComplete: (answers: Record<string, string>) => void;
    onCancel: () => void;
}

export const HedeWizard: React.FC<HedeWizardProps> = ({ onComplete, onCancel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    // UI States
    const [animationClass, setAnimationClass] = useState('animate-fade-in');
    const [showHelper, setShowHelper] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const currentQuestion = QUESTIONS_DB[currentQuestionIndex];
    
    // Progress Calculation
    const progress = ((currentQuestionIndex + 1) / QUESTIONS_DB.length) * 100;

    // Helper: Dependency Logic
    const isQuestionVisible = (question: Question, currentAnswers: Record<string, string>): boolean => {
        if (!question.dependency) return true;
        const parentAnswer = currentAnswers[question.dependency.id];
        if (!parentAnswer) return false; 
        const { type, values } = question.dependency;
        return type === 'include' ? values.includes(parentAnswer) : !values.includes(parentAnswer);
    };

    // Helper: Navigation Logic
    const getNextIndex = (startIndex: number, currentAnswers: Record<string, string>): number => {
        let nextIndex = startIndex + 1;
        while (nextIndex < QUESTIONS_DB.length) {
            if (isQuestionVisible(QUESTIONS_DB[nextIndex], currentAnswers)) return nextIndex;
            nextIndex++;
        }
        return nextIndex;
    };

    const getPrevIndex = (startIndex: number, currentAnswers: Record<string, string>): number => {
        let prevIndex = startIndex - 1;
        while (prevIndex >= 0) {
            if (isQuestionVisible(QUESTIONS_DB[prevIndex], currentAnswers)) return prevIndex;
            prevIndex--;
        }
        return -1;
    };

    const handleSelect = (value: string) => {
        audioService.playClick();
        
        // Premium Touch: Haptic Feedback
        if (navigator.vibrate) {
            navigator.vibrate(10); // Subtle tick
        }

        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        
        // Reset helper
        setShowHelper(false); 
        
        const nextIndex = getNextIndex(currentQuestionIndex, newAnswers);
        
        // Animate Out
        setAnimationClass('opacity-0 -translate-x-4 transition-all duration-300 ease-in-out');

        setTimeout(() => {
            if (nextIndex < QUESTIONS_DB.length) {
                setCurrentQuestionIndex(nextIndex);
                // Scroll container to top smoothly for next question
                if(containerRef.current) {
                    containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // Also scroll window to top to be safe on mobile
                window.scrollTo({ top: 0, behavior: 'smooth' });

                // Animate In
                setAnimationClass('opacity-0 translate-x-8');
                requestAnimationFrame(() => {
                    setAnimationClass('opacity-100 translate-x-0 transition-all duration-500 ease-out');
                });
            } else {
                onComplete(newAnswers);
            }
        }, 300);
    };

    const handleBack = () => {
        audioService.playClick();
        const prevIndex = getPrevIndex(currentQuestionIndex, answers);

        if (prevIndex >= 0) {
            setShowHelper(false);
            setAnimationClass('opacity-0 translate-x-4 transition-all duration-300 ease-in-out');
            setTimeout(() => {
                setCurrentQuestionIndex(prevIndex);
                setAnimationClass('opacity-0 -translate-x-8');
                requestAnimationFrame(() => {
                    setAnimationClass('opacity-100 translate-x-0 transition-all duration-500 ease-out');
                });
            }, 300);
        } else {
            onCancel();
        }
    };

    // Keyboard Support (A11y)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Backspace' && currentQuestionIndex > 0) {
                handleBack();
                return;
            }
            
            const num = parseInt(e.key);
            if (!isNaN(num) && num > 0 && num <= currentQuestion.options.length) {
                handleSelect(currentQuestion.options[num - 1].value);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentQuestionIndex, answers, currentQuestion]);

    return (
        <div ref={containerRef} className="w-full max-w-2xl mx-auto min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
            {/* 1. Header & Progress */}
            <header className="sticky top-0 z-navigation bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 pt-[env(safe-area-inset-top)] transition-all">
                <div className="relative h-16 flex items-center px-4 justify-between">
                    <button 
                        onClick={handleBack}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                        aria-label="Kembali"
                    >
                        <span className="icon-wrapper w-5 h-5 group-hover:-translate-x-0.5 transition-transform"><FaChevronLeft /></span>
                    </button>

                    <div className="flex flex-col items-center">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 dark:text-slate-500">Kategori</span>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">
                            {CATEGORY_LABELS[currentQuestion.category]}
                        </div>
                    </div>
                    
                    <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                        {currentQuestionIndex + 1} / {QUESTIONS_DB.length}
                    </span>
                </div>
                
                {/* Slim Progress Bar */}
                <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 absolute bottom-0">
                    <div 
                        className="h-full bg-linear-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            {/* 2. Content Area */}
            <main className="flex-1 px-5 md:px-8 py-8 md:py-12 flex flex-col w-full">
                <div className={animationClass}>
                    
                    {/* Helper Toggle (Top Right of Question) */}
                    {currentQuestion.helperText && (
                        <div className="flex justify-end mb-2">
                            <button 
                                onClick={() => setShowHelper(!showHelper)}
                                className={`flex items-center gap-2 text-[10px] font-bold px-3 py-1.5 rounded-full transition-all border ${
                                    showHelper 
                                    ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800' 
                                    : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:hover:text-indigo-400'
                                }`}
                            >
                                {showHelper ? <FaTimes /> : <FaLightbulb />}
                                {showHelper ? 'Tutup Info' : 'Info Fiqh'}
                            </button>
                        </div>
                    )}

                    {/* Question Text */}
                    <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 md:mb-8 leading-snug tracking-tight">
                        {currentQuestion.text}
                    </h2>

                    {/* Helper Content (Inline) */}
                    {showHelper && currentQuestion.helperText && (
                        <div className="mb-8 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-400 p-5 rounded-r-2xl animate-fade-in-down shadow-sm">
                            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-1">Konteks Syariah</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                                "{currentQuestion.helperText}"
                            </p>
                        </div>
                    )}

                    {/* Options Grid */}
                    <div className="space-y-3">
                        {currentQuestion.options.map((opt, idx) => {
                            const isSelected = answers[currentQuestion.id] === opt.value;
                            // Display number (idx + 1) instead of letter to match Keyboard interaction
                            const displayIndex = idx + 1; 
                            
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 group relative active:scale-[0.98] outline-none focus:ring-4 focus:ring-indigo-500/20 flex items-center gap-5
                                        ${isSelected 
                                            ? 'bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none z-raised' 
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg dark:hover:bg-slate-700/50'
                                        }
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-300 font-bold text-sm
                                        ${isSelected 
                                            ? 'bg-white border-white text-indigo-600 scale-110' 
                                            : 'border-slate-300 dark:border-slate-600 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500'
                                        }
                                    `}>
                                        {isSelected ? <FaCheck /> : displayIndex}
                                    </div>
                                    
                                    <span className={`text-base md:text-lg font-medium leading-relaxed flex-1 ${isSelected ? 'text-white font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {opt.label}
                                    </span>

                                    <div className={`opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 ${isSelected ? 'text-white' : 'text-indigo-400'}`}>
                                        <FaArrowRight />
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop Keyboard Hint */}
                    <div className="hidden md:flex items-center justify-center gap-2 mt-8 text-xs text-slate-400 dark:text-slate-500 font-medium opacity-60">
                        <FaKeyboard />
                        <span>Tip: Tekan angka <strong>1-{currentQuestion.options.length}</strong> pada keyboard untuk memilih cepat.</span>
                    </div>
                </div>
            </main>
        </div>
    );
};
