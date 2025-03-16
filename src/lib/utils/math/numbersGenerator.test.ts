import {
  generateRandomSets,
  getFibonacciNumbersUpToX,
  getMultiplesOf3UpToX,
  getPrimeNumbersUpToX,
  validateNumbersAgainstConstraints
} from "@lib/utils/math/numberGenerator";
import {describe, it, expect} from "vitest";

describe("Numbers generator", () => {
  describe("Generates numbers correctly", () => {
    it("Generates Fibonacci numbers correctly up to X", () => {
      const fibonacciNumbersWithoutZeroTo10 = getFibonacciNumbersUpToX(10);
      const fibonacciNumbersWithZeroTo10 = getFibonacciNumbersUpToX(10, true);

      const fibonacciNumbersWithout0To50 = getFibonacciNumbersUpToX(50);

      expect(fibonacciNumbersWithoutZeroTo10).toStrictEqual([1, 2, 3, 5, 8]);
      expect(fibonacciNumbersWithZeroTo10).toStrictEqual([0, 1, 2, 3, 5, 8]);
      expect(fibonacciNumbersWithout0To50).toStrictEqual([1, 2, 3, 5, 8, 13, 21, 34]);
    });

    it("Generates Prime numbers correctly up to X", () => {

      const primeNumbersTo10 = getPrimeNumbersUpToX(10);

      const primeNumbersTo50 = getPrimeNumbersUpToX(50);

      expect(primeNumbersTo10).toStrictEqual([2, 3, 5, 7]);
      expect(primeNumbersTo50).toStrictEqual([2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47]);
    });

    it("Generates numbers Multiple of 3 correctly up to X", () => {
      const multiplesOf3 = getMultiplesOf3UpToX(10);
      const multiplesOf3To50 = getMultiplesOf3UpToX(50);

      expect(multiplesOf3).toStrictEqual([3, 6, 9]);
      expect(multiplesOf3To50).toStrictEqual([3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48]);
    });

    it("Generates numbers based on constraints", () => {
      const constraints = {
        fibonacci: 2,
        prime: 4,
        even: 6,
      };
      const sets = generateRandomSets({amountOfSets: 2, constraints});

      const setsResults = sets.map(set => validateNumbersAgainstConstraints(set, constraints));
      expect(setsResults.every(validResult => validResult)).toBeTruthy();
    });

    it("Generates numbers even without constraints", () => {
      const constraints = {};
      const sets = generateRandomSets({amountOfSets: 20, constraints});

      const setsResults = sets.map(set => validateNumbersAgainstConstraints(set, constraints));
      expect(setsResults.every(validResult => validResult)).toBeTruthy();
    });
  });

  describe("Validates numbers against constraints", () => {
    it("Returns false if at least on number is different from constraint", () => {
      const constraints = {
        even: 2,
        odd: 3,
        fibonacci: 2,
      };
      const numbers = [2, 3, 4, 5, 9];
      const invalid = validateNumbersAgainstConstraints(numbers, constraints);
      expect(invalid).toBeFalsy();
    });

    it("Returns true if all numbers matches constraints", () => {
      const constraints = {
        even: 2,
        odd: 3,
        fibonacci: 2,
      };
      const numbers1 = [2, 3, 4, 7, 11];
      const numbers2 = [2, 3, 4, 5, 9];
      const valid = validateNumbersAgainstConstraints(numbers1, constraints);
      const invalid = validateNumbersAgainstConstraints(numbers2, constraints);
      expect(valid).toBeTruthy();
      expect(invalid).toBeFalsy();
    });
  });
});
