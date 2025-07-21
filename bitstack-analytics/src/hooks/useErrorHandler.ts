import { useState, useCallback } from 'react';

export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'authentication' | 'blockchain' | 'unknown';
  timestamp: Date;
  details?: any;
  retryable?: boolean;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = useCallback((error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    setErrors((prev) => [...prev, newError]);

    // Auto-remove error after 10 seconds for non-critical errors
    if (error.type !== 'authentication' && error.type !== 'blockchain') {
      setTimeout(() => {
        removeError(newError.id);
      }, 10000);
    }

    return newError.id;
  }, []);

  const removeError = useCallback((errorId: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== errorId));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const handleNetworkError = useCallback(
    (error: any, context?: string) => {
      let message = 'Network connection error';
      let retryable = true;

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message =
          'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 429) {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
        retryable = false;
      }

      if (context) {
        message = `${context}: ${message}`;
      }

      return addError({
        message,
        type: 'network',
        details: error,
        retryable,
      });
    },
    [addError]
  );

  const handleValidationError = useCallback(
    (field: string, message: string) => {
      return addError({
        message: `${field}: ${message}`,
        type: 'validation',
        retryable: false,
      });
    },
    [addError]
  );

  const handleBlockchainError = useCallback(
    (error: any, operation?: string) => {
      let message = 'Blockchain transaction failed';
      let retryable = true;

      if (error.message?.includes('insufficient funds')) {
        message = 'Insufficient funds for this transaction';
        retryable = false;
      } else if (error.message?.includes('nonce')) {
        message = 'Transaction nonce error. Please try again.';
      } else if (error.message?.includes('gas')) {
        message = 'Gas estimation failed. Please try with different settings.';
      }

      if (operation) {
        message = `${operation}: ${message}`;
      }

      return addError({
        message,
        type: 'blockchain',
        details: error,
        retryable,
      });
    },
    [addError]
  );

  const handleAuthenticationError = useCallback(
    (message?: string) => {
      return addError({
        message:
          message || 'Authentication required. Please connect your wallet.',
        type: 'authentication',
        retryable: true,
      });
    },
    [addError]
  );

  const getErrorsByType = useCallback(
    (type: AppError['type']) => {
      return errors.filter((error) => error.type === type);
    },
    [errors]
  );

  const hasErrors = errors.length > 0;
  const latestError = errors[errors.length - 1];

  return {
    errors,
    hasErrors,
    latestError,
    addError,
    removeError,
    clearAllErrors,
    handleNetworkError,
    handleValidationError,
    handleBlockchainError,
    handleAuthenticationError,
    getErrorsByType,
  };
};
