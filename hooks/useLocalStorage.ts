/**
 * useLocalStorage — хук для персистентного хранения данных.
 * Автоматически сохраняет в AsyncStorage с debounce.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from storage on mount
  useEffect(() => {
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw) as T;
          setValue(parsed);
        }
      } catch (e) {
        console.warn(`[useLocalStorage] Failed to load ${key}:`, e);
      } finally {
        setIsLoaded(true);
      }
    };

    load();
  }, [key]);

  // Save to storage with debounce
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`[useLocalStorage] Failed to save ${key}:`, e);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [isLoaded, key, value]);

  const update = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => (typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue));
  }, []);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  return { value, update, reset, isLoaded };
}