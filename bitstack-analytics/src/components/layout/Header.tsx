'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { usePrices } from '@/hooks/usePrices';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

export const Header = () => {
  const { prices } = usePrices();
  const bitcoin = prices['bitcoin'];
  const stacks = prices['stacks'];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-orange-500 p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-900">
                BitStack Analytics
              </span>
              <span className="text-xs text-gray-500">Built on Stacks</span>
            </div>
          </Link>

          {/* Price Ticker - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-6 text-sm">
            {bitcoin && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">BTC</span>
                <span className="font-medium">
                  {formatCurrency(bitcoin.current_price)}
                </span>
                <div
                  className={`flex items-center space-x-1 ${
                    bitcoin.price_change_percentage_24h >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {bitcoin.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs">
                    {Math.abs(bitcoin.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {stacks && (
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">STX</span>
                <span className="font-medium">
                  {formatCurrency(stacks.current_price)}
                </span>
                <div
                  className={`flex items-center space-x-1 ${
                    stacks.price_change_percentage_24h >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {stacks.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span className="text-xs">
                    {Math.abs(stacks.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/portfolio"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Portfolio
            </Link>
            <Link
              href="/analytics"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Analytics
            </Link>
          </nav>

          {/* Wallet Connection */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};
