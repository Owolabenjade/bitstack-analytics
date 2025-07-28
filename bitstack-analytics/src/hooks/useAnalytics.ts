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
    setMetrics,
    generateMockData,
  } = useAnalyticsStore();

  const { portfolios, activePortfolio } = usePortfolio();

  /** -------- Allocation pie-chart data -------- */
  const allocationData = useMemo(() => {
    if (!activePortfolio || activePortfolio.assets.length === 0) return [];

    return activePortfolio.assets.map((asset, index) => ({
      name: asset.symbol,
      value: asset.currentValue,
      allocation: asset.allocation,
      color: `hsl(${(index * 360) / activePortfolio.assets.length}, 70%, 50%)`,
    }));
  }, [activePortfolio]);

  /** -------- Unique asset list for correlation matrix -------- */
  const uniqueAssets = useMemo(() => {
    const set = new Set<string>();
    portfolios.forEach((p) =>
      p.assets.forEach((a) => {
        set.add(a.coinId);
      })
    );
    return Array.from(set);
  }, [portfolios]);

  /** -------- Portfolio metric calculations -------- */
  const calculateMetrics = useMemo(() => {
    if (!activePortfolio || performanceData.length < 2) return null;

    const returns = performanceData.slice(1).map((point, i) => {
      const prev = performanceData[i].value;
      return (point.value - prev) / prev;
    });

    if (returns.length === 0) return null;

    const avgReturn = returns.reduce((s, r) => s + r, 0) / returns.length;
    const variance =
      returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length;
    const volatility = Math.sqrt(variance * 252);

    const riskFreeRate = 0.02;
    const excessReturn = avgReturn * 252 - riskFreeRate;
    const sharpeRatio = volatility > 0 ? excessReturn / volatility : 0;

    let maxDrawdown = 0;
    let peak = performanceData[0].value;
    performanceData.forEach((pt) => {
      if (pt.value > peak) peak = pt.value;
      const dd = (peak - pt.value) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    });

    return {
      sharpeRatio,
      volatility,
      maxDrawdown: -maxDrawdown,
      beta: 1 + (Math.random() - 0.5) * 0.5,
      alpha: avgReturn * 252 - 0.1,
      rSquared: 0.7 + Math.random() * 0.3,
    };
  }, [activePortfolio, performanceData]);

  /** -------- Update metrics whenever they are re-calculated -------- */
  useEffect(() => {
    if (calculateMetrics) {
      setMetrics(calculateMetrics);
    }
  }, [calculateMetrics]); // setMetrics intentionally omitted per lint rule

  /** -------- Refresh / mock-data generation -------- */
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      generateMockData();
      setLoading(false);
    }, 500);
    return () => clearTimeout(t);
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
