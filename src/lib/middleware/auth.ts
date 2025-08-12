import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyJWT, validateSession } from '@lib/utils/auth';
import { SessionInfo } from '@lib/definitions/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: SessionInfo['user'];
  session?: SessionInfo['session'];
}

export async function authenticateRequest(request: NextRequest): Promise<{
  authenticated: boolean;
  user?: SessionInfo['user'];
  session?: SessionInfo['session'];
  response?: NextResponse;
}> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Authentication required', message: 'No token provided' },
          { status: 401 }
        ),
      };
    }

    // Verify JWT token
    const payload = verifyJWT(token);
    if (!payload) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Invalid token', message: 'Token verification failed' },
          { status: 401 }
        ),
      };
    }

    // Validate session
    const sessionInfo = await validateSession(payload.sessionId);
    if (!sessionInfo) {
      return {
        authenticated: false,
        response: NextResponse.json(
          { error: 'Invalid session', message: 'Session not found or expired' },
          { status: 401 }
        ),
      };
    }

    return {
      authenticated: true,
      user: sessionInfo.user,
      session: sessionInfo.session,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      authenticated: false,
      response: NextResponse.json(
        { error: 'Authentication failed', message: 'Internal authentication error' },
        { status: 500 }
      ),
    };
  }
}

export function requireAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    if (!authResult.authenticated) {
      return authResult.response!;
    }

    // Add user and session to request
    const authenticatedRequest = request as AuthenticatedRequest;
    authenticatedRequest.user = authResult.user;
    authenticatedRequest.session = authResult.session;

    return handler(authenticatedRequest);
  };
}

export function optionalAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authenticateRequest(request);

    // Add user and session to request if authenticated
    const authenticatedRequest = request as AuthenticatedRequest;
    if (authResult.authenticated) {
      authenticatedRequest.user = authResult.user;
      authenticatedRequest.session = authResult.session;
    }

    return handler(authenticatedRequest);
  };
}
