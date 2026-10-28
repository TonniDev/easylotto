import { z } from 'zod';

/**
 * Advanced constraint types
 */
export type PatternType = 'consecutive' | 'arithmetic' | 'geometric' | 'custom';
export type DistributionType = 'uniform' | 'weighted' | 'hot_cold' | 'frequency_based';
export type AvoidanceType = 'recent_draws' | 'never_won' | 'user_blacklist' | 'pattern_based';

/**
 * Enhanced constraints interface extending the basic constraints
 */
export interface AdvancedConstraints {
  // Basic constraints (existing)
  even?: number;
  odd?: number;
  prime?: number;
  fibonacci?: number;
  multipleOf3?: number;
  
  // Advanced sum constraints
  sumRange?: {
    min: number;
    max: number;
  };
  
  // Number patterns
  consecutiveNumbers?: {
    maxConsecutive: number;
    allowConsecutive: boolean;
  };
  
  // Number distribution
  lowNumbers?: number; // 1-12
  midNumbers?: number; // 13-18
  highNumbers?: number; // 19-25
  
  // Decade distribution (for Lotofácil: 1-9, 10-19, 20-25)
  firstDecade?: number;  // 1-9
  secondDecade?: number; // 10-19
  thirdDecade?: number;  // 20-25
  
  // Advanced patterns
  patterns?: {
    type: PatternType;
    parameters?: any;
  }[];
  
  // Historical avoidance
  avoidance?: {
    type: AvoidanceType;
    recentDraws?: number; // Number of recent draws to avoid
    blacklistedNumbers?: number[];
    neverWonNumbers?: boolean;
  };
  
  // Lucky numbers integration
  luckyNumbers?: {
    numbers: number[];
    forceInclude?: number; // How many lucky numbers to force include
    preferInclude?: boolean; // Prefer but don't force
  };
  
  // Frequency-based constraints
  frequency?: {
    hotNumbers?: number; // Include X most frequent numbers
    coldNumbers?: number; // Include X least frequent numbers
    balanceHotCold?: boolean;
  };
}

/**
 * Generation strategy options
 */
export interface GenerationStrategy {
  name: string;
  description: string;
  distributionType: DistributionType;
  constraints: AdvancedConstraints;
  weight?: number; // For weighted strategies
}

/**
 * Advanced generation options
 */
export interface AdvancedGenerationOptions {
  amountOfSets?: number;
  itemsInSet?: number;
  constraints?: AdvancedConstraints;
  startEnd?: [number, number];
  
  // Advanced options
  strategy?: GenerationStrategy;
  avoidDuplicates?: boolean;
  maxAttempts?: number;
  
  // Performance options
  useOptimizedAlgorithm?: boolean;
  parallelGeneration?: boolean;
  
  // Historical data integration
  historicalData?: number[][];
  useHistoricalWeights?: boolean;
  
  // User preferences
  userId?: string;
  saveToHistory?: boolean;
}

/**
 * Generation result with metadata
 */
export interface GenerationResult {
  numbers: number[][];
  metadata: {
    generationTime: number;
    attempts: number;
    strategy: string;
    constraintsSatisfied: boolean;
    warnings?: string[];
  };
  analysis: {
    sumAnalysis: {
      sums: number[];
      averageSum: number;
      sumDistribution: 'low' | 'medium' | 'high';
    };
    patternAnalysis: {
      consecutiveCount: number;
      evenOddRatio: number;
      primeCount: number;
      fibonacciCount: number;
    };
    distributionAnalysis: {
      lowCount: number;
      midCount: number;
      highCount: number;
    };
    historicalComparison?: {
      similarityScore: number;
      matchingPatterns: string[];
    };
  };
}

/**
 * Number frequency data
 */
export interface NumberFrequency {
  number: number;
  frequency: number;
  lastAppearance: number; // Draws ago
  trend: 'hot' | 'cold' | 'neutral';
  weight: number;
}

/**
 * Pattern detection result
 */
export interface PatternDetection {
  type: PatternType;
  numbers: number[];
  confidence: number;
  description: string;
}

/**
 * User generation history
 */
export interface GenerationHistory {
  id: string;
  userId: string;
  numbers: number[][];
  constraints: AdvancedConstraints;
  strategy: string;
  createdAt: Date;
  wasWinner?: boolean;
  notes?: string;
}

/**
 * Validation schemas
 */
