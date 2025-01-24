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

interface IAddNumbersToSet {
  currList: number[];
  pool: number[];
  maxAmount: number;
  prevNumTypeFilterFunc?: (num: number | string) => boolean;
  currNumTypeFilterFunc?: (num: number | string) => boolean;
}

export function addNumbersToList({
  currList,
  pool,
  maxAmount,
  prevNumTypeFilterFunc = () => true,
  currNumTypeFilterFunc = () => true,
}: IAddNumbersToSet): number[] {
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
