'use client';

import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, Loader2 } from 'lucide-react';

export const ConnectButton = () => {
  const { connected, address, isLoading, connect, disconnect } = useWallet();

  if (isLoading) {
    return (
      <button
        disabled
        className="flex items-center space-x-2 bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading...</span>
      </button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </div>
        <button
          onClick={disconnect}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
    >
      <Wallet className="h-4 w-4" />
      <span>Connect Wallet</span>
    </button>
  );
};
