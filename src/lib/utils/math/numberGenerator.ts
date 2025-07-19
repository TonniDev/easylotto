import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime, isSameList} from "@lib/utils/math/baseOperations";
import {
  AddNumbersToSetArgs,
  Constraints,
  GenerateRandomSetsOptions,
  GetEvenOrOddNumbersFromXToY, PossibleConstraints
} from "@lib/utils/math/types";

export function getEvenOrOddNumbersFromXToY({ range: [start, end] = [1, 25], type = 'even' }: GetEvenOrOddNumbersFromXToY): number[] {
  if (start > end) {
    throw new Error("Invalid range: 'start' must be less than or equal to 'end'");
  }

  const isEven = type === 'even';
  let current = isEven ? start + (start % 2) : start + 1 - (start % 2);

  const numbers: number[] = [];
  while (current <= end) {
    numbers.push(current);
    current += 2;
  }
  return numbers;
}

export function getFibonacciNumbersUpToX(X: number, includeZero: boolean = false): number[] {
  if (X < 0) return [];

  const fibonacciNumbers = [0, 1];

  if (X <= 1) return fibonacciNumbers;

  let nextFibonacci = fibonacciNumbers[fibonacciNumbers.length - 1] + fibonacciNumbers[fibonacciNumbers.length - 2];

  while (nextFibonacci <= X) {
    fibonacciNumbers.push(nextFibonacci);
    nextFibonacci = fibonacciNumbers[fibonacciNumbers.length - 1] + fibonacciNumbers[fibonacciNumbers.length - 2];
  }

  return Array.from(new Set(fibonacciNumbers.filter(num => num <= X))).filter(num => includeZero ? true : num !== 0);
}

export function getPrimeNumbersUpToX(X: number): number[] {
  if (X < 2) return [];

  const primes: boolean[] = Array(X + 1).fill(true);
  primes[0] = primes[1] = false;

  for (let i = 2; i * i <= X; i++) {
    if (primes[i]) {
      for (let j = i * i; j <= X; j += i) {
        primes[j] = false;
      }
    }
  }

  const primeNumbers: number[] = [];
  for (let k = 2; k <= X; k++) {
    if (primes[k]) {
      primeNumbers.push(k);
    }
  }

  return primeNumbers;
}

export function getMultiplesOf3UpToX(X: number) {
  const multiplesOf3: number[] = [];

  for (let i = 0; i <= X; i++) {
    if (i % 3 === 0 && i !== 0) {
      multiplesOf3.push(i);
    }
  }

  return multiplesOf3;
}

export function countNumbersByCondition(numbers: (number | string)[], condition: (num: number | string) => boolean) {
  return [...numbers].filter(condition).length;
}

export function addNumbersToList({
  currList,
  pool,
  maxAmount,
  prevNumTypeFilterFunc = () => true,
  currNumTypeFilterFunc = () => true,
}: AddNumbersToSetArgs): number[] {
  console.log('addNumbersToList - Starting with:', { 
    currListLength: currList.length, 
    poolLength: pool.length, 
    maxAmount 
  });

  let count = 0;
  const currSet = new Set(currList);

  const filteredPool = pool.filter(prevNumTypeFilterFunc);
  const constraint = maxAmount - countNumbersByCondition(currList, currNumTypeFilterFunc);

  console.log('addNumbersToList - After filtering:', { 
    filteredPoolLength: filteredPool.length, 
    constraint 
  });

  // Add a safety counter to prevent infinite loops
  let safetyCounter = 0;
  const MAX_SAFETY = 1000;

  while(count < constraint && filteredPool.length > 0 && safetyCounter < MAX_SAFETY) {
    safetyCounter++;

    // Use filteredPool instead of pool for random selection
    const randomIndex = Math.floor(Math.random() * filteredPool.length);
    const randomNumber = filteredPool[randomIndex];

    if (!currSet.has(randomNumber)) {
      currSet.add(randomNumber);
      filteredPool.splice(randomIndex, 1); // Remove from filteredPool instead of pool
      count++;

      if (safetyCounter % 100 === 0) {
        console.log(`addNumbersToList - Progress: ${count}/${constraint}, attempts: ${safetyCounter}`);
      }
    }
  }

  if (safetyCounter >= MAX_SAFETY) {
    console.warn(`addNumbersToList - Reached maximum safety counter (${MAX_SAFETY}) with ${count}/${constraint} numbers added`);
  }

  console.log('addNumbersToList - Finished with:', { 
    resultLength: currSet.size, 
    count, 
    attempts: safetyCounter 
  });

  return Array.from(currSet);
}

