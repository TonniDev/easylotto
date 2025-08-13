import { NextRequest, NextResponse } from 'next/server';
import { 
  UpdateGoalRequestSchema,
  RiskAssessmentResponse 
} from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * PATCH /api/v1/risk-assessment/goals/[id]
 * 
 * Update a spending goal for the authenticated user
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<RiskAssessmentResponse>> {
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
    const validationResult = UpdateGoalRequestSchema.safeParse(body);
    
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
    const goalId = params.id;
    
    // Update spending goal
    const goal = await SpendingService.updateGoal(authResult.user.id, goalId, goalData);
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: goal,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating spending goal:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while updating spending goal',
      },
      { status: 500 }
    );
  }
}
