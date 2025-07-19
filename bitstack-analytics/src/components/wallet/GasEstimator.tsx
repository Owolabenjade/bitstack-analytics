'use client';

import { GasEstimate, formatGasEstimate } from '@/lib/stacks/gasEstimation';
import { Fuel, Info } from 'lucide-react';

interface GasEstimatorProps {
  estimate: GasEstimate | null;
  isLoading?: boolean;
  showDetails?: boolean;
}

export const GasEstimator = ({
  estimate,
  isLoading = false,
  showDetails = false,
}: GasEstimatorProps) => {
  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <Fuel className="h-4 w-4 text-blue-500 animate-pulse" />
          <span className="text-sm text-blue-700 font-medium">
            Estimating gas costs...
          </span>
        </div>
      </div>
    );
  }

  if (!estimate) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Fuel className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700 font-medium">
            Estimated Gas Cost
          </span>
        </div>
        <span className="text-sm font-semibold text-blue-900">
          {formatGasEstimate(estimate)}
        </span>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-600">Gas Units:</span>
              <span className="font-medium text-blue-900">
                {estimate.estimatedGas.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Fee (STX):</span>
              <span className="font-medium text-blue-900">
                {(estimate.estimatedFee / 1000000).toFixed(6)}
              </span>
            </div>
          </div>

          <div className="mt-2 flex items-start space-x-2">
            <Info className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-600">
              Gas costs are estimates and may vary based on network conditions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
