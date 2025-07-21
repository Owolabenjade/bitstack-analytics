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

      // Auto-stop loading after timeout (default 30 seconds)
      if (timeout !== 0) {
        const timeoutDuration = timeout || 30000;
        timeoutRefs.current[key] = setTimeout(() => {
          stopLoading(key);
        }, timeoutDuration);
      }
    },
    []
  );

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

  const isLoading = useCallback(
    (key: string) => {
      return loadingStates[key]?.isLoading || false;
    },
    [loadingStates]
  );

  const getLoadingDuration = useCallback(
    (key: string) => {
      const state = loadingStates[key];
      if (!state) return 0;
      return Date.now() - state.startTime;
    },
    [loadingStates]
  );

  const getLoadingOperation = useCallback(
    (key: string) => {
      return loadingStates[key]?.operation;
    },
    [loadingStates]
  );

  const isAnyLoading = Object.keys(loadingStates).length > 0;

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

  // Clean up timeouts on unmount
  const cleanup = useCallback(() => {
    Object.values(timeoutRefs.current).forEach((timeout) => {
      clearTimeout(timeout);
    });
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
