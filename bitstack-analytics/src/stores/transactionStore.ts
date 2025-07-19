import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Transaction {
  id: string;
  txId: string;
  type:
    | 'portfolio-create'
    | 'asset-add'
    | 'asset-update'
    | 'asset-remove'
    | 'portfolio-update';
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  timestamp: Date;
  gasUsed?: number;
  gasPrice?: number;
  error?: string;
  metadata: {
    portfolioId?: string;
    assetId?: string;
    amount?: number;
    price?: number;
    description: string;
  };
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  pendingCount: number;
}

interface TransactionActions {
  addTransaction: (
    transaction: Omit<Transaction, 'id' | 'timestamp'>
  ) => string;
  updateTransactionStatus: (
    id: string,
    status: Transaction['status'],
    error?: string
  ) => void;
  updateTransactionGas: (id: string, gasUsed: number, gasPrice: number) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  pendingCount: 0,
};

export const useTransactionStore = create<
  TransactionState & TransactionActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      addTransaction: (transactionData) => {
        const transaction: Transaction = {
          ...transactionData,
          id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          transactions: [transaction, ...state.transactions],
          pendingCount:
            transaction.status === 'pending'
              ? state.pendingCount + 1
              : state.pendingCount,
        }));

        return transaction.id;
      },

      updateTransactionStatus: (id, status, error) => {
        set((state) => {
          const updatedTransactions = state.transactions.map((tx) => {
            if (tx.id === id) {
              const waspending = tx.status === 'pending';
              const nowPending = status === 'pending';

              return { ...tx, status, error };
            }
            return tx;
          });

          const pendingCount = updatedTransactions.filter(
            (tx) => tx.status === 'pending'
          ).length;

          return {
            transactions: updatedTransactions,
            pendingCount,
          };
        });
      },

      updateTransactionGas: (id, gasUsed, gasPrice) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, gasUsed, gasPrice } : tx
          ),
        }));
      },

      removeTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
          pendingCount:
            state.transactions.find((tx) => tx.id === id)?.status === 'pending'
              ? state.pendingCount - 1
              : state.pendingCount,
        }));
      },

      clearTransactions: () => set(initialState),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({
        transactions: state.transactions,
        pendingCount: state.pendingCount,
      }),
    }
  )
);
