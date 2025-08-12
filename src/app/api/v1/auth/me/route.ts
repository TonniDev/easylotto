import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@lib/middleware/auth';

export const GET = requireAuth(async (request) => {
  return NextResponse.json(
    {
      success: true,
      user: request.user,
      session: {
        id: request.session?.id,
        expires_at: request.session?.expires_at,
      },
    },
    { status: 200 }
  );
});
