import { useState, useEffect, useCallback } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
}

interface NavigatorConnection {
  type?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  addEventListener?: (type: string, listener: EventListener) => void;
  removeEventListener?: (type: string, listener: EventListener) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnection;
  mozConnection?: NavigatorConnection;
  webkitConnection?: NavigatorConnection;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  const [isSlowConnection, setIsSlowConnection] = useState(false);

  const updateNetworkStatus = useCallback(() => {
    const navigator = window.navigator as NavigatorWithConnection;
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const status: NetworkStatus = {
      isOnline: navigator.onLine,
      connectionType: connection?.type || 'unknown',
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
    };

    setNetworkStatus(status);

    // Detect slow connections
    const isSlow =
      status.effectiveType === 'slow-2g' ||
      status.effectiveType === '2g' ||
      (status.downlink > 0 && status.downlink < 1.5);
    setIsSlowConnection(isSlow);
  }, []);

  useEffect(() => {
    updateNetworkStatus();

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as NavigatorWithConnection).connection;
    if (connection) {
      connection.addEventListener('change', handleConnectionChange);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange);
      }
    };
  }, [updateNetworkStatus]);

  return {
    ...networkStatus,
    isSlowConnection,
    updateNetworkStatus,
  };
};
