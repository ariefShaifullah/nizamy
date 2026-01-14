
import React, { useMemo } from 'react';
import type { ActionStep } from '../../../../types.ts';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { 
    FaBolt, FaTools, FaFlagCheckered, FaArrowRight, FaRoad, FaShieldAlt, FaCheckCircle, FaRegCircle
} from 'react-icons/fa';

interface HedeRoadmapProps {
    roadmap: ActionStep[];
    onInternalAction?: (action: string) => void;
    completedSteps: string[];
    onToggleStep: (action: string) => void;
}

const RoadmapItem: React.FC<{ 
    step: ActionStep; 
    index: number; 
    isCompleted: boolean;
    onToggle: () => void;
    onAction?: (a: string) => void 
}> = ({ step, index, isCompleted, onToggle, onAction }) => {
    const navigate = useNavigate();
    const isEven = index % 2 === 0;
    
    let bgIcon = '';
    let icon = null;
    let title = '';
    let colorName = '';

    if (step.phase === 'short_term') {
        bgIcon = 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300';
        colorName = 'red';
        icon = <FaBolt />;
        title = "Fase 1: Penyelamatan";
    } else if (step.phase === 'mid_term') {
        bgIcon = 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300';
        colorName = 'amber';
        icon = <FaTools />;
        title = "Fase 2: Pemulihan";
    } else {
        bgIcon = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300';
        colorName = 'emerald';
        icon = <FaFlagCheckered />;
        title = "Fase 3: Pemurnian";
    }

    // Override colors if completed
    if (isCompleted) {
        bgIcon = 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
        colorName = 'slate';
    }

    const mobileBorder = `border-r-4 border-r-${colorName}-500`;
    const desktopOverride = isEven 
        ? `md:border-r md:border-r-slate-200 md:dark:border-r-slate-700 md:border-l-4 md:border-l-${colorName}-500`
        : ``;

    const borderClass = `${mobileBorder} ${desktopOverride}`;

    const handleCta = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Haptic on button press
        if (navigator.vibrate) navigator.vibrate(10);
        
        if (!step.cta) return;
        
        if (step.cta.startsWith('internal:')) {
            onAction?.(step.cta);
        } else {
            navigate(step.cta);
        }
    };

    return (
        <div 
            className={`relative flex items-center justify-between md:justify-between w-full mb-8 ${isEven ? 'md:flex-row-reverse' : ''} animate-fade-in-up`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            
            <div className="hidden md:block w-5/12"></div>

            {/* Center Timeline Node */}
            <div className={`absolute left-6 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 shadow-md z-raised flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900 scale-110' : 'bg-white dark:bg-slate-800 border-white dark:border-slate-900'}`}>
                {isCompleted ? (
                    <div className="text-white text-xs animate-fade-in"><FaCheckCircle /></div>
                ) : (
                    <div className={`w-3 h-3 rounded-full ${step.phase === 'short_term' ? 'bg-red-500' : step.phase === 'mid_term' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                )}
            </div>

            <div className="w-full pl-16 md:pl-0 md:w-5/12 relative">
                
                <div className={`hidden md:block absolute top-6 w-3 h-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transform rotate-45 z-dropdown 
                    ${isEven 
                        ? '-right-[7px] border-t border-r'
                        : '-left-[7px] border-b border-l'
                    }
                `}></div>
                
                {/* Main Card */}
                <div 
                    onClick={onToggle}
                    className={`
                        relative p-5 rounded-2xl shadow-sm border transition-all duration-300 cursor-pointer group select-none
                        ${isCompleted 
                            ? 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-75 grayscale-[0.8] scale-[0.98]' 
                            : `bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1`
                        }
                        ${borderClass}
                    `}
                >
                    {/* Checkbox Overlay Indicator */}
                    <div className="absolute top-4 right-4 text-xl transition-all duration-300">
                        {isCompleted ? (
                            <span className="text-emerald-500 drop-shadow-sm scale-110"><FaCheckCircle /></span>
                        ) : (
                            <span className="text-slate-200 dark:text-slate-700 group-hover:text-indigo-400 transition-colors"><FaRegCircle /></span>
                        )}
                    </div>

                    <div className="flex justify-between items-start mb-3 pr-8">
                        <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg text-xs transition-colors ${bgIcon}`}>
                                <span className="icon-wrapper w-4 h-4">{icon}</span>
                            </span>
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${isCompleted ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                {title}
                            </span>
                        </div>
                    </div>
                    
                    <h4 className={`font-bold mb-2 leading-snug text-sm md:text-base transition-colors ${isCompleted ? 'text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {step.action}
                    </h4>
                    
                    {!isCompleted && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700/50 mb-3">
                            <span className="font-bold not-italic mr-1 text-slate-700 dark:text-slate-300">Dampak:</span> {step.impact}
                        </div>
                    )}

                    {step.cta && !isCompleted && (
                        <button 
                            onClick={handleCta}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 dark:hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-95 group/btn"
                        >
                            {step.ctaLabel || "Buka Fitur"} 
                            <span className="icon-wrapper w-3 h-3 group-hover/btn:translate-x-1 transition-transform"><FaArrowRight /></span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const HedeRoadmap: React.FC<HedeRoadmapProps> = ({ roadmap, onInternalAction, completedSteps, onToggleStep }) => {
    
    // Calculate progress based on props
    const progress = useMemo(() => {
        if (roadmap.length === 0) return 0;
        // Count only steps that are in current roadmap
        const validCompleted = completedSteps.filter(action => 
            roadmap.some(step => step.action === action)
        );
        const percent = Math.round((validCompleted.length / roadmap.length) * 100);
        return Math.min(100, Math.max(0, percent));
    }, [roadmap, completedSteps]);

    const isAllDone = progress === 100;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            {/* Celebration Background */}
            {isAllDone && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-b from-emerald-500/10 to-transparent animate-fade-in"></div>
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
                </div>
            )}

            <div className="relative z-raised">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-all duration-500 ${isAllDone ? 'bg-emerald-500 text-white shadow-emerald-200 scale-110 rotate-12' : 'bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-200 dark:shadow-none'}`}>
                            <span className="icon-wrapper w-6 h-6">{isAllDone ? <FaCheckCircle /> : <FaRoad />}</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 dark:text-white transition-colors">
                                {isAllDone ? "Masya Allah, Sempurna!" : "Roadmap Hijrah"}
                            </h3>
                            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
                                {isAllDone ? "Anda telah menyelesaikan semua langkah ikhtiar." : "Centang langkah yang sudah Anda kerjakan."}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full md:w-48">
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-500 dark:text-slate-400">Proses</span>
                            <span className={`transition-colors ${isAllDone ? "text-emerald-600" : "text-indigo-600"}`}>{progress}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isAllDone ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                style={{ width: `${progress}%` }}
                            >
                                {/* Shimmer Effect on Progress Bar */}
                                <div className="absolute inset-0 bg-white/20 skew-x-12 -translate-x-full animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {roadmap.length > 0 ? (
                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute top-4 bottom-4 left-6 md:left-1/2 transform -translate-x-1/2 w-1 bg-linear-to-b from-red-400 via-amber-400 to-emerald-500 rounded-full opacity-20"></div>
                        
                        {roadmap.map((step, idx) => {
                            const isCompleted = completedSteps.includes(step.action);
                            return (
                                <RoadmapItem 
                                    key={idx} 
                                    step={step} 
                                    index={idx} 
                                    isCompleted={isCompleted}
                                    onToggle={() => onToggleStep(step.action)}
                                    onAction={onInternalAction} 
                                />
                            );
                        })}

                        {/* Final Badge */}
                        <div className="relative flex justify-center mt-8">
                            <div className={`
                                px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest border transition-all duration-500 z-raised flex items-center gap-2
                                ${isAllDone 
                                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-200/50 scale-110' 
                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                }
                            `}>
                                {isAllDone && <FaCheckCircle />}
                                {isAllDone ? "Harta Halal & Berkah" : "Menuju Harta Berkah"}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <span className="icon-wrapper w-20 h-20 text-indigo-300 mb-6 flex items-center justify-center text-6xl opacity-50"><FaShieldAlt /></span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 text-lg">Istiqamah!</h4>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-2 max-w-xs leading-relaxed">
                            Tidak ada langkah korektif yang diperlukan saat ini. Pertahankan kondisi ini dan jangan lupa zakat.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
