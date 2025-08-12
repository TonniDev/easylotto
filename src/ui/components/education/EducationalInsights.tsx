'use client';

import React from 'react';
import { Card, CardBody, Chip } from '@heroui/react';
import { EducationalInsight } from '@lib/definitions/multiGameScenario';

interface EducationalInsightsProps {
  insights: EducationalInsight[];
  className?: string;
}

/**
 * Get icon for insight type
 */
const getInsightIcon = (type: EducationalInsight['type']) => {
  switch (type) {
    case 'shocking':
      return '⚡';
    case 'warning':
      return '⚠️';
    case 'comparison':
      return '📊';
    case 'info':
      return 'ℹ️';
    default:
      return '💡';
  }
};

/**
 * Get color scheme for insight type
 */
const getInsightColor = (type: EducationalInsight['type']) => {
  switch (type) {
    case 'shocking':
      return {
        chipColor: 'danger' as const,
        cardClass: 'border-danger/20 bg-danger/5',
        titleClass: 'text-danger',
      };
    case 'warning':
      return {
        chipColor: 'warning' as const,
        cardClass: 'border-warning/20 bg-warning/5',
        titleClass: 'text-warning',
      };
    case 'comparison':
      return {
        chipColor: 'primary' as const,
        cardClass: 'border-primary/20 bg-primary/5',
        titleClass: 'text-primary',
      };
    case 'info':
      return {
        chipColor: 'default' as const,
        cardClass: 'border-default/20 bg-default/5',
        titleClass: 'text-foreground',
      };
    default:
      return {
        chipColor: 'default' as const,
        cardClass: 'border-default/20 bg-default/5',
        titleClass: 'text-foreground',
      };
  }
};

/**
 * Individual insight card component
 */
const InsightCard: React.FC<{ insight: EducationalInsight; index: number }> = ({
  insight,
  index,
}) => {
  const { chipColor, cardClass, titleClass } = getInsightColor(insight.type);
  const icon = getInsightIcon(insight.type);

  return (
    <Card
      className={`${cardClass} border transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0 mt-1">
            {icon}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className={`font-semibold text-sm ${titleClass}`}>
                {insight.title}
              </h4>
              <Chip
                size="sm"
                color={chipColor}
                variant="flat"
                className="text-xs"
              >
                {insight.type.toUpperCase()}
              </Chip>
            </div>
            <p className="text-sm text-foreground-600 leading-relaxed">
              {insight.message}
            </p>
            {insight.value && (
              <div className="mt-2">
                <Chip
                  size="sm"
                  color={chipColor}
                  variant="solid"
                  className="font-mono font-bold"
                >
                  {insight.value}
                </Chip>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * Component to display educational insights about lottery scenarios
 */
export const EducationalInsights: React.FC<EducationalInsightsProps> = ({
  insights,
  className = '',
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  // Sort insights by priority (shocking first, then warning, etc.)
  const sortedInsights = [...insights].sort((a, b) => {
    const priority = { shocking: 0, warning: 1, comparison: 2, info: 3 };
    return priority[a.type] - priority[b.type];
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-foreground">
          💡 Educational Insights
        </h3>
        <Chip size="sm" color="secondary" variant="flat">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </Chip>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {sortedInsights.map((insight, index) => (
          <InsightCard
            key={`${insight.type}-${index}`}
            insight={insight}
            index={index}
          />
        ))}
      </div>
      
      {/* Summary message */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardBody className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h4 className="font-semibold text-secondary mb-2">
                Key Takeaway
              </h4>
              <p className="text-sm text-foreground-600 leading-relaxed">
                These calculations demonstrate the mathematical reality of lottery playing. 
                While playing is a personal choice, understanding the true odds and costs 
                helps you make informed financial decisions.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

/**
 * Compact version for smaller displays
 */
export const EducationalInsightsCompact: React.FC<EducationalInsightsProps> = ({
  insights,
  className = '',
}) => {
  if (!insights || insights.length === 0) {
    return null;
  }

  // Show only the most important insights in compact mode
  const importantInsights = insights
    .filter(insight => insight.type === 'shocking' || insight.type === 'warning')
    .slice(0, 2);

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-md font-semibold text-foreground flex items-center gap-2">
        💡 Key Insights
        <Chip size="sm" color="secondary" variant="flat" className="text-xs">
          {importantInsights.length}
        </Chip>
      </h4>
      
      <div className="space-y-3">
        {importantInsights.map((insight, index) => (
          <div
            key={`compact-${insight.type}-${index}`}
            className="flex items-start gap-2 p-3 rounded-lg bg-default/50 border border-default/20"
          >
            <div className="text-lg flex-shrink-0">
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground-600 leading-relaxed">
                {insight.message}
              </p>
              {insight.value && (
                <Chip
                  size="sm"
                  color={getInsightColor(insight.type).chipColor}
                  variant="flat"
                  className="mt-2 text-xs font-mono"
                >
                  {insight.value}
                </Chip>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
