import BigNumber from 'bignumber.js';
import {
  UserSpending,
  SpendingAnalysis,
  SpendingCategory,
  SpendingInsight,
  InsightType,
  InsightSeverity,
  RISK_ASSESSMENT_CONSTANTS,
  calculateOpportunityCost,
  determineInsightSeverity,
} from '@lib/definitions/riskAssessment';

// Configure BigNumber for precise calculations
BigNumber.config({
  DECIMAL_PLACES: 2,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

/**
 * Analyze user spending patterns and generate insights
 */
export function analyzeSpendingPatterns(
  spendingData: UserSpending[],
  periodMonths: number = 12
): SpendingAnalysis {
  if (spendingData.length === 0) {
    return {
      totalSpent: 0,
      averageMonthly: 0,
      averageWeekly: 0,
      categoryBreakdown: [],
      trends: [],
      projections: { yearly: 0, fiveYear: 0, tenYear: 0 },
      opportunityCost: { conservative: 0, moderate: 0, aggressive: 0 },
    };
  }

  // Calculate total spending
  const totalSpent = spendingData.reduce((sum, entry) => sum + entry.amount, 0);
  
  // Calculate averages
  const averageMonthly = totalSpent / Math.max(periodMonths, 1);
  const averageWeekly = averageMonthly / 4.33; // Average weeks per month

  // Category breakdown
  const categoryTotals = spendingData.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<SpendingCategory, number>);

  const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
    category: category as SpendingCategory,
    amount,
    percentage: (amount / totalSpent) * 100,
  }));

  // Trends analysis (monthly)
  const trends = calculateMonthlyTrends(spendingData);

  // Projections based on current average
  const projections = {
    yearly: averageMonthly * 12,
    fiveYear: averageMonthly * 12 * 5,
    tenYear: averageMonthly * 12 * 10,
  };

  // Opportunity cost calculations
  const yearsOfData = periodMonths / 12;
  const opportunityCost = {
    conservative: calculateOpportunityCost(
      totalSpent,
      RISK_ASSESSMENT_CONSTANTS.DEFAULT_INVESTMENT_RATES.CONSERVATIVE,
      yearsOfData
    ),
    moderate: calculateOpportunityCost(
      totalSpent,
      RISK_ASSESSMENT_CONSTANTS.DEFAULT_INVESTMENT_RATES.MODERATE,
      yearsOfData
    ),
    aggressive: calculateOpportunityCost(
      totalSpent,
      RISK_ASSESSMENT_CONSTANTS.DEFAULT_INVESTMENT_RATES.AGGRESSIVE,
      yearsOfData
    ),
  };

  return {
    totalSpent,
    averageMonthly,
    averageWeekly,
    categoryBreakdown,
    trends,
    projections,
    opportunityCost,
  };
}

/**
 * Calculate monthly spending trends
 */
function calculateMonthlyTrends(spendingData: UserSpending[]): {
  period: string;
  amount: number;
  change: number;
}[] {
  // Group spending by month
  const monthlyTotals = spendingData.reduce((acc, entry) => {
    const monthKey = entry.date.toISOString().substring(0, 7); // YYYY-MM
    acc[monthKey] = (acc[monthKey] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort by date
  const sortedMonths = Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, amount], index, array) => {
      const previousAmount = index > 0 ? array[index - 1][1] : amount;
      const change = previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0;
      
      return {
        period,
        amount,
        change,
      };
    });

  return sortedMonths;
}

/**
 * Generate spending insights based on analysis
 */
