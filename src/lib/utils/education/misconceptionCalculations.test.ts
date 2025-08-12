import { describe, it, expect } from 'vitest';
import {
  calculateMythBustingScenario,
  calculateMisconceptionProbability,
  getQuickMythBustingFacts,
} from './misconceptionCalculations';
import { 
  getMisconception, 
  getAllMisconceptions,
  getMostDangerousMisconceptions 
} from '@lib/definitions/commonMisconceptions';

describe('misconceptionCalculations', () => {
  describe('calculateMythBustingScenario', () => {
    it('should calculate scenario for guarantee-5-daily misconception', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'guarantee-5-daily',
        gamesPerDraw: 5,
        years: 10, // Use shorter period for testing
        annualInterestRate: 0.08,
      });

      expect(result).toBeDefined();
      expect(result?.misconceptionId).toBe('guarantee-5-daily');
      expect(result?.parameters.gamesPerDraw).toBe(5);
      expect(result?.parameters.years).toBe(10);
      expect(result?.calculatedResults.totalCost).toBeGreaterThan(0);
      expect(result?.calculatedResults.investmentAlternative).toBeGreaterThan(result?.calculatedResults.totalCost);
      expect(result?.calculatedResults.actualProbability).toBeGreaterThan(0);
      expect(result?.calculatedResults.actualProbability).toBeLessThan(1);
      expect(result?.educationalInsights).toBeInstanceOf(Array);
      expect(result?.educationalInsights.length).toBeGreaterThan(0);
    });

    it('should calculate scenario for guarantee-20-daily misconception', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'guarantee-20-daily',
        annualInterestRate: 0.08,
      });

      expect(result).toBeDefined();
      expect(result?.misconceptionId).toBe('guarantee-20-daily');
      expect(result?.parameters.gamesPerDraw).toBe(20);
      expect(result?.parameters.years).toBe(10);
      expect(result?.calculatedResults.actualProbability).toBeGreaterThan(0);
      expect(result?.calculatedResults.expectedLoss).toBeGreaterThan(0);
    });

    it('should use custom parameters when provided', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'proportional-odds',
        gamesPerDraw: 15,
        years: 25,
        annualInterestRate: 0.10,
      });

      expect(result).toBeDefined();
      expect(result?.parameters.gamesPerDraw).toBe(15);
      expect(result?.parameters.years).toBe(25);
    });

    it('should return null for invalid misconception ID', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'invalid-id',
        annualInterestRate: 0.08,
      });

      expect(result).toBeNull();
    });

    it('should generate appropriate educational insights', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'replacement-strategy',
        annualInterestRate: 0.08,
      });

      expect(result).toBeDefined();
      expect(result?.educationalInsights).toBeInstanceOf(Array);
      
      // Should contain insights about independence
      const hasIndependenceInsight = result?.educationalInsights.some(
        insight => insight.includes('independent') || insight.includes('INDEPENDENCE')
      );
      expect(hasIndependenceInsight).toBe(true);
    });

    it('should calculate realistic financial metrics', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'same-numbers-daily',
        gamesPerDraw: 1,
        years: 20,
        annualInterestRate: 0.08,
      });

      expect(result).toBeDefined();
      expect(result?.calculatedResults.totalCost).toBeGreaterThan(0);
      expect(result?.calculatedResults.investmentAlternative).toBeGreaterThan(result?.calculatedResults.totalCost);
      expect(result?.calculatedResults.expectedLoss).toBeGreaterThan(0);
      
      // For most scenarios, there should be no break-even point
      expect(result?.calculatedResults.timeToBreakEven).toBeNull();
    });
  });

  describe('calculateMisconceptionProbability', () => {
    it('should calculate probability for single game scenario', () => {
      const result = calculateMisconceptionProbability('same-numbers-daily', 1, 1);
      
      // Single game for one year should have very low probability
      expect(result.winProbability).toBeGreaterThan(0);
      expect(result.winProbability).toBeLessThan(0.001);
      expect(result.neverWinProbability).toBeGreaterThan(0.999);
      
      // Probabilities should sum to 1
      expect(result.winProbability + result.neverWinProbability).toBeCloseTo(1, 10);
    });

    it('should show increased probability with more games', () => {
      const singleGame = calculateMisconceptionProbability('proportional-odds', 1, 10);
      const multipleGames = calculateMisconceptionProbability('proportional-odds', 10, 10);
      
      expect(multipleGames.winProbability).toBeGreaterThan(singleGame.winProbability);
      expect(multipleGames.neverWinProbability).toBeLessThan(singleGame.neverWinProbability);
    });

    it('should show increased probability with more years', () => {
      const shortTerm = calculateMisconceptionProbability('time-guarantee', 5, 5);
      const longTerm = calculateMisconceptionProbability('time-guarantee', 5, 20);
      
      expect(longTerm.winProbability).toBeGreaterThan(shortTerm.winProbability);
      expect(longTerm.neverWinProbability).toBeLessThan(shortTerm.neverWinProbability);
    });

    it('should handle extreme scenarios without overflow', () => {
      const result = calculateMisconceptionProbability('guarantee-5-daily', 50, 50);
      
      expect(result.winProbability).toBeGreaterThan(0);
      expect(result.winProbability).toBeLessThan(1);
      expect(result.neverWinProbability).toBeGreaterThan(0);
      expect(result.neverWinProbability).toBeLessThan(1);
    });
  });

  describe('getQuickMythBustingFacts', () => {
    it('should return facts for valid misconception', () => {
      const facts = getQuickMythBustingFacts('guarantee-5-daily');
      
      expect(facts).toBeInstanceOf(Array);
      expect(facts.length).toBeGreaterThan(0);
      
      // Should contain myth and reality
      const hasMythFact = facts.some(fact => fact.includes('MYTH:'));
      const hasRealityFact = facts.some(fact => fact.includes('REALITY:'));
      
      expect(hasMythFact).toBe(true);
      expect(hasRealityFact).toBe(true);
    });

    it('should return empty array for invalid misconception', () => {
      const facts = getQuickMythBustingFacts('invalid-id');
      expect(facts).toEqual([]);
    });

    it('should include debunking points', () => {
      const facts = getQuickMythBustingFacts('proportional-odds');
      
      // Should have at least myth, reality, and some debunking points
      expect(facts.length).toBeGreaterThanOrEqual(3);
      
      // Should contain some debunking points (marked with 💡)
      const hasDebunkingPoints = facts.some(fact => fact.includes('💡'));
      expect(hasDebunkingPoints).toBe(true);
    });
  });

  describe('misconception data integrity', () => {
    it('should have all required misconceptions defined', () => {
      const requiredMisconceptions = [
        'guarantee-5-daily',
        'guarantee-20-daily',
        'proportional-odds',
        'replacement-strategy',
        'same-numbers-daily',
        'hot-cold-numbers',
        'time-guarantee',
      ];

      requiredMisconceptions.forEach(id => {
        const misconception = getMisconception(id);
        expect(misconception).toBeDefined();
        expect(misconception?.id).toBe(id);
      });
    });

    it('should have valid danger levels for all misconceptions', () => {
      const allMisconceptions = getAllMisconceptions();
      const validDangerLevels = ['low', 'medium', 'high', 'extreme'];
      
      allMisconceptions.forEach(misconception => {
        expect(validDangerLevels).toContain(misconception.dangerLevel);
        expect(misconception.commonness).toBeGreaterThanOrEqual(1);
        expect(misconception.commonness).toBeLessThanOrEqual(10);
      });
    });

    it('should return most dangerous misconceptions correctly', () => {
      const dangerous = getMostDangerousMisconceptions();
      
      expect(dangerous.length).toBeGreaterThan(0);
      dangerous.forEach(misconception => {
        expect(misconception.dangerLevel).toBe('extreme');
      });
      
      // Should be sorted by commonness (descending)
      for (let i = 1; i < dangerous.length; i++) {
        expect(dangerous[i-1].commonness).toBeGreaterThanOrEqual(dangerous[i].commonness);
      }
    });

    it('should have comprehensive debunking points for each misconception', () => {
      const allMisconceptions = getAllMisconceptions();
      
      allMisconceptions.forEach(misconception => {
        expect(misconception.debunkingPoints).toBeInstanceOf(Array);
        expect(misconception.debunkingPoints.length).toBeGreaterThan(0);
        expect(misconception.examples).toBeInstanceOf(Array);
        expect(misconception.examples.length).toBeGreaterThan(0);
        expect(misconception.belief).toBeTruthy();
        expect(misconception.reality).toBeTruthy();
        expect(misconception.explanation).toBeTruthy();
      });
    });
  });

  describe('educational insight generation', () => {
    it('should generate different insights for different misconception types', () => {
      const guaranteeResult = calculateMythBustingScenario({
        misconceptionId: 'guarantee-5-daily',
        gamesPerDraw: 5,
        years: 10, // Use shorter period for testing
        annualInterestRate: 0.08,
      });

      const proportionalResult = calculateMythBustingScenario({
        misconceptionId: 'proportional-odds',
        gamesPerDraw: 10,
        years: 10, // Use shorter period for testing
        annualInterestRate: 0.08,
      });

      expect(guaranteeResult?.educationalInsights).toBeDefined();
      expect(proportionalResult?.educationalInsights).toBeDefined();
      
      // Should have different insights for different types
      const guaranteeInsights = guaranteeResult?.educationalInsights.join(' ');
      const proportionalInsights = proportionalResult?.educationalInsights.join(' ');
      
      expect(guaranteeInsights).not.toBe(proportionalInsights);
    });

    it('should include financial impact in insights', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'guarantee-20-daily',
        annualInterestRate: 0.08,
      });

      expect(result?.educationalInsights).toBeDefined();
      
      const allInsights = result?.educationalInsights.join(' ');
      
      // Should mention costs, investment alternatives, or financial impact
      const hasFinancialContent = /R\$|cost|investment|loss|spend/i.test(allInsights || '');
      expect(hasFinancialContent).toBe(true);
    });

    it('should include probability information in insights', () => {
      const result = calculateMythBustingScenario({
        misconceptionId: 'time-guarantee',
        annualInterestRate: 0.08,
      });

      expect(result?.educationalInsights).toBeDefined();
      
      const allInsights = result?.educationalInsights.join(' ');
      
      // Should mention probability, odds, or chances
      const hasProbabilityContent = /probability|odds|chance|%/i.test(allInsights || '');
      expect(hasProbabilityContent).toBe(true);
    });
  });
});
