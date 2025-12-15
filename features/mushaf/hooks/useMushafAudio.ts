
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
    
    // Lazy initialization ref
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Keep onEnded ref current to avoid closure staleness in event listeners
    const onEndedRef = useRef(onEnded);
    useEffect(() => {
        onEndedRef.current = onEnded;
    }, [onEnded]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.removeAttribute('src');
                audioRef.current = null;
            }
        };
    }, []);

    const stopAudio = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setPlayingAyahId(null);
        setPlayingWordId(null);
        setProgress(0);
    }, []);

    const playAudio = useCallback(async (url: string, type: 'ayah' | 'word', id: number) => {
        if (!url) return;

        // Lazy Initialize Audio on first user interaction
        if (!audioRef.current) {
            audioRef.current = new Audio();
            
            // Attach permanent listeners
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current && audioRef.current.duration) {
                    const percent = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                    setProgress(percent);
                }
            });
        }

        const audio = audioRef.current;

        // Ensure clean state before playing new track
        audio.pause();

        if (type === 'ayah') {
            setPlayingAyahId(id);
            setPlayingWordId(null);
        } else {
            setPlayingWordId(id);
            // In Word mode, we don't necessarily want to clear Ayah ID if we want to keep context, 
            // but for simple playback logic, we focus on what is playing.
            setPlayingAyahId(null); 
        }
        
        setIsPlaying(true);
        setProgress(0);

        try {
            audio.src = url;
            // Vital: load() resets the media element and prepares it for new playback
            audio.load();
            
            const playPromise = audio.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(e => {
                    // Ignore abort errors which happen if user clicks multiple items quickly
                    if (e.name === 'AbortError') return;

                    if (e.name === 'NotAllowedError') {
                        showToast("Autoplay diblokir browser. Silakan ketuk lagi.", "info");
                    } else if (e.name === 'NotSupportedError' || e.message?.includes('supported source')) {
                        showToast("Format audio tidak didukung", "error");
                    } else {
                        console.error("Audio Play Error:", e);
                    }
                    
                    setIsPlaying(false);
                    setPlayingAyahId(null);
                    setPlayingWordId(null);
                });
            }
            
            audio.onended = () => {
                if (onEndedRef.current && type === 'ayah') {
                    onEndedRef.current();
                } else {
                    setIsPlaying(false);
                    setPlayingAyahId(null);
                    setPlayingWordId(null);
                    setProgress(0);
                }
            };

            audio.onerror = (e) => {
                console.error("Audio Error Event:", e);
                // Only show toast if source was actually set
                if (audio.src) {
                    showToast("Gagal memuat audio (Network/404)", "error");
                }
                setIsPlaying(false);
                setPlayingAyahId(null);
                setPlayingWordId(null);
                setProgress(0);
            };

        } catch (err) {
            console.error("Sync Audio Error:", err);
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
