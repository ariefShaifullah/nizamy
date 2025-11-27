
import React, { useState, useMemo, useEffect } from 'react';
import { QUESTIONS_DB, CATEGORY_LABELS } from '../constants.ts';
import { calculateRiskScore } from '../logic/hede.service.ts';
import { HedeResult, HedeCategory } from '../../../types.ts';
import { FaChevronRight, FaChevronLeft, FaShieldAlt, FaArrowRight } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';

interface HedeWizardProps {
    onComplete: (result: HedeResult) => void;
    onCancel: () => void;
}

export const HedeWizard: React.FC<HedeWizardProps> = ({ onComplete, onCancel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showSectionIntro, setShowSectionIntro] = useState(true);

    const currentQuestion = QUESTIONS_DB[currentQuestionIndex];
    const currentCategory = currentQuestion?.category;

    // Detect Category Change
    const isNewCategory = useMemo(() => {
        if (currentQuestionIndex === 0) return true;
        const prevCat = QUESTIONS_DB[currentQuestionIndex - 1].category;
        return prevCat !== currentCategory;
    }, [currentQuestionIndex, currentCategory]);

    useEffect(() => {
        if (isNewCategory && currentQuestionIndex > 0) { // Only show intro on change, not initial render handled by default
            setShowSectionIntro(true);
        }
    }, [isNewCategory, currentQuestionIndex]);

    const handleSelect = (value: string) => {
        audioService.playClick();
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);
        
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < QUESTIONS_DB.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            // Finish
            const result = calculateRiskScore(newAnswers);
            onComplete(result);
        }
    };

    const handleBack = () => {
        audioService.playClick();
        if (currentQuestionIndex > 0) {
            // Check if going back crosses a category boundary
            const prevIndex = currentQuestionIndex - 1;
            // UX Decision: Just go to question directly for smoother flow
            setCurrentQuestionIndex(prevIndex);
            setShowSectionIntro(false); 
        } else {
            // Cancel Audit if at first question
            onCancel();
        }
    };

    const progress = ((currentQuestionIndex) / QUESTIONS_DB.length) * 100;

    if (showSectionIntro && currentCategory) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fade-in px-6 pt-10">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm">
                    {currentCategory === 'job' && '💼'}
                    {currentCategory === 'business' && '🏢'}
                    {currentCategory === 'finance' && '💰'}
                    {currentCategory === 'digital' && '📱'}
                    {currentCategory === 'payment' && '💳'}
                    {currentCategory === 'emergency' && '🆘'}
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                    Bagian {currentCategory === 'job' ? '1' : currentCategory === 'business' ? '2' : currentCategory === 'finance' ? '3' : currentCategory === 'digital' ? '4' : currentCategory === 'payment' ? '5' : '6'} dari 6
                </h3>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white mb-8">
                    {CATEGORY_LABELS[currentCategory as HedeCategory]}
                </h2>
                <div className="flex flex-col md:flex-row gap-4 w-full max-w-sm">
                    <button 
                        onClick={() => { audioService.playClick(); setShowSectionIntro(false); }}
                        className="w-full px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 dark:shadow-none transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                    >
                        Mulai Sesi Ini <div className="icon-wrapper w-5 h-5"><FaArrowRight /></div>
                    </button>
                    <button 
                        onClick={handleBack}
                        className="w-full px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold text-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <div className="icon-wrapper w-4 h-4"><FaChevronLeft /></div> 
                        {currentQuestionIndex === 0 ? "Batal" : "Kembali"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up pb-24 relative pt-4 md:pt-8 px-4">
            {/* Navigation Header */}
            <div className="mb-6 md:mb-8">
                {/* Back Button */}
                <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 text-slate-400 hover:text-purple-600 transition-colors text-sm font-bold p-2 -ml-2 mb-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg w-fit active:bg-slate-100 dark:active:bg-slate-800"
                >
                    <div className="icon-wrapper w-3 h-3"><FaChevronLeft /></div> 
                    {currentQuestionIndex === 0 ? "Batal" : "Kembali"}
                </button>

                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">
                        {CATEGORY_LABELS[currentCategory as HedeCategory]}
                    </span>
                    <span className="text-[10px] md:text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                    <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Question Card */}
            <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-purple-100/50 dark:shadow-none p-5 md:p-10 border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-50 dark:bg-purple-900/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10">
                    <h3 className="text-lg md:text-2xl font-bold text-slate-800 dark:text-white mb-6 md:mb-8 leading-snug">
                        {currentQuestion.text}
                    </h3>

                    <div className="space-y-3">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id] === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all duration-200 group flex items-center justify-between active:scale-[0.97] touch-manipulation ${
                                        isSelected 
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30' 
                                        : 'border-slate-100 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                                    }`}
                                >
                                    <span className={`font-medium text-sm md:text-base pr-4 leading-relaxed ${isSelected ? 'text-purple-900 dark:text-purple-100 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {opt.label}
                                    </span>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ${
                                        isSelected 
                                        ? 'bg-purple-500 text-white' 
                                        : 'bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-300 group-hover:border-purple-500 group-hover:text-purple-500'
                                    }`}>
                                        <div className="icon-wrapper w-3 h-3 flex items-center justify-center"><FaChevronRight /></div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            <div className="mt-8 text-center opacity-60 pb-8">
                <div className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1.5">
                    <span className="icon-wrapper w-3 h-3"><FaShieldAlt /></span> 
                    Jawaban Anda diproses lokal & dienkripsi.
                </div>
            </div>
        </div>
    );
};
