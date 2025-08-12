import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from './route';
import { prisma } from '@lib/prisma';

// Mock dependencies
vi.mock('@lib/prisma', () => ({
  prisma: {
    saved_games: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@lib/middleware/auth', () => ({
  requireAuth: (handler: any) => {
    return async (request: any) => {
      // Mock authenticated user
      request.user = {
        id: 'user-123',
        email: 'test@example.com',
        first_name: 'Test User',
        is_active: true,
        created: new Date(),
        modified: new Date(),
      };
      return handler(request);
    };
  },
}));

describe('/api/v1/games/save (Protected)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockRequest = (body: any) => {
    const request = new NextRequest('http://localhost:3030/api/v1/games/save', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer valid-token',
      },
    });

    // Mock the authenticated user (this would normally be set by the auth middleware)
    (request as any).user = {
      id: 'user-123',
      email: 'test@example.com',
      first_name: 'Test User',
      is_active: true,
      created: new Date(),
      modified: new Date(),
    };

    return request;
  };

  it('should save games successfully for authenticated user', async () => {
    const requestBody = {
      numbers: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      ],
      group: 'Test Group',
    };

    const mockSavedGame = {
      id: 'game-123',
      email: 'test@example.com',
      name: 'Test User',
      listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
      group: 'Test Group',
    };

    (prisma.saved_games.create as any).mockResolvedValue(mockSavedGame);

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.success).toBe(true);
    expect(responseData.message).toBe('Successfully saved 2 game(s)');
    expect(responseData.savedGames).toHaveLength(2);

    expect(prisma.saved_games.create).toHaveBeenCalledTimes(2);
    expect(prisma.saved_games.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
        group: 'Test Group',
        user_id: 'user-123',
      },
    });
  });

  it('should save games without group', async () => {
    const requestBody = {
      numbers: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      ],
    };

    const mockSavedGame = {
      id: 'game-123',
      email: 'test@example.com',
      name: 'Test User',
      listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
      group: null,
    };

    (prisma.saved_games.create as any).mockResolvedValue(mockSavedGame);

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(201);
    expect(responseData.success).toBe(true);

    expect(prisma.saved_games.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
        group: undefined,
        user_id: 'user-123',
      },
    });
  });

  it('should return error for missing numbers', async () => {
    const requestBody = {
      group: 'Test Group',
      // missing numbers
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Missing required field: numbers');
  });

  it('should return error for empty numbers array', async () => {
    const requestBody = {
      numbers: [],
      group: 'Test Group',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Missing required field: numbers');
  });

  it('should return error for invalid numbers format', async () => {
    const requestBody = {
      numbers: 'not-an-array',
      group: 'Test Group',
    };

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Missing required field: numbers');
  });

  it('should handle database errors', async () => {
    const requestBody = {
      numbers: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      ],
      group: 'Test Group',
    };

    (prisma.saved_games.create as any).mockRejectedValue(new Error('Database error'));

    const request = createMockRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.message).toBe('Failed to save games');
  });

  it('should use authenticated user data instead of request body', async () => {
    const requestBody = {
      numbers: [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      ],
      // These should be ignored in favor of authenticated user data
      email: 'hacker@example.com',
      name: 'Hacker Name',
    };

    const mockSavedGame = {
      id: 'game-123',
      email: 'test@example.com',
      name: 'Test User',
      listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
      group: null,
    };

    (prisma.saved_games.create as any).mockResolvedValue(mockSavedGame);

    const request = createMockRequest(requestBody);
    const response = await POST(request);

    expect(prisma.saved_games.create).toHaveBeenCalledWith({
      data: {
        email: 'test@example.com', // From authenticated user
        name: 'Test User', // From authenticated user
        listaDezenas: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15'],
        group: undefined,
        user_id: 'user-123',
      },
    });
  });
});
