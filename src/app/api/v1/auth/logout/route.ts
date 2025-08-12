import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, verifyJWT, deleteSession } from '@lib/utils/auth';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided',
        },
        { status: 400 }
      );
    }

    // Verify JWT token
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid token',
        },
        { status: 401 }
      );
    }

    // Delete session
    await deleteSession(payload.sessionId);

    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during logout',
      },
      { status: 500 }
    );
  }
}
