import { useRef, useEffect, useCallback } from 'react';

/**
 * Custom hook for debouncing function calls.
 * Focus: DSA / Async Logic
 * 
 * @param {Function} callback - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - A debounced version of the callback
 */
export function useDebounce(callback, delay) {
    const callbackRef = useRef(callback);
    const timerRef = useRef(null);

    // Keep callback ref up to date to avoid stale closures
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback((...args) => {
        // Clear existing timer (the "debounce" logic)
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Set new timer
        timerRef.current = setTimeout(() => {
            callbackRef.current(...args);
        }, delay);
    }, [delay]);
}
