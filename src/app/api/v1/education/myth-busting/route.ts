import { NextRequest, NextResponse } from 'next/server';
import { 
  MythBustingRequestSchema, 
  MythBustingResponse,
  getAllMisconceptions,
  getMisconception,
  getMostDangerousMisconceptions
} from '@lib/definitions/commonMisconceptions';
import { calculateMythBustingScenario } from '@lib/utils/education/misconceptionCalculations';

/**
 * POST /api/v1/education/myth-busting
 * 
 * Calculate myth-busting scenario for a specific lottery misconception.
 * This endpoint is public as it serves educational content about lottery risks.
 */
export async function POST(request: NextRequest): Promise<NextResponse<MythBustingResponse>> {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = MythBustingRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid request data: ${validationResult.error.issues.map(i => i.message).join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    const request_data = validationResult.data;
    
    // Get the misconception
    const misconception = getMisconception(request_data.misconceptionId);
    if (!misconception) {
      return NextResponse.json(
        {
          success: false,
          error: `Misconception with ID '${request_data.misconceptionId}' not found`,
        },
        { status: 404 }
      );
    }
    
    // Calculate the myth-busting scenario
    const scenario = calculateMythBustingScenario(request_data);
    
    if (!scenario) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to calculate myth-busting scenario',
        },
        { status: 500 }
      );
    }
    
    // Return successful response
    return NextResponse.json(
      {
        success: true,
        data: {
          scenario,
          misconception,
          calculatedAt: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error in myth-busting API:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error occurred while calculating myth-busting scenario',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/education/myth-busting
 * 
 * Get information about available misconceptions and the myth-busting endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const misconceptionId = searchParams.get('id');
  
  // If specific misconception requested
  if (misconceptionId) {
    const misconception = getMisconception(misconceptionId);
    if (!misconception) {
      return NextResponse.json(
        {
          success: false,
          error: `Misconception with ID '${misconceptionId}' not found`,
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        data: {
          misconception,
          endpoint: '/api/v1/education/myth-busting',
          method: 'POST',
          description: 'Calculate myth-busting scenario for this specific misconception',
        },
      },
      { status: 200 }
    );
  }
  
  // Return general endpoint information and available misconceptions
  const allMisconceptions = getAllMisconceptions();
  const dangerousMisconceptions = getMostDangerousMisconceptions();
  
  return NextResponse.json(
    {
      endpoint: '/api/v1/education/myth-busting',
      description: 'Calculate myth-busting scenarios for common lottery misconceptions',
      methods: {
        GET: {
          description: 'Get available misconceptions and endpoint information',
          parameters: {
            id: {
              type: 'string',
              description: 'Optional misconception ID to get specific information',
              required: false,
            },
          },
        },
        POST: {
          description: 'Calculate myth-busting scenario for a specific misconception',
          parameters: {
            misconceptionId: {
              type: 'string',
              description: 'ID of the misconception to analyze',
              required: true,
            },
            gamesPerDraw: {
              type: 'number',
              description: 'Number of games to play per draw (1-100)',
              required: false,
            },
            years: {
              type: 'number',
              description: 'Number of years to play (1-100)',
              required: false,
            },
            totalInvestment: {
              type: 'number',
              description: 'Total investment amount',
              required: false,
            },
            strategy: {
              type: 'string',
              description: 'Strategy description',
              required: false,
            },
            annualInterestRate: {
              type: 'number',
              description: 'Annual interest rate for investment alternative (0.01-0.20)',
              required: false,
              default: 0.08,
            },
          },
        },
      },
      availableMisconceptions: {
        total: allMisconceptions.length,
        mostDangerous: dangerousMisconceptions.map(m => ({
          id: m.id,
          title: m.title,
          dangerLevel: m.dangerLevel,
          commonness: m.commonness,
          belief: m.belief,
        })),
        all: allMisconceptions.map(m => ({
          id: m.id,
          title: m.title,
          type: m.type,
          dangerLevel: m.dangerLevel,
          commonness: m.commonness,
          financialImpact: m.financialImpact,
        })),
      },
      examples: {
        guarantee5Daily: {
          misconceptionId: 'guarantee-5-daily',
          description: 'Analyze the belief that playing 5 games daily guarantees wins',
        },
        guarantee20Daily: {
          misconceptionId: 'guarantee-20-daily',
          description: 'Analyze the belief that playing 20 games daily guarantees quick wins',
        },
        proportionalOdds: {
          misconceptionId: 'proportional-odds',
          gamesPerDraw: 10,
          years: 20,
          description: 'Analyze the belief that 10 games = 10x better odds',
        },
        replacementStrategy: {
          misconceptionId: 'replacement-strategy',
          gamesPerDraw: 10,
          years: 25,
          description: 'Analyze the belief that replacing winning sets improves odds',
        },
      },
    },
    { status: 200 }
  );
}
