import { NextRequest, NextResponse } from 'next/server';
import { 
  CreateArticleRequestSchema,
  ContentManagementResponse,
  ArticleSearchOptions 
} from '@lib/definitions/contentManagement';
import ContentService from '@lib/services/contentService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * POST /api/v1/content/articles
 * 
 * Create a new article
 */
export async function POST(request: NextRequest): Promise<NextResponse<ContentManagementResponse>> {
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
    const validationResult = CreateArticleRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request data: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    const articleData = validationResult.data;
    
    // Create article
    const article = await ContentService.createArticle(authResult.user.id, articleData);
    
    return NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating article:', error);
    
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          error: 'An article with this slug already exists',
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while creating article',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/content/articles
 * 
 * Get articles with search and filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse<ContentManagementResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const options: ArticleSearchOptions = {
      search: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: (searchParams.get('status') as any) || undefined,
      author: searchParams.get('author') || undefined,
      tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '10'), 50), // Cap at 50
      sortBy: (searchParams.get('sortBy') as any) || 'publishedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
    };
    
    // Validate page and limit
    if (options.page! < 1) options.page = 1;
    if (options.limit! < 1) options.limit = 10;
    
    // Get articles
    const result = await ContentService.getArticles(options);
    
    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching articles',
      },
      { status: 500 }
    );
  }
}
