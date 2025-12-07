
import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '../../../components/ui/Toast.tsx';

interface UseMushafAudioProps {
    onEnded?: () => void;
}

export const useMushafAudio = ({ onEnded }: UseMushafAudioProps = {}) => {
    const { showToast } = useToast();
    const [playingAyahId, setPlayingAyahId] = useState<number | null>(null);
    const [playingWordId, setPlayingWordId] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Keep onEnded ref current to avoid closure staleness in event listeners
    const onEndedRef = useRef(onEnded);
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    useEffect(() => {
        audioRef.current = new Audio();
        
        const audio = audioRef.current;
        
        const handleTimeUpdate = () => {
            if (audio.duration) {
                const percent = (audio.currentTime / audio.duration) * 100;
                setProgress(percent);
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            if (audio) {
                audio.removeEventListener('timeupdate', handleTimeUpdate);
                audio.onended = null;
                audio.onerror = null;
                audio.pause();
                audio.removeAttribute('src');
            }
        };
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current.removeAttribute('src');
        }
        setIsPlaying(false);
        setPlayingAyahId(null);
        setPlayingWordId(null);
        setProgress(0);
    }, []);

    const playAudio = useCallback(async (url: string, type: 'ayah' | 'word', id: number) => {
        if (!url || !audioRef.current) return;

        // Don't full stop if switching tracks to avoid UI flicker, just pause
        if (audioRef.current) audioRef.current.pause();

        if (type === 'ayah') {
            setPlayingAyahId(id);
            setPlayingWordId(null);
        } else {
            setPlayingWordId(id);
            // Word playback shouldn't clear ayah selection entirely if we want context, 
            // but for now let's keep it simple: either ayah mode or word mode playing.
            setPlayingAyahId(null); 
        }
        
        setIsPlaying(true);
        setProgress(0);

        try {
            audioRef.current.src = url;
            audioRef.current.load();
            
            const playPromise = audioRef.current.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    if (e.name === 'NotSupportedError' || e.message?.includes('supported source')) {
                        showToast("Format audio tidak didukung", "error");
                    }
                    if (e.name !== 'AbortError') {
                        setIsPlaying(false);
                    }
                });
            }
            
            audioRef.current.onended = () => {
                // Logic handled by parent via callback if provided
                if (onEndedRef.current && type === 'ayah') {
                    onEndedRef.current();
                } else {
                    setIsPlaying(false);
                    setPlayingAyahId(null);
                    setPlayingWordId(null);
                    setProgress(0);
                }
            };

            audioRef.current.onerror = () => {
                if (audioRef.current?.src) {
                    showToast("Audio tidak tersedia (Network/404)", "error");
                }
                setIsPlaying(false);
                setPlayingAyahId(null);
                setPlayingWordId(null);
                setProgress(0);
            };

        } catch (err) {
            console.error(err);
            setIsPlaying(false);
            setProgress(0);
        }
    }, [showToast]);

    return {
        isPlaying,
        playingAyahId,
        playingWordId,
        progress,
        playAudio,
        stopAudio
    };
};