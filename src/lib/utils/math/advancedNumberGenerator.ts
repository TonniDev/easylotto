import {
  AdvancedConstraints,
  AdvancedGenerationOptions,
  GenerationResult,
  NumberFrequency,
  PatternDetection,
  getNumberCategory,
  getNumberDecade,
  calculateSum,
  findConsecutiveSequences,
  calculateSimilarityScore,
} from '@lib/definitions/advancedGenerator';
import { isPrime, isFibonacci, isMultipleOf3, isEven, isOdd } from '@lib/utils/math/baseOperations';

/**
 * Advanced Number Generator Engine
 */
export class AdvancedNumberGenerator {
  private historicalData: number[][] = [];
  private numberFrequencies: NumberFrequency[] = [];
  
  constructor(historicalData?: number[][]) {
    if (historicalData) {
      this.historicalData = historicalData;
      this.calculateFrequencies();
    }
  }

  /**
   * Generate numbers with advanced constraints
   */
  async generateNumbers(options: AdvancedGenerationOptions): Promise<GenerationResult> {
    const startTime = Date.now();
    const {
      amountOfSets = 1,
      itemsInSet = 15,
      constraints = {},
      startEnd = [1, 25],
      avoidDuplicates = true,
      maxAttempts = 1000,
      useOptimizedAlgorithm = true,
    } = options;

    const [start, end] = startEnd;
    const generatedSets: number[][] = [];
    let totalAttempts = 0;
    const warnings: string[] = [];

    // Pre-calculate available numbers based on constraints
    const availableNumbers = this.getAvailableNumbers(start, end, constraints);
    
    if (availableNumbers.length < itemsInSet) {
      throw new Error(`Not enough available numbers (${availableNumbers.length}) to generate set of ${itemsInSet}`);
    }

    // Generate sets
    for (let setIndex = 0; setIndex < amountOfSets; setIndex++) {
      let attempts = 0;
      let validSet: number[] | null = null;

      while (!validSet && attempts < maxAttempts) {
        attempts++;
        totalAttempts++;

        if (useOptimizedAlgorithm) {
          validSet = this.generateOptimizedSet(availableNumbers, itemsInSet, constraints);
        } else {
          validSet = this.generateBasicSet(availableNumbers, itemsInSet, constraints);
        }

        // Check for duplicates if required
        if (validSet && avoidDuplicates) {
          const isDuplicate = generatedSets.some(existingSet => 
            this.arraysEqual(validSet!.sort(), existingSet.sort())
          );
          if (isDuplicate) {
            validSet = null;
          }
        }

        // Validate constraints
        if (validSet && !this.validateConstraints(validSet, constraints)) {
          validSet = null;
        }
      }

      if (validSet) {
        generatedSets.push(validSet.sort((a, b) => a - b));
      } else {
        warnings.push(`Failed to generate set ${setIndex + 1} after ${maxAttempts} attempts`);
      }
    }

    const generationTime = Date.now() - startTime;

    // Analyze results
    const analysis = this.analyzeResults(generatedSets);

    return {
      numbers: generatedSets,
      metadata: {
        generationTime,
        attempts: totalAttempts,
        strategy: options.strategy?.name || 'Custom',
        constraintsSatisfied: generatedSets.length === amountOfSets,
        warnings: warnings.length > 0 ? warnings : undefined,
      },
      analysis,
    };
  }

  /**
   * Generate optimized set using advanced algorithms
   */
  private generateOptimizedSet(
    availableNumbers: number[],
    itemsInSet: number,
    constraints: AdvancedConstraints
  ): number[] | null {
    const selectedNumbers: number[] = [];
    const remainingNumbers = [...availableNumbers];

    // Phase 1: Handle forced inclusions (lucky numbers)
    if (constraints.luckyNumbers?.forceInclude) {
      const luckyToInclude = Math.min(
        constraints.luckyNumbers.forceInclude,
        constraints.luckyNumbers.numbers.length,
        itemsInSet
      );
      
      for (let i = 0; i < luckyToInclude; i++) {
        const luckyNum = constraints.luckyNumbers.numbers[i];
        if (remainingNumbers.includes(luckyNum)) {
          selectedNumbers.push(luckyNum);
          remainingNumbers.splice(remainingNumbers.indexOf(luckyNum), 1);
        }
      }
    }

    // Phase 2: Apply distribution constraints
    const distributionTargets = this.calculateDistributionTargets(constraints, itemsInSet - selectedNumbers.length);
    
    // Fill by categories
    this.fillByCategory(selectedNumbers, remainingNumbers, distributionTargets, 'low');
    this.fillByCategory(selectedNumbers, remainingNumbers, distributionTargets, 'mid');
    this.fillByCategory(selectedNumbers, remainingNumbers, distributionTargets, 'high');

    // Phase 3: Fill remaining slots with weighted selection
    while (selectedNumbers.length < itemsInSet && remainingNumbers.length > 0) {
      const nextNumber = this.selectWeightedNumber(remainingNumbers, constraints);
      if (nextNumber !== null) {
        selectedNumbers.push(nextNumber);
        remainingNumbers.splice(remainingNumbers.indexOf(nextNumber), 1);
      } else {
        break;
      }
    }

    return selectedNumbers.length === itemsInSet ? selectedNumbers : null;
  }

