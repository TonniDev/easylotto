import { NextRequest, NextResponse } from 'next/server';
import {
  CreateGoalRequestSchema,
  RiskAssessmentResponse
} from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * POST /api/v1/risk-assessment/goals
 * 
 * Create a new spending goal for the authenticated user
 */
export async function POST(request: NextRequest): Promise<NextResponse<RiskAssessmentResponse>> {
  try {
    // Verify authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request data
    const validationResult = CreateGoalRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: `Invalid request data: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    const goalData = validationResult.data;
    
    // Create spending goal
    const goal = await SpendingService.createGoal(authResult.user.id, goalData);
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: goal,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating spending goal:', error);
    
    if (error instanceof Error && error.message.includes('Maximum of')) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while creating spending goal',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/risk-assessment/goals
 * 
 * Get spending goals for the authenticated user
 */
export async function GET(request: NextRequest): Promise<NextResponse<RiskAssessmentResponse>> {
  try {
    // Verify authentication
    const authResult = await authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false'; // Default to true
    
    // Get spending goals
    const goals = await SpendingService.getUserGoals(authResult.user.id, activeOnly);
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: goals,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching spending goals:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching spending goals',
      },
      { status: 500 }
    );
  }
}
