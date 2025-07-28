'use client';

import { Suspense, lazy } from 'react';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import {
  SkeletonCard,
  SkeletonChart,
} from '@/components/loading/LoadingSkeleton';
import { RetryWrapper } from '@/components/error/RetryWrapper';
import { withErrorBoundary } from '@/components/error/ErrorBoundary';

// Lazy load components for better performance
const PriceCard = lazy(() => import('@/components/price/PriceCard'));
const PerformanceChart = lazy(
  () => import('@/components/charts/PerformanceChart')
);
const AllocationChart = lazy(
  () => import('@/components/charts/AllocationChart')
);

function DashboardPage() {
  const { measureSync } = usePerformanceMonitor();
  const { errors } = useErrorHandler(); // Removed handleNetworkError usage

  const handleRetry = async () => {
    // Refresh page data
    window.location.reload();
  };

  const dashboardError = errors.find((e) => e.type === 'network');

  return measureSync('dashboard-render', () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Monitor your Bitcoin and Stacks portfolio performance
        </p>
      </div>

      <RetryWrapper onRetry={handleRetry} error={dashboardError}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Cards */}
          <div className="lg:col-span-1 space-y-6">
            <Suspense fallback={<SkeletonCard />}>
              <PriceCard coinId="bitcoin" />
            </Suspense>

            <Suspense fallback={<SkeletonCard />}>
              <PriceCard coinId="stacks" />
            </Suspense>
          </div>

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<SkeletonChart />}>
              <PerformanceChart />
            </Suspense>

            <Suspense fallback={<SkeletonChart />}>
              <AllocationChart />
            </Suspense>
          </div>
        </div>
      </RetryWrapper>
    </div>
  ));
}

export default withErrorBoundary(DashboardPage);
