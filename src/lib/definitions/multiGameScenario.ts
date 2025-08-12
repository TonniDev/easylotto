import { z } from 'zod';

/**
 * Multi-game scenario parameters for lottery calculations
 */
export const MultiGameScenarioSchema = z.object({
  gamesPerDraw: z.number().int().min(1).max(100),
  years: z.number().int().min(1).max(100),
  annualInterestRate: z.number().min(0).max(1), // 0.08 for 8%
  gamePrice: z.number().positive().default(3.50), // R$ 3.50
  drawsPerWeek: z.number().int().positive().default(6), // Monday to Saturday
  weeksPerYear: z.number().int().positive().default(52),
  basePrize: z.number().positive().default(1800000), // R$ 1,800,000
});

export type MultiGameScenario = z.infer<typeof MultiGameScenarioSchema>;

/**
 * Results of multi-game scenario calculations
 */
export interface MultiGameCalculationResult {
  // Input parameters
  scenario: MultiGameScenario;
  
  // Basic calculations
  totalGames: number;
  totalCost: string; // BigNumber string representation
  totalWeeks: number;
  totalDraws: number;
  
  // Probability calculations
  probabilityOfWinning: string; // BigNumber string representation
  probabilityOfNeverWinning: string; // BigNumber string representation
  probabilityPercentage: number; // For display (0-100)
  neverWinningPercentage: number; // For display (0-100)
  
  // Investment alternative calculations
  weeklyInvestment: string; // BigNumber string representation
  monthlyInvestment: string; // BigNumber string representation
  investmentReturn: string; // BigNumber string representation
  investmentGrowthData: InvestmentGrowthPoint[];
  
  // Prize calculations
  netPrizeIfWin: string; // Prize minus total cost
  expectedValue: string; // Expected value calculation
  
  // Educational insights
  insights: EducationalInsight[];
}

/**
 * Data point for investment growth visualization
 */
export interface InvestmentGrowthPoint {
  year: number;
  lotteryCost: number;
  investmentValue: number;
  difference: number;
}

/**
 * Educational insights about the scenario
 */
export interface EducationalInsight {
  type: 'warning' | 'info' | 'shocking' | 'comparison';
  title: string;
  message: string;
  value?: string; // Optional formatted value
}

/**
 * Common lottery misconceptions to address
 */
export const COMMON_MISCONCEPTIONS = {
  MULTIPLE_GAMES_GUARANTEE: {
    belief: "Playing multiple games daily guarantees wins",
    reality: "Each game is independent with the same low odds"
  },
  PROPORTIONAL_ODDS: {
    belief: "10 games = 10x better odds",
    reality: "Odds improve marginally, costs increase linearly"
  },
  REPLACEMENT_STRATEGY: {
    belief: "Replacing winning sets improves remaining odds",
    reality: "Each draw is independent, replacement doesn't help"
  },
  TIME_GUARANTEE: {
    belief: "Playing long enough guarantees eventual win",
    reality: "No guarantee, many players never win despite decades of play"
  }
} as const;

/**
 * Brazilian Lotofácil constants
 */
export const LOTOFACIL_CONSTANTS = {
  TOTAL_NUMBERS: 25,
  NUMBERS_TO_PICK: 15,
  WINNING_ODDS: 3268760, // 1 in 3,268,760
  BASE_GAME_PRICE: 3.50, // R$ 3.50
  DRAWS_PER_WEEK: 6, // Monday to Saturday
  WEEKS_PER_YEAR: 52,
  BASE_PRIZE: 1800000, // R$ 1,800,000
  ACCUMULATED_PRIZE_MIN: 5000000, // R$ 5,000,000
  ACCUMULATED_PRIZE_MAX: 10000000, // R$ 10,000,000
  ACCUMULATION_FREQUENCY: 2, // Approximately 2 times per month
} as const;

/**
 * Validation schemas for API endpoints
 */
export const MultiGameAnalysisRequestSchema = z.object({
  gamesPerDraw: z.number().int().min(1).max(100),
  years: z.number().int().min(1).max(100),
  annualInterestRate: z.number().min(0.01).max(0.20).default(0.08), // 1% to 20%
});

export type MultiGameAnalysisRequest = z.infer<typeof MultiGameAnalysisRequestSchema>;

/**
 * Response schema for API endpoints
 */
export const MultiGameAnalysisResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    result: z.custom<MultiGameCalculationResult>(),
    calculatedAt: z.string().datetime(),
  }).optional(),
  error: z.string().optional(),
});

export type MultiGameAnalysisResponse = z.infer<typeof MultiGameAnalysisResponseSchema>;
