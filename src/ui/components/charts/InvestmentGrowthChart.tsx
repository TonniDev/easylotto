'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { InvestmentGrowthPoint } from '@lib/definitions/multiGameScenario';
import { formatBRL } from '@lib/utils/financial/compoundInterest';

interface InvestmentGrowthChartProps {
  data: InvestmentGrowthPoint[];
  height?: number;
  className?: string;
}

/**
 * Custom tooltip for the investment growth chart
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-divider rounded-lg p-3 shadow-lg">
        <p className="font-medium text-foreground mb-2">{`Year ${label}`}</p>
        <div className="space-y-1">
          <p className="text-danger text-sm">
            <span className="inline-block w-3 h-3 bg-danger rounded-full mr-2"></span>
            Lottery Cost: {formatBRL(payload[0].value)}
          </p>
          <p className="text-success text-sm">
            <span className="inline-block w-3 h-3 bg-success rounded-full mr-2"></span>
            Investment Value: {formatBRL(payload[1].value)}
          </p>
          <p className="text-primary text-sm font-medium">
            <span className="inline-block w-3 h-3 bg-primary rounded-full mr-2"></span>
            Difference: {formatBRL(payload[2].value)}
          </p>
        </div>
      </div>
    );
  }
  return null;
};

/**
 * Chart showing lottery cost vs investment growth over time
 */
export const InvestmentGrowthChart: React.FC<InvestmentGrowthChartProps> = ({
  data,
  height = 400,
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            className="text-foreground-500"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            className="text-foreground-500"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return `R$ ${(value / 1000000).toFixed(1)}M`;
              } else if (value >= 1000) {
                return `R$ ${(value / 1000).toFixed(0)}K`;
              }
              return formatBRL(value);
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px',
            }}
          />
          <Line
            type="monotone"
            dataKey="lotteryCost"
            stroke="hsl(var(--danger))"
            strokeWidth={3}
            name="Lottery Spending"
            dot={{ fill: 'hsl(var(--danger))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--danger))', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="investmentValue"
            stroke="hsl(var(--success))"
            strokeWidth={3}
            name="Investment Value"
            dot={{ fill: 'hsl(var(--success))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--success))', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="difference"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Opportunity Cost"
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Compact version for smaller displays
 */
export const InvestmentGrowthChartCompact: React.FC<InvestmentGrowthChartProps> = ({
  data,
  height = 250,
  className = '',
}) => {
  return (
    <InvestmentGrowthChart
      data={data}
      height={height}
      className={className}
    />
  );
};
