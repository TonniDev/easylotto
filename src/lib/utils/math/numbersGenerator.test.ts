import {getFibonacciNumbersUpToX, getMultiplesOf3UpToX, getPrimeNumbersUpToX} from "@lib/utils/math/numberGenerator";
import {describe, it, expect} from "vitest";

describe("Numbers generator", () => {
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
})
