'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface AllocationData {
  name: string;
  value: number;
  allocation: number;
  color: string;
}

interface AllocationChartProps {
  data: AllocationData[];
  height?: number;
}

const COLORS = [
  '#f97316',
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
];

export const AllocationChart = ({
  data,
  height = 300,
}: AllocationChartProps) => {
  const formatTooltip = (value: any, name: string, props: any) => {
    const { payload } = props;
    return [
      `${formatCurrency(payload.value)} (${formatPercentage(payload.allocation)})`,
      payload.name,
    ];
  };

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No allocation data available</p>
          <p className="text-sm">Add assets to see allocation breakdown</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, allocation }) =>
              `${name} (${formatPercentage(allocation)})`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={formatTooltip} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
