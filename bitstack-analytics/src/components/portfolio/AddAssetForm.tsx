'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { usePrices } from '@/hooks/usePrices';
import { SUPPORTED_ASSETS } from '@/lib/constants';
import { X, Plus } from 'lucide-react';

interface AddAssetFormProps {
  portfolioId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddAssetForm = ({
  portfolioId,
  onClose,
  onSuccess,
}: AddAssetFormProps) => {
  const [selectedCoin, setSelectedCoin] = useState('');
  const [amount, setAmount] = useState('');
  const [averagePrice, setAveragePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addAsset, error } = usePortfolio();
  const { prices } = usePrices();

  // Auto-fill current price when asset is selected
  const handleCoinChange = (coinId: string) => {
    setSelectedCoin(coinId);
    const currentPrice = prices[coinId]?.current_price;
    if (currentPrice) {
      setAveragePrice(currentPrice.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCoin || !amount || !averagePrice) return;

    const selectedAsset = SUPPORTED_ASSETS.find(
      (asset) => asset.id === selectedCoin
    );
    if (!selectedAsset) return;

    setIsSubmitting(true);
    try {
      addAsset(
        portfolioId,
        selectedCoin,
        selectedAsset.symbol,
        selectedAsset.name,
        parseFloat(amount),
        parseFloat(averagePrice)
      );
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error adding asset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAsset = SUPPORTED_ASSETS.find(
    (asset) => asset.id === selectedCoin
  );
  const currentPrice = selectedCoin
    ? prices[selectedCoin]?.current_price
    : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add Asset</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="asset"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Asset *
            </label>
            <select
              id="asset"
              value={selectedCoin}
              onChange={(e) => handleCoinChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            >
              <option value="">Select an asset</option>
              {SUPPORTED_ASSETS.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount *
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.00000001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
            {selectedAsset && (
              <p className="text-sm text-gray-500 mt-1">
                Amount of {selectedAsset.symbol} you own
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Average Purchase Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              value={averagePrice}
              onChange={(e) => setAveragePrice(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="0.00"
              required
            />
            {currentPrice && (
              <p className="text-sm text-gray-500 mt-1">
                Current price: ${currentPrice.toFixed(2)}
              </p>
            )}
          </div>

          {amount && averagePrice && selectedAsset && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Total Investment:</strong> $
                {(parseFloat(amount) * parseFloat(averagePrice)).toFixed(2)}
              </p>
              {currentPrice && (
                <p className="text-sm text-gray-600">
                  <strong>Current Value:</strong> $
                  {(parseFloat(amount) * currentPrice).toFixed(2)}
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !selectedCoin || !amount || !averagePrice || isSubmitting
              }
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isSubmitting ? 'Adding...' : 'Add Asset'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
