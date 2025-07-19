import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

const initialState: PortfolioState = {
  portfolios: [],
  activePortfolioId: null,
  isLoading: false,
  error: null,
};

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createPortfolio: (name, description) => {
        const portfolio: Portfolio = {
          id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

      deletePortfolio: (portfolioId) => {
        set((state) => ({
          portfolios: state.portfolios.filter((p) => p.id !== portfolioId),
          activePortfolioId:
            state.activePortfolioId === portfolioId
              ? null
              : state.activePortfolioId,
        }));
      },

      setActivePortfolio: (portfolioId) => {
        set({ activePortfolioId: portfolioId });
      },

      addAssetToPortfolio: (portfolioId, assetData) => {
        const asset: PortfolioAsset = {
          ...assetData,
          id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          addedAt: new Date(),
        };

        set((state) => ({
          portfolios: state.portfolios.map((portfolio) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  assets: [...portfolio.assets, asset],
                  updatedAt: new Date(),
                }
              : portfolio
          ),
        }));
      },

      removeAssetFromPortfolio: (portfolioId, assetId) => {
        set((state) => ({
          portfolios: state.portfolios.map((portfolio) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  assets: portfolio.assets.filter(
                    (asset) => asset.id !== assetId
                  ),
                  updatedAt: new Date(),
                }
              : portfolio
          ),
        }));
      },

      updateAssetAmount: (portfolioId, assetId, newAmount) => {
        set((state) => ({
          portfolios: state.portfolios.map((portfolio) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  assets: portfolio.assets.map((asset) =>
                    asset.id === assetId
                      ? { ...asset, amount: newAmount }
                      : asset
                  ),
                  updatedAt: new Date(),
                }
              : portfolio
          ),
        }));
      },

      updateAssetPrice: (portfolioId, assetId, newPrice) => {
        set((state) => ({
          portfolios: state.portfolios.map((portfolio) =>
            portfolio.id === portfolioId
              ? {
                  ...portfolio,
                  assets: portfolio.assets.map((asset) =>
                    asset.id === assetId
                      ? { ...asset, averagePrice: newPrice }
                      : asset
                  ),
                  updatedAt: new Date(),
                }
              : portfolio
          ),
        }));
      },

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
