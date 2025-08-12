import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  generateJWT,
  verifyJWT,
  createSession,
  validateSession,
  deleteSession,
  extractTokenFromHeader,
  isValidEmail,
  isValidPassword,
} from './auth';
import { prisma } from '@lib/prisma';

// Mock Prisma
vi.mock('@lib/prisma', () => ({
  prisma: {
    user_sessions: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

describe('Authentication Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Password utilities', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50); // bcrypt hashes are typically 60 chars
    });

    it('should verify password correctly', async () => {
      const password = 'testpassword123';
      const hashedPassword = await hashPassword(password);

      const isValid = await verifyPassword(password, hashedPassword);
      const isInvalid = await verifyPassword('wrongpassword', hashedPassword);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });
  });

  describe('JWT utilities', () => {
    it('should generate and verify JWT correctly', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'session-123',
      };

      const token = generateJWT(payload);
      const decoded = verifyJWT(token);

      expect(token).toBeDefined();
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
      expect(decoded?.sessionId).toBe(payload.sessionId);
    });

    it('should return null for invalid JWT', () => {
      const invalidToken = 'invalid.jwt.token';
      const decoded = verifyJWT(invalidToken);

      expect(decoded).toBeNull();
    });
  });

  describe('Session utilities', () => {
    it('should create session successfully', async () => {
      const userId = 'user-123';
      const mockSession = {
        id: 'session-id',
        user_id: userId,
        session_token: 'session-token-123',
        expires_at: new Date(),
        created: new Date(),
      };

      (prisma.user_sessions.create as any).mockResolvedValue(mockSession);

      const sessionToken = await createSession(userId);

      expect(sessionToken).toBeDefined();
      expect(typeof sessionToken).toBe('string');
      expect(prisma.user_sessions.create).toHaveBeenCalledWith({
        data: {
          user_id: userId,
          session_token: expect.any(String),
          expires_at: expect.any(Date),
        },
      });
    });

    it('should validate session successfully', async () => {
      const sessionToken = 'valid-session-token';
      const mockSessionWithUser = {
        id: 'session-id',
        user_id: 'user-123',
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        created: new Date(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          first_name: 'Test',
          is_active: true,
          created: new Date(),
          modified: new Date(),
        },
      };

      (prisma.user_sessions.findUnique as any).mockResolvedValue(mockSessionWithUser);

      const sessionInfo = await validateSession(sessionToken);

      expect(sessionInfo).toBeDefined();
      expect(sessionInfo?.user.id).toBe('user-123');
      expect(sessionInfo?.user.email).toBe('test@example.com');
      expect(sessionInfo?.session.session_token).toBe(sessionToken);
    });

    it('should return null for expired session', async () => {
      const sessionToken = 'expired-session-token';
      const mockExpiredSession = {
        id: 'session-id',
        user_id: 'user-123',
        session_token: sessionToken,
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        created: new Date(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          first_name: 'Test',
          is_active: true,
          created: new Date(),
          modified: new Date(),
        },
      };

      (prisma.user_sessions.findUnique as any).mockResolvedValue(mockExpiredSession);
      (prisma.user_sessions.delete as any).mockResolvedValue({});

      const sessionInfo = await validateSession(sessionToken);

      expect(sessionInfo).toBeNull();
      expect(prisma.user_sessions.delete).toHaveBeenCalledWith({
        where: { session_token: sessionToken },
      });
    });

    it('should return null for inactive user', async () => {
      const sessionToken = 'inactive-user-session';
      const mockSessionWithInactiveUser = {
        id: 'session-id',
        user_id: 'user-123',
        session_token: sessionToken,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        created: new Date(),
        user: {
          id: 'user-123',
          email: 'test@example.com',
          first_name: 'Test',
          is_active: false, // Inactive user
          created: new Date(),
          modified: new Date(),
        },
      };

      (prisma.user_sessions.findUnique as any).mockResolvedValue(mockSessionWithInactiveUser);

      const sessionInfo = await validateSession(sessionToken);

      expect(sessionInfo).toBeNull();
    });

    it('should delete session successfully', async () => {
      const sessionToken = 'session-to-delete';
      (prisma.user_sessions.delete as any).mockResolvedValue({});

      await deleteSession(sessionToken);

      expect(prisma.user_sessions.delete).toHaveBeenCalledWith({
        where: { session_token: sessionToken },
      });
    });
  });

  describe('Helper functions', () => {
    it('should extract token from Authorization header', () => {
      const token = 'jwt-token-123';
      const authHeader = `Bearer ${token}`;

      const extractedToken = extractTokenFromHeader(authHeader);

      expect(extractedToken).toBe(token);
    });

    it('should return null for invalid Authorization header', () => {
      expect(extractTokenFromHeader(null)).toBeNull();
      expect(extractTokenFromHeader('')).toBeNull();
      expect(extractTokenFromHeader('Invalid header')).toBeNull();
      expect(extractTokenFromHeader('Basic token123')).toBeNull();
    });

    it('should validate email correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('should validate password correctly', () => {
      expect(isValidPassword('password123')).toBe(true);
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('')).toBe(false);
    });
  });
});
