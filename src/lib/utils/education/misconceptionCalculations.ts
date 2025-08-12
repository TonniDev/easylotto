import BigNumber from 'bignumber.js';
import { 
  MythBustingScenario, 
  LotteryMisconception, 
  MythBustingRequest,
  getMisconception 
} from '@lib/definitions/commonMisconceptions';
import { LOTOFACIL_CONSTANTS } from '@lib/definitions/multiGameScenario';
import { calculateMultiGameScenario } from '@lib/utils/probability/multiGameCalculations';
import { calculateOpportunityCost } from '@lib/utils/financial/compoundInterest';

// Configure BigNumber for precise calculations
BigNumber.config({
  DECIMAL_PLACES: 15,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

/**
 * Calculate myth-busting scenario for a specific misconception
 */
export function calculateMythBustingScenario(
  request: MythBustingRequest
): MythBustingScenario | null {
  const misconception = getMisconception(request.misconceptionId);
  if (!misconception) {
    return null;
  }

  // Extract parameters with defaults based on misconception type
  const params = getDefaultParametersForMisconception(misconception, request);
  
  // Calculate the scenario using our existing multi-game calculator
  const multiGameResult = calculateMultiGameScenario({
    gamesPerDraw: params.gamesPerDraw,
    years: params.years,
    annualInterestRate: request.annualInterestRate,
    gamePrice: LOTOFACIL_CONSTANTS.BASE_GAME_PRICE,
    drawsPerWeek: LOTOFACIL_CONSTANTS.DRAWS_PER_WEEK,
    weeksPerYear: LOTOFACIL_CONSTANTS.WEEKS_PER_YEAR,
    basePrize: LOTOFACIL_CONSTANTS.BASE_PRIZE,
  });

  // Calculate additional metrics specific to myth-busting
  const totalCost = parseFloat(multiGameResult.totalCost);
  const investmentAlternative = parseFloat(multiGameResult.investmentReturn);
  const actualProbability = multiGameResult.probabilityPercentage / 100;
  
  // Calculate time to break even (if ever)
  const timeToBreakEven = calculateTimeToBreakEven(
    totalCost,
    LOTOFACIL_CONSTANTS.BASE_PRIZE,
    actualProbability
  );

  // Calculate expected loss
  const expectedWinnings = actualProbability * LOTOFACIL_CONSTANTS.BASE_PRIZE;
  const expectedLoss = totalCost - expectedWinnings;

  // Generate educational insights specific to this misconception
  const educationalInsights = generateMisconceptionInsights(
    misconception,
    multiGameResult,
    {
      totalCost,
      investmentAlternative,
      actualProbability,
      expectedLoss,
      timeToBreakEven,
    }
  );

  return {
    misconceptionId: request.misconceptionId,
    parameters: {
      gamesPerDraw: params.gamesPerDraw,
      years: params.years,
      totalInvestment: totalCost,
      strategy: misconception.title,
      frequency: 'daily',
    },
    calculatedResults: {
      actualProbability,
      totalCost,
      investmentAlternative,
      timeToBreakEven,
      expectedLoss,
    },
    educationalInsights,
  };
}

/**
 * Get default parameters for a specific misconception
 */
function getDefaultParametersForMisconception(
  misconception: LotteryMisconception,
  request: MythBustingRequest
): { gamesPerDraw: number; years: number } {
  // Use request parameters if provided, otherwise use misconception-specific defaults
  let gamesPerDraw = request.gamesPerDraw;
  let years = request.years;

  if (!gamesPerDraw || !years) {
    switch (misconception.id) {
      case 'guarantee-5-daily':
        gamesPerDraw = gamesPerDraw || 5;
        years = years || 50;
        break;
      case 'guarantee-20-daily':
        gamesPerDraw = gamesPerDraw || 20;
        years = years || 10;
        break;
      case 'proportional-odds':
        gamesPerDraw = gamesPerDraw || 10;
        years = years || 20;
        break;
      case 'replacement-strategy':
        gamesPerDraw = gamesPerDraw || 10;
        years = years || 25;
        break;
      case 'same-numbers-daily':
        gamesPerDraw = gamesPerDraw || 1;
        years = years || 20;
        break;
      case 'hot-cold-numbers':
        gamesPerDraw = gamesPerDraw || 3;
        years = years || 15;
        break;
      case 'time-guarantee':
        gamesPerDraw = gamesPerDraw || 5;
        years = years || 30;
        break;
      default:
        gamesPerDraw = gamesPerDraw || 5;
        years = years || 20;
    }
  }

  return { gamesPerDraw, years };
}

/**
 * Calculate time to break even (if mathematically possible)
 */
function calculateTimeToBreakEven(
  totalCost: number,
  prizeAmount: number,
  winProbability: number
): number | null {
  // If expected value is negative, there's no break-even point
  const expectedValue = (winProbability * prizeAmount) - totalCost;
  if (expectedValue <= 0) {
    return null;
  }

  // This is a simplified calculation - in reality, break-even is complex
  // because it depends on when the win occurs during the playing period
  const expectedWinnings = winProbability * prizeAmount;
  const costPerYear = totalCost; // Assuming totalCost is for the full period
  
  if (expectedWinnings <= costPerYear) {
    return null; // Never breaks even
  }

  // Simplified break-even calculation
  return totalCost / (expectedWinnings - costPerYear);
}

/**
 * Generate educational insights specific to the misconception
 */
function generateMisconceptionInsights(
  misconception: LotteryMisconception,
  multiGameResult: any,
  metrics: {
    totalCost: number;
    investmentAlternative: number;
    actualProbability: number;
    expectedLoss: number;
    timeToBreakEven: number | null;
  }
): string[] {
  const insights: string[] = [];

  // Add misconception-specific insights
  switch (misconception.type) {
    case 'guarantee_belief':
      insights.push(
        `🚨 REALITY CHECK: You have a ${(100 - multiGameResult.probabilityPercentage).toFixed(1)}% chance of NEVER winning despite following this strategy.`
      );
      insights.push(
        `💰 FINANCIAL IMPACT: You'll spend R$ ${metrics.totalCost.toLocaleString()} but could have R$ ${metrics.investmentAlternative.toLocaleString()} through investment.`
      );
      insights.push(
        `📊 EXPECTED LOSS: On average, you'll lose R$ ${metrics.expectedLoss.toLocaleString()} following this strategy.`
      );
      break;

    case 'proportional_odds':
      const singleGameOdds = LOTOFACIL_CONSTANTS.WINNING_ODDS;
      const actualOdds = Math.round(1 / metrics.actualProbability);
      insights.push(
        `🔢 MATH REALITY: Playing ${multiGameResult.scenario.gamesPerDraw} games gives you 1 in ${actualOdds.toLocaleString()} odds, NOT 1 in ${Math.round(singleGameOdds / multiGameResult.scenario.gamesPerDraw).toLocaleString()}.`
      );
      insights.push(
        `📈 COST vs BENEFIT: Your costs increase ${multiGameResult.scenario.gamesPerDraw}x but odds improve by only ${(singleGameOdds / actualOdds).toFixed(1)}x.`
      );
      break;

    case 'replacement_strategy':
      insights.push(
        `🎲 INDEPENDENCE FACT: Each lottery draw is completely independent. Past results have ZERO effect on future draws.`
      );
      insights.push(
        `🔄 REPLACEMENT REALITY: Replacing winning sets doesn't change the odds of your remaining sets - they're still 1 in ${LOTOFACIL_CONSTANTS.WINNING_ODDS.toLocaleString()}.`
      );
      break;

    case 'same_numbers_daily':
      insights.push(
        `📅 TIME DOESN'T MATTER: Playing the same numbers for ${multiGameResult.scenario.years} years doesn't make them "due" to win.`
      );
      insights.push(
        `🎯 CONSISTENCY MYTH: Your numbers have exactly the same 1 in ${LOTOFACIL_CONSTANTS.WINNING_ODDS.toLocaleString()} odds in every single draw.`
      );
      break;

    case 'hot_cold_numbers':
      insights.push(
        `🌡️ TEMPERATURE MYTH: Numbers don't have "temperature" - all numbers have equal probability in every draw.`
      );
      insights.push(
        `📊 PATTERN ILLUSION: Apparent patterns in past draws are just random variation, not predictive signals.`
      );
      break;

    case 'time_guarantee':
      insights.push(
        `⏰ NO TIME GUARANTEE: Even playing for ${multiGameResult.scenario.years} years gives you only ${multiGameResult.probabilityPercentage.toFixed(1)}% chance of winning.`
      );
      insights.push(
        `🎰 HOUSE EDGE: The longer you play, the more certain your losses become due to the mathematical house edge.`
      );
      break;
  }

  // Add universal insights
  insights.push(
    `💡 OPPORTUNITY COST: The R$ ${metrics.totalCost.toLocaleString()} spent on lottery could become R$ ${metrics.investmentAlternative.toLocaleString()} through conservative investment.`
  );

  if (metrics.timeToBreakEven === null) {
    insights.push(
      `📉 BREAK-EVEN REALITY: This strategy has no mathematical break-even point - you're expected to lose money.`
    );
  }

  insights.push(
    `🎯 BOTTOM LINE: This misconception leads to an average loss of R$ ${metrics.expectedLoss.toLocaleString()} while providing false hope of guaranteed wins.`
  );

  return insights;
}

/**
 * Calculate the probability of a specific misconception scenario
 */
export function calculateMisconceptionProbability(
  misconceptionId: string,
  gamesPerDraw: number,
  years: number
): { winProbability: number; neverWinProbability: number } {
  const totalGames = gamesPerDraw * LOTOFACIL_CONSTANTS.DRAWS_PER_WEEK * LOTOFACIL_CONSTANTS.WEEKS_PER_YEAR * years;
  const singleGameOdds = new BigNumber(1).dividedBy(LOTOFACIL_CONSTANTS.WINNING_ODDS);
  
  // Use approximation for large numbers
  const np = singleGameOdds.multipliedBy(totalGames);
  const npSquared = np.multipliedBy(np);
  const npCubed = npSquared.multipliedBy(np);
  
  let neverWinProbability = new BigNumber(1)
    .minus(np)
    .plus(npSquared.dividedBy(2))
    .minus(npCubed.dividedBy(6));
  
  // Ensure it's between 0 and 1
  neverWinProbability = BigNumber.max(0, BigNumber.min(1, neverWinProbability));
  const winProbability = new BigNumber(1).minus(neverWinProbability);
  
  return {
    winProbability: winProbability.toNumber(),
    neverWinProbability: neverWinProbability.toNumber(),
  };
}

/**
 * Get quick myth-busting facts for a misconception
 */
export function getQuickMythBustingFacts(misconceptionId: string): string[] {
  const misconception = getMisconception(misconceptionId);
  if (!misconception) return [];

  const facts: string[] = [];
  
  // Add the core reality
  facts.push(`❌ MYTH: ${misconception.belief}`);
  facts.push(`✅ REALITY: ${misconception.reality}`);
  
  // Add specific debunking points
  misconception.debunkingPoints.slice(0, 3).forEach(point => {
    facts.push(`💡 ${point}`);
  });

  return facts;
}
