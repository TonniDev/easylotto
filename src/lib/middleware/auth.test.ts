import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, requireAuth, optionalAuth } from './auth';

// Mock auth utilities
vi.mock('@lib/utils/auth', () => ({
  extractTokenFromHeader: vi.fn(),
  verifyJWT: vi.fn(),
  validateSession: vi.fn(),
}));

const { extractTokenFromHeader, verifyJWT, validateSession } = await import('@lib/utils/auth');

describe('Authentication Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockRequest = (authHeader?: string) => {
    const headers = new Headers();
    if (authHeader) {
      headers.set('authorization', authHeader);
    }
    
    return new NextRequest('http://localhost:3030/api/test', {
      method: 'GET',
      headers,
    });
  };

  describe('authenticateRequest', () => {
    it('should authenticate valid request successfully', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
        created: new Date(),
        modified: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        session_token: 'session-token-123',
        expires_at: new Date(),
        created: new Date(),
      };

      const mockSessionInfo = {
        user: mockUser,
        session: mockSession,
      };

      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyJWT as any).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'session-token-123',
      });
      (validateSession as any).mockResolvedValue(mockSessionInfo);

      const request = createMockRequest('Bearer valid-token');
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.response).toBeUndefined();
    });

    it('should return error for missing token', async () => {
      (extractTokenFromHeader as any).mockReturnValue(null);

      const request = createMockRequest();
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.error).toBe('Authentication required');
      expect(responseData.message).toBe('No token provided');
    });

    it('should return error for invalid token', async () => {
      (extractTokenFromHeader as any).mockReturnValue('invalid-token');
      (verifyJWT as any).mockReturnValue(null);

      const request = createMockRequest('Bearer invalid-token');
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.error).toBe('Invalid token');
    });

    it('should return error for invalid session', async () => {
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyJWT as any).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'invalid-session',
      });
      (validateSession as any).mockResolvedValue(null);

      const request = createMockRequest('Bearer valid-token');
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.error).toBe('Invalid session');
    });

    it('should handle authentication errors', async () => {
      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyJWT as any).mockImplementation(() => {
        throw new Error('JWT verification error');
      });

      const request = createMockRequest('Bearer valid-token');
      const result = await authenticateRequest(request);

      expect(result.authenticated).toBe(false);
      expect(result.response).toBeDefined();
      
      const responseData = await result.response!.json();
      expect(responseData.error).toBe('Authentication failed');
    });
  });

  describe('requireAuth', () => {
    it('should call handler for authenticated request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
        created: new Date(),
        modified: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        session_token: 'session-token-123',
        expires_at: new Date(),
        created: new Date(),
      };

      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyJWT as any).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'session-token-123',
      });
      (validateSession as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const protectedHandler = requireAuth(mockHandler);
      const request = createMockRequest('Bearer valid-token');
      const response = await protectedHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          session: mockSession,
        })
      );

      const responseData = await response.json();
      expect(responseData.success).toBe(true);
    });

    it('should return auth error for unauthenticated request', async () => {
      (extractTokenFromHeader as any).mockReturnValue(null);

      const mockHandler = vi.fn();
      const protectedHandler = requireAuth(mockHandler);
      const request = createMockRequest();
      const response = await protectedHandler(request);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      
      const responseData = await response.json();
      expect(responseData.error).toBe('Authentication required');
    });
  });

  describe('optionalAuth', () => {
    it('should call handler with user for authenticated request', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test',
        is_active: true,
        created: new Date(),
        modified: new Date(),
      };

      const mockSession = {
        id: 'session-123',
        user_id: 'user-123',
        session_token: 'session-token-123',
        expires_at: new Date(),
        created: new Date(),
      };

      (extractTokenFromHeader as any).mockReturnValue('valid-token');
      (verifyJWT as any).mockReturnValue({
        userId: 'user-123',
        email: 'test@example.com',
        sessionId: 'session-token-123',
      });
      (validateSession as any).mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const optionalHandler = optionalAuth(mockHandler);
      const request = createMockRequest('Bearer valid-token');
      await optionalHandler(request);

      expect(mockHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          user: mockUser,
          session: mockSession,
        })
      );
    });

    it('should call handler without user for unauthenticated request', async () => {
      (extractTokenFromHeader as any).mockReturnValue(null);

      const mockHandler = vi.fn().mockResolvedValue(
        NextResponse.json({ success: true })
      );

      const optionalHandler = optionalAuth(mockHandler);
      const request = createMockRequest();
      await optionalHandler(request);

      expect(mockHandler).toHaveBeenCalledTimes(1);
      const calledRequest = mockHandler.mock.calls[0][0];
      expect(calledRequest.user).toBeUndefined();
      expect(calledRequest.session).toBeUndefined();
    });
  });
});
