import { NextRequest, NextResponse } from 'next/server';
import { RiskAssessmentResponse } from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * PATCH /api/v1/risk-assessment/insights/[id]
 * 
 * Update insight status (mark as read or dismiss)
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
    const { action } = body;
    
    if (!action || !['read', 'dismiss'].includes(action)) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Must be "read" or "dismiss"',
        },
        { status: 400 }
      );
    }
    
    const insightId = params.id;
    
    if (action === 'read') {
      await SpendingService.markInsightAsRead(authResult.user.id, insightId);
    } else if (action === 'dismiss') {
      await SpendingService.dismissInsight(authResult.user.id, insightId);
    }
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: {
          message: `Insight ${action === 'read' ? 'marked as read' : 'dismissed'} successfully`,
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating insight:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while updating insight',
      },
      { status: 500 }
    );
  }
}
