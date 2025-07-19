'use client';

import { WalletInfo } from '@/components/wallet/WalletInfo';
import { useWallet } from '@/hooks/useWallet';
import { TrendingUp, DollarSign, PieChart, BarChart3 } from 'lucide-react';

export default function Dashboard() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Track your Bitcoin ecosystem portfolio performance
          </p>
        </div>

        {/* Wallet Status */}
        <div className="mb-8">
          <WalletInfo />
        </div>

        {connected ? (
          <>
            {/* Portfolio Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">$0.00</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">24h Change</p>
                    <p className="text-2xl font-bold text-green-600">+0.00%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Assets</p>
                    <p className="text-2xl font-bold text-gray-900">0</p>
                  </div>
                  <PieChart className="h-8 w-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Performance</p>
                    <p className="text-2xl font-bold text-gray-900">-</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Portfolio Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Asset Allocation
                </h3>
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <PieChart className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No assets added yet</p>
                    <p className="text-sm">
                      Connect wallet and add assets to see allocation
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Recent Activity
                </h3>
                <div className="flex items-center justify-center h-48 text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No activity yet</p>
                    <p className="text-sm">
                      Your portfolio activity will appear here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Connect Your Wallet to Get Started
            </h3>
            <p className="text-gray-600 mb-6">
              Connect your Stacks wallet to start tracking your Bitcoin
              ecosystem portfolio
            </p>
            <div className="text-sm text-gray-500">
              <p>• Track Bitcoin and STX holdings</p>
              <p>• Monitor portfolio performance</p>
              <p>• Access advanced analytics</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
