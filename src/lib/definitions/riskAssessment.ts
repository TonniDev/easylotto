import { z } from 'zod';

/**
 * Spending categories for tracking
 */
export type SpendingCategory = 'lottery' | 'investment' | 'other';

/**
 * Goal types for spending limits
 */
export type GoalType = 'weekly' | 'monthly' | 'yearly';

/**
 * Insight types for user notifications
 */
export type InsightType = 'opportunity_cost' | 'trend_warning' | 'milestone' | 'goal_exceeded' | 'achievement';

/**
 * Severity levels for insights
 */
export type InsightSeverity = 'info' | 'warning' | 'danger';

/**
 * Report types for spending analysis
 */
export type ReportType = 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * User spending entry
 */
export interface UserSpending {
  id: string;
  userId: string;
  amount: number;
  date: Date;
  category: SpendingCategory;
  description?: string;
  gameType?: string;
  gamesCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spending goal configuration
 */
export interface SpendingGoal {
  id: string;
  userId: string;
  goalType: GoalType;
  amountLimit: number;
  category: SpendingCategory;
  isActive: boolean;
  warningEnabled: boolean;
  warningThreshold: number; // 0.80 = 80% of limit
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spending insight for user education
 */
export interface SpendingInsight {
  id: string;
  userId: string;
  insightType: InsightType;
  title: string;
  message: string;
  severity: InsightSeverity;
  dataSnapshot?: any;
  isRead: boolean;
  isDismissed: boolean;
  expiresAt?: Date;
  createdAt: Date;
}

/**
 * Investment scenario for comparison
 */
export interface InvestmentScenario {
  id: string;
  userId: string;
  scenarioName: string;
  monthlyAmount: number;
  annualReturnRate: number;
  timeHorizonYears: number;
  calculatedResult: any;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Spending report summary
 */
export interface SpendingReport {
  id: string;
  userId: string;
  reportType: ReportType;
  periodStart: Date;
  periodEnd: Date;
  totalSpending: number;
  lotterySpending: number;
  opportunityCost: number;
  reportData: any;
  generatedAt: Date;
}

/**
 * Dashboard summary data
 */
export interface RiskDashboardSummary {
  totalSpending: number;
  lotterySpending: number;
  investmentSpending: number;
  currentPeriodSpending: number;
  goalProgress: {
    goalType: GoalType;
    limit: number;
    spent: number;
    percentage: number;
    isExceeded: boolean;
  }[];
  opportunityCost: number;
  insights: SpendingInsight[];
  trends: {
    period: string;
    amount: number;
    category: SpendingCategory;
  }[];
}

/**
 * Spending analysis result
 */
export interface SpendingAnalysis {
  totalSpent: number;
  averageMonthly: number;
  averageWeekly: number;
  categoryBreakdown: {
    category: SpendingCategory;
    amount: number;
    percentage: number;
  }[];
  trends: {
    period: string;
    amount: number;
    change: number;
  }[];
  projections: {
    yearly: number;
    fiveYear: number;
    tenYear: number;
  };
  opportunityCost: {
    conservative: number; // 6% annual return
    moderate: number;     // 8% annual return
    aggressive: number;   // 10% annual return
  };
}

/**
 * Request schemas for API validation
 */
export const AddSpendingRequestSchema = z.object({
  amount: z.number().positive().max(100000),
  date: z.string().datetime().or(z.date()),
  category: z.enum(['lottery', 'investment', 'other']),
  description: z.string().max(255).optional(),
  gameType: z.string().max(50).optional(),
  gamesCount: z.number().int().positive().max(1000).optional(),
});

export const CreateGoalRequestSchema = z.object({
  goalType: z.enum(['weekly', 'monthly', 'yearly']),
  amountLimit: z.number().positive().max(1000000),
  category: z.enum(['lottery', 'total']),
  warningEnabled: z.boolean().default(true),
  warningThreshold: z.number().min(0.1).max(1.0).default(0.8),
});

export const UpdateGoalRequestSchema = z.object({
  amountLimit: z.number().positive().max(1000000).optional(),
  isActive: z.boolean().optional(),
  warningEnabled: z.boolean().optional(),
  warningThreshold: z.number().min(0.1).max(1.0).optional(),
});

export const CreateInvestmentScenarioRequestSchema = z.object({
  scenarioName: z.string().min(1).max(100),
  monthlyAmount: z.number().positive().max(100000),
  annualReturnRate: z.number().min(0.01).max(0.30), // 1% to 30%
  timeHorizonYears: z.number().int().min(1).max(50),
});

export const GenerateReportRequestSchema = z.object({
  reportType: z.enum(['weekly', 'monthly', 'yearly', 'custom']),
  periodStart: z.string().datetime().or(z.date()).optional(),
  periodEnd: z.string().datetime().or(z.date()).optional(),
});

export type AddSpendingRequest = z.infer<typeof AddSpendingRequestSchema>;
export type CreateGoalRequest = z.infer<typeof CreateGoalRequestSchema>;
export type UpdateGoalRequest = z.infer<typeof UpdateGoalRequestSchema>;
export type CreateInvestmentScenarioRequest = z.infer<typeof CreateInvestmentScenarioRequestSchema>;
export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>;

/**
 * API Response types
 */
export interface RiskAssessmentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Constants for risk assessment
 */
export const RISK_ASSESSMENT_CONSTANTS = {
  DEFAULT_INVESTMENT_RATES: {
    CONSERVATIVE: 0.06, // 6% annual
    MODERATE: 0.08,     // 8% annual
    AGGRESSIVE: 0.10,   // 10% annual
  },
  WARNING_THRESHOLDS: {
    SPENDING_SPIKE: 2.0,    // 200% of average
    GOAL_WARNING: 0.8,      // 80% of goal
    TREND_CONCERN: 1.5,     // 150% increase
  },
  INSIGHT_EXPIRY_DAYS: {
    INFO: 30,
    WARNING: 14,
    DANGER: 7,
  },
  MAX_GOALS_PER_USER: 10,
  MAX_SCENARIOS_PER_USER: 20,
} as const;

/**
 * Helper functions for risk assessment
 */
export function calculateOpportunityCost(
  totalSpent: number,
  annualRate: number,
  years: number
): number {
  // Assuming spending was distributed evenly over the period
  const monthlySpending = totalSpent / (years * 12);
  
  // Future value of annuity formula: PMT * [((1 + r)^n - 1) / r]
  const monthlyRate = annualRate / 12;
  const totalMonths = years * 12;
  
  if (monthlyRate === 0) {
    return totalSpent;
  }
  
  const futureValue = monthlySpending * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
  return futureValue - totalSpent; // Opportunity cost is the difference
}

/**
 * Calculate goal progress percentage
 */
export function calculateGoalProgress(spent: number, limit: number): number {
  return Math.min((spent / limit) * 100, 100);
}

/**
 * Determine insight severity based on spending patterns
 */
export function determineInsightSeverity(
  currentSpending: number,
  averageSpending: number,
  goalLimit?: number
): InsightSeverity {
  if (goalLimit && currentSpending > goalLimit) {
    return 'danger';
  }
  
  if (currentSpending > averageSpending * RISK_ASSESSMENT_CONSTANTS.WARNING_THRESHOLDS.SPENDING_SPIKE) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * Format currency for Brazilian Real
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Calculate period dates for reports
 */
export function calculatePeriodDates(reportType: ReportType, customStart?: Date, customEnd?: Date): {
  start: Date;
  end: Date;
} {
  const now = new Date();
  const start = new Date();
  const end = new Date();
  
  switch (reportType) {
    case 'weekly':
      start.setDate(now.getDate() - 7);
      break;
    case 'monthly':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'yearly':
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 'custom':
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd };
      }
      // Default to last month if custom dates not provided
      start.setMonth(now.getMonth() - 1);
      break;
  }
  
  return { start, end };
}
