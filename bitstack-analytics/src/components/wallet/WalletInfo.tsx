'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useGasEstimation } from '@/hooks/useGasEstimation';
import { TransactionHistory } from './TransactionHistory';
import {
  Wallet,
  Copy,
  ExternalLink,
  Fuel,
  Activity,
  Settings,
  User,
} from 'lucide-react';

export const WalletInfo = () => {
  const { userData, address, disconnect, getBalance } = useWallet();
  const { estimates } = useGasEstimation();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState<{
    stx: {
      balance: number;
      locked: number;
      totalSent: number;
      totalReceived: number;
    };
  } | null>(null);

  useEffect(() => {
    if (address) {
      getBalance().then(setBalance);
    }
  }, [address, getBalance]);

  if (!userData || !address) {
    return null;
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  };

  const openInExplorer = (address: string) => {
    const explorerUrl = `https://explorer.stacks.co/address/${address}?chain=testnet`;
    window.open(explorerUrl, '_blank');
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatSTX = (microSTX: number) => {
    return (microSTX / 1000000).toFixed(6);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'gas', label: 'Gas Estimates', icon: Fuel },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Wallet Overview Card */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Wallet Connected</h2>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded">
              Testnet
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Stacks wallet integration for portfolio management
          </p>
        </div>
        <div className="p-4 space-y-4">
          {/* Profile Info */}
          {userData.profile?.name && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Profile Name
              </label>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono">{userData.profile.name}</span>
              </div>
            </div>
          )}

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Testnet Address
            </label>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-sm">
                {truncateAddress(address)}
              </span>
              <button
                onClick={() => copyToClipboard(address, 'Address')}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Copy
                  className={`h-3 w-3 ${copiedField === 'Address' ? 'text-green-600' : ''}`}
                />
              </button>
              <button
                onClick={() => openInExplorer(address)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Balance */}
          {balance && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                STX Balance
              </label>
              <div className="mt-1">
                <span className="font-mono text-lg font-semibold">
                  {formatSTX(balance.stx.balance)} STX
                </span>
                {balance.stx.locked > 0 && (
                  <div className="text-sm text-gray-500">
                    Locked: {formatSTX(balance.stx.locked)} STX
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={disconnect}
              className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4 mr-2 inline" />
              Disconnect
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b">
          <div className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wallet Overview</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Network</h4>
                  <p className="text-sm text-gray-600">
                    Connected to Stacks Testnet for development and testing
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Transaction Count</h4>
                  <p className="text-sm text-gray-600">
                    {balance
                      ? `${balance.stx.totalSent > 0 || balance.stx.totalReceived > 0 ? 'Active' : 'New'} wallet`
                      : 'Loading...'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && <TransactionHistory />}

          {activeTab === 'gas' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Gas Estimation</h3>
              {Object.keys(estimates).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Fuel className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No gas estimates available</p>
                  <p className="text-sm">
                    Gas estimates will appear when you perform transactions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(estimates).map(([id, estimate]) => (
                    <div
                      key={id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{id}</div>
                        {estimate.error && (
                          <div className="text-sm text-red-600">
                            {estimate.error}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        {estimate.isLoading ? (
                          <div className="text-sm text-gray-500">
                            Estimating...
                          </div>
                        ) : estimate.error ? (
                          <div className="text-sm text-red-600">Failed</div>
                        ) : (
                          <div>
                            <div className="font-mono text-sm">
                              {(estimate.estimatedFee / 1000000).toFixed(6)} STX
                            </div>
                            <div className="text-xs text-gray-500">
                              {estimate.feeRate.toFixed(2)} µSTX/byte
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wallet Settings</h3>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Network Configuration</h4>
                  <p className="text-sm text-gray-600">
                    Currently connected to Stacks Testnet. Switch networks in
                    your wallet to change.
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Transaction Preferences</h4>
                  <p className="text-sm text-gray-600">
                    Default gas settings and confirmation preferences can be
                    configured in your wallet.
                  </p>
                </div>

                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <h4 className="font-medium mb-2 text-red-700">
                    Security Notice
                  </h4>
                  <p className="text-sm text-red-600 mb-3">
                    This is a testnet environment. Never use real funds or
                    production keys.
                  </p>
                  <button
                    onClick={disconnect}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
