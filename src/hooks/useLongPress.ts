
import React, { useCallback, useRef, useState } from "react";

interface LongPressHandlers {
    onMouseDown: (e: React.MouseEvent) => void;
    onMouseUp: (e: React.MouseEvent) => void;
    onMouseLeave: (e: React.MouseEvent) => void;
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onClick: (e: React.MouseEvent) => void;
}

export const useLongPress = (
    onLongPress: (e: React.MouseEvent | React.TouchEvent) => void,
    onClick: (e: React.MouseEvent | React.TouchEvent) => void,
    { shouldPreventDefault = true, delay = 500 } = {}
): LongPressHandlers => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const target = useRef<EventTarget | undefined>(undefined);
    
    // Flags to prevent click execution if other actions happened
    const preventClick = useRef(false);
    
    // Coordinate tracking for scroll detection
    const startCoord = useRef<{ x: number; y: number } | null>(null);

    const start = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            if (shouldPreventDefault && event.target && event.type === 'mousedown') {
               // event.preventDefault(); 
            }
            
            if (event.target) {
                target.current = event.target;
            }
            
            // Reset flags
            setLongPressTriggered(false);
            preventClick.current = false;

            // Track coordinates for touch to detect scrolling
            if ('touches' in event) {
                startCoord.current = { x: event.touches[0].clientX, y: event.touches[0].clientY };
            }

            timeout.current = setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
                preventClick.current = true; // Block the subsequent click
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const move = useCallback((event: React.TouchEvent) => {
        if (!startCoord.current) return;

        const x = event.touches[0].clientX;
        const y = event.touches[0].clientY;
        
        const diffX = Math.abs(x - startCoord.current.x);
        const diffY = Math.abs(y - startCoord.current.y);

        // If moved significantly (>10px), it's a scroll/swipe, not a tap/longpress
        if (diffX > 10 || diffY > 10) {
            preventClick.current = true; // Block click
            if (timeout.current) clearTimeout(timeout.current); // Cancel long press
        }
    }, []);

    const clear = useCallback(
        (_event: React.MouseEvent | React.TouchEvent) => {
            // Clear timer on release
            if (timeout.current) clearTimeout(timeout.current);
            
            // Note: We DO NOT call onClick here anymore.
            // We let the browser fire the native 'click' event, 
            // and we intercept it in the handleClick handler below.
            
            setLongPressTriggered(false);
            startCoord.current = null;
        },
        []
    );

    const handleClick = useCallback(
        (event: React.MouseEvent) => {
            // This is the Native Click event.
            // It fires AFTER onTouchEnd/onMouseUp.
            
            if (preventClick.current) {
                // If it was a long press or a scroll, stop here.
                return;
            }
            
            // Otherwise, it's a genuine tap/short-click
            onClick(event);
        },
        [onClick]
    );

    return {
        onMouseDown: (e: React.MouseEvent) => start(e),
        onTouchStart: (e: React.TouchEvent) => start(e),
        onTouchMove: (e: React.TouchEvent) => move(e),
        onMouseUp: (e: React.MouseEvent) => clear(e),
        onMouseLeave: (e: React.MouseEvent) => {
            if (timeout.current) clearTimeout(timeout.current);
            preventClick.current = true; // Mouse left element, cancel click
        },
        onTouchEnd: (e: React.TouchEvent) => clear(e),
        onClick: (e: React.MouseEvent) => handleClick(e)
    };
};
