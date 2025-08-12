import {prisma} from "@lib/prisma";
import {NextResponse} from "next/server";
import { requireAuth } from "@lib/middleware/auth";

export const GET = requireAuth(async (request) => {
  const { searchParams } = new URL(request.url);
  const group = searchParams.get('group') || undefined;

  // Get games for the authenticated user
  const result = await prisma.saved_games.findMany({
    where: {
      user_id: request.user!.id,
      ...(group ? { group: { contains: group } } : {}),
    },
    orderBy: {
      created: 'asc'
    },
  });

  return NextResponse.json(result);
});
