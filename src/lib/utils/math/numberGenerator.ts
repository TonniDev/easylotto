import {isEven, isFibonacci, isMultipleOf3, isOdd, isPrime, isSameList} from "@lib/utils/math/baseOperations";
import {
  AddNumbersToSetArgs,
  Constraints,
  GenerateRandomSetsOptions,
  GetEvenOrOddNumbersFromXToY, PossibleConstraints
} from "@lib/utils/math/types";

function getEvenOrOddNumbersFromXToY({ range: [start, end] = [1, 25], type = 'even' }: GetEvenOrOddNumbersFromXToY): number[] {
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
  let count = 0;
  const currSet = new Set(currList);

  const filteredPool = pool.filter(prevNumTypeFilterFunc);
  const constraint = maxAmount - countNumbersByCondition(currList, currNumTypeFilterFunc);

  while(count < constraint && filteredPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const randomNumber = pool[randomIndex];

    if (!currSet.has(randomNumber) && (!prevNumTypeFilterFunc || prevNumTypeFilterFunc(randomNumber))) {
      currSet.add(randomNumber);
      pool.splice(randomIndex, 1);
      count++;
    }
  }

  return Array.from(currSet);
}

export function validateNumbersAgainstConstraints(numbers: number[], constraints: PossibleConstraints): boolean {
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

  for (const type in constraints) {
    const t = type as keyof Constraints;
    if (constraints[t] && counts[t] !== constraints[t]) {
      return false;
    }
  }

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
  let amountOfNumbers = numbers.length;

  const evenNumbers = getEvenOrOddNumbersFromXToY({range: [1, rangeLimit], type: "even"});
  const existingEven = Array.from(numbers).filter(isEven);
  const oddNumbers = getEvenOrOddNumbersFromXToY({range: [1, rangeLimit], type: "odd"});
  const existingOdd = Array.from(numbers).filter(isOdd);

  let remainingNumbers = [...evenNumbers, ...oddNumbers];

  if (constraints.prime) {
    remainingNumbers = remainingNumbers.filter(num => !isPrime(num));
  }
  if (constraints.fibonacci) {
    remainingNumbers = remainingNumbers.filter(num => !isFibonacci(num));
  }
  if (constraints.multipleOf3) {
    remainingNumbers = remainingNumbers.filter(num => !isMultipleOf3(num));
  }

  if (constraints.even && existingEven.length === constraints.even) {
    remainingNumbers = remainingNumbers.filter(num => !isEven(num));
  }

  if (constraints.odd && existingOdd.length === constraints.odd) {
    remainingNumbers = remainingNumbers.filter(num => !isOdd(num));
  }

  let availableNumbers: number[] = [];
  remainingNumbers.forEach(num => {
    if (!existingEven.includes(num)) availableNumbers.push(num);
    if (!existingOdd.includes(num)) availableNumbers.push(num);
  });

  let amountToBeAdded = setLimit - numbers.length;

  while (numbers.length < setLimit) {
    if (amountOfNumbers > numbers.length) break;


    if (amountToBeAdded > 0 && availableNumbers.length > 0) {
      if (constraints.even && numbers.filter(isEven).length === constraints.even) {
        availableNumbers = availableNumbers.filter(num => !isEven(num));
      }
      if (constraints.odd && numbers.filter(isOdd).length === constraints.odd) {
        availableNumbers = availableNumbers.filter(num => !isOdd(num));
      }
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const randomNumberFromAvailableNumbers = availableNumbers[randomIndex];
      availableNumbers.splice(randomIndex, 1);
      numbers.push(randomNumberFromAvailableNumbers);
      amountToBeAdded--
    }
    amountOfNumbers++
  }

  return numbers;
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
  const fibonacci: number[] = getFibonacciNumbersUpToX(end);
  const primes: number[] = getPrimeNumbersUpToX(end);
  const multiplesOf3: number[] = getMultiplesOf3UpToX(end);
  const lists: number[][] = [];

  const isConstraintsEmpty =
    Object.keys(constraints).length === 0;


  while (lists.length < amountOfSets) {

    if (isConstraintsEmpty) {
      const randomSet = createRandomSetWithoutConstraints({
        size: itemsInSet,
        start,
        end
      });
      lists.push(randomSet);
      continue; // proceed to next set
    }


    let currList: number[] = [];

    if (constraints.prime) {
      currList = addNumbersToList({currList, pool: primes, maxAmount: constraints.prime});
    }

    if (constraints.fibonacci) {
      currList = addNumbersToList({
        currList, pool:
        fibonacci,
        maxAmount: constraints.fibonacci,
        prevNumTypeFilterFunc: (num: number | string): boolean => !isPrime(num),
        currNumTypeFilterFunc: isFibonacci
      });
    }

    if (constraints.multipleOf3) {
      currList = addNumbersToList({
        currList,
        pool: multiplesOf3,
        maxAmount: constraints.multipleOf3,
        prevNumTypeFilterFunc: (num: number | string): boolean => !isPrime(num) && !isFibonacci(num),
        currNumTypeFilterFunc: isMultipleOf3
      });
    }

    currList = fillRemainingNumbers({
      numbers: currList,
      constraints,
      rangeLimit: end,
      setLimit: itemsInSet,
    });

    const list = Array.from(currList).sort((a,b)=>a-b);
    if (
      !lists.some((existingList) => isSameList(existingList.sort((a,b)=>a-b), list))
      && list.length === itemsInSet
      && validateNumbersAgainstConstraints(list, constraints)
    ) {
      lists.push(list);
    }
  }

  return lists;
}
