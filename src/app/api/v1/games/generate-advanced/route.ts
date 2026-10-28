import { NextRequest, NextResponse } from 'next/server';
import { 
  AdvancedGenerationOptionsSchema,
  GenerationResult 
} from '@lib/definitions/advancedGenerator';
import { generateAdvancedNumbers } from '@lib/utils/math/advancedNumberGenerator';
import { fetchLotofacilAllGames } from '@lib/utils/fetchLotofacilAllGames';

/**
 * POST /api/v1/games/generate-advanced
 * 
 * Generate lottery numbers using advanced algorithms and constraints
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerationResult | { error: string; details?: any }>> {
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = AdvancedGenerationOptionsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }
    
    const options = validationResult.data;
    
    // Get historical data if needed for frequency analysis or avoidance
    let historicalData: number[][] | undefined;
    
    if (options.useHistoricalWeights || 
        options.constraints?.frequency || 
        options.constraints?.avoidance?.type === 'recent_draws' ||
        options.constraints?.avoidance?.type === 'never_won') {
      
      try {
        const allGames = await fetchLotofacilAllGames();
        // Convert string arrays to number arrays
        historicalData = allGames.map(game => 
          game.map(numStr => parseInt(numStr, 10))
        );
      } catch (error) {
        console.warn('Failed to fetch historical data, proceeding without it:', error);
      }
    }
    
    // Generate numbers using advanced algorithm
    const result = await generateAdvancedNumbers(options, historicalData);
    
    // Add performance metrics
    const responseWithMetrics = {
      ...result,
      metadata: {
        ...result.metadata,
        timestamp: new Date().toISOString(),
        historicalDataUsed: !!historicalData,
        historicalDataSize: historicalData?.length || 0,
      },
    };
    
    return NextResponse.json(responseWithMetrics, { status: 200 });
    
  } catch (error) {
    console.error('Error generating advanced numbers:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Not enough available numbers')) {
        return NextResponse.json(
          {
            error: 'Constraint conflict',
            details: error.message,
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('timeout') || error.message.includes('attempts')) {
        return NextResponse.json(
          {
            error: 'Generation timeout',
            details: 'Unable to generate numbers satisfying all constraints within time limit',
          },
          { status: 408 }
        );
      }
    }
    
    return NextResponse.json(
      {
        error: 'Internal server error occurred while generating numbers',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/games/generate-advanced
 * 
 * Get information about advanced generation capabilities
 */
export async function GET(): Promise<NextResponse> {
  try {
    const capabilities = {
      version: '2.0',
      features: {
        advancedConstraints: {
          sumRange: 'Control the sum of generated numbers within specified range',
          consecutiveNumbers: 'Control consecutive number patterns',
          distributionControl: 'Control distribution across low/mid/high ranges',
          decadeDistribution: 'Control distribution across number decades',
          frequencyBased: 'Use historical frequency data for hot/cold number selection',
          avoidancePatterns: 'Avoid recent draws, never-won numbers, or custom blacklists',
          luckyNumbers: 'Force include or prefer user-specified lucky numbers',
        },
        algorithms: {
          optimized: 'Advanced constraint-satisfaction algorithm',
          weighted: 'Frequency-weighted random selection',
          historical: 'Historical pattern analysis',
        },
        analysis: {
          sumAnalysis: 'Statistical analysis of number sums',
          patternAnalysis: 'Detection of consecutive and mathematical patterns',
          distributionAnalysis: 'Analysis of number distribution across ranges',
          historicalComparison: 'Similarity scoring against historical draws',
        },
      },
      limits: {
        maxSets: 100,
        maxAttempts: 10000,
        itemsInSet: 15, // Lotofácil specific
        numberRange: [1, 25],
      },
      predefinedStrategies: [
        'Balanced',
        'Hot Numbers',
        'Cold Numbers',
        'Mathematical',
        'Conservative',
      ],
    };
    
    return NextResponse.json(capabilities, { status: 200 });
    
  } catch (error) {
    console.error('Error getting capabilities:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error occurred while getting capabilities',
      },
      { status: 500 }
    );
  }
}
