'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ProbabilityChartProps {
  winningPercentage: number;
  neverWinningPercentage: number;
  height?: number;
  className?: string;
}

/**
 * Custom tooltip for probability chart
 */
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-background border border-divider rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-1">{data.name}</p>
        <p className="text-sm text-foreground-600">
          {data.value.toFixed(1)}% chance
        </p>
        {data.name === 'Never Win' && (
          <p className="text-xs text-danger mt-1 font-medium">
            Most likely outcome!
          </p>
        )}
      </div>
    );
  }
  return null;
};

/**
 * Custom label for pie chart
 */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null; // Don't show label if slice is too small

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

/**
 * Pie chart showing probability of winning vs never winning
 */
export const ProbabilityChart: React.FC<ProbabilityChartProps> = ({
  winningPercentage,
  neverWinningPercentage,
  height = 300,
  className = '',
}) => {
  const data = [
    {
      name: 'Win At Least Once',
      value: winningPercentage,
      color: 'hsl(var(--success))',
    },
    {
      name: 'Never Win',
      value: neverWinningPercentage,
      color: 'hsl(var(--danger))',
    },
  ];

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            strokeWidth={2}
            stroke="hsl(var(--background))"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Horizontal bar version for compact displays
 */
export const ProbabilityBarChart: React.FC<ProbabilityChartProps> = ({
  winningPercentage,
  neverWinningPercentage,
  className = '',
}) => {
  return (
    <div className={`w-full space-y-3 ${className}`}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-success">
            Win At Least Once
          </span>
          <span className="text-sm font-bold text-success">
            {winningPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-default-200 rounded-full h-3">
          <div
            className="bg-success h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${winningPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-danger">
            Never Win
          </span>
          <span className="text-sm font-bold text-danger">
            {neverWinningPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-default-200 rounded-full h-3">
          <div
            className="bg-danger h-3 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${neverWinningPercentage}%` }}
          />
        </div>
      </div>
      
      {neverWinningPercentage > 50 && (
        <div className="text-center">
          <p className="text-xs text-danger font-medium bg-danger/10 rounded-lg px-3 py-2">
            ⚠️ Most likely outcome: You'll never win!
          </p>
        </div>
      )}
    </div>
  );
};
