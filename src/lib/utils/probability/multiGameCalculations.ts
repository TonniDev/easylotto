import BigNumber from 'bignumber.js';
import { 
  MultiGameScenario, 
  MultiGameCalculationResult, 
  InvestmentGrowthPoint, 
  EducationalInsight,
  LOTOFACIL_CONSTANTS 
} from '@lib/definitions/multiGameScenario';

// Configure BigNumber for high precision
BigNumber.config({
  DECIMAL_PLACES: 20,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
  EXPONENTIAL_AT: [-20, 20],
});

/**
 * Calculate probability of winning at least once with multiple games over time
 * Formula: P(at least one win) = 1 - (1 - p)^n
 * where p = 1/3,268,760 and n = total games
 *
 * For large n, we use the approximation: (1-p)^n ≈ e^(-np) when p is small
 */
export function calculateWinningProbability(totalGames: number): {
  probabilityOfWinning: BigNumber;
  probabilityOfNeverWinning: BigNumber;
} {
  const singleGameOdds = new BigNumber(1).dividedBy(LOTOFACIL_CONSTANTS.WINNING_ODDS);

  // Use approximation for all cases to avoid performance issues
  // P(never winning) ≈ e^(-n*p) where p is very small
  const np = singleGameOdds.multipliedBy(totalGames);

  // For small np values, use Taylor series: e^(-x) ≈ 1 - x + x²/2! - x³/3! + x⁴/4!
  const npSquared = np.multipliedBy(np);
  const npCubed = npSquared.multipliedBy(np);
  const npFourth = npCubed.multipliedBy(np);

  let probabilityOfNeverWinning = new BigNumber(1)
    .minus(np)
    .plus(npSquared.dividedBy(2))
    .minus(npCubed.dividedBy(6))
    .plus(npFourth.dividedBy(24));

  // Ensure it's between 0 and 1
  probabilityOfNeverWinning = BigNumber.max(0, BigNumber.min(1, probabilityOfNeverWinning));
  const probabilityOfWinning = new BigNumber(1).minus(probabilityOfNeverWinning);

  return {
    probabilityOfWinning,
    probabilityOfNeverWinning,
  };
}

/**
 * Calculate total cost of playing multiple games over time
 */
export function calculateTotalCost(scenario: MultiGameScenario): {
  totalGames: number;
  totalCost: BigNumber;
  totalWeeks: number;
  totalDraws: number;
} {
  const totalWeeks = scenario.years * scenario.weeksPerYear;
  const totalDraws = totalWeeks * scenario.drawsPerWeek;
  const totalGames = totalDraws * scenario.gamesPerDraw;
  const totalCost = new BigNumber(totalGames).multipliedBy(scenario.gamePrice);
  
  return {
    totalGames,
    totalCost,
    totalWeeks,
    totalDraws,
  };
}

/**
 * Calculate investment alternative returns using compound interest
 * Formula: A = P * (1 + r/n)^(nt)
 * For weekly investments: A = PMT * [((1 + r/52)^(52*t) - 1) / (r/52)]
 */
export function calculateInvestmentAlternative(
  weeklyInvestment: BigNumber,
  annualRate: number,
  years: number
): {
  finalAmount: BigNumber;
  growthData: InvestmentGrowthPoint[];
} {
  const weeklyRate = new BigNumber(annualRate).dividedBy(52);
  const totalWeeks = years * 52;

  let finalAmount: BigNumber;

  if (weeklyRate.isZero()) {
    // If no interest, just multiply payment by periods
    finalAmount = weeklyInvestment.multipliedBy(totalWeeks);
  } else {
    // Calculate final amount using annuity formula
    const onePlusRate = new BigNumber(1).plus(weeklyRate);
    const compoundFactor = onePlusRate.exponentiatedBy(totalWeeks);
    const numerator = compoundFactor.minus(1);
    finalAmount = weeklyInvestment.multipliedBy(numerator).dividedBy(weeklyRate);
  }
  
  // Generate growth data for visualization
  const growthData: InvestmentGrowthPoint[] = [];
  let cumulativeLotteryCost = new BigNumber(0);
  let cumulativeInvestment = new BigNumber(0);
  const onePlusRate = weeklyRate.isZero() ? new BigNumber(1) : new BigNumber(1).plus(weeklyRate);

  for (let year = 1; year <= years; year++) {
    const weeksInYear = year * 52;
    cumulativeLotteryCost = cumulativeLotteryCost.plus(weeklyInvestment.multipliedBy(52));

    // Calculate investment value at this year
    if (weeklyRate.isZero()) {
      cumulativeInvestment = weeklyInvestment.multipliedBy(weeksInYear);
    } else {
      const yearCompoundFactor = onePlusRate.exponentiatedBy(weeksInYear);
      const yearNumerator = yearCompoundFactor.minus(1);
      cumulativeInvestment = weeklyInvestment.multipliedBy(yearNumerator).dividedBy(weeklyRate);
    }

    growthData.push({
      year,
      lotteryCost: cumulativeLotteryCost.toNumber(),
      investmentValue: cumulativeInvestment.toNumber(),
      difference: cumulativeInvestment.minus(cumulativeLotteryCost).toNumber(),
    });
  }
  
  return {
    finalAmount,
    growthData,
  };
}

