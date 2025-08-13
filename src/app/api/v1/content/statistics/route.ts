import { NextRequest, NextResponse } from 'next/server';
import { ContentManagementResponse } from '@lib/definitions/contentManagement';
import ContentService from '@lib/services/contentService';

/**
 * GET /api/v1/content/statistics
 * 
 * Get content management statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse<ContentManagementResponse>> {
  try {
    // Get content statistics
    const statistics = await ContentService.getContentStatistics();
    
    return NextResponse.json(
      {
        success: true,
        data: statistics,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching content statistics:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching statistics',
      },
      { status: 500 }
    );
  }
}
