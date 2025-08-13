import { NextRequest, NextResponse } from 'next/server';
import { RiskAssessmentResponse } from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * GET /api/v1/risk-assessment/insights
 * 
 * Get spending insights for the authenticated user
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Get spending insights
    const insights = await SpendingService.getUserInsights(authResult.user.id, {
      unreadOnly,
      limit: Math.min(limit, 100), // Cap at 100 insights
    });
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: insights,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching spending insights:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching spending insights',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/risk-assessment/insights
 * 
 * Trigger insight generation for the authenticated user
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

    // Generate insights for user
    await SpendingService.generateInsightsForUser(authResult.user.id);
    
    // Get updated insights
    const insights = await SpendingService.getUserInsights(authResult.user.id, {
      unreadOnly: true,
      limit: 10,
    });
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: {
          message: 'Insights generated successfully',
          newInsights: insights,
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error generating insights:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while generating insights',
      },
      { status: 500 }
    );
  }
}
