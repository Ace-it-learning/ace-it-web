import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Binary search: last word whose startMs <= currentMs
 */
function wordIndexAtTime(words, currentMs) {
    if (!words?.length || currentMs < 0) return -1;
    let lo = 0;
    let hi = words.length - 1;
    let best = -1;
    while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (words[mid].startMs <= currentMs) {
            best = mid;
            lo = mid + 1;
        } else {
            hi = mid - 1;
        }
    }
    return best;
}

/**
 * Karaoke sync: HTML5 audio clock + pre-computed word timings.
 */
export function useKaraokeSync({ audioUrl, timingsUrl, scrollToWord = true }) {
    const [activeWordIndex, setActiveWordIndex] = useState(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasKaraoke, setHasKaraoke] = useState(false);

    const audioRef = useRef(null);
    const timingsRef = useRef(null);
    const rafRef = useRef(null);
    const lastScrolledIndexRef = useRef(-1);
    const loadPromiseRef = useRef(null);

    const cancelRaf = useCallback(() => {
        if (rafRef.current != null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const scrollActiveWordIntoView = useCallback((idx) => {
        if (!scrollToWord || idx < 0 || idx === lastScrolledIndexRef.current) return;
        lastScrolledIndexRef.current = idx;
        const el = document.getElementById(`word-${idx}`);
        if (el) {
            el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [scrollToWord]);

    const tick = useCallback(() => {
        const audio = audioRef.current;
        const timings = timingsRef.current;
        if (!audio || !timings?.words?.length) return;

        const currentMs = audio.currentTime * 1000;
        const idx = wordIndexAtTime(timings.words, currentMs);
        if (idx !== -1) {
            setActiveWordIndex((prev) => {
                if (prev === idx) return prev;
                scrollActiveWordIntoView(idx);
                return idx;
            });
        }

        if (!audio.paused && !audio.ended) {
            rafRef.current = requestAnimationFrame(tick);
        }
    }, [scrollActiveWordIntoView]);

    const ensureLoaded = useCallback(async () => {
        if (!audioUrl || !timingsUrl) {
            setHasKaraoke(false);
            return false;
        }
        if (timingsRef.current && audioRef.current) {
            setHasKaraoke(true);
            return true;
        }
        if (loadPromiseRef.current) return loadPromiseRef.current;

        loadPromiseRef.current = (async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(timingsUrl);
                if (!res.ok) throw new Error(`Timings not found: ${timingsUrl}`);
                const timings = await res.json();
                if (!timings?.words?.length) throw new Error('Invalid timings file');

                const audio = new Audio(audioUrl);
                audio.preload = 'auto';

                timingsRef.current = timings;
                audioRef.current = audio;
                setHasKaraoke(true);
                return true;
            } catch (err) {
                console.error('[useKaraokeSync] Load failed:', err);
                setError(err.message || 'Failed to load karaoke assets');
                setHasKaraoke(false);
                return false;
            } finally {
                setIsLoading(false);
                loadPromiseRef.current = null;
            }
        })();

        return loadPromiseRef.current;
    }, [audioUrl, timingsUrl]);

    const stop = useCallback(() => {
        cancelRaf();
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            audio.onended = null;
            audio.onerror = null;
        }
        setIsPlaying(false);
        setActiveWordIndex(-1);
        lastScrolledIndexRef.current = -1;
    }, [cancelRaf]);

    const play = useCallback(async () => {
        const ok = await ensureLoaded();
        if (!ok) return false;

        const audio = audioRef.current;
        if (!audio) return false;

        cancelRaf();
        audio.pause();
        audio.currentTime = 0;
        setActiveWordIndex(0);
        lastScrolledIndexRef.current = -1;
        scrollActiveWordIntoView(0);
        audio.onended = () => {
            cancelRaf();
            setIsPlaying(false);
            setActiveWordIndex(-1);
            lastScrolledIndexRef.current = -1;
        };
        audio.onerror = () => {
            cancelRaf();
            setIsPlaying(false);
            setError('Audio playback failed');
        };

        try {
            await audio.play();
            setIsPlaying(true);
            rafRef.current = requestAnimationFrame(tick);
            return true;
        } catch (err) {
            console.error('[useKaraokeSync] Play failed:', err);
            setError(err.message || 'Playback blocked');
            setIsPlaying(false);
            return false;
        }
    }, [ensureLoaded, cancelRaf, tick, scrollActiveWordIntoView]);

    const toggle = useCallback(async () => {
        if (isPlaying) {
            stop();
            return;
        }
        return play();
    }, [isPlaying, stop, play]);

    useEffect(() => {
        timingsRef.current = null;
        loadPromiseRef.current = null;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        setHasKaraoke(Boolean(audioUrl && timingsUrl));
        setActiveWordIndex(-1);
        setError(null);
        lastScrolledIndexRef.current = -1;
    }, [audioUrl, timingsUrl]);

    useEffect(() => () => {
        cancelRaf();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
        }
    }, [cancelRaf]);

    return {
        activeWordIndex,
        isPlaying,
        isLoading,
        error,
        hasKaraoke,
        play,
        stop,
        toggle,
        ensureLoaded,
    };
}
