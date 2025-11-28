
import React, { useState, useEffect } from 'react';
import { QUESTIONS_DB, CATEGORY_LABELS } from '../constants.ts';
import { calculateRiskScore } from '../logic/hede.service.ts';
import { HedeResult, HedeCategory, Question } from '../../../types.ts';
import { FaChevronLeft, FaShieldAlt, FaCheckCircle, FaCircle } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';

interface HedeWizardProps {
    onComplete: (result: HedeResult) => void;
    onCancel: () => void;
}

export const HedeWizard: React.FC<HedeWizardProps> = ({ onComplete, onCancel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    // Animation states
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

    const currentQuestion = QUESTIONS_DB[currentQuestionIndex];
    const currentCategory = currentQuestion?.category;
    
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
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        
        const nextIndex = getNextIndex(currentQuestionIndex, newAnswers);
        
        setDirection('forward');
        setIsTransitioning(true);

        setTimeout(() => {
            if (nextIndex < QUESTIONS_DB.length) {
                setCurrentQuestionIndex(nextIndex);
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setIsTransitioning(false);
            } else {
                const result = calculateRiskScore(newAnswers);
                onComplete(result);
            }
        }, 300);
    };

    const handleBack = () => {
        audioService.playClick();
        const prevIndex = getPrevIndex(currentQuestionIndex, answers);

        if (prevIndex >= 0) {
            setDirection('backward');
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentQuestionIndex(prevIndex);
                setIsTransitioning(false);
            }, 300);
        } else {
            onCancel();
        }
    };

    // Category Icon Helper
    const getCategoryIcon = (cat: HedeCategory) => {
        switch(cat) {
            case 'job': return '💼';
            case 'business': return '🏢';
            case 'finance': return '💰';
            case 'digital': return '📱';
            case 'payment': return '💳';
            case 'emergency': return '🆘';
            default: return '📋';
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto pb-safe relative min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* 1. Header & Progress */}
            <div className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 pt-[env(safe-area-inset-top)] transition-all">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-800 flex items-center justify-center text-2xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                                {getCategoryIcon(currentCategory)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-extrabold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest leading-tight mb-0.5">
                                    Topik {Object.keys(CATEGORY_LABELS).indexOf(currentCategory) + 1} dari {Object.keys(CATEGORY_LABELS).length}
                                </span>
                                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                    {CATEGORY_LABELS[currentCategory]}
                                </h3>
                            </div>
                        </div>
                        <div className="text-right hidden sm:block">
                            <span className="inline-flex items-center justify-center bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {currentQuestionIndex + 1} / {QUESTIONS_DB.length}
                            </span>
                        </div>
                    </div>
                    
                    {/* Animated Progress Bar */}
                    <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-[0_0_12px_rgba(99,102,241,0.6)] transition-all duration-700 ease-out rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute top-0 right-0 bottom-0 w-full bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Content Area */}
            <div className="flex-1 px-4 md:px-8 py-6 md:py-10 flex flex-col justify-center max-w-2xl mx-auto w-full">
                
                <div 
                    className={`transform transition-all duration-300 ease-out ${
                        isTransitioning 
                            ? (direction === 'forward' ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0') 
                            : 'translate-x-0 opacity-100'
                    }`}
                >
                    {/* Question Text */}
                    <div className="mb-8 md:mb-10">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight md:leading-snug tracking-tight">
                            {currentQuestion.text}
                        </h2>
                    </div>

                    {/* Options Grid */}
                    <div className="space-y-4">
                        {currentQuestion.options.map((opt, idx) => {
                            const isSelected = answers[currentQuestion.id] === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden active:scale-[0.99]
                                        ${isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-500 shadow-md ring-1 ring-indigo-500/30' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-100/50 dark:hover:shadow-none'
                                        }
                                    `}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300
                                            ${isSelected 
                                                ? 'bg-indigo-600 border-indigo-600' 
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                                            }
                                        `}>
                                            {isSelected 
                                                ? <div className="icon-wrapper w-3.5 h-3.5 text-white flex items-center justify-center"><FaCheckCircle /></div> 
                                                : <div className="icon-wrapper w-2 h-2 text-transparent group-hover:text-indigo-200 flex items-center justify-center"><FaCircle /></div>
                                            }
                                        </div>
                                        <span className={`text-base md:text-lg font-medium leading-relaxed transition-colors duration-200 ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {opt.label}
                                        </span>
                                    </div>
                                    
                                    {/* Subtle background highlight on hover */}
                                    <div className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="px-6 py-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                <div className="flex justify-between items-center max-w-3xl mx-auto">
                    <button 
                        onClick={handleBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-bold px-4 py-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                        <div className="icon-wrapper w-3 h-3"><FaChevronLeft /></div> 
                        {currentQuestionIndex === 0 ? "Batal" : "Kembali"}
                    </button>

                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-medium text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="icon-wrapper w-3 h-3 text-indigo-500"><FaShieldAlt /></div>
                        <span>Data tersimpan lokal & terenkripsi</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
