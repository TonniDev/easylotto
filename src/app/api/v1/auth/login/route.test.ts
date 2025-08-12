import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@lib/prisma';

// Mock dependencies
vi.mock('@lib/prisma', () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@lib/utils/auth', () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  generateJWT: vi.fn(),
}));

const { verifyPassword, createSession, generateJWT } = await import('@lib/utils/auth');

describe('/api/v1/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3030/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  it('should login user successfully', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      first_name: 'Test',
      is_active: true,
      created: new Date(),
      modified: new Date(),
    };

    (prisma.users.findUnique as any).mockResolvedValue(mockUser);
    (verifyPassword as any).mockResolvedValue(true);
    (createSession as any).mockResolvedValue('session-token-123');
    (generateJWT as any).mockReturnValue('jwt-token-123');

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Login successful');
    expect(responseData.user.id).toBe('user-123');
    expect(responseData.user.email).toBe('test@example.com');
    expect(responseData.token).toBe('jwt-token-123');

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(verifyPassword).toHaveBeenCalledWith('password123', 'hashed-password');
    expect(createSession).toHaveBeenCalledWith('user-123');
  });

  it('should return error for invalid email', async () => {
    const requestBody = {
      email: 'invalid-email',
      password: 'password123',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation failed');
  });

  it('should return error for missing password', async () => {
    const requestBody = {
      email: 'test@example.com',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation failed');
  });

  it('should return error for non-existent user', async () => {
    const requestBody = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    (prisma.users.findUnique as any).mockResolvedValue(null);

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Invalid email or password');
  });

  it('should return error for inactive user', async () => {
    const requestBody = {
      email: 'inactive@example.com',
      password: 'password123',
    };

    const inactiveUser = {
      id: 'user-123',
      email: 'inactive@example.com',
      password_hash: 'hashed-password',
      first_name: 'Test',
      is_active: false, // Inactive user
      created: new Date(),
      modified: new Date(),
    };

    (prisma.users.findUnique as any).mockResolvedValue(inactiveUser);

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Account is deactivated');
  });

  it('should return error for wrong password', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed-password',
      first_name: 'Test',
      is_active: true,
      created: new Date(),
      modified: new Date(),
    };

    (prisma.users.findUnique as any).mockResolvedValue(mockUser);
    (verifyPassword as any).mockResolvedValue(false); // Wrong password

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Invalid email or password');
  });

  it('should handle database errors', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    (prisma.users.findUnique as any).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Internal server error during login');
  });
});
