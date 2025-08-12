import { describe, it, expect } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  calculateWinningProbability,
  calculateTotalCost,
  calculateInvestmentAlternative,
  calculateMultiGameScenario,
  generateEducationalInsights,
} from './multiGameCalculations';
import { MultiGameScenario, LOTOFACIL_CONSTANTS } from '@lib/definitions/multiGameScenario';

describe('multiGameCalculations', () => {
  const basicScenario: MultiGameScenario = {
    gamesPerDraw: 5,
    years: 10,
    annualInterestRate: 0.08,
    gamePrice: 3.50,
    drawsPerWeek: 6,
    weeksPerYear: 52,
    basePrize: 1800000,
  };

  describe('calculateWinningProbability', () => {
    it('should calculate correct probability for single game', () => {
      const result = calculateWinningProbability(1);

      // Single game probability should be approximately 1/3,268,760
      const expectedProbability = new BigNumber(1).dividedBy(LOTOFACIL_CONSTANTS.WINNING_ODDS);
      expect(result.probabilityOfWinning.toNumber()).toBeCloseTo(expectedProbability.toNumber(), 12);

      // Never winning probability should be very close to 1
      expect(result.probabilityOfNeverWinning.toNumber()).toBeCloseTo(1 - expectedProbability.toNumber(), 10);
    });

    it('should show increased probability with more games', () => {
      const singleGame = calculateWinningProbability(1);
      const multipleGames = calculateWinningProbability(100);
      
      expect(multipleGames.probabilityOfWinning.toNumber()).toBeGreaterThan(singleGame.probabilityOfWinning.toNumber());
      expect(multipleGames.probabilityOfNeverWinning.toNumber()).toBeLessThan(singleGame.probabilityOfNeverWinning.toNumber());
    });

    it('should maintain probability properties', () => {
      const result = calculateWinningProbability(1000);
      
      // Probabilities should sum to 1
      const sum = result.probabilityOfWinning.plus(result.probabilityOfNeverWinning);
      expect(sum.toNumber()).toBeCloseTo(1, 10);
      
      // Both probabilities should be between 0 and 1
      expect(result.probabilityOfWinning.toNumber()).toBeGreaterThanOrEqual(0);
      expect(result.probabilityOfWinning.toNumber()).toBeLessThanOrEqual(1);
      expect(result.probabilityOfNeverWinning.toNumber()).toBeGreaterThanOrEqual(0);
      expect(result.probabilityOfNeverWinning.toNumber()).toBeLessThanOrEqual(1);
    });

    it('should handle large numbers of games', () => {
      // Test with a large number of games (but not too large to avoid performance issues)
      const result = calculateWinningProbability(50000);

      expect(result.probabilityOfWinning.toNumber()).toBeGreaterThan(0);
      expect(result.probabilityOfWinning.toNumber()).toBeLessThan(1);
      expect(result.probabilityOfNeverWinning.toNumber()).toBeGreaterThan(0);
      expect(result.probabilityOfNeverWinning.toNumber()).toBeLessThan(1);
    });
  });

  describe('calculateTotalCost', () => {
    it('should calculate correct total cost', () => {
      const result = calculateTotalCost(basicScenario);
      
      const expectedTotalGames = 5 * 6 * 52 * 10; // 15,600 games
      const expectedTotalCost = expectedTotalGames * 3.50; // R$ 54,600
      
      expect(result.totalGames).toBe(expectedTotalGames);
      expect(result.totalCost.toNumber()).toBe(expectedTotalCost);
      expect(result.totalWeeks).toBe(520);
      expect(result.totalDraws).toBe(3120);
    });

    it('should scale linearly with parameters', () => {
      const doubleGames = { ...basicScenario, gamesPerDraw: 10 };
      const doubleYears = { ...basicScenario, years: 20 };
      
      const baseResult = calculateTotalCost(basicScenario);
      const doubleGamesResult = calculateTotalCost(doubleGames);
      const doubleYearsResult = calculateTotalCost(doubleYears);
      
      expect(doubleGamesResult.totalCost.toNumber()).toBe(baseResult.totalCost.toNumber() * 2);
      expect(doubleYearsResult.totalCost.toNumber()).toBe(baseResult.totalCost.toNumber() * 2);
    });

    it('should handle edge cases', () => {
      const minScenario: MultiGameScenario = {
        ...basicScenario,
        gamesPerDraw: 1,
        years: 1,
      };
      
      const result = calculateTotalCost(minScenario);
      
      expect(result.totalGames).toBe(312); // 1 * 6 * 52 * 1
      expect(result.totalCost.toNumber()).toBe(1092); // 312 * 3.50
    });
  });

  describe('calculateInvestmentAlternative', () => {
    it('should calculate compound growth correctly', () => {
      const weeklyInvestment = new BigNumber(100);
      const result = calculateInvestmentAlternative(weeklyInvestment, 0.08, 10);
      
      // Final amount should be greater than total contributions
      const totalContributions = weeklyInvestment.multipliedBy(52 * 10);
      expect(result.finalAmount.toNumber()).toBeGreaterThan(totalContributions.toNumber());
      
      // Growth data should have correct number of years
      expect(result.growthData).toHaveLength(10);
      
      // Each year should show growth
      for (let i = 1; i < result.growthData.length; i++) {
        expect(result.growthData[i].investmentValue).toBeGreaterThan(result.growthData[i-1].investmentValue);
      }
    });

    it('should show no growth with zero interest rate', () => {
      const weeklyInvestment = new BigNumber(100);
      const result = calculateInvestmentAlternative(weeklyInvestment, 0, 10);

      const totalContributions = weeklyInvestment.multipliedBy(52 * 10);
      // With zero interest rate, final amount should equal total contributions
      expect(result.finalAmount.toNumber()).toBeCloseTo(totalContributions.toNumber(), 1);
    });

    it('should generate consistent growth data', () => {
      const weeklyInvestment = new BigNumber(50);
      const result = calculateInvestmentAlternative(weeklyInvestment, 0.08, 5);
      
      // Verify growth data properties
      result.growthData.forEach((point, index) => {
        expect(point.year).toBe(index + 1);
        expect(point.lotteryCost).toBe(weeklyInvestment.multipliedBy(52 * point.year).toNumber());
        expect(point.investmentValue).toBeGreaterThanOrEqual(point.lotteryCost);
        expect(point.difference).toBeCloseTo(point.investmentValue - point.lotteryCost, 10);
      });
    });
  });

  describe('generateEducationalInsights', () => {
    it('should generate shocking probability insight for high never-winning percentage', () => {
      const mockResult = {
        neverWinningPercentage: 75.5,
        totalCost: '50000.00',
        investmentReturn: '80000.00',
      };
      
      const insights = generateEducationalInsights(basicScenario, mockResult);
      
      const shockingInsight = insights.find(i => i.type === 'shocking');
      expect(shockingInsight).toBeDefined();
      expect(shockingInsight?.message).toContain('75.5%');
      expect(shockingInsight?.message).toContain('NEVER winning');
    });

    it('should generate comparison insight when investment returns are higher', () => {
      const mockResult = {
        totalCost: '50000.00',
        investmentReturn: '80000.00',
      };
      
      const insights = generateEducationalInsights(basicScenario, mockResult);
      
      const comparisonInsight = insights.find(i => i.type === 'comparison');
      expect(comparisonInsight).toBeDefined();
      expect(comparisonInsight?.message).toContain('30000'); // 80000 - 50000
    });

    it('should generate odds misconception insight for multiple games', () => {
      const multiGameScenario = { ...basicScenario, gamesPerDraw: 10 };
      const insights = generateEducationalInsights(multiGameScenario, {});
      
      const warningInsight = insights.find(i => i.type === 'warning' && i.title.includes('Odds'));
      expect(warningInsight).toBeDefined();
      expect(warningInsight?.message).toContain('10 games');
      expect(warningInsight?.message).toContain('10x better odds');
    });
  });

  describe('calculateMultiGameScenario', () => {
    it('should return complete calculation result', () => {
      const result = calculateMultiGameScenario(basicScenario);
      
      // Verify all required fields are present
      expect(result.scenario).toEqual(basicScenario);
      expect(result.totalGames).toBeGreaterThan(0);
      expect(result.totalCost).toBeDefined();
      expect(result.probabilityOfWinning).toBeDefined();
      expect(result.probabilityOfNeverWinning).toBeDefined();
      expect(result.investmentReturn).toBeDefined();
      expect(result.netPrizeIfWin).toBeDefined();
      expect(result.expectedValue).toBeDefined();
      expect(result.insights).toBeInstanceOf(Array);
      expect(result.investmentGrowthData).toBeInstanceOf(Array);
    });

    it('should maintain mathematical consistency', () => {
      const result = calculateMultiGameScenario(basicScenario);
      
      // Probability percentages should sum to 100
      const totalPercentage = result.probabilityPercentage + result.neverWinningPercentage;
      expect(totalPercentage).toBeCloseTo(100, 5);
      
      // Expected value should be negative (house edge)
      expect(parseFloat(result.expectedValue)).toBeLessThan(0);
      
      // Investment return should be greater than total cost
      expect(parseFloat(result.investmentReturn)).toBeGreaterThan(parseFloat(result.totalCost));
    });

    it('should handle different scenarios correctly', () => {
      const conservativeScenario: MultiGameScenario = {
        ...basicScenario,
        gamesPerDraw: 1,
        years: 5,
      };
      
      const aggressiveScenario: MultiGameScenario = {
        ...basicScenario,
        gamesPerDraw: 20,
        years: 20,
      };
      
      const conservativeResult = calculateMultiGameScenario(conservativeScenario);
      const aggressiveResult = calculateMultiGameScenario(aggressiveScenario);
      
      // Aggressive scenario should have higher probability but much higher cost
      expect(aggressiveResult.probabilityPercentage).toBeGreaterThan(conservativeResult.probabilityPercentage);
      expect(parseFloat(aggressiveResult.totalCost)).toBeGreaterThan(parseFloat(conservativeResult.totalCost));
      
      // Both should have negative expected values
      expect(parseFloat(conservativeResult.expectedValue)).toBeLessThan(0);
      expect(parseFloat(aggressiveResult.expectedValue)).toBeLessThan(0);
    });
  });
});
