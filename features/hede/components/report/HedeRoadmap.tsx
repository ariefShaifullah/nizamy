
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

const RoadmapItem: React.FC<{ step: ActionStep; isLast: boolean; index: number }> = ({ step, isLast, index }) => {
    const navigate = useNavigate();
    let bg = '';
    let icon = null;
    let title = '';

    if (step.phase === 'short_term') {
        bg = 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
        icon = <FaBolt />;
        title = "Fase 1: Penyelamatan (Darurat)";
    } else if (step.phase === 'mid_term') {
        bg = 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300';
        icon = <FaTools />;
        title = "Fase 2: Pemulihan (Transisi)";
    } else {
        bg = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300';
        icon = <FaFlagCheckered />;
        title = "Fase 3: Pemurnian (Ideal)";
    }

    return (
        <div className="relative pl-8 md:pl-0">
            {/* Timeline Line (Mobile: Left, Desktop: Center) */}
            <div className={`absolute top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700
                left-[11px] md:left-1/2 md:-ml-[1px]
                ${isLast ? 'h-6' : ''}
            `}></div>
            
            {/* Timeline Dot */}
            <div className={`absolute w-6 h-6 rounded-full border-4 border-white dark:border-slate-800 ${bg.split(' ')[0]} z-10 shadow-sm
                left-0 md:left-1/2 md:-ml-3 mt-6
            `}></div>

            <div className={`flex flex-col md:flex-row items-center justify-between w-full mb-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                <div className="hidden md:block w-5/12"></div>
                
                <div className={`w-full md:w-5/12 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative hover:shadow-md transition-shadow group ${step.phase === 'short_term' ? 'border-l-4 border-l-red-500' : ''}`}>
                    
                    {/* Arrow for Desktop ZigZag */}
                    <div className={`hidden md:block absolute top-8 w-3 h-3 bg-white dark:bg-slate-800 border-t border-r border-slate-100 dark:border-slate-700 transform rotate-45 
                        ${index % 2 === 0 ? '-left-[7px] border-t-0 border-r-0 border-b border-l' : '-right-[7px]'}
                    `}></div>

                    <div className="flex justify-between items-start mb-2">
                        <div className={`flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-wider ${bg.split(' ').slice(3).join(' ')}`}>
                            <span className="icon-wrapper text-sm">{icon}</span> {title}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 font-bold border border-slate-200 dark:border-slate-600">
                            {step.difficulty === 'easy' ? 'Mudah' : step.difficulty === 'medium' ? 'Sedang' : 'Berat'}
                        </span>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 dark:text-white mb-2 leading-snug text-sm md:text-base">
                        {step.action}
                    </h4>
                    
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl text-xs text-slate-600 dark:text-slate-400 italic border border-slate-100 dark:border-slate-700/50">
                        <span className="font-bold not-italic mr-1">Dampak:</span> {step.impact}
                    </div>

                    {/* Ecosystem Link Button */}
                    {step.cta && (
                        <button 
                            onClick={() => navigate(step.cta!)}
                            className="mt-3 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm active:scale-95"
                        >
                            {step.ctaLabel || "Buka Fitur"} <span className="icon-wrapper w-3 h-3"><FaArrowRight /></span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export const HedeRoadmap: React.FC<HedeRoadmapProps> = ({ roadmap }) => {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6 md:mb-8">
                <span className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center text-xl">
                    <div className="icon-wrapper w-5 h-5"><FaRoad /></div>
                </span>
                <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Roadmap Hijrah</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Langkah taktis menuju harta yang berkah</p>
                </div>
            </div>
            
            {roadmap.length > 0 ? (
                <div className="relative">
                    {roadmap.map((step, idx) => (
                        <RoadmapItem key={idx} step={step} isLast={idx === roadmap.length - 1} index={idx} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <div className="icon-wrapper w-16 h-16 text-indigo-300 mb-4 flex items-center justify-center text-5xl"><FaShieldAlt /></div>
                    <h4 className="font-bold text-slate-700 dark:text-slate-300">Istiqamah!</h4>
                    <p className="text-slate-500 font-medium text-sm mt-1 max-w-xs">Tidak ada langkah korektif yang diperlukan. Pertahankan kondisi ini.</p>
                </div>
            )}
        </div>
    );
};
