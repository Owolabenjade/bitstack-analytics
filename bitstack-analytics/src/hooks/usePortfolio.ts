import {
  usePortfolioStore,
  Portfolio,
  PortfolioAsset,
} from '@/stores/portfolioStore';
import { usePrices } from '@/hooks/usePrices';
import { useMemo, useCallback } from 'react';

/* ────────────────────────────── *
 *  Types used only in this hook
 * ────────────────────────────── */
export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalPnL: number;
  totalPnLPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
}

export interface AssetWithMetrics extends PortfolioAsset {
  currentPrice: number;
  currentValue: number;
  cost: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
  dayChange: number;
  dayChangePercentage: number;
}

/* ────────────────────────────── *
 *  Pure helpers – no React deps
 * ────────────────────────────── */
const calculateAssetMetricsHelper = (
  asset: PortfolioAsset,
  prices: Record<string, any>,
): AssetWithMetrics => {
  const priceData = prices[asset.coinId];
  const currentPrice = priceData?.current_price ?? 0;
  const currentValue = asset.amount * currentPrice;
  const cost = asset.amount * asset.averagePrice;
  const pnl = currentValue - cost;
  const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0;
  const dayChangePct = priceData?.price_change_percentage_24h ?? 0;
  const dayChangeVal = currentValue * (dayChangePct / 100);

  return {
    ...asset,
    currentPrice,
    currentValue,
    cost,
    pnl,
    pnlPercentage,
    allocation: 0, // will be filled later
    dayChange: dayChangeVal,
    dayChangePercentage: dayChangePct,
  };
};

const calculatePortfolioMetricsHelper = (
  portfolio: Portfolio,
  calcAssetMetrics: (asset: PortfolioAsset) => AssetWithMetrics,
): PortfolioMetrics => {
  if (!portfolio.assets.length) {
    return {
      totalValue: 0,
      totalCost: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      dayChange: 0,
      dayChangePercentage: 0,
    };
  }

  const assetsWithMetrics = portfolio.assets.map(calcAssetMetrics);

  const totalValue = assetsWithMetrics.reduce(
    (sum, a) => sum + a.currentValue,
    0,
  );
  const totalCost = assetsWithMetrics.reduce((sum, a) => sum + a.cost, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  const dayChange = assetsWithMetrics.reduce((sum, a) => sum + a.dayChange, 0);
  const dayChangePercentage =
    totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalPnL,
    totalPnLPercentage,
    dayChange,
    dayChangePercentage,
  };
};

/* ────────────────────────────── *
 *  Main hook
 * ────────────────────────────── */
export const usePortfolio = () => {
  const {
    portfolios,
    activePortfolioId,
    isLoading,
    error,
    createPortfolio,
    deletePortfolio,
    setActivePortfolio,
    addAssetToPortfolio,
    removeAssetFromPortfolio,
    updateAssetAmount,
    updateAssetPrice,
    setError,
  } = usePortfolioStore();

  const { prices } = usePrices();

  /* Active portfolio reference */
  const activePortfolio = useMemo(
    () => portfolios.find(p => p.id === activePortfolioId) ?? null,
    [portfolios, activePortfolioId],
  );

  /* Memoised wrappers around the pure helpers */
  const calculateAssetMetrics = useCallback(
    (asset: PortfolioAsset): AssetWithMetrics =>
      calculateAssetMetricsHelper(asset, prices),
    [prices],
  );

  const calculatePortfolioMetrics = useCallback(
    (portfolio: Portfolio): PortfolioMetrics =>
      calculatePortfolioMetricsHelper(portfolio, calculateAssetMetrics),
    [calculateAssetMetrics],
  );

  const getPortfolioWithMetrics = useCallback(
    (portfolio: Portfolio) => {
      const metrics = calculatePortfolioMetrics(portfolio);

      const assetsWithMetrics = portfolio.assets.map(asset => {
        const assetMetrics = calculateAssetMetrics(asset);
        return {
          ...assetMetrics,
          allocation:
            metrics.totalValue > 0
              ? (assetMetrics.currentValue / metrics.totalValue) * 100
              : 0,
        };
      });

      return {
        ...portfolio,
        assets: assetsWithMetrics,
        metrics,
      };
    },
    [calculateAssetMetrics, calculatePortfolioMetrics],
  );

  /* ── Derived data ── */
  const activePortfolioWithMetrics = useMemo(
    () => (activePortfolio ? getPortfolioWithMetrics(activePortfolio) : null),
    [activePortfolio, getPortfolioWithMetrics],
  );

  const portfoliosWithMetrics = useMemo(
    () => portfolios.map(getPortfolioWithMetrics),
    [portfolios, getPortfolioWithMetrics],
  );

  /* ── CRUD helpers ── */
  const createNewPortfolio = (name: string, description = '') => {
    if (!name.trim()) return setError('Portfolio name is required');
    setError(null);
    createPortfolio(name.trim(), description.trim());
  };

  const addAsset = (
    portfolioId: string,
    coinId: string,
    symbol: string,
    name: string,
    amount: number,
    averagePrice: number,
  ) => {
    if (amount <= 0) return setError('Amount must be greater than 0');
    if (averagePrice <= 0) return setError('Price must be greater than 0');

    setError(null);
    addAssetToPortfolio(portfolioId, {
      coinId,
      symbol,
      name,
      amount,
      averagePrice,
    });
  };

  /* ── Exposed API ── */
  return {
    portfolios: portfoliosWithMetrics,
    activePortfolio: activePortfolioWithMetrics,
    activePortfolioId,
    isLoading,
    error,
    createPortfolio: createNewPortfolio,
    deletePortfolio,
    setActivePortfolio,
    addAsset,
    removeAsset: removeAssetFromPortfolio,
    updateAssetAmount,
    updateAssetPrice,
    setError,
  };
};
