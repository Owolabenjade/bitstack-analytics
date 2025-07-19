import { create } from 'zustand';

export interface PriceData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
}

interface PriceState {
  prices: Record<string, PriceData>;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface PriceActions {
  setPrices: (prices: Record<string, PriceData>) => void;
  setPrice: (id: string, price: PriceData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;
  clearPrices: () => void;
}

const initialState: PriceState = {
  prices: {},
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const usePriceStore = create<PriceState & PriceActions>((set) => ({
  ...initialState,
  setPrices: (prices) => set({ prices, lastUpdated: new Date() }),
  setPrice: (id, price) =>
    set((state) => ({
      prices: { ...state.prices, [id]: price },
      lastUpdated: new Date(),
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  clearPrices: () => set(initialState),
}));
