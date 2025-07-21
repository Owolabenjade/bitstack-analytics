'use client';

import { useState, useEffect } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { errorLogger } from '@/lib/utils/errorLogger';
import {
  Activity,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Zap,
  BarChart3,
  X,
} from 'lucide-react';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceDashboard = ({
  isOpen,
  onClose,
}: PerformanceDashboardProps) => {
  const { getPerformanceSummary, getMetrics, clearMetrics } =
    usePerformanceMonitor();
  const { errors, clearAllErrors } = useErrorHandler();
  const {
    isOnline,
    isSlowConnection,
    connectionType,
    effectiveType,
    downlink,
    rtt,
  } = useNetworkStatus();
  const [summary, setSummary] = useState(getPerformanceSummary());

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setSummary(getPerformanceSummary());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, getPerformanceSummary]);

  if (!isOpen) return null;

  const errorStats = errorLogger.getErrorStats();
  const metrics = getMetrics();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Network Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              Network Status
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Connection:</span>
                <span>{connectionType}</span>
              </div>
              <div className="flex justify-between">
                <span>Speed:</span>
                <span
                  className={
                    isSlowConnection ? 'text-orange-600' : 'text-green-600'
                  }
                >
                  {effectiveType}
                </span>
              </div>
              {downlink > 0 && (
                <div className="flex justify-between">
                  <span>Downlink:</span>
                  <span>{downlink.toFixed(1)} Mbps</span>
                </div>
              )}
              {rtt > 0 && (
                <div className="flex justify-between">
                  <span>RTT:</span>
                  <span>{rtt}ms</span>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-blue-500" />
              Performance
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Operations:</span>
                <span>{summary.totalMeasurements}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Duration:</span>
                <span>{summary.averageOperationTime.toFixed(1)}ms</span>
              </div>
              <div className="flex justify-between">
                <span>Web Vitals:</span>
                <span>{summary.webVitals.length}</span>
              </div>
            </div>

            {summary.slowestOperations.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Slowest Operations:
                </div>
                {summary.slowestOperations.slice(0, 3).map((op, i) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="truncate">{op.name}</span>
                    <span>{op.duration?.toFixed(1)}ms</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Errors
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Errors:</span>
                <span className="text-red-600">{errorStats.totalErrors}</span>
              </div>
              <div className="flex justify-between">
                <span>Warnings:</span>
                <span className="text-orange-600">
                  {errorStats.totalWarnings}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last 24h:</span>
                <span>{errorStats.errorsLast24h}</span>
              </div>
              <div className="flex justify-between">
                <span>Active:</span>
                <span>{errors.length}</span>
              </div>
            </div>

            {errorStats.recentErrors.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  Recent Errors:
                </div>
                {errorStats.recentErrors.slice(0, 2).map((error, i) => (
                  <div key={i} className="text-xs text-red-600 truncate">
                    {error.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Metrics */}
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2 lg:col-span-3">
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Recent Metrics
            </h3>

            {metrics.length === 0 ? (
              <p className="text-sm text-gray-500">No metrics recorded yet</p>
            ) : (
              <div className="grid gap-2 max-h-32 overflow-y-auto">
                {metrics
                  .slice(-10)
                  .reverse()
                  .map((metric, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center text-sm py-1 border-b border-gray-200 last:border-b-0"
                    >
                      <span className="font-mono text-xs">{metric.name}</span>
                      <span className="text-gray-600">
                        {metric.duration?.toFixed(2)}ms
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t bg-gray-50 flex gap-3">
          <button
            onClick={() => {
              clearMetrics();
              clearAllErrors();
              errorLogger.clearLogs();
              setSummary(getPerformanceSummary());
            }}
            className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors text-sm"
          >
            Clear All Data
          </button>

          <button
            onClick={() => {
              const data = {
                performance: summary,
                errors: errorStats,
                network: { isOnline, connectionType, effectiveType },
                metrics: metrics.slice(-20),
              };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors text-sm"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

// Debug hotkey to open performance dashboard
export const usePerformanceDebugHotkey = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + P to open performance dashboard
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'P'
      ) {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    if (process.env.NODE_ENV === 'development') {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return { isOpen, setIsOpen };
};
