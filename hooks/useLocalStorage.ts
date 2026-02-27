import { useState, useEffect } from 'react';
import { UseLocalStorageReturn } from '@/types';

/**
 * Custom hook for managing localStorage with React state
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [value, setValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load initial value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setValue(JSON.parse(item) as T);
      } else {
        setValue(initialValue);
      }
    } catch (err) {
      console.error(`Error loading ${key} from localStorage:`, err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load from localStorage')
      );
      setValue(initialValue);
    } finally {
      setLoading(false);
    }
  }, [key, initialValue]);

  // Save to localStorage whenever value changes
  useEffect(() => {
    if (loading || value === null) return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      setError(null);
    } catch (err) {
      console.error(`Error saving ${key} to localStorage:`, err);

      if (err instanceof DOMException && err.name === 'QuotaExceededError') {
        setError(new Error('Storage quota exceeded'));
      } else if (err instanceof DOMException && err.name === 'SecurityError') {
        setError(new Error('Storage access denied'));
      } else {
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to save to localStorage')
        );
      }
    }
  }, [key, value, loading]);

  return {
    value,
    setValue,
    loading,
    error
  };
}
