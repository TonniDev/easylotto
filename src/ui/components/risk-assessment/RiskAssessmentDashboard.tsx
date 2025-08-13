'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardBody,
  Tabs,
  Tab,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from '@heroui/react';
import { DashboardSummary } from './DashboardSummary';
import { SpendingEntryForm } from './SpendingEntryForm';
import { SpendingHistory } from './SpendingHistory';
import { InsightsPanel } from './InsightsPanel';
import { SpendingCharts } from './SpendingCharts';
import {
  RiskDashboardSummary,
  UserSpending,
  SpendingInsight,
  AddSpendingRequest,
} from '@lib/definitions/riskAssessment';

/**
 * Main Risk Assessment Dashboard Component
 */
export const RiskAssessmentDashboard: React.FC = () => {
  // State management
  const [summary, setSummary] = useState<RiskDashboardSummary | null>(null);
  const [spending, setSpending] = useState<UserSpending[]>([]);
  const [insights, setInsights] = useState<SpendingInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal controls
  const { isOpen: isAddModalOpen, onOpen: onAddModalOpen, onClose: onAddModalClose } = useDisclosure();

  /**
   * Fetch dashboard data
   */
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, we'll use mock data since authentication isn't fully implemented
      // In production, these would be real API calls
      const mockSummary: RiskDashboardSummary = {
        totalSpending: 1500.00,
        lotterySpending: 800.00,
        investmentSpending: 700.00,
        currentPeriodSpending: 150.00,
        goalProgress: [
          {
            goalType: 'monthly',
            limit: 200.00,
            spent: 150.00,
            percentage: 75.0,
            isExceeded: false,
          },
        ],
        opportunityCost: 2500.00,
        insights: [],
        trends: [
          { period: '2023-11', amount: 120.00, category: 'lottery' },
          { period: '2023-12', amount: 140.00, category: 'lottery' },
          { period: '2024-01', amount: 150.00, category: 'lottery' },
        ],
      };

      const mockSpending: UserSpending[] = [
        {
          id: '1',
          userId: 'user-123',
          amount: 50.00,
          date: new Date('2024-01-15'),
          category: 'lottery',
          description: 'Lotofácil games',
          gameType: 'lotofacil',
          gamesCount: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          userId: 'user-123',
          amount: 100.00,
          date: new Date('2024-01-10'),
          category: 'investment',
          description: 'Monthly investment',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockInsights: SpendingInsight[] = [
        {
          id: 'insight-1',
          userId: 'user-123',
          insightType: 'opportunity_cost',
          title: 'Investment Opportunity Cost',
          message: 'Your lottery spending could have grown to R$ 2,500 if invested at 8% annual return instead.',
          severity: 'warning',
          dataSnapshot: { totalSpent: 800, opportunityCost: 2500 },
          isRead: false,
          isDismissed: false,
          expiresAt: new Date('2024-02-15'),
          createdAt: new Date('2024-01-15'),
        },
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSummary(mockSummary);
      setSpending(mockSpending);
      setInsights(mockInsights);

      // TODO: Replace with real API calls when authentication is ready
      /*
      const [summaryResponse, spendingResponse, insightsResponse] = await Promise.all([
        fetch('/api/v1/risk-assessment/dashboard'),
        fetch('/api/v1/risk-assessment/spending'),
        fetch('/api/v1/risk-assessment/insights'),
      ]);

      const summaryData = await summaryResponse.json();
      const spendingData = await spendingResponse.json();
      const insightsData = await insightsResponse.json();

      if (summaryData.success) setSummary(summaryData.data.summary);
      if (spendingData.success) setSpending(spendingData.data.spending);
      if (insightsData.success) setInsights(insightsData.data);
      */

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Add new spending entry
   */
  const handleAddSpending = async (data: AddSpendingRequest) => {
    try {
      setIsSubmitting(true);

      // TODO: Replace with real API call
      /*
      const response = await fetch('/api/v1/risk-assessment/spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }
      */

      // Mock success - add to local state
      const newEntry: UserSpending = {
        id: Date.now().toString(),
        userId: 'user-123',
        amount: data.amount,
        date: new Date(data.date),
        category: data.category,
        description: data.description,
        gameType: data.gameType,
        gamesCount: data.gamesCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSpending(prev => [newEntry, ...prev]);
      onAddModalClose();

      // Refresh dashboard data
      await fetchDashboardData();

    } catch (error) {
      console.error('Error adding spending entry:', error);
      setError('Failed to add spending entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Mark insight as read
   */
  const handleMarkInsightAsRead = async (insightId: string) => {
    try {
      // TODO: Replace with real API call
      /*
      const response = await fetch(`/api/v1/risk-assessment/insights/${insightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark insight as read');
      }
      */

      // Mock success - update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId ? { ...insight, isRead: true } : insight
      ));

    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  /**
   * Dismiss insight
   */
  const handleDismissInsight = async (insightId: string) => {
    try {
      // TODO: Replace with real API call
      /*
      const response = await fetch(`/api/v1/risk-assessment/insights/${insightId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss' }),
      });

      if (!response.ok) {
        throw new Error('Failed to dismiss insight');
      }
      */

      // Mock success - remove from local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId));

    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (error) {
    return (
      <Card className="border-danger/30 bg-danger/10">
        <CardBody className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-danger mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-foreground-600 mb-4">{error}</p>
          <Button color="danger" variant="flat" onPress={fetchDashboardData}>
            Try Again
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {summary && (
        <DashboardSummary
          summary={summary}
          onRefresh={fetchDashboardData}
          isLoading={isLoading}
        />
      )}

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-wrap gap-3">
            <Button
              color="primary"
              onPress={onAddModalOpen}
              startContent="💰"
            >
              Add Spending Entry
            </Button>
            <Button
              variant="flat"
              onPress={fetchDashboardData}
              isLoading={isLoading}
              startContent={!isLoading ? "🔄" : undefined}
            >
              Refresh Data
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <Tabs color="primary" variant="underlined" className="w-full">
        <Tab key="overview" title="📊 Overview">
          <div className="space-y-6 pt-4">
            {summary && <SpendingCharts summary={summary} />}
          </div>
        </Tab>

        <Tab key="history" title="📋 History">
          <div className="pt-4">
            <SpendingHistory
              spending={spending}
              isLoading={isLoading}
            />
          </div>
        </Tab>

        <Tab key="insights" title="💡 Insights">
          <div className="pt-4">
            <InsightsPanel
              insights={insights}
              onMarkAsRead={handleMarkInsightAsRead}
              onDismiss={handleDismissInsight}
              onRefresh={fetchDashboardData}
              isLoading={isLoading}
            />
          </div>
        </Tab>
      </Tabs>

      {/* Add Spending Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={onAddModalClose}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>Add New Spending Entry</ModalHeader>
          <ModalBody className="pb-6">
            <SpendingEntryForm
              onSubmit={handleAddSpending}
              onCancel={onAddModalClose}
              isLoading={isSubmitting}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
