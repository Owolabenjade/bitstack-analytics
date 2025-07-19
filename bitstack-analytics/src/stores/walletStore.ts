import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
  userData: any | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setUserData: (userData: any | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
  reset: () => void;
}

const initialState: WalletState = {
  connected: false,
  address: null,
  network: 'testnet',
  userData: null,
  isLoading: false,
  error: null,
};

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set) => ({
      ...initialState,
      setConnected: (connected) => set({ connected }),
      setAddress: (address) => set({ address }),
      setUserData: (userData) => set({ userData }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      disconnect: () =>
        set({
          connected: false,
          address: null,
          userData: null,
          error: null,
        }),
      reset: () => set(initialState),
    }),
    {
      name: 'wallet-storage',
      partialize: (state) => ({
        connected: state.connected,
        address: state.address,
        userData: state.userData,
        network: state.network,
      }),
    }
  )
);
