import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  isLoading: boolean;
  startTime: number;
  operation?: string;
}

export const useLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({});
  const timeoutRefs = useRef<Record<string, NodeJS.Timeout>>({});

  /** Stop a loading state and clear its timeout (if any) */
  const stopLoading = useCallback((key: string) => {
    // Clear timeout if it exists
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    setLoadingStates((prev) => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);

  /** Start (or restart) a loading state, with optional auto-timeout */
  const startLoading = useCallback(
    (key: string, operation?: string, timeout?: number) => {
      setLoadingStates((prev) => ({
        ...prev,
        [key]: {
          isLoading: true,
          startTime: Date.now(),
          operation,
        },
      }));

      // Auto-stop loading after timeout (default 30 s)
      if (timeout !== 0) {
        const timeoutDuration = timeout || 30000;
        timeoutRefs.current[key] = setTimeout(() => {
          stopLoading(key);
        }, timeoutDuration);
      }
    },
    [stopLoading] // ✅ include stopLoading to satisfy hook-lint
  );

  const isLoading = useCallback(
    (key: string) => loadingStates[key]?.isLoading ?? false,
    [loadingStates]
  );

  const getLoadingDuration = useCallback(
    (key: string) => {
      const state = loadingStates[key];
      return state ? Date.now() - state.startTime : 0;
    },
    [loadingStates]
  );

  const getLoadingOperation = useCallback(
    (key: string) => loadingStates[key]?.operation,
    [loadingStates]
  );

  const isAnyLoading = Object.keys(loadingStates).length > 0;

  /** Utility to wrap async ops with automatic loading handling */
  const withLoading = useCallback(
    async <T>(
      key: string,
      operation: () => Promise<T>,
      operationName?: string,
      timeout?: number
    ): Promise<T> => {
      try {
        startLoading(key, operationName, timeout);
        const result = await operation();
        return result;
      } finally {
        stopLoading(key);
      }
    },
    [startLoading, stopLoading]
  );

  /** Clear all outstanding timeouts (e.g., on component unmount) */
  const cleanup = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  }, []);

  return {
    loadingStates,
    isLoading,
    isAnyLoading,
    startLoading,
    stopLoading,
    getLoadingDuration,
    getLoadingOperation,
    withLoading,
    cleanup,
  };
};
