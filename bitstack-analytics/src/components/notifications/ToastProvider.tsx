'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const ToastProvider = ({
  children,
  maxToasts = 5,
}: ToastProviderProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      // Auto-remove toast after duration
      const duration = toast.duration ?? (toast.type === 'error' ? 8000 : 5000);
      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }

      return id;
    },
    [maxToasts]
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearAllToasts }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const ToastContainer = ({ toasts, onRemove }: ToastContainerProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastItem = ({ toast, onRemove }: ToastItemProps) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`p-4 rounded-lg border shadow-lg ${colors[toast.type]} animate-in slide-in-from-right-full`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`}
        />

        <div className="flex-1">
          {toast.title && <h4 className="font-medium mb-1">{toast.title}</h4>}
          <p className="text-sm">{toast.message}</p>

          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(toast.id)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Convenience hooks
export const useSuccessToast = () => {
  const { addToast } = useToast();
  return useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'success', message, title });
    },
    [addToast]
  );
};

export const useErrorToast = () => {
  const { addToast } = useToast();
  return useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'error', message, title });
    },
    [addToast]
  );
};

export const useWarningToast = () => {
  const { addToast } = useToast();
  return useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'warning', message, title });
    },
    [addToast]
  );
};

export const useInfoToast = () => {
  const { addToast } = useToast();
  return useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'info', message, title });
    },
    [addToast]
  );
};
