import {prisma} from '@lib/prisma';
import { Prisma } from '@prisma/client';
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  try {
    const rawQuery = Prisma.sql`
        SELECT json_agg(lista_dezenas) as list FROM loterias 
    `;

    const results = await prisma.$queryRaw<{list: number[][]}[]>(rawQuery);

    return NextResponse.json(results[0]?.list || []);
  } catch (error) {
    console.error('[ERROR]-[/v1/lottery/lotofacil]:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json([]);
  }
}
