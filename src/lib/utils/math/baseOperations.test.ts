import {
  addNumbersToList,
  countNumbersByCondition,
  getFibonacciNumbersUpToX, getMultiplesOf3UpToX,
  getPrimeNumbersUpToX
} from "@lib/utils/math/numberGenerator";
import {isPrime, isFibonacci, isMultipleOf3, isOdd, isEven} from './baseOperations';
import {describe, it, expect} from "vitest";

const numbersFrom0To100 = Array.from({length: 101}, (_, i) => i);

describe("Math utils", () => {
  it('Returns true for prime numbers when checking with isPrime', () => {
    const primeNumbersListTo100: number[] = [
      2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97
    ];
    const nonPrimeNumbersListTo100: number[] = [
      0, 1, 4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 22, 24, 25, 26, 27, 28,
      30, 32, 33, 34, 35, 36, 38, 39, 40, 42, 44, 45, 46, 48, 49, 50, 51, 52, 54,
      55, 56, 57, 58, 60, 62, 63, 64, 65, 66, 68, 69, 70, 72, 74, 75, 76, 77, 78,
      80, 81, 82, 84, 85, 86, 87, 88, 90, 91, 92, 93, 94, 95, 96, 98, 99, 100
    ];
    const filteredPrimeNumbers = numbersFrom0To100.filter(isPrime);
    const allPrimes = primeNumbersListTo100.every(isPrime);
    const allNotPrimes = nonPrimeNumbersListTo100.every(number => !isPrime(number));

    expect(allPrimes).toBeTruthy();
    expect(allNotPrimes).toBeTruthy();
    expect(filteredPrimeNumbers).toHaveLength(primeNumbersListTo100.length)
  });
  
  it('Returns true for Fibonacci numbers when checking with isFibonacci', () => {
    const fibonacciSequenceFrom0To100: number[] = [
      0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89
    ];
    const nonFibonacciNumbersListTo100: number[] = Array.from({length: 101}, (_, i) => i)
      .filter(num => !fibonacciSequenceFrom0To100.includes(num));

    const allFibonacciNumbers = fibonacciSequenceFrom0To100.every(isFibonacci);
    const allNotFibonacciNumbers = nonFibonacciNumbersListTo100.every(number => !isFibonacci(number));
    const filteredFibonacciNumbers = numbersFrom0To100.filter(isFibonacci);

    expect(allFibonacciNumbers).toBeTruthy();
    expect(allNotFibonacciNumbers).toBeTruthy();
    expect(filteredFibonacciNumbers).toHaveLength(fibonacciSequenceFrom0To100.length - 1);
  });
  
  it('Returns true for multiples of 3 when checking with isMultipleOf3', () => {
    const multiplesOf3From0To100: number[] = [
      0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54,
      57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90, 93, 96, 99
    ];
    const multiplesOf3 = numbersFrom0To100.filter(isMultipleOf3);
    const nonMultiplesOf3 = numbersFrom0To100.filter(number => !isMultipleOf3(number));

    const allMultiplesOf3 = multiplesOf3From0To100.every(isMultipleOf3);
    const allNotMultiplesOf3 = nonMultiplesOf3.every(number => !isMultipleOf3(number));

    expect(allMultiplesOf3).toBeTruthy();
    expect(allNotMultiplesOf3).toBeTruthy();
    expect(multiplesOf3).toHaveLength(multiplesOf3From0To100.length);
  });

  it('Returns true for odd numbers when checking with isOdd', () => {
    const oddNumbersListTo100: number[] = [
      1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51, 53, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 77, 79, 81, 83, 85, 87, 89, 91, 93, 95, 97, 99
    ];
    const allOddNumbers = oddNumbersListTo100.every(isOdd);
    const allNotOddNumbers = numbersFrom0To100.filter(number => !isOdd(number)).every(number => !isOdd(number));
    const filteredOddNumbers = numbersFrom0To100.filter(isOdd);

    expect(allOddNumbers).toBeTruthy();
    expect(allNotOddNumbers).toBeTruthy();
    expect(filteredOddNumbers).toHaveLength(oddNumbersListTo100.length);
  });

  it('Returns true for even numbers when checking with isEven', () => {
    const evenNumbersListTo100: number[] = [
      0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100
    ];
    const allEvenNumbers = evenNumbersListTo100.every(isEven);
    const allNotEvenNumbers = numbersFrom0To100.filter(number => !isEven(number)).every(number => !isEven(number));
    const filteredEvenNumbers = numbersFrom0To100.filter(isEven);

    expect(allEvenNumbers).toBeTruthy();
    expect(allNotEvenNumbers).toBeTruthy();
    expect(filteredEvenNumbers).toHaveLength(evenNumbersListTo100.length);
  });

  it('Returns the amount of numbers from a list with a given condition', () => {
    const numbersList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const primeCount = countNumbersByCondition(numbersList, isPrime);

    expect(primeCount).toBe(4);
  });

  it("Returns a list with the missing numbers by condition", () => {
    const primesPool = getPrimeNumbersUpToX(15);
    let list: number[] = [];

    list = addNumbersToList({
      currList: list,
      pool: primesPool,
      maxAmount: 3,
    });

    expect(list.every(isPrime)).toBeTruthy();

    const fibonacciPool = getFibonacciNumbersUpToX(15);
    list = addNumbersToList({
      currList: list,
      pool: fibonacciPool,
      maxAmount: 3,
      prevNumTypeFilterFunc: (num: number) => !isPrime(num),
      currNumTypeFilterFunc: isFibonacci,
    });

    const primeQuantity = countNumbersByCondition(list, isPrime);
    const fibonacciQuantity = countNumbersByCondition(list, isFibonacci);

    console.log({
      fibo: getFibonacciNumbersUpToX(25).length,
      prime: getPrimeNumbersUpToX(25).length,
      multi: getMultiplesOf3UpToX(25).length,
      odd: Array.from({length: 25}, (_, i) => i).filter(isOdd).length,
      even: Array.from({length: 25}, (_, i) => i).filter(isEven).length
  });

    expect(primeQuantity).toBe(3);
    expect(fibonacciQuantity).toBe(3);
    expect(list.length).toSatisfy((length: number) => length <= 5 && length >= 3);
  });
});
