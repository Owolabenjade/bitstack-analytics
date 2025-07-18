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
            Track your Bitcoin ecosystem investments across multiple layers.
            Built on Stacks, the leading Bitcoin Layer 2 for smart contracts and
            DeFi.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Portfolio Tracking</h3>
              <p className="text-gray-600">
                Monitor your Bitcoin and Stacks assets in real-time
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-gray-600">
                Advanced metrics and performance insights
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
              <p className="text-gray-600">
                Powered by Stacks blockchain technology
              </p>
            </div>
          </div>

          <div className="space-x-4">
            <Link
              href="/dashboard"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Launch App
            </Link>
            <Link
              href="/about"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
