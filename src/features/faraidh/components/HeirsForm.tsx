import React, { useState, useMemo } from 'react';
import type { Heir } from '../../../types.ts';
import { Heir as HeirEnum } from '../../../types.ts';
import { HEIR_LABELS, HEIR_GROUPS } from '../constants.ts';
import { HeirInput } from './HeirInput.tsx';
import { formatNumber } from '../../../utils.ts';
import { FaCoins, FaCalculator, FaSpinner, FaRedo, FaChevronDown, FaUserFriends, FaCheck, FaMars, FaVenus } from 'react-icons/fa';
import { audioService } from '../../../services/audio.service.ts';
import { useFaraidh } from '../context/FaraidhContext.tsx';

const HeirGroupAccordion: React.FC<{
    title: string;
    heirKeys: Heir[];
    defaultOpen?: boolean;
}> = ({ title, heirKeys, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const { heirs } = useFaraidh();

    const activeCount = heirKeys.reduce((acc, key) => acc + (heirs[key] > 0 ? 1 : 0), 0);

    const toggle = () => {
        audioService.playClick();
        setIsOpen(!isOpen);
    };

    if (heirKeys.length === 0) return null;

    const accordionId = `group-${title.replace(/\s+/g, '-').toLowerCase()}`;

    return (
    <div className={`
    bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden
    ${isOpen
    ? 'border-indigo-200 dark:border-indigo-800 shadow-md ring-1 ring-indigo-100 dark:ring-indigo-900/30'
    : 'border-slate-200 dark:border-slate-700 shadow-sm'
    }
    `}>
    <button
    onClick={toggle}
    aria-expanded={isOpen}
    aria-controls={accordionId}
    className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
    >
                <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold uppercase tracking-wider ${activeCount > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {title}
                    </span>
                    {activeCount > 0 && (
                        <div className="flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded-full animate-fade-in">
                            <FaCheck size={8} /> {activeCount}
                        </div>
                    )}
                </div>
                <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300
                    ${isOpen ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 rotate-180' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}
                `}>
                    <FaChevronDown size={10} />
                </div>
            </button>

            <div id={accordionId} role="region" aria-label={title} className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 pt-0 space-y-2">
                    {heirKeys.map((heirKey) => (
                        <HeirInput
                            key={heirKey}
                            label={HEIR_LABELS[heirKey as Heir]}
                            heirKey={heirKey as Heir}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HeirsForm: React.FC = React.memo(() => {
    const {
    heirs,
    dispatch,
    estate,
    setEstate,
    wasiat,
    setWasiat,
    utang,
    setUtang,
    deceasedGender,
    setDeceasedGender,
    handleCalculate,
    isPending
    } = useFaraidh();

    const formatInputValue = (value: string): string => {
        if (!value) return '';
        const numberValue = parseInt(value.replace(/[^0-9]/g, ''), 10);
        if (isNaN(numberValue)) return '';
        return formatNumber(numberValue);
    };

    /** Converts a number to human-readable Indonesian shorthand */
    const formatReadableAmount = (value: number): string => {
        if (!value || value === 0) return '';
        if (value >= 1_000_000_000_000) {
            const v = value / 1_000_000_000_000;
            return `${Number.isInteger(v) ? v : v.toFixed(1).replace('.0', '')} Triliun`;
        }
        if (value >= 1_000_000_000) {
            const v = value / 1_000_000_000;
            return `${Number.isInteger(v) ? v : v.toFixed(1).replace('.0', '')} Miliar`;
        }
        if (value >= 1_000_000) {
            const v = value / 1_000_000;
            return `${Number.isInteger(v) ? v : v.toFixed(1).replace('.0', '')} Juta`;
        }
        if (value >= 1_000) {
            const v = value / 1_000;
            return `${Number.isInteger(v) ? v : v.toFixed(1).replace('.0', '')} Ribu`;
        }
        return formatNumber(value);
    };

    const handleEstateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        const unformattedValue = rawValue.replace(/\./g, '');
        if (/^\d*$/.test(unformattedValue)) {
            setEstate(unformattedValue);
        }
    };

    const handleGenderChange = (gender: 'male' | 'female') => {
        audioService.playClick();
        setDeceasedGender(gender);

        // Auto-reset logic via Context Dispatch
        if (gender === 'male') {
            if (heirs[HeirEnum.Husband] > 0) {
                dispatch({ type: 'SET_COUNT', payload: { heir: HeirEnum.Husband, count: 0 } });
            }
        } else {
            if (heirs[HeirEnum.Wife] > 0) {
                dispatch({ type: 'SET_COUNT', payload: { heir: HeirEnum.Wife, count: 0 } });
            }
        }
    };

    const totalHeirs = (Object.values(heirs) as number[]).reduce((a, b) => a + b, 0);

 // Live wasiat cap computation for real-time warning
 const estateNum = parseFloat(estate) || 0;
 const utangNum = parseFloat(utang) || 0;
 const wasiatNum = parseFloat(wasiat) || 0;
 const liveWasiatCap = Math.floor(Math.max(0, estateNum - utangNum) / 3);
 const wasiatExceedsCap = wasiatNum > liveWasiatCap && liveWasiatCap > 0;
 const netEstateInvalid = estateNum > 0 && (estateNum - utangNum - wasiatNum) <= 0;

    const visibleGroups = useMemo(() => {
        return HEIR_GROUPS.map(group => ({
            ...group,
            heirs: group.heirs.filter(heir => {
                if (deceasedGender === 'male' && heir === HeirEnum.Husband) return false;
                if (deceasedGender === 'female' && heir === HeirEnum.Wife) return false;
                return true;
            })
        }));
    }, [deceasedGender]);

    return (
        <>
            <div className="flex flex-col gap-6 pb-40 lg:pb-0">

                {/* 1. Deceased Gender Switch */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-1 text-center">
                        Siapa yang Meninggal?
                    </label>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl relative">
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-out border border-slate-200 dark:border-slate-600 ${deceasedGender === 'male' ? 'left-1.5' : 'left-[calc(50%+3px)]'}`}
                        ></div>

                        <button
                            onClick={() => handleGenderChange('male')}
                            className={`flex-1 relative z-raised flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${deceasedGender === 'male' ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <span className="text-lg"><FaMars /></span>
                            Laki-laki
                        </button>
                        <button
                            onClick={() => handleGenderChange('female')}
                            className={`flex-1 relative z-raised flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-colors duration-300 ${deceasedGender === 'female' ? 'text-pink-600 dark:text-pink-300' : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <span className="text-lg"><FaVenus /></span>
                            Perempuan
                        </button>
                    </div>
                    <p className="text-[10px] text-center text-slate-400 mt-2 italic">
                        *Opsi ahli waris pasangan ({deceasedGender === 'male' ? 'Suami' : 'Istri'}) akan disembunyikan otomatis.
                    </p>
                </div>

                {/* 2. Estate Input */}
                <div className="relative group rounded-3xl p-1 bg-linear-to-br from-indigo-100 via-indigo-50 to-white dark:from-indigo-900 dark:via-slate-800 dark:to-slate-900 shadow-xl shadow-indigo-100/50 dark:shadow-none transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-200/50 dark:hover:shadow-none">
                <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[1.4rem] m-px"></div>

                <div className="relative p-6 md:p-8 flex flex-col justify-center h-full overflow-hidden rounded-[1.4rem]">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-[0.03] dark:opacity-[0.05] transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110 pointer-events-none icon-wrapper text-indigo-600 dark:text-indigo-400">
                <FaCoins size={228} />
                </div>

                <label htmlFor="estate" className="block text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-3 ml-1">
                Total Harta Waris (Bruto)
                </label>

                <div className="relative flex items-center">
                <span className="absolute left-0 text-indigo-600 dark:text-indigo-400 font-bold text-2xl md:text-3xl pointer-events-none">Rp</span>
                <input
                type="text"
                inputMode="numeric"
                id="estate"
                value={formatInputValue(estate)}
                onChange={handleEstateChange}
                className="w-full bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 pl-12 pr-4 py-2 text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none transition-colors tracking-tight"
                placeholder="0"
                disabled={isPending}
                />
                </div>
                {estateNum > 0 && (
                <p className="mt-2 text-xs font-semibold text-indigo-500 dark:text-indigo-400 ml-1 animate-fade-in">
                    Rp {formatReadableAmount(estateNum)}
                </p>
                )}
                </div>
                </div>

                {/* 2b. Wasiat & Utang Inputs */}
                <div className="grid grid-cols-2 gap-3">
                {/* Wasiat */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <label htmlFor="wasiat" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-0.5">
                Wasiat (maks 1/3)
                {liveWasiatCap > 0 && (
                    <span className="ml-1 normal-case tracking-normal text-indigo-500 dark:text-indigo-400 font-semibold">
                        · Rp {formatReadableAmount(liveWasiatCap)}
                    </span>
                )}
                </label>
                <div className="relative flex items-center">
                <span className="absolute left-0 text-slate-400 dark:text-slate-500 font-bold text-sm pointer-events-none">Rp</span>
                <input
                type="text"
                inputMode="numeric"
                id="wasiat"
                value={formatInputValue(wasiat)}
                onChange={(e) => {
                const rawValue = e.target.value;
                const unformattedValue = rawValue.replace(/\./g, '');
                if (/^\d*$/.test(unformattedValue)) {
                setWasiat(unformattedValue);
                }
                }}
                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 pl-9 pr-2 py-1.5 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none transition-colors"
                placeholder="0"
                disabled={isPending}
                />
                </div>
                {wasiatNum > 0 && !wasiatExceedsCap && (
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 animate-fade-in">
                    Rp {formatReadableAmount(wasiatNum)}
                </p>
                )}
                {wasiatExceedsCap && (
                <p className="mt-1.5 text-[10px] font-medium text-amber-600 dark:text-amber-400 leading-snug">
                Maks 1/3 = Rp {formatReadableAmount(liveWasiatCap)} ({liveWasiatCap.toLocaleString('id-ID')})
                </p>
                )}
                </div>

                {/* Utang */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                <label htmlFor="utang" className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2 ml-0.5">
                Utang / Pinjaman
                </label>
                <div className="relative flex items-center">
                <span className="absolute left-0 text-slate-400 dark:text-slate-500 font-bold text-sm pointer-events-none">Rp</span>
                <input
                type="text"
                inputMode="numeric"
                id="utang"
                value={formatInputValue(utang)}
                onChange={(e) => {
                const rawValue = e.target.value;
                const unformattedValue = rawValue.replace(/\./g, '');
                if (/^\d*$/.test(unformattedValue)) {
                setUtang(unformattedValue);
                }
                }}
                className="w-full bg-transparent border-b border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 pl-9 pr-2 py-1.5 text-lg font-bold text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none transition-colors"
                placeholder="0"
                disabled={isPending}
                />
                </div>
                {utangNum > 0 && (
                <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 animate-fade-in">
                    Rp {formatReadableAmount(utangNum)}
                </p>
                )}
                </div>
                </div>

                {netEstateInvalid && (
                <p className="text-[11px] font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-xl border border-red-100 dark:border-red-900/30">
                Harta bersih setelah utang dan wasiat harus lebih dari 0.
                </p>
                )}

                {/* 3. Heirs Input */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-2">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg">
                                <FaUserFriends size={14} />
                            </span>
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Ahli Waris</h3>
                        </div>
                        {totalHeirs > 0 && (
                            <span className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                                Total: {totalHeirs} Orang
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {visibleGroups.map((group, index) => (
                            <HeirGroupAccordion
                                key={group.title}
                                title={group.title}
                                heirKeys={group.heirs}
                                defaultOpen={index === 0}
                            />
                        ))}
                    </div>
                </div>

                {/* 4. Desktop Action Buttons */}
                <div className="hidden lg:flex items-center justify-end mt-4 gap-4">
                    {totalHeirs > 0 && (
                        <button
                            onClick={() => {
                                audioService.playClick();
                                dispatch({ type: 'RESET' });
                            }}
                            className="px-6 py-3.5 rounded-xl font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md flex items-center gap-2"
                            disabled={isPending}
                        >
                            <span className="icon-wrapper w-4 h-4"><FaRedo /></span> Reset
                        </button>
                    )}

                    <button
                        onClick={() => {
                            audioService.playSuccess();
                            handleCalculate();
                        }}
                        disabled={isPending}
                        className={`group relative flex items-center justify-center bg-indigo-600 text-white font-bold py-3.5 px-10 rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all transform hover:-translate-y-1 shadow-xl shadow-indigo-500/30 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none`}
                    >
                        {isPending ? (
                            <>
                                <span className="animate-spin -ml-1 mr-3 icon-wrapper w-5 h-5 text-white"><FaSpinner /></span>
                                Memproses...
                            </>
                        ) : (
                            <span className="flex items-center text-lg tracking-wide">
                                Hitung Pembagian
                                <div className="icon-wrapper w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"><FaCalculator /></div>
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* 5. Mobile Fixed Action */}
            <div className="lg:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-navigation px-6 pointer-events-none flex justify-center pb-2">
                <button
                    onClick={() => {
                        audioService.playSuccess();
                        handleCalculate();
                    }}
                    disabled={isPending}
                    className="pointer-events-auto w-full max-w-sm flex items-center justify-center bg-indigo-600/95 backdrop-blur-xl text-white font-bold py-4 px-6 rounded-2xl hover:bg-indigo-700 active:scale-95 transition-all shadow-2xl shadow-indigo-900/30 disabled:bg-slate-500 disabled:cursor-not-allowed border border-white/10 ring-1 ring-black/5"
                >
                    {isPending ? (
                        <span className="animate-spin icon-wrapper w-5 h-5 text-white"><FaSpinner /></span>
                    ) : (
                        <>
                            <div className="icon-wrapper w-5 h-5 mr-3"><FaCalculator /></div>
                            <span className="text-base tracking-wide uppercase">Hitung Pembagian</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );
});