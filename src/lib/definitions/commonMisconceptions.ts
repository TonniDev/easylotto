import { z } from 'zod';

/**
 * Types of lottery misconceptions
 */
export type MisconceptionType = 
  | 'guarantee_belief'
  | 'proportional_odds'
  | 'replacement_strategy'
  | 'same_numbers_daily'
  | 'time_guarantee'
  | 'hot_cold_numbers'
  | 'pattern_belief';

/**
 * Individual misconception definition
 */
export interface LotteryMisconception {
  id: string;
  type: MisconceptionType;
  title: string;
  belief: string;
  reality: string;
  explanation: string;
  dangerLevel: 'low' | 'medium' | 'high' | 'extreme';
  commonness: number; // 1-10 scale of how common this belief is
  financialImpact: 'low' | 'medium' | 'high' | 'extreme';
  examples: string[];
  debunkingPoints: string[];
}

/**
 * Scenario for myth-busting calculations
 */
export interface MythBustingScenario {
  misconceptionId: string;
  parameters: {
    gamesPerDraw?: number;
    years?: number;
    totalInvestment?: number;
    strategy?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  calculatedResults: {
    actualProbability: number;
    totalCost: number;
    investmentAlternative: number;
    timeToBreakEven: number | null;
    expectedLoss: number;
  };
  educationalInsights: string[];
}

/**
 * Myth-busting calculation request
 */
export const MythBustingRequestSchema = z.object({
  misconceptionId: z.string(),
  gamesPerDraw: z.number().int().min(1).max(100).optional(),
  years: z.number().int().min(1).max(100).optional(),
  totalInvestment: z.number().positive().optional(),
  strategy: z.string().optional(),
  annualInterestRate: z.number().min(0.01).max(0.20).default(0.08),
});

export type MythBustingRequest = z.infer<typeof MythBustingRequestSchema>;

/**
 * Myth-busting calculation response
 */
export interface MythBustingResponse {
  success: boolean;
  data?: {
    scenario: MythBustingScenario;
    misconception: LotteryMisconception;
    calculatedAt: string;
  };
  error?: string;
}

/**
 * Predefined common misconceptions about Brazilian lottery
 */
export const COMMON_LOTTERY_MISCONCEPTIONS: Record<string, LotteryMisconception> = {
  'guarantee-5-daily': {
    id: 'guarantee-5-daily',
    type: 'guarantee_belief',
    title: '5 Games Daily Guarantees Wins',
    belief: 'Playing 5 different games every day for my entire life guarantees I will win 1-2 times.',
    reality: 'Even playing 5 games per draw for 50 years gives you a 67% chance of NEVER winning the jackpot.',
    explanation: 'Each lottery draw is independent. Playing multiple games improves your odds slightly, but nowhere near enough to guarantee wins. The mathematics show that most people following this strategy will lose money their entire lives.',
    dangerLevel: 'extreme',
    commonness: 9,
    financialImpact: 'extreme',
    examples: [
      'Person plays 5 games every draw for 50 years',
      'Total cost: R$ 273,000',
      'Probability of winning at least once: 33%',
      'Probability of never winning: 67%'
    ],
    debunkingPoints: [
      'Each game has exactly 1 in 3,268,760 odds regardless of how many you play',
      'Playing 5 games gives you 5 separate chances, not 5x better odds',
      'Total cost over 50 years: R$ 273,000',
      'Investment alternative: R$ 2.4M+ at 8% annual return',
      '67% of people following this strategy never win anything significant'
    ]
  },

  'guarantee-20-daily': {
    id: 'guarantee-20-daily',
    type: 'guarantee_belief',
    title: '20 Games Daily Guarantees Quick Win',
    belief: 'Playing 20 games every day will definitely make me win within 5-10 years.',
    reality: 'Playing 20 games per draw for 10 years gives you an 81% chance of NEVER winning the jackpot.',
    explanation: 'Even with aggressive playing, the odds are still heavily against you. The house edge ensures that most players lose money regardless of how many games they play.',
    dangerLevel: 'extreme',
    commonness: 7,
    financialImpact: 'extreme',
    examples: [
      'Person plays 20 games every draw for 10 years',
      'Total cost: R$ 218,400',
      'Probability of winning at least once: 19%',
      'Probability of never winning: 81%'
    ],
    debunkingPoints: [
      'Even 20 games per draw only gives you 19% chance of winning in 10 years',
      '81% chance of losing R$ 218,400 with nothing to show for it',
      'Investment alternative: R$ 940,000+ at 8% annual return',
      'The more you play, the more you lose on average',
      'Lottery is designed to take money from players, not give it back'
    ]
  },

  'proportional-odds': {
    id: 'proportional-odds',
    type: 'proportional_odds',
    title: 'More Games = Proportionally Better Odds',
    belief: 'If I play 10 games instead of 1, my odds are 10 times better.',
    reality: 'Playing 10 games improves your odds from 1 in 3,268,760 to about 1 in 326,876 - much less than 10x improvement.',
    explanation: 'Odds don\'t scale linearly. When you play multiple games, you\'re not multiplying your chances - you\'re adding tiny probabilities together.',
    dangerLevel: 'high',
    commonness: 8,
    financialImpact: 'high',
    examples: [
      '1 game: 1 in 3,268,760 odds',
      '10 games: 1 in 326,876 odds (not 1 in 326,876)',
      'Cost increases 10x, odds improve by less than 10x',
      'Expected value becomes more negative'
    ],
    debunkingPoints: [
      'Probability formula: 1 - (1 - p)^n where p is single game probability',
      '10 games ≠ 10x better odds due to mathematical reality',
      'Cost increases linearly, probability improvement is logarithmic',
      'Expected value gets worse as you play more games',
      'House edge compounds with more games played'
    ]
  },

  'replacement-strategy': {
    id: 'replacement-strategy',
    type: 'replacement_strategy',
    title: 'Replacing Winning Sets Improves Odds',
    belief: 'When one of my number sets wins, I replace it with a new set. This improves my overall chances.',
    reality: 'Each lottery draw is completely independent. Replacing winning sets has zero effect on future odds.',
    explanation: 'Past lottery results have no influence on future draws. Each draw is like flipping a fair coin - previous results don\'t change future probabilities.',
    dangerLevel: 'medium',
    commonness: 6,
    financialImpact: 'medium',
    examples: [
      'Player has 10 sets, one wins, replaces it with new set',
      'Believes remaining 9 sets now have better odds',
      'Reality: All 10 sets (including new one) have identical odds',
      'Replacement strategy costs time and mental energy for no benefit'
    ],
    debunkingPoints: [
      'Each lottery draw is statistically independent',
      'Past results cannot influence future outcomes',
      'All number combinations have equal probability every draw',
      'Replacement strategy adds complexity without benefit',
      'Time spent on strategy could be used for productive activities'
    ]
  },

  'same-numbers-daily': {
    id: 'same-numbers-daily',
    type: 'same_numbers_daily',
    title: 'Playing Same Numbers Daily Increases Chances',
    belief: 'If I play the same numbers every day for years, they become "due" to win.',
    reality: 'Each draw is independent. Playing the same numbers for 20 years doesn\'t make them more likely to win.',
    explanation: 'The "gambler\'s fallacy" - believing that past events affect future probabilities in independent events. Each draw has the same odds regardless of history.',
    dangerLevel: 'high',
    commonness: 9,
    financialImpact: 'high',
    examples: [
      'Player chooses numbers based on birthdays: 05-12-18-23-25',
      'Plays same numbers for 10 years straight',
      'Believes numbers are "due" to win',
      'Reality: Same 1 in 3,268,760 odds every single draw'
    ],
    debunkingPoints: [
      'Each draw is independent with identical odds',
      'Numbers don\'t have "memory" or become "due"',
      'Consistency doesn\'t improve mathematical probability',
      'Same odds whether you play same numbers or different ones',
      'Emotional attachment to numbers can lead to bigger losses'
    ]
  },

  'hot-cold-numbers': {
    id: 'hot-cold-numbers',
    type: 'hot_cold_numbers',
    title: 'Hot and Cold Number Patterns',
    belief: 'Some numbers are "hot" (drawn frequently) and others are "cold" (rarely drawn). I should play hot numbers.',
    reality: 'All numbers have equal probability in each draw. Past frequency doesn\'t predict future results.',
    explanation: 'Random variation creates apparent patterns, but these are just statistical noise. Each number has exactly the same chance in every draw.',
    dangerLevel: 'medium',
    commonness: 7,
    financialImpact: 'medium',
    examples: [
      'Number 7 drawn 15 times in last 100 draws',
      'Number 23 drawn only 5 times in last 100 draws',
      'Player thinks 7 is "hot" and 23 is "cold"',
      'Reality: Both have identical odds in next draw'
    ],
    debunkingPoints: [
      'Random events naturally create apparent patterns',
      'Past frequency has zero predictive power',
      'All numbers have equal 15/25 probability each draw',
      'Pattern recognition is human bias, not mathematical reality',
      'Lottery machines don\'t "remember" previous draws'
    ]
  },

  'time-guarantee': {
    id: 'time-guarantee',
    type: 'time_guarantee',
    title: 'Playing Long Enough Guarantees Win',
    belief: 'If I play long enough, I\'m guaranteed to win eventually. It\'s just a matter of time.',
    reality: 'There is no guarantee. You could play for 100 years and never win. Many players never win despite decades of playing.',
    explanation: 'Probability doesn\'t guarantee outcomes. Even with a 50% chance of winning over 50 years, that means half of all players following this strategy will never win.',
    dangerLevel: 'extreme',
    commonness: 8,
    financialImpact: 'extreme',
    examples: [
      'Player believes 50 years of playing guarantees a win',
      'Reality: Even best strategies have 60-80% chance of never winning',
      'Some players spend entire retirement savings over decades',
      'No mathematical guarantee exists for any time period'
    ],
    debunkingPoints: [
      'Probability describes likelihood, not certainty',
      'Even 99% probability means 1% never win',
      'Many real players have played for decades without major wins',
      'Time doesn\'t change the fundamental odds of each draw',
      'Guaranteed losses (ticket costs) vs uncertain gains (prizes)'
    ]
  }
};

/**
 * Get misconception by ID
 */
export function getMisconception(id: string): LotteryMisconception | null {
  return COMMON_LOTTERY_MISCONCEPTIONS[id] || null;
}

/**
 * Get all misconceptions sorted by danger level and commonness
 */
export function getAllMisconceptions(): LotteryMisconception[] {
  const dangerOrder = { extreme: 0, high: 1, medium: 2, low: 3 };
  
  return Object.values(COMMON_LOTTERY_MISCONCEPTIONS).sort((a, b) => {
    // Sort by danger level first, then by commonness
    const dangerDiff = dangerOrder[a.dangerLevel] - dangerOrder[b.dangerLevel];
    if (dangerDiff !== 0) return dangerDiff;
    return b.commonness - a.commonness;
  });
}

/**
 * Get misconceptions by type
 */
export function getMisconceptionsByType(type: MisconceptionType): LotteryMisconception[] {
  return Object.values(COMMON_LOTTERY_MISCONCEPTIONS).filter(m => m.type === type);
}

/**
 * Get most dangerous misconceptions
 */
export function getMostDangerousMisconceptions(): LotteryMisconception[] {
  return Object.values(COMMON_LOTTERY_MISCONCEPTIONS)
    .filter(m => m.dangerLevel === 'extreme')
    .sort((a, b) => b.commonness - a.commonness);
}
