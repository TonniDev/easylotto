import { NextRequest, NextResponse } from 'next/server';
import { RiskAssessmentResponse } from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * GET /api/v1/risk-assessment/dashboard
 * 
 * Get risk assessment dashboard summary for the authenticated user
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

    // Get dashboard summary
    const summary = await SpendingService.getDashboardSummary(authResult.user.id);
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: {
          summary,
          generatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching dashboard summary',
      },
      { status: 500 }
    );
  }
}
