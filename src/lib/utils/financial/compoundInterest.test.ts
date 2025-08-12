import { describe, it, expect } from 'vitest';
import BigNumber from 'bignumber.js';
import {
  calculateCompoundInterest,
  calculateAnnuityFutureValue,
  calculateWeeklyInvestment,
  calculateInvestmentGrowthOverTime,
  calculateOpportunityCost,
  formatBRL,
  calculateEffectiveAnnualRate,
  calculateDoublingTime,
  calculateRequiredMonthlyPayment,
} from './compoundInterest';

describe('compoundInterest', () => {
  describe('calculateCompoundInterest', () => {
    it('should calculate simple compound interest correctly', () => {
      // $1000 at 8% annually for 10 years, compounded annually
      const result = calculateCompoundInterest(1000, 0.08, 1, 10);
      
      // Expected: 1000 * (1.08)^10 ≈ 2158.92
      expect(result.toNumber()).toBeCloseTo(2158.92, 2);
    });

    it('should handle different compounding frequencies', () => {
      const principal = 1000;
      const rate = 0.08;
      const years = 5;
      
      const annually = calculateCompoundInterest(principal, rate, 1, years);
      const quarterly = calculateCompoundInterest(principal, rate, 4, years);
      const monthly = calculateCompoundInterest(principal, rate, 12, years);
      const daily = calculateCompoundInterest(principal, rate, 365, years);
      
      // More frequent compounding should yield higher returns
      expect(quarterly.toNumber()).toBeGreaterThan(annually.toNumber());
      expect(monthly.toNumber()).toBeGreaterThan(quarterly.toNumber());
      expect(daily.toNumber()).toBeGreaterThan(monthly.toNumber());
    });

    it('should handle BigNumber inputs', () => {
      const principal = new BigNumber('1000.50');
      const result = calculateCompoundInterest(principal, 0.08, 1, 10);
      
      expect(result.toNumber()).toBeCloseTo(2160.00, 2);
    });

    it('should handle zero interest rate', () => {
      const result = calculateCompoundInterest(1000, 0, 1, 10);
      expect(result.toNumber()).toBe(1000);
    });
  });

  describe('calculateAnnuityFutureValue', () => {
    it('should calculate annuity future value correctly', () => {
      // $100 monthly for 10 years at 8% annual (0.67% monthly)
      const monthlyRate = 0.08 / 12;
      const result = calculateAnnuityFutureValue(100, monthlyRate, 120);

      // Expected: approximately $18,295 (more precise calculation)
      expect(result.toNumber()).toBeCloseTo(18295, 0);
    });

    it('should handle zero interest rate', () => {
      const result = calculateAnnuityFutureValue(100, 0, 120);
      
      // With no interest, should just be payment * periods
      expect(result.toNumber()).toBe(12000);
    });

    it('should scale with payment amount', () => {
      const result1 = calculateAnnuityFutureValue(100, 0.08/12, 120);
      const result2 = calculateAnnuityFutureValue(200, 0.08/12, 120);
      
      expect(result2.toNumber()).toBeCloseTo(result1.toNumber() * 2, 2);
    });

    it('should increase with more periods', () => {
      const result1 = calculateAnnuityFutureValue(100, 0.08/12, 60);
      const result2 = calculateAnnuityFutureValue(100, 0.08/12, 120);
      
      expect(result2.toNumber()).toBeGreaterThan(result1.toNumber());
    });
  });

  describe('calculateWeeklyInvestment', () => {
    it('should calculate weekly investment correctly', () => {
      const result = calculateWeeklyInvestment(5, 3.50, 6);
      
      // 5 games * R$3.50 * 6 draws = R$105 per week
      expect(result.toNumber()).toBe(105);
    });

    it('should handle different parameters', () => {
      const result1 = calculateWeeklyInvestment(1, 3.50, 6);
      const result2 = calculateWeeklyInvestment(10, 3.50, 6);
      
      expect(result2.toNumber()).toBe(result1.toNumber() * 10);
    });

    it('should return BigNumber', () => {
      const result = calculateWeeklyInvestment(5, 3.50, 6);
      expect(result).toBeInstanceOf(BigNumber);
    });
  });

  describe('calculateInvestmentGrowthOverTime', () => {
    it('should generate correct growth data', () => {
      const result = calculateInvestmentGrowthOverTime(100, 0.08, 5);
      
      expect(result).toHaveLength(5);
      
      // Check first year
      expect(result[0].year).toBe(1);
      expect(result[0].totalContributions).toBe(5200); // 100 * 52
      expect(result[0].investmentValue).toBeGreaterThan(5200);
      expect(result[0].interestEarned).toBeGreaterThan(0);
      
      // Check that values increase over time
      for (let i = 1; i < result.length; i++) {
        expect(result[i].investmentValue).toBeGreaterThan(result[i-1].investmentValue);
        expect(result[i].totalContributions).toBeGreaterThan(result[i-1].totalContributions);
      }
    });

    it('should handle zero interest rate', () => {
      const result = calculateInvestmentGrowthOverTime(100, 0, 3);
      
      result.forEach((point, index) => {
        const expectedContributions = 100 * 52 * (index + 1);
        expect(point.totalContributions).toBe(expectedContributions);
        expect(point.investmentValue).toBeCloseTo(expectedContributions, 2);
        expect(point.interestEarned).toBeCloseTo(0, 2);
      });
    });

    it('should maintain mathematical consistency', () => {
      const result = calculateInvestmentGrowthOverTime(50, 0.08, 10);
      
      result.forEach(point => {
        expect(point.investmentValue).toBeGreaterThanOrEqual(point.totalContributions);
        expect(point.interestEarned).toBeCloseTo(point.investmentValue - point.totalContributions, 10);
        expect(point.year).toBeGreaterThan(0);
        expect(point.year).toBeLessThanOrEqual(10);
      });
    });
  });

  describe('calculateOpportunityCost', () => {
    it('should calculate opportunity cost correctly', () => {
      const result = calculateOpportunityCost(50000, 0.08, 10);
      
      expect(result.lotterySpending.toNumber()).toBe(50000);
      expect(result.investmentValue.toNumber()).toBeGreaterThan(50000);
      expect(result.opportunityCost.toNumber()).toBeGreaterThan(0);
      expect(result.opportunityCostPercentage).toBeGreaterThan(0);
    });

    it('should show higher opportunity cost with higher returns', () => {
      const lowReturn = calculateOpportunityCost(50000, 0.05, 10);
      const highReturn = calculateOpportunityCost(50000, 0.10, 10);
      
      expect(highReturn.opportunityCost.toNumber()).toBeGreaterThan(lowReturn.opportunityCost.toNumber());
      expect(highReturn.opportunityCostPercentage).toBeGreaterThan(lowReturn.opportunityCostPercentage);
    });

    it('should handle BigNumber inputs', () => {
      const spending = new BigNumber('75000.50');
      const result = calculateOpportunityCost(spending, 0.08, 15);
      
      expect(result.lotterySpending.toNumber()).toBe(75000.50);
      expect(result.investmentValue.toNumber()).toBeGreaterThan(75000.50);
    });
  });

  describe('formatBRL', () => {
    it('should format currency correctly', () => {
      expect(formatBRL(1000)).toBe('R$ 1.000,00');
      expect(formatBRL(1000000)).toBe('R$ 1.000.000,00');
      expect(formatBRL(1234.56)).toBe('R$ 1.234,56');
    });

    it('should handle BigNumber inputs', () => {
      const amount = new BigNumber('12345.67');
      expect(formatBRL(amount)).toBe('R$ 12.345,67');
    });

    it('should handle zero and negative values', () => {
      expect(formatBRL(0)).toBe('R$ 0,00');
      expect(formatBRL(-1000)).toBe('R$ -1.000,00');
    });
  });

  describe('calculateEffectiveAnnualRate', () => {
    it('should calculate EAR correctly', () => {
      // 8% compounded monthly should be about 8.3%
      const ear = calculateEffectiveAnnualRate(0.08, 12);
      expect(ear).toBeCloseTo(0.083, 3);
    });

    it('should equal nominal rate for annual compounding', () => {
      const ear = calculateEffectiveAnnualRate(0.08, 1);
      expect(ear).toBeCloseTo(0.08, 10);
    });

    it('should increase with compounding frequency', () => {
      const annual = calculateEffectiveAnnualRate(0.08, 1);
      const monthly = calculateEffectiveAnnualRate(0.08, 12);
      const daily = calculateEffectiveAnnualRate(0.08, 365);
      
      expect(monthly).toBeGreaterThan(annual);
      expect(daily).toBeGreaterThan(monthly);
    });
  });

  describe('calculateDoublingTime', () => {
    it('should calculate doubling time correctly', () => {
      // Rule of 72: 8% should double in about 9 years
      const doublingTime = calculateDoublingTime(0.08);
      expect(doublingTime).toBeCloseTo(9, 1);
    });

    it('should return infinity for zero rate', () => {
      const doublingTime = calculateDoublingTime(0);
      expect(doublingTime).toBe(Infinity);
    });

    it('should be inversely related to interest rate', () => {
      const lowRate = calculateDoublingTime(0.04);
      const highRate = calculateDoublingTime(0.12);
      
      expect(lowRate).toBeGreaterThan(highRate);
    });
  });

  describe('calculateRequiredMonthlyPayment', () => {
    it('should calculate required payment correctly', () => {
      // To reach $100,000 in 10 years at 8% annual
      const payment = calculateRequiredMonthlyPayment(100000, 0.08, 10);

      // Should be around $547 per month (more precise calculation)
      expect(payment.toNumber()).toBeCloseTo(547, 0);
    });

    it('should handle zero interest rate', () => {
      const payment = calculateRequiredMonthlyPayment(120000, 0, 10);
      
      // With no interest: 120000 / (10 * 12) = 1000
      expect(payment.toNumber()).toBe(1000);
    });

    it('should scale with target amount', () => {
      const payment1 = calculateRequiredMonthlyPayment(50000, 0.08, 10);
      const payment2 = calculateRequiredMonthlyPayment(100000, 0.08, 10);
      
      expect(payment2.toNumber()).toBeCloseTo(payment1.toNumber() * 2, 2);
    });
  });
});
