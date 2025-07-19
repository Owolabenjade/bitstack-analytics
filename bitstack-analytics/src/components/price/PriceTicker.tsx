'use client';

import { usePrices } from '@/hooks/usePrices';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';

export const PriceTicker = () => {
  const { prices, isLoading, error, refreshPrices, lastUpdated } = usePrices();

  const bitcoin = prices['bitcoin'];
  const stacks = prices['stacks'];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-red-700 text-sm">Failed to load prices</span>
          <button
            onClick={refreshPrices}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 text-white p-3 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {bitcoin && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">BTC</span>
              <span className="text-sm">
                {formatCurrency(bitcoin.current_price)}
              </span>
              <div
                className={`flex items-center space-x-1 text-xs ${
                  bitcoin.price_change_percentage_24h >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {bitcoin.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {formatPercentage(
                    Math.abs(bitcoin.price_change_percentage_24h)
                  )}
                </span>
              </div>
            </div>
          )}

          {stacks && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">STX</span>
              <span className="text-sm">
                {formatCurrency(stacks.current_price)}
              </span>
              <div
                className={`flex items-center space-x-1 text-xs ${
                  stacks.price_change_percentage_24h >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {stacks.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {formatPercentage(
                    Math.abs(stacks.price_change_percentage_24h)
                  )}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {lastUpdated && (
            <span className="text-xs text-gray-400">
              Updated {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refreshPrices}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
