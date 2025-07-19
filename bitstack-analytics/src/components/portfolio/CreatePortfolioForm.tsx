'use client';

import { useState } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useSmartContracts } from '@/hooks/useSmartContracts';
import { useWallet } from '@/hooks/useWallet';
import { X, Plus, Database } from 'lucide-react';

interface CreatePortfolioFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreatePortfolioForm = ({
  onClose,
  onSuccess,
}: CreatePortfolioFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [useBlockchain, setUseBlockchain] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPortfolio, error } = usePortfolio();
  const {
    createPortfolio: createOnChain,
    isLoading: contractLoading,
    error: contractError,
  } = useSmartContracts();
  const { connected } = useWallet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      if (useBlockchain && connected) {
        // Create portfolio on-chain
        const result = await createOnChain(name, description, isPublic);
        console.log('Portfolio created on-chain:', result);
      }

      // Always create locally as well
      createPortfolio(name, description);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating portfolio:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentError = error || contractError;
  const isLoading = isSubmitting || contractLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Portfolio
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {currentError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {currentError}
            </div>
          )}

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Portfolio Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="e.g., My Bitcoin Portfolio"
              required
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Describe your investment strategy or goals..."
            />
          </div>

          {connected && (
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="useBlockchain"
                  checked={useBlockchain}
                  onChange={(e) => setUseBlockchain(e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="useBlockchain"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Store on Stacks blockchain
                </label>
              </div>

              {useBlockchain && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Make portfolio public
                  </label>
                </div>
              )}

              {useBlockchain && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Database className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">
                      Blockchain Storage
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Portfolio metadata will be stored on Stacks blockchain for
                    transparency and immutability.
                  </p>
                </div>
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
              disabled={!name.trim() || isLoading}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>{isLoading ? 'Creating...' : 'Create Portfolio'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
