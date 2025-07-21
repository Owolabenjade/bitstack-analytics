'use client';

import { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSettings } from '@/hooks/useSettings';
import { TransactionStatus } from '@/components/contracts/TransactionStatus';
import {
  Settings,
  Database,
  Wallet,
  Bell,
  Shield,
  Monitor,
  Save,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const { connected, address, connect, disconnect } = useWallet();
  const {
    notifications,
    display,
    privacy,
    hasUnsavedChanges,
    updateNotifications,
    updateDisplay,
    updatePrivacy,
    handleResetSettings,
  } = useSettings();

  const [contractIntegration, setContractIntegration] = useState(true);
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

        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2 text-yellow-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">You have unsaved changes</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

            {/* Display Preferences */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Monitor className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Display Preferences
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <select
                    value={display.theme}
                    onChange={(e) =>
                      updateDisplay({ theme: e.target.value as any })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Currency
                  </label>
                  <select
                    value={display.currency}
                    onChange={(e) =>
                      updateDisplay({ currency: e.target.value as any })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="USD">US Dollar ($)</option>
                    <option value="BTC">Bitcoin (₿)</option>
                    <option value="STX">Stacks (STX)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Decimal Places
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="8"
                    value={display.showDecimals}
                    onChange={(e) =>
                      updateDisplay({ showDecimals: parseInt(e.target.value) })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Refresh Interval
                  </label>
                  <select
                    value={display.refreshInterval}
                    onChange={(e) =>
                      updateDisplay({
                        refreshInterval: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value={30}>30 seconds</option>
                    <option value={60}>1 minute</option>
                    <option value={300}>5 minutes</option>
                    <option value={600}>10 minutes</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Compact Mode</p>
                  <p className="text-sm text-gray-600">
                    Use a more condensed layout
                  </p>
                </div>
                <button
                  onClick={() =>
                    updateDisplay({ compactMode: !display.compactMode })
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    display.compactMode ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      display.compactMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
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
                  Notification Preferences
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
                    onClick={() =>
                      updateNotifications({
                        priceAlerts: !notifications.priceAlerts,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.priceAlerts
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.priceAlerts
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Transaction Confirmations
                    </p>
                    <p className="text-sm text-gray-600">
                      Notifications when transactions are confirmed
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateNotifications({
                        transactionConfirmations:
                          !notifications.transactionConfirmations,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.transactionConfirmations
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.transactionConfirmations
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Portfolio Updates
                    </p>
                    <p className="text-sm text-gray-600">
                      Updates about portfolio performance changes
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updateNotifications({
                        portfolioUpdates: !notifications.portfolioUpdates,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notifications.portfolioUpdates
                        ? 'bg-orange-500'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications.portfolioUpdates
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Privacy Settings
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Show Balances</p>
                    <p className="text-sm text-gray-600">
                      Display actual portfolio values and balances
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePrivacy({ showBalances: !privacy.showBalances })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.showBalances ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.showBalances ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Hide Small Amounts
                    </p>
                    <p className="text-sm text-gray-600">
                      Hide assets with very small values
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePrivacy({
                        hideSmallAmounts: !privacy.hideSmallAmounts,
                      })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.hideSmallAmounts ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.hideSmallAmounts
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Allow Analytics</p>
                    <p className="text-sm text-gray-600">
                      Help improve the app with usage data
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      updatePrivacy({ allowAnalytics: !privacy.allowAnalytics })
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      privacy.allowAnalytics ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        privacy.allowAnalytics
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Settings */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Reset Settings
                  </h3>
                  <p className="text-sm text-gray-600">
                    Reset all preferences to defaults
                  </p>
                </div>
                <button
                  onClick={handleResetSettings}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {hasUnsavedChanges && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <button
                  onClick={() => console.log('Saving settings...')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-md transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Transaction
              </h3>
              <TransactionStatus />
            </div>

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
              </div>
            </div>

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
