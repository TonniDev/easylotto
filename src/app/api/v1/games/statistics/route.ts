import {prisma} from '@lib/prisma';
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const occurrences_gte = searchParams.get('occurrences_gte') || 20;
  const occurrences_lte = searchParams.get('occurrences_lte') || undefined;
  const includeGames = searchParams.get('includeGames') || false;
  const key = searchParams.get('key') || undefined;

  const result = await prisma.statistics.findMany({
    select: {
      statKey: true,
      value: true,
      games: includeGames ? true : undefined,
    },
    where: {
      statKey: { contains: key},
      value: {
        gte: Number(occurrences_gte),
        lte: occurrences_lte ? Number(occurrences_lte) : undefined,
      },
    },
    orderBy: {
      value: 'desc',
    },
  });

  return NextResponse.json(result);
}

export async function POST(request: Request) {

  const body: {list: (string | number)[]} = await request.json();

  if (!body.list) {
    return NextResponse.json({
      error: 'Missing list',
      status: 400,
    });
  }

  const differences = body.list.map((num, index, arr) => index === 0 ? 0 : Number(num) - Number(arr[index - 1])).slice(1);
  const sortedDifferences = [...differences].sort((a, b) => a - b);
  const average = Math.round(differences.reduce((acc, curr) => acc + curr, 0) / differences.length);

  return NextResponse.json({
    average,
    differences,
    sortedDifferences
  });
}
