import { describe, it, expect } from 'vitest';
import {
  analyzeSpendingPatterns,
  generateSpendingInsights,
  calculateSpendingProjections,
  compareToAverages,
} from './spendingAnalysis';
import { UserSpending } from '@lib/definitions/riskAssessment';

describe('spendingAnalysis', () => {
  const mockSpendingData: UserSpending[] = [
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
    {
      id: '3',
      userId: 'user-123',
      amount: 75.00,
      date: new Date('2023-12-20'),
      category: 'lottery',
      description: 'More lottery games',
      gameType: 'lotofacil',
      gamesCount: 7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('analyzeSpendingPatterns', () => {
    it('should analyze spending patterns correctly', () => {
      const analysis = analyzeSpendingPatterns(mockSpendingData, 12);

      expect(analysis.totalSpent).toBe(225.00);
      expect(analysis.averageMonthly).toBe(18.75); // 225 / 12
      expect(analysis.averageWeekly).toBeCloseTo(4.33, 2); // 18.75 / 4.33

      expect(analysis.categoryBreakdown).toHaveLength(2);
      expect(analysis.categoryBreakdown.find(c => c.category === 'lottery')?.amount).toBe(125.00);
      expect(analysis.categoryBreakdown.find(c => c.category === 'investment')?.amount).toBe(100.00);

      expect(analysis.projections.yearly).toBe(225.00); // 18.75 * 12
      expect(analysis.projections.fiveYear).toBe(1125.00); // 18.75 * 12 * 5
      expect(analysis.projections.tenYear).toBe(2250.00); // 18.75 * 12 * 10

      expect(analysis.opportunityCost.conservative).toBeGreaterThan(0);
      expect(analysis.opportunityCost.moderate).toBeGreaterThan(analysis.opportunityCost.conservative);
      expect(analysis.opportunityCost.aggressive).toBeGreaterThan(analysis.opportunityCost.moderate);
    });

    it('should handle empty spending data', () => {
      const analysis = analyzeSpendingPatterns([], 12);

      expect(analysis.totalSpent).toBe(0);
      expect(analysis.averageMonthly).toBe(0);
      expect(analysis.averageWeekly).toBe(0);
      expect(analysis.categoryBreakdown).toHaveLength(0);
      expect(analysis.trends).toHaveLength(0);
      expect(analysis.projections.yearly).toBe(0);
      expect(analysis.opportunityCost.conservative).toBe(0);
    });

    it('should calculate category percentages correctly', () => {
      const analysis = analyzeSpendingPatterns(mockSpendingData, 12);

      const lotteryCategory = analysis.categoryBreakdown.find(c => c.category === 'lottery');
      const investmentCategory = analysis.categoryBreakdown.find(c => c.category === 'investment');

      expect(lotteryCategory?.percentage).toBeCloseTo(55.56, 2); // 125/225 * 100
      expect(investmentCategory?.percentage).toBeCloseTo(44.44, 2); // 100/225 * 100
    });
  });

  describe('generateSpendingInsights', () => {
    it('should generate opportunity cost insight', () => {
      const analysis = analyzeSpendingPatterns(mockSpendingData, 12);
      const insights = generateSpendingInsights('user-123', analysis, 50.00);

      expect(insights.length).toBeGreaterThan(0);
      
      const opportunityCostInsight = insights.find(i => i.insightType === 'opportunity_cost');
      expect(opportunityCostInsight).toBeDefined();
      expect(opportunityCostInsight?.title).toBe('Investment Opportunity Cost');
      expect(opportunityCostInsight?.message).toContain('R$');
      expect(opportunityCostInsight?.severity).toMatch(/warning|danger/);
    });

    it('should generate spending spike insight', () => {
      const analysis = analyzeSpendingPatterns(mockSpendingData, 12);
      const highCurrentSpending = 200.00; // Much higher than average monthly (18.75)
      
      const insights = generateSpendingInsights('user-123', analysis, highCurrentSpending);

      const spikeInsight = insights.find(i => 
        i.insightType === 'trend_warning' && i.title === 'Unusual Spending This Month'
      );
      expect(spikeInsight).toBeDefined();
      expect(spikeInsight?.message).toContain('higher than your average');
    });

    it('should generate goal exceeded insight', () => {
      const analysis = analyzeSpendingPatterns(mockSpendingData, 12);
      const goals = [
        {
          goalType: 'monthly',
          amountLimit: 100.00,
          category: 'lottery',
        },
      ];
      
      const insights = generateSpendingInsights('user-123', analysis, 50.00, goals);

      const goalInsight = insights.find(i => i.insightType === 'goal_exceeded');
      expect(goalInsight).toBeDefined();
      expect(goalInsight?.title).toContain('Goal Exceeded');
      expect(goalInsight?.severity).toBe('danger');
    });
  });

  describe('calculateSpendingProjections', () => {
    it('should calculate projections for different scenarios', () => {
      const scenarios = [
        {
          name: 'Current Trend',
          monthlyChange: 0,
          description: 'Continue current spending',
        },
        {
          name: 'Increasing',
          monthlyChange: 5,
          description: '5% monthly increase',
        },
      ];

      const projections = calculateSpendingProjections(100.00, scenarios);

      expect(projections).toHaveLength(2);
      
      const currentTrend = projections.find(p => p.scenario === 'Current Trend');
      expect(currentTrend?.projections.oneYear).toBe(1200.00); // 100 * 12
      
      const increasing = projections.find(p => p.scenario === 'Increasing');
      expect(increasing?.projections.oneYear).toBeGreaterThan(1200.00); // Should be higher due to growth
    });
  });

  describe('compareToAverages', () => {
    it('should compare user spending to national averages', () => {
      const comparison = compareToAverages(45.00, 'lottery'); // Exactly average

      expect(comparison.userSpending).toBe(45.00);
      expect(comparison.nationalAverage).toBe(45.00);
      expect(comparison.comparison).toBe('average');
      expect(comparison.message).toContain('close to the national average');
    });

    it('should identify below average spending', () => {
      const comparison = compareToAverages(20.00, 'lottery'); // Below average

      expect(comparison.comparison).toBe('below');
      expect(comparison.percentile).toBe(25);
      expect(comparison.message).toContain('below the national average');
    });

    it('should identify above average spending', () => {
      const comparison = compareToAverages(100.00, 'lottery'); // Above average

      expect(comparison.comparison).toBe('above');
      expect(comparison.percentile).toBe(75);
      expect(comparison.message).toContain('above average');
    });

    it('should identify extreme spending', () => {
      const comparison = compareToAverages(200.00, 'lottery'); // Very high

      expect(comparison.comparison).toBe('extreme');
      expect(comparison.percentile).toBe(90);
      expect(comparison.message).toContain('significantly above average');
    });
  });
});