export function validateNumbersAgainstConstraints(numbers: number[], constraints: PossibleConstraints): boolean {
  console.log('validateNumbersAgainstConstraints - Starting with:', { 
    numbersLength: numbers.length, 
    constraints 
  });

  const counts = {
    even: 0,
    odd: 0,
    prime: 0,
    fibonacci: 0,
    multipleOf3: 0,
  };

  for (const num of numbers) {
    if (isEven(num)) counts.even++;
    if (isOdd(num)) counts.odd++;
    if (isPrime(num)) counts.prime++;
    if (isFibonacci(num)) counts.fibonacci++;
    if (isMultipleOf3(num)) counts.multipleOf3++;
  }

  console.log('validateNumbersAgainstConstraints - Counts:', counts);

  // Check each constraint
  for (const type in constraints) {
    const t = type as keyof Constraints;
    if (constraints[t] !== null && constraints[t] !== undefined) {
      if (counts[t] !== constraints[t]) {
        console.log(`validateNumbersAgainstConstraints - Failed: ${t} count ${counts[t]} !== constraint ${constraints[t]}`);
        return false;
      }
    }
  }

  console.log('validateNumbersAgainstConstraints - All constraints satisfied');
  return true;
}

interface FillRemainingNumbersArgs {
  numbers: number[],
  constraints: PossibleConstraints,
  rangeLimit: number,
  setLimit?: number,
}

function fillRemainingNumbers({
  numbers,
  constraints,
  rangeLimit,
  setLimit = 15,
}: FillRemainingNumbersArgs): number[] {
  console.log('fillRemainingNumbers - Starting with:', { 
    numbersLength: numbers.length, 
    setLimit, 
    rangeLimit 
  });

  const existingEven = Array.from(numbers).filter(isEven);
  const existingOdd = Array.from(numbers).filter(isOdd);

  console.log('fillRemainingNumbers - Current counts:', {
    existingEven: existingEven.length,
    existingOdd: existingOdd.length,
    targetEven: constraints.even,
    targetOdd: constraints.odd
  });

  // Create a set of existing numbers for faster lookups
  const existingNumbersSet = new Set(numbers);

  // Start with all possible numbers in range
  let remainingNumbers = Array.from({ length: rangeLimit }, (_, i) => i + 1)
    .filter(num => !existingNumbersSet.has(num)); // Remove numbers already in the set

  console.log('fillRemainingNumbers - Initial remaining numbers:', remainingNumbers.length);

  // Filter out numbers that would violate constraints
  if (constraints.prime) {
    remainingNumbers = remainingNumbers.filter(num => !isPrime(num));
  }
  if (constraints.fibonacci) {
    remainingNumbers = remainingNumbers.filter(num => !isFibonacci(num));
  }
  if (constraints.multipleOf3) {
    remainingNumbers = remainingNumbers.filter(num => !isMultipleOf3(num));
  }

  // If we've already met the even/odd constraints, filter accordingly
  if (constraints.even && existingEven.length >= constraints.even) {
    remainingNumbers = remainingNumbers.filter(num => !isEven(num));
  }

  if (constraints.odd && existingOdd.length >= constraints.odd) {
    remainingNumbers = remainingNumbers.filter(num => !isOdd(num));
  }

  console.log('fillRemainingNumbers - After constraint filtering:', remainingNumbers.length);

  // Create a copy of the numbers array to avoid modifying the original
  const resultNumbers = [...numbers];

  // Add a safety counter to prevent infinite loops
  let safetyCounter = 0;
  const MAX_SAFETY = 1000;

  while (resultNumbers.length < setLimit && safetyCounter < MAX_SAFETY) {
    safetyCounter++;

    if (safetyCounter % 100 === 0) {
      console.log(`fillRemainingNumbers - Progress: ${resultNumbers.length}/${setLimit}, attempts: ${safetyCounter}`);
    }

    if (remainingNumbers.length === 0) {
      console.warn('fillRemainingNumbers - No remaining numbers available that satisfy constraints');
      break;
    }

    // Recalculate even/odd counts on each iteration
    const currentEvenCount = resultNumbers.filter(isEven).length;
    const currentOddCount = resultNumbers.filter(isOdd).length;

    // Filter available numbers based on current even/odd counts
    let availableNumbers = [...remainingNumbers];

    if (constraints.even && currentEvenCount >= constraints.even) {
      availableNumbers = availableNumbers.filter(num => !isEven(num));
    }

    if (constraints.odd && currentOddCount >= constraints.odd) {
      availableNumbers = availableNumbers.filter(num => !isOdd(num));
    }

    if (availableNumbers.length === 0) {
      console.warn('fillRemainingNumbers - No available numbers that satisfy even/odd constraints');
      break;
    }

    // Select a random number from available numbers
    const randomIndex = Math.floor(Math.random() * availableNumbers.length);
    const randomNumber = availableNumbers[randomIndex];

    // Add the number to the result and remove it from remaining numbers
    resultNumbers.push(randomNumber);
    remainingNumbers = remainingNumbers.filter(num => num !== randomNumber);
  }

  if (safetyCounter >= MAX_SAFETY) {
    console.warn(`fillRemainingNumbers - Reached maximum safety counter (${MAX_SAFETY}) with ${resultNumbers.length}/${setLimit} numbers added`);
  }

  console.log('fillRemainingNumbers - Finished with:', { 
    resultLength: resultNumbers.length, 
    attempts: safetyCounter 
  });

  return resultNumbers;
}

