'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { CreatePortfolioForm } from './CreatePortfolioForm';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { Plus, Trash2, TrendingUp, TrendingDown, Folder } from 'lucide-react';

export const PortfolioList = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { portfolios, activePortfolioId, setActivePortfolio, deletePortfolio } =
    usePortfolio();

  const handleDeletePortfolio = (
    portfolioId: string,
    portfolioName: string
  ) => {
    if (
      confirm(
        `Are you sure you want to delete "${portfolioName}"? This action cannot be undone.`
      )
    ) {
      deletePortfolio(portfolioId);
    }
  };

  if (portfolios.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <Folder className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Portfolios Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first portfolio to start tracking your investments
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Create Portfolio</span>
          </button>
        </div>

        {showCreateForm && (
          <CreatePortfolioForm onClose={() => setShowCreateForm(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Portfolios</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Portfolio</span>
        </button>
      </div>

      <div className="grid gap-6">
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className={`bg-white rounded-lg border-2 transition-all cursor-pointer ${
              portfolio.id === activePortfolioId
                ? 'border-orange-500 shadow-lg'
                : 'border-gray-200 hover:border-gray-300 shadow-sm'
            }`}
            onClick={() => setActivePortfolio(portfolio.id)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {portfolio.name}
                  </h3>
                  {portfolio.description && (
                    <p className="text-gray-600 text-sm mt-1">
                      {portfolio.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePortfolio(portfolio.id, portfolio.name);
                  }}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Total Value</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(portfolio.metrics.totalValue)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Total P&L</p>
                  <div
                    className={`flex items-center space-x-1 ${
                      portfolio.metrics.totalPnL >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {portfolio.metrics.totalPnL >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span className="font-semibold">
                      {formatCurrency(Math.abs(portfolio.metrics.totalPnL))}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">P&L %</p>
                  <p
                    className={`font-semibold ${
                      portfolio.metrics.totalPnLPercentage >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {portfolio.metrics.totalPnLPercentage >= 0 ? '+' : ''}
                    {formatPercentage(portfolio.metrics.totalPnLPercentage)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Assets</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {portfolio.assets.length}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created {portfolio.createdAt.toLocaleDateString()} • Last
                  updated {portfolio.updatedAt.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateForm && (
        <CreatePortfolioForm onClose={() => setShowCreateForm(false)} />
      )}
    </>
  );
};
