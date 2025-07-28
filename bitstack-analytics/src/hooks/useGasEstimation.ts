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

  /* ─────────────────────────────────────────────
   *  Contract‑call estimation
   * ──────────────────────────────────────────── */
  const estimateContractCall = useCallback(
    async (
      _contractAddress: string, // prefixed → suppress “unused” lint
      _contractName: string,
      functionName: string,
      estimateId: string = 'default'
    ): Promise<GasEstimate> => {
      if (!address) {
        const err = 'Wallet not connected';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error: err,
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

        // Very rough gas model for demo purposes
        const baseGas = 50_000;
        const complexity = functionName.includes('create') ? 2 : 1;
        const estimatedGas = baseGas * complexity;
        const estimatedFee = estimatedGas * 1; // 1 µSTX / gas

        const estimate = {
          estimatedFee,
          feeRate: 1,
          isLoading: false,
          error: null,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      } catch (e) {
        console.error('Error estimating contract call fee:', e);
        const err = e instanceof Error ? e.message : 'Fee estimation failed';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error: err,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }
    },
    [address]
  );

  /* ─────────────────────────────────────────────
   *  STX‑transfer estimation
   * ──────────────────────────────────────────── */
  const estimateSTXTransfer = useCallback(
    async (
      _amount: number, // not used in the simple mock – prefix to silence lint
      estimateId: string = 'stx-transfer'
    ): Promise<GasEstimate> => {
      if (!address) {
        const err = 'Wallet not connected';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error: err,
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

        // Flat‑rate demo fee
        const estimate = {
          estimatedFee: 1_000,
          feeRate: 1,
          isLoading: false,
          error: null,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      } catch (e) {
        console.error('Error estimating STX transfer fee:', e);
        const err = e instanceof Error ? e.message : 'Fee estimation failed';
        const estimate = {
          estimatedFee: 0,
          feeRate: 0,
          isLoading: false,
          error: err,
        };
        setEstimates((prev) => ({ ...prev, [estimateId]: estimate }));
        return estimate;
      }
    },
    [address]
  );

  /* ─────────────────────────────────────────────
   *  Helpers
   * ──────────────────────────────────────────── */
  const getEstimate = useCallback(
    (estimateId: string) => estimates[estimateId],
    [estimates]
  );

  const clearEstimate = useCallback((estimateId: string) => {
    setEstimates((prev) => {
      const next = { ...prev };
      delete next[estimateId];
      return next;
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
