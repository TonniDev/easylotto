import { PrismaClient } from '@prisma/client';
import {
  UserSpending,
  SpendingGoal,
  SpendingInsight,
  InvestmentScenario,
  SpendingReport,
  RiskDashboardSummary,
  AddSpendingRequest,
  CreateGoalRequest,
  UpdateGoalRequest,
  CreateInvestmentScenarioRequest,
  GenerateReportRequest,
  calculatePeriodDates,
  RISK_ASSESSMENT_CONSTANTS,
} from '@lib/definitions/riskAssessment';
import { analyzeSpendingPatterns, generateSpendingInsights } from '@lib/utils/riskAssessment/spendingAnalysis';

const prisma = new PrismaClient();

/**
 * Spending Service - Database operations for risk assessment
 */
export class SpendingService {
  /**
   * Add a new spending entry
   */
  static async addSpending(userId: string, data: AddSpendingRequest): Promise<UserSpending> {
    const spending = await prisma.user_spending.create({
      data: {
        user_id: userId,
        amount: data.amount,
        date: new Date(data.date),
        category: data.category,
        description: data.description,
        game_type: data.gameType,
        games_count: data.gamesCount,
      },
    });

    // Generate insights after adding spending
    await this.generateInsightsForUser(userId);

    return this.mapSpendingFromDb(spending);
  }

  /**
   * Get user spending data with optional filters
   */
  static async getUserSpending(
    userId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      category?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<UserSpending[]> {
    const { startDate, endDate, category, limit = 100, offset = 0 } = options;

    const spending = await prisma.user_spending.findMany({
      where: {
        user_id: userId,
        ...(startDate && { date: { gte: startDate } }),
        ...(endDate && { date: { lte: endDate } }),
        ...(category && { category }),
      },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
    });

    return spending.map(this.mapSpendingFromDb);
  }

  /**
   * Create a spending goal
   */
  static async createGoal(userId: string, data: CreateGoalRequest): Promise<SpendingGoal> {
    // Check if user already has too many goals
    const existingGoals = await prisma.spending_goals.count({
      where: { user_id: userId, is_active: true },
    });

    if (existingGoals >= RISK_ASSESSMENT_CONSTANTS.MAX_GOALS_PER_USER) {
      throw new Error(`Maximum of ${RISK_ASSESSMENT_CONSTANTS.MAX_GOALS_PER_USER} active goals allowed`);
    }

    const goal = await prisma.spending_goals.create({
      data: {
        user_id: userId,
        goal_type: data.goalType,
        amount_limit: data.amountLimit,
        category: data.category,
        warning_enabled: data.warningEnabled,
        warning_threshold: data.warningThreshold,
      },
    });

    return this.mapGoalFromDb(goal);
  }

  /**
   * Update a spending goal
   */
  static async updateGoal(
    userId: string,
    goalId: string,
    data: UpdateGoalRequest
  ): Promise<SpendingGoal> {
    const goal = await prisma.spending_goals.update({
      where: {
        id: goalId,
        user_id: userId,
      },
      data: {
        ...(data.amountLimit !== undefined && { amount_limit: data.amountLimit }),
        ...(data.isActive !== undefined && { is_active: data.isActive }),
        ...(data.warningEnabled !== undefined && { warning_enabled: data.warningEnabled }),
        ...(data.warningThreshold !== undefined && { warning_threshold: data.warningThreshold }),
      },
    });

    return this.mapGoalFromDb(goal);
  }

  /**
   * Get user spending goals
   */
  static async getUserGoals(userId: string, activeOnly: boolean = true): Promise<SpendingGoal[]> {
    const goals = await prisma.spending_goals.findMany({
      where: {
        user_id: userId,
        ...(activeOnly && { is_active: true }),
      },
      orderBy: { created_at: 'desc' },
    });

    return goals.map(this.mapGoalFromDb);
  }

  /**
   * Get user insights
   */
  static async getUserInsights(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number } = {}
  ): Promise<SpendingInsight[]> {
    const { unreadOnly = false, limit = 20 } = options;

    const insights = await prisma.spending_insights.findMany({
      where: {
        user_id: userId,
        ...(unreadOnly && { is_read: false }),
        is_dismissed: false,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
      },
      orderBy: [
        { severity: 'desc' },
        { created_at: 'desc' },
      ],
      take: limit,
    });

    return insights.map(this.mapInsightFromDb);
  }

  /**
   * Mark insight as read
   */
  static async markInsightAsRead(userId: string, insightId: string): Promise<void> {
    await prisma.spending_insights.update({
      where: {
        id: insightId,
        user_id: userId,
      },
      data: {
        is_read: true,
      },
    });
  }

  /**
   * Dismiss insight
   */
  static async dismissInsight(userId: string, insightId: string): Promise<void> {
    await prisma.spending_insights.update({
      where: {
        id: insightId,
        user_id: userId,
      },
      data: {
        is_dismissed: true,
      },
    });
  }

