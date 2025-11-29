
import React from 'react';
import type { ActionStep } from '../../../../types.ts';
// @ts-ignore
import { useNavigate } from 'react-router-dom';
import { 
    FaBolt, FaTools, FaFlagCheckered, FaArrowRight, FaRoad, FaShieldAlt
} from 'react-icons/fa';

interface HedeRoadmapProps {
    roadmap: ActionStep[];
}

const RoadmapItem: React.FC<{ step: ActionStep; index: number }> = ({ step, index }) => {
    const navigate = useNavigate();
    const isEven = index % 2 === 0; // Desktop: Left Side Card (Arrow on Right)
    
    let bgIcon = '';
    let icon = null;
    let title = '';
    let colorName = '';

    // Determine content based on phase
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

    // --- BORDER LOGIC ---
    // 1. Mobile Default: Arrow is LEFT. Border must be RIGHT.
    //    We use specific side coloring (border-r-red-500) to ensure only one side is colored.
    const mobileBorder = `border-r-4 border-r-${colorName}-500`;

    // 2. Desktop Overrides:
    //    - Even (Left Card): Arrow Right -> Border Left. 
    //      MUST Reset Right border to default thin slate.
    //    - Odd (Right Card): Arrow Left -> Border Right. (Inherits Mobile, no change needed).
    
    const desktopOverride = isEven 
        ? `md:border-r md:border-r-slate-200 md:dark:border-r-slate-700 md:border-l-4 md:border-l-${colorName}-500`
        : ``; // Odd cards match mobile layout (Border Right), so no override needed.

    const borderClass = `${mobileBorder} ${desktopOverride}`;

    return (
        <div className={`relative flex items-center justify-between md:justify-between w-full mb-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
            
            {/* 1. Spacer for Desktop (Pushes content to side) */}
            <div className="hidden md:block w-5/12"></div>

            {/* 2. Central Dot (The Milestone) */}
            <div className="absolute left-6 md:left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-white dark:bg-slate-800 shadow-md z-10 flex items-center justify-center">
                <div className={`w-3 h-3 rounded-full ${step.phase === 'short_term' ? 'bg-red-500' : step.phase === 'mid_term' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
            </div>

            {/* 3. The Content Card */}
            <div className="w-full pl-16 md:pl-0 md:w-5/12 relative">
                
                {/* DESKTOP ARROW */}
                <div className={`hidden md:block absolute top-6 w-3 h-3 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 transform rotate-45 z-20 
                    ${isEven 
                        ? '-right-[7px] border-t border-r' // Left Card -> Arrow on Right -> Points Right
                        : '-left-[7px] border-b border-l'  // Right Card -> Arrow on Left -> Points Left
                    }
                `}></div>
                
                {/* MOBILE ARROW */}
                {/* Always on left, pointing left to the timeline */}
                <div className="md:hidden absolute top-6 left-[57px] w-3 h-3 bg-white dark:bg-slate-800 border-b border-l border-slate-200 dark:border-slate-700 transform rotate-45 z-20"></div>

                {/* CARD CONTAINER */}
                <div className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 ${borderClass}`}>
                    
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg text-xs ${bgIcon}`}>
                                <span className="icon-wrapper w-4 h-4">{icon}</span>
                            </span>
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                {title}
                            </span>
                        </div>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${step.difficulty === 'easy' ? 'bg-teal-50 text-teal-600 border-teal-100' : step.difficulty === 'medium' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-purple-50 text-purple-600 border-purple-100'} dark:bg-opacity-10 dark:border-opacity-10`}>
                            {step.difficulty === 'easy' ? 'Mudah' : step.difficulty === 'medium' ? 'Sedang' : 'Berat'}
                        </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 leading-snug text-sm md:text-base">
                        {step.action}
                    </h4>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700/50 mb-3">
                        <span className="font-bold not-italic mr-1 text-slate-700 dark:text-slate-300">Dampak:</span> {step.impact}
                    </div>

                    {/* Ecosystem Link Button */}
                    {step.cta && (
                        <button 
                            onClick={() => navigate(step.cta!)}
                            className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white text-slate-600 dark:text-slate-300 text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm active:scale-95 group"
                        >
                            {step.ctaLabel || "Buka Fitur"} 
                            <span className="icon-wrapper w-3 h-3 group-hover:translate-x-1 transition-transform"><FaArrowRight /></span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const HedeRoadmap: React.FC<HedeRoadmapProps> = ({ roadmap }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-linear-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-indigo-200 dark:shadow-none transform rotate-3">
                    <span className="icon-wrapper w-6 h-6"><FaRoad /></span>
                </div>
                <div>
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white">Roadmap Hijrah</h3>
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Langkah taktis menuju harta yang berkah</p>
                </div>
            </div>
            
            {roadmap.length > 0 ? (
                <div className="relative">
                    {/* THE CONTINUOUS LINE */}
                    <div className="absolute top-4 bottom-4 left-6 md:left-1/2 transform -translate-x-1/2 w-1 bg-linear-to-b from-red-400 via-amber-400 to-emerald-500 rounded-full opacity-30"></div>
                    
                    {roadmap.map((step, idx) => (
                        <RoadmapItem key={idx} step={step} index={idx} />
                    ))}

                    {/* Finish Line Flag */}
                    <div className="relative flex justify-center mt-8">
                        <div className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-emerald-200 dark:border-emerald-800 z-10">
                            Harta Halal & Berkah
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
    );
};
