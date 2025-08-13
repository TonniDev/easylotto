'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Accordion,
  AccordionItem,
  Badge,
  Tabs,
  Tab,
} from '@heroui/react';
import { SpendingInsight, InsightSeverity } from '@lib/definitions/riskAssessment';

interface InsightsPanelProps {
  insights: SpendingInsight[];
  onMarkAsRead?: (insightId: string) => Promise<void>;
  onDismiss?: (insightId: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

/**
 * Get insight display properties
 */
const getInsightDisplay = (severity: InsightSeverity) => {
  switch (severity) {
    case 'danger':
      return {
        color: 'danger' as const,
        icon: '🚨',
        bgClass: 'border-danger/30 bg-danger/10',
        label: 'Critical',
      };
    case 'warning':
      return {
        color: 'warning' as const,
        icon: '⚠️',
        bgClass: 'border-warning/30 bg-warning/10',
        label: 'Warning',
      };
    case 'info':
      return {
        color: 'primary' as const,
        icon: '💡',
        bgClass: 'border-primary/30 bg-primary/10',
        label: 'Info',
      };
  }
};

/**
 * Get insight type display name
 */
const getInsightTypeDisplay = (type: string) => {
  switch (type) {
    case 'opportunity_cost':
      return 'Opportunity Cost';
    case 'trend_warning':
      return 'Spending Trend';
    case 'milestone':
      return 'Milestone';
    case 'goal_exceeded':
      return 'Goal Alert';
    case 'achievement':
      return 'Achievement';
    default:
      return 'Insight';
  }
};

/**
 * Format insight creation date
 */
const formatInsightDate = (date: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - new Date(date).getTime();
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(date));
};

/**
 * Individual insight card component
 */
const InsightCard: React.FC<{
  insight: SpendingInsight;
  onMarkAsRead?: (id: string) => Promise<void>;
  onDismiss?: (id: string) => Promise<void>;
  isCompact?: boolean;
}> = ({ insight, onMarkAsRead, onDismiss, isCompact = false }) => {
  const [isActioning, setIsActioning] = useState(false);
  const display = getInsightDisplay(insight.severity);

  const handleAction = async (action: 'read' | 'dismiss') => {
    setIsActioning(true);
    try {
      if (action === 'read' && onMarkAsRead) {
        await onMarkAsRead(insight.id);
      } else if (action === 'dismiss' && onDismiss) {
        await onDismiss(insight.id);
      }
    } catch (error) {
      console.error('Error performing insight action:', error);
    } finally {
      setIsActioning(false);
    }
  };

  return (
    <Card className={`${display.bgClass} border transition-all duration-200 hover:scale-[1.01]`}>
      <CardBody className="p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">{display.icon}</div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm leading-tight">
                  {insight.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Chip size="sm" color={display.color} variant="solid">
                    {display.label}
                  </Chip>
                  <Chip size="sm" variant="flat" color="default">
                    {getInsightTypeDisplay(insight.insightType)}
                  </Chip>
                  {!insight.isRead && (
                    <Badge content="" color="primary" size="sm" placement="top-right">
                      <Chip size="sm" variant="flat" color="secondary">
                        New
                      </Chip>
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="text-xs text-foreground-500 flex-shrink-0">
                {formatInsightDate(insight.createdAt)}
              </div>
            </div>

            <p className="text-sm text-foreground-700 leading-relaxed mb-3">
              {insight.message}
            </p>

            {/* Data snapshot preview */}
            {insight.dataSnapshot && !isCompact && (
              <div className="bg-default/30 rounded-lg p-2 mb-3">
                <div className="text-xs text-foreground-600">
                  <strong>Key Data:</strong>
                  {insight.dataSnapshot.totalSpent && (
                    <span className="ml-2">
                      Total Spent: R$ {insight.dataSnapshot.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  {insight.dataSnapshot.opportunityCost && (
                    <span className="ml-2">
                      Opportunity Cost: R$ {insight.dataSnapshot.opportunityCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {!insight.isRead && onMarkAsRead && (
                <Button
                  size="sm"
                  variant="flat"
                  color="primary"
                  onPress={() => handleAction('read')}
                  isLoading={isActioning}
                  isDisabled={isActioning}
                >
                  Mark as Read
                </Button>
              )}
              
              {onDismiss && (
                <Button
                  size="sm"
                  variant="flat"
                  color="default"
                  onPress={() => handleAction('dismiss')}
                  isLoading={isActioning}
                  isDisabled={isActioning}
                >
                  Dismiss
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

/**
 * Main insights panel component
 */
export const InsightsPanel: React.FC<InsightsPanelProps> = ({
  insights,
  onMarkAsRead,
  onDismiss,
  onRefresh,
  isLoading = false,
  className = '',
}) => {
  const [selectedTab, setSelectedTab] = useState('all');

  // Filter insights by tab
  const filteredInsights = insights.filter(insight => {
    if (selectedTab === 'unread') return !insight.isRead;
    if (selectedTab === 'critical') return insight.severity === 'danger';
    return true; // 'all' tab
  });

  // Group insights by severity
  const insightsBySeverity = filteredInsights.reduce((acc, insight) => {
    acc[insight.severity] = acc[insight.severity] || [];
    acc[insight.severity].push(insight);
    return acc;
  }, {} as Record<InsightSeverity, SpendingInsight[]>);

  const unreadCount = insights.filter(i => !i.isRead).length;
  const criticalCount = insights.filter(i => i.severity === 'danger').length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <div>
              <h2 className="text-lg font-semibold">💡 Financial Insights</h2>
              <p className="text-sm text-foreground-600">
                Personalized insights based on your spending patterns
              </p>
            </div>
            
            {onRefresh && (
              <Button
                variant="flat"
                size="sm"
                onPress={onRefresh}
                isLoading={isLoading}
                startContent={!isLoading ? "🔄" : undefined}
              >
                Refresh
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        color="primary"
        variant="underlined"
      >
        <Tab
          key="all"
          title={
            <div className="flex items-center gap-2">
              <span>All Insights</span>
              <Chip size="sm" variant="flat">
                {insights.length}
              </Chip>
            </div>
          }
        />
        <Tab
          key="unread"
          title={
            <div className="flex items-center gap-2">
              <span>Unread</span>
              {unreadCount > 0 && (
                <Chip size="sm" color="primary" variant="solid">
                  {unreadCount}
                </Chip>
              )}
            </div>
          }
        />
        <Tab
          key="critical"
          title={
            <div className="flex items-center gap-2">
              <span>Critical</span>
              {criticalCount > 0 && (
                <Chip size="sm" color="danger" variant="solid">
                  {criticalCount}
                </Chip>
              )}
            </div>
          }
        />
      </Tabs>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card className="border-dashed border-2 border-default/30">
          <CardBody className="text-center py-12">
            <div className="text-6xl mb-4">
              {selectedTab === 'critical' ? '🎉' : selectedTab === 'unread' ? '✅' : '💡'}
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {selectedTab === 'critical' 
                ? 'No Critical Issues' 
                : selectedTab === 'unread'
                ? 'All Caught Up!'
                : 'No Insights Yet'
              }
            </h3>
            <p className="text-foreground-600">
              {selectedTab === 'critical' 
                ? 'Great! Your spending patterns look healthy.'
                : selectedTab === 'unread'
                ? 'You\'ve read all your insights. Check back later for new ones.'
                : 'Add some spending entries to get personalized financial insights.'
              }
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Critical insights first */}
          {insightsBySeverity.danger && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-danger flex items-center gap-2">
                🚨 Critical Issues ({insightsBySeverity.danger.length})
              </h3>
              {insightsBySeverity.danger.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={onMarkAsRead}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}

          {/* Warning insights */}
          {insightsBySeverity.warning && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-warning flex items-center gap-2">
                ⚠️ Warnings ({insightsBySeverity.warning.length})
              </h3>
              {insightsBySeverity.warning.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={onMarkAsRead}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}

          {/* Info insights */}
          {insightsBySeverity.info && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                💡 Information ({insightsBySeverity.info.length})
              </h3>
              {insightsBySeverity.info.map(insight => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onMarkAsRead={onMarkAsRead}
                  onDismiss={onDismiss}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
