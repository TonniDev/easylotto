import { PrismaClient } from '@prisma/client';
import {
  Article,
  ArticleCategory,
  ContentBlock,
  EducationalResource,
  ArticleListResponse,
  ArticleSearchOptions,
  ContentStatistics,
  CreateArticleRequest,
  UpdateArticleRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateContentBlockRequest,
  UpdateContentBlockRequest,
  CreateResourceRequest,
  generateSlug,
  estimateReadingTime,
  extractExcerpt,
} from '@lib/definitions/contentManagement';

const prisma = new PrismaClient();

/**
 * Content Management Service - Database operations for CMS
 */
export class ContentService {
  /**
   * Create a new article
   */
  static async createArticle(authorId: string, data: CreateArticleRequest): Promise<Article> {
    // Ensure slug is unique
    let slug = data.slug;
    let counter = 1;
    while (await this.isSlugTaken(slug)) {
      slug = `${data.slug}-${counter}`;
      counter++;
    }

    // Auto-generate reading time if not provided
    const readingTime = data.readingTime || estimateReadingTime(data.content);

    // Auto-generate excerpt if not provided
    const excerpt = data.excerpt || extractExcerpt(data.content);

    const article = await prisma.articles.create({
      data: {
        title: data.title,
        slug,
        excerpt,
        content: data.content,
        featured_image: data.featuredImage,
        status: data.status,
        category_id: data.categoryId,
        author_id: authorId,
        reading_time: readingTime,
        seo_title: data.seoTitle,
        seo_description: data.seoDescription,
        seo_keywords: data.seoKeywords,
        published_at: data.status === 'published' ? new Date() : null,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            first_name: true,
            email: true,
          },
        },
      },
    });

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      await prisma.article_tags.createMany({
        data: data.tags.map(tag => ({
          article_id: article.id,
          tag_name: tag.toLowerCase().trim(),
        })),
      });
    }

    return this.mapArticleFromDb(article);
  }

  /**
   * Update an existing article
   */
  static async updateArticle(
    articleId: string,
    data: UpdateArticleRequest
  ): Promise<Article> {
    // Check if slug needs to be updated and is unique
    let updateData: any = { ...data };
    if (data.slug) {
      const existingArticle = await prisma.articles.findUnique({
        where: { id: articleId },
        select: { slug: true },
      });

      if (existingArticle?.slug !== data.slug) {
        let slug = data.slug;
        let counter = 1;
        while (await this.isSlugTaken(slug, articleId)) {
          slug = `${data.slug}-${counter}`;
          counter++;
        }
        updateData.slug = slug;
      }
    }

    // Update reading time if content changed
    if (data.content) {
      updateData.reading_time = estimateReadingTime(data.content);
      
      // Update excerpt if not explicitly provided
      if (!data.excerpt) {
        updateData.excerpt = extractExcerpt(data.content);
      }
    }

    // Set published_at if status changed to published
    if (data.status === 'published') {
      const currentArticle = await prisma.articles.findUnique({
        where: { id: articleId },
        select: { status: true, published_at: true },
      });

      if (currentArticle?.status !== 'published' && !currentArticle?.published_at) {
        updateData.published_at = new Date();
      }
    }

    // Convert camelCase to snake_case for database
    const dbData = {
      title: updateData.title,
      slug: updateData.slug,
      excerpt: updateData.excerpt,
      content: updateData.content,
      featured_image: updateData.featuredImage,
      status: updateData.status,
      category_id: updateData.categoryId,
      reading_time: updateData.reading_time,
      seo_title: updateData.seoTitle,
      seo_description: updateData.seoDescription,
      seo_keywords: updateData.seoKeywords,
      published_at: updateData.published_at,
    };

    // Remove undefined values
    Object.keys(dbData).forEach(key => {
      if (dbData[key] === undefined) {
        delete dbData[key];
      }
    });

    const article = await prisma.articles.update({
      where: { id: articleId },
      data: dbData,
      include: {
        category: true,
        author: {
          select: {
            id: true,
            first_name: true,
            email: true,
          },
        },
      },
    });

    // Update tags if provided
    if (data.tags !== undefined) {
      // Remove existing tags
      await prisma.article_tags.deleteMany({
        where: { article_id: articleId },
      });

      // Add new tags
      if (data.tags.length > 0) {
        await prisma.article_tags.createMany({
          data: data.tags.map(tag => ({
            article_id: articleId,
            tag_name: tag.toLowerCase().trim(),
          })),
        });
      }
    }

    return this.mapArticleFromDb(article);
  }

  /**
   * Get article by ID or slug
   */
  static async getArticle(identifier: string, includeViews: boolean = false): Promise<Article | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const article = await prisma.articles.findUnique({
      where: isUuid ? { id: identifier } : { slug: identifier },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            first_name: true,
            email: true,
          },
        },
        tags: true,
        ...(includeViews && { views: true }),
      },
    });

    return article ? this.mapArticleFromDb(article) : null;
  }

  /**
   * Get articles with search and filtering
   */
  static async getArticles(options: ArticleSearchOptions = {}): Promise<ArticleListResponse> {
    const {
      search,
      category,
      status,
      author,
      tags,
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (author) {
      where.author = {
        id: author,
      };
    }

    if (tags && tags.length > 0) {
      where.tags = {
        some: {
          tag_name: {
            in: tags.map(tag => tag.toLowerCase()),
          },
        },
      };
    }

    // Build order by clause
    const orderBy: any = {};
    switch (sortBy) {
      case 'title':
        orderBy.title = sortOrder;
        break;
      case 'publishedAt':
        orderBy.published_at = sortOrder;
        break;
      case 'viewCount':
        orderBy.view_count = sortOrder;
        break;
      case 'createdAt':
      default:
        orderBy.created_at = sortOrder;
        break;
    }

    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        where,
        include: {
          category: true,
          author: {
            select: {
              id: true,
              first_name: true,
              email: true,
            },
          },
          tags: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.articles.count({ where }),
    ]);

    return {
      articles: articles.map(this.mapArticleFromDb),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        category,
        status,
        search,
      },
    };
  }

  /**
   * Record article view
   */
  static async recordView(articleId: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    // Check if this user/IP has viewed this article recently (within 24 hours)
    const recentView = await prisma.article_views.findFirst({
      where: {
        article_id: articleId,
        ...(userId ? { user_id: userId } : { ip_address: ipAddress }),
        viewed_at: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    if (!recentView) {
      // Record new view
      await prisma.article_views.create({
        data: {
          article_id: articleId,
          user_id: userId,
          ip_address: ipAddress,
          user_agent: userAgent,
        },
      });

      // Update article view count
      await prisma.articles.update({
        where: { id: articleId },
        data: {
          view_count: {
            increment: 1,
          },
        },
      });
    }
  }

  /**
   * Get content statistics
   */
  static async getContentStatistics(): Promise<ContentStatistics> {
    const [
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalCategories,
      totalTags,
      popularArticles,
      recentArticles,
    ] = await Promise.all([
      prisma.articles.count(),
      prisma.articles.count({ where: { status: 'published' } }),
      prisma.articles.count({ where: { status: 'draft' } }),
      prisma.articles.aggregate({ _sum: { view_count: true } }),
      prisma.article_categories.count({ where: { is_active: true } }),
      prisma.article_tags.groupBy({ by: ['tag_name'] }).then(tags => tags.length),
      prisma.articles.findMany({
        where: { status: 'published' },
        select: { id: true, title: true, view_count: true },
        orderBy: { view_count: 'desc' },
        take: 5,
      }),
      prisma.articles.findMany({
        where: { status: 'published' },
        select: { id: true, title: true, published_at: true },
        orderBy: { published_at: 'desc' },
        take: 5,
      }),
    ]);

    return {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews: totalViews._sum.view_count || 0,
      totalCategories,
      totalTags,
      popularArticles: popularArticles.map(article => ({
        id: article.id,
        title: article.title,
        viewCount: article.view_count,
      })),
      recentArticles: recentArticles.map(article => ({
        id: article.id,
        title: article.title,
        publishedAt: article.published_at!,
      })),
    };
  }

  /**
   * Check if slug is already taken
   */
  private static async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.articles.findUnique({
      where: { slug },
      select: { id: true },
    });

    return existing !== null && existing.id !== excludeId;
  }

  /**
   * Map database article to interface
   */
  private static mapArticleFromDb(article: any): Article {
    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      featuredImage: article.featured_image,
      status: article.status,
      categoryId: article.category_id,
      authorId: article.author_id,
      readingTime: article.reading_time,
      viewCount: article.view_count,
      seoTitle: article.seo_title,
      seoDescription: article.seo_description,
      seoKeywords: article.seo_keywords,
      publishedAt: article.published_at,
      createdAt: article.created_at,
      updatedAt: article.updated_at,
      category: article.category ? {
        id: article.category.id,
        name: article.category.name,
        slug: article.category.slug,
        description: article.category.description,
        color: article.category.color,
        icon: article.category.icon,
        sortOrder: article.category.sort_order,
        isActive: article.category.is_active,
        createdAt: article.category.created_at,
        updatedAt: article.category.updated_at,
      } : undefined,
      author: article.author ? {
        id: article.author.id,
        firstName: article.author.first_name,
        email: article.author.email,
      } : undefined,
      tags: article.tags?.map((tag: any) => ({
        id: tag.id,
        articleId: tag.article_id,
        tagName: tag.tag_name,
        createdAt: tag.created_at,
      })),
    };
  }
}

export default ContentService;
