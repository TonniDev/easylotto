import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateArticleRequestSchema } from '@lib/definitions/contentManagement';

// Mock the entire route module for now since authentication is complex
vi.mock('./route', () => ({
  POST: vi.fn(),
  GET: vi.fn(),
}));

describe('Content Management API - Data Validation', () => {
  describe('CreateArticleRequestSchema', () => {
    it('should validate complete article data', () => {
      const validData = {
        title: 'Understanding Lottery Probability',
        slug: 'understanding-lottery-probability',
        excerpt: 'Learn the mathematical foundations of lottery probability and why most strategies fail.',
        content: 'This comprehensive guide explains the mathematical principles behind lottery games...',
        featuredImage: 'https://example.com/image.jpg',
        status: 'draft',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        readingTime: 5,
        seoTitle: 'Lottery Probability Guide - Mathematical Analysis',
        seoDescription: 'Complete guide to understanding lottery probability with mathematical examples.',
        seoKeywords: 'lottery, probability, mathematics, statistics',
        tags: ['mathematics', 'probability', 'education'],
      };

      const result = CreateArticleRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate minimal required data', () => {
      const minimalData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'This is the article content.',
      };

      const result = CreateArticleRequestSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('draft'); // Default value
      }
    });

    it('should reject invalid slug format', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'Invalid Slug With Spaces!',
        content: 'Content here...',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('slug')
        )).toBe(true);
      }
    });

    it('should reject invalid URL for featured image', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        featuredImage: 'not-a-valid-url',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('featuredImage')
        )).toBe(true);
      }
    });

    it('should reject invalid UUID for categoryId', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        categoryId: 'not-a-uuid',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('categoryId')
        )).toBe(true);
      }
    });

    it('should reject too many tags', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        tags: Array(15).fill('tag'), // More than 10 tags
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('tags')
        )).toBe(true);
      }
    });

    it('should reject invalid status', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        status: 'invalid-status',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('status')
        )).toBe(true);
      }
    });

    it('should reject negative reading time', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        readingTime: -5,
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('readingTime')
        )).toBe(true);
      }
    });

    it('should reject too long title', () => {
      const invalidData = {
        title: 'A'.repeat(300), // Exceeds 255 character limit
        slug: 'test-article',
        content: 'Content here...',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('title')
        )).toBe(true);
      }
    });

    it('should reject too long excerpt', () => {
      const invalidData = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        excerpt: 'A'.repeat(1100), // Exceeds 1000 character limit
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('excerpt')
        )).toBe(true);
      }
    });

    it('should reject empty required fields', () => {
      const invalidData = {
        title: '',
        slug: '',
        content: '',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('slug'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('content'))).toBe(true);
      }
    });

    it('should validate all status options', () => {
      const validStatuses = ['draft', 'published', 'archived'];
      
      validStatuses.forEach(status => {
        const data = {
          title: 'Test Article',
          slug: 'test-article',
          content: 'Content here...',
          status,
        };

        const result = CreateArticleRequestSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should handle optional fields correctly', () => {
      const dataWithOptionals = {
        title: 'Test Article',
        slug: 'test-article',
        content: 'Content here...',
        excerpt: 'This is an excerpt',
        featuredImage: 'https://example.com/image.jpg',
        categoryId: '123e4567-e89b-12d3-a456-426614174000',
        readingTime: 3,
        seoTitle: 'SEO Title',
        seoDescription: 'SEO Description',
        seoKeywords: 'keyword1, keyword2',
        tags: ['tag1', 'tag2'],
      };

      const result = CreateArticleRequestSchema.safeParse(dataWithOptionals);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.excerpt).toBe('This is an excerpt');
        expect(result.data.featuredImage).toBe('https://example.com/image.jpg');
        expect(result.data.tags).toEqual(['tag1', 'tag2']);
      }
    });
  });
});
