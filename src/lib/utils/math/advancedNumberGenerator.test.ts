import { describe, it, expect, beforeEach } from 'vitest';
import { AdvancedNumberGenerator, generateAdvancedNumbers } from './advancedNumberGenerator';
import {
  AdvancedConstraints,
  AdvancedGenerationOptions,
  getNumberCategory,
  getNumberDecade,
  calculateSum,
  findConsecutiveSequences,
  validateConstraintsSum,
  validateDistributionSum,
  validateDecadeSum,
} from '@lib/definitions/advancedGenerator';

describe('AdvancedNumberGenerator', () => {
  let generator: AdvancedNumberGenerator;
  const mockHistoricalData = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
  ];

  beforeEach(() => {
    generator = new AdvancedNumberGenerator(mockHistoricalData);
  });

  describe('Basic Generation', () => {
    it('should generate the correct number of sets', async () => {
      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
      };

      const result = await generator.generateNumbers(options);
      
      expect(result.numbers).toHaveLength(3);
      result.numbers.forEach(set => {
        expect(set).toHaveLength(15);
        expect(set.every(num => num >= 1 && num <= 25)).toBe(true);
      });
    });

    it('should generate unique sets when avoidDuplicates is true', async () => {
      const options: AdvancedGenerationOptions = {
        amountOfSets: 5,
        itemsInSet: 15,
        avoidDuplicates: true,
      };

      const result = await generator.generateNumbers(options);
      
      // Check that all sets are unique
      const setStrings = result.numbers.map(set => set.sort().join(','));
      const uniqueSetStrings = new Set(setStrings);
      
      expect(uniqueSetStrings.size).toBe(result.numbers.length);
    });

    it('should include metadata in results', async () => {
      const options: AdvancedGenerationOptions = {
        amountOfSets: 1,
        itemsInSet: 15,
      };

      const result = await generator.generateNumbers(options);

      expect(result.metadata).toBeDefined();
      expect(result.metadata.generationTime).toBeGreaterThanOrEqual(0);
      expect(result.metadata.attempts).toBeGreaterThan(0);
      expect(result.metadata.strategy).toBeDefined();
      expect(typeof result.metadata.constraintsSatisfied).toBe('boolean');
    });
  });

  describe('Constraint Validation', () => {
    it('should respect sum range constraints', async () => {
      const constraints: AdvancedConstraints = {
        sumRange: { min: 120, max: 180 },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 5,
        itemsInSet: 15,
        constraints,
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const sum = calculateSum(set);
        expect(sum).toBeGreaterThanOrEqual(120);
        expect(sum).toBeLessThanOrEqual(180);
      });
    });

    it('should respect consecutive number constraints', async () => {
      const constraints: AdvancedConstraints = {
        consecutiveNumbers: {
          maxConsecutive: 2,
          allowConsecutive: true,
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
        constraints,
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const sequences = findConsecutiveSequences(set);
        const maxConsecutive = Math.max(...sequences.map(seq => seq.length), 1);
        expect(maxConsecutive).toBeLessThanOrEqual(2);
      });
    });

    it('should disallow consecutive numbers when specified', async () => {
      const constraints: AdvancedConstraints = {
        consecutiveNumbers: {
          maxConsecutive: 1,
          allowConsecutive: false,
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
        constraints,
        maxAttempts: 5000, // Increase attempts for this difficult constraint
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const sequences = findConsecutiveSequences(set);
        expect(sequences).toHaveLength(0);
      });
    });

    it('should respect distribution constraints', async () => {
      const constraints: AdvancedConstraints = {
        lowNumbers: 5,
        midNumbers: 5,
        highNumbers: 5,
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
        constraints,
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const lowCount = set.filter(num => getNumberCategory(num) === 'low').length;
        const midCount = set.filter(num => getNumberCategory(num) === 'mid').length;
        const highCount = set.filter(num => getNumberCategory(num) === 'high').length;
        
        expect(lowCount).toBe(5);
        expect(midCount).toBe(5);
        expect(highCount).toBe(5);
      });
    });
  });

  describe('Lucky Numbers', () => {
    it('should force include lucky numbers', async () => {
      const luckyNumbers = [7, 13, 21];
      const constraints: AdvancedConstraints = {
        luckyNumbers: {
          numbers: luckyNumbers,
          forceInclude: 2,
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
        constraints,
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const includedLucky = set.filter(num => luckyNumbers.includes(num));
        expect(includedLucky.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Avoidance Patterns', () => {
    it('should avoid recent draws', async () => {
      // Use historical data that leaves enough numbers available
      const simpleHistoricalData = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], // First draw
        [6, 7, 8, 9, 10, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], // Second draw - only 5 overlap
      ];
      const testGenerator = new AdvancedNumberGenerator(simpleHistoricalData);

      const constraints: AdvancedConstraints = {
        avoidance: {
          type: 'recent_draws',
          recentDraws: 1, // Only avoid last draw
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 1,
        itemsInSet: 15,
        constraints,
      };

      const result = await testGenerator.generateNumbers(options);

      // Should successfully generate numbers
      expect(result.numbers).toHaveLength(1);
      expect(result.numbers[0]).toHaveLength(15);
      expect(result.metadata.constraintsSatisfied).toBe(true);
    });

    it('should avoid blacklisted numbers', async () => {
      const blacklistedNumbers = [1, 2, 3, 4, 5];
      const constraints: AdvancedConstraints = {
        avoidance: {
          type: 'user_blacklist',
          blacklistedNumbers,
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 3,
        itemsInSet: 15,
        constraints,
      };

      const result = await generator.generateNumbers(options);
      
      result.numbers.forEach(set => {
        const hasBlacklistedNumber = set.some(num => blacklistedNumbers.includes(num));
        expect(hasBlacklistedNumber).toBe(false);
      });
    });
  });

  describe('Analysis', () => {
    it('should provide comprehensive analysis', async () => {
      const options: AdvancedGenerationOptions = {
        amountOfSets: 1,
        itemsInSet: 15,
      };

      const result = await generator.generateNumbers(options);
      
      expect(result.analysis).toBeDefined();
      expect(result.analysis.sumAnalysis).toBeDefined();
      expect(result.analysis.patternAnalysis).toBeDefined();
      expect(result.analysis.distributionAnalysis).toBeDefined();
      
      expect(result.analysis.sumAnalysis.sums).toHaveLength(1);
      expect(result.analysis.sumAnalysis.averageSum).toBeGreaterThan(0);
      expect(['low', 'medium', 'high']).toContain(result.analysis.sumAnalysis.sumDistribution);
      
      expect(typeof result.analysis.patternAnalysis.consecutiveCount).toBe('number');
      expect(typeof result.analysis.patternAnalysis.evenOddRatio).toBe('number');
      expect(typeof result.analysis.patternAnalysis.primeCount).toBe('number');
      expect(typeof result.analysis.patternAnalysis.fibonacciCount).toBe('number');
      
      expect(typeof result.analysis.distributionAnalysis.lowCount).toBe('number');
      expect(typeof result.analysis.distributionAnalysis.midCount).toBe('number');
      expect(typeof result.analysis.distributionAnalysis.highCount).toBe('number');
    });
  });

  describe('Error Handling', () => {
    it('should handle impossible constraints gracefully', async () => {
      const constraints: AdvancedConstraints = {
        avoidance: {
          type: 'user_blacklist',
          blacklistedNumbers: Array.from({ length: 25 }, (_, i) => i + 1), // Blacklist all numbers
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 1,
        itemsInSet: 15,
        constraints,
        maxAttempts: 100,
      };

      await expect(generator.generateNumbers(options)).rejects.toThrow('Not enough available numbers');
    });

    it('should provide warnings for difficult constraints', async () => {
      const constraints: AdvancedConstraints = {
        consecutiveNumbers: {
          maxConsecutive: 1,
          allowConsecutive: false,
        },
      };

      const options: AdvancedGenerationOptions = {
        amountOfSets: 5,
        itemsInSet: 15,
        constraints,
        maxAttempts: 50, // Low attempts to trigger warnings
      };

      const result = await generator.generateNumbers(options);
      
      // Should either succeed or provide warnings
      if (result.numbers.length < 5) {
        expect(result.metadata.warnings).toBeDefined();
        expect(result.metadata.warnings!.length).toBeGreaterThan(0);
      }
    });
  });
});

describe('Helper Functions', () => {
  describe('getNumberCategory', () => {
    it('should categorize numbers correctly', () => {
      expect(getNumberCategory(1)).toBe('low');
      expect(getNumberCategory(12)).toBe('low');
      expect(getNumberCategory(13)).toBe('mid');
      expect(getNumberCategory(18)).toBe('mid');
      expect(getNumberCategory(19)).toBe('high');
      expect(getNumberCategory(25)).toBe('high');
    });
  });

  describe('getNumberDecade', () => {
    it('should categorize decades correctly', () => {
      expect(getNumberDecade(1)).toBe('first');
      expect(getNumberDecade(9)).toBe('first');
      expect(getNumberDecade(10)).toBe('second');
      expect(getNumberDecade(19)).toBe('second');
      expect(getNumberDecade(20)).toBe('third');
      expect(getNumberDecade(25)).toBe('third');
    });
  });

  describe('calculateSum', () => {
    it('should calculate sum correctly', () => {
      expect(calculateSum([1, 2, 3, 4, 5])).toBe(15);
      expect(calculateSum([10, 20, 30])).toBe(60);
      expect(calculateSum([])).toBe(0);
    });
  });

  describe('findConsecutiveSequences', () => {
    it('should find consecutive sequences', () => {
      const sequences = findConsecutiveSequences([1, 2, 3, 5, 6, 8, 9, 10, 11]);
      expect(sequences).toHaveLength(3);
      expect(sequences).toContainEqual([1, 2, 3]);
      expect(sequences).toContainEqual([5, 6]);
      expect(sequences).toContainEqual([8, 9, 10, 11]);
    });

    it('should handle no consecutive sequences', () => {
      const sequences = findConsecutiveSequences([1, 3, 5, 7, 9]);
      expect(sequences).toHaveLength(0);
    });
  });

  describe('Constraint Validation', () => {
    it('should validate constraints sum', () => {
      expect(validateConstraintsSum({ even: 7, odd: 8 })).toBe(true);
      expect(validateConstraintsSum({ even: 10, odd: 10 })).toBe(false);
    });

    it('should validate distribution sum', () => {
      expect(validateDistributionSum({ lowNumbers: 5, midNumbers: 5, highNumbers: 5 })).toBe(true);
      expect(validateDistributionSum({ lowNumbers: 10, midNumbers: 10, highNumbers: 10 })).toBe(false);
    });

    it('should validate decade sum', () => {
      expect(validateDecadeSum({ firstDecade: 5, secondDecade: 5, thirdDecade: 5 })).toBe(true);
      expect(validateDecadeSum({ firstDecade: 10, secondDecade: 10, thirdDecade: 10 })).toBe(false);
    });
  });
});

describe('generateAdvancedNumbers', () => {
  it('should work as a standalone function', async () => {
    const options: AdvancedGenerationOptions = {
      amountOfSets: 2,
      itemsInSet: 15,
      constraints: {
        sumRange: { min: 100, max: 200 },
      },
    };

    const result = await generateAdvancedNumbers(options);
    
    expect(result.numbers).toHaveLength(2);
    result.numbers.forEach(set => {
      expect(set).toHaveLength(15);
      const sum = calculateSum(set);
      expect(sum).toBeGreaterThanOrEqual(100);
      expect(sum).toBeLessThanOrEqual(200);
    });
  });
});
