// src/hooks/useErrorHandler.ts
import { useState, useCallback } from 'react';

/* ────────────────────────────────────────── *
 *  Strong, specific error interfaces
 * ────────────────────────────────────────── */
interface NetworkError extends Error {
  /** HTTP status code if available (e.g. from axios / fetch) */
  status?: number;
}

interface BlockchainError extends Error {
  /** Most blockchain libs surface the reason in `message` */
  message: string;
}

/* ────────────────────────────────────────── *
 *  App‑level error shape used throughout UI
 * ────────────────────────────────────────── */
export interface AppError {
  id: string;
  message: string;
  type: 'network' | 'validation' | 'authentication' | 'blockchain' | 'unknown';
  timestamp: Date;
  details?: unknown;
  /**
   * If `true` the UI can show a “Try again” button or similar.
   * Defaults to `true` except for explicit non‑retry cases below.
   */
  retryable?: boolean;
}

/**
 * Centralised error handler hook – returns helpers for each category
 * plus the raw list so you can render a global toast stack, etc.
 */
export const useErrorHandler = () => {
  const [errors, setErrors] = useState<AppError[]>([]);

  /*──────────────  CRUD helpers  ──────────────*/

  /** Remove a single error by id */
  const removeError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(err => err.id !== errorId));
  }, []);

  /** Add a new error & optionally auto‑dismiss after 10 s */
  const addError = useCallback(
    (error: Omit<AppError, 'id' | 'timestamp'>) => {
      const newError: AppError = {
        ...error,
        id: `error_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        timestamp: new Date(),
      };

      setErrors(prev => [...prev, newError]);

      // Automatically clear non‑critical errors after 10 seconds
      if (error.type !== 'authentication' && error.type !== 'blockchain') {
        setTimeout(() => {
          setErrors(prev => prev.filter(e => e.id !== newError.id));
        }, 10_000);
      }

      return newError.id;
    },
    [],
  );

  /** Wipe the entire stack (e.g. on route change) */
  const clearAllErrors = useCallback(() => setErrors([]), []);

  /*──────────────  Category helpers  ──────────────*/

  const handleNetworkError = useCallback(
    (error: NetworkError, context?: string) => {
      let message = 'Network connection error';
      let retryable = true;

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        message =
          'Unable to connect to the server. Please check your internet connection.';
      } else if (error.status === 429) {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (error.status && error.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
        retryable = false;
      }

      if (context) message = `${context}: ${message}`;

      return addError({
        message,
        type: 'network',
        details: error,
        retryable,
      });
    },
    [addError],
  );

  const handleValidationError = useCallback(
    (field: string, message: string) =>
      addError({
        message: `${field}: ${message}`,
        type: 'validation',
        retryable: false,
      }),
    [addError],
  );

  const handleBlockchainError = useCallback(
    (error: BlockchainError, operation?: string) => {
      let message = 'Blockchain transaction failed';
      let retryable = true;

      if (error.message.includes('insufficient funds')) {
        message = 'Insufficient funds for this transaction';
        retryable = false;
      } else if (error.message.includes('nonce')) {
        message = 'Transaction nonce error. Please try again.';
      } else if (error.message.includes('gas')) {
        message = 'Gas estimation failed. Please try with different settings.';
      }

      if (operation) message = `${operation}: ${message}`;

      return addError({
        message,
        type: 'blockchain',
        details: error,
        retryable,
      });
    },
    [addError],
  );

  const handleAuthenticationError = useCallback(
    (msg?: string) =>
      addError({
        message:
          msg ?? 'Authentication required. Please connect your wallet.',
        type: 'authentication',
        retryable: true,
      }),
    [addError],
  );

  /*──────────────  Selectors  ──────────────*/

  /** Filter errors by domain */
  const getErrorsByType = useCallback(
    (type: AppError['type']) => errors.filter(err => err.type === type),
    [errors],
  );

  /*──────────────  Derived helpers  ──────────────*/
  const hasErrors = errors.length > 0;
  const latestError = errors.at(-1);

  return {
    // state
    errors,
    hasErrors,
    latestError,

    // CRUD
    addError,
    removeError,
    clearAllErrors,

    // domain‑specific helpers
    handleNetworkError,
    handleValidationError,
    handleBlockchainError,
    handleAuthenticationError,

    // selectors
    getErrorsByType,
  };
};
