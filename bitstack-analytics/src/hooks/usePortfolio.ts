import {
  usePortfolioStore,
  Portfolio,
  PortfolioAsset,
} from '@/stores/portfolioStore';
import { usePrices } from '@/hooks/usePrices';
import { useMemo } from 'react';

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

  const activePortfolio = useMemo(() => {
    return portfolios.find((p) => p.id === activePortfolioId) || null;
  }, [portfolios, activePortfolioId]);

  const calculateAssetMetrics = (asset: PortfolioAsset): AssetWithMetrics => {
    const priceData = prices[asset.coinId];
    const currentPrice = priceData?.current_price || 0;
    const currentValue = asset.amount * currentPrice;
    const cost = asset.amount * asset.averagePrice;
    const pnl = currentValue - cost;
    const pnlPercentage = cost > 0 ? (pnl / cost) * 100 : 0;
    const dayChange = priceData?.price_change_percentage_24h || 0;
    const dayChangeValue = currentValue * (dayChange / 100);

    return {
      ...asset,
      currentPrice,
      currentValue,
      cost,
      pnl,
      pnlPercentage,
      allocation: 0, // Will be calculated in portfolio metrics
      dayChange: dayChangeValue,
      dayChangePercentage: dayChange,
    };
  };

  const calculatePortfolioMetrics = (
    portfolio: Portfolio
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

    const assetsWithMetrics = portfolio.assets.map(calculateAssetMetrics);
    const totalValue = assetsWithMetrics.reduce(
      (sum, asset) => sum + asset.currentValue,
      0
    );
    const totalCost = assetsWithMetrics.reduce(
      (sum, asset) => sum + asset.cost,
      0
    );
    const totalPnL = totalValue - totalCost;
    const totalPnLPercentage = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;
    const dayChange = assetsWithMetrics.reduce(
      (sum, asset) => sum + asset.dayChange,
      0
    );
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

  // Move getPortfolioWithMetrics outside of the component
  const getPortfolioWithMetrics = (portfolio: Portfolio) => {
    const metrics = calculatePortfolioMetrics(portfolio);
    const assetsWithMetrics = portfolio.assets.map((asset) => {
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
  };

  const activePortfolioWithMetrics = useMemo(() => {
    return activePortfolio ? getPortfolioWithMetrics(activePortfolio) : null;
  }, [activePortfolio, prices]);

  const portfoliosWithMetrics = useMemo(() => {
    return portfolios.map(getPortfolioWithMetrics);
  }, [portfolios, prices]);

  const createNewPortfolio = (name: string, description: string = '') => {
    if (!name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    setError(null);
    createPortfolio(name.trim(), description.trim());
  };

  const addAsset = (
    portfolioId: string,
    coinId: string,
    symbol: string,
    name: string,
    amount: number,
    averagePrice: number
  ) => {
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (averagePrice <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    setError(null);
    addAssetToPortfolio(portfolioId, {
      coinId,
      symbol,
      name,
      amount,
      averagePrice,
    });
  };

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
