import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import createLogger from "@lib/utils/logger";

const logger = createLogger({filename: 'api_v1.log'});

export async function GET() {
  try {
    // Step 1: Sum the total winners (ganhadores) per state
    const results = await prisma.winners.groupBy({
      by: ['uf'],
      _sum: {
        ganhadores: true,
      },
    });
    
    const totalGames = await prisma.loterias.findFirst({
      orderBy: {numero: 'desc'},
      select: {numero: true},
    });

    // Step 2: Calculate the total number of winners across all states
    const totalWinners = results.reduce((sum, state) => sum + (state._sum.ganhadores || 0), 0);

    // Step 3: Calculate the percentage of winners for each state
    const response = results.map((state) => ({
      state: state.uf,
      totalWinners: state._sum.ganhadores || 0,
      percentage: ((state._sum.ganhadores || 0) / totalWinners) * 100,
    }));

    // Step 4: Sort by percentage descending
    response.sort((a, b) => b.percentage - a.percentage);

    // Step 5: Return the JSON response
    return NextResponse.json({
      totalWinners,
      totalGames: totalGames?.numero || null,
      data: response,
    });
  } catch (error) {
    logger.error('[ERROR]-[/v1/winners/by-state]:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}
