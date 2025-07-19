'use client';

import { useSmartContracts } from '@/hooks/useSmartContracts';
import { CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';

export const TransactionStatus = () => {
  const { lastTransaction, clearTransaction } = useSmartContracts();

  if (!lastTransaction) return null;

  const getStatusIcon = () => {
    switch (lastTransaction.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (lastTransaction.status) {
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (lastTransaction.status) {
      case 'pending':
        return 'Transaction pending...';
      case 'success':
        return 'Transaction confirmed!';
      case 'failed':
        return 'Transaction failed';
      default:
        return 'Processing transaction...';
    }
  };

  const explorerUrl = `https://explorer.stacks.co/txid/${lastTransaction.txId}?chain=${
    process.env.NEXT_PUBLIC_STACKS_NETWORK === 'mainnet' ? 'mainnet' : 'testnet'
  }`;

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
            <p className="text-xs text-gray-600">
              TX: {lastTransaction.txId.slice(0, 8)}...{lastTransaction.txId.slice(-8)}
            </p>
            {lastTransaction.error && (
              <p className="text-xs text-red-600 mt-1">{lastTransaction.error}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
          <button
            onClick={clearTransaction}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xs"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};
