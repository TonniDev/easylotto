import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AddSpendingRequestSchema } from '@lib/definitions/riskAssessment';

// Mock the entire route module for now since authentication is complex
vi.mock('./route', () => ({
  POST: vi.fn(),
  GET: vi.fn(),
}));

describe('Risk Assessment API - Data Validation', () => {
  describe('AddSpendingRequestSchema', () => {
    it('should validate valid spending data', () => {
      const validData = {
        amount: 50.00,
        date: '2024-01-15T00:00:00.000Z',
        category: 'lottery',
        description: 'Lotofácil games',
        gameType: 'lotofacil',
        gamesCount: 5,
      };

      const result = AddSpendingRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid spending data', () => {
      const invalidData = {
        amount: -50.00, // Invalid negative amount
        date: '2024-01-15T00:00:00.000Z',
        category: 'lottery',
      };

      const result = AddSpendingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue =>
          issue.message.includes('positive') || issue.message.includes('greater')
        )).toBe(true);
      }
    });

    it('should reject invalid category', () => {
      const invalidData = {
        amount: 50.00,
        date: '2024-01-15T00:00:00.000Z',
        category: 'invalid_category',
      };

      const result = AddSpendingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should require amount field', () => {
      const invalidData = {
        date: '2024-01-15T00:00:00.000Z',
        category: 'lottery',
      };

      const result = AddSpendingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate optional fields correctly', () => {
      const validDataWithOptionals = {
        amount: 50.00,
        date: '2024-01-15T00:00:00.000Z',
        category: 'lottery',
        description: 'Test description',
        gameType: 'lotofacil',
        gamesCount: 5,
      };

      const result = AddSpendingRequestSchema.safeParse(validDataWithOptionals);
      expect(result.success).toBe(true);
    });

    it('should validate minimum values', () => {
      const invalidData = {
        amount: 0, // Should be positive
        date: '2024-01-15T00:00:00.000Z',
        category: 'lottery',
        gamesCount: 0, // Should be positive
      };

      const result = AddSpendingRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
