import createLogger from "@lib/utils/logger";
import { prisma } from '@lib/prisma';
import {NextResponse} from "next/server";

const logger = createLogger({filename: 'api_v1.log'});
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const take = parseInt(searchParams.get('take') || '100', 10);

    const result = await prisma.loterias.findMany({
      take,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        listaDezenas: true,
        numero: true,
      },
      orderBy: {
        numero: 'asc',
      },
    });

    const response = result.map((entry) => entry.listaDezenas);

    return NextResponse.json({
      data: response,
      from: result[0]?.numero || null,
      to: result[result.length - 1]?.numero || null,
      cursor: result.length > 0 ? result[result.length - 1].id : null,
      take,
    });
  } catch (error) {
    logger.error('[ERROR]-[/v1/games]:', error);
    return NextResponse.json({
      error: 'Failed to retrieve data.',
    });
  }
}
