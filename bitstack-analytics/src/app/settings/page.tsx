'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { TransactionStatus } from '@/components/contracts/TransactionStatus';
import { Settings, Database, Wallet, Bell, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { connected, address, connect, disconnect } = useWallet();
  const [contractIntegration, setContractIntegration] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your BitStack Analytics preferences and integrations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Wallet Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Wallet className="h-5 w-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Wallet Connection
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Stacks Wallet</p>
                    <p className="text-sm text-gray-600">
                      {connected
                        ? `Connected: ${address?.slice(0, 8)}...${address?.slice(-8)}`
                        : 'Not connected'}
                    </p>
                  </div>
                  <button
                    onClick={connected ? disconnect : connect}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      connected
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {connected ? 'Disconnect' : 'Connect Wallet'}
                  </button>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">
                    Network:{' '}
                    <span className="font-medium capitalize">
                      {process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Contract Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Database className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Blockchain Integration
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Smart Contract Storage
                    </p>
                    <p className="text-sm text-gray-600">
                      Store portfolio data on Stacks blockchain
                    </p>
                  </div>
                  <button
                    onClick={() => setContractIntegration(!contractIntegration)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      contractIntegration ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        contractIntegration ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Auto-sync to Blockchain
                    </p>
                    <p className="text-sm text-gray-600">
                      Automatically sync portfolio changes
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoSync(!autoSync)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      autoSync ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        autoSync ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-700 font-medium">
                      Security Notice
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Blockchain storage provides immutable portfolio records but
                    requires gas fees for transactions.
                  </p>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bell className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Price Alerts</p>
                    <p className="text-sm text-gray-600">
                      Get notified of significant price changes
                    </p>
                  </div>
                  <button
                    onClick={() => setNotifications(!notifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transaction Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transaction
              </h3>
              <TransactionStatus />
            </div>

            {/* Contract Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contract Information
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Network</p>
                  <p className="font-medium capitalize">
                    {process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Contract Address</p>
                  <p className="font-mono text-xs break-all">
                    {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not deployed'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Contract Name</p>
                  <p className="font-medium">portfolio-tracker</p>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Help & Support
              </h3>
              <div className="space-y-2 text-sm">
                <a
                  href="#"
                  className="block text-orange-600 hover:text-orange-800 transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="block text-orange-600 hover:text-orange-800 transition-colors"
                >
                  Smart Contract Guide
                </a>
                <a
                  href="#"
                  className="block text-orange-600 hover:text-orange-800 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
