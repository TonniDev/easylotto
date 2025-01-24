function convertToNumber(item: number | string): number {
  let num = typeof item === 'string' ? Number(item) : item;
  if (Number.isNaN(num)) throw new Error(`Invalid number: received ${item}`);
  return num;
}
export function isPrime(item: number | string): boolean {
  let num = convertToNumber(item);
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

export function isFibonacci(item: number | string): boolean {
  let num = convertToNumber(item);
  if (num <= 1) return num === 0 || num === 1;
  let a = 0,
    b = 1;
  while (b < num) {
    [a, b] = [b, a + b];
  }
  return b === num;
}

export function isOdd(item: number | string): boolean {
  let num = convertToNumber(item);
  return num % 2 !== 0;
}

export function isEven(item: number | string): boolean {
  let num = convertToNumber(item);
  return num % 2 === 0;
}

export function isMultipleOf3(item: number | string): boolean {
  let num = convertToNumber(item);
  return num % 3 === 0;
}