export const AdvancedConstraintsSchema = z.object({
  even: z.number().int().min(0).max(15).optional(),
  odd: z.number().int().min(0).max(15).optional(),
  prime: z.number().int().min(0).max(15).optional(),
  fibonacci: z.number().int().min(0).max(15).optional(),
  multipleOf3: z.number().int().min(0).max(15).optional(),
  
  sumRange: z.object({
    min: z.number().int().min(15).max(300),
    max: z.number().int().min(15).max(300),
  }).refine(data => data.min <= data.max, {
    message: "Min sum must be less than or equal to max sum",
  }).optional(),
  
  consecutiveNumbers: z.object({
    maxConsecutive: z.number().int().min(1).max(10),
    allowConsecutive: z.boolean(),
  }).optional(),
  
  lowNumbers: z.number().int().min(0).max(12).optional(),
  midNumbers: z.number().int().min(0).max(6).optional(),
  highNumbers: z.number().int().min(0).max(7).optional(),
  
  firstDecade: z.number().int().min(0).max(9).optional(),
  secondDecade: z.number().int().min(0).max(10).optional(),
  thirdDecade: z.number().int().min(0).max(6).optional(),
  
  avoidance: z.object({
    type: z.enum(['recent_draws', 'never_won', 'user_blacklist', 'pattern_based']),
    recentDraws: z.number().int().min(1).max(100).optional(),
    blacklistedNumbers: z.array(z.number().int().min(1).max(25)).max(20).optional(),
    neverWonNumbers: z.boolean().optional(),
  }).optional(),
  
  luckyNumbers: z.object({
    numbers: z.array(z.number().int().min(1).max(25)).min(1).max(15),
    forceInclude: z.number().int().min(0).max(15).optional(),
    preferInclude: z.boolean().optional(),
  }).optional(),
  
  frequency: z.object({
    hotNumbers: z.number().int().min(0).max(15).optional(),
    coldNumbers: z.number().int().min(0).max(15).optional(),
    balanceHotCold: z.boolean().optional(),
  }).optional(),
});

export const AdvancedGenerationOptionsSchema = z.object({
  amountOfSets: z.number().int().min(1).max(100).default(1),
  itemsInSet: z.number().int().min(15).max(15).default(15), // Lotofácil specific
  constraints: AdvancedConstraintsSchema.optional(),
  startEnd: z.tuple([z.number().int().min(1), z.number().int().max(25)]).default([1, 25]),
  
  avoidDuplicates: z.boolean().default(true),
  maxAttempts: z.number().int().min(100).max(10000).default(1000),
  useOptimizedAlgorithm: z.boolean().default(true),
  parallelGeneration: z.boolean().default(false),
  useHistoricalWeights: z.boolean().default(false),
  saveToHistory: z.boolean().default(false),
});

export type AdvancedConstraintsInput = z.infer<typeof AdvancedConstraintsSchema>;
export type AdvancedGenerationOptionsInput = z.infer<typeof AdvancedGenerationOptionsSchema>;

/**
 * Predefined strategies
 */
export const PREDEFINED_STRATEGIES: GenerationStrategy[] = [
  {
    name: 'Balanced',
    description: 'Balanced distribution across all number ranges and types',
    distributionType: 'uniform',
    constraints: {
      even: 7,
      odd: 8,
      lowNumbers: 5,
      midNumbers: 5,
      highNumbers: 5,
      sumRange: { min: 120, max: 180 },
    },
  },
  {
    name: 'Hot Numbers',
    description: 'Focus on frequently drawn numbers',
    distributionType: 'hot_cold',
    constraints: {
      frequency: {
        hotNumbers: 10,
        balanceHotCold: true,
      },
    },
  },
  {
    name: 'Cold Numbers',
    description: 'Focus on rarely drawn numbers',
    distributionType: 'hot_cold',
    constraints: {
      frequency: {
        coldNumbers: 10,
        balanceHotCold: true,
      },
    },
  },
  {
    name: 'Mathematical',
    description: 'Based on mathematical properties',
    distributionType: 'uniform',
    constraints: {
      prime: 4,
      fibonacci: 3,
      multipleOf3: 3,
      consecutiveNumbers: {
        maxConsecutive: 2,
        allowConsecutive: true,
      },
    },
  },
  {
    name: 'Conservative',
    description: 'Avoid recent draws and common patterns',
    distributionType: 'weighted',
    constraints: {
      avoidance: {
        type: 'recent_draws',
        recentDraws: 10,
      },
      consecutiveNumbers: {
        maxConsecutive: 1,
        allowConsecutive: false,
      },
    },
  },
];

/**
 * Helper functions
 */
export function validateConstraintsSum(constraints: AdvancedConstraints): boolean {
  const total = (constraints.even || 0) + (constraints.odd || 0);
  return total <= 15;
}

export function validateDistributionSum(constraints: AdvancedConstraints): boolean {
  const total = (constraints.lowNumbers || 0) + 
                (constraints.midNumbers || 0) + 
                (constraints.highNumbers || 0);
  return total <= 15;
}

export function validateDecadeSum(constraints: AdvancedConstraints): boolean {
  const total = (constraints.firstDecade || 0) + 
                (constraints.secondDecade || 0) + 
                (constraints.thirdDecade || 0);
  return total <= 15;
}

export function getNumberCategory(num: number): 'low' | 'mid' | 'high' {
  if (num <= 12) return 'low';
  if (num <= 18) return 'mid';
  return 'high';
}

export function getNumberDecade(num: number): 'first' | 'second' | 'third' {
  if (num <= 9) return 'first';
  if (num <= 19) return 'second';
  return 'third';
}

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}

export function findConsecutiveSequences(numbers: number[]): number[][] {
  const sorted = [...numbers].sort((a, b) => a - b);
  const sequences: number[][] = [];
  let currentSequence: number[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentSequence.push(sorted[i]);
    } else {
      if (currentSequence.length > 1) {
        sequences.push([...currentSequence]);
      }
      currentSequence = [sorted[i]];
    }
  }
  
  if (currentSequence.length > 1) {
    sequences.push(currentSequence);
  }
  
  return sequences;
}

export function calculateSimilarityScore(set1: number[], set2: number[]): number {
  const intersection = set1.filter(num => set2.includes(num));
  return intersection.length / Math.max(set1.length, set2.length);
}
