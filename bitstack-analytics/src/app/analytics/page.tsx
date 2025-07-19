'use client';

import Link from 'next/link';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { AllocationChart } from '@/components/charts/AllocationChart';
import { CorrelationMatrix } from '@/components/charts/CorrelationMatrix';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  Activity,
  Target,
  Zap,
} from 'lucide-react';

export default function Analytics() {
  const {
    performanceData,
    correlationMatrix,
    metrics,
    allocationData,
    uniqueAssets,
    isLoading,
    selectedTimeframe,
    setTimeframe,
    refreshAnalytics,
  } = useAnalytics();

  const { activePortfolio, portfolios } = usePortfolio();

  const timeframes = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' },
    { value: 'all', label: 'All Time' },
  ] as const;

  if (portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Portfolio Data
            </h2>
            <p className="text-gray-600 mb-6">
              Create a portfolio and add assets to view analytics
            </p>
            <Link
              href="/portfolio"
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Portfolio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">
              Advanced portfolio analysis and performance metrics
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select
              value={selectedTimeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>

            <button
              onClick={refreshAnalytics}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {activePortfolio && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {activePortfolio.name}
                </h2>
                <p className="text-gray-600">
                  Current Value:{' '}
                  {formatCurrency(activePortfolio.metrics.totalValue)} • Total
                  P&L:{' '}
                  <span
                    className={
                      activePortfolio.metrics.totalPnL >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {formatCurrency(activePortfolio.metrics.totalPnL)}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Assets</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activePortfolio.assets.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">
                  Sharpe Ratio
                </span>
              </div>
              <p
                className={`text-2xl font-bold ${metrics.sharpeRatio >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {metrics.sharpeRatio.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Risk-adjusted returns
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="h-5 w-5 text-purple-500" />
                <span className="text-sm font-medium text-gray-600">
                  Volatility
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(metrics.volatility)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Annualized volatility
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <span className="text-sm font-medium text-gray-600">
                  Max Drawdown
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatPercentage(metrics.maxDrawdown)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Largest peak-to-trough decline
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center space-x-3 mb-2">
                <Zap className="h-5 w-5 text-orange-500" />
                <span className="text-sm font-medium text-gray-600">Beta</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.beta.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Market sensitivity</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Portfolio Performance
              </h3>
              <p className="text-sm text-gray-600">
                Historical value over time
              </p>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <PerformanceChart data={performanceData} height={250} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Asset Allocation
              </h3>
              <p className="text-sm text-gray-600">
                Portfolio composition breakdown
              </p>
            </div>
            <div className="p-6">
              <AllocationChart data={allocationData} height={250} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Asset Correlation Matrix
            </h3>
            <p className="text-sm text-gray-600">
              Correlation coefficients between portfolio assets
            </p>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <CorrelationMatrix
                correlations={correlationMatrix}
                assets={uniqueAssets}
              />
            )}
          </div>
        </div>

        {metrics && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Advanced Metrics
              </h3>
              <p className="text-sm text-gray-600">
                Detailed risk and performance analysis
              </p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Risk Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Sharpe Ratio
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          metrics.sharpeRatio >= 1
                            ? 'text-green-600'
                            : metrics.sharpeRatio >= 0
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}
                      >
                        {metrics.sharpeRatio.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Volatility</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(metrics.volatility)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Max Drawdown
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {formatPercentage(metrics.maxDrawdown)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Market Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Beta</span>
                      <span
                        className={`text-sm font-medium ${
                          metrics.beta > 1 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {metrics.beta.toFixed(3)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Alpha</span>
                      <span
                        className={`text-sm font-medium ${
                          metrics.alpha >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatPercentage(metrics.alpha)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">R-Squared</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatPercentage(metrics.rSquared)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Interpretation</h4>
                  <div className="space-y-2 text-xs text-gray-600">
                    <p>
                      <strong>Sharpe Ratio:</strong> Higher is better (1+ is
                      good)
                    </p>
                    <p>
                      <strong>Beta:</strong> Market sensitivity (1+ = more
                      volatile)
                    </p>
                    <p>
                      <strong>Alpha:</strong> Excess return vs market
                    </p>
                    <p>
                      <strong>Max Drawdown:</strong> Largest decline from peak
                    </p>
                    <p>
                      <strong>R-Squared:</strong> Correlation with market
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
