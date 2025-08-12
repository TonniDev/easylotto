import { NextRequest, NextResponse } from 'next/server';
import { 
  MultiGameAnalysisRequestSchema, 
  MultiGameAnalysisResponse,
  LOTOFACIL_CONSTANTS 
} from '@lib/definitions/multiGameScenario';
import { calculateMultiGameScenario } from '@lib/utils/probability/multiGameCalculations';

/**
 * POST /api/v1/education/multi-game-analysis
 * 
 * Calculate multi-game lottery scenario analysis for educational purposes.
 * This endpoint is public as it serves educational content about lottery risks.
 */
export async function POST(request: NextRequest): Promise<NextResponse<MultiGameAnalysisResponse>> {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = MultiGameAnalysisRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request data: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    const { gamesPerDraw, years, annualInterestRate } = validationResult.data;
    
    // Validate reasonable limits to prevent abuse
    if (gamesPerDraw > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Games per draw cannot exceed 100 for performance reasons',
        },
        { status: 400 }
      );
    }
    
    if (years > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Years cannot exceed 100 for performance reasons',
        },
        { status: 400 }
      );
    }
    
    // Create scenario object
    const scenario = {
      gamesPerDraw,
      years,
      annualInterestRate,
      gamePrice: LOTOFACIL_CONSTANTS.BASE_GAME_PRICE,
      drawsPerWeek: LOTOFACIL_CONSTANTS.DRAWS_PER_WEEK,
      weeksPerYear: LOTOFACIL_CONSTANTS.WEEKS_PER_YEAR,
      basePrize: LOTOFACIL_CONSTANTS.BASE_PRIZE,
    };
    
    // Calculate the multi-game scenario
    const result = calculateMultiGameScenario(scenario);
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: {
          result,
          calculatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in multi-game analysis API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while calculating scenario',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/education/multi-game-analysis
 * 
 * Get information about the multi-game analysis endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      endpoint: '/api/v1/education/multi-game-analysis',
      method: 'POST',
      description: 'Calculate multi-game lottery scenario analysis for educational purposes',
      parameters: {
        gamesPerDraw: {
          type: 'number',
          description: 'Number of games to play per draw (1-100)',
          required: true,
        },
        years: {
          type: 'number', 
          description: 'Number of years to play (1-100)',
          required: true,
        },
        annualInterestRate: {
          type: 'number',
          description: 'Annual interest rate for investment alternative (0.01-0.20)',
          required: false,
          default: 0.08,
        },
      },
      constants: {
        gamePrice: LOTOFACIL_CONSTANTS.BASE_GAME_PRICE,
        drawsPerWeek: LOTOFACIL_CONSTANTS.DRAWS_PER_WEEK,
        winningOdds: `1 in ${LOTOFACIL_CONSTANTS.WINNING_ODDS.toLocaleString()}`,
        basePrize: LOTOFACIL_CONSTANTS.BASE_PRIZE,
      },
      examples: {
        conservative: {
          gamesPerDraw: 5,
          years: 10,
          annualInterestRate: 0.08,
        },
        aggressive: {
          gamesPerDraw: 20,
          years: 20,
          annualInterestRate: 0.08,
        },
      },
    },
    { status: 200 }
  );
}
