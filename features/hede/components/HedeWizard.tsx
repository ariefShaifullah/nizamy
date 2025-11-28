
import React, { useState } from 'react';
import { QUESTIONS_DB, CATEGORY_LABELS } from '../constants.ts';
import { calculateRiskScore } from '../logic/hede.service.ts';
import { HedeResult, HedeCategory, Question } from '../../../types.ts';
import { FaChevronRight, FaChevronLeft, FaShieldAlt } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';

interface HedeWizardProps {
    onComplete: (result: HedeResult) => void;
    onCancel: () => void;
}

export const HedeWizard: React.FC<HedeWizardProps> = ({ onComplete, onCancel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    // Animation state trigger
    const [fadeIn, setFadeIn] = useState(true);

    const currentQuestion = QUESTIONS_DB[currentQuestionIndex];
    const currentCategory = currentQuestion?.category;
    
    // Calculate progress - Use simple index based progress for UI consistency
    const progress = ((currentQuestionIndex + 1) / QUESTIONS_DB.length) * 100;

    // Helper: Check if question should be shown based on dependencies
    const isQuestionVisible = (question: Question, currentAnswers: Record<string, string>): boolean => {
        if (!question.dependency) return true;

        const parentAnswer = currentAnswers[question.dependency.id];
        if (!parentAnswer) return false; // If parent not answered (shouldn't happen in linear flow), hide

        const { type, values } = question.dependency;
        if (type === 'include') {
            return values.includes(parentAnswer);
        } else {
            return !values.includes(parentAnswer);
        }
    };

    // Helper: Find next visible question index
    const getNextIndex = (startIndex: number, currentAnswers: Record<string, string>): number => {
        let nextIndex = startIndex + 1;
        while (nextIndex < QUESTIONS_DB.length) {
            if (isQuestionVisible(QUESTIONS_DB[nextIndex], currentAnswers)) {
                return nextIndex;
            }
            nextIndex++;
        }
        return nextIndex; // Will be >= length, indicating end
    };

    // Helper: Find previous visible question index
    const getPrevIndex = (startIndex: number, currentAnswers: Record<string, string>): number => {
        let prevIndex = startIndex - 1;
        while (prevIndex >= 0) {
            if (isQuestionVisible(QUESTIONS_DB[prevIndex], currentAnswers)) {
                return prevIndex;
            }
            prevIndex--;
        }
        return -1;
    };

    const handleSelect = (value: string) => {
        audioService.playClick();
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        
        const nextIndex = getNextIndex(currentQuestionIndex, newAnswers);
        
        if (nextIndex < QUESTIONS_DB.length) {
            // Trigger animation reset for smooth question transition
            setFadeIn(false);
            setTimeout(() => {
                setCurrentQuestionIndex(nextIndex);
                setFadeIn(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 200); 
        } else {
            // Finish
            const result = calculateRiskScore(newAnswers);
            onComplete(result);
        }
    };

    const handleBack = () => {
        audioService.playClick();
        const prevIndex = getPrevIndex(currentQuestionIndex, answers);

        if (prevIndex >= 0) {
            setFadeIn(false);
            setTimeout(() => {
                setCurrentQuestionIndex(prevIndex);
                setFadeIn(true);
            }, 200);
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
        <div className="w-full max-w-2xl mx-auto pb-safe relative min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
            {/* 1. Sticky Header & Progress */}
            <div className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all pt-[env(safe-area-inset-top)] shadow-sm">
                <div className="px-4 py-3 md:py-4 max-w-2xl mx-auto">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-xl shadow-sm border border-indigo-100 dark:border-indigo-800">
                                {getCategoryIcon(currentCategory)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
                                    {Object.keys(CATEGORY_LABELS).indexOf(currentCategory) + 1}/{Object.keys(CATEGORY_LABELS).length} Kategori
                                </span>
                                <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white leading-tight">
                                    {CATEGORY_LABELS[currentCategory]}
                                </h3>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="inline-block bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                                {currentQuestionIndex + 1} / {QUESTIONS_DB.length}
                            </span>
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* 2. Main Content Area */}
            <div className="flex-1 px-4 py-6 md:py-8 flex flex-col justify-start md:justify-center">
                
                {/* Question Card */}
                <div 
                    className={`transform transition-all duration-300 ease-out ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                >
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white leading-tight md:leading-snug">
                            {currentQuestion.text}
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id] === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between active:scale-[0.98] shadow-sm hover:shadow-md relative overflow-hidden min-h-[72px] ${
                                        isSelected 
                                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:border-indigo-500 ring-1 ring-indigo-500 z-10' 
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                    }`}
                                >
                                    <span className={`font-medium text-sm md:text-base pr-4 leading-relaxed relative z-10 ${isSelected ? 'text-indigo-900 dark:text-indigo-100 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {opt.label}
                                    </span>
                                    
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 relative z-10 ${
                                        isSelected 
                                        ? 'bg-indigo-600 text-white rotate-0' 
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/50 -rotate-90 group-hover:rotate-0'
                                    }`}>
                                        <div className="icon-wrapper w-3 h-3"><FaChevronRight /></div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 3. Footer Actions */}
            <div className="px-4 py-4 md:py-6 flex justify-between items-center bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors text-sm font-bold px-4 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                    <div className="icon-wrapper w-3 h-3"><FaChevronLeft /></div> 
                    {currentQuestionIndex === 0 ? "Batal" : "Kembali"}
                </button>

                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 opacity-70 bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                    <span className="icon-wrapper w-3 h-3"><FaShieldAlt /></span> 
                    Privasi: Data Lokal
                </div>
            </div>
        </div>
    );
};
