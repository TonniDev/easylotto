'use client';

import React from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Progress,
  Chip,
  Button,
} from '@heroui/react';
import { RiskDashboardSummary } from '@lib/definitions/riskAssessment';
import { formatCurrency } from '@lib/definitions/riskAssessment';

interface DashboardSummaryProps {
  summary: RiskDashboardSummary;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Get color scheme for goal progress
 */
const getGoalProgressColor = (percentage: number, isExceeded: boolean) => {
  if (isExceeded) return 'danger';
  if (percentage >= 80) return 'warning';
  if (percentage >= 60) return 'primary';
  return 'success';
};

/**
 * Get spending trend indicator
 */
const getSpendingTrend = (trends: RiskDashboardSummary['trends']) => {
  if (trends.length < 2) return { direction: 'stable', percentage: 0 };
  
  const latest = trends[trends.length - 1];
  const previous = trends[trends.length - 2];
  
  if (latest.amount === previous.amount) return { direction: 'stable', percentage: 0 };
  
  const change = ((latest.amount - previous.amount) / previous.amount) * 100;
  return {
    direction: change > 0 ? 'up' : 'down',
    percentage: Math.abs(change),
  };
};

/**
 * Main dashboard summary component
 */
export const DashboardSummary: React.FC<DashboardSummaryProps> = ({
  summary,
  onRefresh,
  isLoading = false,
  className = '',
}) => {
  const trend = getSpendingTrend(summary.trends);
  const hasActiveGoals = summary.goalProgress.length > 0;
  const hasInsights = summary.insights.length > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                💰 Risk Assessment Dashboard
              </h1>
              <p className="text-foreground-600 text-sm">
                Track your spending patterns and discover financial opportunities
              </p>
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={onRefresh}
              isLoading={isLoading}
              startContent={!isLoading ? "🔄" : undefined}
            >
              Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-primary mb-1">
              {formatCurrency(summary.totalSpending)}
            </div>
            <div className="text-xs text-foreground-600">Total Spending</div>
            <div className="text-xs text-foreground-500 mt-1">Last 12 months</div>
          </CardBody>
        </Card>

        <Card className="border-danger/20">
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-danger mb-1">
              {formatCurrency(summary.lotterySpending)}
            </div>
            <div className="text-xs text-foreground-600">Lottery Spending</div>
            <div className="text-xs text-foreground-500 mt-1">
              {summary.totalSpending > 0 
                ? `${((summary.lotterySpending / summary.totalSpending) * 100).toFixed(1)}% of total`
                : 'No spending yet'
              }
            </div>
          </CardBody>
        </Card>

        <Card className="border-success/20">
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-success mb-1">
              {formatCurrency(summary.investmentSpending)}
            </div>
            <div className="text-xs text-foreground-600">Investment Spending</div>
            <div className="text-xs text-foreground-500 mt-1">
              {summary.totalSpending > 0 
                ? `${((summary.investmentSpending / summary.totalSpending) * 100).toFixed(1)}% of total`
                : 'Start investing!'
              }
            </div>
          </CardBody>
        </Card>

        <Card className="border-warning/20">
          <CardBody className="text-center p-4">
            <div className="text-2xl font-bold text-warning mb-1">
              {formatCurrency(summary.opportunityCost)}
            </div>
            <div className="text-xs text-foreground-600">Opportunity Cost</div>
            <div className="text-xs text-foreground-500 mt-1">
              If invested at 8% annual
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Current Period & Trend */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">📈 Current Period Overview</h2>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl font-bold text-foreground">
                  {formatCurrency(summary.currentPeriodSpending)}
                </div>
                <div className="flex items-center gap-1">
                  {trend.direction === 'up' && (
                    <Chip size="sm" color="danger" variant="flat" startContent="📈">
                      +{trend.percentage.toFixed(1)}%
                    </Chip>
                  )}
                  {trend.direction === 'down' && (
                    <Chip size="sm" color="success" variant="flat" startContent="📉">
                      -{trend.percentage.toFixed(1)}%
                    </Chip>
                  )}
                  {trend.direction === 'stable' && (
                    <Chip size="sm" color="default" variant="flat" startContent="➡️">
                      Stable
                    </Chip>
                  )}
                </div>
              </div>
              <p className="text-sm text-foreground-600">
                This month's spending compared to last month
              </p>
            </div>

            <div>
              <h3 className="font-medium text-foreground mb-3">Recent Trends</h3>
              <div className="space-y-2">
                {summary.trends.slice(-3).map((trend, index) => (
                  <div key={trend.period} className="flex justify-between items-center text-sm">
                    <span className="text-foreground-600">{trend.period}</span>
                    <span className="font-medium">{formatCurrency(trend.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Goal Progress */}
      {hasActiveGoals && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">🎯 Goal Progress</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {summary.goalProgress.map((goal, index) => {
                const progressColor = getGoalProgressColor(goal.percentage, goal.isExceeded);
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium capitalize">
                          {goal.goalType} Goal
                        </span>
                        {goal.isExceeded && (
                          <Chip size="sm" color="danger" variant="solid">
                            Exceeded
                          </Chip>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">{formatCurrency(goal.spent)}</span>
                        <span className="text-foreground-500"> / {formatCurrency(goal.limit)}</span>
                      </div>
                    </div>
                    <Progress
                      value={Math.min(goal.percentage, 100)}
                      color={progressColor}
                      className="max-w-full"
                      size="md"
                    />
                    <div className="flex justify-between text-xs text-foreground-500">
                      <span>{goal.percentage.toFixed(1)}% of limit</span>
                      {goal.isExceeded ? (
                        <span className="text-danger font-medium">
                          Over by {formatCurrency(goal.spent - goal.limit)}
                        </span>
                      ) : (
                        <span>
                          {formatCurrency(goal.limit - goal.spent)} remaining
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Insights */}
      {hasInsights && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">💡 Recent Insights</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {summary.insights.slice(0, 3).map((insight) => (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border ${
                    insight.severity === 'danger' 
                      ? 'border-danger/20 bg-danger/5' 
                      : insight.severity === 'warning'
                      ? 'border-warning/20 bg-warning/5'
                      : 'border-default/20 bg-default/5'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg flex-shrink-0">
                      {insight.severity === 'danger' ? '🚨' : 
                       insight.severity === 'warning' ? '⚠️' : '💡'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-foreground mb-1">
                        {insight.title}
                      </h4>
                      <p className="text-xs text-foreground-600 leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                    <Chip
                      size="sm"
                      color={
                        insight.severity === 'danger' ? 'danger' :
                        insight.severity === 'warning' ? 'warning' : 'default'
                      }
                      variant="flat"
                      className="text-xs"
                    >
                      {insight.severity.toUpperCase()}
                    </Chip>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Empty State */}
      {!hasActiveGoals && !hasInsights && summary.totalSpending === 0 && (
        <Card className="border-dashed border-2 border-default/30">
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Welcome to Your Risk Assessment Dashboard
            </h3>
            <p className="text-foreground-600 mb-4">
              Start tracking your spending to get personalized insights and financial guidance.
            </p>
            <Button color="primary" size="lg">
              Add Your First Spending Entry
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
