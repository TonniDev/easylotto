import { NextRequest, NextResponse } from 'next/server';
import { RegisterSchema, AuthResponse } from '@lib/definitions/auth';
import { hashPassword, createSession, generateJWT } from '@lib/utils/auth';
import { prisma } from '@lib/prisma';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate input
    const validation = RegisterSchema.safeParse(body);
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

    const { email, password, first_name } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already exists with this email',
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.users.create({
      data: {
        email,
        password_hash: passwordHash,
        first_name,
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
      message: 'User registered successfully',
      user,
      token,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during registration',
      },
      { status: 500 }
    );
  }
}
