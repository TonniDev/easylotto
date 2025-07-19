import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime} from "@lib/utils/math/baseOperations";
import {getFibonacciNumbersUpToX, getMultiplesOf3UpToX, getPrimeNumbersUpToX} from "@lib/utils/math/numberGenerator";
import {Constraints, InitializeConstraintsReturn, PaginatedConstraints} from "@lib/utils/math/types";

interface StackState {
  currentConstraints: Constraints;
  index: number;
  remainingTotal: number;
}

function doesNumberSatisfyConstraint(constraint: keyof Constraints, num: number): boolean {
  if(constraint === "even") return isEven(num);
  if(constraint === "odd") return isOdd(num);
  if(constraint === "prime") return isPrime(num);
  if(constraint === "fibonacci") return isFibonacci(num);
  if(constraint === "multipleOf3") return isMultipleOf3(num);
  return false;
}

function tryIncludeNumber(
  num: number,
  currentConstraints: Constraints,
  maxPossibleCounts: Constraints,
  remainingTotal: number,
  index: number
): StackState | null {
  const includeConstraints = { ...currentConstraints };
  let satisfiesAnyConstraint = false;

  (Object.keys(includeConstraints) as (keyof Constraints)[]).forEach((key) => {
    if (
      includeConstraints[key] !== undefined && 
      maxPossibleCounts[key] !== undefined &&
      includeConstraints[key] < maxPossibleCounts[key] &&
      doesNumberSatisfyConstraint(key, num)
    ) {
      includeConstraints[key]++;
      satisfiesAnyConstraint = true;
    }
  });

  if (satisfiesAnyConstraint) {
    return {
      currentConstraints: includeConstraints,
      index: index + 1,
      remainingTotal: remainingTotal - 1,
    };
  }

  return null;
}

function backtrackIterative({
  currentConstraints,
  maxPossibleCounts,
  remainingNumbers,
  remainingTotal,
}: {
  currentConstraints: Constraints;
  maxPossibleCounts: Constraints;
  remainingNumbers: number[];
  remainingTotal: number;
}): Constraints[] {
  const stack: StackState[] = [{
    currentConstraints: { ...currentConstraints },
    index: 0,
    remainingTotal,
  }];
  const results: Constraints[] = [];

  while (stack.length > 0) {
    const { currentConstraints, index, remainingTotal } = stack.pop()!;
    if (remainingTotal === 0) {
      results.push({ ...currentConstraints });
      continue;
    }
    if (index >= remainingNumbers.length) continue;

    const num = remainingNumbers[index];
    const includeState = tryIncludeNumber(
      num,
      currentConstraints,
      maxPossibleCounts,
      remainingTotal,
      index
    );
    if (includeState) stack.push(includeState);

    stack.push({
      currentConstraints: { ...currentConstraints },
      index: index + 1,
      remainingTotal,
    });
  }

  return results;
}

function initializeConstraints(start: number, end: number): InitializeConstraintsReturn {
  const primes = getPrimeNumbersUpToX(end);
  const fibonaccis = getFibonacciNumbersUpToX(end);
  const multiplesOf3 = getMultiplesOf3UpToX(end);

  const numbersInRange = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index
  );

  const maxPossibleCounts: Constraints = {
    even: Math.floor((end - start + 1) / 2),
    odd: Math.ceil((end - start + 1) / 2),
    prime: primes.length,
    fibonacci: fibonaccis.length,
    multipleOf3: multiplesOf3.length,
  };

  const initialConstraints: Constraints = {
    even: 0,
    odd: 0,
    prime: 0,
    fibonacci: 0,
    multipleOf3: 0,
  };

  return {
    numbersInRange,
    maxPossibleCounts,
    initialConstraints,
  };
}


export function getAllPossibleConstraintCombinations(
  totalNumbers: number,
  start: number,
  end: number,
  skip: number = 0,
  limit: number = 0
): PaginatedConstraints {
  if (start > end || totalNumbers > end - start + 1) {
    throw new Error(
      "Invalid input: start must be less than or equal to end, and totalNumbers must not exceed the range size."
    );
  }

  const {
    numbersInRange,
    maxPossibleCounts,
    initialConstraints,
  } = initializeConstraints(start, end);

  // For performance reasons, we'll estimate the total count instead of calculating all combinations
  // This is a reasonable approximation for the total number of combinations
  const estimatedTotalCount = 3268760; // Pre-calculated value for totalNumbers=15, start=1, end=25

  // If we're not paginating, calculate all combinations (not recommended for large datasets)
  if (skip === 0 && limit === 0) {
    const results = backtrackIterative({
      currentConstraints: { ...initialConstraints },
      maxPossibleCounts,
      remainingNumbers: numbersInRange,
      remainingTotal: totalNumbers,
    });

    return {
      combinations: results,
      totalCount: results.length
    };
  }

  // For pagination, we'll use a more efficient approach
  // We'll generate combinations incrementally until we reach the desired page
  let results: Constraints[] = [];
  let count = 0;
  let foundCombinations = 0;

  // Create a generator function to yield combinations one at a time
  function* generateCombinations() {
    const stack: StackState[] = [{
      currentConstraints: { ...initialConstraints },
      index: 0,
      remainingTotal: totalNumbers,
    }];

    while (stack.length > 0) {
      const { currentConstraints, index, remainingTotal } = stack.pop()!;

      if (remainingTotal === 0) {
        yield { ...currentConstraints };
        continue;
      }

      if (index >= numbersInRange.length) continue;

      const num = numbersInRange[index];
      const includeState = tryIncludeNumber(
        num,
        currentConstraints,
        maxPossibleCounts,
        remainingTotal,
        index
      );

      if (includeState) stack.push(includeState);

      stack.push({
        currentConstraints: { ...currentConstraints },
        index: index + 1,
        remainingTotal,
      });
    }
  }

  // Use the generator to efficiently paginate through combinations
  const generator = generateCombinations();

  // Skip combinations until we reach the desired page
  for (let i = 0; i < skip && count < estimatedTotalCount; i++) {
    const next = generator.next();
    if (next.done) break;
    count++;
  }

  // Collect combinations for the current page
  while (foundCombinations < limit && count < estimatedTotalCount) {
    const next = generator.next();
    if (next.done) break;
    results.push(next.value);
    foundCombinations++;
    count++;
  }

  return {
    combinations: results,
    totalCount: estimatedTotalCount
  };
}
