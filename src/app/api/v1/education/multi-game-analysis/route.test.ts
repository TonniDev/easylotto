import { describe, it, expect } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock NextRequest for testing
function createMockRequest(body: any): NextRequest {
  return {
    json: async () => body,
  } as NextRequest;
}

describe('/api/v1/education/multi-game-analysis', () => {
  describe('POST', () => {
    it('should return successful calculation for valid input', async () => {
      const request = createMockRequest({
        gamesPerDraw: 5,
        years: 10,
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.result).toBeDefined();
      expect(data.data.calculatedAt).toBeDefined();
      
      // Verify result structure
      const result = data.data.result;
      expect(result.totalGames).toBeGreaterThan(0);
      expect(result.totalCost).toBeDefined();
      expect(result.probabilityPercentage).toBeGreaterThan(0);
      expect(result.neverWinningPercentage).toBeGreaterThan(0);
      expect(result.investmentReturn).toBeDefined();
      expect(result.insights).toBeInstanceOf(Array);
    });

    it('should return error for invalid input', async () => {
      const request = createMockRequest({
        gamesPerDraw: 'invalid',
        years: 10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request data');
    });

    it('should return error for games per draw exceeding limit', async () => {
      const request = createMockRequest({
        gamesPerDraw: 150,
        years: 10,
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Number must be less than or equal to 100');
    });

    it('should return error for years exceeding limit', async () => {
      const request = createMockRequest({
        gamesPerDraw: 5,
        years: 150,
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Number must be less than or equal to 100');
    });

    it('should use default interest rate when not provided', async () => {
      const request = createMockRequest({
        gamesPerDraw: 5,
        years: 10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.result.scenario.annualInterestRate).toBe(0.08);
    });

    it('should handle edge case scenarios', async () => {
      const request = createMockRequest({
        gamesPerDraw: 1,
        years: 1,
        annualInterestRate: 0.01,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      
      const result = data.data.result;
      expect(result.totalGames).toBe(312); // 1 * 6 * 52 * 1
      expect(result.neverWinningPercentage).toBeGreaterThan(99); // Very high chance of never winning
    });
  });

  describe('GET', () => {
    it('should return API documentation', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/v1/education/multi-game-analysis');
      expect(data.method).toBe('POST');
      expect(data.description).toBeDefined();
      expect(data.parameters).toBeDefined();
      expect(data.constants).toBeDefined();
      expect(data.examples).toBeDefined();
      
      // Verify parameter documentation
      expect(data.parameters.gamesPerDraw).toBeDefined();
      expect(data.parameters.years).toBeDefined();
      expect(data.parameters.annualInterestRate).toBeDefined();
      
      // Verify constants
      expect(data.constants.gamePrice).toBe(3.50);
      expect(data.constants.drawsPerWeek).toBe(6);
      expect(data.constants.winningOdds).toContain('3,268,760');
      
      // Verify examples
      expect(data.examples.conservative).toBeDefined();
      expect(data.examples.aggressive).toBeDefined();
    });
  });
});
