import { describe, it, expect } from 'vitest';
import {
  CreateArticleRequestSchema,
  UpdateArticleRequestSchema,
  CreateCategoryRequestSchema,
  generateSlug,
  estimateReadingTime,
  extractExcerpt,
  formatPublishDate,
  getReadingTimeText,
} from './contentManagement';

describe('contentManagement', () => {
  describe('CreateArticleRequestSchema', () => {
    it('should validate valid article data', () => {
      const validData = {
        title: 'Understanding Lottery Mathematics',
        slug: 'understanding-lottery-mathematics',
        excerpt: 'A comprehensive guide to lottery probability.',
        content: 'This is the full content of the article...',
        status: 'draft' as const,
        tags: ['mathematics', 'probability', 'education'],
      };

      const result = CreateArticleRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
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
          issue.path.includes('slug') && issue.message.includes('lowercase')
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
    });

    it('should require title and content', () => {
      const invalidData = {
        slug: 'test-article',
      };

      const result = CreateArticleRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => issue.path.includes('title'))).toBe(true);
        expect(result.error.issues.some(issue => issue.path.includes('content'))).toBe(true);
      }
    });
  });

  describe('UpdateArticleRequestSchema', () => {
    it('should validate partial update data', () => {
      const validData = {
        title: 'Updated Title',
        status: 'published' as const,
      };

      const result = UpdateArticleRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should allow empty update', () => {
      const result = UpdateArticleRequestSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('CreateCategoryRequestSchema', () => {
    it('should validate valid category data', () => {
      const validData = {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Articles about mathematical concepts',
        color: '#FF5733',
        icon: '🔢',
        sortOrder: 1,
      };

      const result = CreateCategoryRequestSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should reject invalid hex color', () => {
      const invalidData = {
        name: 'Test Category',
        slug: 'test-category',
        color: 'not-a-hex-color',
      };

      const result = CreateCategoryRequestSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(issue => 
          issue.path.includes('color') && issue.message.includes('hex')
        )).toBe(true);
      }
    });
  });

  describe('generateSlug', () => {
    it('should generate valid slug from title', () => {
      expect(generateSlug('Understanding Lottery Mathematics')).toBe('understanding-lottery-mathematics');
      expect(generateSlug('How to Calculate Odds?')).toBe('how-to-calculate-odds');
      expect(generateSlug('  Multiple   Spaces  ')).toBe('multiple-spaces');
    });

    it('should handle special characters and accents', () => {
      expect(generateSlug('Matemática da Loteria')).toBe('matematica-da-loteria');
      expect(generateSlug('Probabilidade & Estatística')).toBe('probabilidade-estatistica');
      expect(generateSlug('100% Guaranteed!')).toBe('100-guaranteed');
    });

    it('should handle edge cases', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
      expect(generateSlug('---')).toBe('');
      expect(generateSlug('a-b-c')).toBe('a-b-c');
    });
  });

  describe('estimateReadingTime', () => {
    it('should calculate reading time correctly', () => {
      const shortText = 'This is a short text with about twenty words to test the reading time calculation function.';
      expect(estimateReadingTime(shortText)).toBe(1); // Should round up to 1 minute

      const longText = Array(400).fill('word').join(' '); // 400 words
      expect(estimateReadingTime(longText)).toBe(2); // 400 words / 200 wpm = 2 minutes
    });

    it('should handle empty content', () => {
      expect(estimateReadingTime('')).toBe(1); // Should be at least 1 minute
      expect(estimateReadingTime('   ')).toBe(1);
    });
  });

  describe('extractExcerpt', () => {
    it('should extract excerpt from content', () => {
      const content = 'This is the first sentence. This is the second sentence. This is a longer third sentence that continues.';
      const excerpt = extractExcerpt(content, 50);
      
      expect(excerpt.length).toBeLessThanOrEqual(50);
      expect(excerpt).toContain('This is the first sentence.');
    });

    it('should handle HTML content', () => {
      const htmlContent = '<p>This is a <strong>paragraph</strong> with HTML tags.</p><p>Second paragraph.</p>';
      const excerpt = extractExcerpt(htmlContent, 50);
      
      expect(excerpt).not.toContain('<p>');
      expect(excerpt).not.toContain('<strong>');
      expect(excerpt).toContain('This is a paragraph with HTML tags.');
    });

    it('should add ellipsis when truncated', () => {
      const longContent = 'This is a very long content that will definitely exceed the maximum length limit and should be truncated with ellipsis at the end.';
      const excerpt = extractExcerpt(longContent, 50);
      
      expect(excerpt.length).toBeLessThanOrEqual(53); // 50 + '...'
      expect(excerpt).toMatch(/\.\.\.$/);
    });

    it('should return full content if shorter than limit', () => {
      const shortContent = 'Short content.';
      const excerpt = extractExcerpt(shortContent, 100);
      
      expect(excerpt).toBe(shortContent);
    });
  });

  describe('formatPublishDate', () => {
    it('should format date in Portuguese', () => {
      const date = new Date('2024-01-15T12:00:00Z'); // Use specific time to avoid timezone issues
      const formatted = formatPublishDate(date);

      expect(formatted).toMatch(/janeiro de 2024/); // Just check month and year to avoid timezone issues
      expect(formatted).toContain('de');
    });
  });

  describe('getReadingTimeText', () => {
    it('should format reading time correctly', () => {
      expect(getReadingTimeText(1)).toBe('1 minuto de leitura');
      expect(getReadingTimeText(5)).toBe('5 minutos de leitura');
      expect(getReadingTimeText(0)).toBe('1 minuto de leitura'); // Should default to 1
    });
  });
});