/**
 * Generate educational insights based on the calculation results
 */
export function generateEducationalInsights(
  scenario: MultiGameScenario,
  result: Partial<MultiGameCalculationResult>
): EducationalInsight[] {
  const insights: EducationalInsight[] = [];
  
  // Shocking probability insight
  const neverWinningPercentage = result.neverWinningPercentage || 0;
  if (neverWinningPercentage > 50) {
    insights.push({
      type: 'shocking',
      title: 'High Risk of Never Winning',
      message: `Even playing ${scenario.gamesPerDraw} games per draw for ${scenario.years} years, you have a ${neverWinningPercentage.toFixed(1)}% chance of NEVER winning the jackpot.`,
      value: `${neverWinningPercentage.toFixed(1)}%`
    });
  }
  
  // Cost comparison insight
  if (result.totalCost && result.investmentReturn) {
    const costBN = new BigNumber(result.totalCost);
    const investmentBN = new BigNumber(result.investmentReturn);
    const difference = investmentBN.minus(costBN);
    
    insights.push({
      type: 'comparison',
      title: 'Investment Alternative',
      message: `Instead of spending on lottery tickets, investing the same money could yield ${difference.toFixed(0)} more over ${scenario.years} years.`,
      value: `R$ ${difference.toFixed(0)}`
    });
  }
  
  // Odds misconception insight
  if (scenario.gamesPerDraw > 1) {
    const singleGameOdds = LOTOFACIL_CONSTANTS.WINNING_ODDS;
    const actualImprovement = (1 - Math.pow(1 - 1/singleGameOdds, scenario.gamesPerDraw)) * singleGameOdds;
    
    insights.push({
      type: 'warning',
      title: 'Odds Don\'t Scale Linearly',
      message: `Playing ${scenario.gamesPerDraw} games doesn't give you ${scenario.gamesPerDraw}x better odds. Your actual odds improve to only 1 in ${Math.round(actualImprovement).toLocaleString()}.`,
    });
  }
  
  // Net prize insight
  if (result.netPrizeIfWin) {
    const netPrize = new BigNumber(result.netPrizeIfWin);
    if (netPrize.isLessThan(scenario.basePrize * 0.5)) {
      insights.push({
        type: 'warning',
        title: 'Reduced Net Prize',
        message: `Even if you win, your net prize after subtracting all ticket costs would be significantly reduced.`,
        value: `R$ ${netPrize.toFixed(0)}`
      });
    }
  }
  
  return insights;
}

/**
 * Main calculation function that orchestrates all calculations
 */
export function calculateMultiGameScenario(scenario: MultiGameScenario): MultiGameCalculationResult {
  // Calculate basic costs and games
  const { totalGames, totalCost, totalWeeks, totalDraws } = calculateTotalCost(scenario);
  
  // Calculate probabilities
  const { probabilityOfWinning, probabilityOfNeverWinning } = calculateWinningProbability(totalGames);
  
  // Calculate investment alternative
  const weeklyInvestment = totalCost.dividedBy(totalWeeks);
  const monthlyInvestment = weeklyInvestment.multipliedBy(52).dividedBy(12);
  const { finalAmount: investmentReturn, growthData } = calculateInvestmentAlternative(
    weeklyInvestment,
    scenario.annualInterestRate,
    scenario.years
  );
  
  // Calculate net prize if win occurs
  const netPrizeIfWin = new BigNumber(scenario.basePrize).minus(totalCost);
  
  // Calculate expected value
  const expectedValue = probabilityOfWinning.multipliedBy(scenario.basePrize).minus(totalCost);
  
  // Convert probabilities to percentages for display
  const probabilityPercentage = probabilityOfWinning.multipliedBy(100).toNumber();
  const neverWinningPercentage = probabilityOfNeverWinning.multipliedBy(100).toNumber();
  
  // Create result object
  const result: MultiGameCalculationResult = {
    scenario,
    totalGames,
    totalCost: totalCost.toFixed(2),
    totalWeeks,
    totalDraws,
    probabilityOfWinning: probabilityOfWinning.toFixed(20),
    probabilityOfNeverWinning: probabilityOfNeverWinning.toFixed(20),
    probabilityPercentage,
    neverWinningPercentage,
    weeklyInvestment: weeklyInvestment.toFixed(2),
    monthlyInvestment: monthlyInvestment.toFixed(2),
    investmentReturn: investmentReturn.toFixed(2),
    investmentGrowthData: growthData,
    netPrizeIfWin: netPrizeIfWin.toFixed(2),
    expectedValue: expectedValue.toFixed(2),
    insights: [],
  };
  
  // Generate educational insights
  result.insights = generateEducationalInsights(scenario, result);
  
  return result;
}
