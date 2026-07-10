import { useState, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Ref pour toujours accéder à la dernière valeur (évite les closures obsolètes
  // quand on appelle setValue plusieurs fois de suite dans une boucle).
  const latestRef = useRef<T>(storedValue);
  latestRef.current = storedValue;

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const next =
          value instanceof Function ? (value as (v: T) => T)(latestRef.current) : value;
        latestRef.current = next;
        setStoredValue(next);
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue] as const;
}
