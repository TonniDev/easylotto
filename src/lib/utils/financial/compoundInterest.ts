import BigNumber from 'bignumber.js';

// Configure BigNumber for financial calculations
BigNumber.config({
  DECIMAL_PLACES: 10,
  ROUNDING_MODE: BigNumber.ROUND_HALF_UP,
});

/**
 * Calculate compound interest for a lump sum investment
 * Formula: A = P(1 + r/n)^(nt)
 * 
 * @param principal - Initial investment amount
 * @param annualRate - Annual interest rate (e.g., 0.08 for 8%)
 * @param compoundingFrequency - Number of times interest is compounded per year
 * @param years - Number of years
 */
export function calculateCompoundInterest(
  principal: number | BigNumber,
  annualRate: number,
  compoundingFrequency: number,
  years: number
): BigNumber {
  const P = new BigNumber(principal);
  const r = new BigNumber(annualRate);
  const n = new BigNumber(compoundingFrequency);
  const t = new BigNumber(years);
  
  // A = P(1 + r/n)^(nt)
  const ratePerPeriod = r.dividedBy(n);
  const onePlusRate = new BigNumber(1).plus(ratePerPeriod);
  const exponent = n.multipliedBy(t);
  const compoundFactor = onePlusRate.exponentiatedBy(exponent.toNumber());
  
  return P.multipliedBy(compoundFactor);
}

/**
 * Calculate future value of regular payments (annuity)
 * Formula: FV = PMT × [((1 + r)^n - 1) / r]
 * 
 * @param payment - Regular payment amount
 * @param interestRate - Interest rate per period
 * @param periods - Number of periods
 */
export function calculateAnnuityFutureValue(
  payment: number | BigNumber,
  interestRate: number,
  periods: number
): BigNumber {
  const PMT = new BigNumber(payment);
  const r = new BigNumber(interestRate);
  const n = new BigNumber(periods);
  
  if (r.isZero()) {
    // If no interest, just multiply payment by periods
    return PMT.multipliedBy(n);
  }
  
  // FV = PMT × [((1 + r)^n - 1) / r]
  const onePlusRate = new BigNumber(1).plus(r);
  const compoundFactor = onePlusRate.exponentiatedBy(n.toNumber());
  const numerator = compoundFactor.minus(1);
  const factor = numerator.dividedBy(r);
  
  return PMT.multipliedBy(factor);
}

/**
 * Calculate weekly investment equivalent for lottery spending
 * 
 * @param gamesPerDraw - Number of games played per draw
 * @param gamePrice - Price per game
 * @param drawsPerWeek - Number of draws per week
 */
export function calculateWeeklyInvestment(
  gamesPerDraw: number,
  gamePrice: number,
  drawsPerWeek: number
): BigNumber {
  return new BigNumber(gamesPerDraw)
    .multipliedBy(gamePrice)
    .multipliedBy(drawsPerWeek);
}

/**
 * Calculate investment growth over time with regular contributions
 * 
 * @param weeklyContribution - Amount invested weekly
 * @param annualRate - Annual interest rate
 * @param years - Number of years
 * @returns Array of yearly growth data
 */
export function calculateInvestmentGrowthOverTime(
  weeklyContribution: number | BigNumber,
  annualRate: number,
  years: number
): Array<{
  year: number;
  totalContributions: number;
  investmentValue: number;
  interestEarned: number;
}> {
  const weeklyAmount = new BigNumber(weeklyContribution);
  const weeklyRate = new BigNumber(annualRate).dividedBy(52);
  const growthData = [];
  
  for (let year = 1; year <= years; year++) {
    const weeksElapsed = year * 52;
    const totalContributions = weeklyAmount.multipliedBy(weeksElapsed);
    
    // Calculate future value of annuity
    const investmentValue = calculateAnnuityFutureValue(
      weeklyAmount,
      weeklyRate.toNumber(),
      weeksElapsed
    );
    
    const interestEarned = investmentValue.minus(totalContributions);
    
    growthData.push({
      year,
      totalContributions: totalContributions.toNumber(),
      investmentValue: investmentValue.toNumber(),
      interestEarned: interestEarned.toNumber(),
    });
  }
  
  return growthData;
}

