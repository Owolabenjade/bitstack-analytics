'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioList } from '@/components/portfolio/PortfolioList';
import { AddAssetForm } from '@/components/portfolio/AddAssetForm';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Plus, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

export default function Portfolio() {
  const [showAddAsset, setShowAddAsset] = useState(false);
  const { activePortfolio, removeAsset } = usePortfolio();

  const handleRemoveAsset = (assetId: string, assetName: string) => {
    if (activePortfolio && confirm(`Remove ${assetName} from portfolio?`)) {
      removeAsset(activePortfolio.id, assetId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Portfolio Management
          </h1>
          <p className="text-gray-600">
            Create and manage your Bitcoin ecosystem investment portfolios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Portfolio List */}
          <div className="lg:col-span-1">
            <PortfolioList />
          </div>

          {/* Active Portfolio Details */}
          <div className="lg:col-span-2">
            {activePortfolio ? (
              <div className="space-y-6">
                {/* Portfolio Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activePortfolio.name}
                      </h2>
                      {activePortfolio.description && (
                        <p className="text-gray-600 mt-1">
                          {activePortfolio.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAddAsset(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Asset</span>
                    </button>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Value</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(activePortfolio.metrics.totalValue)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(activePortfolio.metrics.totalCost)}
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">P&L</p>
                      <div
                        className={`flex items-center space-x-1 ${
                          activePortfolio.metrics.totalPnL >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {activePortfolio.metrics.totalPnL >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        <span className="text-xl font-bold">
                          {formatCurrency(
                            Math.abs(activePortfolio.metrics.totalPnL)
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">P&L %</p>
                      <p
                        className={`text-xl font-bold ${
                          activePortfolio.metrics.totalPnLPercentage >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {activePortfolio.metrics.totalPnLPercentage >= 0
                          ? '+'
                          : ''}
                        {formatPercentage(
                          activePortfolio.metrics.totalPnLPercentage
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Assets List */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Assets
                    </h3>
                  </div>

                  {activePortfolio.assets.length === 0 ? (
                    <div className="p-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <Plus className="h-12 w-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Assets Yet
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Add your first asset to start tracking performance
                      </p>
                      <button
                        onClick={() => setShowAddAsset(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                      >
                        Add Your First Asset
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Asset
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Current Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              P&L
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Allocation
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {activePortfolio.assets.map((asset) => (
                            <tr key={asset.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {asset.symbol}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {asset.name}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {asset.amount.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 8,
                                })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(asset.averagePrice)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(asset.currentPrice)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(asset.currentValue)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`text-sm font-medium ${
                                    asset.pnl >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {formatCurrency(Math.abs(asset.pnl))}
                                  <div className="text-xs">
                                    ({asset.pnl >= 0 ? '+' : ''}
                                    {formatPercentage(asset.pnlPercentage)})
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatPercentage(asset.allocation)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() =>
                                    handleRemoveAsset(asset.id, asset.name)
                                  }
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Plus className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Select a Portfolio
                </h3>
                <p className="text-gray-600">
                  Choose a portfolio from the left panel or create a new one to
                  get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Asset Modal */}
        {showAddAsset && activePortfolio && (
          <AddAssetForm
            portfolioId={activePortfolio.id}
            onClose={() => setShowAddAsset(false)}
            onSuccess={() => setShowAddAsset(false)}
          />
        )}
      </div>
    </div>
  );
}
