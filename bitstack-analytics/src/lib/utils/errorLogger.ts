interface ErrorLogEntry {
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  error?: Error;
  context?: Record<string, unknown>; // ← stricter type
  userAgent?: string;
  url?: string;
  userId?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs = 100;

  /* -------------------------------------------------- */
  /* Core logging                                        */
  /* -------------------------------------------------- */

  log(entry: Omit<ErrorLogEntry, 'timestamp' | 'userAgent' | 'url'>) {
    const logEntry: ErrorLogEntry = {
      ...entry,
      timestamp: new Date(),
      userAgent:
        typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.length = this.maxLogs;
    }

    /* dev-console output -------------------------------- */
    if (process.env.NODE_ENV === 'development') {
      const level =
        entry.level === 'error'
          ? 'error'
          : entry.level === 'warning'
            ? 'warn'
            : 'log';
      console[level](
        `[${entry.level.toUpperCase()}]`,
        entry.message,
        entry.error,
        entry.context
      );
    }

    /* production reporting ------------------------------ */
    if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
      this.sendToErrorService(logEntry);
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>) {
    this.log({ level: 'error', message, error, context });
  }

  warning(message: string, context?: Record<string, unknown>) {
    this.log({ level: 'warning', message, context });
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log({ level: 'info', message, context });
  }

  /* -------------------------------------------------- */
  /* Utilities                                           */
  /* -------------------------------------------------- */

  getLogs(level?: ErrorLogEntry['level']): ErrorLogEntry[] {
    return level ? this.logs.filter((l) => l.level === level) : [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /* error stats for dashboards ------------------------- */
  getErrorStats() {
    const errors = this.getLogs('error');
    const warnings = this.getLogs('warning');

    return {
      totalErrors: errors.length,
      totalWarnings: warnings.length,
      recentErrors: errors.slice(0, 5),
      errorsByType: this.groupBy(errors, (l) => l.error?.name ?? 'Unknown'),
      errorsLast24h: errors.filter(
        (l) => Date.now() - l.timestamp.getTime() < 86_400_000
      ).length,
    };
  }

  /* -------------------------------------------------- */
  /* Private helpers                                     */
  /* -------------------------------------------------- */

  private async sendToErrorService(_entry: ErrorLogEntry) {
    try {
      // Example: send to external service
      // await fetch('/api/errors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(_entry) });
    } catch (err) {
      console.error('Failed to send error to logging service:', err);
    }
  }

  private groupBy<T, K extends string | number>(
    arr: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return arr.reduce(
      (groups, item) => {
        const key = keyFn(item);
        (groups[key] ??= []).push(item);
        return groups;
      },
      {} as Record<K, T[]>
    );
  }
}

export const errorLogger = new ErrorLogger();

/* -------------------------------------------------- */
/* Global browser handlers                             */
/* -------------------------------------------------- */

if (typeof window !== 'undefined') {
  window.addEventListener('error', (evt) => {
    errorLogger.error('Global JavaScript Error', evt.error, {
      filename: evt.filename,
      lineno: evt.lineno,
      colno: evt.colno,
    });
  });

  window.addEventListener('unhandledrejection', (evt) => {
    errorLogger.error('Unhandled Promise Rejection', evt.reason as Error, {
      promise: evt.promise,
    });
  });
}
