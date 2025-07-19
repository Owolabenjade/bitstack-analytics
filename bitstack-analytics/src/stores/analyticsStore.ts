import { create } from 'zustand';

export interface PortfolioPerformancePoint {
  date: string;
  value: number;
  change: number;
  changePercentage: number;
}

export interface AssetCorrelation {
  asset1: string;
  asset2: string;
  correlation: number;
}

export interface AnalyticsMetrics {
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  beta: number;
  alpha: number;
  rSquared: number;
}

interface AnalyticsState {
  performanceData: PortfolioPerformancePoint[];
  correlationMatrix: AssetCorrelation[];
  metrics: AnalyticsMetrics | null;
  isLoading: boolean;
  error: string | null;
  selectedTimeframe: '7d' | '30d' | '90d' | '1y' | 'all';
}

interface AnalyticsActions {
  setPerformanceData: (data: PortfolioPerformancePoint[]) => void;
  setCorrelationMatrix: (matrix: AssetCorrelation[]) => void;
  setMetrics: (metrics: AnalyticsMetrics) => void;
  setTimeframe: (timeframe: AnalyticsState['selectedTimeframe']) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  generateMockData: () => void;
}

const initialState: AnalyticsState = {
  performanceData: [],
  correlationMatrix: [],
  metrics: null,
  isLoading: false,
  error: null,
  selectedTimeframe: '30d',
};

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>(
  (set, get) => ({
    ...initialState,

    setPerformanceData: (performanceData) => set({ performanceData }),
    setCorrelationMatrix: (correlationMatrix) => set({ correlationMatrix }),
    setMetrics: (metrics) => set({ metrics }),
    setTimeframe: (selectedTimeframe) => set({ selectedTimeframe }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),

    generateMockData: () => {
      const { selectedTimeframe } = get();
      const days =
        selectedTimeframe === '7d'
          ? 7
          : selectedTimeframe === '30d'
            ? 30
            : selectedTimeframe === '90d'
              ? 90
              : selectedTimeframe === '1y'
                ? 365
                : 30;

      // Generate mock performance data
      const performanceData: PortfolioPerformancePoint[] = [];
      let currentValue = 10000;

      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        // Add some realistic volatility
        const dailyChange = (Math.random() - 0.5) * 0.1; // ±5% daily change
        currentValue = currentValue * (1 + dailyChange);

        const change =
          i === days
            ? 0
            : currentValue -
                performanceData[performanceData.length - 1]?.value ||
              currentValue;
        const changePercentage =
          i === days ? 0 : (change / (currentValue - change)) * 100;

        performanceData.push({
          date: date.toISOString().split('T')[0],
          value: currentValue,
          change,
          changePercentage,
        });
      }

      // Generate mock correlation matrix
      const assets = ['bitcoin', 'stacks'];
      const correlationMatrix: AssetCorrelation[] = [];

      for (let i = 0; i < assets.length; i++) {
        for (let j = i + 1; j < assets.length; j++) {
          correlationMatrix.push({
            asset1: assets[i],
            asset2: assets[j],
            correlation: Math.random() * 2 - 1, // -1 to 1
          });
        }
      }

      // Generate mock metrics
      const metrics: AnalyticsMetrics = {
        sharpeRatio: Math.random() * 3 - 1, // -1 to 2
        volatility: Math.random() * 0.5 + 0.1, // 10% to 60%
        maxDrawdown: -(Math.random() * 0.3 + 0.05), // -5% to -35%
        beta: Math.random() * 2 + 0.5, // 0.5 to 2.5
        alpha: Math.random() * 0.2 - 0.1, // -10% to 10%
        rSquared: Math.random() * 0.5 + 0.5, // 50% to 100%
      };

      set({ performanceData, correlationMatrix, metrics });
    },
  })
);
