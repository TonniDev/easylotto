import { NextRequest, NextResponse } from 'next/server';
import { LoginSchema, AuthResponse } from '@lib/definitions/auth';
import { verifyPassword, createSession, generateJWT } from '@lib/utils/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validation = LoginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed',
          errors: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: 'Account is deactivated',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password',
        },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = await createSession(user.id);

    // Generate JWT
    const token = generateJWT({
      userId: user.id,
      email: user.email,
      sessionId: sessionToken,
    });

    const response: AuthResponse = {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        is_active: user.is_active,
        created: user.created,
        modified: user.modified,
      },
      token,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during login',
      },
      { status: 500 }
    );
  }
}
