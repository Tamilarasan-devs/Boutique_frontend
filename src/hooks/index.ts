import { useState, useEffect, useCallback } from 'react';

// ─── useDebounce ──────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─── useLocalStorage ─────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      console.warn('useLocalStorage: Failed to set value');
    }
  };

  return [storedValue, setValue] as const;
}

// ─── usePagination ────────────────────────────────────────────────────────────
interface UsePaginationReturn {
  page: number;
  limit: number;
  setPage: (p: number) => void;
  setLimit: (l: number) => void;
  reset: () => void;
}

export function usePagination(initialPage = 1, initialLimit = 10): UsePaginationReturn {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return { page, limit, setPage, setLimit, reset };
}

// ─── useToggle ────────────────────────────────────────────────────────────────
export function useToggle(initial = false): [boolean, () => void, (val: boolean) => void] {
  const [state, setState] = useState(initial);
  const toggle = useCallback(() => setState((s) => !s), []);
  const set = useCallback((val: boolean) => setState(val), []);
  return [state, toggle, set];
}

// ─── useClickOutside ─────────────────────────────────────────────────────────
export function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ─── useWindowSize ────────────────────────────────────────────────────────────
export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ─── useSearch ────────────────────────────────────────────────────────────────
export function useSearch(delay = 400) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, delay);
  const clear = useCallback(() => setQuery(''), []);

  return { query, setQuery, debouncedQuery, clear };
}