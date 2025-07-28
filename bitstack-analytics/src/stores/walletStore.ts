import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** Minimal Blockstack/Connect user data we care about */
interface UserData {
  profile?: {
    stxAddress?: {
      testnet?: string;
      mainnet?: string;
    };
    name?: string;
  };
  authResponseToken?: string;
  appPrivateKey?: string;
  identityAddress?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: 'mainnet' | 'testnet';
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletActions {
  setConnected: (connected: boolean) => void;
  setAddress: (address: string | null) => void;
  setUserData: (userData: UserData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
  reset: () => void;
}

/* ------------------------------------------------------------------ */
/* Initial state                                                       */
/* ------------------------------------------------------------------ */

const initialState: WalletState = {
  connected: false,
  address: null,
  network:
    (process.env.NEXT_PUBLIC_STACKS_NETWORK as 'mainnet' | 'testnet') ??
    'testnet',
  userData: null,
  isLoading: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/* Store                                                                */
/* ------------------------------------------------------------------ */

export const useWalletStore = create<WalletState & WalletActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      /* setters ---------------------------------------------------- */
      setConnected: (connected) => set({ connected }),
      setAddress: (address) => set({ address }),
      setUserData: (userData) => set({ userData }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      /* helpers ---------------------------------------------------- */
      disconnect: () =>
        set({
          connected: false,
          address: null,
          userData: null,
          error: null,
        }),

      reset: () => set({ ...initialState }),
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
