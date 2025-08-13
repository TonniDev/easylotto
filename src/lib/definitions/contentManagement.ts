import { z } from 'zod';

/**
 * Article status types
 */
export type ArticleStatus = 'draft' | 'published' | 'archived';

/**
 * Content block types
 */
export type ContentBlockType = 'hero' | 'feature' | 'testimonial' | 'faq' | 'calculator' | 'guide';

/**
 * Resource types
 */
export type ResourceType = 'calculator' | 'guide' | 'video' | 'infographic' | 'tool';

/**
 * Difficulty levels
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Article interface
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  status: ArticleStatus;
  categoryId?: string;
  authorId: string;
  readingTime?: number;
  viewCount: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  category?: ArticleCategory;
  author?: {
    id: string;
    firstName: string;
    email: string;
  };
  tags?: ArticleTag[];
}

/**
 * Article category interface
 */
export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  articleCount?: number;
}

/**
 * Article tag interface
 */
export interface ArticleTag {
  id: string;
  articleId: string;
  tagName: string;
  createdAt: Date;
}

/**
 * Article view interface
 */
export interface ArticleView {
  id: string;
  articleId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: Date;
}

/**
 * Content block interface
 */
export interface ContentBlock {
  id: string;
  name: string;
  title?: string;
  content: string;
  blockType: ContentBlockType;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Educational resource interface
 */
export interface EducationalResource {
  id: string;
  title: string;
  description?: string;
  resourceType: ResourceType;
  resourceUrl?: string;
  thumbnailUrl?: string;
  difficultyLevel: DifficultyLevel;
  estimatedTime?: number;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Article list response
 */
export interface ArticleListResponse {
  articles: Article[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: {
    category?: string;
    status?: ArticleStatus;
    search?: string;
  };
}

/**
 * Request schemas for API validation
 */
export const CreateArticleRequestSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(1),
  featuredImage: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  categoryId: z.string().uuid().optional(),
  readingTime: z.number().int().positive().optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const UpdateArticleRequestSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
  excerpt: z.string().max(1000).optional(),
  content: z.string().min(1).optional(),
  featuredImage: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  categoryId: z.string().uuid().optional(),
  readingTime: z.number().int().positive().optional(),
  seoTitle: z.string().max(255).optional(),
  seoDescription: z.string().max(500).optional(),
  seoKeywords: z.string().optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
});

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex code').optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().default(0),
});

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const CreateContentBlockRequestSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().max(255).optional(),
  content: z.string().min(1),
  blockType: z.enum(['hero', 'feature', 'testimonial', 'faq', 'calculator', 'guide']),
  sortOrder: z.number().int().default(0),
});

export const UpdateContentBlockRequestSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  title: z.string().max(255).optional(),
  content: z.string().min(1).optional(),
  blockType: z.enum(['hero', 'feature', 'testimonial', 'faq', 'calculator', 'guide']).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const CreateResourceRequestSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  resourceType: z.enum(['calculator', 'guide', 'video', 'infographic', 'tool']),
  resourceUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.number().int().positive().optional(),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export type CreateArticleRequest = z.infer<typeof CreateArticleRequestSchema>;
export type UpdateArticleRequest = z.infer<typeof UpdateArticleRequestSchema>;
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;
export type CreateContentBlockRequest = z.infer<typeof CreateContentBlockRequestSchema>;
export type UpdateContentBlockRequest = z.infer<typeof UpdateContentBlockRequestSchema>;
export type CreateResourceRequest = z.infer<typeof CreateResourceRequestSchema>;

/**
 * API Response types
 */
export interface ContentManagementResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Search and filter options
 */
export interface ArticleSearchOptions {
  search?: string;
  category?: string;
  status?: ArticleStatus;
  author?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'publishedAt' | 'viewCount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Content statistics
 */
export interface ContentStatistics {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalCategories: number;
  totalTags: number;
  popularArticles: Array<{
    id: string;
    title: string;
    viewCount: number;
  }>;
  recentArticles: Array<{
    id: string;
    title: string;
    publishedAt: Date;
  }>;
}

/**
 * Helper functions
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200; // Average reading speed
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export function extractExcerpt(content: string, maxLength: number = 200): string {
  // Remove HTML tags and get plain text
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // Find the last complete sentence within the limit
  const truncated = plainText.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  
  if (lastSentence > maxLength * 0.7) {
    return truncated.substring(0, lastSentence + 1);
  }
  
  // If no good sentence break, find last word boundary
  const lastSpace = truncated.lastIndexOf(' ');
  return truncated.substring(0, lastSpace) + '...';
}

export function formatPublishDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getReadingTimeText(minutes: number): string {
  if (minutes <= 1) return '1 minuto de leitura';
  return `${minutes} minutos de leitura`;
}