  /**
   * Generate basic set using simple random selection
   */
  private generateBasicSet(
    availableNumbers: number[],
    itemsInSet: number,
    constraints: AdvancedConstraints
  ): number[] | null {
    const shuffled = [...availableNumbers].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, itemsInSet);
  }

  /**
   * Get available numbers based on avoidance constraints
   */
  private getAvailableNumbers(start: number, end: number, constraints: AdvancedConstraints): number[] {
    let numbers = Array.from({ length: end - start + 1 }, (_, i) => start + i);

    // Apply avoidance constraints
    if (constraints.avoidance) {
      const { type, recentDraws, blacklistedNumbers } = constraints.avoidance;

      if (type === 'recent_draws' && recentDraws && this.historicalData.length > 0) {
        const recentNumbers = new Set<number>();
        const recentGames = this.historicalData.slice(-recentDraws);
        recentGames.forEach(game => game.forEach(num => recentNumbers.add(num)));
        numbers = numbers.filter(num => !recentNumbers.has(num));
      }

      if (type === 'user_blacklist' && blacklistedNumbers) {
        numbers = numbers.filter(num => !blacklistedNumbers.includes(num));
      }

      if (type === 'never_won' && this.historicalData.length > 0) {
        const allHistoricalNumbers = new Set<number>();
        this.historicalData.forEach(game => game.forEach(num => allHistoricalNumbers.add(num)));
        numbers = numbers.filter(num => allHistoricalNumbers.has(num));
      }
    }

    return numbers;
  }

  /**
   * Calculate distribution targets based on constraints
   */
  private calculateDistributionTargets(constraints: AdvancedConstraints, remainingSlots: number) {
    return {
      low: constraints.lowNumbers || 0,
      mid: constraints.midNumbers || 0,
      high: constraints.highNumbers || 0,
    };
  }

  /**
   * Fill numbers by category
   */
  private fillByCategory(
    selectedNumbers: number[],
    remainingNumbers: number[],
    targets: { low: number; mid: number; high: number },
    category: 'low' | 'mid' | 'high'
  ): void {
    const target = targets[category];
    const categoryNumbers = remainingNumbers.filter(num => getNumberCategory(num) === category);
    
    let filled = 0;
    while (filled < target && categoryNumbers.length > 0) {
      const randomIndex = Math.floor(Math.random() * categoryNumbers.length);
      const selectedNum = categoryNumbers[randomIndex];
      
      selectedNumbers.push(selectedNum);
      remainingNumbers.splice(remainingNumbers.indexOf(selectedNum), 1);
      categoryNumbers.splice(randomIndex, 1);
      filled++;
    }
  }

  /**
   * Select number with weighted probability
   */
  private selectWeightedNumber(availableNumbers: number[], constraints: AdvancedConstraints): number | null {
    if (availableNumbers.length === 0) return null;

    // Apply frequency-based weighting if enabled
    if (constraints.frequency && this.numberFrequencies.length > 0) {
      const weights = availableNumbers.map(num => {
        const freq = this.numberFrequencies.find(f => f.number === num);
        if (!freq) return 1;

        if (constraints.frequency!.hotNumbers && freq.trend === 'hot') {
          return freq.weight * 2;
        }
        if (constraints.frequency!.coldNumbers && freq.trend === 'cold') {
          return freq.weight * 2;
        }
        return freq.weight;
      });

      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;

      for (let i = 0; i < availableNumbers.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return availableNumbers[i];
        }
      }
    }

    // Default random selection
    return availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
  }

  /**
   * Validate constraints against generated set
   */
  private validateConstraints(numbers: number[], constraints: AdvancedConstraints): boolean {
    // Sum range validation
    if (constraints.sumRange) {
      const sum = calculateSum(numbers);
      if (sum < constraints.sumRange.min || sum > constraints.sumRange.max) {
        return false;
      }
    }

    // Consecutive numbers validation
    if (constraints.consecutiveNumbers) {
      const sequences = findConsecutiveSequences(numbers);
      const maxConsecutive = Math.max(...sequences.map(seq => seq.length), 1);
      
      if (!constraints.consecutiveNumbers.allowConsecutive && sequences.length > 0) {
        return false;
      }
      
      if (maxConsecutive > constraints.consecutiveNumbers.maxConsecutive) {
        return false;
      }
    }

    // Basic constraint validation
    if (constraints.even !== undefined) {
      const evenCount = numbers.filter(isEven).length;
      if (evenCount !== constraints.even) return false;
    }

    if (constraints.odd !== undefined) {
      const oddCount = numbers.filter(isOdd).length;
      if (oddCount !== constraints.odd) return false;
    }

    if (constraints.prime !== undefined) {
      const primeCount = numbers.filter(isPrime).length;
      if (primeCount !== constraints.prime) return false;
    }

    return true;
  }

  /**
   * Analyze generation results
   */
  private analyzeResults(generatedSets: number[][]): GenerationResult['analysis'] {
    if (generatedSets.length === 0) {
      return {
        sumAnalysis: { sums: [], averageSum: 0, sumDistribution: 'medium' },
        patternAnalysis: { consecutiveCount: 0, evenOddRatio: 0, primeCount: 0, fibonacciCount: 0 },
        distributionAnalysis: { lowCount: 0, midCount: 0, highCount: 0 },
      };
    }

    const sums = generatedSets.map(calculateSum);
    const averageSum = sums.reduce((sum, s) => sum + s, 0) / sums.length;
    
    // Analyze first set for patterns (could be extended to analyze all sets)
    const firstSet = generatedSets[0];
    const consecutiveSequences = findConsecutiveSequences(firstSet);
    const evenCount = firstSet.filter(isEven).length;
    const oddCount = firstSet.filter(isOdd).length;
    const primeCount = firstSet.filter(isPrime).length;
    const fibonacciCount = firstSet.filter(isFibonacci).length;

    const lowCount = firstSet.filter(num => getNumberCategory(num) === 'low').length;
    const midCount = firstSet.filter(num => getNumberCategory(num) === 'mid').length;
    const highCount = firstSet.filter(num => getNumberCategory(num) === 'high').length;

    return {
      sumAnalysis: {
        sums,
        averageSum,
        sumDistribution: averageSum < 120 ? 'low' : averageSum > 180 ? 'high' : 'medium',
      },
      patternAnalysis: {
        consecutiveCount: consecutiveSequences.reduce((sum, seq) => sum + seq.length, 0),
        evenOddRatio: evenCount / (oddCount || 1),
        primeCount,
        fibonacciCount,
      },
      distributionAnalysis: {
        lowCount,
        midCount,
        highCount,
      },
    };
  }

  /**
   * Calculate number frequencies from historical data
   */
  private calculateFrequencies(): void {
    if (this.historicalData.length === 0) return;

    const frequencies: { [key: number]: { count: number; lastSeen: number } } = {};
    
    // Initialize all numbers
    for (let i = 1; i <= 25; i++) {
      frequencies[i] = { count: 0, lastSeen: this.historicalData.length };
    }

    // Count frequencies and track last appearances
    this.historicalData.forEach((game, gameIndex) => {
      game.forEach(num => {
        frequencies[num].count++;
        frequencies[num].lastSeen = this.historicalData.length - gameIndex;
      });
    });

    // Convert to NumberFrequency array
    this.numberFrequencies = Object.entries(frequencies).map(([num, data]) => {
      const number = parseInt(num);
      const frequency = data.count / this.historicalData.length;
      const avgFrequency = 15 / 25; // Expected frequency for Lotofácil
      
      let trend: 'hot' | 'cold' | 'neutral' = 'neutral';
      if (frequency > avgFrequency * 1.1) trend = 'hot';
      else if (frequency < avgFrequency * 0.9) trend = 'cold';

      return {
        number,
        frequency,
        lastAppearance: data.lastSeen,
        trend,
        weight: frequency,
      };
    });
  }

  /**
   * Utility function to check array equality
   */
  private arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((val, i) => val === b[i]);
  }
}

/**
 * Factory function to create generator with historical data
 */
export async function createAdvancedGenerator(historicalData?: number[][]): Promise<AdvancedNumberGenerator> {
  return new AdvancedNumberGenerator(historicalData);
}

/**
 * Quick generation function for simple use cases
 */
export async function generateAdvancedNumbers(
  options: AdvancedGenerationOptions,
  historicalData?: number[][]
): Promise<GenerationResult> {
  const generator = new AdvancedNumberGenerator(historicalData);
  return generator.generateNumbers(options);
}
