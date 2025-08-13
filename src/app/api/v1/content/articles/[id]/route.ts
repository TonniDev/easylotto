import { NextRequest, NextResponse } from 'next/server';
import { 
  UpdateArticleRequestSchema,
  ContentManagementResponse 
} from '@lib/definitions/contentManagement';
import ContentService from '@lib/services/contentService';
import { authenticateRequest } from '@lib/middleware/auth';

/**
 * GET /api/v1/content/articles/[id]
 * 
 * Get article by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContentManagementResponse>> {
  try {
    const articleId = params.id;
    
    // Get client IP for view tracking
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;
    
    // Check if user is authenticated (optional for public articles)
    let userId: string | undefined;
    try {
      const authResult = await authenticateRequest(request);
      if (authResult.authenticated && authResult.user) {
        userId = authResult.user.id;
      }
    } catch {
      // Ignore auth errors for public access
    }
    
    // Get article
    const article = await ContentService.getArticle(articleId, true);
    
    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }
    
    // Record view (only for published articles)
    if (article.status === 'published') {
      await ContentService.recordView(article.id, userId, clientIP, userAgent);
    }
    
    return NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching article:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while fetching article',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/content/articles/[id]
 * 
 * Update an existing article
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContentManagementResponse>> {
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
    const validationResult = UpdateArticleRequestSchema.safeParse(body);
    
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
    const articleId = params.id;
    
    // Check if article exists and user has permission
    const existingArticle = await ContentService.getArticle(articleId);
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }
    
    // For now, only allow authors to edit their own articles
    // In a full implementation, you'd check for admin roles too
    if (existingArticle.authorId !== authResult.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
        },
        { status: 403 }
      );
    }
    
    // Update article
    const article = await ContentService.updateArticle(articleId, articleData);
    
    return NextResponse.json(
      {
        success: true,
        data: article,
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error updating article:', error);
    
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
        error: 'Internal server error occurred while updating article',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/content/articles/[id]
 * 
 * Delete an article (soft delete by setting status to archived)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContentManagementResponse>> {
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

    const articleId = params.id;
    
    // Check if article exists and user has permission
    const existingArticle = await ContentService.getArticle(articleId);
    if (!existingArticle) {
      return NextResponse.json(
        {
          success: false,
          error: 'Article not found',
        },
        { status: 404 }
      );
    }
    
    // For now, only allow authors to delete their own articles
    if (existingArticle.authorId !== authResult.user.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Permission denied',
        },
        { status: 403 }
      );
    }
    
    // Soft delete by archiving
    const article = await ContentService.updateArticle(articleId, { status: 'archived' });
    
    return NextResponse.json(
      {
        success: true,
        data: { message: 'Article archived successfully' },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error deleting article:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while deleting article',
      },
      { status: 500 }
    );
  }
}
