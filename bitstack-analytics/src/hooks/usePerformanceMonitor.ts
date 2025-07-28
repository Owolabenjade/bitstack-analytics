import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export const usePerformanceMonitor = () => {
  const metrics = useRef<PerformanceMetric[]>([]);
  const activeMetrics = useRef<Record<string, number>>({});

  const startMeasurement = useCallback(
    (name: string, metadata?: Record<string, unknown>) => {
      const startTime = performance.now();
      activeMetrics.current[name] = startTime;

      metrics.current.push({
        name,
        startTime,
        metadata,
      });

      return name;
    },
    []
  );

  const endMeasurement = useCallback((name: string) => {
    const endTime = performance.now();
    const startTime = activeMetrics.current[name];

    if (startTime) {
      const duration = endTime - startTime;

      // Update the metric
      const metric = metrics.current.find((m) => m.name === name && !m.endTime);
      if (metric) {
        metric.endTime = endTime;
        metric.duration = duration;
      }

      delete activeMetrics.current[name];

      // Log slow operations in development
      if (process.env.NODE_ENV === 'development' && duration > 1000) {
        console.warn(
          `Slow operation detected: ${name} took ${duration.toFixed(2)}ms`
        );
      }

      return duration;
    }

    return 0;
  }, []);

  const measureAsync = useCallback(
    async <T>(
      name: string,
      operation: () => Promise<T>,
      metadata?: Record<string, unknown>
    ): Promise<T> => {
      startMeasurement(name, metadata);
      try {
        const result = await operation();
        return result;
      } finally {
        endMeasurement(name);
      }
    },
    [startMeasurement, endMeasurement]
  );

  const measureSync = useCallback(
    <T>(
      name: string,
      operation: () => T,
      metadata?: Record<string, unknown>
    ): T => {
      startMeasurement(name, metadata);
      try {
        const result = operation();
        return result;
      } finally {
        endMeasurement(name);
      }
    },
    [startMeasurement, endMeasurement]
  );

  const getMetrics = useCallback(() => {
    return metrics.current.filter((m) => m.duration !== undefined);
  }, []);

  const getAverageTime = useCallback((name: string) => {
    const namedMetrics = metrics.current.filter(
      (m) => m.name === name && m.duration
    );
    if (namedMetrics.length === 0) return 0;

    const total = namedMetrics.reduce(
      (sum, metric) => sum + (metric.duration || 0),
      0
    );
    return total / namedMetrics.length;
  }, []);

  const getSlowestOperations = useCallback((limit = 5) => {
    return metrics.current
      .filter((m) => m.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit);
  }, []);

  const clearMetrics = useCallback(() => {
    metrics.current = [];
    activeMetrics.current = {};
  }, []);

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            metrics.current.push({
              name: 'page_load',
              startTime: navEntry.fetchStart,
              endTime: navEntry.loadEventEnd,
              duration: navEntry.loadEventEnd - navEntry.fetchStart,
              metadata: {
                type: 'navigation',
                domContentLoaded:
                  navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
                firstPaint:
                  navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
              },
            });
          }

          if (entry.entryType === 'largest-contentful-paint') {
            metrics.current.push({
              name: 'largest_contentful_paint',
              startTime: 0,
              endTime: entry.startTime,
              duration: entry.startTime,
              metadata: { type: 'web_vital' },
            });
          }

          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEventTiming;
            metrics.current.push({
              name: 'first_input_delay',
              startTime: fidEntry.startTime,
              endTime: fidEntry.startTime + fidEntry.processingStart,
              duration: fidEntry.processingStart,
              metadata: { type: 'web_vital' },
            });
          }
        });
      });

      observer.observe({
        entryTypes: ['navigation', 'largest-contentful-paint', 'first-input'],
      });

      return () => observer.disconnect();
    }
  }, []);

  // Report performance summary
  const getPerformanceSummary = useCallback(() => {
    const completedMetrics = metrics.current.filter(
      (m) => m.duration !== undefined
    );

    return {
      totalMeasurements: completedMetrics.length,
      averageOperationTime:
        completedMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) /
          completedMetrics.length || 0,
      slowestOperations: getSlowestOperations(3),
      webVitals: completedMetrics.filter(
        (m) => m.metadata?.type === 'web_vital'
      ),
    };
  }, [getSlowestOperations]);

  return {
    startMeasurement,
    endMeasurement,
    measureAsync,
    measureSync,
    getMetrics,
    getAverageTime,
    getSlowestOperations,
    getPerformanceSummary,
    clearMetrics,
  };
};
