import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@lib/prisma';

// Mock dependencies
vi.mock('@lib/prisma', () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@lib/utils/auth', () => ({
  hashPassword: vi.fn(),
  createSession: vi.fn(),
  generateJWT: vi.fn(),
}));

const { hashPassword, createSession, generateJWT } = await import('@lib/utils/auth');

describe('/api/v1/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockRequest = (body: any) => {
    return new NextRequest('http://localhost:3030/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  it('should register user successfully', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
    };

    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      first_name: 'Test',
      is_active: true,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };

    (prisma.users.findUnique as any).mockResolvedValue(null); // User doesn't exist
    (hashPassword as any).mockResolvedValue('hashed-password');
    (prisma.users.create as any).mockResolvedValue(mockUser);
    (createSession as any).mockResolvedValue('session-token-123');
    (generateJWT as any).mockReturnValue('jwt-token-123');

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('User registered successfully');
    expect(responseData.user).toEqual(mockUser);
    expect(responseData.token).toBe('jwt-token-123');

    expect(prisma.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(hashPassword).toHaveBeenCalledWith('password123');
    expect(prisma.users.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        password_hash: 'hashed-password',
        first_name: 'Test',
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        is_active: true,
        created: true,
        modified: true,
      },
    });
  });

  it('should return error for invalid email', async () => {
    const requestBody = {
      email: 'invalid-email',
      password: 'password123',
      first_name: 'Test',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation failed');
    expect(responseData.errors).toBeDefined();
  });

  it('should return error for short password', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'short',
      first_name: 'Test',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation failed');
  });

  it('should return error for missing first_name', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Validation failed');
  });

  it('should return error for existing user', async () => {
    const requestBody = {
      email: 'existing@example.com',
      password: 'password123',
      first_name: 'Test',
    };

    const existingUser = {
      id: 'existing-user-123',
      email: 'existing@example.com',
    };

    (prisma.users.findUnique as any).mockResolvedValue(existingUser);

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(409);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('User already exists with this email');
  });

  it('should handle database errors', async () => {
    const requestBody = {
      email: 'test@example.com',
      password: 'password123',
      first_name: 'Test',
    };

    (prisma.users.findUnique as any).mockResolvedValue(null);
    (hashPassword as any).mockResolvedValue('hashed-password');
    (prisma.users.create as any).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Internal server error during registration');
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost:3030/api/v1/auth/register', {
      method: 'POST',
      body: 'invalid json',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
  });
});
