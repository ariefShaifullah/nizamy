import React, { useState } from 'react';
import { QUESTIONS_DB, CATEGORY_LABELS } from '../constants.ts';
import { HedeResult, HedeCategory, Question } from '../../../types.ts';
import { FaChevronLeft, FaCheckCircle } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';

interface HedeWizardProps {
    onComplete: (answers: Record<string, string>) => void;
    onCancel: () => void;
}

export const HedeWizard: React.FC<HedeWizardProps> = ({ onComplete, onCancel }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    
    // Animation states
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

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
                onComplete(newAnswers);
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

    return (
        <div className="w-full max-w-3xl mx-auto pb-safe min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
            {/* 1. Header & Progress */}
            <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 pt-[env(safe-area-inset-top)]">
                <div className="relative h-16 flex items-center px-4">
                    {/* Back Button */}
                    <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <button 
                            onClick={handleBack}
                            className="p-3 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <span className="icon-wrapper w-5 h-5"><FaChevronLeft /></span>
                        </button>
                    </div>

                    {/* Centered Title */}
                    <div className="flex-1 text-center font-bold text-slate-800 dark:text-white text-sm truncate px-14">
                        {CATEGORY_LABELS[currentQuestion.category]}
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                            {currentQuestionIndex + 1}/{QUESTIONS_DB.length}
                        </span>
                    </div>
                </div>
                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 absolute bottom-0">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </header>

            {/* 2. Content Area */}
            <main className="flex-1 px-4 md:px-8 py-6 md:py-10 flex flex-col justify-center max-w-2xl mx-auto w-full">
                <div 
                    className={`transform transition-all duration-300 ease-out ${
                        isTransitioning 
                            ? (direction === 'forward' ? '-translate-x-10 opacity-0' : 'translate-x-10 opacity-0') 
                            : 'translate-x-0 opacity-100'
                    }`}
                >
                    {/* Question Text */}
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 md:mb-10 text-center">
                        {currentQuestion.text}
                    </h2>

                    {/* Options Grid */}
                    <div className="space-y-4">
                        {currentQuestion.options.map((opt) => {
                            const isSelected = answers[currentQuestion.id] === opt.value;
                            return (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group relative active:scale-[0.99]
                                        ${isSelected 
                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 dark:border-indigo-500 shadow-md' 
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-lg'
                                        }
                                    `}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-6 h-6 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-300
                                            ${isSelected 
                                                ? 'bg-indigo-600 border-indigo-600' 
                                                : 'border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'
                                            }
                                        `}>
                                            {isSelected && <div className="icon-wrapper w-3.5 h-3.5 text-white"><FaCheckCircle /></div>}
                                        </div>
                                        <span className={`text-base font-medium leading-relaxed ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {opt.label}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};