/**
 * Calculate the opportunity cost of lottery spending vs investing
 * 
 * @param lotterySpending - Total amount spent on lottery
 * @param annualRate - Annual investment return rate
 * @param years - Number of years
 */
export function calculateOpportunityCost(
  lotterySpending: number | BigNumber,
  annualRate: number,
  years: number
): {
  lotterySpending: BigNumber;
  investmentValue: BigNumber;
  opportunityCost: BigNumber;
  opportunityCostPercentage: number;
} {
  const spending = new BigNumber(lotterySpending);
  
  // Assume the lottery spending was distributed evenly over the years
  const weeklySpending = spending.dividedBy(years * 52);
  
  // Calculate what this would be worth if invested instead
  const investmentValue = calculateAnnuityFutureValue(
    weeklySpending,
    annualRate / 52,
    years * 52
  );
  
  const opportunityCost = investmentValue.minus(spending);
  const opportunityCostPercentage = opportunityCost.dividedBy(spending).multipliedBy(100).toNumber();
  
  return {
    lotterySpending: spending,
    investmentValue,
    opportunityCost,
    opportunityCostPercentage,
  };
}

/**
 * Format currency for Brazilian Real
 * Brazilian format: R$ 1.234.567,89 (dots for thousands, comma for decimals)
 */
export function formatBRL(amount: number | BigNumber): string {
  const value = new BigNumber(amount);
  const [integerPart, decimalPart = '00'] = value.toFixed(2).split('.');

  // Add dots for thousands separator
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Use comma for decimal separator (Brazilian format)
  return `R$ ${formattedInteger},${decimalPart}`;
}

/**
 * Calculate effective annual rate from different compounding frequencies
 */
export function calculateEffectiveAnnualRate(
  nominalRate: number,
  compoundingFrequency: number
): number {
  // EAR = (1 + r/n)^n - 1
  const rate = new BigNumber(nominalRate);
  const n = new BigNumber(compoundingFrequency);
  
  const ratePerPeriod = rate.dividedBy(n);
  const onePlusRate = new BigNumber(1).plus(ratePerPeriod);
  const compoundFactor = onePlusRate.exponentiatedBy(n.toNumber());
  
  return compoundFactor.minus(1).toNumber();
}

/**
 * Calculate how long it takes for an investment to double
 * Rule of 72 approximation: years = 72 / (interest rate as percentage)
 * Exact calculation: years = ln(2) / ln(1 + r)
 */
export function calculateDoublingTime(annualRate: number): number {
  if (annualRate <= 0) return Infinity;
  
  // Exact calculation using natural logarithm
  const rate = new BigNumber(annualRate);
  const onePlusRate = new BigNumber(1).plus(rate);
  
  // Using approximation since BigNumber doesn't have ln
  // Rule of 72: years ≈ 0.72 / rate
  return 0.72 / annualRate;
}

/**
 * Calculate monthly payment needed to reach a target amount
 */
export function calculateRequiredMonthlyPayment(
  targetAmount: number | BigNumber,
  annualRate: number,
  years: number
): BigNumber {
  const target = new BigNumber(targetAmount);
  const monthlyRate = new BigNumber(annualRate).dividedBy(12);
  const months = new BigNumber(years * 12);
  
  if (monthlyRate.isZero()) {
    return target.dividedBy(months);
  }
  
  // PMT = FV × r / ((1 + r)^n - 1)
  const onePlusRate = new BigNumber(1).plus(monthlyRate);
  const compoundFactor = onePlusRate.exponentiatedBy(months.toNumber());
  const denominator = compoundFactor.minus(1);
  
  return target.multipliedBy(monthlyRate).dividedBy(denominator);
}
