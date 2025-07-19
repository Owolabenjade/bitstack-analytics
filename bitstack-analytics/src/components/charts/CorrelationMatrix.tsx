'use client';

import { AssetCorrelation } from '@/stores/analyticsStore';

interface CorrelationMatrixProps {
  correlations: AssetCorrelation[];
  assets: string[];
}

export const CorrelationMatrix = ({
  correlations,
  assets,
}: CorrelationMatrixProps) => {
  const getCorrelation = (asset1: string, asset2: string): number => {
    if (asset1 === asset2) return 1;

    const correlation = correlations.find(
      (c) =>
        (c.asset1 === asset1 && c.asset2 === asset2) ||
        (c.asset1 === asset2 && c.asset2 === asset1)
    );

    return correlation?.correlation || 0;
  };

  const getCorrelationColor = (correlation: number): string => {
    const abs = Math.abs(correlation);
    if (abs > 0.7) return correlation > 0 ? 'bg-green-500' : 'bg-red-500';
    if (abs > 0.4) return correlation > 0 ? 'bg-green-300' : 'bg-red-300';
    if (abs > 0.2) return correlation > 0 ? 'bg-green-100' : 'bg-red-100';
    return 'bg-gray-100';
  };

  const formatAssetName = (asset: string): string => {
    return asset === 'bitcoin'
      ? 'BTC'
      : asset === 'stacks'
        ? 'STX'
        : asset.toUpperCase();
  };

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">🔗</div>
          <p>No correlation data available</p>
          <p className="text-sm">Add multiple assets to see correlations</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead>
          <tr>
            <th className="p-2 text-left font-medium text-gray-700"></th>
            {assets.map((asset) => (
              <th
                key={asset}
                className="p-2 text-center font-medium text-gray-700 min-w-16"
              >
                {formatAssetName(asset)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset1) => (
            <tr key={asset1}>
              <td className="p-2 font-medium text-gray-700">
                {formatAssetName(asset1)}
              </td>
              {assets.map((asset2) => {
                const correlation = getCorrelation(asset1, asset2);
                return (
                  <td key={asset2} className="p-1">
                    <div
                      className={`w-12 h-8 flex items-center justify-center rounded text-xs font-medium text-white ${getCorrelationColor(correlation)}`}
                      title={`Correlation: ${correlation.toFixed(3)}`}
                    >
                      {correlation.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p>
          <strong>Correlation Guide:</strong>
        </p>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>Strong Positive (&gt;0.7)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-300 rounded"></div>
            <span>Moderate Positive (0.4-0.7)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 rounded border"></div>
            <span>Weak (-0.2 to 0.2)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-300 rounded"></div>
            <span>Moderate Negative (-0.7 to -0.4)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Strong Negative (&lt;-0.7)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
