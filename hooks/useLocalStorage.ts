'use client';

import { useSyncExternalStore } from 'react';

/**
 * Hydration-safe localStorage hook using useSyncExternalStore.
 * Avoids setState in useEffect to satisfy React 19 rules and prevent cascading re-renders.
 */
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('local-storage-update', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('local-storage-update', callback);
  };
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const getSnapshot = () => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? item : JSON.stringify(initialValue);
    } catch {
      return JSON.stringify(initialValue);
    }
  };

  const getServerSnapshot = () => {
    return JSON.stringify(initialValue);
  };

  const rawValue = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  let parsedValue: T;
  try {
    parsedValue = JSON.parse(rawValue);
  } catch {
    parsedValue = initialValue;
  }

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(parsedValue) : value;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        window.dispatchEvent(new Event('local-storage-update'));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [parsedValue, setValue, true] as const;
}
