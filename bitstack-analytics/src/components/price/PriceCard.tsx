'use client';

import { PriceData } from '@/stores/priceStore';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceCardProps {
  priceData: PriceData;
  className?: string;
}

export const PriceCard = ({ priceData, className = '' }: PriceCardProps) => {
  const change = priceData.price_change_percentage_24h;
  const isPositive = change > 0;
  const isNegative = change < 0;

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="h-4 w-4" />;
    if (isNegative) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = () => {
    if (isPositive) return 'text-green-600';
    if (isNegative) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`bg-white p-4 rounded-lg border shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">
            {priceData.symbol}
          </span>
          <span className="text-xs text-gray-400">{priceData.name}</span>
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          {getTrendIcon()}
          <span className="text-sm font-medium">
            {formatPercentage(Math.abs(change))}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-2xl font-bold text-gray-900">
          {formatCurrency(priceData.current_price)}
        </p>
      </div>

      <div className="space-y-1 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Market Cap:</span>
          <span>{formatCurrency(priceData.market_cap)}</span>
        </div>
        <div className="flex justify-between">
          <span>24h Volume:</span>
          <span>{formatCurrency(priceData.total_volume)}</span>
        </div>
      </div>
    </div>
  );
};
