interface ErrorLogEntry {
  timestamp: Date;
  level: 'error' | 'warning' | 'info';
  message: string;
  error?: Error;
  context?: Record<string, any>;
  userAgent?: string;
  url?: string;
  userId?: string;
}

class ErrorLogger {
  private logs: ErrorLogEntry[] = [];
  private maxLogs: number = 100;

  log(entry: Omit<ErrorLogEntry, 'timestamp' | 'userAgent' | 'url'>) {
    const logEntry: ErrorLogEntry = {
      ...entry,
      timestamp: new Date(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    };

    this.logs.unshift(logEntry);

    // Keep only the most recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const logLevel =
        entry.level === 'error'
          ? 'error'
          : entry.level === 'warning'
            ? 'warn'
            : 'log';
      console[logLevel](
        `[${entry.level.toUpperCase()}]`,
        entry.message,
        entry.error,
        entry.context
      );
    }

    // In production, you might want to send to an error reporting service
    if (process.env.NODE_ENV === 'production' && entry.level === 'error') {
      this.sendToErrorService(logEntry);
    }
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    this.log({ level: 'error', message, error, context });
  }

  warning(message: string, context?: Record<string, any>) {
    this.log({ level: 'warning', message, context });
  }

  info(message: string, context?: Record<string, any>) {
    this.log({ level: 'info', message, context });
  }

  getLogs(level?: 'error' | 'warning' | 'info'): ErrorLogEntry[] {
    if (level) {
      return this.logs.filter((log) => log.level === level);
    }
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private async sendToErrorService(logEntry: ErrorLogEntry) {
    try {
      // Example: Send to external service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry),
      // });
    } catch (err) {
      console.error('Failed to send error to logging service:', err);
    }
  }

  // Get performance metrics for errors
  getErrorStats() {
    const errorLogs = this.getLogs('error');
    const warningLogs = this.getLogs('warning');

    return {
      totalErrors: errorLogs.length,
      totalWarnings: warningLogs.length,
      recentErrors: errorLogs.slice(0, 5),
      errorsByType: this.groupBy(
        errorLogs,
        (log) => log.error?.name || 'Unknown'
      ),
      errorsLast24h: errorLogs.filter(
        (log) => Date.now() - log.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length,
    };
  }

  private groupBy<T, K extends string | number>(
    array: T[],
    keyFn: (item: T) => K
  ): Record<K, T[]> {
    return array.reduce(
      (groups, item) => {
        const key = keyFn(item);
        if (!groups[key]) {
          groups[key] = [];
        }
        groups[key].push(item);
        return groups;
      },
      {} as Record<K, T[]>
    );
  }
}

export const errorLogger = new ErrorLogger();

// Global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    errorLogger.error('Global JavaScript Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    errorLogger.error('Unhandled Promise Rejection', event.reason, {
      promise: event.promise,
    });
  });
}
