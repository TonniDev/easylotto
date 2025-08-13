import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { NextRequest } from 'next/server';
import SpendingService from '@lib/services/spendingService';
import { verifyAuth } from '@lib/auth/authUtils';

// Mock dependencies
vi.mock('@lib/services/spendingService');
vi.mock('@lib/auth/authUtils');

const mockVerifyAuth = vi.mocked(verifyAuth);
const mockSpendingService = vi.mocked(SpendingService);

// Mock NextRequest for testing
function createMockRequest(): NextRequest {
  return {
    url: 'http://localhost:3000/api/v1/risk-assessment/dashboard',
  } as NextRequest;
}

describe('/api/v1/risk-assessment/dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return dashboard summary for authenticated user', async () => {
      // Mock authentication
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123', email: 'test@example.com' },
      });

      // Mock dashboard summary
      const mockSummary = {
        totalSpending: 1500.00,
        lotterySpending: 800.00,
        investmentSpending: 700.00,
        currentPeriodSpending: 150.00,
        goalProgress: [
          {
            goalType: 'monthly' as const,
            limit: 200.00,
            spent: 150.00,
            percentage: 75.0,
            isExceeded: false,
          },
        ],
        opportunityCost: 2500.00,
        insights: [
          {
            id: 'insight-1',
            userId: 'user-123',
            insightType: 'opportunity_cost' as const,
            title: 'Investment Opportunity Cost',
            message: 'Your lottery spending could have grown to R$ 2,500 if invested.',
            severity: 'warning' as const,
            dataSnapshot: { totalSpent: 800, opportunityCost: 2500 },
            isRead: false,
            isDismissed: false,
            expiresAt: new Date('2024-02-15'),
            createdAt: new Date('2024-01-15'),
          },
        ],
        trends: [
          {
            period: '2024-01',
            amount: 150.00,
            category: 'lottery' as const,
          },
        ],
      };

      mockSpendingService.getDashboardSummary.mockResolvedValue(mockSummary);

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary).toEqual(mockSummary);
      expect(data.data.generatedAt).toBeDefined();
      expect(new Date(data.data.generatedAt)).toBeInstanceOf(Date);

      expect(mockSpendingService.getDashboardSummary).toHaveBeenCalledWith('user-123');
    });

    it('should return error for unauthenticated user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: false,
        error: 'Invalid token',
      });

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
      expect(mockSpendingService.getDashboardSummary).not.toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123', email: 'test@example.com' },
      });

      mockSpendingService.getDashboardSummary.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should return empty summary for new user', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-new', email: 'new@example.com' },
      });

      const emptySummary = {
        totalSpending: 0,
        lotterySpending: 0,
        investmentSpending: 0,
        currentPeriodSpending: 0,
        goalProgress: [],
        opportunityCost: 0,
        insights: [],
        trends: [],
      };

      mockSpendingService.getDashboardSummary.mockResolvedValue(emptySummary);

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.summary).toEqual(emptySummary);
    });

    it('should include all required summary fields', async () => {
      mockVerifyAuth.mockResolvedValue({
        success: true,
        user: { id: 'user-123', email: 'test@example.com' },
      });

      const completeSummary = {
        totalSpending: 1000.00,
        lotterySpending: 600.00,
        investmentSpending: 400.00,
        currentPeriodSpending: 100.00,
        goalProgress: [
          {
            goalType: 'weekly' as const,
            limit: 50.00,
            spent: 25.00,
            percentage: 50.0,
            isExceeded: false,
          },
          {
            goalType: 'monthly' as const,
            limit: 200.00,
            spent: 250.00,
            percentage: 100.0,
            isExceeded: true,
          },
        ],
        opportunityCost: 1500.00,
        insights: [
          {
            id: 'insight-1',
            userId: 'user-123',
            insightType: 'goal_exceeded' as const,
            title: 'Monthly Goal Exceeded',
            message: 'You have exceeded your monthly spending limit.',
            severity: 'danger' as const,
            dataSnapshot: { goalType: 'monthly', limit: 200, spent: 250 },
            isRead: false,
            isDismissed: false,
            expiresAt: new Date('2024-02-01'),
            createdAt: new Date('2024-01-15'),
          },
        ],
        trends: [
          {
            period: '2023-12',
            amount: 120.00,
            category: 'lottery' as const,
          },
          {
            period: '2024-01',
            amount: 100.00,
            category: 'lottery' as const,
          },
        ],
      };

      mockSpendingService.getDashboardSummary.mockResolvedValue(completeSummary);

      const request = createMockRequest();
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const summary = data.data.summary;
      expect(summary).toHaveProperty('totalSpending');
      expect(summary).toHaveProperty('lotterySpending');
      expect(summary).toHaveProperty('investmentSpending');
      expect(summary).toHaveProperty('currentPeriodSpending');
      expect(summary).toHaveProperty('goalProgress');
      expect(summary).toHaveProperty('opportunityCost');
      expect(summary).toHaveProperty('insights');
      expect(summary).toHaveProperty('trends');
      
      expect(Array.isArray(summary.goalProgress)).toBe(true);
      expect(Array.isArray(summary.insights)).toBe(true);
      expect(Array.isArray(summary.trends)).toBe(true);
    });
  });
});
