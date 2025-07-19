import { useEffect } from 'react';
import { useWalletStore } from '@/stores/walletStore';
import {
  connectWallet,
  disconnectWallet,
  getUserData,
  getAddress,
  isUserSignedIn,
} from '@/lib/stacks/auth';

export const useWallet = () => {
  const {
    connected,
    address,
    userData,
    isLoading,
    error,
    setConnected,
    setAddress,
    setUserData,
    setLoading,
    setError,
    disconnect: storeDisconnect,
  } = useWalletStore();

  useEffect(() => {
    // Check if user is already signed in on mount
    const checkWalletStatus = () => {
      try {
        setLoading(true);
        const signedIn = isUserSignedIn();

        if (signedIn) {
          const userData = getUserData();
          const address = getAddress();

          setConnected(true);
          setUserData(userData);
          setAddress(address);
        } else {
          setConnected(false);
          setUserData(null);
          setAddress(null);
        }
      } catch (error) {
        console.error('Error checking wallet status:', error);
        setError('Failed to check wallet status');
      } finally {
        setLoading(false);
      }
    };

    checkWalletStatus();
  }, [setConnected, setAddress, setUserData, setLoading, setError]);

  const connect = async () => {
    try {
      setLoading(true);
      setError(null);
      connectWallet();
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setError('Failed to connect wallet');
      setLoading(false);
    }
  };

  const disconnect = async () => {
    try {
      setLoading(true);
      disconnectWallet();
      storeDisconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      setError('Failed to disconnect wallet');
    } finally {
      setLoading(false);
    }
  };

  return {
    connected,
    address,
    userData,
    isLoading,
    error,
    connect,
    disconnect,
  };
};