  /**
   * Generate dashboard summary
   */
  static async getDashboardSummary(userId: string): Promise<RiskDashboardSummary> {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get spending data
    const allSpending = await this.getUserSpending(userId, {
      startDate: oneYearAgo,
      endDate: now,
    });

    const currentMonthSpending = await this.getUserSpending(userId, {
      startDate: currentMonthStart,
      endDate: now,
    });

    // Get goals
    const goals = await this.getUserGoals(userId);

    // Get insights
    const insights = await this.getUserInsights(userId, { limit: 10 });

    // Calculate totals
    const totalSpending = allSpending.reduce((sum, s) => sum + s.amount, 0);
    const lotterySpending = allSpending
      .filter(s => s.category === 'lottery')
      .reduce((sum, s) => sum + s.amount, 0);
    const investmentSpending = allSpending
      .filter(s => s.category === 'investment')
      .reduce((sum, s) => sum + s.amount, 0);
    const currentPeriodSpending = currentMonthSpending.reduce((sum, s) => sum + s.amount, 0);

    // Analyze spending patterns
    const analysis = analyzeSpendingPatterns(allSpending, 12);

    // Calculate goal progress
    const goalProgress = goals.map(goal => {
      const relevantSpending = goal.category === 'lottery' ? lotterySpending : totalSpending;
      const percentage = (relevantSpending / goal.amountLimit) * 100;
      
      return {
        goalType: goal.goalType,
        limit: goal.amountLimit,
        spent: relevantSpending,
        percentage: Math.min(percentage, 100),
        isExceeded: relevantSpending > goal.amountLimit,
      };
    });

    // Calculate trends
    const trends = analysis.trends.slice(-6).map(trend => ({
      period: trend.period,
      amount: trend.amount,
      category: 'lottery' as const,
    }));

    return {
      totalSpending,
      lotterySpending,
      investmentSpending,
      currentPeriodSpending,
      goalProgress,
      opportunityCost: analysis.opportunityCost.moderate,
      insights,
      trends,
    };
  }

  /**
   * Generate insights for user based on current spending patterns
   */
  static async generateInsightsForUser(userId: string): Promise<void> {
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get spending data
    const allSpending = await this.getUserSpending(userId, {
      startDate: oneYearAgo,
      endDate: now,
    });

    const currentMonthSpending = await this.getUserSpending(userId, {
      startDate: currentMonthStart,
      endDate: now,
    });

    const currentMonthTotal = currentMonthSpending.reduce((sum, s) => sum + s.amount, 0);

    // Get goals
    const goals = await this.getUserGoals(userId);

    // Analyze patterns
    const analysis = analyzeSpendingPatterns(allSpending, 12);

    // Generate insights
    const newInsights = generateSpendingInsights(
      userId,
      analysis,
      currentMonthTotal,
      goals.map(g => ({
        goalType: g.goalType,
        amountLimit: g.amountLimit,
        category: g.category,
      }))
    );

    // Save new insights to database
    for (const insight of newInsights) {
      // Check if similar insight already exists
      const existingInsight = await prisma.spending_insights.findFirst({
        where: {
          user_id: userId,
          insight_type: insight.insightType,
          is_dismissed: false,
          created_at: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (!existingInsight) {
        await prisma.spending_insights.create({
          data: {
            user_id: insight.userId,
            insight_type: insight.insightType,
            title: insight.title,
            message: insight.message,
            severity: insight.severity,
            data_snapshot: insight.dataSnapshot,
            expires_at: insight.expiresAt,
          },
        });
      }
    }
  }

  /**
   * Database mapping functions
   */
  private static mapSpendingFromDb(spending: any): UserSpending {
    return {
      id: spending.id,
      userId: spending.user_id,
      amount: parseFloat(spending.amount),
      date: spending.date,
      category: spending.category,
      description: spending.description,
      gameType: spending.game_type,
      gamesCount: spending.games_count,
      createdAt: spending.created_at,
      updatedAt: spending.updated_at,
    };
  }

  private static mapGoalFromDb(goal: any): SpendingGoal {
    return {
      id: goal.id,
      userId: goal.user_id,
      goalType: goal.goal_type,
      amountLimit: parseFloat(goal.amount_limit),
      category: goal.category,
      isActive: goal.is_active,
      warningEnabled: goal.warning_enabled,
      warningThreshold: parseFloat(goal.warning_threshold),
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    };
  }

  private static mapInsightFromDb(insight: any): SpendingInsight {
    return {
      id: insight.id,
      userId: insight.user_id,
      insightType: insight.insight_type,
      title: insight.title,
      message: insight.message,
      severity: insight.severity,
      dataSnapshot: insight.data_snapshot,
      isRead: insight.is_read,
      isDismissed: insight.is_dismissed,
      expiresAt: insight.expires_at,
      createdAt: insight.created_at,
    };
  }
}

export default SpendingService;
