'use client';

import { WalletInfo } from '@/components/wallet/WalletInfo';
import { PriceTicker } from '@/components/price/PriceTicker';
import { PriceCard } from '@/components/price/PriceCard';
import { useWallet } from '@/hooks/useWallet';
import { usePrices } from '@/hooks/usePrices';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Activity,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const { connected } = useWallet();
  const { prices } = usePrices();
  const { portfolios, activePortfolio } = usePortfolio();

  const bitcoin = prices['bitcoin'];
  const stacks = prices['stacks'];

  // Calculate total portfolio value across all portfolios
  const totalPortfolioValue = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.metrics.totalValue,
    0
  );
  const totalPortfolioPnL = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.metrics.totalPnL,
    0
  );
  const totalAssets = portfolios.reduce(
    (sum, portfolio) => sum + portfolio.assets.length,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your Bitcoin ecosystem portfolio performance
          </p>
        </div>

        {/* Price Ticker */}
        <div className="mb-8">
          <PriceTicker />
        </div>

        {/* Wallet Status */}
        <div className="mb-8">
          <WalletInfo />
        </div>

        {/* Market Overview */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Market Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bitcoin && <PriceCard priceData={bitcoin} />}
            {stacks && <PriceCard priceData={stacks} />}
          </div>
        </div>

        {connected ? (
          <>
            {/* Portfolio Overview */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Portfolio Overview
                </h2>
                <Link
                  href="/portfolio"
                  className="text-orange-600 hover:text-orange-800 text-sm font-medium transition-colors"
                >
                  Manage Portfolios →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(totalPortfolioValue)}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total P&L</p>
                      <p
                        className={`text-2xl font-bold ${
                          totalPortfolioPnL >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {totalPortfolioPnL >= 0 ? '+' : ''}
                        {formatCurrency(Math.abs(totalPortfolioPnL))}
                      </p>
                    </div>
                    {totalPortfolioPnL >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-500" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Assets</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalAssets}
                      </p>
                    </div>
                    <PieChart className="h-8 w-8 text-blue-500" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Portfolios</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {portfolios.length}
                      </p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Portfolio Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Portfolios
                </h3>
                {portfolios.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p>No portfolios created yet</p>
                      <Link
                        href="/portfolio"
                        className="inline-flex items-center space-x-2 text-orange-600 hover:text-orange-800 transition-colors mt-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create your first portfolio</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {portfolios.slice(0, 3).map((portfolio) => (
                      <div
                        key={portfolio.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {portfolio.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {portfolio.assets.length} assets •{' '}
                            {formatCurrency(portfolio.metrics.totalValue)}
                          </p>
                        </div>
                        <div
                          className={`text-right ${
                            portfolio.metrics.totalPnL >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          <p className="font-medium">
                            {portfolio.metrics.totalPnL >= 0 ? '+' : ''}
                            {formatCurrency(
                              Math.abs(portfolio.metrics.totalPnL)
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                    {portfolios.length > 3 && (
                      <Link
                        href="/portfolio"
                        className="block text-center text-orange-600 hover:text-orange-800 transition-colors text-sm font-medium pt-2"
                      >
                        View all portfolios
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/portfolio"
                    className="block w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Plus className="h-6 w-6 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Create Portfolio
                        </p>
                        <p className="text-sm text-gray-600">
                          Start tracking your investments
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/analytics"
                    className="block w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">
                          View Analytics
                        </p>
                        <p className="text-sm text-gray-600">
                          Deep dive into performance
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Connect Your Wallet to Get Started
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your Stacks wallet to start tracking your Bitcoin
              ecosystem portfolio
            </p>
            <div className="text-sm text-gray-500 space-y-2">
              <p>• Track Bitcoin and STX holdings</p>
              <p>• Monitor portfolio performance</p>
              <p>• Access advanced analytics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
