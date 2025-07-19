import {prisma} from "@lib/prisma";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || undefined;
  const name = searchParams.get('name') || undefined;

  // Return empty list if both email and name are undefined or empty
  if ((!email || email === '') && (!name || name === '')) {
    return NextResponse.json([]);
  }

  const result = await prisma.saved_games.findMany({
    where: {
      AND: [
        ...(email ? [{ email: { contains: email } }] : []),
        ...(name ? [{ name: { contains: name } }] : []),
      ],
    },
    orderBy: {
      created: 'asc'
    },
  });

  return NextResponse.json(result);
}
