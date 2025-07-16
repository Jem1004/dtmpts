// Comprehensive React hooks library
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { debounce, throttle } from './utils';
import logger from './logger';
import cache from './cache';
import { appConfig } from './config';

// Types
interface UseApiOptions {
  immediate?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  retries?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
  maxLimit?: number;
}

interface UseSearchOptions {
  minQueryLength?: number;
  debounceMs?: number;
  immediate?: boolean;
}

// API hook
export const useApi = <T = any>(
  url: string | (() => string),
  options: UseApiOptions = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    immediate = true,
    cacheKey,
    cacheTTL = 300,
    retries = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
  } = options;

  const fetchData = useCallback(async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const requestUrl = typeof url === 'function' ? url() : url;
      
      // Check cache first
      if (cacheKey) {
        const cached = await cache.get(cacheKey);
        if (cached) {
          setData(cached);
          setLoading(false);
          onSuccess?.(cached);
          return cached;
        }
      }
      
      const response = await fetch(requestUrl, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Cache the result
      if (cacheKey) {
        await cache.set(cacheKey, result, cacheTTL);
      }
      
      setData(result);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      
      if (error.name === 'AbortError') {
        return;
      }
      
      if (retryCount < retries) {
        setTimeout(() => fetchData(retryCount + 1), retryDelay * (retryCount + 1));
        return;
      }
      
      const requestUrl = typeof url === 'function' ? url() : url;
      setError(error);
      onError?.(error);
      logger.error('API fetch error:', { url: requestUrl, error: error.message });
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, cacheTTL, retries, retryDelay, onSuccess, onError]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T | ((prevData: T | null) => T)) => {
    setData(prevData => 
      typeof newData === 'function' ? (newData as any)(prevData) : newData
    );
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
};

// Form hook
export const useForm = <T extends Record<string, any>>(
  options: UseFormOptions<T>
) => {
  const {
    initialValues,
    validationSchema,
    onSubmit,
    validateOnChange = false,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const validate = useCallback((valuesToValidate: T): Partial<Record<keyof T, string>> => {
    if (!validationSchema) return {} as Partial<Record<keyof T, string>>;
    
    try {
      validationSchema.parse(valuesToValidate);
      return {} as Partial<Record<keyof T, string>>;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<Record<keyof T, string>> = {};
        error.issues.forEach(err => {
          const field = err.path[0] as keyof T;
          if (field) {
            fieldErrors[field] = err.message;
          }
        });
        return fieldErrors;
      }
      return {} as Partial<Record<keyof T, string>>;
    }
  }, [validationSchema]);

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    
    if (validateOnChange) {
      const newValues = { ...values, [field]: value };
      const fieldErrors = validate(newValues);
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] || undefined }));
    }
  }, [values, validate, validateOnChange]);

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
    
    if (validateOnBlur && isTouched) {
      const fieldErrors = validate(values);
      setErrors(prev => ({ ...prev, [field]: fieldErrors[field] || undefined }));
    }
  }, [values, validate, validateOnBlur]);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    setSubmitCount(prev => prev + 1);
    
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    
    if (Object.keys(fieldErrors).length > 0) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      logger.error('Form submission error:', error as Error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  const getFieldProps = useCallback((field: keyof T) => ({
    name: field as string,
    value: values[field] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setFieldValue(field, e.target.value);
    },
    onBlur: () => setFieldTouched(field),
    error: touched[field] && errors[field],
  }), [values, touched, errors, setFieldValue, setFieldTouched]);

  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitCount,
    isValid,
    isDirty,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    handleSubmit,
    getFieldProps,
  };
};

