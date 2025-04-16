import {prisma} from '@lib/prisma';
import {Prisma} from '@prisma/client';
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);

  // Parse and validate search parameters
  const occurrences_gte = searchParams.get('occurrences_gte') !== null ? parseInt(searchParams.get('occurrences_gte') as string, 10) : 20;
  const occurrences_lte = searchParams.get('occurrences_lte') !== null ? parseInt(searchParams.get('occurrences_lte') as string, 10) : null;
  const includeGames = searchParams.get('includeGames') === 'true';
  const key = searchParams.get('key') || 'fr';
  const gameValue_gt = searchParams.get('gameValue_gt') !== null ? parseInt(searchParams.get('gameValue_gt') as string, 10) : 3000;

  try {
    const rawQuery = Prisma.sql`
        SELECT "statKey",
               "value",
               ${includeGames ? Prisma.sql`"games",` : Prisma.sql``} (SELECT MAX(CAST(g AS INTEGER))
         FROM unnest("games") AS g
         WHERE CAST(g AS INTEGER) >= ${gameValue_gt}) AS "maxGameValue"
        FROM "statistics"
        WHERE "statKey" LIKE ${key + '%'}
          AND "value" >= ${occurrences_gte}
            ${occurrences_lte ? Prisma.sql`AND "value" <= ${occurrences_lte}` : Prisma.sql``}
          AND EXISTS (SELECT 1
                      FROM unnest("games") AS game_value
                      WHERE CAST(game_value AS INTEGER) >= ${gameValue_gt})
        ORDER BY "value" DESC
    `;

    const results = await prisma.$queryRaw(rawQuery);
    const lastLotteryNumber = await prisma.loterias.findFirst({orderBy: {numero: 'desc'}, select: {numero: true}});

    const response = {
      lastLotteryNumber: lastLotteryNumber?.numero || 0,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[ERROR]-[/v1/statistics]:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      error: 'Failed to retrieve data.',
    });
  }
}

export async function POST(request: Request) {
  const body: { list: (string | number)[] } = await request.json();

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
