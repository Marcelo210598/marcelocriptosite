import { useState, useEffect, useCallback, useRef } from 'react';

interface UseDataOptimizationOptions {
  cacheKey?: string;
  staleTime?: number; // Tempo em ms para considerar dados como stale
  refetchInterval?: number; // Intervalo para refetch automático
  enabled?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface UseDataOptimizationResult<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

// Hook para otimização de carregamento de dados com cache
export function useDataOptimization<T>(
  fetchFunction: () => Promise<T>,
  options: UseDataOptimizationOptions = {}
): UseDataOptimizationResult<T> {
  const {
    cacheKey,
    staleTime = 5 * 60 * 1000, // 5 minutos padrão
    refetchInterval,
    enabled = true,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const staleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para buscar dados
  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Verificar cache primeiro
      if (cacheKey) {
        const cached = cacheRef.current.get(cacheKey);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < staleTime) {
          setData(cached.data);
          setIsLoading(false);
          setIsStale(false);
          return;
        } else if (cached) {
          setIsStale(true);
        }
      }

      // Buscar novos dados com retry
      let retries = 0;
      let lastError: Error | null = null;
      
      while (retries <= retryCount) {
        try {
          const result = await fetchFunction();
          
          setData(result);
          setIsLoading(false);
          setIsError(false);
          setError(null);
          setIsStale(false);

          // Armazenar no cache
          if (cacheKey) {
            cacheRef.current.set(cacheKey, {
              data: result,
              timestamp: Date.now()
            });
          }

          return;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error('Unknown error');
          retries++;
          
          if (retries <= retryCount) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * retries));
          }
        }
      }

      throw lastError;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      setIsError(true);
      setIsLoading(false);
    }
  }, [fetchFunction, cacheKey, staleTime, enabled, retryCount, retryDelay]);

  // Refetch manual
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Configurar intervalo de refetch
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(fetchData, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // Configurar timeout para stale
  useEffect(() => {
    if (data && cacheKey && staleTime) {
      staleTimeoutRef.current = setTimeout(() => {
        setIsStale(true);
      }, staleTime);
    }

    return () => {
      if (staleTimeoutRef.current) {
        clearTimeout(staleTimeoutRef.current);
      }
    };
  }, [data, cacheKey, staleTime]);

  // Buscar dados inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isStale
  };
}

// Hook para debounce de inputs
export function useDebounce<T>(value: T, delay: number): T {
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
}

// Hook para throttle de eventos
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  const lastCallTimer = useRef<NodeJS.Timeout | null>(null);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]) as T;
}

// Hook para monitorar performance
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef(Date.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    
    if (process.env.NODE_ENV === 'development') {
      const endTime = Date.now();
      const renderTime = endTime - startTime.current;
      
      console.log(`[Performance] ${componentName}:`);
      console.log(`  Render time: ${renderTime}ms`);
      console.log(`  Render count: ${renderCount.current}`);
      
      if (renderTime > 100) {
        console.warn(`[Performance Warning] ${componentName} took ${renderTime}ms to render`);
      }
    }
  });

  return {
    renderCount: renderCount.current,
    resetCounter: () => { renderCount.current = 0; }
  };
}