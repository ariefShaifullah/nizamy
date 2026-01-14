
import { useRef, useCallback, useState, useEffect } from 'react';

interface UseVisibleAyahOptions {
    threshold?: number;
    rootMargin?: string;
}

/**
 * Tracks which ayah is currently visible in the viewport center using IntersectionObserver.
 * Much more performant than elementFromPoint on every scroll event.
 */
export const useVisibleAyah = <T extends { verse_key: string }>(
    items: T[],
    options: UseVisibleAyahOptions = {}
) => {
    const { threshold = 0.5, rootMargin = '-40% 0px -40% 0px' } = options;

    const [visibleAyah, setVisibleAyah] = useState<T | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const elementsRef = useRef<Map<string, Element>>(new Map());

    // Cleanup function
    const disconnect = useCallback(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
            observerRef.current = null;
        }
    }, []);

    // Create/recreate observer when items change
    useEffect(() => {
        disconnect();

        if (items.length === 0) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                // Find the entry that's most in the viewport center
                let bestEntry: IntersectionObserverEntry | null = null;
                let bestRatio = 0;

                for (const entry of entries) {
                    if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
                        bestRatio = entry.intersectionRatio;
                        bestEntry = entry;
                    }
                }

                if (bestEntry) {
                    const verseKey = bestEntry.target.getAttribute('data-verse-key');
                    if (verseKey) {
                        const ayah = items.find(item => item.verse_key === verseKey);
                        if (ayah) {
                            setVisibleAyah(ayah);
                        }
                    }
                }
            },
            { threshold: [threshold, 0.1, 0.25, 0.75, 1.0], rootMargin }
        );

        // Observe all currently tracked elements
        elementsRef.current.forEach((element) => {
            observerRef.current?.observe(element);
        });

        return disconnect;
    }, [items, threshold, rootMargin, disconnect]);

    // Ref callback for each item element
    const observeElement = useCallback((verseKey: string, element: Element | null) => {
        const currentObserver = observerRef.current;

        if (element) {
            elementsRef.current.set(verseKey, element);
            currentObserver?.observe(element);
        } else {
            const existing = elementsRef.current.get(verseKey);
            if (existing) {
                currentObserver?.unobserve(existing);
                elementsRef.current.delete(verseKey);
            }
        }
    }, []);

    return {
        visibleAyah,
        observeElement,
    };
};
