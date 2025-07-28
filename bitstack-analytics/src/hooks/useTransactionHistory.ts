import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';

export interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  block_height: number;
  burn_block_time: number;
  burn_block_time_iso: string;
  fee_rate: string;
  sender_address: string;
  tx_result: {
    hex: string;
    repr: string;
  };
}

export const useTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const { address } = useWallet();

  const limit = 20;

  const fetchTransactions = useCallback(
    async (reset = false) => {
      if (!address) return;

      try {
        setLoading(true);
        setError(null);

        const apiUrl =
          process.env.NEXT_PUBLIC_STACKS_API_URL ||
          'https://api.testnet.hiro.so';
        const currentOffset = reset ? 0 : offset;

        const response = await fetch(
          `${apiUrl}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${currentOffset}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.status}`);
        }

        const data = await response.json();

        if (reset) {
          setTransactions(data.results);
          setOffset(limit);
        } else {
          setTransactions((prev) => [...prev, ...data.results]);
          setOffset((prev) => prev + limit);
        }

        setHasMore(data.results.length === limit);
      } catch (err) {
        console.error('Error fetching transaction history:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch transactions'
        );
      } finally {
        setLoading(false);
      }
    },
    [address, offset, limit]
  );

  const refetch = useCallback(async () => {
    setOffset(0);
    setHasMore(true);
    await fetchTransactions(true);
  }, [fetchTransactions]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchTransactions(false);
  }, [hasMore, loading, fetchTransactions]);

  // Re-fetch when the connected address changes
  useEffect(() => {
    if (address) {
      setOffset(0);
      setHasMore(true);
      fetchTransactions(true);
    }
  }, [address]); // fetchTransactions removed from dependencies

  return {
    transactions,
    loading,
    error,
    refetch,
    hasMore,
    loadMore,
  };
};
