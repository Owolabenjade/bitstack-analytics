'use client';

import { useWallet } from '@/hooks/useWallet';
import { Wallet, LogOut, Loader2, User } from 'lucide-react';

interface ConnectButtonProps {
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const ConnectButton = ({
  size = 'md',
  showDetails = true,
}: ConnectButtonProps) => {
  const { connected, address, isLoading, connect, disconnect, userData } =
    useWallet();

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className={`flex items-center space-x-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed ${getSizeClasses()}`}
      >
        <Loader2 className={`${getIconSize()} animate-spin`} />
        <span>Loading...</span>
      </button>
    );
  }

  if (connected && address) {
    return (
      <div className="flex items-center space-x-2">
        {showDetails && (
          <div className="hidden sm:flex items-center space-x-2">
            {userData?.profile?.name && (
              <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-lg">
                <User className="h-3 w-3 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {userData.profile.name}
                </span>
              </div>
            )}
            <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
              {`${address.slice(0, 6)}...${address.slice(-4)}`}
            </div>
          </div>
        )}
        <button
          onClick={disconnect}
          className={`flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors ${getSizeClasses()}`}
        >
          <LogOut className={getIconSize()} />
          <span className="hidden sm:inline">Disconnect</span>
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      className={`flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors font-medium ${getSizeClasses()}`}
    >
      <Wallet className={getIconSize()} />
      <span>Connect Wallet</span>
    </button>
  );
};
