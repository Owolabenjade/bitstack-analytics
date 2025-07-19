import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            BitStack Analytics
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Cross-Chain Bitcoin Portfolio Analytics Dashboard
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Track your Bitcoin ecosystem investments across multiple layers with
            advanced analytics, real-time price data, and smart contract
            integration. Built on Stacks, the leading Bitcoin Layer 2.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md card-hover">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Portfolio Tracking</h3>
              <p className="text-gray-600">
                Monitor your Bitcoin and Stacks assets with real-time valuations
                and performance metrics
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md card-hover">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Deep insights with correlation analysis, risk metrics, and
                performance visualization
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md card-hover">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Stacks Integration</h3>
              <p className="text-gray-600">
                Powered by Bitcoin's premier smart contract layer for security
                and transparency
              </p>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Why Choose BitStack Analytics?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Real-Time Price Data
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Live Bitcoin and STX prices with 24h change indicators
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Multiple Portfolios
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Create and manage multiple investment portfolios
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Performance Analytics
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Sharpe ratio, volatility, drawdown analysis
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Correlation Matrix
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Understand asset relationships and diversification
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Wallet Integration
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Seamless Stacks wallet connection and authentication
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Free to Use</h4>
                    <p className="text-gray-600 text-sm">
                      Built entirely on free infrastructure for everyone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              Launch Dashboard
            </Link>
            <Link
              href="/analytics"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
            >
              View Analytics
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
