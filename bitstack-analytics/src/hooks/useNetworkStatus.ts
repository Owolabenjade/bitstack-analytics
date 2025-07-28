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
  // Guard against SSR: only touch window/navigator on the client
  const isBrowser =
    typeof window !== 'undefined' && typeof navigator !== 'undefined';

  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: isBrowser ? navigator.onLine : true,
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    rtt: 0,
  });

  const [isSlowConnection, setIsSlowConnection] = useState(false);

  const updateNetworkStatus = useCallback(() => {
    if (!isBrowser) return;

    const nav = window.navigator as NavigatorWithConnection;
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    const status: NetworkStatus = {
      isOnline: nav.onLine,
      connectionType: connection?.type ?? 'unknown',
      effectiveType: connection?.effectiveType ?? 'unknown',
      downlink: connection?.downlink ?? 0,
      rtt: connection?.rtt ?? 0,
    };

    setNetworkStatus(status);

    // flag slow links
    const slow =
      status.effectiveType === 'slow-2g' ||
      status.effectiveType === '2g' ||
      (status.downlink > 0 && status.downlink < 1.5);
    setIsSlowConnection(slow);
  }, [isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;

    updateNetworkStatus();

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();
    const handleConnectionChange = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const connection = (navigator as NavigatorWithConnection).connection;
    connection?.addEventListener?.('change', handleConnectionChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      connection?.removeEventListener?.('change', handleConnectionChange);
    };
  }, [updateNetworkStatus, isBrowser]);

  return {
    ...networkStatus,
    isSlowConnection,
    updateNetworkStatus,
  };
};
