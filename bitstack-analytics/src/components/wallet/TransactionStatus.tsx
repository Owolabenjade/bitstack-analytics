'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface TransactionStatusProps {
  txId: string | null;
  onClose: () => void;
}

type TransactionStatus = 'pending' | 'success' | 'failed' | 'not_found';

interface TransactionData {
  tx_id: string;
  tx_status: string;
  block_height?: number;
  burn_block_time?: number;
}

export const TransactionStatus = ({
  txId,
  onClose,
}: TransactionStatusProps) => {
  const [status, setStatus] = useState<TransactionStatus>('pending');
  const [txData, setTxData] = useState<TransactionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!txId) return;

    const checkTransactionStatus = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_STACKS_API_URL ||
          'https://api.testnet.hiro.so';

        const response = await fetch(`${apiUrl}/extended/v1/tx/${txId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setStatus('not_found');
            return;
          }
          throw new Error(`HTTP ${response.status}`);
        }

        const data: TransactionData = await response.json();
        setTxData(data);

        switch (data.tx_status) {
          case 'success':
            setStatus('success');
            break;
          case 'abort_by_response':
          case 'abort_by_post_condition':
            setStatus('failed');
            break;
          default:
            setStatus('pending');
        }
      } catch (err) {
        console.error('Error checking transaction status:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('failed');
      }
    };

    // Check immediately
    checkTransactionStatus();

    // Poll every 10 seconds if still pending
    const interval = setInterval(() => {
      if (status === 'pending') {
        checkTransactionStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [txId, status]);

  if (!txId) return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'not_found':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'success':
        return 'Transaction confirmed successfully!';
      case 'failed':
        return error ? `Transaction failed: ${error}` : 'Transaction failed';
      case 'not_found':
        return 'Transaction not found. It may take a few moments to appear.';
      default:
        return 'Transaction pending confirmation...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'not_found':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-700';
    }
  };

  return (
    <div className={`p-4 border rounded-lg mb-4 ${getStatusColor()}`}>
      <div className="flex items-center gap-3">
        {getStatusIcon()}
        <div className="flex-1">
          <div className="font-medium">{getStatusMessage()}</div>
          {txData?.block_height && (
            <div className="text-sm opacity-75 mt-1">
              Block: {txData.block_height}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-sm font-medium hover:underline"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
