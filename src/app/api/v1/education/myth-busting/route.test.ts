import { describe, it, expect } from 'vitest';
import { POST, GET } from './route';
import { NextRequest } from 'next/server';

// Mock NextRequest for testing
function createMockRequest(body?: any, searchParams?: Record<string, string>): NextRequest {
  const url = new URL('http://localhost:3000/api/v1/education/myth-busting');
  
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return {
    json: async () => body || {},
    url: url.toString(),
  } as NextRequest;
}

describe('/api/v1/education/myth-busting', () => {
  describe('POST', () => {
    it('should return successful calculation for valid misconception', async () => {
      const request = createMockRequest({
        misconceptionId: 'guarantee-5-daily',
        gamesPerDraw: 5,
        years: 10, // Use shorter period for testing
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.scenario).toBeDefined();
      expect(data.data.misconception).toBeDefined();
      expect(data.data.calculatedAt).toBeDefined();
      
      // Verify scenario structure
      const scenario = data.data.scenario;
      expect(scenario.misconceptionId).toBe('guarantee-5-daily');
      expect(scenario.parameters).toBeDefined();
      expect(scenario.calculatedResults).toBeDefined();
      expect(scenario.educationalInsights).toBeInstanceOf(Array);
      
      // Verify calculated results
      const results = scenario.calculatedResults;
      expect(results.actualProbability).toBeGreaterThan(0);
      expect(results.actualProbability).toBeLessThan(1);
      expect(results.totalCost).toBeGreaterThan(0);
      expect(results.investmentAlternative).toBeGreaterThan(results.totalCost);
      expect(results.expectedLoss).toBeGreaterThan(0);
    });

    it('should handle custom parameters correctly', async () => {
      const request = createMockRequest({
        misconceptionId: 'proportional-odds',
        gamesPerDraw: 15,
        years: 25,
        annualInterestRate: 0.10,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.scenario.parameters.gamesPerDraw).toBe(15);
      expect(data.data.scenario.parameters.years).toBe(25);
    });

    it('should return error for invalid misconception ID', async () => {
      const request = createMockRequest({
        misconceptionId: 'invalid-misconception',
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should return error for invalid request data', async () => {
      const request = createMockRequest({
        misconceptionId: 'guarantee-5-daily',
        gamesPerDraw: 'invalid',
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request data');
    });

    it('should validate parameter ranges', async () => {
      const request = createMockRequest({
        misconceptionId: 'guarantee-5-daily',
        gamesPerDraw: 150, // Exceeds max of 100
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should handle different misconception types', async () => {
      const misconceptionIds = [
        'guarantee-5-daily',
        'guarantee-20-daily',
        'proportional-odds',
        'replacement-strategy',
        'same-numbers-daily',
      ];

      for (const misconceptionId of misconceptionIds) {
        const request = createMockRequest({
          misconceptionId,
          gamesPerDraw: 5,
          years: 5, // Use shorter period for testing
          annualInterestRate: 0.08,
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.scenario.misconceptionId).toBe(misconceptionId);
        expect(data.data.misconception.id).toBe(misconceptionId);
      }
    });

    it('should generate appropriate educational insights', async () => {
      const request = createMockRequest({
        misconceptionId: 'replacement-strategy',
        gamesPerDraw: 10,
        years: 5, // Use shorter period for testing
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.scenario.educationalInsights).toBeInstanceOf(Array);
      expect(data.data.scenario.educationalInsights.length).toBeGreaterThan(0);
      
      // Should contain insights about independence for replacement strategy
      const insights = data.data.scenario.educationalInsights.join(' ');
      expect(insights.toLowerCase()).toContain('independent');
    });
  });

  describe('GET', () => {
    it('should return general endpoint information', async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.endpoint).toBe('/api/v1/education/myth-busting');
      expect(data.description).toBeDefined();
      expect(data.methods).toBeDefined();
      expect(data.availableMisconceptions).toBeDefined();
      expect(data.examples).toBeDefined();
      
      // Verify available misconceptions structure
      expect(data.availableMisconceptions.total).toBeGreaterThan(0);
      expect(data.availableMisconceptions.mostDangerous).toBeInstanceOf(Array);
      expect(data.availableMisconceptions.all).toBeInstanceOf(Array);
      
      // Verify examples
      expect(data.examples.guarantee5Daily).toBeDefined();
      expect(data.examples.guarantee20Daily).toBeDefined();
      expect(data.examples.proportionalOdds).toBeDefined();
    });

    it('should return specific misconception information when ID provided', async () => {
      const request = createMockRequest(undefined, { id: 'guarantee-5-daily' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.misconception).toBeDefined();
      expect(data.data.misconception.id).toBe('guarantee-5-daily');
      expect(data.data.misconception.title).toBeDefined();
      expect(data.data.misconception.belief).toBeDefined();
      expect(data.data.misconception.reality).toBeDefined();
    });

    it('should return error for invalid misconception ID', async () => {
      const request = createMockRequest(undefined, { id: 'invalid-id' });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toContain('not found');
    });

    it('should include method documentation', async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(data.methods.GET).toBeDefined();
      expect(data.methods.POST).toBeDefined();
      expect(data.methods.POST.parameters).toBeDefined();
      expect(data.methods.POST.parameters.misconceptionId).toBeDefined();
      expect(data.methods.POST.parameters.gamesPerDraw).toBeDefined();
      expect(data.methods.POST.parameters.years).toBeDefined();
    });

    it('should list most dangerous misconceptions', async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(data.availableMisconceptions.mostDangerous).toBeInstanceOf(Array);
      expect(data.availableMisconceptions.mostDangerous.length).toBeGreaterThan(0);
      
      // All should be extreme danger level
      data.availableMisconceptions.mostDangerous.forEach((misconception: any) => {
        expect(misconception.dangerLevel).toBe('extreme');
        expect(misconception.id).toBeDefined();
        expect(misconception.title).toBeDefined();
        expect(misconception.belief).toBeDefined();
      });
    });

    it('should provide comprehensive misconception list', async () => {
      const request = createMockRequest();

      const response = await GET(request);
      const data = await response.json();

      expect(data.availableMisconceptions.all).toBeInstanceOf(Array);
      expect(data.availableMisconceptions.all.length).toBeGreaterThan(5);
      
      // Should include required misconceptions
      const misconceptionIds = data.availableMisconceptions.all.map((m: any) => m.id);
      expect(misconceptionIds).toContain('guarantee-5-daily');
      expect(misconceptionIds).toContain('guarantee-20-daily');
      expect(misconceptionIds).toContain('proportional-odds');
      expect(misconceptionIds).toContain('replacement-strategy');
    });
  });

  describe('error handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const request = {
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as NextRequest;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Internal server error');
    });

    it('should validate required fields', async () => {
      const request = createMockRequest({
        // Missing misconceptionId
        annualInterestRate: 0.08,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Invalid request data');
    });
  });
});
