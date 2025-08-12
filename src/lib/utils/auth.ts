import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWTPayload, SessionInfo } from '@lib/definitions/auth';
import { prisma } from '@lib/prisma';

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SESSION_EXPIRES_HOURS = parseInt(process.env.SESSION_EXPIRES_HOURS || '168'); // 7 days

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export function generateJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Session utilities
export async function createSession(userId: string): Promise<string> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRES_HOURS);

  await prisma.user_sessions.create({
    data: {
      user_id: userId,
      session_token: sessionToken,
      expires_at: expiresAt,
    },
  });

  return sessionToken;
}

export async function validateSession(sessionToken: string): Promise<SessionInfo | null> {
  try {
    const session = await prisma.user_sessions.findUnique({
      where: { session_token: sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            is_active: true,
            created: true,
            modified: true,
          },
        },
      },
    });

    if (!session || !session.user) {
      return null;
    }

    // Check if session is expired
    if (session.expires_at < new Date()) {
      await deleteSession(sessionToken);
      return null;
    }

    // Check if user is active
    if (!session.user.is_active) {
      return null;
    }

    return {
      user: session.user,
      session: {
        id: session.id,
        user_id: session.user_id,
        session_token: session.session_token,
        expires_at: session.expires_at,
        created: session.created,
      },
    };
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function deleteSession(sessionToken: string): Promise<void> {
  try {
    await prisma.user_sessions.delete({
      where: { session_token: sessionToken },
    });
  } catch (error) {
    // Session might not exist, which is fine
    console.warn('Session deletion warning:', error);
  }
}

export async function cleanupExpiredSessions(): Promise<void> {
  try {
    await prisma.user_sessions.deleteMany({
      where: {
        expires_at: {
          lt: new Date(),
        },
      },
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
  }
}

// Helper functions
function generateSessionToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

// Extract token from Authorization header
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// Validate user input
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
