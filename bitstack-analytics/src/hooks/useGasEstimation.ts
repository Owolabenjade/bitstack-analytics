import { useState, useCallback } from 'react';
import { useWallet } from './useWallet';

export interface GasEstimate {
  estimatedFee: number;
  feeRate: number;
  isLoading: boolean;
  error: string | null;
}

export const useGasEstimation = () => {
  const [estimates, setEstimates] = useState<Record<string, GasEstimate>>({});
  const { address } = useWallet();

  const estimateContractCall = useCallback(
    async (
      contractAddress: string,
      contractName: string,
      functionName: string,
      estimateId: string = 'default'
    ): Promise<GasEstimate> => {
      if (!address) {
        const error = 'Wallet not connected';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }

      try {
        setEstimates((prev) => ({
          ...prev,
          [estimateId]: {
            estimatedFee: 0,
            feeRate: 0,
            isLoading: true,
            error: null,
          },
        }));

        // Simple gas estimation - in production, you'd use actual Stacks transaction estimation
        const baseGas = 50000; // Base gas for contract calls
        const functionComplexity = functionName.includes('create') ? 2 : 1;
        const estimatedGas = baseGas * functionComplexity;
        const estimatedFee = estimatedGas * 1; // 1 microSTX per gas unit

        const estimate = {
          estimatedFee,
          feeRate: 1,
          isLoading: false,
          error: null,
        };

        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      } catch (err) {
        console.error('Error estimating contract call fee:', err);
        const error =
          err instanceof Error ? err.message : 'Fee estimation failed';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }
    },
    [address]
  );

  const estimateSTXTransfer = useCallback(
    async (
      amount: number,
      estimateId: string = 'stx-transfer'
    ): Promise<GasEstimate> => {
      if (!address) {
        const error = 'Wallet not connected';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }

      try {
        setEstimates((prev) => ({
          ...prev,
          [estimateId]: {
            estimatedFee: 0,
            feeRate: 0,
            isLoading: true,
            error: null,
          },
        }));

        // Simple estimation for STX transfers
        const baseTransferFee = 1000; // 1000 microSTX base fee
        const estimate = {
          estimatedFee: baseTransferFee,
          feeRate: 1,
          isLoading: false,
          error: null,
        };

        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      } catch (err) {
        console.error('Error estimating STX transfer fee:', err);
        const error =
          err instanceof Error ? err.message : 'Fee estimation failed';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }
    },
    [address]
  );

  const getEstimate = useCallback(
    (estimateId: string): GasEstimate | undefined => {
      return estimates[estimateId];
    },
    [estimates]
  );

  const clearEstimate = useCallback((estimateId: string) => {
    setEstimates((prev) => {
      const newEstimates = { ...prev };
      delete newEstimates[estimateId];
      return newEstimates;
    });
  }, []);

  return {
    estimateContractCall,
    estimateSTXTransfer,
    getEstimate,
    clearEstimate,
    estimates,
  };
};