// Pagination hook
export const usePagination = (options: UsePaginationOptions = {}) => {
  const {
    initialPage = 1,
    initialLimit = appConfig.pagination.defaultLimit,
    maxLimit = appConfig.pagination.maxLimit,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(Math.min(initialLimit, maxLimit));
  const [total, setTotal] = useState(0);

  const totalPages = useMemo(() => {
    return Math.ceil(total / limit);
  }, [total, limit]);

  const hasNextPage = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  const hasPrevPage = useMemo(() => {
    return page > 1;
  }, [page]);

  const offset = useMemo(() => {
    return (page - 1) * limit;
  }, [page, limit]);

  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setPage(prev => prev - 1);
    }
  }, [hasPrevPage]);

  const changeLimit = useCallback((newLimit: number) => {
    const validLimit = Math.min(newLimit, maxLimit);
    setLimit(validLimit);
    setPage(1); // Reset to first page when changing limit
  }, [maxLimit]);

  const reset = useCallback(() => {
    setPage(initialPage);
    setLimit(initialLimit);
    setTotal(0);
  }, [initialPage, initialLimit]);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage,
    hasPrevPage,
    offset,
    setPage: goToPage,
    setLimit: changeLimit,
    setTotal,
    nextPage,
    prevPage,
    reset,
  };
};

// Search hook
export const useSearch = (options: UseSearchOptions = {}) => {
  const {
    minQueryLength = appConfig.search.minQueryLength,
    debounceMs = 300,
    immediate = false,
  } = options;

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSetQuery = useMemo(
    () => debounce((value: string) => {
      setDebouncedQuery(value);
      setIsSearching(false);
    }, debounceMs),
    [debounceMs]
  );

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.length >= minQueryLength) {
      setIsSearching(true);
      debouncedSetQuery(newQuery);
    } else {
      setDebouncedQuery('');
      setIsSearching(false);
    }
  }, [minQueryLength, debouncedSetQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
  }, []);

  const isValidQuery = useMemo(() => {
    return query.length >= minQueryLength;
  }, [query, minQueryLength]);

  useEffect(() => {
    if (immediate && query) {
      updateQuery(query);
    }
  }, [immediate, query, updateQuery]);

  return {
    query,
    debouncedQuery,
    isSearching,
    isValidQuery,
    updateQuery,
    clearSearch,
  };
};

// Local storage hook
export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error('Error reading from localStorage:', error as Error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      logger.error('Error writing to localStorage:', error as Error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      logger.error('Error removing from localStorage:', error as Error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

// Debounced value hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttled value hook
export const useThrottle = <T>(value: T, delay: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    
    if (now - lastUpdated.current >= delay) {
      setThrottledValue(value);
      lastUpdated.current = now;
      return;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, delay - (now - lastUpdated.current));
      
      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
};

// Previous value hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
};

// Toggle hook
export const useToggle = (initialValue = false): [boolean, () => void, (value?: boolean) => void] => {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  const setToggle = useCallback((newValue?: boolean) => {
    setValue(newValue ?? !value);
  }, [value]);
  
  return [value, toggle, setToggle];
};

// Counter hook
export const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  
  const increment = useCallback((step = 1) => {
    setCount(prev => prev + step);
  }, []);
  
  const decrement = useCallback((step = 1) => {
    setCount(prev => prev - step);
  }, []);
  
  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);
  
  return {
    count,
    increment,
    decrement,
    reset,
    setCount,
  };
};

// Intersection observer hook
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([observerEntry]) => {
        if (observerEntry) {
          setIsIntersecting(observerEntry.isIntersecting);
          setEntry(observerEntry);
        }
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return {
    ref: elementRef,
    isIntersecting,
    entry,
  };
};

// Media query hook
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

// Window size hook
export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = throttle(() => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 100);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

// Router hook extensions
export const useRouterUtils = () => {
  const router = useRouter();
  
  const navigateWithConfirm = useCallback((url: string, message?: string) => {
    const shouldNavigate = message ? confirm(message) : true;
    if (shouldNavigate) {
      router.push(url);
    }
  }, [router]);
  
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);
  
  return {
    ...router,
    navigateWithConfirm,
    goBack,
  };
};

// Export all hooks
export default {
  useApi,
  useForm,
  usePagination,
  useSearch,
  useLocalStorage,
  useDebounce,
  useThrottle,
  usePrevious,
  useToggle,
  useCounter,
  useIntersectionObserver,
  useMediaQuery,
  useWindowSize,
  useRouterUtils,
};