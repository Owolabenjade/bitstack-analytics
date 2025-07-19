'use client';

import { useState } from 'react';
import {
  useTransactionHistory,
  Transaction,
} from '@/hooks/useTransactionHistory';
import {
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TransactionItem = ({ transaction }: { transaction: Transaction }) => {
  const getStatusIcon = () => {
    switch (transaction.tx_status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'abort_by_response':
      case 'abort_by_post_condition':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (transaction.tx_status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'abort_by_response':
      case 'abort_by_post_condition':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTxType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const openInExplorer = () => {
    const explorerUrl = `https://explorer.stacks.co/txid/${transaction.tx_id}?chain=testnet`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <div className="flex items-center justify-between p-4 border-b last:border-b-0">
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">
              {formatTxType(transaction.tx_type)}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}
            >
              {transaction.tx_status}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(transaction.burn_block_time_iso), {
              addSuffix: true,
            })}
          </div>
          <div className="text-xs font-mono text-gray-500">
            {transaction.tx_id.slice(0, 8)}...{transaction.tx_id.slice(-8)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className="text-sm font-medium">
            Block {transaction.block_height}
          </div>
          <div className="text-xs text-gray-500">
            Fee: {(parseInt(transaction.fee_rate) / 1000000).toFixed(6)} STX
          </div>
        </div>
        <button
          onClick={openInExplorer}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const TransactionHistory = () => {
  const { transactions, loading, error, refetch, hasMore, loadMore } =
    useTransactionHistory();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <p className="text-sm text-red-600 mt-1">
            Error loading transactions: {error}
          </p>
        </div>
        <div className="p-4">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Transaction History</h3>
          <p className="text-sm text-gray-600">
            Your recent Stacks blockchain transactions
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded transition-colors"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {loading && transactions.length === 0 ? (
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-4 w-32 bg-gray-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No transactions found</p>
          <p className="text-sm">Your transaction history will appear here</p>
        </div>
      ) : (
        <>
          <div>
            {transactions.map((tx) => (
              <TransactionItem key={tx.tx_id} transaction={tx} />
            ))}
          </div>
          {hasMore && (
            <div className="p-4 border-t">
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 rounded-lg transition-colors"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
