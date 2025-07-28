import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface PortfolioAsset {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  averagePrice: number;
  addedAt: Date;
}

export interface Portfolio {
  id: string;
  name: string;
  description: string;
  assets: PortfolioAsset[];
  createdAt: Date;
  updatedAt: Date;
}

interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
  isLoading: boolean;
  error: string | null;
}

interface PortfolioActions {
  createPortfolio: (name: string, description: string) => void;
  deletePortfolio: (portfolioId: string) => void;
  setActivePortfolio: (portfolioId: string | null) => void;
  addAssetToPortfolio: (
    portfolioId: string,
    asset: Omit<PortfolioAsset, 'id' | 'addedAt'>
  ) => void;
  removeAssetFromPortfolio: (portfolioId: string, assetId: string) => void;
  updateAssetAmount: (
    portfolioId: string,
    assetId: string,
    newAmount: number
  ) => void;
  updateAssetPrice: (
    portfolioId: string,
    assetId: string,
    newPrice: number
  ) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearPortfolios: () => void;
}

/* ------------------------------------------------------------------ */
/* Initial state                                                       */
/* ------------------------------------------------------------------ */

const initialState: PortfolioState = {
  portfolios: [],
  activePortfolioId: null,
  isLoading: false,
  error: null,
};

/* ------------------------------------------------------------------ */
/* Store                                                                */
/* ------------------------------------------------------------------ */

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set) => ({
      ...initialState,

      /* ------------------- Portfolio CRUD ------------------------ */
      createPortfolio: (name, description) => {
        const portfolio: Portfolio = {
          id: `portfolio_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          name,
          description,
          assets: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          portfolios: [...state.portfolios, portfolio],
          activePortfolioId: portfolio.id,
        }));
      },

      deletePortfolio: (portfolioId) =>
        set((state) => ({
          portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
          activePortfolioId:
            state.activePortfolioId === portfolioId
              ? null
              : state.activePortfolioId,
        })),

      setActivePortfolio: (portfolioId) =>
        set({ activePortfolioId: portfolioId }),

      /* ------------------- Asset helpers ------------------------ */
      addAssetToPortfolio: (portfolioId, assetData) => {
        const asset: PortfolioAsset = {
          ...assetData,
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          addedAt: new Date(),
        };

        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: [...p.assets, asset],
                  updatedAt: new Date(),
                }
              : p
          ),
        }));
      },

      removeAssetFromPortfolio: (portfolioId, assetId) =>
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: p.assets.filter((a) => a.id !== assetId),
                  updatedAt: new Date(),
                }
              : p
          ),
        })),

      updateAssetAmount: (portfolioId, assetId, newAmount) =>
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: p.assets.map((a) =>
                    a.id === assetId ? { ...a, amount: newAmount } : a
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        })),

      updateAssetPrice: (portfolioId, assetId, newPrice) =>
        set((state) => ({
          portfolios: state.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  assets: p.assets.map((a) =>
                    a.id === assetId ? { ...a, averagePrice: newPrice } : a
                  ),
                  updatedAt: new Date(),
                }
              : p
          ),
        })),

      /* ------------------- Misc helpers ------------------------- */
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearPortfolios: () => set(initialState),
    }),
    {
      name: 'portfolio-storage',
      partialize: (state) => ({
        portfolios: state.portfolios,
        activePortfolioId: state.activePortfolioId,
      }),
    }
  )
);