export function generateSpendingInsights(
  userId: string,
  analysis: SpendingAnalysis,
  currentMonthSpending: number,
  goals: { goalType: string; amountLimit: number; category: string }[] = []
): SpendingInsight[] {
  const insights: Omit<SpendingInsight, 'id' | 'createdAt'>[] = [];

  // Opportunity cost insight
  if (analysis.opportunityCost.moderate > 0) {
    insights.push({
      userId,
      insightType: 'opportunity_cost',
      title: 'Investment Opportunity Cost',
      message: `Your lottery spending could have grown to R$ ${analysis.opportunityCost.moderate.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} if invested at 8% annual return instead.`,
      severity: analysis.opportunityCost.moderate > 50000 ? 'danger' : 'warning',
      dataSnapshot: {
        totalSpent: analysis.totalSpent,
        opportunityCost: analysis.opportunityCost,
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + RISK_ASSESSMENT_CONSTANTS.INSIGHT_EXPIRY_DAYS.WARNING * 24 * 60 * 60 * 1000),
    });
  }

  // Spending trend warning
  const recentTrends = analysis.trends.slice(-3); // Last 3 months
  const averageTrendChange = recentTrends.reduce((sum, trend) => sum + trend.change, 0) / recentTrends.length;
  
  if (averageTrendChange > 50) { // 50% increase trend
    insights.push({
      userId,
      insightType: 'trend_warning',
      title: 'Increasing Spending Trend',
      message: `Your spending has increased by an average of ${averageTrendChange.toFixed(1)}% over the last 3 months. Consider setting spending limits.`,
      severity: 'warning',
      dataSnapshot: {
        trendChange: averageTrendChange,
        recentTrends,
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + RISK_ASSESSMENT_CONSTANTS.INSIGHT_EXPIRY_DAYS.WARNING * 24 * 60 * 60 * 1000),
    });
  }

  // Goal exceeded warnings
  goals.forEach(goal => {
    const relevantSpending = goal.category === 'lottery' 
      ? analysis.categoryBreakdown.find(c => c.category === 'lottery')?.amount || 0
      : analysis.totalSpent;
    
    if (relevantSpending > goal.amountLimit) {
      insights.push({
        userId,
        insightType: 'goal_exceeded',
        title: `${goal.goalType.charAt(0).toUpperCase() + goal.goalType.slice(1)} Goal Exceeded`,
        message: `You've spent R$ ${relevantSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} on ${goal.category}, exceeding your ${goal.goalType} limit of R$ ${goal.amountLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
        severity: 'danger',
        dataSnapshot: {
          goalType: goal.goalType,
          limit: goal.amountLimit,
          spent: relevantSpending,
          category: goal.category,
        },
        isRead: false,
        isDismissed: false,
        expiresAt: new Date(Date.now() + RISK_ASSESSMENT_CONSTANTS.INSIGHT_EXPIRY_DAYS.DANGER * 24 * 60 * 60 * 1000),
      });
    }
  });

  // Milestone achievements
  if (analysis.totalSpent >= 10000 && analysis.totalSpent < 10100) {
    insights.push({
      userId,
      insightType: 'milestone',
      title: 'Spending Milestone Reached',
      message: `You've spent over R$ 10,000 on lottery tickets. This amount could have generated significant returns through investment.`,
      severity: 'warning',
      dataSnapshot: {
        milestone: 10000,
        totalSpent: analysis.totalSpent,
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + RISK_ASSESSMENT_CONSTANTS.INSIGHT_EXPIRY_DAYS.INFO * 24 * 60 * 60 * 1000),
    });
  }

  // Current month spending spike
  if (currentMonthSpending > analysis.averageMonthly * RISK_ASSESSMENT_CONSTANTS.WARNING_THRESHOLDS.SPENDING_SPIKE) {
    insights.push({
      userId,
      insightType: 'trend_warning',
      title: 'Unusual Spending This Month',
      message: `This month's spending (R$ ${currentMonthSpending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}) is ${((currentMonthSpending / analysis.averageMonthly - 1) * 100).toFixed(0)}% higher than your average.`,
      severity: determineInsightSeverity(currentMonthSpending, analysis.averageMonthly),
      dataSnapshot: {
        currentSpending: currentMonthSpending,
        averageSpending: analysis.averageMonthly,
        percentageIncrease: (currentMonthSpending / analysis.averageMonthly - 1) * 100,
      },
      isRead: false,
      isDismissed: false,
      expiresAt: new Date(Date.now() + RISK_ASSESSMENT_CONSTANTS.INSIGHT_EXPIRY_DAYS.WARNING * 24 * 60 * 60 * 1000),
    });
  }

  return insights as SpendingInsight[];
}

/**
 * Calculate spending projections with different scenarios
 */
export function calculateSpendingProjections(
  currentMonthlyAverage: number,
  scenarios: {
    name: string;
    monthlyChange: number; // Percentage change per month
    description: string;
  }[]
): {
  scenario: string;
  description: string;
  projections: {
    sixMonths: number;
    oneYear: number;
    fiveYears: number;
    tenYears: number;
  };
}[] {
  return scenarios.map(scenario => {
    const monthlyGrowthRate = scenario.monthlyChange / 100;
    
    // Calculate compound growth
    const sixMonths = calculateCompoundGrowth(currentMonthlyAverage, monthlyGrowthRate, 6);
    const oneYear = calculateCompoundGrowth(currentMonthlyAverage, monthlyGrowthRate, 12);
    const fiveYears = calculateCompoundGrowth(currentMonthlyAverage, monthlyGrowthRate, 60);
    const tenYears = calculateCompoundGrowth(currentMonthlyAverage, monthlyGrowthRate, 120);
    
    return {
      scenario: scenario.name,
      description: scenario.description,
      projections: {
        sixMonths,
        oneYear,
        fiveYears,
        tenYears,
      },
    };
  });
}

/**
 * Calculate compound growth for spending projections
 */
function calculateCompoundGrowth(
  initialMonthlyAmount: number,
  monthlyGrowthRate: number,
  months: number
): number {
  let total = 0;
  let currentMonthly = initialMonthlyAmount;
  
  for (let i = 0; i < months; i++) {
    total += currentMonthly;
    currentMonthly *= (1 + monthlyGrowthRate);
  }
  
  return total;
}

/**
 * Compare user spending to statistical averages
 */
export function compareToAverages(
  userMonthlySpending: number,
  userCategory: 'lottery' | 'total' = 'lottery'
): {
  userSpending: number;
  nationalAverage: number;
  percentile: number;
  comparison: 'below' | 'average' | 'above' | 'extreme';
  message: string;
} {
  // Brazilian lottery spending statistics (estimated)
  const nationalAverages = {
    lottery: 45, // R$ 45 per month average
    total: 150,  // R$ 150 per month total entertainment spending
  };
  
  const nationalAverage = nationalAverages[userCategory];
  const ratio = userMonthlySpending / nationalAverage;
  
  let percentile: number;
  let comparison: 'below' | 'average' | 'above' | 'extreme';
  let message: string;
  
  if (ratio < 0.5) {
    percentile = 25;
    comparison = 'below';
    message = `Your spending is below the national average. You're in the bottom 25% of ${userCategory} spenders.`;
  } else if (ratio < 1.5) {
    percentile = 50;
    comparison = 'average';
    message = `Your spending is close to the national average for ${userCategory} spending.`;
  } else if (ratio < 3.0) {
    percentile = 75;
    comparison = 'above';
    message = `Your spending is above average. You're in the top 25% of ${userCategory} spenders.`;
  } else {
    percentile = 90;
    comparison = 'extreme';
    message = `Your spending is significantly above average. You're in the top 10% of ${userCategory} spenders.`;
  }
  
  return {
    userSpending: userMonthlySpending,
    nationalAverage,
    percentile,
    comparison,
    message,
  };
}
