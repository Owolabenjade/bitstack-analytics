'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PortfolioPerformancePoint } from '@/stores/analyticsStore';
import { formatCurrency } from '@/lib/utils';

interface PerformanceChartProps {
  data: PortfolioPerformancePoint[];
  height?: number;
}

export const PerformanceChart = ({
  data,
  height = 300,
}: PerformanceChartProps) => {
  const formatTooltip = (value: number, name: string) => {
    if (name === 'value') {
      return [formatCurrency(value), 'Portfolio Value'];
    }
    return [value, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatXAxisLabel}
            stroke="#666"
            fontSize={12}
          />
          <YAxis
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            stroke="#666"
            fontSize={12}
          />
          <Tooltip
            formatter={formatTooltip}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              stroke: '#f97316',
              strokeWidth: 2,
              fill: 'white',
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