export function createRandomSetWithoutConstraints({
  size,
  start,
  end
}: {
  size: number;
  start: number;
  end: number;
}): number[] {
  const resultSet = new Set<number>();
  while (resultSet.size < size) {
    const randomValue = Math.floor(Math.random() * (end - start + 1)) + start;
    resultSet.add(randomValue);
  }
  return Array.from(resultSet).sort((a, b) => a - b);
}


export function generateRandomSets({
  amountOfSets = 1,
  itemsInSet = 15,
  constraints,
  startEnd: [start, end] = [1, 25]
}: GenerateRandomSetsOptions): number[][] {
  console.log('Starting generateRandomSets with:', { amountOfSets, itemsInSet, constraints, start, end });

  // Limit the amount of sets to a reasonable number to prevent excessive processing
  const MAX_SETS = 100;
  if (amountOfSets > MAX_SETS) {
    console.warn(`Requested ${amountOfSets} sets, limiting to ${MAX_SETS} to prevent excessive processing`);
    amountOfSets = MAX_SETS;
  }

  // Generate the pools of special numbers once
  const fibonacci: number[] = getFibonacciNumbersUpToX(end);
  const primes: number[] = getPrimeNumbersUpToX(end);
  const multiplesOf3: number[] = getMultiplesOf3UpToX(end);
  const lists: number[][] = [];

  // Add a maximum number of attempts to prevent infinite loops
  const MAX_ATTEMPTS = 1000;
  const MAX_ATTEMPTS_PER_SET = 100; // Limit attempts per individual set
  let totalAttempts = 0;

  // Check if constraints are valid before starting
  if (constraints) {
    // Validate that the constraints don't exceed the set size
    const totalConstraints = (constraints.even || 0) + (constraints.odd || 0);
    if (totalConstraints > itemsInSet) {
      console.error(`Invalid constraints: sum of even (${constraints.even || 0}) and odd (${constraints.odd || 0}) exceeds set size (${itemsInSet})`);
      return [];
    }

    // Check if there are enough numbers of each type in the range
    if (constraints.prime && constraints.prime > primes.length) {
      console.error(`Not enough prime numbers in range: requested ${constraints.prime}, but only ${primes.length} available`);
      return [];
    }
    if (constraints.fibonacci && constraints.fibonacci > fibonacci.length) {
      console.error(`Not enough fibonacci numbers in range: requested ${constraints.fibonacci}, but only ${fibonacci.length} available`);
      return [];
    }
    if (constraints.multipleOf3 && constraints.multipleOf3 > multiplesOf3.length) {
      console.error(`Not enough multiples of 3 in range: requested ${constraints.multipleOf3}, but only ${multiplesOf3.length} available`);
      return [];
    }
  }

  while (lists.length < amountOfSets && totalAttempts < MAX_ATTEMPTS) {
    totalAttempts++;

    if (totalAttempts % 100 === 0) {
      console.log(`Total attempts: ${totalAttempts}, generated ${lists.length}/${amountOfSets} sets so far`);
    }

    if (!constraints || Object.keys(constraints).length === 0) {
      const randomSet = createRandomSetWithoutConstraints({
        size: itemsInSet,
        start,
        end
      });
      lists.push(randomSet);
      continue;
    }


    // Track attempts for this specific set
    let setAttempts = 0;

    // Try to generate a valid set with the given constraints
    while (setAttempts < MAX_ATTEMPTS_PER_SET) {
      setAttempts++;

      console.log(`Total attempt ${totalAttempts}, set attempt ${setAttempts}: Processing constraints:`, constraints);

      // Create a fresh list for each attempt
      let currList: number[] = [];

      // Create copies of the pools for this attempt
      const primesCopy = [...primes];
      const fibonacciCopy = [...fibonacci];
      const multiplesOf3Copy = [...multiplesOf3];

      // Add prime numbers if required
      if (constraints.prime) {
        console.log(`Set attempt ${setAttempts}: Adding ${constraints.prime} prime numbers`);
        currList = addNumbersToList({
          currList, 
          pool: primesCopy, 
          maxAmount: constraints.prime
        });
        console.log(`Set attempt ${setAttempts}: After adding primes, currList:`, currList);

        // If we couldn't add all required prime numbers, skip this attempt
        if (countNumbersByCondition(currList, isPrime) < constraints.prime) {
          console.log(`Set attempt ${setAttempts}: Failed to add all required prime numbers, skipping`);
          continue;
        }
      }

      // Add fibonacci numbers if required
      if (constraints.fibonacci) {
        console.log(`Set attempt ${setAttempts}: Adding ${constraints.fibonacci} fibonacci numbers`);
        currList = addNumbersToList({
          currList, 
          pool: fibonacciCopy,
          maxAmount: constraints.fibonacci,
          prevNumTypeFilterFunc: (num: number | string): boolean => !isPrime(num),
          currNumTypeFilterFunc: isFibonacci
        });
        console.log(`Set attempt ${setAttempts}: After adding fibonacci, currList:`, currList);

        // If we couldn't add all required fibonacci numbers, skip this attempt
        if (countNumbersByCondition(currList, isFibonacci) < constraints.fibonacci) {
          console.log(`Set attempt ${setAttempts}: Failed to add all required fibonacci numbers, skipping`);
          continue;
        }
      }

      // Add multiples of 3 if required
      if (constraints.multipleOf3) {
        console.log(`Set attempt ${setAttempts}: Adding ${constraints.multipleOf3} multiples of 3`);
        currList = addNumbersToList({
          currList,
          pool: multiplesOf3Copy,
          maxAmount: constraints.multipleOf3,
          prevNumTypeFilterFunc: (num: number | string): boolean => !isPrime(num) && !isFibonacci(num),
          currNumTypeFilterFunc: isMultipleOf3
        });
        console.log(`Set attempt ${setAttempts}: After adding multiples of 3, currList:`, currList);

        // If we couldn't add all required multiples of 3, skip this attempt
        if (countNumbersByCondition(currList, isMultipleOf3) < constraints.multipleOf3) {
          console.log(`Set attempt ${setAttempts}: Failed to add all required multiples of 3, skipping`);
          continue;
        }
      }

      // Fill remaining numbers
      console.log(`Set attempt ${setAttempts}: Filling remaining numbers`);
      currList = fillRemainingNumbers({
        numbers: currList,
        constraints,
        rangeLimit: end,
        setLimit: itemsInSet,
      });
      console.log(`Set attempt ${setAttempts}: After filling remaining numbers, currList:`, currList);

      // If we couldn't fill to the required size, skip this attempt
      if (currList.length < itemsInSet) {
        console.log(`Set attempt ${setAttempts}: Failed to fill to required size, skipping`);
        continue;
      }

      // Sort and validate the list
      const list = Array.from(currList).sort((a,b)=>a-b);
      const isDuplicate = lists.some((existingList) => isSameList(existingList.sort((a,b)=>a-b), list));
      const isCorrectLength = list.length === itemsInSet;
      const isValid = validateNumbersAgainstConstraints(list, constraints);

      console.log(`Set attempt ${setAttempts}: Validation - isDuplicate: ${isDuplicate}, isCorrectLength: ${isCorrectLength}, isValid: ${isValid}`);

      // If the list is valid, add it to the results and break out of the inner loop
      if (!isDuplicate && isCorrectLength && isValid) {
        console.log(`Set attempt ${setAttempts}: Adding list to results:`, list);
        lists.push(list);
        break;
      }

      // If we've reached the maximum attempts for this set, log a warning
      if (setAttempts >= MAX_ATTEMPTS_PER_SET) {
        console.warn(`Failed to generate a valid set after ${MAX_ATTEMPTS_PER_SET} attempts`);
      }
    }

    // If we've made too many total attempts, break out of the outer loop
    if (totalAttempts >= MAX_ATTEMPTS) {
      console.warn(`Reached maximum total attempts (${MAX_ATTEMPTS})`);
      break;
    }
  }

  // If we've reached the maximum number of attempts and haven't generated enough sets,
  // return what we have with a warning
  if (totalAttempts >= MAX_ATTEMPTS && lists.length < amountOfSets) {
    console.warn(`Could only generate ${lists.length} out of ${amountOfSets} requested sets after ${MAX_ATTEMPTS} total attempts. The constraints may be too restrictive.`);
  }

  console.log(`Finished generating ${lists.length} sets after ${totalAttempts} total attempts`);
  return lists;
}
