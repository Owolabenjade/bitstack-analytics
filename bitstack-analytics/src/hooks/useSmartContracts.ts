import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import {
  createPortfolioOnChain,
  addAssetToPortfolioOnChain,
  updateAssetAmountOnChain,
  removeAssetFromPortfolioOnChain,
  registerPublicPortfolio,
  generatePortfolioId,
  generateAssetId,
} from '@/lib/stacks/contracts';

export interface ContractTransaction {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
}

export const useSmartContracts = () => {
  const { connected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] =
    useState<ContractTransaction | null>(null);

  const createPortfolio = useCallback(
    async (name: string, description: string, isPublic: boolean = false) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const portfolioId = generatePortfolioId();
        const result = await createPortfolioOnChain(
          portfolioId,
          name,
          description,
          isPublic
        );

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);

        // If public, also register in the registry
        if (isPublic) {
          await registerPublicPortfolio(portfolioId, name, description);
        }

        return { portfolioId, txId: result.txid };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create portfolio';
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address]
  );

  const addAssetToPortfolio = useCallback(
    async (
      portfolioId: string,
      symbol: string,
      amount: number,
      averagePrice: number
    ) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const assetId = generateAssetId(symbol);
        const result = await addAssetToPortfolioOnChain(
          portfolioId,
          assetId,
          symbol,
          amount,
          averagePrice
        );

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);
        return { assetId, txId: result.txid };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add asset';
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address]
  );

  const updateAssetAmount = useCallback(
    async (portfolioId: string, assetId: string, newAmount: number) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await updateAssetAmountOnChain(
          portfolioId,
          assetId,
          newAmount
        );

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);
        return { txId: result.txid };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update asset';
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address]
  );

  const removeAssetFromPortfolio = useCallback(
    async (portfolioId: string, assetId: string) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await removeAssetFromPortfolioOnChain(
          portfolioId,
          assetId
        );

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);
        return { txId: result.txid };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove asset';
        setError(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTransaction = useCallback(() => {
    setLastTransaction(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    lastTransaction,

    // Actions
    createPortfolio,
    addAssetToPortfolio,
    updateAssetAmount,
    removeAssetFromPortfolio,

    // Utilities
    clearError,
    clearTransaction,
  };
};
