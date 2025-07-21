'use client';

import { useState, useCallback, ReactNode } from 'react';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface RetryWrapperProps {
  children: ReactNode;
  onRetry: () => Promise<void> | void;
  error?: Error | null;
  isLoading?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showNetworkStatus?: boolean;
}

export const RetryWrapper = ({
  children,
  onRetry,
  error,
  isLoading = false,
  maxRetries = 3,
  retryDelay = 1000,
  showNetworkStatus = true,
}: RetryWrapperProps) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const { isOnline, isSlowConnection } = useNetworkStatus();

  const handleRetry = useCallback(async () => {
    if (retryCount >= maxRetries) return;

    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      // Add delay for retry
      if (retryDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * retryCount)
        );
      }

      await onRetry();
    } catch (err) {
      console.error('Retry failed:', err);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, retryCount, maxRetries, retryDelay]);

  const canRetry = retryCount < maxRetries && !isLoading && !isRetrying;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-1">
              Something went wrong
            </h3>
            <p className="text-sm text-red-700 mb-3">
              {error.message || 'An unexpected error occurred'}
            </p>

            {showNetworkStatus && (
              <div className="flex items-center gap-2 mb-3 text-xs">
                {isOnline ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="h-3 w-3" />
                    <span>Online</span>
                    {isSlowConnection && (
                      <span className="text-amber-600">(Slow connection)</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff className="h-3 w-3" />
                    <span>Offline</span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleRetry}
                disabled={!canRetry || !isOnline}
                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded transition-colors ${
                  canRetry && isOnline
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw
                  className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`}
                />
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>

              {retryCount > 0 && (
                <span className="text-xs text-red-600">
                  Attempt {retryCount}/{maxRetries}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
