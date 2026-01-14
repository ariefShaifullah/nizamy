import React, { useCallback } from 'react';
import type { QuranWord, QuranAyah } from '../../../types.ts';
import { useLongPress } from '../../../hooks/useLongPress.ts';
import { isSafari } from '../../../utils.ts';

interface WordItemProps {
    word: QuranWord;
    tajwidRules: any[];
    parentAyah: QuranAyah;
    isActive: boolean;
    wordMode: boolean;
    fontSize: number;
    onTap: (word: QuranWord) => void;
    onLongPress: (word: QuranWord, parentAyah: QuranAyah) => void;
}

/**
 * Renders a single word from an ayah with interactive features.
 * Supports word-by-word audio playback, tajwid coloring, and tap/longpress gestures.
 */
export const WordItem: React.FC<WordItemProps> = React.memo(({
    word,
    tajwidRules,
    parentAyah,
    isActive,
    wordMode,
    fontSize,
    onTap,
    onLongPress
}) => {
    const handleTap = useCallback(() => {
        onTap(word);
    }, [onTap, word]);

    const handleLongPress = useCallback(() => {
        onLongPress(word, parentAyah);
    }, [onLongPress, word, parentAyah]);

    const wordGestures = useLongPress(
        handleLongPress,
        handleTap,
        { delay: 300, shouldPreventDefault: true }
    );

    if (word.char_type_name === 'end') return null;

    const isWaqaf = word.char_type_name === 'pause';
    const isInteractive = word.char_type_name === 'word' && !!word.audio_url;

    // Render waqf (pause) markers
    if (isWaqaf) {
        return (
            <span
                className="inline-block text-amber-600 dark:text-amber-500 pointer-events-none px-1 opacity-80 select-none relative -top-[0.4em]"
                style={{ fontSize: `${fontSize * 0.55}px`, fontFamily: '"Amiri", serif' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    // Render non-interactive words
    if (!isInteractive) {
        return (
            <span
                className="inline-block text-slate-800 dark:text-slate-100 px-0.5 select-none"
                style={{ fontFamily: '"Amiri", serif' }}
            >
                {word.text_uthmani}
            </span>
        );
    }

    // Render colored text with tajwid highlighting
    const renderColoredText = () => {
        if (isSafari || !wordMode || tajwidRules.length === 0) {
            return word.text_uthmani;
        }

        const chars = word.text_uthmani.split('');
        return chars.map((char, i) => {
            const rule = tajwidRules.find(r => r.indexes.includes(i));
            if (rule) {
                return <span key={i} className={`${rule.color}`}>{char}</span>;
            }
            return <span key={i}>{char}</span>;
        });
    };

    return (
        <span
            {...(wordMode ? wordGestures : {})}
            onContextMenu={(e) => e.preventDefault()}
            className={`
        inline-block rounded-lg transition-all duration-200 select-none cursor-pointer
        relative
        ${wordMode ? 'py-1 my-0.5' : 'py-0 my-0'} 
        ${isActive
                    ? 'bg-teal-50 dark:bg-teal-900/50 text-teal-800 dark:text-teal-200 px-2 mx-1 shadow-sm ring-1 ring-teal-200 dark:ring-teal-800 rounded-xl'
                    : wordMode
                        ? 'hover:text-teal-600 dark:hover:text-teal-400 active:scale-95 px-1 mx-0.5 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                        : 'text-slate-800 dark:text-slate-100 px-0.5 mx-0.5'
                }
      `}
            style={{ fontFamily: '"Amiri", serif' }}
        >
            {renderColoredText()}
        </span>
    );
}, (prev, next) => {
    return (
        prev.isActive === next.isActive &&
        prev.wordMode === next.wordMode &&
        prev.fontSize === next.fontSize &&
        prev.word.id === next.word.id &&
        prev.onTap === next.onTap &&
        prev.onLongPress === next.onLongPress
    );
});
