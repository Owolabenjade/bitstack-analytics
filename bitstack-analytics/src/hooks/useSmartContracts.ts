import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useTransactionStore } from '@/stores/transactionStore';
import {
  createPortfolioOnChain,
  addAssetToPortfolioOnChain,
  updateAssetAmountOnChain,
  removeAssetFromPortfolioOnChain,
  registerPublicPortfolio,
  generatePortfolioId,
  generateAssetId,
} from '@/lib/stacks/contracts';
import {
  estimateCreatePortfolioGas,
  estimateAddAssetGas,
  GasEstimate,
} from '@/lib/stacks/gasEstimation';

export interface ContractTransaction {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  gasEstimate?: GasEstimate;
}

export const useSmartContracts = () => {
  const { connected, address } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTransaction, setLastTransaction] =
    useState<ContractTransaction | null>(null);
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);

  const {
    addTransaction,
    updateTransactionStatus,
    updateTransactionGas,
    transactions,
    pendingCount,
  } = useTransactionStore();

  const estimateGasForCreatePortfolio = useCallback(
    async (name: string, description: string, isPublic: boolean = false) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      try {
        const portfolioId = generatePortfolioId();
        const estimate = await estimateCreatePortfolioGas(
          address,
          portfolioId,
          name,
          description,
          isPublic
        );
        setGasEstimate(estimate);
        return estimate;
      } catch (error) {
        console.warn('Failed to estimate gas:', error);
        return null;
      }
    },
    [connected, address]
  );

  const estimateGasForAddAsset = useCallback(
    async (
      portfolioId: string,
      symbol: string,
      amount: number,
      averagePrice: number
    ) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      try {
        const assetId = generateAssetId(symbol);
        const estimate = await estimateAddAssetGas(
          address,
          portfolioId,
          assetId,
          symbol,
          amount,
          averagePrice
        );
        setGasEstimate(estimate);
        return estimate;
      } catch (error) {
        console.warn('Failed to estimate gas:', error);
        return null;
      }
    },
    [connected, address]
  );

  const createPortfolio = useCallback(
    async (name: string, description: string, isPublic: boolean = false) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      // Add transaction to history
      const transactionId = addTransaction({
        txId: 'pending',
        type: 'portfolio-create',
        status: 'pending',
        metadata: {
          description: `Create portfolio: ${name}`,
        },
      });

      try {
        const portfolioId = generatePortfolioId();
        const result = await createPortfolioOnChain(
          portfolioId,
          name,
          description,
          isPublic
        );

        // Update transaction with actual txId
        updateTransactionStatus(transactionId, 'pending');

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
          gasEstimate,
        };

        setLastTransaction(transaction);

        // If public, also register in the registry
        if (isPublic) {
          try {
            await registerPublicPortfolio(portfolioId, name, description);
          } catch (registryError) {
            console.warn('Failed to register public portfolio:', registryError);
          }
        }

        // Simulate transaction confirmation (in real app, you'd listen to blockchain)
        setTimeout(() => {
          updateTransactionStatus(transactionId, 'success');
          if (gasEstimate) {
            updateTransactionGas(
              transactionId,
              gasEstimate.estimatedGas,
              gasEstimate.estimatedFee
            );
          }
        }, 30000); // 30 seconds simulation

        return { portfolioId, txId: result.txid, transactionId };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to create portfolio';
        setError(errorMessage);
        updateTransactionStatus(transactionId, 'failed', errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
        setGasEstimate(null);
      }
    },
    [
      connected,
      address,
      gasEstimate,
      addTransaction,
      updateTransactionStatus,
      updateTransactionGas,
    ]
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

      // Add transaction to history
      const transactionId = addTransaction({
        txId: 'pending',
        type: 'asset-add',
        status: 'pending',
        metadata: {
          portfolioId,
          amount,
          price: averagePrice,
          description: `Add ${amount} ${symbol} to portfolio`,
        },
      });

      try {
        const assetId = generateAssetId(symbol);
        const result = await addAssetToPortfolioOnChain(
          portfolioId,
          assetId,
          symbol,
          amount,
          averagePrice
        );

        updateTransactionStatus(transactionId, 'pending');

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
          gasEstimate,
        };

        setLastTransaction(transaction);

        // Simulate transaction confirmation
        setTimeout(() => {
          updateTransactionStatus(transactionId, 'success');
          if (gasEstimate) {
            updateTransactionGas(
              transactionId,
              gasEstimate.estimatedGas,
              gasEstimate.estimatedFee
            );
          }
        }, 20000); // 20 seconds simulation

        return { assetId, txId: result.txid, transactionId };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add asset';
        setError(errorMessage);
        updateTransactionStatus(transactionId, 'failed', errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
        setGasEstimate(null);
      }
    },
    [
      connected,
      address,
      gasEstimate,
      addTransaction,
      updateTransactionStatus,
      updateTransactionGas,
    ]
  );

  const updateAssetAmount = useCallback(
    async (portfolioId: string, assetId: string, newAmount: number) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      const transactionId = addTransaction({
        txId: 'pending',
        type: 'asset-update',
        status: 'pending',
        metadata: {
          portfolioId,
          assetId,
          amount: newAmount,
          description: `Update asset amount to ${newAmount}`,
        },
      });

      try {
        const result = await updateAssetAmountOnChain(
          portfolioId,
          assetId,
          newAmount
        );

        updateTransactionStatus(transactionId, 'pending');

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);

        setTimeout(() => {
          updateTransactionStatus(transactionId, 'success');
        }, 15000);

        return { txId: result.txid, transactionId };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to update asset';
        setError(errorMessage);
        updateTransactionStatus(transactionId, 'failed', errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address, addTransaction, updateTransactionStatus]
  );

  const removeAssetFromPortfolio = useCallback(
    async (portfolioId: string, assetId: string) => {
      if (!connected || !address) {
        throw new Error('Wallet not connected');
      }

      setIsLoading(true);
      setError(null);

      const transactionId = addTransaction({
        txId: 'pending',
        type: 'asset-remove',
        status: 'pending',
        metadata: {
          portfolioId,
          assetId,
          description: `Remove asset from portfolio`,
        },
      });

      try {
        const result = await removeAssetFromPortfolioOnChain(
          portfolioId,
          assetId
        );

        updateTransactionStatus(transactionId, 'pending');

        const transaction: ContractTransaction = {
          txId: result.txid,
          status: 'pending',
        };

        setLastTransaction(transaction);

        setTimeout(() => {
          updateTransactionStatus(transactionId, 'success');
        }, 15000);

        return { txId: result.txid, transactionId };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove asset';
        setError(errorMessage);
        updateTransactionStatus(transactionId, 'failed', errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, address, addTransaction, updateTransactionStatus]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearTransaction = useCallback(() => {
    setLastTransaction(null);
  }, []);

  const clearGasEstimate = useCallback(() => {
    setGasEstimate(null);
  }, []);

  return {
    // State
    isLoading,
    error,
    lastTransaction,
    gasEstimate,
    transactions,
    pendingCount,

    // Gas estimation
    estimateGasForCreatePortfolio,
    estimateGasForAddAsset,

    // Actions
    createPortfolio,
    addAssetToPortfolio,
    updateAssetAmount,
    removeAssetFromPortfolio,

    // Utilities
    clearError,
    clearTransaction,
    clearGasEstimate,
  };
};
