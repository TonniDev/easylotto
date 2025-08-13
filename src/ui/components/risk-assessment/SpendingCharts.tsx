'use client';

import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Tabs,
  Tab,
  Chip,
} from '@heroui/react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { RiskDashboardSummary, SpendingCategory } from '@lib/definitions/riskAssessment';
import { formatCurrency } from '@lib/definitions/riskAssessment';

interface SpendingChartsProps {
  summary: RiskDashboardSummary;
  className?: string;
}

/**
 * Category colors for charts
 */
const CATEGORY_COLORS = {
  lottery: '#f31260', // danger
  investment: '#17c964', // success
  other: '#006fee', // primary
};

/**
 * Custom tooltip for charts
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-content1 border border-default-200 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Custom pie chart label
 */
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  if (percent < 0.05) return null; // Don't show labels for slices < 5%
  
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

/**
 * Spending trends chart
 */
const TrendsChart: React.FC<{ trends: RiskDashboardSummary['trends'] }> = ({ trends }) => {
  if (trends.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-foreground-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📈</div>
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  const chartData = trends.map(trend => ({
    period: trend.period,
    amount: trend.amount,
    formattedPeriod: new Intl.DateTimeFormat('pt-BR', {
      month: 'short',
      year: '2-digit',
    }).format(new Date(trend.period + '-01')),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--nextui-default-300))" />
        <XAxis 
          dataKey="formattedPeriod" 
          stroke="hsl(var(--nextui-foreground-600))"
          fontSize={12}
        />
        <YAxis 
          stroke="hsl(var(--nextui-foreground-600))"
          fontSize={12}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke={CATEGORY_COLORS.lottery}
          fill={CATEGORY_COLORS.lottery}
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Category breakdown pie chart
 */
const CategoryChart: React.FC<{ summary: RiskDashboardSummary }> = ({ summary }) => {
  const categoryData = [
    {
      name: 'Lottery',
      value: summary.lotterySpending,
      color: CATEGORY_COLORS.lottery,
    },
    {
      name: 'Investment',
      value: summary.investmentSpending,
      color: CATEGORY_COLORS.investment,
    },
    {
      name: 'Other',
      value: summary.totalSpending - summary.lotterySpending - summary.investmentSpending,
      color: CATEGORY_COLORS.other,
    },
  ].filter(item => item.value > 0);

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-foreground-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🥧</div>
          <p>No spending data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderPieLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-3">
        {categoryData.map((category) => (
          <div key={category.name} className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <div>
              <div className="font-medium text-sm">{category.name}</div>
              <div className="text-xs text-foreground-600">
                {formatCurrency(category.value)}
              </div>
              <div className="text-xs text-foreground-500">
                {((category.value / summary.totalSpending) * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Opportunity cost comparison chart
 */
const OpportunityChart: React.FC<{ summary: RiskDashboardSummary }> = ({ summary }) => {
  const comparisonData = [
    {
      name: 'Current Spending',
      lottery: summary.lotterySpending,
      investment: 0,
    },
    {
      name: 'If Invested Instead',
      lottery: 0,
      investment: summary.opportunityCost,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Opportunity Cost Analysis
        </h3>
        <p className="text-sm text-foreground-600">
          What your lottery spending could have become if invested at 8% annual return
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--nextui-default-300))" />
          <XAxis 
            dataKey="name" 
            stroke="hsl(var(--nextui-foreground-600))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--nextui-foreground-600))"
            fontSize={12}
            tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="lottery" fill={CATEGORY_COLORS.lottery} name="Lottery Spending" />
          <Bar dataKey="investment" fill={CATEGORY_COLORS.investment} name="Investment Value" />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
          <div className="text-lg font-bold text-danger">
            {formatCurrency(summary.lotterySpending)}
          </div>
          <div className="text-xs text-foreground-600">Spent on Lottery</div>
        </div>
        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
          <div className="text-lg font-bold text-success">
            {formatCurrency(summary.opportunityCost)}
          </div>
          <div className="text-xs text-foreground-600">Potential Investment Value</div>
        </div>
      </div>
      
      {summary.opportunityCost > summary.lotterySpending && (
        <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
          <div className="text-sm font-medium text-warning">
            💰 Opportunity Cost: {formatCurrency(summary.opportunityCost - summary.lotterySpending)}
          </div>
          <div className="text-xs text-foreground-600 mt-1">
            This is how much more you could have had through investment
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Main spending charts component
 */
export const SpendingCharts: React.FC<SpendingChartsProps> = ({
  summary,
  className = '',
}) => {
  const hasData = summary.totalSpending > 0;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-lg font-semibold">📊 Spending Analysis</h2>
          {hasData && (
            <Chip color="primary" variant="flat">
              Last 12 months
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        {!hasData ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Data to Visualize
            </h3>
            <p className="text-foreground-600">
              Add some spending entries to see beautiful charts and analysis
            </p>
          </div>
        ) : (
          <Tabs color="primary" variant="underlined">
            <Tab key="trends" title="📈 Trends">
              <div className="pt-4">
                <TrendsChart trends={summary.trends} />
              </div>
            </Tab>
            
            <Tab key="categories" title="🥧 Categories">
              <div className="pt-4">
                <CategoryChart summary={summary} />
              </div>
            </Tab>
            
            <Tab key="opportunity" title="💰 Opportunity Cost">
              <div className="pt-4">
                <OpportunityChart summary={summary} />
              </div>
            </Tab>
          </Tabs>
        )}
      </CardBody>
    </Card>
  );
};
