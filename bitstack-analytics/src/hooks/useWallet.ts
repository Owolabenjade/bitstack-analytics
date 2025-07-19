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

  // Enhanced methods for Commit 7
  const getBalance = async () => {
    if (!address) return null;

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_STACKS_API_URL || 'https://api.testnet.hiro.so';
      const response = await fetch(
        `${apiUrl}/extended/v1/address/${address}/balances`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`);
      }

      const data = await response.json();
      return {
        stx: {
          balance: parseInt(data.stx.balance),
          locked: parseInt(data.stx.locked),
          totalSent: parseInt(data.stx.total_sent),
          totalReceived: parseInt(data.stx.total_received),
        },
        fungibleTokens: data.fungible_tokens,
        nonFungibleTokens: data.non_fungible_tokens,
      };
    } catch (err) {
      console.error('Error fetching balance:', err);
      return null;
    }
  };

  const getNetwork = () => {
    return process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  };

  return {
    connected,
    address,
    userData,
    isLoading,
    error,
    connect,
    disconnect,
    getBalance,
    getNetwork,
  };
};
