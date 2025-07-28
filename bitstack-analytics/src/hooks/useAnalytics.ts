import { useEffect, useMemo } from 'react';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { usePortfolio } from '@/hooks/usePortfolio';

export const useAnalytics = () => {
  const {
    performanceData,
    correlationMatrix,
    metrics,
    isLoading,
    error,
    selectedTimeframe,
    setTimeframe,
    setLoading,
    generateMockData,
  } = useAnalyticsStore();

  const { portfolios, activePortfolio } = usePortfolio();

  // Generate allocation data from active portfolio
  const allocationData = useMemo(() => {
    if (!activePortfolio || activePortfolio.assets.length === 0) {
      return [];
    }

    return activePortfolio.assets.map((asset, index) => ({
      name: asset.symbol,
      value: asset.currentValue,
      allocation: asset.allocation,
      color: `hsl(${(index * 360) / activePortfolio.assets.length}, 70%, 50%)`,
    }));
  }, [activePortfolio]);

  // Get unique assets across all portfolios for correlation matrix
  const uniqueAssets = useMemo(() => {
    const assetSet = new Set<string>();
    portfolios.forEach((portfolio) => {
      portfolio.assets.forEach((asset) => {
        assetSet.add(asset.coinId);
      });
    });
    return Array.from(assetSet);
  }, [portfolios]);

  // Calculate portfolio metrics
  const calculateMetrics = useMemo(() => {
    if (!activePortfolio || performanceData.length < 2) {
      return null;
    }

    const returns = performanceData.slice(1).map((point, index) => {
      const prevValue = performanceData[index].value;
      return (point.value - prevValue) / prevValue;
    });

    if (returns.length === 0) return null;

    // Calculate basic metrics
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance =
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) /
      returns.length;
    const volatility = Math.sqrt(variance * 252); // Annualized

    // Simple Sharpe ratio (assuming 2% risk-free rate)
    const riskFreeRate = 0.02;
    const excessReturn = avgReturn * 252 - riskFreeRate;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    // Maximum drawdown
    let maxDrawdown = 0;
    let peak = performanceData[0].value;

    performanceData.forEach((point) => {
      if (point.value > peak) {
        peak = point.value;
      }
      const drawdown = (peak - point.value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    return {
      sharpeRatio,
      volatility,
      maxDrawdown: -maxDrawdown,
      beta: 1 + (Math.random() - 0.5) * 0.5, // Mock beta
      alpha: avgReturn * 252 - 0.1, // Mock alpha
      rSquared: 0.7 + Math.random() * 0.3, // Mock R-squared
    };
  }, [activePortfolio, performanceData]);

  // Update metrics when calculation changes
  useEffect(() => {
    if (calculateMetrics) {
      setMetrics(calculateMetrics);
    }
  }, [calculateMetrics, setMetrics]);

  // Generate mock data when timeframe changes or on mount
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedTimeframe, generateMockData, setLoading]);

  const refreshAnalytics = () => {
    setLoading(true);
    setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 500);
  };

  return {
    performanceData,
    correlationMatrix,
    metrics,
    allocationData,
    uniqueAssets,
    isLoading,
    error,
    selectedTimeframe,
    setTimeframe,
    refreshAnalytics,
  };
};
