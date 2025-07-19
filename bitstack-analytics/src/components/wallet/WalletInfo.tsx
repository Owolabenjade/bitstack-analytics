'use client';

import { useWallet } from '@/hooks/useWallet';
import { CheckCircle, AlertCircle, Wallet } from 'lucide-react';

export const WalletInfo = () => {
  const { connected, address, userData, error } = useWallet();

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <span className="text-red-700 font-medium">Wallet Error</span>
        </div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700 font-medium">
            Wallet Not Connected
          </span>
        </div>
        <p className="text-gray-600 text-sm mt-1">
          Connect your Stacks wallet to start tracking your portfolio
        </p>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-3">
        <CheckCircle className="h-5 w-5 text-green-500" />
        <span className="text-green-700 font-medium">Wallet Connected</span>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Address: </span>
          <span className="text-gray-900 font-mono">
            {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : 'N/A'}
          </span>
        </div>

        {userData?.username && (
          <div>
            <span className="text-gray-600">Username: </span>
            <span className="text-gray-900">{userData.username}</span>
          </div>
        )}

        <div>
          <span className="text-gray-600">Network: </span>
          <span className="text-gray-900 capitalize">
            {process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'}
          </span>
        </div>
      </div>
    </div>
  );
};
