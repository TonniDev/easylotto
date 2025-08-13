import { NextRequest, NextResponse } from 'next/server';
import {
  AddSpendingRequestSchema,
  RiskAssessmentResponse
} from '@lib/definitions/riskAssessment';
import SpendingService from '@lib/services/spendingService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * POST /api/v1/risk-assessment/spending
 * 
 * Add a new spending entry for the authenticated user
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
    const validationResult = AddSpendingRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: `Invalid request data: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    const spendingData = validationResult.data;
    
    // Add spending entry
    const spending = await SpendingService.addSpending(authResult.user.id, spendingData);
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: spending,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error adding spending entry:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while adding spending entry',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/risk-assessment/spending
 * 
 * Get spending entries for the authenticated user
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
    
    // Parse query parameters
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined;
    const category = searchParams.get('category') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Validate dates
    if (startDate && isNaN(startDate.getTime())) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: 'Invalid startDate format',
        },
        { status: 400 }
      );
    }
    
    if (endDate && isNaN(endDate.getTime())) {
      return authResult.response || NextResponse.json(
        {
          success: false,
          error: 'Invalid endDate format',
        },
        { status: 400 }
      );
    }
    
    // Get spending data
    const spending = await SpendingService.getUserSpending(authResult.user.id, {
      startDate,
      endDate,
      category,
      limit: Math.min(limit, 1000), // Cap at 1000 entries
      offset: Math.max(offset, 0),
    });
    
    return authResult.response || NextResponse.json(
      {
        success: true,
        data: {
          spending,
          pagination: {
            limit,
            offset,
            total: spending.length,
          },
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching spending data:', error);
    
    return authResult.response || NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching spending data',
      },
      { status: 500 }
    );
  }
}
