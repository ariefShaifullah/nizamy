
import { useState, useEffect, useCallback } from 'react';
import { get, set } from 'idb-keyval';

/**
 * A hook similar to useLocalStorage but persists to IndexedDB (Async).
 * Useful for storing heavy data arrays (History, Logs) to avoid blocking the main thread.
 */
export function useIndexedDB<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadFromDB = async () => {
        try {
            const dbValue = await get<T>(key);
            if (isMounted && dbValue !== undefined) {
                setStoredValue(dbValue);
            }
        } catch (error) {
            console.error(`Error loading key "${key}" from IndexedDB:`, error);
        }
    };

    loadFromDB();

    return () => {
        isMounted = false;
    };
  }, [key]);

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to IndexedDB.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prev) => {
          // Allow value to be a function so we have same API as useState
          const valueToStore = value instanceof Function ? value(prev) : value;
          
          // Save to IDB in background (fire and forget)
          set(key, valueToStore).catch(err => 
              console.error(`Error saving key "${key}" to IndexedDB:`, err)
          );
          
          return valueToStore;
      });
    } catch (error) {
      console.error(`Error setting state for key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}
