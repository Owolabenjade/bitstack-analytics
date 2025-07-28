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
    tx: Omit<Transaction, 'id' | 'timestamp'>,
  ) => string;
  updateTransactionStatus: (
    id: string,
    status: Transaction['status'],
    error?: string,
  ) => void;
  updateTransactionGas: (id: string, gasUsed: number, gasPrice: number) => void;
  removeTransaction: (id: string) => void;
  clearTransactions: () => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
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
    (set) => ({
      /* ------------------- state ------------------- */
      ...initialState,

      /* ------------------ actions ------------------ */
      addTransaction: (data) => {
        const tx: Transaction = {
          ...data,
          id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        };

        set((state) => ({
          transactions: [tx, ...state.transactions],
          pendingCount:
            tx.status === 'pending'
              ? state.pendingCount + 1
              : state.pendingCount,
        }));

        return tx.id;
      },

      updateTransactionStatus: (id, status, error) => {
        set((state) => {
          const updated = state.transactions.map((tx) =>
            tx.id === id ? { ...tx, status, error } : tx,
          );

          return {
            transactions: updated,
            pendingCount: updated.filter((t) => t.status === 'pending').length,
          };
        });
      },

      updateTransactionGas: (id, gasUsed, gasPrice) => {
        set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.id === id ? { ...tx, gasUsed, gasPrice } : tx,
          ),
        }));
      },

      removeTransaction: (id) => {
        set((state) => {
          const remaining = state.transactions.filter((tx) => tx.id !== id);
          return {
            transactions: remaining,
            pendingCount: remaining.filter((t) => t.status === 'pending').length,
          };
        });
      },

      clearTransactions: () => set(initialState),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'transaction-storage',
      partialize: (state) => ({
        transactions: state.transactions.slice(0, 50), // keep last 50
        pendingCount: state.pendingCount,
      }),
    },
  ),
);
